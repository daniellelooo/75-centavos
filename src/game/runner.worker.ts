// Corre en un hilo aparte: si el código del jugador entra en un bucle
// infinito, el hilo principal mata este worker y el juego sigue vivo.
import { findMission } from "./missions";
import { runSandboxed, runSandboxedAsync, type RunOutput } from "./sandbox";
import type { Exercise } from "./types";

async function exerciseOf(missionId: string, storyId?: string): Promise<Exercise | undefined> {
  if (!storyId) return findMission(missionId);
  const { loadContent, isStoryId } = await import("../stories/registry");
  if (!isStoryId(storyId)) return undefined;
  return (await loadContent[storyId]()).missions.find((m) => m.id === missionId);
}

self.onmessage = async (ev: MessageEvent<{ missionId: string; code: string; storyId?: string }>) => {
  const mission = await exerciseOf(ev.data.missionId, ev.data.storyId);
  if (!mission) return;
  const outs: RunOutput[] = [];
  const code = ev.data.code;
  if (mission.sandbox === "sql") {
    const { runSql, setSqlWasm } = await import("./sandbox-sql");
    const wasm = (await import("sql.js/dist/sql-wasm.wasm?url")).default;
    setSqlWasm(wasm);
    for (const c of mission.cases)
      outs.push(await runSql({ code, setup: String(c.globals().__setup), solution: mission.sql!.solution, verify: mission.sql!.verify }));
  } else if (mission.sandbox === "dom") {
    const { runDom } = await import("./sandbox-dom");
    for (const c of mission.cases) outs.push(runDom({ code, html: String(c.globals().__html), probe: mission.probe }));
  } else {
    for (const c of mission.cases) {
      const input = { code, globals: c.globals(), capture: mission.capture, probe: mission.probe };
      outs.push(mission.async ? await runSandboxedAsync(input) : runSandboxed(input));
    }
  }
  (self as unknown as Worker).postMessage(outs);
};
