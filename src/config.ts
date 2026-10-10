// Resolución interna fija. Se escala por múltiplos enteros para que cada
// píxel del arte sea un bloque nítido en pantalla.
export const VIEW_W = 480;
export const VIEW_H = 270;
export const TILE = 16;

/** Índices de personaje dentro de assets/characters.png (tools/art/characters.py).
 *  Los de las otras historias van detrás: Diez días, La consulta, Código Cuervo y Medianoche. */
export const CHAR = {
  sam: 0, ruth: 1, kessler: 2, margarita: 3, gus: 4, rochy: 5,
  lena: 6, kraus: 7, wes: 8,
  nora: 9, fenton: 10, pat: 11,
  iris: 12, penrose: 13, hale: 14,
  camilo: 15, beatriz: 16, wilson: 17,
} as const;
export type CharName = keyof typeof CHAR;

/** Nombre de cada personaje en los diálogos. */
export const CHAR_NAMES: Record<CharName, string> = {
  sam: "SAM", ruth: "RUTH", kessler: "DR. KESSLER", margarita: "MARGARITA", gus: "GUS", rochy: "ROCHY",
  lena: "LENA", kraus: "KRAUS", wes: "WES",
  nora: "NORA", fenton: "DR. FENTON", pat: "PAT",
  iris: "IRIS", penrose: "PENROSE", hale: "COMANDANTE HALE",
  camilo: "CAMILO", beatriz: "DOÑA BEATRIZ", wilson: "WILSON",
};

/** Fila de la hoja de cada dirección. */
export const DIR = { down: 0, left: 1, up: 2, right: 3 } as const;
export type Dir = keyof typeof DIR;

export function charFrame(name: CharName, dir: Dir, step = 0): number {
  return (CHAR[name] * 4 + DIR[dir]) * 4 + step;
}

/** Cuadros de assets/emotes.png: burbujas de emoción sobre los personajes. */
export const EMOTE = {
  sorpresa: 0, duda: 1, serio: 2, musica: 3, corazon: 4, zzz: 5,
  idea: 6, sudor: 7, enfado: 8, brillo: 9, alegre: 10, cafe: 11,
} as const;
export type EmoteName = keyof typeof EMOTE;
