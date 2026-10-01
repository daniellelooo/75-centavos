import { sfx } from "../audio/sfx";
import { el, esc, ui } from "./dom";
import { isDialogOpen } from "./dialog";

let openNow = false;

/** Vista del corcho con las pistas reunidas. */
export function openBoard(clues: { title: string; text: string }[], total: number): Promise<void> {
  if (openNow || isDialogOpen()) return Promise.resolve();
  openNow = true;
  return new Promise((resolve) => {
    sfx("open");
    const b = el("div", "board");
    const notes = Array.from({ length: total }, (_, i) => {
      const c = clues[i];
      return c
        ? `<div class="note"><b>${esc(c.title)}</b>${esc(c.text)}</div>`
        : `<div class="note empty">pista sin descubrir</div>`;
    }).join("");
    b.innerHTML = `<h2>EL CASO DE LOS 75 CENTAVOS</h2>${notes}<button class="btn close">CERRAR [ESC]</button>`;
    ui.append(b);
    const close = () => {
      window.removeEventListener("keydown", onKey, true);
      b.remove();
      openNow = false;
      sfx("close");
      resolve();
    };
    const onKey = (e: KeyboardEvent) => {
      if (["Escape", "KeyE", "Space", "Enter"].includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
        close();
      }
    };
    setTimeout(() => window.addEventListener("keydown", onKey, true), 50);
    (b.querySelector(".close") as HTMLButtonElement).onclick = close;
  });
}
