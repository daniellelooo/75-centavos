// La credencial de Sam: tarjeta del laboratorio con su rango. Sale en el cuaderno
// (expediente) y, al empezar cada acto, cuando Kessler le da la nueva.
import { ACTS } from "../game/missions";
import { RANKS, STORIES, actsDone } from "../game/rank";
import { save } from "../game/state";
import { sfx } from "../audio/sfx";
import { portraitStyle } from "./dialog";
import { el, esc, ui, wait } from "./dom";

export function badgeHtml(done = save.done): string {
  const n = actsDone(done);
  const pips = ACTS.map((_, i) => `<i class="${i < n ? "on" : ""}"></i>`).join("");
  return `
    <div class="badge">
      <div class="badge-top">LABORATORIO DE BERKELEY · SOTANO B</div>
      <div class="badge-body">
        <div class="badge-photo"><div class="portrait" style="${portraitStyle("sam") ?? ""}"></div></div>
        <div class="badge-info">
          <small>NOMBRE</small><b>SAM</b>
          <small>RANGO</small><b class="badge-rank">${esc(RANKS[Math.min(n, RANKS.length - 1)])}</b>
          <small>NIVEL ${STORIES[0].level} · ${esc(STORIES[0].title.toUpperCase())}</small>
          <div class="badge-pips">${pips}</div>
        </div>
      </div>
      <div class="badge-sign">Firmado: Dr. Kessler</div>
    </div>`;
}

/** Lo que viene después: las siguientes historias, cada una un nivel. */
export function storiesHtml(): string {
  return STORIES.slice(1)
    .map((s) => `<div class="badge-next">NIVEL ${s.level} · ${esc(s.title)} <span>${esc(s.place)} · próximamente</span></div>`)
    .join("");
}

/** Muestra la credencial nueva unos segundos en el centro de la pantalla. */
export async function showBadge(): Promise<void> {
  const wrap = el("div", "badge-pop", `<div class="badge-pop-title">CREDENCIAL NUEVA</div>${badgeHtml()}`);
  ui.append(wrap);
  sfx("pin");
  await new Promise<void>((resolve) => {
    let done = false;
    const close = () => {
      if (done) return;
      done = true;
      window.removeEventListener("keydown", onKey, true);
      wrap.classList.add("out");
      void wait(200).then(() => {
        wrap.remove();
        resolve();
      });
    };
    const onKey = (e: KeyboardEvent) => {
      if (["Space", "Enter", "KeyE", "Escape"].includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };
    window.addEventListener("keydown", onKey, true);
    wrap.onclick = close;
    void wait(3600).then(close);
  });
}
