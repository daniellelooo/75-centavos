// Lo que se ve por la ventana del laboratorio. El paisaje está pintado píxel a
// píxel (tools/art/view.py): la bahía, el Golden Gate, San Francisco, los tejados
// de Berkeley y el campanario. Aquí se anima lo que se mueve: nubes, brillos en
// el agua, pájaros, el prado con flores al viento, lluvia, nieve y luciérnagas.
import Phaser from "phaser";
import { VIEW_H, VIEW_W } from "../config";

interface Look {
  grass: number;
  flowers: number[];
  snow?: boolean;
  rain?: boolean;
  sunset?: boolean;
}

/** Color de las hierbas y flores del prado según el mes de cada acto. */
const LOOKS: Record<number, Look> = {
  1: { grass: 0xa8862e, flowers: [0xf08a24, 0xffb340, 0xfed018] },
  2: { grass: 0xa07e30, flowers: [0xf08a24, 0xe8344e, 0xfed018] },
  3: { grass: 0x4a7238, flowers: [0xe8344e, 0xf7f7f2] },
  4: { grass: 0xd6dce4, flowers: [], snow: true },
  5: { grass: 0x3e7230, flowers: [0x8a5cc8, 0xf08a24, 0xf7f7f2, 0xe86aa0], rain: true },
  6: { grass: 0x9c7a30, flowers: [0xf08a24, 0xfed018, 0x8a5cc8, 0xe8344e], sunset: true },
};

interface Plant {
  x: number;
  y: number;
  h: number;
  color: number;
  phase: number;
  kind: "flower" | "blade";
}

export class ViewScene extends Phaser.Scene {
  private act = 1;
  private night = false;
  private look!: Look;
  private plants: Plant[] = [];
  private fg!: Phaser.GameObjects.Graphics;
  private fx!: Phaser.GameObjects.Graphics;
  private drops: { x: number; y: number; v: number }[] = [];
  private flies: { x: number; y: number; p: number }[] = [];
  private birds: { x: number; y: number; v: number }[] = [];
  private clouds: { s: Phaser.GameObjects.Sprite; v: number }[] = [];

  constructor() {
    super("view");
  }

  init(data: { act?: number; night?: boolean }): void {
    this.act = Math.min(Math.max(data.act ?? 1, 1), 6);
    this.night = !!data.night;
    this.look = LOOKS[this.act];
    this.plants = [];
    this.drops = [];
    this.flies = [];
    this.birds = [];
    this.clouds = [];
  }

  private bgKey(): string {
    return `view_${this.act}_${this.night ? "n" : "d"}`;
  }

  private cloudMode(): string {
    if (this.night) return "night";
    if (this.look.rain || this.look.snow || this.act === 3) return "gray";
    if (this.look.sunset) return "sunset";
    return "day";
  }

  preload(): void {
    const key = this.bgKey();
    if (!this.textures.exists(key)) this.load.image(key, `/assets/view/${key}.png`);
    const c = `clouds_${this.cloudMode()}`;
    if (!this.textures.exists(c)) this.load.spritesheet(c, `/assets/view/${c}.png`, { frameWidth: 56, frameHeight: 20 });
  }

