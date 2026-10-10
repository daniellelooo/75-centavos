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
import { translateError, typoHint, nameHint, missingNameHint, TIMEOUT_ERROR } from "../game/errors";
import { caseReports, hardcodeHint } from "../game/report";
import { locateSyntax } from "../game/syntax";
import { setOfExercise } from "../game/training";
import { MENTORS } from "../game/mentors";
import { borrowedFor } from "../game/borrowed";
import { save, writeSave } from "../game/state";
import { sfx } from "../audio/sfx";
import { el, esc, ui, wait } from "./dom";
import { exampleHtml, bindPeeks, taskHtml } from "./example";

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
/** Lo que ya está cargado en la máquina. Si solo se sabe el nombre, se enseña un
 *  ejemplo real del valor para que se vea la forma de los datos. */
function borrowedHtml(mission: Mission): string {
  const { described, shown } = borrowedFor(mission);
  if (!described.length && !shown.length) return "";
  const desc = described.length ? `<p class="borrowed">Ya cargado en la máquina: ${described.map((b) => `<code>${esc(b)}</code>`).join(", ")}</p>` : "";
  const ej = shown.length
    ? `<p class="borrowed">${described.length ? "Y también" : "Ya cargado en la máquina"}, por ejemplo (en cada prueba cambian los datos, no la forma):</p><pre class="borrowed-val">${esc(shown.join("\n"))}</pre>`
    : "";
  return desc + ej;
}

