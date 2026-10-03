// Tipos comunes de las misiones. Cada misión enseña una palabra del lenguaje
// justo cuando la historia la necesita. Los nombres son ficticios.

import type { RunOutput } from "./sandbox";

export type Speaker = "ruth" | "sam" | "kessler" | "margarita" | "gus" | "benny" | "narrador" | "sistema";

export type Mood = "normal" | "sorpresa" | "serio" | "alegre";

export interface Line {
  who: Speaker;
  text: string;
  /** Expresión del retrato (por defecto, normal). */
  mood?: Mood;
}

export interface TestCase {
  label: string;
  globals: () => Record<string, unknown>;
}

export interface CheckResult {
  pass: boolean;
  feedback: string;
}

export interface Mission {
  id: string;
  /** Acto al que pertenece (1, 2, 3...). */
  act: number;
  title: string;
  concept: string;
  phase: "dia" | "noche";
  /** Quién da el encargo: un personaje o la propia terminal (de noche). */
  giver: "ruth" | "kessler" | "terminal";
  /** Hora que marca el reloj del juego durante la misión. */
  clock: string;
  /** Expresión que se evalúa tras el código del jugador (para probar funciones). */
  probe?: string;
  /** Se ejecuta en modo asíncrono (await, setTimeout, promesas). */
  async?: boolean;
  briefing: Line[];
  lesson: { title: string; body: string; example: string };
  task: string;
  starter: string;
  borrowed: string[];
  cases: TestCase[];
  capture: string[];
  check: (outs: RunOutput[], cases: TestCase[]) => CheckResult;
  hints: string[];
  debrief: Line[];
  clue: { title: string; text: string };
}


