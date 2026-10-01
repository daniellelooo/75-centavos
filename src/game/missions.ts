// Índice de la historia: actos y misiones en orden.
import type { Line, Mission } from "./types";
import { ACT1 } from "./acts/act1";
import { ACT2 } from "./acts/act2";
import { ACT3 } from "./acts/act3";

export type { Line, Mission, Speaker, TestCase, CheckResult } from "./types";

export const MISSIONS: Mission[] = [...ACT1, ...ACT2, ...ACT3];

export interface ActInfo {
  n: number;
  title: string;
  date: string;
  /** Diálogo al empezar el acto (después de la tarjeta de fecha). */
  opening: Line[];
}

export const ACTS: ActInfo[] = [
  {
    n: 1,
    title: "El descuadre",
    date: "Agosto de 1986",
    opening: [
      { who: "narrador", text: "Sam es astrónomo. Se acabó la beca y lo mandaron al sótano: a administrar la computadora del laboratorio." },
      { who: "narrador", text: "No sabe programar. Todavía." },
    ],
  },
  {
    n: 2,
    title: "La trampa",
    date: "Septiembre de 1986",
    opening: [
      { who: "narrador", text: "Tres semanas después. El intruso vuelve casi cada noche, siempre desde el otro lado del océano." },
      { who: "narrador", text: "Kessler quiere cerrarle la puerta. Sam quiere saber quién es." },
    ],
  },
  {
    n: 3,
    title: "El rastro",
    date: "Diciembre de 1986",
    opening: [
      { who: "narrador", text: "El anzuelo funcionó. Ahora el sótano está lleno de papeles, café frío y gente del gobierno que no se presenta." },
      { who: "narrador", text: "Ya no se trata de 75 centavos." },
    ],
  },
];

/** Futuros actos, visibles bloqueados en el cuaderno. */
export const FUTURE_ACTS = [
  { n: 4, title: "El comprador", topics: "alcance y closures" },
  { n: 5, title: "La conexión", topics: "clases y this" },
  { n: 6, title: "Tiempo real", topics: "asincronía y promesas" },
];

export const missionsOfAct = (n: number) => MISSIONS.filter((m) => m.act === n);
export const actOf = (missionIndex: number) => MISSIONS[missionIndex]?.act ?? ACTS.length + 1;
export const lastOfAct = (missionIndex: number) => {
  const m = MISSIONS[missionIndex];
  return !!m && MISSIONS[missionIndex + 1]?.act !== m.act;
};
