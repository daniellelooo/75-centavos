// La terminal: misión a la izquierda, editor real de JavaScript a la derecha.
import { EditorView, basicSetup } from "codemirror";
import { keymap, Decoration, type DecorationSet } from "@codemirror/view";
import { StateEffect, StateField, Prec } from "@codemirror/state";
import { acceptCompletion, completionStatus } from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { javascript, javascriptLanguage } from "@codemirror/lang-javascript";
import { MISSIONS } from "../game/missions";
import { vocabFor } from "../game/vocab";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import type { Mission } from "../game/missions";
import { runMission } from "../game/runner";
import { translateError, TIMEOUT_ERROR } from "../game/errors";
import { save, writeSave } from "../game/state";
import { sfx } from "../audio/sfx";
import { el, esc, ui, wait } from "./dom";

const amber = HighlightStyle.define([
  { tag: t.keyword, color: "#fff4c9", fontWeight: "normal" },
  { tag: [t.number, t.bool, t.null], color: "#8fd3ff" },
  { tag: [t.string, t.special(t.string)], color: "#9be3a8" },
  { tag: t.comment, color: "#8a4a1a" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#ffd27a" },
  { tag: t.operator, color: "#ff9a4a" },
  { tag: [t.variableName, t.propertyName], color: "#fed018" },
  { tag: t.punctuation, color: "#d38a3a" },
]);

const setErrorLine = StateEffect.define<number | null>();
const errorLineField = StateField.define<DecorationSet>({
  create: () => Decoration.none,
  update(deco, tr) {
    for (const e of tr.effects) {
      if (e.is(setErrorLine)) {
        if (e.value == null || e.value > tr.state.doc.lines) return Decoration.none;
        const line = tr.state.doc.line(e.value);
        return Decoration.set([Decoration.line({ class: "cm-errorLine" }).range(line.from)]);
      }
    }
    return tr.docChanged ? Decoration.none : deco;
  },
  provide: (f) => EditorView.decorations.from(f),
});

/** Abre la terminal. Resuelve true si el jugador resolvió la misión. */
/** Abre la terminal. Resuelve true si se resolvió. En modo repaso no toca el progreso. */
export function openTerminal(mission: Mission, opts: { practice?: boolean } = {}): Promise<boolean> {
  const practice = !!opts.practice;
  const draftKey = practice ? `p:${mission.id}` : mission.id;
  let practiceHints = 0;
  return new Promise((resolve) => {
    sfx("open");
    const root = el("div", "term");
    const left = el("div", "col");
    const right = el("div", "col");
    root.append(left, right);

    const hintsShown = practice ? 0 : (save.hintsUsed[mission.id] ?? 0);
    left.innerHTML = `
      <div class="head"><span class="t-title">${esc(mission.title)}</span><span class="tag">${practice ? "REPASO · " : ""}${esc(mission.concept.toUpperCase())}</span></div>
      <div class="scroll">
        <h3>${esc(mission.lesson.title)}</h3>
        <p>${esc(mission.lesson.body)}</p>
        <pre class="example">${esc(mission.lesson.example)}</pre>
        <h3>Encargo</h3>
        <div class="task">${esc(mission.task)}</div>
        ${
          mission.borrowed.length
            ? `<p class="borrowed" style="margin-top:calc(4*var(--u))">Ya cargado en la máquina: ${mission.borrowed
                .map((b) => `<code>${esc(b)}</code>`)
                .join(", ")}</p>`
            : ""
        }
        <div class="hints"></div>
      </div>
      <div class="actions"><button class="btn hint-btn">PISTA</button><button class="btn close-btn">SALIR [ESC]</button></div>
    `;

    right.innerHTML = `
      <div class="head"><span>SAM@LBL-VAX:~$ editor</span><span class="tag">JAVASCRIPT</span></div>
      <div class="editor-wrap"></div>
      <div class="actions"><button class="btn primary run-btn">EJECUTAR</button><span class="shortcut">Tab autocompleta · Ctrl + Enter ejecuta</span></div>
      <div class="console"><span class="muted">Escribe tu código y pulsa EJECUTAR.</span></div>
    `;
    ui.append(root);

    const hintsBox = left.querySelector(".hints") as HTMLDivElement;
    const hintBtn = left.querySelector(".hint-btn") as HTMLButtonElement;
    const runBtn = right.querySelector(".run-btn") as HTMLButtonElement;
    const consoleBox = right.querySelector(".console") as HTMLDivElement;
    const wrap = right.querySelector(".editor-wrap") as HTMLDivElement;

    const renderHints = (n: number) => {
      hintsBox.innerHTML = mission.hints
        .slice(0, n)
        .map((h, i) => `<h3>Pista ${i + 1}${i === mission.hints.length - 1 ? " (solución)" : ""}</h3><div class="hint">${esc(h)}</div>`)
        .join("");
      hintBtn.disabled = n >= mission.hints.length;
      hintBtn.textContent = n >= mission.hints.length ? "SIN MAS PISTAS" : n === mission.hints.length - 1 ? "VER SOLUCION" : "PISTA";
    };
    renderHints(hintsShown);
    hintBtn.addEventListener("click", () => {
      if (practice) {
        practiceHints = Math.min(practiceHints + 1, mission.hints.length);
        renderHints(practiceHints);
        sfx("select");
        return;
      }
      const n = (save.hintsUsed[mission.id] ?? 0) + 1;
      save.hintsUsed[mission.id] = Math.min(n, mission.hints.length);
      writeSave(save);
      renderHints(save.hintsUsed[mission.id]);
      sfx("select");
      const s = left.querySelector(".scroll") as HTMLElement;
      s.scrollTop = s.scrollHeight;
    });

    let running = false;
    const view = new EditorView({
      doc: save.drafts[draftKey] ?? mission.starter,
      parent: wrap,
      extensions: [
        basicSetup,
        javascript(),
        javascriptLanguage.data.of({ autocomplete: vocabFor(MISSIONS.indexOf(mission)) }),
        Prec.highest(keymap.of([{ key: "Tab", run: acceptCompletion }])),
        keymap.of([indentWithTab]),
        syntaxHighlighting(amber),
        errorLineField,
        keymap.of([{ key: "Mod-Enter", run: () => (void run(), true) }]),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) {
            save.drafts[draftKey] = u.state.doc.toString();
            writeSave(save);
            if (Math.random() < 0.6) sfx("key");
          }
        }),
      ],
    });
    // Se enfoca un instante después: así la tecla E que abrió la terminal no se escribe en el editor.
    setTimeout(() => {
      view.focus();
      view.dispatch({ selection: { anchor: view.state.doc.length } });
    }, 120);

    const print = (html: string) => {
      consoleBox.insertAdjacentHTML("beforeend", html);
      consoleBox.scrollTop = consoleBox.scrollHeight;
    };

    async function run() {
      if (running) return;
      running = true;
      runBtn.disabled = true;
      sfx("run");
      if (!practice) save.attempts[mission.id] = (save.attempts[mission.id] ?? 0) + 1;
      writeSave(save);
      view.dispatch({ effects: setErrorLine.of(null) });
      consoleBox.innerHTML = `<div class="muted">ejecutando...</div>`;
      const code = view.state.doc.toString();
      const result = await runMission(mission.id, code);
      await wait(250);
      consoleBox.innerHTML = "";

      if (result.kind === "timeout") {
        print(`<div class="err">${esc(TIMEOUT_ERROR.title)}</div><div class="muted">${esc(TIMEOUT_ERROR.hint)}</div>`);
        fail();
        return;
      }

      const outs = result.outs;
      const crashed = outs.find((o) => !o.ok);
      // Mostrar la salida del primer caso, como lo vería el jugador.
      const first = outs[0];
      for (const l of first.logs.slice(0, 40)) print(`<div class="log">${esc(l)}</div>`);
      if (crashed?.error) {
        const fe = translateError(crashed.error.name, crashed.error.message);
        const where = crashed.error.line ? ` (línea ${crashed.error.line})` : "";
        print(`<div class="err">ERROR${where}: ${esc(fe.title)}</div><div>${esc(fe.hint)}</div><div class="muted">${esc(fe.raw)}</div>`);
        if (crashed.error.line) view.dispatch({ effects: setErrorLine.of(crashed.error.line) });
        fail();
        return;
      }

      const verdict = mission.check(outs, mission.cases);
      if (mission.cases.length > 1) {
        print(`<div class="muted">probado con ${mission.cases.length} casos: ${mission.cases.map((c) => esc(c.label)).join(", ")}</div>`);
      }
      if (!verdict.pass) {
        print(`<div class="err">NO CUADRA</div><div>${esc(verdict.feedback)}</div>`);
        fail();
        return;
      }

      // Éxito: sello, conteo y sonido escalonado.
      for (let i = 0; i < mission.cases.length; i++) {
        await wait(160);
        sfx("tick");
        print(`<div class="ok">[OK] ${esc(mission.cases[i].label)}</div>`);
      }
      await wait(200);
      print(`<div class="ok">${esc(verdict.feedback)}</div>`);
      sfx("success");
      if (practice) {
        const prev = save.review[mission.id];
        save.review[mission.id] = { ok: (prev?.ok ?? 0) + 1, last: Date.now() };
        writeSave(save);
      }
      const stamp = el("div", "stamp", practice ? "REPASADO" : "ACEPTADO");
      root.append(stamp);
      runBtn.textContent = "CONTINUAR";
      runBtn.disabled = false;
      runBtn.onclick = () => close(true);
      runBtn.focus();
      running = false;
      solved = true;
    }

    function fail() {
      sfx("fail");
      wrap.classList.remove("shake");
      void wrap.offsetWidth;
      wrap.classList.add("shake");
      runBtn.disabled = false;
      running = false;
    }

    let solved = false;
    runBtn.onclick = () => void run();

    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") {
        // Con el menú de sugerencias abierto, Escape solo cierra el menú.
        if (completionStatus(view.state) !== null) return;
        e.preventDefault();
        e.stopPropagation(); // que el Escape no abra además el menú de pausa
        close(solved);
      }
    };
    window.addEventListener("keydown", onKey, true);
    (left.querySelector(".close-btn") as HTMLButtonElement).onclick = () => close(solved);

    function close(ok: boolean) {
      window.removeEventListener("keydown", onKey, true);
      view.destroy();
      root.remove();
      sfx("close");
      resolve(ok);
    }
  });
}
