import Phaser from "phaser";
import { VIEW_H, VIEW_W, charFrame, type CharName, type Dir } from "../config";
import { MISSIONS, type Line } from "../game/missions";
import { save, writeSave } from "../game/state";
import { playDialog, isDialogOpen } from "../ui/dialog";
import { openTerminal } from "../ui/terminal";
import { setClock, setObjective, setPrompt, hudVisible } from "../ui/hud";
import { openBoard } from "../ui/board";
import { showTitle } from "../ui/title";
import { fadeOut, fadeIn, showCard } from "../ui/fade";
import { showControls } from "../ui/hud";
import { sfx } from "../audio/sfx";
import { buildLighting, buildDaylight, type Light } from "./lighting";
import { startMusic, stopMusic, isMusicOn } from "../audio/music";
import { isMuted } from "../audio/sfx";

// Medidas de la sala (en píxeles de arte, origen en la esquina superior del muro).
const ROOM_W = 416;
const FLOOR_TOP = 32;
const FLOOR_BOTTOM = 224;
const ROOM_H = 232;
const EXIT = { x0: 192, x1: 224 };

const kenney = (col: number, row: number) => row * 27 + col;

interface Rect { x: number; y: number; w: number; h: number }
interface Interactable {
  id: string;
  x: number;
  y: number;
  r: number;
  label: () => string | null;
  use: () => Promise<void> | void;
}

type Mode = "title" | "play";

export class LabScene extends Phaser.Scene {
  private mode: Mode = "play";
  private night = false;
  private player!: Phaser.GameObjects.Sprite;
  private facing: Dir = "up";
  private npcs: Partial<Record<CharName, Phaser.GameObjects.Sprite>> = {};
  private solids: Rect[] = [];
  private things: Interactable[] = [];
  private marker!: Phaser.GameObjects.Sprite;
  private cork!: Phaser.GameObjects.Image;
  private coffee!: Phaser.GameObjects.Sprite;
  private radio!: Phaser.GameObjects.Sprite;
  private cooler!: Phaser.GameObjects.Sprite;
  private catTalks = 0;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private busy = false;
  private stepTimer = 0;
  private near: Interactable | null = null;
  /** Momento en que se cerró el último diálogo: evita que la tecla que lo cierra reabra otro. */
  private lastClose = 0;

  constructor() {
    super("lab");
  }

  init(data: { mode?: Mode }): void {
    this.mode = data.mode ?? "play";
    this.night = this.mode === "title" || save.done >= 4;
    this.solids = [];
    this.things = [];
    this.npcs = {};
    this.busy = false;
  }

  create(): void {
    const cam = this.cameras.main;
    cam.setBackgroundColor("#07080f");
    cam.setScroll(-(VIEW_W - ROOM_W) / 2, -(VIEW_H - ROOM_H) / 2 - 4);
    cam.roundPixels = true;

    this.buildRoom();
    this.buildPeople();

    const lights: Light[] = this.night
      ? [
          { x: 73, y: 64, r: 58, color: [254, 170, 40], power: 1 },
          { x: 193, y: 64, r: 34, color: [254, 150, 40], power: 0.55 },
          { x: 362, y: 30, r: 62, color: [160, 200, 255], power: 0.75 },
          { x: 56, y: 18, r: 40, color: [140, 170, 255], power: 0.55 },
          { x: 302, y: 18, r: 36, color: [140, 170, 255], power: 0.5 },
          { x: 19, y: 190, r: 22, color: [255, 60, 70], power: 0.6 },
          { x: 208, y: 232, r: 44, color: [255, 220, 150], power: 0.55 },
          { x: 104, y: 66, r: 34, color: [255, 230, 160], power: 0.8 },
        ]
      : [];
    if (this.night) {
      lights.push({ x: 397, y: 98, r: 14, color: [255, 210, 80], power: isMusicOn() ? 0.6 : 0 });
      lights.push({ x: 372, y: 116, r: 12, color: [120, 190, 255], power: 0.45 });
      buildLighting(this, ROOM_W, ROOM_H, lights);
    } else {
      buildDaylight(this, [
        { x: 40, w: 32 },
        { x: 286, w: 32 },
      ]);
    }

    this.marker = this.add.sprite(0, 0, "marker").play("marker-bob").setDepth(20000).setVisible(false);

    const kb = this.input.keyboard!;
    kb.disableGlobalCapture();
    this.keys = kb.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE,ENTER", false) as Record<string, Phaser.Input.Keyboard.Key>;
    // La interacción escucha la ventana directamente: si Phaser se pierde un keyup
    // mientras la terminal está abierta, la siguiente E no se tragaría.
    const onKey = (ev: KeyboardEvent) => {
      if (ev.repeat || !["KeyE", "Space", "Enter"].includes(ev.code)) return;
      const t = ev.target as HTMLElement | null;
      if (t && (t.closest(".term") || t.tagName === "BUTTON")) return;
      void this.interact();
    };
    window.addEventListener("keydown", onKey);
    this.events.once("shutdown", () => window.removeEventListener("keydown", onKey));

    if (this.mode === "title") {
      hudVisible(false);
      this.player.setVisible(false);
      void fadeIn();
      showTitle({
        canContinue: save.introSeen,
        onNew: () => void this.startGame(true),
        onContinue: () => void this.startGame(false),
      });
    } else {
      hudVisible(true);
      void this.afterLoad();
    }
  }

