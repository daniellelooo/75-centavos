// Música de la radio del laboratorio, sintetizada en el navegador.
// Acordes suaves con un arpegio lento: algo para programar tranquilo.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let timer = 0;
let playing = false;

// Am7 - Fmaj7 - Cmaj7 - G6, en Hz
const CHORDS = [
  [220.0, 261.63, 329.63, 392.0],
  [174.61, 220.0, 261.63, 329.63],
  [130.81, 196.0, 246.94, 329.63],
  [196.0, 246.94, 293.66, 329.63],
];
const BEAT = 0.42;

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

function scheduleBar(bar: number, t0: number) {
  const chord = CHORDS[bar % CHORDS.length];
  // colchón
  for (const n of chord) voice(n / 2, t0, BEAT * 8, "triangle", 0.05, 900);
  // bajo
  voice(chord[0] / 2, t0, BEAT * 2, "sine", 0.12, 400);
  voice(chord[0] / 2, t0 + BEAT * 4, BEAT * 2, "sine", 0.1, 400);
  // arpegio
  const order = [0, 2, 1, 3, 2, 1, 3, 2];
  order.forEach((idx, i) => {
    if (i === 5 && bar % 2) return;
    voice(chord[idx] * 2, t0 + i * BEAT, BEAT * 1.6, "square", 0.018, 1800);
  });
}

export function startMusic(): void {
  if (playing) return;
  try {
    ctx = ctx ?? new AudioContext();
    void ctx.resume();
    master = ctx.createGain();
    master.gain.value = 0.0001;
    master.gain.exponentialRampToValueAtTime(0.7, ctx.currentTime + 1.5);
    master.connect(ctx.destination);
  } catch {
    return;
  }
  playing = true;
  let bar = 0;
  let next = ctx.currentTime + 0.1;
  const tick = () => {
    while (next < ctx!.currentTime + 1.2) {
      scheduleBar(bar++, next);
      next += BEAT * 8;
    }
  };
  tick();
  timer = window.setInterval(tick, 400);
}

export function stopMusic(): void {
  if (!playing || !ctx || !master) return;
  playing = false;
  clearInterval(timer);
  const m = master;
  m.gain.setValueAtTime(m.gain.value, ctx.currentTime);
  m.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
  setTimeout(() => m.disconnect(), 800);
}

export const isMusicOn = () => playing;
