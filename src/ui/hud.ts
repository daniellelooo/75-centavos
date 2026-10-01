import { openPause } from "./pause";
import { el, ui } from "./dom";

const objective = el("div", "hud-objective pixel-frame hidden", `<span class="dot"></span><span class="txt"></span>`);
const clock = el("div", "hud-clock pixel-frame hidden");
const prompt = el("div", "hud-prompt pixel-frame hidden");
const book = el("button", "hud-mute hud-book", "CUADERNO · C");
let notebookAction: (() => void) | null = null;
book.addEventListener("click", () => {
  book.blur();
  notebookAction?.();
});
export function setNotebookAction(fn: (() => void) | null): void {
  notebookAction = fn;
  book.classList.toggle("hidden", !fn);
}
const mute = el("button", "hud-mute", "MENU · ESC");
mute.addEventListener("click", () => {
  mute.blur();
  openPause();
});

export function mountHud(): void {
  ui.append(objective, clock, prompt, book, mute);
  book.classList.add("hidden");
}

export function setObjective(label: string | null, detail = ""): void {
  objective.classList.toggle("hidden", !label);
  if (label) (objective.querySelector(".txt") as HTMLElement).innerHTML = `<b>${label}</b> ${detail}`;
}

export function setClock(text: string | null): void {
  clock.classList.toggle("hidden", !text);
  if (text) clock.textContent = text;
}

export function setPrompt(text: string | null): void {
  prompt.classList.toggle("hidden", !text);
  if (text) prompt.innerHTML = `<span class="key">E</span>${text}`;
}

/** Recordatorio de controles la primera vez que se juega. */
export function showControls(): void {
  const c = el("div", "hud-controls pixel-frame", `<span class="key">WASD</span>o flechas para caminar <span class="key">E</span>para interactuar`);
  ui.append(c);
  setTimeout(() => c.classList.add("out"), 6500);
  setTimeout(() => c.remove(), 7300);
}

export function hudVisible(v: boolean): void {
  for (const n of [objective, clock, prompt, book]) n.style.visibility = v ? "" : "hidden";
}
