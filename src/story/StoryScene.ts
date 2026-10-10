// Escena común de las historias nuevas (Diez días, La consulta, Código Cuervo,
// Medianoche). Un cuarto, la jugadora y dos personajes: cada misión empieza
// hablando con quien da el encargo, se resuelve en la terminal y se cierra con
// otro diálogo. Entre actos, tarjeta y narrador; al final, la pantalla de cierre.
import Phaser from "phaser";
import { EMOTE, VIEW_H, VIEW_W, charFrame, type CharName, type Dir, type EmoteName } from "../config";
import type { Line } from "../game/types";
import { playDialog, isDialogOpen } from "../ui/dialog";
import { openTerminal } from "../ui/terminal";
import { setClock, setObjective, setPrompt, hudVisible, setNotebookAction, showControls } from "../ui/hud";
import { fadeOut, showCard } from "../ui/fade";
import { setPauseHooks } from "../ui/pause";
import { showTitle } from "../ui/title";
import { el, ui } from "../ui/dom";
import { sfx } from "../audio/sfx";
import { startMusic } from "../audio/music";
import { settings } from "../game/settings";
import { formatTime } from "../game/playtime";
import { CHAR_NAMES } from "../config";
import { ROOM_W, FLOOR_TOP, FLOOR_BOTTOM } from "../scenes/places";
import { loadContent, type StoryId } from "../stories/registry";
import { STORIES, type StoryDef } from "../stories/defs";
import type { StoryContent, StoryMission } from "../stories/types";
import { StoryState } from "./state";

const ROOM_H = 192;

interface Rect { x: number; y: number; w: number; h: number }
interface Thing { id: string; x: number; y: number; r: number; label: () => string | null; use: () => Promise<void> | void }
interface Npc { who: CharName; sprite: Phaser.GameObjects.Sprite; shadow: Phaser.GameObjects.Image; talking: boolean }

/** "Doña Beatriz", "Dr. Fenton": el nombre de los diálogos, en minúsculas de frase. */
const pretty = (who: CharName) =>
  CHAR_NAMES[who]
    .toLowerCase()
    .replace(/(^|\s|\.)(\p{L})/gu, (_, a: string, b: string) => a + b.toUpperCase());

export class StoryScene extends Phaser.Scene {
  private def!: StoryDef;
  private content!: StoryContent;
  private state!: StoryState;
  private solids: Rect[] = [];
  private things: Thing[] = [];
  private player!: Phaser.GameObjects.Sprite;
  private shadow!: Phaser.GameObjects.Image;
  private npcs: Npc[] = [];
  private marker!: Phaser.GameObjects.Sprite;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private facing: Dir = "up";
  private busy = true;
  private near: Thing | null = null;
  private lastClose = 0;
  private stepTimer = 0;

  constructor() {
    super("story");
  }

  init(data: { id: StoryId }): void {
    this.def = STORIES[data.id];
    this.state = new StoryState(data.id);
    this.solids = [];
    this.things = [];
    this.npcs = [];
    this.busy = true;
    this.facing = "up";
  }

  private get save() {
    return this.state.data;
  }

  private get mission(): StoryMission | undefined {
    return this.content.missions[this.save.done];
  }

  create(): void {
    const cam = this.cameras.main;
    cam.setBackgroundColor("#07080f");
    cam.setScroll(-(VIEW_W - ROOM_W) / 2, -(VIEW_H - ROOM_H) / 2 - 4);
    cam.roundPixels = true;
    hudVisible(false);
    void this.boot();
  }

