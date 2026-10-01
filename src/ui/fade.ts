import { el, ui, wait } from "./dom";

const veil = el("div", "fade");
ui.append(veil);

export async function fadeOut(): Promise<void> {
  veil.classList.add("on");
  await wait(650);
}

export async function fadeIn(): Promise<void> {
  veil.classList.remove("on");
  await wait(400);
}

/** Tarjeta de lugar/hora sobre negro. */
export async function showCard(title: string, sub: string): Promise<void> {
  veil.classList.add("on");
  const c = el("div", "card", `<div>${title}</div><small>${sub}</small>`);
  ui.append(c);
  await wait(2200);
  c.remove();
  veil.classList.remove("on");
  await wait(500);
}
