// La casa de Margarita, en Elmwood: salón con piano, estanterías y su vieja
// terminal. Aquí se hacen los ejercicios de práctica de cada sesión.
import Phaser from "phaser";
import { VIEW_H, VIEW_W, charFrame, type Dir } from "../config";
import { MISSIONS, type Line } from "../game/missions";
import { save, writeSave } from "../game/state";
import { trainingById, type TrainingSet } from "../game/training";
import { playDialog, isDialogOpen } from "../ui/dialog";
import { openTerminal } from "../ui/terminal";
import { setClock, setObjective, setPrompt, hudVisible, setNotebookAction } from "../ui/hud";
import { fadeOut, showCard } from "../ui/fade";
import { setPauseHooks } from "../ui/pause";
import { sfx } from "../audio/sfx";

const ROOM_W = 320;
const FLOOR_TOP = 40;
const FLOOR_BOTTOM = 184;
const ROOM_H = 192;
const EXIT = { x0: 144, x1: 176 };
const kenney = (col: number, row: number) => row * 27 + col;

interface Rect { x: number; y: number; w: number; h: number }
interface Thing { id: string; x: number; y: number; r: number; label: () => string | null; use: () => Promise<void> | void }

export class HouseScene extends Phaser.Scene {
  private set!: TrainingSet;
  private solids: Rect[] = [];
  private things: Thing[] = [];
  private player!: Phaser.GameObjects.Sprite;
  private shadow!: Phaser.GameObjects.Image;
  private marga!: Phaser.GameObjects.Sprite;
  private marker!: Phaser.GameObjects.Sprite;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private facing: Dir = "up";
  private busy = false;
  private near: Thing | null = null;
  private lastClose = 0;
  private stepTimer = 0;

  constructor() {
    super("house");
  }

  init(data: { set: string }): void {
    this.set = trainingById(data.set)!;
    this.solids = [];
    this.things = [];
    this.busy = true;
    this.facing = "up";
  }

  private get solved() {
    return Math.min(save.training[this.set.id] ?? 0, this.set.exercises.length);
  }
  private get finished() {
    return this.solved >= this.set.exercises.length;
  }

