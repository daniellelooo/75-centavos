// Corre en un hilo aparte: si el código del jugador entra en un bucle
// infinito, el hilo principal mata este worker y el juego sigue vivo.
import { MISSIONS } from "./missions";
import { runSandboxed, runSandboxedAsync, type RunOutput } from "./sandbox";

self.onmessage = async (ev: MessageEvent<{ missionId: string; code: string }>) => {
  const mission = MISSIONS.find((m) => m.id === ev.data.missionId);
  if (!mission) return;
  const outs: RunOutput[] = [];
  for (const c of mission.cases) {
    const input = { code: ev.data.code, globals: c.globals(), capture: mission.capture, probe: mission.probe };
    outs.push(mission.async ? await runSandboxedAsync(input) : runSandboxed(input));
  }
  (self as unknown as Worker).postMessage(outs);
};
