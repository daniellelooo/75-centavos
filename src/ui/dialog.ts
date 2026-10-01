import { CHAR } from "../config";
import type { Line, Speaker } from "../game/missions";
import { sfx } from "../audio/sfx";
import { el, esc, ui } from "./dom";

const NAMES: Record<Speaker, string> = {
  sam: "SAM",
  ruth: "RUTH",
  kessler: "DR. KESSLER",
  narrador: "",
  sistema: "TERMINAL",
};

let open = false;
export const isDialogOpen = () => open;

function portraitStyle(who: Speaker): string | null {
  if (who !== "sam" && who !== "ruth" && who !== "kessler") return null;
  const s = 2; // escala del retrato en píxeles de arte
  const row = CHAR[who] * 4; // fila "mirando abajo"
  return [
    `background-size: calc(${64 * s} * var(--u)) calc(${288 * s} * var(--u))`,
    `background-position: calc(${4} * var(--u)) calc(${-(row * 24 * s) + 1} * var(--u))`,
  ].join(";");
}

/** Muestra una secuencia de líneas. Resuelve cuando el jugador las pasa todas. */
export function playDialog(lines: Line[]): Promise<void> {
  return new Promise((resolve) => {
    open = true;
    const box = el("div", "dialog pixel-frame");
    const portrait = el("div", "portrait");
    const body = el("div", "body");
    const name = el("div", "name");
    const text = el("div", "text");
    const more = el("div", "more");
    body.append(name, text);
    box.append(portrait, body, more);
    ui.append(box);

    let i = 0;
    let typing = false;
    let full = "";
    let timer = 0;

    const show = () => {
      const line = lines[i];
      box.classList.toggle("narrator", line.who === "narrador");
      box.classList.toggle("system", line.who === "sistema");
      name.textContent = NAMES[line.who];
      const ps = portraitStyle(line.who);
      portrait.className = ps ? "portrait" : "portrait none";
      if (ps) portrait.setAttribute("style", ps);
      full = line.text;
      let n = 0;
      typing = true;
      more.classList.add("hidden");
      clearInterval(timer);
      timer = window.setInterval(() => {
        n += 1;
        text.innerHTML = esc(full.slice(0, n));
        if (n % 3 === 0 && full[n - 1] !== " ") sfx("blip");
        if (n >= full.length) finishTyping();
      }, 22);
    };

    const finishTyping = () => {
      clearInterval(timer);
      typing = false;
      text.innerHTML = esc(full);
      more.classList.remove("hidden");
    };

    const advance = () => {
      if (typing) return finishTyping();
      i += 1;
      if (i >= lines.length) {
        cleanup();
        resolve();
      } else {
        sfx("select");
        show();
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (["Space", "Enter", "KeyE", "KeyZ"].includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
        advance();
      }
    };
    const cleanup = () => {
      clearInterval(timer);
      window.removeEventListener("keydown", onKey, true);
      box.remove();
      open = false;
    };

    box.addEventListener("click", advance);
    window.addEventListener("keydown", onKey, true);
    show();
  });
}
