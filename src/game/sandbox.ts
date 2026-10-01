// Ejecuta el código del jugador de forma aislada de la partida.
// Se usa dentro del Web Worker (runner.worker.ts) y también directamente en los tests.

export interface RunInput {
  code: string;
  /** Variables que el juego le "presta" al jugador (p. ej. `cuenta`, `hora`). */
  globals: Record<string, unknown>;
  /** Nombres de variables del jugador que la misión quiere leer al final. */
  capture: string[];
  /** Expresión opcional evaluada al final (p. ej. para llamar a sus funciones). */
  probe?: string;
}

export interface RunOutput {
  ok: boolean;
  logs: string[];
  values: Record<string, unknown>;
  calls: Record<string, number>;
  /** Milisegundos que tardó el código principal (solo en modo asíncrono). */
  elapsed?: number;
  error?: { name: string; message: string; line?: number };
}

const IDENT = /^[A-Za-z_$][\w$]*$/;

function format(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean" || v == null) return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

/** Busca la línea del código del jugador en la traza de un error de `new Function`. */
function lineFromStack(err: unknown, offset: number): number | undefined {
  const stack = err instanceof Error ? err.stack ?? "" : "";
  const m = stack.match(/<anonymous>:(\d+):\d+/);
  if (!m) return undefined;
  const line = Number(m[1]) - offset;
  return line > 0 ? line : undefined;
}

export function runSandboxed(input: RunInput): RunOutput {
  const logs: string[] = [];
  const calls: Record<string, number> = {};
  const fakeConsole = {
    log: (...args: unknown[]) => {
      if (logs.length < 500) logs.push(args.map(format).join(" "));
    },
  };

  const names: string[] = [];
  const values: unknown[] = [];
  for (const [k, v] of Object.entries(input.globals)) {
    if (!IDENT.test(k)) continue;
    names.push(k);
    if (typeof v === "function") {
      values.push((...a: unknown[]) => {
        calls[k] = (calls[k] ?? 0) + 1;
        return (v as (...x: unknown[]) => unknown)(...a);
      });
    } else {
      values.push(structuredClone(v));
    }
  }

  const capture = input.capture.filter((c) => IDENT.test(c));
  const grab = capture
    .map((c) => `${JSON.stringify(c)}: (typeof ${c} === "undefined" ? undefined : ${c})`)
    .join(", ");

  const parts = grab ? [grab] : [];
  if (input.probe)
    parts.push(`__probe: (() => { try { return (${input.probe}); } catch (e) { return { __err: String((e && e.message) || e) }; } })()`);
  // "use strict" evita que una asignación sin `let` cree una global escondida.
  const body = `"use strict";\n${input.code}\n;return { ${parts.join(", ")} };`;
  // new Function añade 2 líneas de cabecera + 1 de "use strict".
  const offset = 3;

  try {
    const fn = new Function("console", ...names, body);
    const captured = fn(fakeConsole, ...values) as Record<string, unknown>;
    return { ok: true, logs, values: captured ?? {}, calls };
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    return {
      ok: false,
      logs,
      values: {},
      calls,
      error: { name: e.name, message: e.message, line: lineFromStack(err, offset) },
    };
  }
}

/**
 * Variante asíncrona (acto 6): el código del jugador corre dentro de una función
 * async, así que puede usar await. setTimeout está vigilado: antes de dar el
 * resultado se esperan los temporizadores pendientes (con un tope).
 */
export async function runSandboxedAsync(input: RunInput): Promise<RunOutput> {
  const logs: string[] = [];
  const calls: Record<string, number> = {};
  const fakeConsole = {
    log: (...args: unknown[]) => {
      if (logs.length < 500) logs.push(args.map(format).join(" "));
    },
  };
  let pending = 0;
  let lateError: unknown = null;
  // Mientras corre el código, todos los setTimeout del hilo (también los de las
  // funciones prestadas, como preguntarNodo) se cuentan para poder esperarlos.
  const realSetTimeout = globalThis.setTimeout;
  const counting = (fn: (...a: unknown[]) => unknown, ms = 0, ...rest: unknown[]) => {
    pending++;
    return realSetTimeout(() => {
      pending--;
      try {
        fn(...rest);
      } catch (e) {
        lateError = e;
      }
    }, Math.min(Number(ms) || 0, 1500));
  };
  const timeout = (fn: (...a: unknown[]) => unknown, ms = 0, ...rest: unknown[]) => {
    calls.setTimeout = (calls.setTimeout ?? 0) + 1;
    return counting(fn, ms, ...rest);
  };
  (globalThis as { setTimeout: unknown }).setTimeout = counting;

  const names: string[] = ["setTimeout"];
  const values: unknown[] = [timeout];
  for (const [k, v] of Object.entries(input.globals)) {
    if (!IDENT.test(k) || k === "setTimeout") continue;
    names.push(k);
    if (typeof v === "function") {
      values.push((...a: unknown[]) => {
        calls[k] = (calls[k] ?? 0) + 1;
        return (v as (...x: unknown[]) => unknown)(...a);
      });
    } else {
      values.push(structuredClone(v));
    }
  }

  const capture = input.capture.filter((c) => IDENT.test(c));
  const parts = capture.map((c) => `${JSON.stringify(c)}: (typeof ${c} === "undefined" ? undefined : ${c})`);
  if (input.probe)
    parts.push(`__probe: await (async () => { try { return await (${input.probe}); } catch (e) { return { __err: String((e && e.message) || e) }; } })()`);
  parts.push("__t: performance.now() - __t0");
  const body = `"use strict";\nconst __t0 = performance.now();\nreturn (async () => {\n${input.code}\n;return { ${parts.join(", ")} }; })();`;
  // cabecera de new Function (2) + "use strict" + __t0 + la línea del async
  const offset = 5;

  const fail = (err: unknown): RunOutput => {
    const e = err instanceof Error ? err : new Error(String(err));
    return { ok: false, logs, values: {}, calls, error: { name: e.name, message: e.message, line: lineFromStack(err, offset) } };
  };

  let captured: Record<string, unknown>;
  try {
    const fn = new Function("console", ...names, body);
    captured = (await fn(fakeConsole, ...values)) as Record<string, unknown>;
    // esperar a que terminen los setTimeout pendientes (máx. 2 s)
    const start = performance.now();
    while (pending > 0 && performance.now() - start < 2000) await new Promise((r) => realSetTimeout(r, 10));
  } catch (err) {
    return fail(err);
  } finally {
    (globalThis as { setTimeout: unknown }).setTimeout = realSetTimeout;
  }
  if (lateError) return fail(lateError);
  const { __t, ...rest } = captured ?? {};
  return { ok: true, logs, values: rest, calls, elapsed: Number(__t) };
}
