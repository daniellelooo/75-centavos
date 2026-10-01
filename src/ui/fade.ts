import { el, ui, wait } from "./dom";

// Transición en mosaico: la pantalla se cubre bloque a bloque siguiendo una
// matriz de Bayer 8x8, como un fundido de consola de 16 bits.
const COLS = 32;
const ROWS = 18;
const STEP_MS = 7;

function bayer8(x: number, y: number): number {
  let v = 0;
  for (let bit = 0; bit < 3; bit++) {
    const xb = (x >> bit) & 1;
    const yb = (y >> bit) & 1;
    v = (v << 2) | ((xb ^ yb) << 1) | yb;
  }
  // invierte el orden de bits para que el patrón quede repartido
  let r = 0;
  for (let i = 0; i < 6; i++) r = (r << 1) | ((v >> i) & 1);
  return r;
}

const veil = el("div", "fade");
veil.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;
veil.style.gridTemplateRows = `repeat(${ROWS}, 1fr)`;
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    const cell = el("i");
    cell.style.setProperty("--d", `${bayer8(x, y) * STEP_MS}ms`);
    veil.append(cell);
  }
}
ui.append(veil);

const DURATION = 64 * STEP_MS + 80;

export async function fadeOut(): Promise<void> {
  veil.classList.add("on");
  await wait(DURATION);
}

export async function fadeIn(): Promise<void> {
  veil.classList.remove("on");
  await wait(DURATION);
}

/** Tarjeta de lugar/hora sobre negro. */
export async function showCard(title: string, sub: string): Promise<void> {
  veil.classList.add("on");
  await wait(DURATION);
  const c = el("div", "card", `<div>${title}</div><small>${sub}</small>`);
  ui.append(c);
  await wait(2200);
  c.remove();
  veil.classList.remove("on");
  await wait(DURATION);
}