  private async boot(): Promise<void> {
    this.content = await loadContent[this.def.id]();
    this.state.meta = () => ({ rango: this.rank() });
    const act = this.mission?.act ?? this.content.acts.length;
    this.def.room.build({
      scene: this,
      img: (k, x, y, f) => this.add.image(x, y, k, f).setOrigin(0, 0),
      prop: (k, x, y, f) => {
        const o = this.add.image(x, y, k, f).setOrigin(0, 0);
        return o.setDepth(100 + y + o.height);
      },
      solid: (x, y, w, h) => this.solids.push({ x, y, w, h }),
      act,
    });
    const [sx, sy] = this.def.room.spawn;
    this.shadow = this.add.image(sx, sy - 1, "shadow").setDepth(99);
    this.player = this.add.sprite(sx, sy, "chars", charFrame(this.def.player, "up")).setOrigin(0.5, 1);
    for (const who of this.def.cast) {
      const [hx, hy] = this.def.room.homes[who]!;
      const sprite = this.add.sprite(hx, hy, "chars", charFrame(who, "down")).setOrigin(0.5, 1).setDepth(100 + hy);
      const shadow = this.add.image(hx, hy - 1, "shadow").setDepth(99);
      this.solids.push({ x: hx - 7, y: hy - 6, w: 14, h: 8 });
      this.npcs.push({ who, sprite, shadow, talking: false });
    }
    this.marker = this.add.sprite(0, 0, "marker").play("marker-bob").setDepth(20000).setVisible(false);
    this.defineThings();
    this.bindKeys();
    this.startIdle();
    // la partida de la cuenta, si la hay (sin hacer esperar más de un par de segundos)
    await Promise.race([this.state.connect(), new Promise((r) => setTimeout(r, 2500))]);
    const autosave = setInterval(() => this.state.write(), 30000);
    this.events.once("shutdown", () => clearInterval(autosave));
    this.title();
  }

  private rank(): string {
    if (this.save.finished) return "Historia completada";
    const m = this.mission;
    const act = m ? this.content.acts[m.act - 1] : undefined;
    return act ? `Acto ${act.n}: ${act.title}` : "";
  }

  // ------------------------------------------------------------------ entrada