  // ------------------------------------------------------------------ construcción

  private img(key: string, x: number, y: number, frame?: number) {
    return this.add.image(x, y, key, frame).setOrigin(0, 0);
  }

  /** Objeto de pie: se ordena por la base para que el jugador pase por delante o por detrás. */
  private prop(key: string, x: number, y: number, frame?: number) {
    const o = this.img(key, x, y, frame);
    o.setDepth(100 + y + o.height);
    return o;
  }

  private solid(x: number, y: number, w: number, h: number) {
    this.solids.push({ x, y, w, h });
  }

  private buildRoom(): void {
    // suelo
    for (let y = FLOOR_TOP; y < FLOOR_BOTTOM; y += 16) {
      for (let x = 0; x < ROOM_W; x += 16) {
        this.img("floor", x, y, (x * 7 + y * 13) % 5 === 0 ? 1 : 0).setDepth(0);
      }
    }
    // sombra del muro sobre el suelo
    this.add.rectangle(0, FLOOR_TOP, ROOM_W, 3, 0x1c1830, 0.35).setOrigin(0, 0).setDepth(1);
    // muro del fondo
    for (let x = 0; x < ROOM_W; x += 16) this.img("wall", x, 0).setDepth(2);
    // muros laterales e inferior
    for (let y = -8; y < ROOM_H; y += 16) {
      this.img("wall_cap_v", -8, y).setDepth(5000);
      this.img("wall_cap_v", ROOM_W, y).setDepth(5000);
    }
    for (let x = 0; x < ROOM_W; x += 16) {
      if (x >= EXIT.x0 && x < EXIT.x1) continue;
      this.img("wall_cap_h", x, FLOOR_BOTTOM).setDepth(5000);
    }
    this.img("wall_cap_h", -8, -8).setDepth(5000).setScale(27, 1);
    // umbral de la salida
    this.add.rectangle(EXIT.x0, FLOOR_BOTTOM, 32, 8, 0x2e2a48).setOrigin(0, 0).setDepth(1);

    // --- en el muro
    this.img("window", 40, 3, this.night ? 1 : 0).setDepth(3);
    this.img("window", 286, 3, this.night ? 1 : 0).setDepth(3);
    this.img("poster", 84, 6).setDepth(3);
    this.cork = this.img("corkboard", 112, 5, Math.min(save.done, 5)).setDepth(3);
    this.img("clock", 160, 7).setDepth(3);
    this.img("chalkboard", 180, 4).setDepth(3);
    this.img("calendar", 232, 8).setDepth(3);
    this.img("door", 252, -2, 1).setDepth(3);

    // --- minicomputadora (VAX) contra la pared
    ["vax_tape", "vax_panel", "vax_tape", "vax_panel", "vax_tape"].forEach((k, i) => {
      const s = this.add.sprite(330 + i * 16, 10, k).setOrigin(0, 0);
      s.setDepth(100 + 44);
      s.play({ key: k === "vax_tape" ? "vax-tape" : "vax-panel", startFrame: i % 3 });
      if (k === "vax_tape" && i === 2) s.anims.timeScale = 0.7;
    });
    this.solid(330, 30, 80, 16);

    // --- estantería y plantas (Kenney)
    this.prop("kenney", 4, 30, kenney(20, 17));
    this.prop("kenney", 20, 30, kenney(21, 17));
    this.solid(4, 36, 32, 12);
    this.prop("kenney", 4, 202, kenney(16, 0));
    this.prop("kenney", 396, 202, kenney(17, 0));
    this.solid(4, 210, 14, 10);
    this.solid(396, 210, 14, 10);

    // --- escritorio de Sam
    this.prop("desk", 56, 70);
    this.solid(56, 76, 48, 18);
    const term = this.add.sprite(64, 60, "terminal").setOrigin(0, 0).setDepth(100 + 96);
    term.play("term-on");
    this.prop("papers", 86, 72).setDepth(100 + 95);
    this.prop("mug", 92, 64).setDepth(100 + 95);
    this.prop("lamp", 96, 58, this.night ? 1 : 0).setDepth(100 + 95);
    this.prop("chair", 72, 92);
    this.solid(74, 100, 12, 8);
    this.prop("trash", 110, 96);
    this.solid(110, 102, 10, 6);

    // --- escritorio de Ruth
    this.prop("desk", 176, 70);
    this.solid(176, 76, 48, 18);
    const t2 = this.add.sprite(184, 60, "terminal", this.night ? 2 : 0).setOrigin(0, 0).setDepth(100 + 96);
    if (!this.night) t2.play({ key: "term-on", startFrame: 1 });
    this.prop("phone", 206, 72).setDepth(100 + 95);
    this.prop("papers", 210, 62).setDepth(100 + 94);
    this.prop("chair", 192, 92);
    this.solid(194, 100, 12, 8);

    // --- impresora
    this.prop("table", 296, 54);
    this.solid(296, 58, 26, 14);
    const pr = this.add.sprite(299, 42, "printer").setOrigin(0, 0).setDepth(100 + 72);
    if (!this.night) pr.play("printer-run");

    // --- rincón del café
    this.prop("kenney", 8, 194, kenney(0, 12));
    this.prop("kenney", 24, 194, kenney(1, 12));
    this.prop("kenney", 40, 194, kenney(8, 12));
    this.prop("kenney", 56, 194, kenney(2, 12));
    this.prop("kenney", 74, 178, kenney(11, 15));
    this.prop("kenney", 74, 194, kenney(11, 16));
    this.solid(8, 196, 84, 28);
    this.coffee = this.add.sprite(10, 180, "coffee", 1).setOrigin(0, 0).setDepth(100 + 212);
    this.prop("mug", 28, 190).setDepth(100 + 212);

    // --- archivadores
    this.prop("filing", 382, 102);
    this.prop("filing", 397, 102);
    this.solid(382, 116, 30, 12);

    // --- alfombra
    this.img("rug", 176, 140).setDepth(1);

    // --- Byte, la gata, durmiendo en la alfombra
    this.add.sprite(199, 149, "cat").setOrigin(0, 0).setDepth(100 + 162).play("cat-sleep");
    this.solid(200, 153, 17, 8);

    // --- telescopio de Sam junto a la ventana
    this.prop("telescope", 38, 38);
    this.solid(42, 62, 12, 6);

    // --- bebedero
    this.cooler = this.add.sprite(366, 100, "cooler", 0).setOrigin(0, 0).setDepth(100 + 126);
    this.solid(366, 118, 12, 8);

    // --- radio sobre los archivadores
    this.radio = this.add.sprite(389, 93, "radio", 0).setOrigin(0, 0).setDepth(100 + 130);
    if (isMusicOn()) this.radio.play("radio-play");

    // --- perchero con la bufanda de Sam
    this.prop("coatrack", 232, 192);
    this.solid(234, 216, 10, 6);

    // --- cajas de cintas de respaldo
    this.prop("tapebox", 352, 196);
    this.prop("tapebox", 368, 198);
    this.prop("tapebox", 360, 185).setDepth(100 + 212);
    this.solid(352, 202, 32, 14);

    // --- nota adhesiva en la terminal de Sam
    this.img("postit", 79, 61).setDepth(100 + 97);

    // --- de noche, la bicicleta con la que volvió Sam
    if (this.night) {
      this.prop("bicycle", 128, 200);
      this.solid(130, 212, 32, 8);
    }

    this.defineInteractables();
  }

