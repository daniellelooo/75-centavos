// El expediente de Sam: un rango que sube con la historia, como las tarjetas del
// laboratorio. No da puntos ni compite con la trama; solo dice en qué punto está
// quien juega. Las expansiones (otras historias) sumarán niveles.
import { ACTS, MISSIONS } from "./missions";

export { RANKS, STORIES } from "./ranks-data";
import { RANKS } from "./ranks-data";

/** Actos terminados con las misiones resueltas hasta ahora. */
export function actsDone(done: number): number {
  return ACTS.filter((a) => {
    const last = MISSIONS.map((m, i) => ({ m, i })).filter((x) => x.m.act === a.n).pop();
    return !!last && last.i < done;
  }).length;
}

export const rankOf = (done: number) => RANKS[Math.min(actsDone(done), RANKS.length - 1)];
