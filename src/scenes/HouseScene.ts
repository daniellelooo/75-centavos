// El lugar del mentor de cada sesión de práctica: la casa de Margarita, el garaje
// de Gus o el cuarto de Benny. La mecánica es la misma (llegar, hacer los tres
// ejercicios en su terminal, volver); lo propio de cada lugar está en places.ts.
import Phaser from "phaser";
import { VIEW_H, VIEW_W, charFrame, type Dir } from "../config";
import { MISSIONS, type Line } from "../game/missions";
import { save, writeSave } from "../game/state";
import { trainingById, type TrainingSet } from "../game/training";
import { playDialog, isDialogOpen } from "../ui/dialog";
import { openTerminal } from "../ui/terminal";
import { openNotebook, isNotebookOpen } from "../ui/notebook";
import { setClock, setObjective, setPrompt, hudVisible, setNotebookAction } from "../ui/hud";
import { fadeOut, showCard } from "../ui/fade";
import { setPauseHooks } from "../ui/pause";
import { sfx } from "../audio/sfx";
import { MENTORS } from "../game/mentors";
import { PLACES, ROOM_W, FLOOR_TOP, FLOOR_BOTTOM, type PlaceDef } from "./places";

const ROOM_H = 192;

interface Rect { x: number; y: number; w: number; h: number }
interface Thing { id: string; x: number; y: number; r: number; label: () => string | null; use: () => Promise<void> | void }

export class HouseScene extends Phaser.Scene {
  private set!: TrainingSet;
  private place!: PlaceDef;
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
  /** Hueco que ocupa el mentor: se mueve con él. */
  private margaSolid!: Rect;
  /** El mentor está ocupado (caminando o haciendo algo): no se le interrumpe con otra rutina. */
  private margaBusy = false;
  private margaShadow!: Phaser.GameObjects.Image;
  /** Sam está hablando con ella: se queda quieta. */
  private margaTalking = false;

  constructor() {
    super("house");
  }

