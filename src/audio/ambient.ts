// Zumbido de la minicomputadora: ruido grave filtrado + 60 Hz de la red eléctrica.
// El volumen depende de lo cerca que esté Sam de la VAX.
import { settings } from "../game/settings";

let ctx: AudioContext | null = null;
let gain: GainNode | null = null;
let nodes: AudioNode[] = [];

export function startHum(): void {
  if (gain) return;
  try {
    ctx = ctx ?? new AudioContext();
    void ctx.resume();
  } catch {
    return;
  }
  const c = ctx;
  gain = c.createGain();
  gain.gain.value = 0;
  gain.connect(c.destination);

  // ruido marrón en bucle
  const len = c.sampleRate * 2;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    data[i] = last * 3.5;
  }
  const noise = c.createBufferSource();
  noise.buffer = buf;
  noise.loop = true;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 320;
  noise.connect(lp).connect(gain);
  noise.start();

  const mains = c.createOscillator();
  mains.frequency.value = 60;
  const mg = c.createGain();
  mg.gain.value = 0.25;
  mains.connect(mg).connect(gain);
  mains.start();

  const harm = c.createOscillator();
  harm.frequency.value = 120;
  const hg = c.createGain();
  hg.gain.value = 0.08;
  harm.connect(hg).connect(gain);
  harm.start();

  nodes = [noise, lp, mains, mg, harm, hg];
}

/** closeness: 0 (lejos) a 1 (pegado a la VAX). */
export function setHum(closeness: number, night: boolean): void {
  if (!gain || !ctx) return;
  const base = night ? 0.05 : 0.025;
  const v = settings.sfxVol * (base + 0.09 * closeness * closeness);
  gain.gain.setTargetAtTime(v, ctx.currentTime, 0.25);
}

export function stopHum(): void {
  if (!gain || !ctx) return;
  const g = gain;
  g.gain.setTargetAtTime(0, ctx.currentTime, 0.2);
  const old = nodes;
  setTimeout(() => {
    for (const n of old) {
      try {
        (n as AudioScheduledSourceNode).stop?.();
      } catch {
        /* ya parado */
      }
      n.disconnect();
    }
    g.disconnect();
  }, 800);
  gain = null;
  nodes = [];
}
