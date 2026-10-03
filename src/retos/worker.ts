// Ejecuta el código de un reto una vez por caso, aislado de la página.
import { runSandboxed } from "../game/sandbox";

/** Lo que no se puede mandar de vuelta (una función, por ejemplo) viaja como texto. */
function clonable(v: unknown): unknown {
  try {
    return structuredClone(v);
  } catch {
    return String(v);
  }
}

self.onmessage = (ev: MessageEvent<{ code: string; probes: string[] }>) => {
  const { code, probes } = ev.data;
  const outs = probes.map((probe) => {
    const o = runSandboxed({ code, globals: {}, capture: [], probe });
    return { ...o, values: { __probe: clonable(o.values.__probe) } };
  });
  (self as unknown as Worker).postMessage(outs);
};