  init(data: { set: string }): void {
    this.set = trainingById(data.set)!;
    this.place = PLACES[this.set.mentor];
    this.margaBusy = false;
    this.margaTalking = false;
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
    const act = this.set.exercises[0].act;
    this.place.build({
      scene: this,
      img: (k, x, y, f) => this.img(k, x, y, f),
      prop: (k, x, y, f) => this.prop(k, x, y, f),
      solid: (x, y, w, h) => this.solid(x, y, w, h),
      act,
    });

    this.shadow = this.add.image(0, 0, "shadow").setOrigin(0.5, 0.5).setDepth(99);
    this.player = this.add.sprite(160, 200, "chars", charFrame("sam", "up")).setOrigin(0.5, 1);
    const [hx, hy] = this.place.home;
    this.marga = this.add.sprite(hx, hy, "chars", charFrame(this.place.mentor, "down")).setOrigin(0.5, 1).setDepth(100 + hy);
    this.margaShadow = this.add.image(hx, hy - 1, "shadow").setDepth(99);
    this.margaSolid = { x: hx - 7, y: hy - 6, w: 14, h: 8 };
    this.solids.push(this.margaSolid);
    this.marker = this.add.sprite(0, 0, "marker").play("marker-bob").setDepth(20000).setVisible(false);

    this.defineThings();

    const kb = this.input.keyboard!;
    kb.disableGlobalCapture();
    this.keys = kb.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT", false) as Record<string, Phaser.Input.Keyboard.Key>;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.repeat) return;
      const t = ev.target as HTMLElement | null;
      // escribiendo en un campo (por ejemplo, el correo al entrar): no son atajos del juego
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.closest(".cl-rootBox, .cl-modalBackdrop"))) return;
      if (t && (t.closest(".term") || t.closest(".notebook") || t.tagName === "BUTTON")) return;
      if (ev.code === "KeyC") return void this.openCuaderno();
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
    setNotebookAction(() => void this.openCuaderno());
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
        notebook: () => void this.openCuaderno(),
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

  private defineThings(): void {
    const name = MENTORS[this.set.mentor].name;
    const t = this.place.terminal;
    this.things.push(
      {
        id: "marga", x: this.place.home[0], y: this.place.home[1] + 6, r: 14,
        label: () => `Hablar con ${name}`,
        use: () => this.talkMarga(),
      },
      {
        id: "terminal", x: t.x, y: t.y, r: 14,
        label: () => (this.finished ? `Terminal de ${name}` : `Ejercicio ${this.solved + 1} de ${this.set.exercises.length}`),
        use: () => this.useTerminal(),
      },
      ...this.place.flavor.map((f) => ({
        id: f.id, x: f.x, y: f.y, r: f.r,
        label: () => f.label,
        use: async () => {
          f.sound?.();
          await this.talk(f.lines);
        },
      })),
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
    const [cardTitle, cardSub] = MENTORS[this.set.mentor].card;
    await showCard(cardTitle, cardSub);
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
    this.startRoutine();
  }

  // ------------------------------------------------------------------ rutina del mentor

  /** Camina por una ruta de puntos (en L) con su animación. */
  private walkMarga(points: [number, number][]): Promise<void> {
    return new Promise((resolve) => {
      const step = (i: number) => {
        if (i >= points.length) {
          this.marga.anims.stop();
          return resolve();
        }
        const [x, y] = points[i];
        const dx = x - this.marga.x, dy = y - this.marga.y;
        const d = Math.hypot(dx, dy);
        if (d < 1) return step(i + 1);
        const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
        this.marga.play(`${this.place.mentor}-walk-${dir}`, true);
        this.tweens.add({ targets: this.marga, x, y, duration: (d / 34) * 1000, onComplete: () => step(i + 1) });
      };
      step(0);
    });
  }

  private face(dir: Dir): void {
    this.marga.setFrame(charFrame(this.place.mentor, dir));
  }

  /** Cada 25 a 45 segundos hace algo de su rutina y vuelve a su sitio. Nunca repite seguido. */
  private startRoutine(): void {
    const ctx = {
      walk: (p: [number, number][]) => this.walkMarga(p),
      face: (d: Dir) => this.face(d),
      bubble: (mood: "alegre" | "serio" | "sorpresa") => this.bubble(this.marga, mood),
      wait: (ms: number) => new Promise<void>((r) => this.time.delayedCall(ms, () => r())),
      sfx: (n: Parameters<typeof sfx>[0]) => sfx(n),
    };
    const acts = this.place.routine;
    let last = "";
    const runOne = async (pick: (typeof acts)[number]) => {
      last = pick.name;
      this.margaBusy = true;
      await pick.run(ctx);
      this.face("down");
      this.margaBusy = false;
      next();
    };
    const next = () => {
      this.time.delayedCall(25000 + Math.random() * 20000, () => {
        if (!this.scene.isActive() || this.margaTalking || this.margaBusy) return next();
        const options = acts.filter((a) => a.name !== last);
        void runOne(options[Math.floor(Math.random() * options.length)]);
      });
    };
    // la primera vez, pronto: que se note que el lugar está vivo
    this.time.delayedCall(9000 + Math.random() * 4000, () => {
      if (this.margaTalking || this.margaBusy) return next();
      void runOne(acts[0]);
    });
  }

  private refresh(): void {
    const n = this.set.exercises.length;
    if (this.finished) {
      setObjective(this.set.title.toUpperCase(), "Vuelve al laboratorio.");
      this.pointAt(160, 172);
    } else {
      setObjective(this.set.title.toUpperCase(), `Ejercicios de ${MENTORS[this.set.mentor].name}: ${this.solved} de ${n}. Usa su terminal.`);
      this.pointAt(...this.place.terminal.mark);
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
      if (line.who === this.place.mentor) this.bubble(this.marga, line.mood);
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
    if (this.margaBusy) {
      // está a mitad de algo: contesta sin dejarlo a medias
      await this.talk([{ who: this.place.mentor, text: this.finished ? this.place.lines.busyDone : this.place.lines.busy }]);
      return;
    }
    this.margaTalking = true;
    this.marga.setFrame(charFrame(this.place.mentor, this.player.x < this.marga.x - 6 ? "left" : this.player.x > this.marga.x + 6 ? "right" : this.player.y > this.marga.y ? "down" : "up"));
    if (this.finished) {
      await this.talk([{ who: this.place.mentor, text: this.place.lines.done }]);
    } else {
      const ex = this.set.exercises[this.solved];
      await this.talk([{ who: this.place.mentor, text: this.place.lines.next(ex.title) }]);
    }
    this.time.delayedCall(2500, () => {
      if (!this.margaBusy) this.marga.setFrame(charFrame(this.place.mentor, "down"));
      this.margaTalking = false;
    });
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
      await this.talk([{ who: this.place.mentor, text: this.place.lines.early }]);
    }
    this.busy = true;
    setPrompt(null);
    this.player.play("sam-walk-down");
    await new Promise<void>((r) => this.tweens.add({ targets: this.player, y: 204, duration: 600, onComplete: () => r() }));
    await fadeOut();
    hudVisible(false);
    this.scene.start("travel", { to: "lab", set: this.set.id });
  }

  /** El cuaderno también se abre en casa del mentor: es buen sitio para repasar. */
  private async openCuaderno(): Promise<void> {
    if (this.busy || isDialogOpen() || isNotebookOpen() || document.querySelector(".pause")) return;
    this.busy = true;
    this.player.anims.stop();
    setPrompt(null);
    await openNotebook({
      practice: async (m, training) => {
        this.input.keyboard!.enabled = false;
        hudVisible(false);
        await openTerminal(m, training ? { training } : { practice: true });
        hudVisible(true);
        this.input.keyboard!.enabled = true;
        this.input.keyboard!.resetKeys();
      },
    });
    this.lastClose = performance.now();
    this.busy = false;
  }

  private async interact(): Promise<void> {
    if (this.busy || isDialogOpen() || isNotebookOpen()) return;
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
    this.marga.setDepth(100 + this.marga.y);
    this.margaShadow.setPosition(Math.round(this.marga.x), Math.round(this.marga.y) - 1);
    Object.assign(this.margaSolid, { x: Math.round(this.marga.x) - 7, y: Math.round(this.marga.y) - 6 });
    const mt = this.things.find((t) => t.id === "marga");
    if (mt) [mt.x, mt.y] = [this.marga.x, this.marga.y + 6];
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
