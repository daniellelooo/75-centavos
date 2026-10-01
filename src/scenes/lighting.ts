import Phaser from "phaser";

export interface Light {
  x: number;
  y: number;
  r: number;
  color: [number, number, number];
  power: number;
}

// Matriz de Bayer 4x4: da a la luz un degradado "pixelado" en escalones,
// como las sombras de un juego de 16 bits, en vez de un difuminado liso.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const LEVELS = 5;

function quant(v: number, x: number, y: number): number {
  const t = BAYER[(y & 3) * 4 + (x & 3)];
  const s = v * (LEVELS - 1);
  const base = Math.floor(s);
  return (base + (s - base > t ? 1 : 0)) / (LEVELS - 1);
}

/** Capa de oscuridad + capa de resplandor aditivo, calculadas una vez por píxel. */
export function buildLighting(scene: Phaser.Scene, w: number, h: number, lights: Light[]): void {
  const pad = 16;
  const W = w + pad * 2;
  const H = h + pad * 2;
  const dark = scene.textures.createCanvas("lightmap-dark", W, H)!;
  const glow = scene.textures.createCanvas("lightmap-glow", W, H)!;
  const dctx = dark.getContext();
  const gctx = glow.getContext();
  const dimg = dctx.createImageData(W, H);
  const gimg = gctx.createImageData(W, H);

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const x = px - pad;
      const y = py - pad;
      let b = 0;
      let gr = 0, gg = 0, gb = 0;
      for (const l of lights) {
        const d = Math.hypot((x - l.x) * 0.9, y - l.y);
        if (d >= l.r) continue;
        const f = Math.pow(1 - d / l.r, 1.6) * l.power;
        b = Math.max(b, f);
        gr += l.color[0] * f;
        gg += l.color[1] * f;
        gb += l.color[2] * f;
      }
      const lit = quant(Math.min(1, b), px, py);
      const i = (py * W + px) * 4;
      dimg.data[i] = 7;
      dimg.data[i + 1] = 9;
      dimg.data[i + 2] = 24;
      dimg.data[i + 3] = Math.round(255 * 0.84 * (1 - lit));
      const gq = quant(Math.min(1, b * 0.9), px + 1, py);
      const n = Math.max(1, b);
      gimg.data[i] = Math.min(255, (gr / n) * gq * 0.2);
      gimg.data[i + 1] = Math.min(255, (gg / n) * gq * 0.2);
      gimg.data[i + 2] = Math.min(255, (gb / n) * gq * 0.2);
      gimg.data[i + 3] = 255;
    }
  }
  dctx.putImageData(dimg, 0, 0);
  gctx.putImageData(gimg, 0, 0);
  dark.refresh();
  glow.refresh();

  scene.add.image(-pad, -pad, "lightmap-dark").setOrigin(0, 0).setDepth(10000);
  const g = scene.add.image(-pad, -pad, "lightmap-glow").setOrigin(0, 0).setDepth(10001).setBlendMode(Phaser.BlendModes.ADD);
  // parpadeo suave del CRT
  scene.tweens.add({ targets: g, alpha: { from: 0.85, to: 1 }, duration: 90, yoyo: true, repeat: -1, repeatDelay: 1400, ease: "Stepped" });
  scene.events.once("shutdown", () => {
    scene.textures.remove("lightmap-dark");
    scene.textures.remove("lightmap-glow");
  });
}

/**
 * Rayos de sol que entran por las ventanas y caen en diagonal sobre el suelo,
 * con el mismo tramado que la luz nocturna y motas de polvo flotando.
 */
export function buildDaylight(scene: Phaser.Scene, windows: { x: number; w: number }[]): void {
  const W = 416, H = 232;
  const tex = scene.textures.createCanvas("daylight", W, H)!;
  const ctx = tex.getContext();
  const img = ctx.createImageData(W, H);
  const top = 30, len = 92, slant = 0.55;
  for (let y = top; y < top + len; y++) {
    const t = (y - top) / len;
    const fall = Math.pow(1 - t, 1.3);
    for (const win of windows) {
      const x0 = win.x + (y - top) * slant;
      for (let x = Math.floor(x0); x < x0 + win.w + t * 10; x++) {
        if (x < 0 || x >= W) continue;
        // los parteluces de la ventana dejan sombras en el rayo
        const rel = x - x0;
        if (Math.abs(rel - win.w / 2) < 1.2) continue;
        const v = quant(0.55 * fall, x, y);
        if (v <= 0) continue;
        const i = (y * W + x) * 4;
        img.data[i] = 255;
        img.data[i + 1] = 236;
        img.data[i + 2] = 180;
        img.data[i + 3] = Math.round(70 * v);
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  tex.refresh();
  scene.add.image(0, 0, "daylight").setOrigin(0, 0).setDepth(9000).setBlendMode(Phaser.BlendModes.ADD);

  // motas de polvo
  for (const win of windows) {
    for (let n = 0; n < 7; n++) {
      const y = top + 6 + Math.random() * (len - 20);
      const x = win.x + (y - top) * slant + Math.random() * win.w;
      const mote = scene.add.rectangle(Math.round(x), Math.round(y), 1, 1, 0xfff4c9, 0.8).setDepth(9001);
      scene.tweens.add({
        targets: mote,
        x: mote.x + 6 + Math.random() * 8,
        y: mote.y + 10 + Math.random() * 14,
        alpha: { from: 0, to: 0.9 },
        duration: 3500 + Math.random() * 3000,
        yoyo: true,
        repeat: -1,
        delay: Math.random() * 3000,
        ease: "Sine.InOut",
      });
    }
  }
  scene.events.once("shutdown", () => scene.textures.remove("daylight"));
}
