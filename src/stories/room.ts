// Piezas comunes de los lugares de las historias: qué es un cuarto, cómo se
// ilumina según el acto, qué hacen los personajes cuando nadie les habla y las
// ayudas para pintar suelos, paredes, vapor de café y fuegos artificiales.
import Phaser from "phaser";
import type { CharName, Dir, EmoteName } from "../config";
import type { Line } from "../game/types";
import type { Light } from "../scenes/lighting";
import type { WindowRect } from "../scenes/weather";
import { FLOOR_BOTTOM, FLOOR_TOP, ROOM_W, type BuildCtx } from "../scenes/places";

export interface StoryFlavor {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
  lines: Line[];
}

/** Algo que hace un personaje cuando nadie le habla: camina, se queda un rato y vuelve. */
export interface Routine {
  /** Puntos por los que camina (desde su sitio). Vuelve por el mismo camino. */
  path: [number, number][];
  face: Dir;
  emote?: EmoteName;
  /** Cuánto se queda allí, en milisegundos. */
  ms: number;
  sound?: "click" | "coffee" | "water" | "key" | "printTick" | "ring" | "lamp";
}

/** Luz y tiempo del cuarto en un acto. */
export interface Atmosphere {
  /** Si hay luces, el cuarto está a oscuras salvo donde alumbran. */
  night?: Light[];
  daylight?: { x: number; w: number }[];
  rain?: WindowRect[];
  snow?: WindowRect[];
  xmas?: [number, number, number];
  lightning?: boolean;
}

export interface RoomDef {
  key: string;
  /** Tarjeta al llegar: nombre del lugar y subtítulo. */
  card: [string, string];
  build(c: BuildCtx): void;
  spawn: [number, number];
  homes: Partial<Record<CharName, [number, number]>>;
  terminal: { x: number; y: number; mark: [number, number] };
  flavor: StoryFlavor[];
  atmosphere?(act: number): Atmosphere;
  routines?: Partial<Record<CharName, Routine[]>>;
  /** Tazas y cafeteras de las que sale vapor. */
  steam?: [number, number][];
}

/** Lo que una escena final puede hacer con el cuarto y los personajes. */
export interface FinaleCtx {
  scene: Phaser.Scene;
  sprites: Partial<Record<CharName, Phaser.GameObjects.Sprite>>;
  /** Los objetos animados del cuarto, por nombre (pantalla, mapa, público...). */
  props: Record<string, Phaser.GameObjects.Sprite>;
  hop(s: Phaser.GameObjects.Sprite): void;
  bubble(s: Phaser.GameObjects.Sprite, e: EmoteName): void;
  wait(ms: number): Promise<void>;
}

// ------------------------------------------------------------------ pintar

/** Suelo de baldosas a cuadros. */
export function tiles(c: BuildCtx, a: number, b: number, joint: number, size = 16) {
  const g = c.scene.add.graphics().setDepth(0);
  for (let y = FLOOR_TOP, r = 0; y < FLOOR_BOTTOM; y += size, r++)
    for (let x = 0, k = 0; x < ROOM_W; x += size, k++) {
      g.fillStyle((r + k) % 2 ? a : b, 1).fillRect(x, y, size, size);
      g.fillStyle(joint, 1).fillRect(x, y + size - 1, size, 1).fillRect(x + size - 1, y, 1, size);
    }
  return g;
}

/** Tablas de madera, con las juntas escalonadas. */
export function planks(c: BuildCtx, a: number, b: number, joint: number) {
  const g = c.scene.add.graphics().setDepth(0);
  for (let y = FLOOR_TOP, row = 0; y < FLOOR_BOTTOM; y += 8, row++) {
    g.fillStyle(row % 2 ? a : b, 1).fillRect(0, y, ROOM_W, 8);
    g.fillStyle(joint, 1).fillRect(0, y + 7, ROOM_W, 1);
    for (let x = (row * 23) % 48; x < ROOM_W; x += 48) g.fillStyle(joint, 1).fillRect(x, y, 1, 7);
  }
  return g;
}

/** Moqueta lisa con un punteado. */
export function carpet(c: BuildCtx, base: number, dot: number) {
  const g = c.scene.add.graphics().setDepth(0);
  g.fillStyle(base, 1).fillRect(0, FLOOR_TOP, ROOM_W, FLOOR_BOTTOM - FLOOR_TOP);
  for (let y = FLOOR_TOP; y < FLOOR_BOTTOM; y += 2) for (let x = (y * 5) % 6; x < ROOM_W; x += 6) g.fillStyle(dot, 1).fillRect(x, y, 1, 1);
  return g;
}

/** Pared lisa con una franja y un zócalo. */
export function wall(c: BuildCtx, base: number, stripe: number, skirting: number) {
  const w = c.scene.add.graphics().setDepth(2);
  w.fillStyle(base, 1).fillRect(0, 0, ROOM_W, FLOOR_TOP);
  w.fillStyle(stripe, 1).fillRect(0, 24, ROOM_W, 2);
  w.fillStyle(skirting, 1).fillRect(0, 34, ROOM_W, 6);
  w.fillStyle(0x1c1830, 1).fillRect(0, 39, ROOM_W, 1);
  return w;
}

/** Un objeto animado; queda guardado con su nombre para las escenas finales. */
export function anim(c: BuildCtx, key: string, x: number, y: number, play: string | null, depthY = y, name?: string) {
  const s = c.scene.add.sprite(x, y, key, 0).setOrigin(0, 0).setDepth(100 + depthY);
  if (play) s.play(play);
  if (name) (c.scene.data.get("props") as Record<string, Phaser.GameObjects.Sprite>)[name] = s;
  return s;
}

/** Vapor que sube de una taza o una cafetera: píxeles que suben y se desvanecen. */
export function steam(scene: Phaser.Scene, x: number, y: number) {
  scene.time.addEvent({
    delay: 700 + Math.random() * 300,
    loop: true,
    callback: () => {
      const p = scene.add.rectangle(x + Math.floor(Math.random() * 3) - 1, y, 1, 1, 0xf7f7f2, 0.7).setOrigin(0, 0).setDepth(20001);
      scene.tweens.add({
        targets: p,
        y: y - 9,
        x: p.x + (Math.random() < 0.5 ? -1 : 1),
        alpha: 0,
        duration: 1600,
        ease: "Stepped",
        easeParams: [6],
        onComplete: () => p.destroy(),
      });
    },
  });
}

/** Un fuego artificial pixelado que estalla en (x, y): chispas en estrella que caen. */
export function firework(scene: Phaser.Scene, x: number, y: number, color: number, depth = 10004) {
  const n = 12;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const r = 7 + Math.random() * 4;
    const p = scene.add.rectangle(x, y, 1, 1, color, 1).setOrigin(0, 0).setDepth(depth);
    scene.tweens.add({
      targets: p,
      x: x + Math.round(Math.cos(a) * r),
      y: y + Math.round(Math.sin(a) * r) + 3,
      alpha: 0,
      duration: 900 + Math.random() * 300,
      ease: "Stepped",
      easeParams: [7],
      onComplete: () => p.destroy(),
    });
  }
  const core = scene.add.rectangle(x - 1, y - 1, 3, 3, 0xfff4c9, 1).setOrigin(0, 0).setDepth(depth);
  scene.tweens.add({ targets: core, alpha: 0, duration: 260, onComplete: () => core.destroy() });
}