  private bindKeys(): void {
    const kb = this.input.keyboard!;
    kb.disableGlobalCapture();
    this.keys = kb.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT", false) as Record<string, Phaser.Input.Keyboard.Key>;
    const onKey = (ev: KeyboardEvent) => {
      if (ev.repeat) return;
      const t = ev.target instanceof HTMLElement ? ev.target : null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.closest(".cl-rootBox, .cl-modalBackdrop"))) return;
      if (t && (t.closest(".term") || t.tagName === "BUTTON")) return;
      if (["KeyE", "Space", "Enter"].includes(ev.code)) void this.interact();
    };
    window.addEventListener("keydown", onKey);
    const unstick = () => this.input.keyboard?.resetKeys();
    window.addEventListener("blur", unstick);
    document.addEventListener("visibilitychange", unstick);
    this.events.once("shutdown", () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("blur", unstick);
      document.removeEventListener("visibilitychange", unstick);
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
          this.state.write();
          await fadeOut();
          this.scene.restart({ id: this.def.id });
        },
        progress: () => {
          const m = this.mission;
          return {
            html: m ? `Misión ${this.save.done + 1} de ${this.content.missions.length}: <b>${m.title}</b>` : "Historia completada",
            session: this.state.sessionMs,
            total: this.state.totalMs,
          };
        },
      },
      () => this.busy,
    );
  }

  // ------------------------------------------------------------------ flujo

  private title(): void {
    showTitle({
      canContinue: this.save.introSeen,
      texts: { kicker: this.def.kicker, title: this.def.title, sub: this.def.tagline },
      onNew: () => {
        this.state.reset();
        void this.begin();
      },
      onContinue: () => void this.begin(),
    });
  }

  private async begin(): Promise<void> {
    if (settings.music) startMusic();
    if (!this.save.introSeen) {
      await showCard(this.def.card[0], this.def.card[1]);
      hudVisible(true);
      showControls();
      await this.talk(this.content.intro);
      this.save.introSeen = true;
      this.state.write();
    }
    hudVisible(true);
    setClock(null);
    if (this.save.finished || !this.mission) {
      this.refresh();
      this.busy = false;
      this.showEnd();
      return;
    }
    await this.actGate();
    this.busy = false;
    this.refresh();
  }

  /** Presentación del acto si todavía no se vio: tarjeta con fecha y narrador. */
  private async actGate(): Promise<void> {
    const m = this.mission;
    if (!m || this.save.actIntro >= m.act) return;
    const act = this.content.acts[m.act - 1];
    hudVisible(false);
    await showCard(`Acto ${act.n}: ${act.title}`, act.date);
    hudVisible(true);
    await this.talk(act.opening);
    this.save.actIntro = m.act;
    this.state.write();
  }

  private refresh(): void {
    const m = this.mission;
    if (!m) {
      setObjective(this.def.title.toUpperCase(), "Historia completada.");
      this.marker.setVisible(false);
      return;
    }
    if (!this.save.briefed) {
      setObjective(m.title.toUpperCase(), `Habla con ${pretty(m.giver)}.`);
      const npc = this.npcs.find((n) => n.who === m.giver);
      if (npc) this.marker.setPosition(npc.sprite.x, npc.sprite.y - 32).setVisible(true);
    } else {
      setObjective(m.title.toUpperCase(), "Resuélvelo en la terminal.");
      this.marker.setPosition(...this.def.room.terminal.mark).setVisible(true);
    }
  }

  private defineThings(): void {
    const t = this.def.room.terminal;
    for (const n of this.npcs) {
      this.things.push({
        id: n.who, x: n.sprite.x, y: n.sprite.y + 6, r: 14,
        label: () => `Hablar con ${pretty(n.who)}`,
        use: () => this.talkTo(n),
      });
    }
    this.things.push({
      id: "terminal", x: t.x, y: t.y, r: 14,
      label: () => (this.mission ? (this.save.briefed ? `Terminal: ${this.mission.title}` : "Terminal") : "Terminal"),
      use: () => this.useTerminal(),
    });
    for (const f of this.def.room.flavor)
      this.things.push({ id: f.id, x: f.x, y: f.y, r: f.r, label: () => f.label, use: () => this.talk(f.lines) });
  }

  private async talkTo(n: Npc): Promise<void> {
    n.talking = true;
    const dx = this.player.x - n.sprite.x;
    const dy = this.player.y - n.sprite.y;
    n.sprite.setFrame(charFrame(n.who, Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down"));
    const m = this.mission;
    if (m && !this.save.briefed && m.giver === n.who) {
      await this.talk(m.briefing);
      this.save.briefed = true;
      this.state.write();
      this.refresh();
    } else if (m && this.save.briefed && m.giver === n.who) {
      await this.talk([{ who: n.who, text: "La terminal te espera. Cuando lo tengas, me cuentas." }]);
    } else if (m && !this.save.briefed) {
      await this.talk([{ who: n.who, text: `Ahora te necesita ${pretty(m.giver)}. Yo espero.` }]);
    } else {
      const idle = this.def.idle[n.who] ?? ["..."];
      await this.talk([{ who: n.who, text: idle[Math.floor(Math.random() * idle.length)] }]);
    }
    n.talking = false;
  }

  private async useTerminal(): Promise<void> {
    const m = this.mission;
    if (!m) {
      await this.talk([{ who: this.def.player, text: "Ya está todo hecho. La terminal puede descansar." }]);
      return;
    }
    if (!this.save.briefed) {
      await this.talk([{ who: this.def.player, text: `Primero tengo que hablar con ${pretty(m.giver)}.` }]);
      return;
    }
    this.busy = true;
    this.input.keyboard!.enabled = false;
    hudVisible(false);
    const st = this.state;
    const solved = await openTerminal(m, {
      story: {
        id: this.def.id,
        prompt: this.def.prompt,
        vocabAt: this.def.vocabAt,
        store: { drafts: st.data.drafts, hintsUsed: st.data.hintsUsed, attempts: st.data.attempts, persist: () => st.write() },
      },
    });
    this.lastClose = performance.now();
    this.input.keyboard!.enabled = true;
    this.input.keyboard!.resetKeys();
    hudVisible(true);
    this.busy = false;
    if (!solved) return;
    await this.talk(m.debrief);
    this.save.done += 1;
    this.save.briefed = false;
    this.state.write();
    if (!this.mission) {
      await this.finish();
      return;
    }
    this.busy = true;
    await this.actGate();
    this.busy = false;
    this.refresh();
  }

  private async finish(): Promise<void> {
    this.refresh();
    await this.talk(this.content.ending);
    this.save.finished = true;
    this.state.write();
    sfx("success");
    this.showEnd();
  }

  private showEnd(): void {
    const box = el("div", "title end");
    box.innerHTML = `
      <div class="kicker">HISTORIA COMPLETADA</div>
      <h1>${this.def.title.toUpperCase()}</h1>
      <div class="sub">${this.content.missions.length} misiones · ${formatTime(this.state.totalMs)} jugadas</div>
      <div class="menu">
        <a class="btn" href="/#historias">OTRAS HISTORIAS</a>
        <a class="btn" href="/retos/">PRACTICAR CON LOS RETOS</a>
        <button class="btn stay">SEGUIR AQUÍ</button>
      </div>
      <div class="foot">Personajes y nombres ficticios, inspirados en hechos reales.</div>`;
    ui.append(box);
    (box.querySelector(".stay") as HTMLButtonElement).onclick = () => box.remove();
  }

  // ------------------------------------------------------------------ diálogos

  private async talk(lines: Line[]): Promise<void> {
    const was = this.busy;
    this.busy = true;
    this.player.anims.stop();
    setPrompt(null);
    await playDialog(lines, (line) => {
      if (line.who === this.def.player) this.bubble(this.player, line.mood);
      const n = this.npcs.find((x) => x.who === line.who);
      if (n) this.bubble(n.sprite, line.mood);
    });
    this.lastClose = performance.now();
    this.busy = was && this.busy;
    if (!was) this.busy = false;
  }

  private bubble(target: Phaser.GameObjects.Sprite, mood?: string): void {
    const frame = EMOTE[mood as EmoteName];
    if (frame === undefined) return;
    const e = this.add.sprite(target.x, target.y - 30, "emotes", frame).setDepth(20003);
    this.tweens.add({ targets: e, y: e.y - 3, duration: 200, ease: "Back.Out" });
    this.time.delayedCall(1600, () => e.destroy());
  }

  /** Los personajes miran a un lado y a otro de vez en cuando; si Sam está cerca, la miran. */
  private startIdle(): void {
    const dirs: Dir[] = ["down", "left", "right", "down"];
    this.time.addEvent({
      delay: 3500,
      loop: true,
      callback: () => {
        for (const n of this.npcs) {
          if (n.talking || Math.random() < 0.55) continue;
          const d = Math.hypot(this.player.x - n.sprite.x, this.player.y - n.sprite.y);
          if (d < 40) {
            const dx = this.player.x - n.sprite.x;
            n.sprite.setFrame(charFrame(n.who, Math.abs(dx) > 8 ? (dx < 0 ? "left" : "right") : "down"));
          } else n.sprite.setFrame(charFrame(n.who, dirs[Math.floor(Math.random() * dirs.length)]));
        }
      },
    });
  }

  private async interact(): Promise<void> {
    if (this.busy || isDialogOpen() || document.querySelector(".title")) return;
    if (performance.now() - this.lastClose < 400) return;
    if (!this.near) return;
    sfx("select");
    const dx = this.near.x - this.player.x;
    const dy = this.near.y - this.player.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      this.facing = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
      this.player.anims.stop();
      this.player.setFrame(charFrame(this.def.player, this.facing));
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
    if (!this.player) return;
    const dt = Math.min(dtMs, 50) / 1000;
    const k = this.keys;
    const who = this.def.player;
    let vx = 0, vy = 0;
    if (!this.busy && !isDialogOpen() && !document.querySelector(".title:not(.end)")) {
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
        this.player.play(`${who}-walk-${dir}`, true);
      }
      this.stepTimer += dt;
      if (this.stepTimer > 0.26) {
        this.stepTimer = 0;
        sfx("step");
      }
    } else if (this.player.anims.isPlaying) {
      this.player.anims.stop();
      this.player.setFrame(charFrame(who, this.facing));
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

export { EMOTE };
