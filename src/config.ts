// Resolución interna fija. Se escala por múltiplos enteros para que cada
// píxel del arte sea un bloque nítido en pantalla.
export const VIEW_W = 480;
export const VIEW_H = 270;
export const TILE = 16;

/** Índices de personaje dentro de assets/characters.png (tools/art/characters.py). */
export const CHAR = { sam: 0, ruth: 1, kessler: 2, margarita: 3 } as const;
export type CharName = keyof typeof CHAR;

/** Fila de la hoja de cada dirección. */
export const DIR = { down: 0, left: 1, up: 2, right: 3 } as const;
export type Dir = keyof typeof DIR;

export function charFrame(name: CharName, dir: Dir, step = 0): number {
  return (CHAR[name] * 4 + DIR[dir]) * 4 + step;
}
