// Informe de pruebas para el jugador: con qué datos se probó su código, qué salió
// en cada prueba y por qué falla. Así no hay que adivinar qué espera el juego.
import type { Exercise as Mission, TestCase } from "./types";
import type { RunOutput } from "./sandbox";

export interface CaseReport {
  label: string;
  /** Los datos de esa prueba, legibles: dias = 7 */
  inputs: string;
  pass: boolean;
  feedback: string;
  /** Lo que imprimió el código en esa prueba (recortado). */
  printed: string;
}

function show(v: unknown): string {
  if (typeof v === "string") return `"${v}"`;
  const s = JSON.stringify(v);
  if (s === undefined) return String(v);
  if (s.length <= 48) return s;
  if (Array.isArray(v)) return `lista de ${v.length} elementos`;
  return "un objeto";
}

/** dias = 7 · notas = [6,8,7,9] (las funciones de ayuda no se muestran). */
export function describeInputs(c: TestCase): string {
  const g = c.globals();
  return Object.entries(g)
    .filter(([, v]) => typeof v !== "function")
    .map(([k, v]) => `${k} = ${show(v)}`)
    .join(" · ");
}

/** Evalúa cada prueba por separado para poder decir cuál falla y por qué. */
export function caseReports(mission: Mission, outs: RunOutput[]): CaseReport[] {
  return mission.cases.map((c, i) => {
    const o = outs[i];
    let pass = false;
    let feedback = "";
    try {
      const v = mission.check([o], [c]);
      pass = v.pass;
      feedback = v.pass ? "" : v.feedback;
    } catch {
      feedback = "";
    }
    const logs = o?.logs ?? [];
    const printed = logs.length ? logs.slice(0, 3).join(" | ").slice(0, 80) + (logs.length > 3 ? " ..." : "") : "nada";
    return { label: c.label, inputs: describeInputs(c), pass, feedback, printed };
  });
}

/** Si en el código aparece escrito a mano un número que cambia entre pruebas
 *  (el 7 de dias = 7), lo señala: hay que usar la variable. */
export function hardcodeHint(code: string, mission: Mission): string | null {
  if (mission.cases.length < 2) return null;
  const all = mission.cases.map((c) => c.globals());
  const clean = code.replace(/\/\/.*$/gm, "");
  // los números que da la propia tarea (el 6 de "menor que 6") son legítimos
  const given = new Set((mission.task.match(/\d+(?:\.\d+)?/g) ?? []).map(Number));
  for (const name of Object.keys(all[0])) {
    const values = all.map((g) => g[name]).filter((v): v is number => typeof v === "number");
    if (values.length !== all.length || new Set(values).size < 2) continue;
    for (const v of values) {
      if (Math.abs(v) <= 2 || given.has(v)) continue;
      const re = new RegExp(`(^|[^\\w.])${String(v).replace(".", "\\.")}(?![\\w.])`);
      if (re.test(clean))
        return `En tu código aparece el número ${v}, que es el valor de \`${name}\` solo en una de las pruebas. Usa la variable \`${name}\`: su valor cambia en cada prueba.`;
    }
  }
  return null;
}
