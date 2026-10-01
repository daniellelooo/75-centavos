// El expediente de Sam: un rango que sube con la historia, como las tarjetas del
// laboratorio. No da puntos ni compite con la trama; solo dice en qué punto está
// quien juega. Las expansiones (otras historias) sumarán niveles.
import { ACTS, MISSIONS } from "./missions";

/** Rango según los actos terminados (0 a 6). */
export const RANKS = [
  "Astrónomo sin beca",
  "Becario de sistemas",
  "Ayudante de sistemas",
  "Operador de la VAX",
  "Analista de registros",
  "Programador en prácticas",
  "Desarrollador JavaScript junior",
];

/** Historias del juego: cada una es un nivel. */
export const STORIES = [
  { level: 1, title: "75 Centavos", place: "Berkeley, 1986", open: true },
  { level: 2, title: "Diez días", place: "Mountain View, 1995 · el DOM, eventos y módulos", open: false },
];

/** Actos terminados con las misiones resueltas hasta ahora. */
export function actsDone(done: number): number {
  return ACTS.filter((a) => {
    const last = MISSIONS.map((m, i) => ({ m, i })).filter((x) => x.m.act === a.n).pop();
    return !!last && last.i < done;
  }).length;
}

export const rankOf = (done: number) => RANKS[Math.min(actsDone(done), RANKS.length - 1)];
