// Clima en las ventanas y decoraciones de temporada. Cada acto ocurre en un mes
// distinto y el laboratorio lo cuenta sin palabras.
import Phaser from "phaser";
import { sfx } from "../audio/sfx";

export interface WindowRect {
  x: number;
  y: number;
}

// Interior del cristal dentro de la ventana de 32x26.
const GLASS = { dx: 3, dy: 3, w: 26, h: 19 };

/** Copos que caen despacio y se desvanecen al llegar al marco. */
export function addSnow(scene: Phaser.Scene, windows: WindowRect[], night = false): void {
  const depth = night ? 10003 : 3.5;
  for (const w of windows) {
    // nieve acumulada en el alféizar
    scene.add.rectangle(w.x + 1, w.y + 22, 30, 1, 0xf7f7f2).setOrigin(0, 0).setDepth(3.6);
    scene.add.rectangle(w.x + 4, w.y + 21, 9, 1, 0xf7f7f2).setOrigin(0, 0).setDepth(3.6);
    scene.time.addEvent({
      delay: 260,
      loop: true,
      callback: () => {
        const x = w.x + GLASS.dx + Math.floor(Math.random() * GLASS.w);
        const flake = scene.add.rectangle(x, w.y + GLASS.dy, 1, 1, 0xffffff, night ? 0.6 : 0.95).setOrigin(0, 0).setDepth(depth);
        scene.tweens.add({
          targets: flake,
          y: w.y + GLASS.dy + GLASS.h - 1,
          x: x + (Math.random() < 0.5 ? -2 : 2),
          duration: 2600 + Math.random() * 1200,
          ease: "Stepped",
          easeParams: [14],
          onComplete: () => flake.destroy(),
        });
      },
    });
  }
}

/** Lluvia en diagonal: trazos de 1x3 que cruzan el cristal rápido. */
export function addRain(scene: Phaser.Scene, windows: WindowRect[], night = false): void {
  const depth = night ? 10003 : 3.5;
  for (const w of windows) {
    scene.time.addEvent({
      delay: 70,
      loop: true,
      callback: () => {
        const x = w.x + GLASS.dx + 2 + Math.floor(Math.random() * (GLASS.w - 4));
        const drop = scene.add.rectangle(x, w.y + GLASS.dy, 1, 3, 0x8fd3ff, night ? 0.35 : 0.55).setOrigin(0, 0).setDepth(depth);
        scene.tweens.add({
          targets: drop,
          y: w.y + GLASS.dy + GLASS.h - 3,
          x: x - 3,
          duration: 380,
          ease: "Stepped",
          easeParams: [5],
          onComplete: () => drop.destroy(),
        });
      },
    });
  }
}

/** Relámpagos de vez en cuando (solo de noche), con su trueno. */
export function addLightning(scene: Phaser.Scene, w: number, h: number): void {
  const flash = scene.add.rectangle(-20, -20, w + 40, h + 40, 0xdfe8ff, 0).setOrigin(0, 0).setDepth(10002);
  const strike = () => {
    scene.tweens.chain({
      targets: flash,
      tweens: [
        { alpha: 0.22, duration: 40 },
        { alpha: 0, duration: 70 },
        { alpha: 0.14, duration: 40 },
        { alpha: 0, duration: 380 },
      ],
    });
    scene.time.delayedCall(700 + Math.random() * 900, () => sfx("thunder"));
    scene.time.delayedCall(9000 + Math.random() * 12000, strike);
  };
  scene.time.delayedCall(4000 + Math.random() * 4000, strike);
}

/** Guirnalda navideña colgando del muro, con bombillas que se alternan. */
export function addXmasLights(scene: Phaser.Scene, x0: number, x1: number, y: number, night = false): void {
  const g = scene.add.graphics().setDepth(3.7);
  const bulbs: { x: number; y: number; c: number }[] = [];
  const colors = [0xe8344e, 0xfed018, 0x4ba86d, 0x2092db];
  const span = 48;
  for (let sx = x0; sx < x1; sx += span) {
    for (let i = 0; i <= span; i++) {
      const t = i / span;
      const px = sx + i;
      if (px > x1) break;
      const py = y + Math.round(Math.sin(Math.PI * t) * 4);
      g.fillStyle(0x2f4a3c, 1).fillRect(px, py, 1, 1);
      if (i % 8 === 4) bulbs.push({ x: px, y: py + 1, c: colors[bulbs.length % colors.length] });
    }
  }
  // de noche las bombillas brillan por encima de la oscuridad
  const lamps = bulbs.map((b) => scene.add.rectangle(b.x, b.y, 2, 2, b.c).setOrigin(0, 0).setDepth(night ? 10003 : 3.8));
  let phase = 0;
  scene.time.addEvent({
    delay: 600,
    loop: true,
    callback: () => {
      phase = (phase + 1) % 2;
      lamps.forEach((l, i) => l.setAlpha((i + phase) % 2 ? 1 : 0.35));
    },
  });
}
