// Música de la radio del laboratorio, sintetizada en el navegador.
// Dos "emisoras": acordes suaves con un arpegio lento, para programar tranquilo.
import { settings, saveSettings } from "../game/settings";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer = 0;
let playing = false;

export interface Track {
  name: string;
  beat: number;
  chords: number[][];
  arp: number[];
  lead: OscillatorType;
}

const n = (semis: number) => 220 * Math.pow(2, semis / 12); // relativo a La 220

export const TRACKS: Track[] = [
  {
    name: "KALX 90.7 · Sótano",
    beat: 0.42,
    // Am7 - Fmaj7 - Cmaj7 - G6
    chords: [
      [n(0), n(3), n(7), n(10)],
      [n(-4), n(0), n(3), n(7)],
      [n(-9), n(-2), n(2), n(7)],
      [n(-2), n(2), n(5), n(7)],
    ],
    arp: [0, 2, 1, 3, 2, 1, 3, 2],
    lead: "square",
  },
  {
    name: "KALX 90.7 · Madrugada",
    beat: 0.55,
    // Dm9 - Bbmaj7 - Gm7 - A7sus
    chords: [
      [n(-7), n(-4), n(0), n(7)],
      [n(-11), n(-7), n(-4), n(0)],
      [n(-14), n(-11), n(-7), n(-4)],
      [n(-12), n(-7), n(-5), n(-2)],
    ],
    arp: [0, 3, 2, 3, 1, 3, 2, 0],
    lead: "triangle",
  },
];

function voice(freq: number, t: number, dur: number, type: OscillatorType, gain: number, cutoff: number) {
  const c = ctx!;
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  o.type = type;
  o.frequency.value = freq;
  o.detune.value = (Math.random() - 0.5) * 8; // cinta un poco gastada
  f.type = "lowpass";
  f.frequency.value = cutoff;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + Math.min(0.08, dur / 3));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f).connect(g).connect(master!);
  o.start(t);
  o.stop(t + dur + 0.05);
}

function scheduleBar(track: Track, bar: number, t0: number) {
  const b = track.beat;
  const chord = track.chords[bar % track.chords.length];
  for (const f of chord) voice(f / 2, t0, b * 8, "triangle", 0.05, 900);
  voice(chord[0] / 2, t0, b * 2, "sine", 0.12, 400);
  voice(chord[0] / 2, t0 + b * 4, b * 2, "sine", 0.1, 400);
  track.arp.forEach((idx, i) => {
    if (i === 5 && bar % 2) return;
    voice(chord[idx] * 2, t0 + i * b, b * 1.6, track.lead, track.lead === "square" ? 0.018 : 0.04, 1800);
  });
}

const level = () => 0.0001 + 0.9 * settings.musicVol;

export function startMusic(): void {
  if (playing) return;
  try {
    ctx = ctx ?? new AudioContext();
    void ctx.resume();
    master = ctx.createGain();
    master.gain.value = 0.0001;
    master.gain.exponentialRampToValueAtTime(level(), ctx.currentTime + 1.5);
    master.connect(ctx.destination);
  } catch {
    return;
  }
  playing = true;
  settings.music = true;
  saveSettings();
  let bar = 0;
  let next = ctx.currentTime + 0.1;
  const tick = () => {
    const track = TRACKS[settings.track % TRACKS.length];
    while (next < ctx!.currentTime + 1.2) {
      scheduleBar(track, bar++, next);
      next += track.beat * 8;
    }
  };
  tick();
  timer = window.setInterval(tick, 400);
}

export function stopMusic(remember = true): void {
  if (remember) {
    settings.music = false;
    saveSettings();
  }
  if (!playing || !ctx || !master) return;
  playing = false;
  clearInterval(timer);
  const m = master;
  m.gain.setValueAtTime(Math.max(0.0001, m.gain.value), ctx.currentTime);
  m.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
  setTimeout(() => m.disconnect(), 800);
}

export function setMusicVolume(v: number): void {
  settings.musicVol = v;
  saveSettings();
  if (master && ctx) master.gain.setTargetAtTime(level(), ctx.currentTime, 0.05);
}

export function setTrack(i: number): void {
  settings.track = i;
  saveSettings();
  if (playing) {
    stopMusic(false);
    setTimeout(startMusic, 650);
  }
}

export const isMusicOn = () => playing;
