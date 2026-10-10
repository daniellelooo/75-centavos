// Formato de las historias nuevas (Diez días, La consulta, Código Cuervo, Medianoche).
// Cada historia es un nivel: un lugar, tres o cuatro personajes, actos con misiones
// y la misma terminal que 75 Centavos. El contenido (diálogos y misiones) va en
// src/stories/<id>/content.ts; el lugar y el reparto, en src/stories/<id>/index.ts.
import type { CharName } from "../config";
import type { Exercise, Line } from "../game/types";

export interface StoryMission extends Exercise {
  /** Quién da el encargo (un personaje del reparto). */
  giver: CharName;
  /** Lo que dice al dar el encargo. */
  briefing: Line[];
  /** Lo que se dice al resolverlo. */
  debrief: Line[];
}

export interface StoryAct {
  n: number;
  title: string;
  /** Fecha o momento que sale en la tarjeta del acto: "Mayo de 1995". */
  date: string;
  /** Diálogo al empezar el acto, después de la tarjeta. */
  opening: Line[];
}

/** Diálogos y misiones de una historia. */
export interface StoryContent {
  /** Lo primero que se ve al empezar la partida. */
  intro: Line[];
  acts: StoryAct[];
  missions: StoryMission[];
  /** Final de la historia, después de la última misión. */
  ending: Line[];
}
