// El cuaderno de Sam: el mapa de ruta de lo aprendido y un sitio para repasar.
// Página izquierda: los actos como una línea de metro. Página derecha: la ficha
// del concepto, una pregunta de "¿qué imprime?" y práctica en la terminal.
import { ACTS, FUTURE_ACTS, MISSIONS, type Mission } from "../game/missions";
import { QUIZ } from "../game/concepts";
import { save, writeSave } from "../game/state";
import { sfx } from "../audio/sfx";
import { el, esc, ui } from "./dom";

const DAY = 24 * 60 * 60 * 1000;
let openNow = false;
export const isNotebookOpen = () => openNow;

/** Hace falta repasar: aprendido y nunca acertado, o acertado hace más de un día. */
function needsReview(m: Mission): boolean {
  const r = save.review[m.id];
  return !r || Date.now() - r.last > DAY;
}

interface NotebookHooks {
  practice: (m: Mission) => Promise<void>;
}

export function openNotebook(hooks: NotebookHooks): Promise<void> {
  if (openNow) return Promise.resolve();
  openNow = true;
  sfx("open");
  return new Promise((resolve) => {
    const root = el("div", "notebook");
    const book = el("div", "nb-book");
    const left = el("div", "nb-page nb-left");
    const right = el("div", "nb-page nb-right");
    book.append(left, right);
    root.append(book);
    ui.append(root);

    const learned = (i: number) => i < save.done;
    let selected = Math.max(0, Math.min(save.done - 1, MISSIONS.length - 1));

    const renderMap = () => {
      const learnedCount = Math.min(save.done, MISSIONS.length);
      const review = MISSIONS.filter((m, i) => learned(i) && needsReview(m)).length;
      let html = `<h2>CUADERNO DE SAM</h2>
        <div class="nb-sub">${learnedCount} de ${MISSIONS.length} conceptos${review ? ` · <b>${review} para repasar</b>` : ""}</div>`;
      for (const act of ACTS) {
        const ms = MISSIONS.map((m, i) => ({ m, i })).filter((x) => x.m.act === act.n);
        html += `<div class="nb-act"><div class="nb-act-title">ACTO ${act.n} · ${esc(act.title)}</div><ol class="nb-line">`;
        for (const { m, i } of ms) {
          const state = learned(i) ? "done" : i === save.done ? "next" : "locked";
          const dot = learned(i) && needsReview(m) ? `<span class="nb-due" title="para repasar"></span>` : "";
          html += `<li class="nb-stop ${state} ${i === selected ? "sel" : ""}" data-i="${i}">
            <span class="nb-node"></span><span class="nb-name">${state === "locked" ? "???" : esc(m.concept)}</span>${dot}</li>`;
        }
        html += `</ol></div>`;
      }
      for (const f of FUTURE_ACTS) {
        html += `<div class="nb-act future"><div class="nb-act-title">ACTO ${f.n} · ${esc(f.title)}</div><div class="nb-future">Próximamente: ${esc(f.topics)}</div></div>`;
      }
      left.innerHTML = html;
      left.querySelectorAll<HTMLLIElement>(".nb-stop").forEach((li) => {
        li.onclick = () => {
          const i = Number(li.dataset.i);
          if (!learned(i)) return void sfx("fail");
          selected = i;
          sfx("select");
          renderMap();
          renderCard();
        };
      });
    };

    const renderCard = () => {
      if (save.done === 0) {
        right.innerHTML = `<div class="nb-empty">Todavía no has aprendido nada.<br><br>Habla con Ruth y resuelve tu primera misión: aparecerá aquí.</div>`;
        return;
      }
      const m = MISSIONS[selected];
      const q = QUIZ[m.id];
      const r = save.review[m.id];
      // las opciones se barajan para que la correcta no esté siempre en el mismo sitio
      const order = q.options.map((_, i) => i).sort(() => Math.random() - 0.5);
      right.innerHTML = `
        <div class="nb-tag">ACTO ${m.act} · MISION "${esc(m.title)}"</div>
        <h3>${esc(m.lesson.title)}</h3>
        <p>${esc(m.lesson.body)}</p>
        <pre class="nb-code">${esc(m.lesson.example)}</pre>
        <div class="nb-quiz">
          <div class="nb-q">PREGUNTA RAPIDA · ¿Qué imprime?</div>
          <pre class="nb-code small">${esc(q.code)}</pre>
          <div class="nb-opts">${order.map((i) => `<button class="nb-opt" data-i="${i}">${esc(q.options[i])}</button>`).join("")}</div>
          <div class="nb-why"></div>
        </div>
        <div class="nb-actions">
          <button class="btn nb-practice">PRACTICAR EN LA TERMINAL</button>
          <span class="nb-stat">${r ? `Repasado ${r.ok} ${r.ok === 1 ? "vez" : "veces"}` : "Sin repasar"}</span>
        </div>`;
      right.querySelectorAll<HTMLButtonElement>(".nb-opt").forEach((b) => {
        b.onclick = () => {
          const i = Number(b.dataset.i);
          const ok = i === q.answer;
          right.querySelectorAll<HTMLButtonElement>(".nb-opt").forEach((x) => {
            const j = Number(x.dataset.i);
            x.disabled = true;
            if (j === q.answer) x.classList.add("right");
            else if (j === i) x.classList.add("wrong");
          });
          (right.querySelector(".nb-why") as HTMLElement).innerHTML = `<b>${ok ? "Correcto." : "Casi."}</b> ${esc(q.why)}`;
          sfx(ok ? "success" : "fail");
          if (ok) {
            const prev = save.review[m.id];
            save.review[m.id] = { ok: (prev?.ok ?? 0) + 1, last: Date.now() };
            writeSave(save);
            renderMap();
          }
        };
      });
      (right.querySelector(".nb-practice") as HTMLButtonElement).onclick = async () => {
        root.classList.add("hidden");
        await hooks.practice(m);
        root.classList.remove("hidden");
        renderMap();
        renderCard();
      };
    };

    const closeBtn = el("button", "btn nb-close", "CERRAR [C]");
    closeBtn.onclick = () => close();
    book.append(closeBtn);

    const onKey = (e: KeyboardEvent) => {
      if (root.classList.contains("hidden")) return;
      if (["Escape", "KeyC"].includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };
    const close = () => {
      window.removeEventListener("keydown", onKey, true);
      root.remove();
      openNow = false;
      sfx("close");
      resolve();
    };
    setTimeout(() => window.addEventListener("keydown", onKey, true), 50);
    renderMap();
    renderCard();
  });
}
