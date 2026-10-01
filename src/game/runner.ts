import type { RunOutput } from "./sandbox";

const TIMEOUT_MS = 1500;

export type RunResult = { kind: "done"; outs: RunOutput[] } | { kind: "timeout" };

/** Ejecuta el código del jugador contra todos los casos de la misión. */
export function runMission(missionId: string, code: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL("./runner.worker.ts", import.meta.url), { type: "module" });
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({ kind: "timeout" });
    }, TIMEOUT_MS);
    worker.onmessage = (ev: MessageEvent<RunOutput[]>) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ kind: "done", outs: ev.data });
    };
    worker.onerror = () => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ kind: "done", outs: [{ ok: false, logs: [], values: {}, calls: {}, error: { name: "Error", message: "El ejecutor falló" } }] });
    };
    worker.postMessage({ missionId, code });
  });
}
