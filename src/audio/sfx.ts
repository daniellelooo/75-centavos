// Efectos de sonido generados por código con ZzFX (MIT, < 1 KB).
import { zzfx, ZZFX } from "zzfx";
import { settings } from "../game/settings";

export function applySfxVolume(): void {
  ZZFX.volume = 0.3 * settings.sfxVol;
}
applySfxVolume();

const SOUNDS = {
  blip: [0.4, 0.05, 520, 0, 0.01, 0.02, 1, 1.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.5, 0.01],
  select: [0.6, 0, 660, 0.01, 0.03, 0.06, 1, 1.4, 0, 0, 220, 0.04],
  open: [0.5, 0, 200, 0.02, 0.08, 0.1, 2, 1.2, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0.6],
  close: [0.5, 0, 300, 0.01, 0.05, 0.08, 2, 1.2, -6],
  key: [0.15, 0.3, 1200, 0, 0, 0.012, 4, 0.4, 0, 0, 0, 0, 0, 0.4],
  run: [0.5, 0, 140, 0.02, 0.12, 0.18, 2, 2.2, 0, 0, 120, 0.05, 0.08],
  success: [0.7, 0, 523, 0.02, 0.2, 0.35, 1, 1.8, 0, 0, 262, 0.08, 0.12, 0, 0, 0, 0.05, 0.6],
  fail: [0.6, 0, 160, 0.02, 0.1, 0.25, 3, 1.6, -3, 0, 0, 0, 0, 0.6],
  tick: [0.35, 0, 880, 0, 0.01, 0.03, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.3],
  alarm: [0.8, 0, 880, 0.02, 0.25, 0.25, 1, 0.5, 0, 0, 440, 0.12, 0.12, 0, 0, 0.1],
  coffee: [0.5, 0.4, 90, 0.08, 0.4, 0.3, 4, 0.5, 0, 0, 0, 0, 0, 1.5, 0, 0.3],
  meow: [0.7, 0.15, 620, 0.05, 0.14, 0.22, 0, 1.4, -4, 2, 0, 0, 0, 0.2, 0, 0, 0, 0.6, 0.05],
  water: [0.4, 0.5, 300, 0.02, 0.05, 0.12, 0, 2, 0, 0, 120, 0.05, 0.05, 0.4],
  click: [0.5, 0, 1400, 0, 0.01, 0.02, 4, 1, 0, 0, 0, 0, 0, 0.5],
  printTick: [0.06, 0.05, 1500, 0, 0.003, 0.008, 1, 0.6],
  lamp: [0.4, 0, 1800, 0, 0.005, 0.03, 4, 1, 0, 0, 0, 0, 0, 0.8],
  thunder: [0.9, 0.2, 60, 0.05, 0.6, 1.4, 4, 0.5, 0, 0, 0, 0, 0, 1.8, 0, 0.4, 0.1, 0.5],
  ring: [0.45, 0, 1180, 0.01, 0.35, 0.05, 1, 0, 0, 0, 0, 0, 0.04, 0, 0, 0, 0, 0.7],
  pin: [0.7, 0.1, 140, 0, 0.02, 0.09, 4, 2, 0, 0, 0, 0, 0, 0.6],
  step: [0.12, 0.3, 90, 0, 0.01, 0.02, 4, 2, 0, 0, 0, 0, 0, 1],
  // finales de las historias: fuegos artificiales, flash de cámara y aplausos
  boom: [0.7, 0.3, 70, 0.01, 0.15, 0.7, 4, 1.2, -1, 0, 0, 0, 0, 1.4, 0, 0.5, 0.05, 0.4],
  flash: [0.4, 0, 2400, 0, 0.01, 0.12, 4, 0.6, 0, 0, 0, 0, 0, 0.9],
  clap: [0.35, 0.6, 400, 0, 0.01, 0.04, 4, 1, 0, 0, 0, 0, 0, 2.2, 0, 0.2],
} as const;

export type SoundName = keyof typeof SOUNDS;

/** Repiqueteo de impresora matricial: una ráfaga de golpecitos, sin ruido blanco. */
export function printerChatter(ms = 1600): void {
  if (settings.sfxVol <= 0) return;
  const lines = Math.floor(ms / 400);
  for (let l = 0; l < lines; l++) {
    for (let i = 0; i < 6; i++) {
      setTimeout(() => sfx("printTick"), l * 400 + i * 40 + Math.random() * 6);
    }
  }
}

export function sfx(name: SoundName): void {
  if (settings.sfxVol <= 0) return;
  try {
    zzfx(...(SOUNDS[name] as unknown as number[]));
  } catch {
    /* audio bloqueado hasta la primera interacción */
  }
}



/** Nota de piano suave (seno con ataque corto y cola larga). */
export function pianoNote(freq: number, vol = 0.32): void {
  if (settings.sfxVol <= 0) return;
  zzfx(vol, 0, freq, 0.004, 0.04, 0.7, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.45);
}

/** Frase corta para el piano de Margarita: un arpegio lento en do mayor. */
export function pianoPhrase(): number {
  const C4 = 261.63, D4 = 293.66, E4 = 329.63, G4 = 392, A4 = 440, C5 = 523.25;
  const notes: [number, number][] = [[C4, 0], [E4, 380], [G4, 760], [C5, 1140], [A4, 1700], [G4, 2080], [E4, 2460], [D4, 2840], [C4, 3400]];
  for (const [f, t] of notes) setTimeout(() => pianoNote(f), t);
  return 3400;
}