  private buildPeople(): void {
    const start = { x: 208, y: 214 };
    this.player = this.add.sprite(start.x, start.y, "chars", charFrame("sam", "up")).setOrigin(0.5, 1);
    if (!this.night) {
      this.npcs.ruth = this.add.sprite(238, 100, "chars", charFrame("ruth", "left")).setOrigin(0.5, 1);
      this.npcs.kessler = this.add.sprite(261, 48, "chars", charFrame("kessler", "down")).setOrigin(0.5, 1);
      this.solid(231, 94, 14, 8);
      this.solid(254, 40, 14, 10);
      // respiración: un píxel arriba y abajo, cada uno a su ritmo
      [this.npcs.ruth, this.npcs.kessler].forEach((n, i) =>
        this.tweens.add({ targets: n, y: n!.y - 1, duration: 700 + i * 260, yoyo: true, repeat: -1, ease: "Stepped", delay: i * 300 }),
      );
      // Ruth mira alrededor de vez en cuando
      this.time.addEvent({
        delay: 3200,
        loop: true,
        callback: () => {
          const r = this.npcs.ruth;
          if (!r || this.busy) return;
          const dirs: Dir[] = ["left", "down", "left", "up"];
          r.setFrame(charFrame("ruth", Phaser.Utils.Array.GetRandom(dirs)));
        },
      });
    }
    for (const s of [this.player, ...Object.values(this.npcs)]) s?.setDepth(100 + s.y);
  }

