// Ejecuta un ejercicio en el mismo hilo, sin Worker: para los tests.
import { runSandboxed, runSandboxedAsync, type RunOutput } from "./sandbox";
import type { Exercise } from "./types";

export async function runLocal(ex: Exercise, code: string): Promise<RunOutput[]> {
  const outs: RunOutput[] = [];
  if (ex.sandbox === "sql") {
    const { runSql } = await import("./sandbox-sql");
    for (const c of ex.cases) outs.push(await runSql({ code, setup: String(c.globals().__setup), solution: ex.sql!.solution, verify: ex.sql!.verify }));
  } else if (ex.sandbox === "dom") {
    const { runDom } = await import("./sandbox-dom");
    for (const c of ex.cases) outs.push(runDom({ code, html: String(c.globals().__html), probe: ex.probe }));
  } else {
    for (const c of ex.cases) {
      const input = { code, globals: c.globals(), capture: ex.capture, probe: ex.probe };
      outs.push(ex.async ? await runSandboxedAsync(input) : runSandboxed(input));
    }
  }
  return outs;
}

/** Corre y corrige: el resultado que vería el jugador. */
export async function grade(ex: Exercise, code: string) {
  const outs = await runLocal(ex, code);
  const crashed = outs.find((o) => !o.ok);
  if (crashed) return { pass: false, feedback: `ERROR ${crashed.error?.name}: ${crashed.error?.message}` };
  return ex.check(outs, ex.cases);
}
