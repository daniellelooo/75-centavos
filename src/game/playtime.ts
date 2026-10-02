// Tiempo de juego: el de esta sesión y el total de la partida. Solo cuenta con
// la pestaña visible y fuera de la portada, para que no sume horas de pestaña olvidada.
import { loadSave, save, writeSave } from "./state";

let sessionMs = 0;
let last = performance.now();
let sinceWrite = 0;

function tick(): void {
  const now = performance.now();
  const dt = Math.min(now - last, 5000); // si el navegador durmió la pestaña, no cuenta ese hueco
  last = now;
  if (document.hidden || document.querySelector(".title")) return;
  sessionMs += dt;
  save.playMs = (save.playMs ?? 0) + dt;
  sinceWrite += dt;
  if (sinceWrite > 30000) {
    sinceWrite = 0;
    persist();
  }
}

/** Guarda solo el tiempo: con varias pestañas abiertas, escribir la partida
 *  entera desde una pestaña vieja borraría el progreso hecho en otra. */
function persist(): void {
  const stored = loadSave();
  if (!stored) return;
  stored.playMs = Math.max(stored.playMs ?? 0, save.playMs ?? 0);
  writeSave(stored);
}

setInterval(tick, 1000);
document.addEventListener("visibilitychange", () => {
  last = performance.now();
  if (document.hidden) persist();
});

export const sessionTime = () => sessionMs;
export const totalTime = () => save.playMs ?? 0;

/** 42 min · 1 h 05 min */
export function formatTime(ms: number): string {
  const min = Math.floor(ms / 60000);
  if (min < 1) return "menos de 1 min";
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, "0")} min`;
}