  private defineInteractables(): void {
    const current = () => MISSIONS[save.done];
    const say = (lines: Line[]) => this.talk(lines);

    this.things.push(
      {
        id: "terminal",
        x: 80, y: 114, r: 16,
        label: () => "Usar tu terminal",
        use: () => this.useTerminal(),
      },
      {
        id: "ruth",
        x: 238, y: 104, r: 20,
        label: () => (this.night ? null : "Hablar con Ruth"),
        use: () => this.talkRuth(),
      },
      {
        id: "kessler",
        x: 261, y: 54, r: 18,
        label: () => (this.night ? null : "Hablar con Kessler"),
        use: () =>
          say(
            save.done < 3
              ? [{ who: "kessler", text: "Sam, ¿verdad? El astrónomo. Que la factura cuadre y no tendremos que hablar mucho." }]
              : [{ who: "kessler", text: "Una semana, Sam. Y un informe que yo entienda." }],
          ),
      },
      {
        id: "coffee",
        x: 24, y: 186, r: 18,
        label: () => "Servir café",
        use: () => {
          sfx("coffee");
          this.coffee.setFrame(1);
          return say([
            {
              who: "sam",
              text: this.night
                ? "Café recalentado de las siete de la tarde. Sabe a cobre. Perfecto."
                : "El café del sótano. Ruth dice que es lo único que funciona aquí sin un manual.",
            },
          ]);
        },
      },
      {
        id: "cork",
        x: 130, y: 42, r: 18,
        label: () => "Mirar el corcho",
        use: () => openBoard(MISSIONS.slice(0, save.done).map((m) => m.clue), MISSIONS.length),
      },
      {
        id: "window",
        x: 56, y: 42, r: 16,
        label: () => "Mirar por la ventana",
        use: () =>
          say([
            {
              who: "sam",
              text: this.night
                ? "Las luces de Berkeley. En algún lugar, alguien está despierto con la misma pantalla que yo."
                : "El campus en agosto. Hace dos semanas yo miraba galaxias. Hoy miro facturas.",
            },
          ]),
      },
      {
        id: "chalk",
        x: 202, y: 42, r: 18,
        label: () => "Leer la pizarra",
        use: () =>
          say([
            { who: "sam", text: "Orión, y la órbita del Halley. Pasó en febrero. El próximo será en 2061." },
            { who: "sam", text: "Para los cometas, setenta y cinco años no son nada. Para una factura, setenta y cinco centavos tampoco. En teoría." },
          ]),
      },
      {
        id: "poster",
        x: 92, y: 42, r: 12,
        label: () => "Mirar el póster",
        use: () => say([{ who: "narrador", text: "\"HALLEY 1986 — Vuelve cada 76 años.\" Alguien añadió a lápiz: \"y la VAX también se cuelga cada 76 minutos\"." }]),
      },
      {
        id: "vax",
        x: 368, y: 54, r: 22,
        label: () => "Mirar la minicomputadora",
        use: () =>
          say([
            {
              who: "sam",
              text: this.night
                ? "Las cintas giran solas. Alguien está leyendo algo. Ahora mismo."
                : "La VAX del laboratorio. Cientos de usuarios conectados por teléfono. Cobra cada segundo que la usan.",
            },
          ]),
      },
      {
        id: "printer",
        x: 309, y: 80, r: 16,
        label: () => "Revisar la impresora",
        use: () =>
          say([
            {
              who: "narrador",
              text: this.night
                ? "La impresora guarda en papel cada conexión del mes. Nadie lo lee. Hasta hoy."
                : "Papel continuo con las conexiones del día. Ruth lo archiva sin mirarlo.",
            },
          ]),
      },
      {
        id: "ruth-terminal",
        x: 200, y: 114, r: 14,
        label: () => "Terminal de Ruth",
        use: () => say([{ who: "sam", text: this.night ? "Apagada. Ruth se fue a las seis, como siempre." : "Mejor no tocar la terminal de Ruth mientras está mirando." }]),
      },
      {
        id: "calendar",
        x: 238, y: 42, r: 10,
        label: () => "Mirar el calendario",
        use: () => say([{ who: "narrador", text: "Agosto de 1986. Alguien rodeó en rojo el día de cierre de cuentas." }]),
      },
      {
        id: "cat",
        x: 208, y: 168, r: 18,
        label: () => "Acariciar a Byte",
        use: () => {
          sfx("meow");
          const day = [
            "Byte, la gata del laboratorio. Llegó sola en 1984 y nadie se atrevió a echarla.",
            "Byte ronronea. Ruth dice que es la única que entiende la VAX.",
            "Byte estira una pata y vuelve a dormirse. Envidiable.",
          ];
          const night = [
            "Byte abre un ojo. Ella también lo oyó.",
            "Byte no se ha movido de la alfombra. Es la única que no está nerviosa.",
          ];
          const pool = this.night ? night : day;
          return say([{ who: "narrador", text: pool[this.catTalks++ % pool.length] }]);
        },
      },
      {
        id: "telescope",
        x: 48, y: 74, r: 14,
        label: () => "Mirar por el telescopio",
        use: () =>
          say(
            this.night
              ? [
                  { who: "sam", text: "Saturno, bajito sobre las colinas. Los anillos caben en la punta de un dedo." },
                  { who: "sam", text: "Su luz tarda ochenta minutos en llegar. La de hunter, menos de un segundo." },
                ]
              : [{ who: "sam", text: "Mi telescopio. Lo traje del observatorio cuando se acabó la beca. De día solo apunta al campanario." }],
          ),
      },
      {
        id: "cooler",
        x: 372, y: 132, r: 12,
        label: () => "Beber agua",
        use: () => {
          sfx("water");
          this.cooler.play("cooler-bubble");
          return say([{ who: "sam", text: "Agua fría. Lo único en este sótano que no cobra por segundo." }]);
        },
      },
      {
        id: "radio",
        x: 397, y: 134, r: 12,
        label: () => (isMusicOn() ? "Apagar la radio" : "Encender la radio"),
        use: () => {
          sfx("click");
          if (isMusicOn()) {
            stopMusic();
            this.radio.anims.stop();
            this.radio.setFrame(0);
          } else if (!isMuted()) {
            startMusic();
            this.radio.play("radio-play");
          }
        },
      },
      {
        id: "coatrack",
        x: 238, y: 214, r: 12,
        label: () => "Mirar el perchero",
        use: () => say([{ who: "sam", text: "La bufanda que me tejió mi madre. Roja, de lana. En agosto. En California." }]),
      },
      {
        id: "tapes",
        x: 368, y: 196, r: 14,
        label: () => "Revisar las cintas",
        use: () => say([{ who: "narrador", text: "Cintas de respaldo, una por día. Cada noche la VAX copia todo lo que pasó. Todo." }]),
      },
      {
        id: "bicycle",
        x: 146, y: 206, r: 16,
        label: () => (this.night ? "Mirar la bicicleta" : null),
        use: () => say([{ who: "sam", text: "Doce minutos colina abajo a las dos y media de la madrugada. Nunca había pedaleado tan rápido." }]),
      },
      {
        id: "exit",
        x: 208, y: 220, r: 14,
        label: () => (save.done >= 4 || current() ? "Salida" : null),
        use: () => say([{ who: "sam", text: save.done >= 4 ? "No pienso irme ahora." : "Todavía no. Ruth me necesita." }]),
      },
    );
  }