export function openTerminal(mission: Mission, opts: { practice?: boolean; training?: { vocabAt: number } } = {}): Promise<boolean> {
  const training = opts.training;
  // los ejercicios de los mentores se comportan como un repaso: no tocan la historia
  const practice = !!opts.practice || !!training;
  const free = mission.id === "libre";
  const draftKey = training ? `t:${mission.id}` : practice ? `p:${mission.id}` : mission.id;
  let practiceHints = 0;
  return new Promise((resolve) => {
    sfx("open");
    const root = el("div", "term");
    const left = el("div", "col");
    const right = el("div", "col");
    root.append(left, right);

    const ex = exampleHtml(mission.lesson.example);
    bindPeeks(left);
    const hintsShown = practice ? 0 : (save.hintsUsed[mission.id] ?? 0);
    left.innerHTML = `
      <div class="head"><span class="t-title">${esc(mission.title)}</span><span class="tag">${free ? "" : training ? `${placeTag(mission.id)} · ` : practice ? "REPASO · " : ""}${esc(mission.concept.toUpperCase())}</span></div>
      <div class="scroll">
        <h3>${esc(mission.lesson.title)}</h3>
        <p>${taskHtml(mission.lesson.body)}</p>
        <pre class="example">${ex.html}</pre>
        ${ex.peeks ? `<p class="peek-tip">Antes de pulsar <b>¿?</b>, piensa qué imprimirá.</p>` : ""}
        <div class="hints"></div>
      </div>
      <div class="task-pin">
        <h3>Encargo</h3>
        <div class="task">${taskHtml(mission.task)}</div>
        ${borrowedHtml(mission)}
      </div>
      <div class="actions"><button class="btn hint-btn">PISTA</button><button class="btn close-btn">SALIR [ESC]</button></div>
    `;

    right.innerHTML = `
      <div class="head"><span>SAM@LBL-VAX:~$ editor</span><span class="tag">JAVASCRIPT</span></div>
      <div class="keybar" title="Teclas difíciles de escribir en algunos teclados">
        <span>INSERTAR</span>
        <button data-k="\`">\`</button><button data-k="\${}">\${ }</button><button data-k="{}">{ }</button><button data-k="[]">[ ]</button><button data-k="=>">=&gt;</button><button data-k=";">;</button>
        <span class="kb-tip">Ctrl + ' escribe \`</span>
      </div>
      <div class="editor-wrap"></div>
      <div class="actions"><button class="btn primary run-btn">EJECUTAR</button><span class="shortcut">Tab autocompleta · Ctrl + Enter ejecuta</span></div>
      <div class="console"><span class="muted">Escribe tu código y pulsa EJECUTAR.</span></div>
    `;
    ui.append(root);

    const hintsBox = left.querySelector(".hints") as HTMLDivElement;
    const hintBtn = left.querySelector(".hint-btn") as HTMLButtonElement;
    if (free) hintBtn.style.display = "none";
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
      // la pista nueva queda a la vista, al final de la lección
      if (n) hintsBox.lastElementChild?.scrollIntoView({ block: "nearest" });
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
        // las líneas largas siguen debajo en vez de empujar la terminal hacia un lado
        EditorView.lineWrapping,
        javascript(),
        javascriptLanguage.data.of({ autocomplete: vocabFor(training ? training.vocabAt : free ? Math.max(0, save.done - 1) : MISSIONS.indexOf(mission)) }),
        Prec.highest(keymap.of([{ key: "Tab", run: acceptCompletion }])),
        keymap.of([indentWithTab]),
        syntaxHighlighting(amber),
        errorLineField,
        keymap.of([
          { key: "Mod-Enter", run: () => (void run(), true) },
          // la comilla invertida no existe en todos los teclados
          { key: "Ctrl-'", run: (v) => (v.dispatch(v.state.replaceSelection("`")), true) },
        ]),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) {
            save.drafts[draftKey] = u.state.doc.toString();
            writeSave(save);
            if (Math.random() < 0.6) sfx("key");
          }
        }),
      ],
    });
    // Barra de teclas difíciles: inserta en el cursor (y deja el cursor dentro de los pares).
    const insert = (text: string) => {
      const pairs: Record<string, [string, number]> = { "${}": ["${}", 2], "{}": ["{}", 1], "[]": ["[]", 1] };
      const [ins, back] = pairs[text] ?? [text === "=>" ? " => " : text, 0];
      const { from, to } = view.state.selection.main;
      view.dispatch({ changes: { from, to, insert: ins }, selection: { anchor: from + ins.length - back } });
      view.focus();
      sfx("key");
    };
    right.querySelectorAll<HTMLButtonElement>(".keybar button").forEach((b) => {
      b.onmousedown = (e) => e.preventDefault();
      b.onclick = () => insert(b.dataset.k!);
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
      // el ejecutor no arrancó: casi siempre porque se publicó una versión nueva del
      // juego mientras la pestaña estaba abierta (sus archivos ya no existen)
      if (crashed?.error?.name === "WorkerError") {
        print(
          `<div class="err">LA TERMINAL NO PUDO ARRANCAR</div>` +
            `<div>No es un fallo de tu código. Hay una versión nueva del juego y esta pestaña es de la anterior. Recarga la página: tu partida y lo que has escrito se guardan.</div>` +
            `<button class="btn primary reload-btn">RECARGAR AHORA</button>`,
        );
        (consoleBox.querySelector(".reload-btn") as HTMLButtonElement).onclick = () => location.reload();
        fail();
        return;
      }
      if (crashed?.error) {
        const fe = translateError(crashed.error.name, crashed.error.message);
        // errores de escritura: JavaScript no da la línea, así que se busca analizando el código
        const spot = crashed.error.name === "SyntaxError" || !crashed.error.line ? locateSyntax(code) : null;
        const line = spot?.line ?? crashed.error.line;
        const where = line ? ` (línea ${line}${spot ? `, columna ${spot.column}` : ""})` : "";
        print(`<div class="err">ERROR${where}: ${esc(fe.title)}</div>`);
        if (spot) {
          const n = String(spot.line);
          print(
            `<pre class="spot"><span class="ln">${n} |</span> ${esc(spot.text)}\n${" ".repeat(n.length + 2)} ${" ".repeat(Math.max(0, spot.column - 1))}^</pre>` +
              `<div>${esc(spot.why)}</div>`,
          );
        } else print(`<div>${esc(fe.hint)}</div>`);
        print(`<div class="muted">${esc(fe.raw)}</div>`);
        // nombre que no existe: ¿es un parámetro usado fuera de su función, o una errata?
        const missing = crashed.error.message.match(/(\w+) is not defined|Can't find variable: (\w+)/);
        if (missing) {
          const known = mission.borrowed.map((b) => b.split(/[\s=]/)[0]).concat(Object.keys(mission.cases[0]?.globals() ?? {}));
          const mh = missingNameHint(missing[1] ?? missing[2], code, known);
          if (mh) print(`<div class="hint">${taskHtml(mh)}</div>`);
        }
        if (line) view.dispatch({ effects: setErrorLine.of(line) });
        typoTip(code);
        fail();
        return;
      }

      if (free) {
        // terminal libre: nada que comprobar, solo ver qué pasa
        if (!first.logs.length) print(`<div class="muted">Se ejecutó sin imprimir nada. Usa console.log para ver valores.</div>`);
        runBtn.disabled = false;
        running = false;
        return;
      }

      const verdict = mission.check(outs, mission.cases);
      if (mission.cases.length > 1 && verdict.pass) {
        print(`<div class="muted">probado con ${mission.cases.length} casos: ${mission.cases.map((c) => esc(c.label)).join(", ")}</div>`);
      }
      if (!verdict.pass) {
        print(`<div class="err">NO CUADRA</div><div>${taskHtml(verdict.feedback)}</div>`);
        // cada prueba por separado: con qué datos, qué imprimió y si pasó
        if (mission.cases.length > 1) {
          const reps = caseReports(mission, outs);
          print(`<div class="muted">Tu código se probó con estos datos:</div>`);
          for (const r of reps)
            print(
              `<div class="case ${r.pass ? "ok" : "bad"}">${r.pass ? "[OK]" : "[FALLA]"} ${esc(r.label)}${r.inputs ? ` <span class="in">(${esc(r.inputs)})</span>` : ""}` +
                `<div class="out">imprimió: ${esc(r.printed)}${!r.pass && r.feedback && r.feedback !== verdict.feedback ? ` · ${taskHtml(r.feedback)}` : ""}</div></div>`,
            );
          if (reps.some((r) => r.pass) && reps.some((r) => !r.pass))
            print(`<div class="hint">Acierta con unas pruebas y falla con otras. El juego cambia los datos en cada prueba para comprobar que tu código sirve en general, no solo para un caso.</div>`);
        }
        const hc = hardcodeHint(code, mission);
        if (hc) print(`<div class="hint">${taskHtml(hc)}</div>`);
        quoteHint(code);
        typoTip(code);
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
      // Hay más de una forma de resolverlo: si la del jugador es distinta, se enseña la de referencia.
      const reference = mission.hints[mission.hints.length - 1] ?? "";
      if (reference && normalize(reference) !== normalize(code)) {
        print(`<details class="alt"><summary>Otra forma de hacerlo</summary><pre>${esc(reference)}</pre><div class="muted">La tuya también vale: lo que importa es que haga lo que debe.</div></details>`);
      }
      sfx("success");
      if (practice && !training) {
        const prev = save.review[mission.id];
        save.review[mission.id] = { ok: (prev?.ok ?? 0) + 1, last: Date.now() };
        writeSave(save);
      }
      const stamp = el("div", "stamp", training ? "APROBADO" : practice ? "REPASADO" : "ACEPTADO");
      root.append(stamp);
      runBtn.textContent = "CONTINUAR";
      runBtn.disabled = false;
      runBtn.onclick = () => close(true);
      runBtn.focus();
      running = false;
      solved = true;
    }

    /** Erratas típicas (lenght, consol.log...): las señala con la palabra buena. */
    function typoTip(code: string) {
      const t = typoHint(code);
      if (t) print(`<div class="hint">${esc(t)}</div>`);
      // nombres que pide la tarea: las variables comprobadas y la función o clase que se prueba
      const probed = mission.probe?.match(/typeof\s+([A-Za-z_$][\w$]*)/)?.[1];
      const n = nameHint(code, [...mission.capture, ...(probed ? [probed] : [])]);
      if (n) print(`<div class="hint">${esc(n)}</div>`);
    }

    /** ${} dentro de comillas normales: no se sustituye. Es el error más común con las plantillas. */
    function quoteHint(code: string) {
      if (/(["'])[^"'`\n]*\$\{[^"'`\n]*\1/.test(code))
        print(
          `<div class="hint">Ojo: usaste \${...} dentro de comillas normales. Solo funciona con la comilla invertida \` (botón \` arriba del editor o Ctrl + '). También puedes unir con +: "Cuenta: " + cuenta</div>`,
        );
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

/** Para comparar planteamientos: no cuentan espacios, comentarios, punto y coma
 *  ni el valor exacto de números y textos (2387.5 y 2387.50 son la misma idea). */
function normalize(code: string): string {
  return code
    .replace(/\/\/.*$/gm, "")
    .replace(/(["'`])(?:\\.|(?!\1).)*\1/g, "S")
    .replace(/\b\d+(\.\d+)?\b/g, "0")
    .replace(/[\s;]+/g, "");
}

/** Etiqueta del lugar donde se hace un ejercicio de práctica: "GARAJE DE GUS". */
function placeTag(id: string): string {
  const set = setOfExercise(id);
  return set ? MENTORS[set.mentor].card[0].toUpperCase() : "PRÁCTICA";
}