  create(): void {
    const L = this.look;
    this.add.image(0, 0, this.bgKey()).setOrigin(0, 0);

    // nubes que cruzan despacio, por encima del campanario
    const n = L.rain || L.snow ? 6 : this.night ? 2 : 3;
    for (let i = 0; i < n; i++) {
      const s = this.add.sprite(Math.random() * VIEW_W, 8 + Math.random() * 44, `clouds_${this.cloudMode()}`, i % 3).setOrigin(0, 0);
      this.clouds.push({ s, v: 2 + Math.random() * 3 + (L.rain ? 6 : 0) });
    }

    // brillos en el agua de la bahía
    if (!L.rain && !L.snow) {
      for (let i = 0; i < 26; i++) {
        const sp = this.add.rectangle(Math.round(Math.random() * VIEW_W), Math.round(122 + Math.random() * 17), 2, 1, this.night ? 0xfed018 : 0xffffff, 0);
        this.tweens.add({
          targets: sp,
          alpha: { from: 0, to: this.night ? 0.6 : 0.9 },
          duration: 500 + Math.random() * 700,
          yoyo: true,
          repeat: -1,
          delay: Math.random() * 3000,
          repeatDelay: Math.random() * 2500,
        });
      }
    }

    // prado: hierbas y flores que se mecen
    for (let i = 0; i < 230; i++) {
      const y = 200 + Math.pow(Math.random(), 0.7) * 66;
      this.plants.push({ x: Math.random() * VIEW_W, y, h: 2 + Math.round((y - 200) / 14), color: L.grass, phase: Math.random() * 6, kind: "blade" });
    }
    if (L.flowers.length)
      for (let i = 0; i < 170; i++) {
        const y = 204 + Math.pow(Math.random(), 0.55) * 64;
        this.plants.push({
          x: Math.random() * VIEW_W,
          y,
          h: 3 + Math.round((y - 204) / 5),
          color: L.flowers[Math.floor(Math.random() * L.flowers.length)],
          phase: Math.random() * 6,
          kind: "flower",
        });
      }
    this.plants.sort((a, b) => a.y - b.y);
    this.fg = this.add.graphics();
    this.fx = this.add.graphics();

    if (!this.night && !L.rain && !L.snow) for (let i = 0; i < 3; i++) this.birds.push({ x: -40 - i * 60, y: 30 + i * 10, v: 18 + i * 4 });
    if (this.night && !L.rain && !L.snow && [1, 2, 6].includes(this.act))
      for (let i = 0; i < 18; i++) this.flies.push({ x: Math.random() * VIEW_W, y: 205 + Math.random() * 55, p: Math.random() * 6 });
    if (L.rain || L.snow)
      for (let i = 0; i < (L.rain ? 140 : 90); i++) this.drops.push({ x: Math.random() * VIEW_W, y: Math.random() * VIEW_H, v: L.rain ? 220 + Math.random() * 80 : 14 + Math.random() * 16 });

    this.frame();
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  /** Marco de madera de la ventana, con parteluces y un reflejo en el cristal. */
  private frame(): void {
    const g = this.add.graphics().setDepth(10);
    const wood = 0xc8a480, dark = 0x8f673f, light = 0xe6dabf;
    g.fillStyle(dark, 1).fillRect(0, 0, VIEW_W, 14).fillRect(0, VIEW_H - 16, VIEW_W, 16).fillRect(0, 0, 14, VIEW_H).fillRect(VIEW_W - 14, 0, 14, VIEW_H);
    g.fillStyle(wood, 1).fillRect(2, 2, VIEW_W - 4, 9).fillRect(2, 2, 9, VIEW_H - 4).fillRect(VIEW_W - 11, 2, 9, VIEW_H - 4).fillRect(2, VIEW_H - 13, VIEW_W - 4, 11);
    g.fillStyle(light, 1).fillRect(2, 2, VIEW_W - 4, 1).fillRect(2, VIEW_H - 13, VIEW_W - 4, 1);
    g.fillStyle(dark, 1).fillRect(VIEW_W / 2 - 4, 0, 8, VIEW_H).fillRect(0, 118, VIEW_W, 7);
    g.fillStyle(wood, 1).fillRect(VIEW_W / 2 - 3, 0, 6, VIEW_H).fillRect(0, 119, VIEW_W, 5);
    g.fillStyle(0xffffff, 0.07);
    for (let i = 0; i < 30; i++) g.fillRect(40 + i, 20 + i, 2, 1).fillRect(280 + i, 140 + i, 2, 1);
  }

  update(time: number, dtMs: number): void {
    const dt = dtMs / 1000;
    const t = time / 1000;
    for (const c of this.clouds) {
      c.s.x += dt * c.v;
      if (c.s.x > VIEW_W + 10) c.s.x = -60;
    }
    // viento: ráfagas que recorren el prado de izquierda a derecha
    const g = this.fg.clear();
    for (const p of this.plants) {
      const gust = Math.sin(t * 1.6 - p.x * 0.025) * 0.8 + Math.sin(t * 3.1 + p.phase) * 0.35;
      const sway = Math.round(gust * (p.kind === "flower" ? 2.4 : 1.6) * Math.min(1.6, p.h / 6));
      const x = Math.round(p.x);
      if (p.kind === "blade") {
        g.fillStyle(p.color, 1).fillRect(x, p.y - p.h, 1, p.h);
        if (sway) g.fillRect(x + sway, p.y - p.h, 1, 1);
        continue;
      }
      const half = Math.ceil(p.h / 2);
      g.fillStyle(0x3f6b3a, 1).fillRect(x, p.y - half, 1, half);
      g.fillRect(Math.round(p.x + sway / 2), p.y - p.h, 1, p.h - half);
      const hx = Math.round(p.x + sway);
      const hy = p.y - p.h - 1;
      if (p.y > 238) {
        // flor grande de primer plano: pétalos, centro y hojas
        g.fillStyle(0x4b8139, 1).fillRect(x - 2, p.y - 3, 2, 1).fillRect(x + 1, p.y - 5, 2, 1);
        g.fillStyle(p.color, 1).fillRect(hx - 1, hy - 1, 3, 3).fillRect(hx - 2, hy, 5, 1).fillRect(hx, hy - 2, 1, 5);
        g.fillStyle(0xfed018, 1).fillRect(hx, hy, 1, 1);
      } else if (p.y > 222) {
        g.fillStyle(p.color, 1).fillRect(hx - 1, hy, 3, 2);
        g.fillStyle(0xfed018, 1).fillRect(hx, hy, 1, 1);
      } else {
        g.fillStyle(p.color, 1).fillRect(hx, hy, 2, 1);
      }
    }
    if (this.night) g.fillStyle(0x0b0f22, 0.5).fillRect(0, 196, VIEW_W, VIEW_H - 196);

    const f = this.fx.clear();
    for (const b of this.birds) {
      b.x += b.v * dt;
      if (b.x > VIEW_W + 20) b.x = -30 - Math.random() * 120;
      const wing = Math.sin(t * 8 + b.y) > 0 ? 1 : 0;
      f.fillStyle(0x1c1830, 1).fillRect(b.x, b.y + wing, 2, 1).fillRect(b.x + 2, b.y + 1 - wing, 1, 1).fillRect(b.x + 3, b.y + wing, 2, 1);
    }
    for (const fl of this.flies) {
      const a = 0.5 + 0.5 * Math.sin(t * 2 + fl.p * 3);
      f.fillStyle(0xfed018, a).fillRect(Math.round(fl.x + Math.sin(t + fl.p) * 6), Math.round(fl.y + Math.cos(t * 0.8 + fl.p) * 3), 1, 1);
    }
    for (const d of this.drops) {
      d.y += d.v * dt;
      if (this.look.snow) d.x += Math.sin(t + d.v) * 0.3;
      else d.x -= d.v * dt * 0.25;
      if (d.y > VIEW_H) {
        d.y = -4;
        d.x = Math.random() * (VIEW_W + 40);
      }
      if (this.look.snow) f.fillStyle(0xffffff, 0.9).fillRect(Math.round(d.x), Math.round(d.y), 1, 1);
      else f.fillStyle(0x8fd3ff, 0.5).fillRect(Math.round(d.x), Math.round(d.y), 1, 3);
    }
  }
}