  // ------------------------------------------------------------------ flujo de juego

  private async startGame(fresh: boolean): Promise<void> {
    await fadeOut();
    if (fresh) {
      Object.assign(save, { done: 0, briefed: false, drafts: {}, hintsUsed: {}, attempts: {}, introSeen: false, actComplete: false });
      writeSave(save);
    }
    this.scene.restart({ mode: "play" });
  }

  private async afterLoad(): Promise<void> {
    this.busy = true;
    await fadeIn();
    if (!save.introSeen) {
      await showCard("Berkeley, California", "Agosto de 1986");
      await this.talk([
        { who: "narrador", text: "Sam es astrónomo. Se acabó la beca y lo mandaron al sótano: a administrar la computadora del laboratorio." },
        { who: "narrador", text: "No sabe programar. Todavía." },
      ]);
      save.introSeen = true;
      writeSave(save);
      showControls();
    } else if (this.night && save.done === 4) {
      await showCard("02:47", "La misma noche");
    }
    this.busy = false;
    this.refreshObjective();
  }

  private refreshObjective(): void {
    const m = MISSIONS[save.done];
    this.cork.setFrame(Math.min(save.done, 5));
    setClock(this.night ? "02:47" : "09:15");
    if (!m) {
      setObjective("ACTO 1 COMPLETADO", "Revisa el corcho o vuelve a la terminal.");
      this.pointAt(null);
      return;
    }
    const needsBrief = !save.briefed && m.phase === "dia";
    if (needsBrief) {
      setObjective(m.title.toUpperCase(), "Habla con Ruth.");
      this.pointAt("ruth");
    } else {
      setObjective(m.title.toUpperCase(), "Ve a tu terminal.");
      this.pointAt("terminal");
    }
  }

