// Índice de la historia: actos y misiones en orden.
import type { Line, Mission } from "./types";
import { ACT1 } from "./acts/act1";
import { ACT2 } from "./acts/act2";
import { ACT3 } from "./acts/act3";
import { ACT4 } from "./acts/act4";
import { ACT5 } from "./acts/act5";
import { ACT6 } from "./acts/act6";
import { TRAINING_EXERCISES } from "./training";
import { FREE } from "./free";

export type { Line, Mission, Speaker, TestCase, CheckResult } from "./types";

export const MISSIONS: Mission[] = [...ACT1, ...ACT2, ...ACT3, ...ACT4, ...ACT5, ...ACT6];

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
  {
    n: 4,
    title: "El comprador",
    date: "Enero de 1987",
    opening: [
      { who: "narrador", text: "Hannover tiene un apartamento y un nombre. Pero alguien paga por lo que salía de allí." },
      { who: "narrador", text: "La policía alemana pide paciencia. Sam no tiene mucha." },
    ],
  },
  {
    n: 5,
    title: "La conexión",
    date: "Marzo de 1987",
    opening: [
      { who: "narrador", text: "Cuatro países, tres policías y una compañía telefónica intentan hablar el mismo idioma." },
      { who: "narrador", text: "Hace falta un mapa que entiendan todos. Y un plan para la mañana de la redada." },
    ],
  },
  {
    n: 6,
    title: "Tiempo real",
    date: "Junio de 1987",
    opening: [
      { who: "narrador", text: "Detuvieron a los de Hannover. El caso debería estar cerrado." },
      { who: "narrador", text: "Pero las puertas que abrieron siguen abiertas. Y alguien sabe dónde están." },
    ],
  },
];

/** Futuros actos, visibles bloqueados en el cuaderno. */
export const FUTURE_ACTS = [{ n: 7, title: "Nuevas historias", topics: "el DOM, eventos y módulos" }];

/** Busca una misión de la historia o un ejercicio de Margarita. */
export const findMission = (id: string) =>
  MISSIONS.find((m) => m.id === id) ?? TRAINING_EXERCISES.find((m) => m.id === id) ?? (id === FREE.id ? FREE : undefined);

export const missionsOfAct = (n: number) => MISSIONS.filter((m) => m.act === n);
export const actOf = (missionIndex: number) => MISSIONS[missionIndex]?.act ?? ACTS.length + 1;
export const lastOfAct = (missionIndex: number) => {
  const m = MISSIONS[missionIndex];
  return !!m && MISSIONS[missionIndex + 1]?.act !== m.act;
};
