import { sfx } from "../audio/sfx";
import { el, ui } from "./dom";

export function showTitle(opts: { canContinue: boolean; onNew: () => void; onContinue: () => void }): void {
  const t = el("div", "title");
  t.innerHTML = `
    <div class="kicker">BERKELEY · 1986</div>
    <h1>75 CENTAVOS</h1>
    <div class="sub">Aprende JavaScript resolviendo un caso inspirado en hechos reales.</div>
    <div class="menu">
      ${opts.canContinue ? `<button class="btn continue">CONTINUAR</button>` : ""}
      <button class="btn new">${opts.canContinue ? "NUEVA PARTIDA" : "EMPEZAR"}</button>
    </div>
    <div class="foot">Flechas o WASD para moverte · E para interactuar · Personajes y nombres ficticios</div>
  `;
  ui.append(t);
  const first = t.querySelector(".btn") as HTMLButtonElement;
  first.focus();
  const go = (fn: () => void) => () => {
    sfx("success");
    t.remove();
    fn();
  };
  const nb = t.querySelector(".new") as HTMLButtonElement;
  if (!opts.canContinue) nb.onclick = go(opts.onNew);
  else {
    // con una partida guardada, empezar de cero pide confirmación: se pierde el progreso
    let armed = false;
    nb.onclick = () => {
      if (armed) return go(opts.onNew)();
      armed = true;
      sfx("select");
      nb.textContent = "SÍ, BORRAR Y EMPEZAR";
      nb.classList.add("danger");
      t.querySelector(".foot")!.textContent = "Tu progreso actual se perderá. Pulsa otra vez para confirmar o elige CONTINUAR.";
    };
  }
  const c = t.querySelector(".continue") as HTMLButtonElement | null;
  if (c) c.onclick = go(opts.onContinue);
}
