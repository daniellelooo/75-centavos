// Corrige un reto: ejecuta el código en un Worker (para cortar bucles infinitos)
// contra cada caso y explica en palabras normales qué falló.
import type { RunOutput } from "../game/sandbox";
import { locateSyntax } from "../game/syntax";
import { translateError, typoHint, TIMEOUT_ERROR } from "../game/errors";
import type { Reto } from "./data";

const TIMEOUT_MS = 2000;

export interface CasoResultado {
  llamada: string;
  esperado: string;
  obtenido: string;
  ok: boolean;
}

export type Resultado =
  | { tipo: "ok"; casos: CasoResultado[]; logs: string[] }
  | { tipo: "falla"; casos: CasoResultado[]; logs: string[]; consejo: string | null }
  | { tipo: "error"; titulo: string; detalle: string; linea?: number; texto?: string; logs: string[] };

/** El código de prueba que el Worker evalúa para cada caso. */
export function probeFor(fn: string, args: unknown[]): string {
  return `typeof ${fn} !== "function" ? { __nofn: true } : ${fn}(...${JSON.stringify(args)})`;
}

/** Compara resultados: listas y objetos por contenido, números con margen de redondeo. */
export function igual(a: unknown, b: unknown): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 1e-9 || (Number.isNaN(a) && Number.isNaN(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => igual(x, b[i]));
  if (a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)) {
    const ka = Object.keys(a), kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => igual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return a === b;
}

/** Un valor como se escribiría en JavaScript: los textos con comillas. */
export function mostrar(v: unknown): string {
  if (v === undefined) return "undefined";
  if (typeof v === "number" && !Number.isFinite(v)) return String(v);
  try {
    return JSON.stringify(v, null, 0).replace(/,(?=\S)/g, ", ");
  } catch {
    return String(v);
  }
}

const llamada = (r: Reto, args: unknown[]) => `${r.fn}(${args.map(mostrar).join(", ")})`;

function enWorker(code: string, reto: Reto): Promise<RunOutput[] | null> {
  return new Promise((resolve) => {
    const w = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    const timer = setTimeout(() => {
      w.terminate();
      resolve(null);
    }, TIMEOUT_MS);
    w.onmessage = (ev: MessageEvent<RunOutput[]>) => {
      clearTimeout(timer);
      w.terminate();
      resolve(ev.data);
    };
    w.onerror = () => {
      clearTimeout(timer);
      w.terminate();
      resolve([{ ok: false, logs: [], values: {}, calls: {}, error: { name: "Error", message: "El corrector no pudo arrancar. Recarga la página." } }]);
    };
    w.postMessage({ code, probes: reto.casos.map((c) => probeFor(reto.fn, c.args)) });
  });
}

/** Revisa la lista de salidas del Worker contra los casos del reto. */
export function corregir(reto: Reto, code: string, outs: RunOutput[] | null): Resultado {
  if (!outs) return { tipo: "error", titulo: TIMEOUT_ERROR.title, detalle: TIMEOUT_ERROR.hint, logs: [] };
  const logs = outs[0]?.logs ?? [];
  const first = outs[0];
  if (first && !first.ok && first.error) {
    const f = translateError(first.error.name, first.error.message);
    const typo = typoHint(code);
    return {
      tipo: "error",
      titulo: f.title,
      detalle: typo ? `${f.hint} ¿Querías escribir ${typo}?` : f.hint,
      linea: first.error.line,
      texto: first.error.line ? code.split("\n")[first.error.line - 1] : undefined,
      logs,
    };
  }
  const probes = outs.map((o) => o.values.__probe as unknown);
  if (probes.some((p) => p && typeof p === "object" && "__nofn" in p)) {
    return {
      tipo: "error",
      titulo: `No encuentro la función ${reto.fn}`,
      detalle: `El corrector llama a ${reto.fn}(...). Escríbela con ese nombre exacto, mayúsculas incluidas: function ${reto.fn}(...) { ... }`,
      logs,
    };
  }
  const roto = probes.find((p) => p && typeof p === "object" && "__err" in p) as { __err: string } | undefined;
  if (roto) {
    const f = translateError("Error", roto.__err);
    const i = probes.indexOf(roto);
    return { tipo: "error", titulo: f.title, detalle: `Pasó al llamar ${llamada(reto, reto.casos[i].args)}. ${f.hint}`, logs };
  }
  const casos = reto.casos.map((c, i) => ({
    llamada: llamada(reto, c.args),
    esperado: mostrar(c.esperado),
    obtenido: mostrar(probes[i]),
    ok: igual(probes[i], c.esperado),
  }));
  if (casos.every((c) => c.ok)) return { tipo: "ok", casos, logs };
  let consejo: string | null = null;
  if (probes.every((p) => p === undefined))
    consejo = "Tu función no devuelve nada (undefined). Falta el return con el resultado; console.log solo lo muestra, no lo devuelve.";
  else if (casos.some((c, i) => !c.ok && typeof probes[i] !== typeof reto.casos[i].esperado))
    consejo = "Algunos resultados son de otro tipo: por ejemplo un número donde se esperaba un texto, o al revés. Fíjate en las comillas.";
  return { tipo: "falla", casos, logs, consejo };
}

export async function comprobar(reto: Reto, code: string): Promise<Resultado> {
  const s = locateSyntax(code);
  if (s) return { tipo: "error", titulo: "La máquina no entiende esta línea", detalle: s.why, linea: s.line, texto: s.text, logs: [] };
  return corregir(reto, code, await enWorker(code, reto));
}
