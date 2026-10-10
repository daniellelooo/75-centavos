import type { RunOutput } from "./sandbox";
import { findMission } from "./missions";
import type { Exercise } from "./types";

const TIMEOUT_MS = 1500;
/** El código asíncrono espera temporizadores y promesas: necesita más margen. */
const ASYNC_TIMEOUT_MS = 6000;

export type RunResult = { kind: "done"; outs: RunOutput[] } | { kind: "timeout" };

/** Ejecuta el código del jugador contra todos los casos de la misión.
 *  Las misiones de otras historias llevan su id de historia para que el Worker las encuentre. */
export function runMission(missionId: string, code: string, story?: { id: string; mission: Exercise }): Promise<RunResult> {
  return new Promise((resolve) => {
    const worker = new Worker(new URL("./runner.worker.ts", import.meta.url), { type: "module" });
    const timer = setTimeout(() => {
      worker.terminate();
      resolve({ kind: "timeout" });
    }, (story?.mission ?? findMission(missionId))?.async || story?.mission.sandbox === "sql" ? ASYNC_TIMEOUT_MS : TIMEOUT_MS);
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
    worker.postMessage({ missionId, code, storyId: story?.id });
  });
}