  private pointAt(id: string | null): void {
    if (!id) return void this.marker.setVisible(false);
    const pos: Record<string, [number, number]> = {
      ruth: [238, 72],
      terminal: [73, 50],
    };
    const [x, y] = pos[id];
    this.marker.setPosition(x, y).setVisible(true);
  }

  private async talk(lines: Line[]): Promise<void> {
    this.busy = true;
    this.player.anims.stop();
    setPrompt(null);
    await playDialog(lines);
    this.lastClose = performance.now();
    this.busy = false;
  }

  private async talkRuth(): Promise<void> {
    const m = MISSIONS[save.done];
    const ruth = this.npcs.ruth;
    ruth?.setFrame(charFrame("ruth", this.player.x < (ruth?.x ?? 0) ? "left" : "right"));
    if (m && !save.briefed && m.phase === "dia") {
      await this.talk(m.briefing);
      save.briefed = true;
      writeSave(save);
      sfx("select");
      this.refreshObjective();
    } else if (m) {
      await this.talk([{ who: "ruth", text: "La terminal es la de la izquierda. La que zumba." }]);
    } else {
      await this.talk([{ who: "ruth", text: "Duerme algo, Sam." }]);
    }
  }

  private async useTerminal(): Promise<void> {
    const m = MISSIONS[save.done];
    if (!m) {
      await this.talk([{ who: "sistema", text: "SESION CERRADA. FIN DEL ACTO 1." }]);
      return;
    }
    if (!save.briefed) {
      if (m.phase === "noche") {
        await this.talk(m.briefing);
        save.briefed = true;
        writeSave(save);
      } else {
        await this.talk([{ who: "sam", text: "Primero debería hablar con Ruth. Ella sabe qué hay que hacer." }]);
        return;
      }
    }
    this.busy = true;
    this.input.keyboard!.enabled = false;
    hudVisible(false);
    const solved = await openTerminal(m);
    this.lastClose = performance.now();
    this.input.keyboard!.enabled = true;
    this.input.keyboard!.resetKeys();
    hudVisible(true);
    this.busy = false;
    if (!solved) return;

    await this.talk(m.debrief);
    save.done += 1;
    save.briefed = false;
    writeSave(save);
    this.cork.setFrame(Math.min(save.done, 5));
    sfx("select");

    if (save.done === 4) {
      this.busy = true;
      await fadeOut();
      this.scene.restart({ mode: "play" });
      return;
    }
    if (save.done === 5) {
      this.busy = true;
      sfx("alarm");
      this.cameras.main.shake(300, 0.004);
      await fadeOut();
      hudVisible(false);
      this.scene.start("net");
      return;
    }
    this.refreshObjective();
  }