  create(): void {
    const cam = this.cameras.main;
    cam.setBackgroundColor("#07080f");
    cam.setScroll(-(VIEW_W - ROOM_W) / 2, -(VIEW_H - ROOM_H) / 2 - 4);
    cam.roundPixels = true;
    this.buildRoom();

    this.shadow = this.add.image(0, 0, "shadow").setOrigin(0.5, 0.5).setDepth(99);
    this.player = this.add.sprite(160, 200, "chars", charFrame("sam", "up")).setOrigin(0.5, 1);
    this.marga = this.add.sprite(232, 92, "chars", charFrame("margarita", "down")).setOrigin(0.5, 1).setDepth(100 + 92);
    this.add.image(232, 91, "shadow").setDepth(99);
    this.solid(225, 86, 14, 8);
    this.marker = this.add.sprite(0, 0, "marker").play("marker-bob").setDepth(20000).setVisible(false);

    this.defineThings();

    const kb = this.input.keyboard!;
    kb.disableGlobalCapture();
    this.keys = kb.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT", false) as Record<string, Phaser.Input.Keyboard.Key>;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.repeat) return;
      const t = ev.target as HTMLElement | null;
      if (t && (t.closest(".term") || t.tagName === "BUTTON")) return;
      if (["KeyE", "Space", "Enter"].includes(ev.code)) void this.interact();
    };
    window.addEventListener("keydown", onKey);
    const unstick = () => this.input.keyboard?.resetKeys();
    window.addEventListener("blur", unstick);
    document.addEventListener("visibilitychange", unstick);
    document.addEventListener("fullscreenchange", unstick);
    this.events.once("shutdown", () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", unstick);
      document.removeEventListener("visibilitychange", unstick);
      document.removeEventListener("fullscreenchange", unstick);
    });
    setNotebookAction(null);
    setPauseHooks(
      {
        freeze: (v) => {
          this.input.keyboard?.resetKeys();
          if (v) this.scene.pause();
          else this.scene.resume();
        },
        toTitle: async () => {
          await fadeOut();
          this.scene.start("lab", { mode: "title" });
        },
      },
      () => this.busy,
    );
    void this.arrive();
  }

  // ------------------------------------------------------------------ construcción

  private img(key: string, x: number, y: number, frame?: number) {
    return this.add.image(x, y, key, frame).setOrigin(0, 0);
  }

  private prop(key: string, x: number, y: number, frame?: number) {
    const o = this.img(key, x, y, frame);
    o.setDepth(100 + y + o.height);
    return o;
  }

  private solid(x: number, y: number, w: number, h: number) {
    this.solids.push({ x, y, w, h });
  }

  private buildRoom(): void {
    const g = this.add.graphics().setDepth(0);
    // suelo de tablas de madera, con las juntas escalonadas
    for (let y = FLOOR_TOP, row = 0; y < FLOOR_BOTTOM; y += 8, row++) {
      g.fillStyle(row % 2 ? 0x8a5a3a : 0x93623f, 1).fillRect(0, y, ROOM_W, 8);
      g.fillStyle(0x5e3c26, 1).fillRect(0, y + 7, ROOM_W, 1);
      g.fillStyle(0xa8754c, 1).fillRect(0, y, ROOM_W, 1);
      for (let x = (row * 19) % 40; x < ROOM_W; x += 40 + ((row * 7) % 12)) {
        g.fillStyle(0x5e3c26, 1).fillRect(x, y, 1, 7);
        if ((x + row) % 3 === 0 && x + 16 < ROOM_W) g.fillStyle(0x7a4e32, 1).fillRect(x + 12, y + 3, 4, 1);
      }
    }
    // papel pintado verde salvia con rayas y un friso de madera
    const w = this.add.graphics().setDepth(2);
    w.fillStyle(0x6b8f71, 1).fillRect(0, 0, ROOM_W, FLOOR_TOP);
    for (let x = 0; x < ROOM_W; x += 8) {
      w.fillStyle(0x5f8265, 1).fillRect(x, 0, 2, 28);
      w.fillStyle(0x7da583, 1).fillRect(x + 4, 4 + ((x / 8) % 2) * 10, 1, 2);
    }
    w.fillStyle(0xc08a5a, 1).fillRect(0, 26, ROOM_W, 2);
    w.fillStyle(0x8a5a36, 1).fillRect(0, 28, ROOM_W, 12);
    for (let x = 4; x < ROOM_W; x += 20) w.fillStyle(0x744a2c, 1).fillRect(x, 30, 14, 8);
    w.fillStyle(0x5e3c26, 1).fillRect(0, 39, ROOM_W, 1);
    this.add.rectangle(0, FLOOR_TOP, ROOM_W, 3, 0x1c1830, 0.3).setOrigin(0, 0).setDepth(1);
    // marco de la habitación
    for (let y = -8; y < ROOM_H; y += 16) {
      this.img("wall_cap_v", -8, y).setDepth(5000);
      this.img("wall_cap_v", ROOM_W, y).setDepth(5000);
    }
    for (let x = 0; x < ROOM_W; x += 16) if (x < EXIT.x0 || x >= EXIT.x1) this.img("wall_cap_h", x, FLOOR_BOTTOM).setDepth(5000);
    this.img("wall_cap_h", -8, -8).setDepth(5000).setScale(21, 1);
    this.add.rectangle(EXIT.x0, FLOOR_BOTTOM, 32, 8, 0x4a2e1e).setOrigin(0, 0).setDepth(1);

    // en la pared: cuadros, ventana y reloj
    this.img("kenney", 20, 6, kenney(19, 12)).setDepth(3);
    this.img("kenney", 40, 6, kenney(20, 12)).setDepth(3);
    this.img("kenney", 56, 6, kenney(21, 12)).setDepth(3);
    this.img("window", 120, 2, [4, 5].includes(this.set.exercises[0].act) ? 2 : 0).setDepth(3);
    this.img("clock", 160, 8).setDepth(3);
    this.img("kenney", 252, 6, kenney(19, 14)).setDepth(3);
    this.img("kenney", 274, 6, kenney(19, 13)).setDepth(3);

    // piano vertical contra la pared
    this.prop("kenney", 16, 24, kenney(23, 8));
    this.prop("kenney", 32, 24, kenney(24, 8));
    this.prop("kenney", 16, 40, kenney(23, 9));
    this.prop("kenney", 32, 40, kenney(24, 9));
    this.prop("chair", 24, 58);
    this.solid(16, 44, 32, 12);
    // estanterías de libros
    this.prop("kenney", 64, 26, kenney(20, 17));
    this.prop("kenney", 80, 26, kenney(21, 17));
    this.prop("kenney", 96, 26, kenney(19, 17));
    this.solid(64, 34, 48, 8);
    // escritorio con la terminal de Margarita
    this.prop("desk", 196, 46);
    this.add.sprite(204, 36, "terminal", 0).setOrigin(0, 0).setDepth(100 + 72).play("term-on");
    this.prop("lamp", 226, 44);
    this.solid(196, 56, 48, 14);
    // rincón de lectura: dos sillones y una mesita con té entre ellos
    this.prop("kenney", 120, 100, kenney(14, 9));
    this.solid(120, 106, 16, 10);
    this.prop("table", 140, 102);
    this.prop("mug", 149, 103);
    this.solid(140, 108, 26, 10);
    this.prop("kenney", 170, 100, kenney(14, 9)).setFlipX(true);
    this.solid(170, 106, 16, 10);
    // plantas
    this.prop("kenney", 296, 26, kenney(16, 0));
    this.solid(298, 36, 12, 6);
    this.prop("kenney", 2, 160, kenney(17, 0));
    this.solid(4, 170, 12, 6);
    this.prop("kenney", 300, 150, kenney(16, 0));
    this.solid(302, 160, 12, 6);
  }

  private defineThings(): void {
    const say = (lines: Line[]) => this.talk(lines);
    this.things.push(
      {
        id: "marga", x: 232, y: 98, r: 14,
        label: () => "Hablar con Margarita",
        use: () => this.talkMarga(),
      },
      {
        id: "terminal", x: 216, y: 74, r: 14,
        label: () => (this.finished ? "Terminal de Margarita" : `Ejercicio ${this.solved + 1} de ${this.set.exercises.length}`),
        use: () => this.useTerminal(),
      },
      {
        id: "piano", x: 32, y: 64, r: 16,
        label: () => "Piano",
        use: async () => {
          for (let i = 0; i < 5; i++) this.time.delayedCall(i * 140, () => sfx("blip"));
          await say([
            { who: "sam", text: "Do, re, mi... y ahí se acaba mi repertorio." },
            { who: "margarita", text: "Con escalas se empieza. Igual que con los bucles." },
          ]);
        },
      },
      {
        id: "books", x: 88, y: 48, r: 16,
        label: () => "Estantería",
        use: () => say([{ who: "sam", text: "Manuales de FORTRAN, de COBOL, partituras de Chopin y una novela de Agatha Christie. Todo subrayado." }]),
      },
      {
        id: "tea", x: 153, y: 124, r: 12,
        label: () => "Té",
        use: () => say([{ who: "sam", text: "Té de manzanilla. Todavía caliente." }]),
      },
      {
        id: "door", x: 160, y: 182, r: 14,
        label: () => "Volver al laboratorio",
        use: () => this.leave(),
      },
    );
  }

  // ------------------------------------------------------------------ flujo

  private async arrive(): Promise<void> {
    // la tarjeta va sobre negro, antes de ver la casa (showCard abre la escena al terminar)
    hudVisible(false);
    await showCard("Casa de Margarita", "Elmwood, Berkeley");
    hudVisible(true);
    setClock("17:30");
    this.refresh();
    this.player.play("sam-walk-up");
    await new Promise<void>((r) => this.tweens.add({ targets: this.player, y: 150, duration: 900, onComplete: () => r() }));
    this.player.anims.stop();
    this.player.setFrame(charFrame("sam", "up"));
    if (this.solved === 0) await this.talk(this.set.welcome);
    this.busy = false;
    this.refresh();
  }

  private refresh(): void {
    const n = this.set.exercises.length;
    if (this.finished) {
      setObjective(this.set.title.toUpperCase(), "Vuelve al laboratorio.");
      this.pointAt(160, 172);
    } else {
      setObjective(this.set.title.toUpperCase(), `Ejercicios de Margarita: ${this.solved} de ${n}. Usa su terminal.`);
      this.pointAt(213, 30);
    }
  }

  private pointAt(x: number, y: number): void {
    this.marker.setPosition(x, y).setVisible(true);
  }

  private async talk(lines: Line[]): Promise<void> {
    this.busy = true;
    this.player.anims.stop();
    setPrompt(null);
    await playDialog(lines, (line) => {
      if (line.who === "margarita") this.bubble(this.marga, line.mood);
      if (line.who === "sam") this.bubble(this.player, line.mood);
    });
    this.lastClose = performance.now();
    this.busy = false;
  }

  private bubble(target: Phaser.GameObjects.Sprite, mood?: string): void {
    const frame = { sorpresa: 0, serio: 2, alegre: 3 }[mood ?? ""];
    if (frame === undefined) return;
    const e = this.add.sprite(target.x, target.y - 30, "emotes", frame).setDepth(20003);
    this.tweens.add({ targets: e, y: e.y - 3, duration: 200, ease: "Back.Out" });
    this.time.delayedCall(1600, () => e.destroy());
  }

  private async talkMarga(): Promise<void> {
    this.marga.setFrame(charFrame("margarita", this.player.x < this.marga.x - 6 ? "left" : this.player.x > this.marga.x + 6 ? "right" : this.player.y > this.marga.y ? "down" : "up"));
    if (this.finished) {
      await this.talk([{ who: "margarita", text: "Anda, vuelve con Ruth. Y saluda a Byte de mi parte." }]);
    } else {
      const ex = this.set.exercises[this.solved];
      await this.talk([
        { who: "margarita", text: `El siguiente se llama «${ex.title}». Está en mi terminal. Si te atascas, pide una pista: no muerdo.` },
      ]);
    }
    this.time.delayedCall(2500, () => this.marga.setFrame(charFrame("margarita", "down")));
  }

  private async useTerminal(): Promise<void> {
    if (this.finished) {
      await this.talk([{ who: "sam", text: "Ya hice todos los ejercicios de hoy." }]);
      return;
    }
    const ex = this.set.exercises[this.solved];
    const before = MISSIONS.findIndex((m) => m.id === this.set.before);
    this.busy = true;
    this.input.keyboard!.enabled = false;
    hudVisible(false);
    const solved = await openTerminal(ex, { training: { vocabAt: Math.max(0, before - 1) } });
    this.lastClose = performance.now();
    this.input.keyboard!.enabled = true;
    this.input.keyboard!.resetKeys();
    hudVisible(true);
    this.busy = false;
    if (!solved) return;
    save.training[this.set.id] = this.solved + 1;
    writeSave(save);
    await this.talk(ex.debrief);
    if (this.finished) {
      sfx("pin");
      await this.talk(this.set.farewell);
    }
    this.refresh();
  }

  private async leave(): Promise<void> {
    if (!this.finished) {
      await this.talk([{ who: "margarita", text: "¿Ya te vas? Puedes volver cuando quieras, pero Ruth no te dará trabajo hasta que termines." }]);
    }
    this.busy = true;
    setPrompt(null);
    this.player.play("sam-walk-down");
    await new Promise<void>((r) => this.tweens.add({ targets: this.player, y: 204, duration: 600, onComplete: () => r() }));
    await fadeOut();
    hudVisible(false);
    this.scene.start("travel", { to: "lab", set: this.set.id });
  }

  private async interact(): Promise<void> {
    if (this.busy || isDialogOpen()) return;
    if (performance.now() - this.lastClose < 400) return;
    if (!this.near) return;
    sfx("select");
    const dx = this.near.x - this.player.x;
    const dy = this.near.y - this.player.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      this.facing = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
      this.player.anims.stop();
      this.player.setFrame(charFrame("sam", this.facing));
    }
    await this.near.use();
    this.lastClose = performance.now();
  }

  // ------------------------------------------------------------------ movimiento

  private blocked(x: number, y: number): boolean {
    const fx = x - 5, fy = y - 4, fw = 10, fh = 4;
    if (fx < 2 || fx + fw > ROOM_W - 2 || fy < FLOOR_TOP + 4) return true;
    if (fy + fh > FLOOR_BOTTOM - 1) return true;
    return this.solids.some((r) => fx < r.x + r.w && fx + fw > r.x && fy < r.y + r.h && fy + fh > r.y);
  }

  update(_t: number, dtMs: number): void {
    const dt = Math.min(dtMs, 50) / 1000;
    const k = this.keys;
    let vx = 0, vy = 0;
    if (!this.busy && !isDialogOpen()) {
      if (k.A.isDown || k.LEFT.isDown) vx -= 1;
      if (k.D.isDown || k.RIGHT.isDown) vx += 1;
      if (k.W.isDown || k.UP.isDown) vy -= 1;
      if (k.S.isDown || k.DOWN.isDown) vy += 1;
    }
    if (vx || vy) {
      const len = Math.hypot(vx, vy);
      const nx = this.player.x + (vx / len) * 64 * dt;
      const ny = this.player.y + (vy / len) * 64 * dt;
      if (!this.blocked(nx, this.player.y)) this.player.x = nx;
      if (!this.blocked(this.player.x, ny)) this.player.y = ny;
      const dir: Dir = Math.abs(vx) > Math.abs(vy) ? (vx < 0 ? "left" : "right") : vy < 0 ? "up" : "down";
      if (dir !== this.facing || !this.player.anims.isPlaying) {
        this.facing = dir;
        this.player.play(`sam-walk-${dir}`, true);
      }
      this.stepTimer += dt;
      if (this.stepTimer > 0.26) {
        this.stepTimer = 0;
        sfx("step");
      }
    } else if (this.player.anims.isPlaying && !this.busy) {
      this.player.anims.stop();
      this.player.setFrame(charFrame("sam", this.facing));
    }
    this.player.setDepth(100 + this.player.y);
    this.shadow.setPosition(Math.round(this.player.x), Math.round(this.player.y) - 1);

    let best: Thing | null = null;
    let bestD = Infinity;
    for (const t of this.things) {
      const d = Math.hypot(t.x - this.player.x, t.y - this.player.y);
      if (d < t.r + 6 && d < bestD && t.label()) {
        best = t;
        bestD = d;
      }
    }
    this.near = best;
    if (!this.busy && !isDialogOpen()) setPrompt(best ? best.label() : null);
  }
}
