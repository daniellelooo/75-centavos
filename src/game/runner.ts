import type { RunOutput } from "./sandbox";
import { findMission } from "./missions";

const TIMEOUT_MS = 1500;
/** El código asíncrono espera temporizadores y promesas: necesita más margen. */
const ASYNC_TIMEOUT_MS = 6000;

export type RunResult = { kind: "done"; outs: RunOutput[] } | { kind: "timeout" };

/** Ejecuta el código del jugador contra todos los casos de la misión. */
export function runMission(missionId: string, code: string): Promise<RunResult> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL("./runner.worker.ts", import.meta.url), { type: "module" });
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({ kind: "timeout" });
    }, findMission(missionId)?.async ? ASYNC_TIMEOUT_MS : TIMEOUT_MS);
    worker.onmessage = (ev: MessageEvent<RunOutput[]>) => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ kind: "done", outs: ev.data });
    };
    worker.onerror = () => {
      clearTimeout(timer);
      worker.terminate();
      resolve({ kind: "done", outs: [{ ok: false, logs: [], values: {}, calls: {}, error: { name: "WorkerError", message: "El ejecutor falló" } }] });
    };
    worker.postMessage({ missionId, code });
  });
}
