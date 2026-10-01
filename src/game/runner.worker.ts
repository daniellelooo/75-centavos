// Corre en un hilo aparte: si el código del jugador entra en un bucle
// infinito, el hilo principal mata este worker y el juego sigue vivo.
import { MISSIONS } from "./missions";
import { runSandboxed } from "./sandbox";

self.onmessage = (ev: MessageEvent<{ missionId: string; code: string }>) => {
  const mission = MISSIONS.find((m) => m.id === ev.data.missionId);
  if (!mission) return;
  const outs = mission.cases.map((c) =>
    runSandboxed({ code: ev.data.code, globals: c.globals(), capture: mission.capture }),
  );
  (self as unknown as Worker).postMessage(outs);
};