  private async interact(): Promise<void> {
    if (this.busy || isDialogOpen() || this.mode !== "play") return;
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
    this.refreshObjective();
  }

  // ------------------------------------------------------------------ movimiento

  private blocked(x: number, y: number): boolean {
    const fx = x - 5, fy = y - 4, fw = 10, fh = 4;
    if (fx < 2 || fx + fw > ROOM_W - 2 || fy < FLOOR_TOP + 6) return true;
    if (fy + fh > FLOOR_BOTTOM - 1 && !(fx > EXIT.x0 && fx + fw < EXIT.x1 && fy + fh < FLOOR_BOTTOM + 4)) return true;
    return this.solids.some((r) => fx < r.x + r.w && fx + fw > r.x && fy < r.y + r.h && fy + fh > r.y);
  }

  update(_t: number, dtMs: number): void {
    if (this.mode !== "play") return;
    const dt = Math.min(dtMs, 50) / 1000;
    const k = this.keys;
    let vx = 0, vy = 0;
    if (!this.busy && !isDialogOpen()) {
      if (k.A.isDown || k.LEFT.isDown) vx -= 1;
      if (k.D.isDown || k.RIGHT.isDown) vx += 1;
      if (k.W.isDown || k.UP.isDown) vy -= 1;
      if (k.S.isDown || k.DOWN.isDown) vy += 1;
    }
    const speed = 64;
    if (vx || vy) {
      const len = Math.hypot(vx, vy);
      const nx = this.player.x + (vx / len) * speed * dt;
      const ny = this.player.y + (vy / len) * speed * dt;
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
    } else if (this.player.anims.isPlaying) {
      this.player.anims.stop();
      this.player.setFrame(charFrame("sam", this.facing));
    }
    this.player.setDepth(100 + this.player.y);

    // objeto interactuable más cercano
    let best: Interactable | null = null;
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
