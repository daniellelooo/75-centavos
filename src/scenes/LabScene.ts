import Phaser from "phaser";
import { VIEW_H, VIEW_W, charFrame, type CharName, type Dir } from "../config";
import { MISSIONS, ACTS, actOf, lastOfAct, missionsOfAct, type Line, type Mission } from "../game/missions";
import { save, writeSave, resetSave } from "../game/state";
import { playDialog, isDialogOpen } from "../ui/dialog";
import { openTerminal } from "../ui/terminal";
import { openNotebook, isNotebookOpen } from "../ui/notebook";
import { setNotebookAction } from "../ui/hud";
import { setClock, setObjective, setPrompt, hudVisible } from "../ui/hud";
import { openBoard } from "../ui/board";
import { showTitle } from "../ui/title";
import { fadeOut, fadeIn, showCard } from "../ui/fade";
import { showControls } from "../ui/hud";
import { sfx } from "../audio/sfx";
import { buildLighting, buildDaylight, type Light, type LightRig } from "./lighting";
import { addSnow, addRain, addLightning, addXmasLights } from "./weather";
import { startHum, setHum, stopHum } from "../audio/ambient";
import { startMusic, stopMusic, isMusicOn } from "../audio/music";
import { setPauseHooks } from "../ui/pause";
import { stageOf } from "../game/stage";
import { settings } from "../game/settings";

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
  private arrive = false;
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
  private lightSources: Light[] = [];
  private rig: LightRig | null = null;
  private lampOn = true;
  private lamp!: Phaser.GameObjects.Image;
  private termSprite!: Phaser.GameObjects.Sprite;
  private printerSprite!: Phaser.GameObjects.Sprite;
  private phoneSprite!: Phaser.GameObjects.Image;
  private shadows = new Map<Phaser.GameObjects.Sprite, Phaser.GameObjects.Image>();
  private npcSolids: Partial<Record<CharName, Rect>> = {};
  private emoteSprite: Phaser.GameObjects.Sprite | null = null;
  private emoteTarget: Phaser.GameObjects.Sprite | null = null;
  private carried: Phaser.GameObjects.Image | null = null;
  private ringTimer: Phaser.Time.TimerEvent | null = null;
  private kesslerOut = false;
  private catSprite!: Phaser.GameObjects.Sprite;
  private playerShadow!: Phaser.GameObjects.Image;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private busy = false;
  private stepTimer = 0;
  private near: Interactable | null = null;
  /** Momento en que se cerró el último diálogo: evita que la tecla que lo cierra reabra otro. */
  private lastClose = 0;

  constructor() {
    super("lab");
  }

  init(data: { mode?: Mode; arrive?: boolean }): void {
    this.mode = data.mode ?? "play";
    this.arrive = !!data.arrive;
    const m = MISSIONS[save.done];
    this.night = this.mode === "title" || !m || m.phase === "noche";
    this.solids = [];
    this.things = [];
    this.npcs = {};
    this.busy = false;
    this.shadows = new Map();
    this.npcSolids = {};
    this.emoteSprite = null;
    this.emoteTarget = null;
    this.carried = null;
    this.ringTimer = null;
    this.kesslerOut = false;
  }

  create(): void {
    const cam = this.cameras.main;
    cam.setBackgroundColor("#07080f");
    cam.setScroll(-(VIEW_W - ROOM_W) / 2, -(VIEW_H - ROOM_H) / 2 - 4);
    cam.roundPixels = true;

    this.buildRoom();
    this.buildPeople();

    this.lampOn = this.night;
    this.lightSources = this.night
      ? [
          { x: 73, y: 64, r: 58, color: [254, 170, 40], power: 1 },
          { x: 193, y: 64, r: 34, color: [254, 150, 40], power: 0.55 },
          { x: 362, y: 30, r: 62, color: [160, 200, 255], power: 0.75 },
          { x: 56, y: 18, r: 40, color: [140, 170, 255], power: 0.55 },
          { x: 302, y: 18, r: 36, color: [140, 170, 255], power: 0.5 },
          { x: 19, y: 190, r: 22, color: [255, 60, 70], power: 0.6 },
          { x: 208, y: 232, r: 44, color: [255, 220, 150], power: 0.55 },
          { x: 104, y: 66, r: 34, color: [255, 230, 160], power: 0.8 },
          { x: 397, y: 98, r: 20, color: [255, 210, 80], power: isMusicOn() ? 0.65 : 0 },
          { x: 372, y: 116, r: 12, color: [120, 190, 255], power: 0.45 },
        ]
      : [];
    if (this.night) {
      this.rig = buildLighting(this, ROOM_W, ROOM_H, this.lightSources);
    } else {
      buildDaylight(this, [
        { x: 40, w: 32 },
        { x: 286, w: 32 },
      ]);
    }

    // la época del año de cada acto
    const act = Math.min(actOf(save.done), ACTS.length);
    const windows = [{ x: 40, y: 3 }, { x: 286, y: 3 }];
    if (this.mode === "play") {
      if (act === 3) addXmasLights(this, 8, 408, 2, this.night);
      if (act === 4) addSnow(this, windows, this.night);
      if (act === 5) {
        addRain(this, windows, this.night);
        if (this.night) addLightning(this, ROOM_W, ROOM_H);
      }
    }

    this.marker = this.add.sprite(0, 0, "marker").play("marker-bob").setDepth(20000).setVisible(false);

    const kb = this.input.keyboard!;
    kb.disableGlobalCapture();
    this.keys = kb.addKeys("W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE,ENTER", false) as Record<string, Phaser.Input.Keyboard.Key>;
    // La interacción escucha la ventana directamente: si Phaser se pierde un keyup
    // mientras la terminal está abierta, la siguiente E no se tragaría.
    const onKey = (ev: KeyboardEvent) => {
      if (ev.repeat) return;
      const t = ev.target as HTMLElement | null;
      if (t && (t.closest(".term") || t.closest(".notebook") || t.tagName === "BUTTON")) return;
      if (ev.code === "KeyC") return void this.openCuaderno();
      if (!["KeyE", "Space", "Enter"].includes(ev.code)) return;
      void this.interact();
    };
    setNotebookAction(this.mode === "play" ? () => void this.openCuaderno() : null);
    window.addEventListener("keydown", onKey);
    this.events.once("shutdown", () => window.removeEventListener("keydown", onKey));

    setPauseHooks(
      {
        freeze: (v) => (v ? this.scene.pause() : this.scene.resume()),
        toTitle: async () => {
          await fadeOut();
          this.scene.start("lab", { mode: "title" });
        },
        notebook: () => void this.openCuaderno(),
        onMusic: () => {
          if (isMusicOn()) this.radio.play("radio-play", true);
          else {
            this.radio.anims.stop();
            this.radio.setFrame(0);
          }
          this.relight();
        },
      },
      () => this.busy || this.mode === "title",
    );

    if (this.mode === "play") {
      startHum();
      this.events.once("shutdown", () => stopHum());
    }

    if (this.mode === "title") {
      hudVisible(false);
      // en la portada, Sam trabaja de madrugada frente a su terminal
      this.player.setPosition(80, 112).setFrame(charFrame("sam", "up"));
      this.playerShadow.setPosition(80, 111);
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

  private solid(x: number, y: number, w: number, h: number): Rect {
    const r = { x, y, w, h };
    this.solids.push(r);
    return r;
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
    const cloudy = this.mode === "play" && [4, 5].includes(Math.min(actOf(save.done), ACTS.length));
    const winFrame = (this.night ? 1 : 0) + (cloudy ? 2 : 0);
    this.img("window", 40, 3, winFrame).setDepth(3);
    this.img("window", 286, 3, winFrame).setDepth(3);
    this.img("poster", 84, 6).setDepth(3);
    this.cork = this.img("corkboard", 112, 5, 0).setDepth(3);
    this.img("clock", 160, 7).setDepth(3);
    this.drawClockHands(166, 13);
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
    this.termSprite = this.add.sprite(64, 60, "terminal").setOrigin(0, 0).setDepth(100 + 96);
    this.termSprite.play("term-on");
    this.prop("papers", 86, 72).setDepth(100 + 95);
    this.prop("mug", 92, 64).setDepth(100 + 95);
    this.lamp = this.prop("lamp", 96, 58, this.night ? 1 : 0).setDepth(100 + 95);
    // vapor del café de Sam
    this.steam(95, 63);
    this.prop("chair", 72, 92);
    this.solid(74, 100, 12, 8);
    this.prop("trash", 110, 96);
    this.solid(110, 102, 10, 6);

    // --- escritorio de Ruth
    this.prop("desk", 176, 70);
    this.solid(176, 76, 48, 18);
    const t2 = this.add.sprite(184, 60, "terminal", this.night ? 2 : 0).setOrigin(0, 0).setDepth(100 + 96);
    if (!this.night) t2.play({ key: "term-on", startFrame: 1 });
    this.phoneSprite = this.prop("phone", 206, 72).setDepth(100 + 95);
    this.prop("papers", 210, 62).setDepth(100 + 94);
    this.prop("chair", 192, 92);
    this.solid(194, 100, 12, 8);

    // --- impresora
    this.prop("table", 296, 54);
    this.solid(296, 58, 26, 14);
    const pr = this.add.sprite(299, 42, "printer").setOrigin(0, 0).setDepth(100 + 72);
    this.printerSprite = pr;
    if (!this.night) {
      // la impresora trabaja a ratos
      const burst = () => {
        pr.play("printer-run");
        sfx("printer");
        this.time.delayedCall(2600, () => {
          pr.anims.stop();
          pr.setFrame(0);
        });
        this.time.delayedCall(14000 + Math.random() * 12000, burst);
      };
      this.time.delayedCall(4000 + Math.random() * 5000, burst);
    }

    // --- rincón del café
    this.prop("kenney", 8, 194, kenney(0, 12));
    this.prop("kenney", 24, 194, kenney(1, 12));
    this.prop("kenney", 40, 194, kenney(8, 12));
    this.prop("kenney", 56, 194, kenney(2, 12));
    this.prop("fridge", 73, 182);
    this.solid(8, 196, 84, 28);
    this.coffee = this.add.sprite(10, 180, "coffee", 1).setOrigin(0, 0).setDepth(100 + 212);
    this.steam(16, 181);
    this.prop("mug", 28, 190).setDepth(100 + 212);

    // --- archivadores
    this.prop("filing", 382, 102);
    this.prop("filing", 397, 102);
    this.solid(382, 116, 30, 12);

    // --- alfombra
    this.img("rug", 176, 140).setDepth(1);

    // --- Byte, la gata, durmiendo en la alfombra
    this.add.image(209, 162, "shadow").setScale(1.5, 1).setDepth(2);
    this.catSprite = this.add.sprite(198, 148, "cat").setOrigin(0, 0).setDepth(100 + 162).play("cat-sleep");
    this.solid(199, 153, 19, 8);

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
    this.prop("coatrack", 230, 190);
    this.solid(234, 216, 10, 6);

    // --- cajas de cintas de respaldo
    this.prop("tapebox", 350, 196, 0);
    this.prop("tapebox", 368, 198, 1);
    this.prop("tapebox", 359, 184, 1).setDepth(100 + 216);
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
      this.npcSolids.ruth = this.solid(231, 94, 14, 8);
      this.npcSolids.kessler = this.solid(254, 40, 14, 10);
      // Kessler mira a un lado y a otro, impaciente
      this.time.addEvent({
        delay: 4300,
        loop: true,
        callback: () => {
          const k = this.npcs.kessler;
          if (!k || this.busy) return;
          k.setFrame(charFrame("kessler", Phaser.Utils.Array.GetRandom(["down", "down", "left", "right"] as Dir[])));
        },
      });
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
    // algunas noches Ruth se queda acompañando a Sam junto a su escritorio
    if (this.night && this.mode === "play" && stageOf(MISSIONS[save.done]?.id).ruthAtNight) {
      this.npcs.ruth = this.add.sprite(132, 106, "chars", charFrame("ruth", "left")).setOrigin(0.5, 1);
      this.npcSolids.ruth = this.solid(125, 100, 14, 8);
      this.tweens.add({ targets: this.npcs.ruth, y: 105, duration: 760, yoyo: true, repeat: -1, ease: "Stepped" });
    }
    for (const s of [this.player, ...Object.values(this.npcs)]) s?.setDepth(100 + s.y);
    // sombras bajo los personajes (siguen a cada uno si camina)
    this.playerShadow = this.add.image(this.player.x, this.player.y - 1, "shadow").setDepth(2);
    for (const n of Object.values(this.npcs)) this.shadows.set(n!, this.add.image(n!.x, n!.y - 1, "shadow").setDepth(2));
  }

  private defineInteractables(): void {
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
        x: this.npcs.ruth ? this.npcs.ruth.x : 238, y: this.npcs.ruth ? this.npcs.ruth.y + 4 : 104, r: 20,
        label: () => (this.npcs.ruth ? "Hablar con Ruth" : null),
        use: () => this.talkTo("ruth"),
      },
      {
        id: "kessler",
        x: 261, y: 54, r: 18,
        label: () => (this.npcs.kessler ? "Hablar con Kessler" : null),
        use: () => this.talkTo("kessler"),
      },
      {
        id: "phone",
        x: 214, y: 100, r: 10,
        label: () => (this.pendingPickup()?.at === "phone" ? "Contestar el teléfono" : null),
        use: () => this.doPickup(),
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
        use: () => {
          const act = Math.min(actOf(save.done), ACTS.length);
          return openBoard(this.actClues(), missionsOfAct(act).length, `ACTO ${act} · ${ACTS[act - 1].title.toUpperCase()}`);
        },
      },
      {
        id: "window",
        x: 56, y: 42, r: 16,
        label: () => "Mirar por la ventana",
        use: () =>
          say([
            {
              who: "sam",
              text: windowLine(Math.min(actOf(save.done), ACTS.length), this.night),
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
        label: () => (this.pendingPickup()?.at === "printer" ? this.pendingPickup()!.label : "Revisar la impresora"),
        use: () =>
          this.pendingPickup()?.at === "printer"
            ? this.doPickup()
            : say([
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
        use: () =>
          say([
            {
              who: "sam",
              text: this.night
                ? this.npcs.ruth
                  ? "Apagada. Esta noche Ruth prefiere mirar la mía."
                  : "Apagada. Ruth se fue a las seis, como siempre."
                : "Mejor no tocar la terminal de Ruth mientras está mirando.",
            },
          ]),
      },
      {
        id: "calendar",
        x: 238, y: 42, r: 10,
        label: () => "Mirar el calendario",
        use: () => say([{ who: "narrador", text: "Agosto de 1986. Alguien rodeó en rojo el día de cierre de cuentas." }]),
      },
      {
        id: "lamp",
        x: 101, y: 100, r: 9,
        label: () => (this.lampOn ? "Apagar la lámpara" : "Encender la lámpara"),
        use: () => {
          this.lampOn = !this.lampOn;
          sfx("lamp");
          this.lamp.setFrame(this.lampOn ? 1 : 0);
          this.relight();
        },
      },
      {
        id: "cat",
        x: 208, y: 168, r: 18,
        label: () => "Acariciar a Byte",
        use: () => {
          sfx("meow");
          this.emote(this.catSprite, 4, 1400);
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
            this.night && [4, 5].includes(Math.min(actOf(save.done), ACTS.length))
              ? [{ who: "sam", text: "Nublado. Ni Saturno, ni la Luna, ni nada. Hoy solo hay pantallas." }]
              : this.night
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
        label: () =>
          this.pendingPickup()?.at === "filing" ? this.pendingPickup()!.label : isMusicOn() ? "Apagar la radio" : "Encender la radio",
        use: () => {
          if (this.pendingPickup()?.at === "filing") return this.doPickup();
          sfx("click");
          if (isMusicOn()) {
            stopMusic();
            this.radio.anims.stop();
            this.radio.setFrame(0);
          } else {
            startMusic();
            this.radio.play("radio-play");
          }
          this.relight();
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
        label: () => "Salida",
        use: () => say([{ who: "sam", text: this.night ? "No pienso irme ahora." : "Todavía no. Hay trabajo." }]),
      },
    );
  }

  // ------------------------------------------------------------------ flujo de juego

  private async startGame(fresh: boolean): Promise<void> {
    if (settings.music) startMusic();
    await fadeOut();
    if (fresh) resetSave();
    this.scene.restart({ mode: "play" });
  }

  private get mission() {
    return MISSIONS[save.done];
  }

  /** Pistas del acto en curso (las del corcho). */
  private actClues() {
    const act = actOf(save.done);
    return MISSIONS.filter((m, i) => m.act === act && i < save.done).map((m) => m.clue);
  }

  private async afterLoad(): Promise<void> {
    this.busy = true;
    await fadeIn();
    const m = this.mission;
    if (m && save.actIntro < m.act) {
      const info = ACTS[m.act - 1];
      await showCard(`Acto ${info.n} · ${info.title}`, `Berkeley, California · ${info.date}`);
      await this.talk(info.opening);
      save.actIntro = m.act;
      save.introSeen = true;
      writeSave(save);
      if (m.act === 1) showControls();
    } else if (this.arrive && m) {
      await showCard(m.clock, "Esa misma noche");
      // Sam entra por la puerta del sótano
      this.player.setPosition(208, 240);
      await this.walk(this.player, "sam", [[208, 200]], 50);
      this.facing = "up";
      this.player.setFrame(charFrame("sam", "up"));
    }
    this.busy = false;
    this.refreshObjective();
  }

  private refreshObjective(): void {
    const m = this.mission;
    this.cork.setFrame(Math.min(this.actClues().length, 5));
    setClock(m ? m.clock : "03:59");
    this.setEmote(null, 0);
    this.stopRinging();
    if (!m) {
      setObjective("CONTINUARÁ", "Los actos 1 a 3 están completos. Repasa en tu cuaderno [C].");
      this.pointAt(null);
      return;
    }
    // la terminal de Sam avisa cuando la noche trae una conexión
    this.termSprite.play(this.night && m.giver === "terminal" ? "term-alert" : "term-on", true);
    if (!save.briefed && m.giver !== "terminal") {
      setObjective(m.title.toUpperCase(), m.giver === "ruth" ? "Habla con Ruth." : "Habla con Kessler.");
      this.pointAt(null);
      if (m.giver === "kessler") void this.kesslerComesOut();
      const npc = this.npcs[m.giver];
      if (npc) this.setEmote(npc, 0);
      return;
    }
    const pk = this.pendingPickup();
    if (pk) {
      setObjective(m.title.toUpperCase(), `${pk.label}.`);
      this.pointAt(pk.at);
      if (pk.at === "phone") this.startRinging();
      return;
    }
    setObjective(m.title.toUpperCase(), "Ve a tu terminal.");
    this.pointAt("terminal");
  }

  /** Lo que hay que recoger antes de la terminal (si la misión lo pide y aún no se hizo). */
  private pendingPickup() {
    const m = this.mission;
    if (!m || !save.briefed || save.picked) return null;
    return stageOf(m.id).pickup ?? null;
  }

  /** Recoger el objeto: la impresora imprime, el archivador se abre o se contesta el teléfono. */
  private async doPickup(): Promise<void> {
    const pk = this.pendingPickup();
    if (!pk) return;
    this.busy = true;
    this.player.anims.stop();
    setPrompt(null);
    this.pointAt(null);
    if (pk.at === "phone") {
      this.stopRinging();
      sfx("click");
      await this.talk(pk.lines);
    } else {
      let from: [number, number];
      if (pk.at === "printer") {
        this.printerSprite.play("printer-run");
        sfx("printer");
        await new Promise((r) => this.time.delayedCall(1400, r));
        this.printerSprite.anims.stop();
        this.printerSprite.setFrame(0);
        from = [309, 44];
      } else {
        sfx("open");
        from = [396, 108];
      }
      const item = this.add.image(from[0], from[1], pk.at === "printer" ? "paper_item" : "folder_item").setDepth(20001);
      await new Promise<void>((r) =>
        this.tweens.add({ targets: item, x: this.player.x, y: this.player.y - 30, duration: 520, ease: "Quad.Out", onComplete: () => r() }),
      );
      sfx("select");
      this.carried = item;
      await this.talk(pk.lines);
    }
    save.picked = true;
    writeSave(save);
    this.busy = false;
    this.refreshObjective();
  }

  private startRinging(): void {
    if (this.ringTimer) return;
    const ring = () => {
      sfx("ring");
      this.tweens.add({ targets: this.phoneSprite, x: { from: 205, to: 207 }, duration: 50, yoyo: true, repeat: 5, onComplete: () => this.phoneSprite.setX(206) });
    };
    ring();
    this.ringTimer = this.time.addEvent({ delay: 1500, loop: true, callback: ring });
    this.setEmote(this.phoneSprite as unknown as Phaser.GameObjects.Sprite, 0, 0, -6);
  }

  private stopRinging(): void {
    this.ringTimer?.remove();
    this.ringTimer = null;
  }

  /** Burbuja de emoción sobre un personaje u objeto. ms = 0: se queda hasta que se quite. */
  private emoteOffset = 0;
  private setEmote(target: Phaser.GameObjects.Sprite | null, frame: number, ms = 0, extraY = 0): void {
    this.emoteSprite?.destroy();
    this.emoteSprite = null;
    this.emoteTarget = target;
    if (!target) return;
    this.emoteOffset = extraY;
    this.emoteSprite = this.add.sprite(target.x, target.y, "emotes", frame).setDepth(20002);
    this.tweens.add({ targets: this.emoteSprite, scale: { from: 0.4, to: 1 }, duration: 160, ease: "Back.Out" });
    if (ms) this.time.delayedCall(ms, () => this.setEmote(null, 0));
  }

  /** Burbuja breve que no reemplaza a la principal. */
  private emote(target: Phaser.GameObjects.GameObject & { x: number; y: number; height?: number }, frame: number, ms: number): void {
    const top = (target as Phaser.GameObjects.Sprite).getTopCenter?.() ?? { x: target.x, y: target.y - 24 };
    const e = this.add.sprite(top.x!, top.y! - 7, "emotes", frame).setDepth(20003);
    this.tweens.add({ targets: e, y: e.y - 3, duration: 200, ease: "Back.Out" });
    this.time.delayedCall(ms, () => e.destroy());
  }

  /** Camina un personaje por una ruta de puntos (en L) con su animación. */
  private walk(sprite: Phaser.GameObjects.Sprite, name: CharName, points: [number, number][], speed = 46): Promise<void> {
    return new Promise((resolve) => {
      const step = (i: number) => {
        if (i >= points.length) {
          sprite.anims.stop();
          resolve();
          return;
        }
        const [tx, ty] = points[i];
        const dx = tx - sprite.x;
        const dy = ty - sprite.y;
        const dir: Dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? "left" : "right") : dy < 0 ? "up" : "down";
        sprite.play(`${name}-walk-${dir}`, true);
        const dist = Math.hypot(dx, dy);
        this.tweens.add({
          targets: sprite,
          x: tx,
          y: ty,
          duration: (dist / speed) * 1000,
          onUpdate: () => sprite.setDepth(100 + sprite.y),
          onComplete: () => {
            sprite.setFrame(charFrame(name, dir));
            step(i + 1);
          },
        });
      };
      step(0);
    });
  }

  /** Kessler sale de su oficina a buscar a Sam cuando tiene un encargo. */
  private async kesslerComesOut(): Promise<void> {
    const k = this.npcs.kessler;
    if (!k || this.kesslerOut) return;
    this.kesslerOut = true;
    this.tweens.killTweensOf(k);
    if (this.npcSolids.kessler) Object.assign(this.npcSolids.kessler, { x: -99, y: -99 });
    await this.walk(k, "kessler", [[261, 70], [250, 128]], 40);
    if (this.npcSolids.kessler) Object.assign(this.npcSolids.kessler, { x: 243, y: 120, w: 14, h: 8 });
    k.setFrame(charFrame("kessler", "down"));
  }

  private async kesslerGoesBack(): Promise<void> {
    const k = this.npcs.kessler;
    if (!k || !this.kesslerOut) return;
    this.kesslerOut = false;
    if (this.npcSolids.kessler) Object.assign(this.npcSolids.kessler, { x: -99, y: -99 });
    await this.walk(k, "kessler", [[261, 128], [261, 48]], 44);
    if (this.npcSolids.kessler) Object.assign(this.npcSolids.kessler, { x: 254, y: 40, w: 14, h: 10 });
    k.setFrame(charFrame("kessler", "down"));
    this.tweens.add({ targets: k, y: k.y - 1, duration: 960, yoyo: true, repeat: -1, ease: "Stepped" });
  }

  /** La cámara se acerca al corcho y se ve clavar la pista nueva. */
  private async pinClue(): Promise<void> {
    const cam = this.cameras.main;
    const home = { x: cam.midPoint.x, y: cam.midPoint.y };
    hudVisible(false);
    cam.pan(130, 58, 500, Phaser.Math.Easing.Sine.InOut);
    cam.zoomTo(2, 500, Phaser.Math.Easing.Sine.InOut);
    await new Promise((r) => this.time.delayedCall(620, r));
    this.cork.setFrame(Math.min(this.actClues().length, 5));
    sfx("pin");
    cam.shake(120, 0.003);
    await new Promise((r) => this.time.delayedCall(1100, r));
    cam.pan(home.x, home.y, 450, Phaser.Math.Easing.Sine.InOut);
    cam.zoomTo(1, 450, Phaser.Math.Easing.Sine.InOut);
    await new Promise((r) => this.time.delayedCall(500, r));
    hudVisible(true);
  }

  private pointAt(id: string | null): void {
    if (!id) return void this.marker.setVisible(false);
    const pos: Record<string, [number, number]> = {
      ruth: [238, 70],
      kessler: [261, 18],
      terminal: [73, 50],
      printer: [309, 34],
      filing: [396, 84],
      phone: [210, 60],
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

  private async talkTo(who: "ruth" | "kessler"): Promise<void> {
    const m = this.mission;
    const npc = this.npcs[who];
    if (who === "ruth") npc?.setFrame(charFrame("ruth", this.player.x < (npc?.x ?? 0) ? "left" : "right"));
    if (m && !save.briefed && m.giver === who) {
      this.setEmote(null, 0);
      await this.talk(m.briefing);
      save.briefed = true;
      save.picked = false;
      writeSave(save);
      sfx("select");
      this.refreshObjective();
      if (who === "kessler") void this.kesslerGoesBack();
      return;
    }
    if (this.night && who === "ruth") {
      const night = [
        "Tú teclea. Yo vigilo la puerta y el café.",
        "Si esta noche sale bien, mañana no vengo hasta las once.",
        "No mires el reloj. Mira la pantalla.",
      ];
      await this.talk([{ who: "ruth", text: night[Math.floor(Math.random() * night.length)] }]);
      return;
    }
    await this.talk([chatter(who, m)]);
  }

  private async useTerminal(): Promise<void> {
    const m = this.mission;
    if (!m) {
      await this.talk([{ who: "sistema", text: "SESION CERRADA. CONTINUARA." }]);
      return;
    }
    if (!save.briefed) {
      if (m.giver === "terminal") {
        await this.talk(m.briefing);
        save.briefed = true;
        save.picked = false;
        writeSave(save);
        if (this.pendingPickup()) {
          this.refreshObjective();
          return;
        }
      } else {
        const name = m.giver === "ruth" ? "Ruth" : "Kessler";
        await this.talk([{ who: "sam", text: `Primero debería hablar con ${name}. Sabe qué hay que hacer.` }]);
        return;
      }
    }
    const pk = this.pendingPickup();
    if (pk) {
      this.emote(this.player, 1, 1200);
      await this.talk([{ who: "sam", text: `Me faltan los datos. ${pk.label}.` }]);
      return;
    }
    this.carried?.destroy();
    this.carried = null;
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
    const finished = save.done;
    save.done += 1;
    save.briefed = false;
    save.picked = false;
    writeSave(save);
    this.busy = true;
    await this.pinClue();
    this.busy = false;

    if (lastOfAct(finished)) {
      this.busy = true;
      sfx("alarm");
      this.cameras.main.shake(300, 0.004);
      await fadeOut();
      hudVisible(false);
      this.scene.start("net", { act: m.act });
      return;
    }
    const next = this.mission;
    if (next && next.phase !== m.phase) {
      this.busy = true;
      await fadeOut();
      this.scene.restart({ mode: "play", arrive: true });
      return;
    }
    this.refreshObjective();
  }

  /** Recalcula la luz nocturna según lámpara y radio. */
  private relight(): void {
    if (!this.rig) return;
    const lamp = this.lightSources.find((l) => l.x === 104 && l.y === 66);
    const radio = this.lightSources.find((l) => l.x === 397);
    if (lamp) lamp.power = this.lampOn ? 0.8 : 0;
    if (radio) radio.power = isMusicOn() ? 0.65 : 0;
    this.rig.repaint(this.lightSources);
  }

  /** Polvo que levantan los pasos: dos píxeles que se desvanecen. */
  private puff(x: number, y: number): void {
    for (const dx of [-3, 3]) {
      const p = this.add.rectangle(Math.round(x + dx), Math.round(y - 1), 1, 1, this.night ? 0x5c5c66 : 0xa89a7a, 0.8).setDepth(2);
      this.tweens.add({ targets: p, y: p.y - 2, x: p.x + Math.sign(dx), alpha: 0, duration: 380, ease: "Stepped", easeParams: [3], onComplete: () => p.destroy() });
    }
  }

  /** Volutas de vapor que suben y se desvanecen. */
  private steam(x: number, y: number): void {
    this.time.addEvent({
      delay: 520,
      loop: true,
      callback: () => {
        const p = this.add.rectangle(x + Math.round(Math.random() * 2 - 1), y, 1, 1, 0xf7f7f2, 0.7).setDepth(9500);
        this.tweens.add({
          targets: p,
          y: y - 9 - Math.random() * 4,
          x: p.x + (Math.random() < 0.5 ? -1 : 1),
          alpha: 0,
          duration: 1500,
          ease: "Stepped",
          easeParams: [6],
          onComplete: () => p.destroy(),
        });
      },
    });
  }

  /** Manecillas del reloj de pared según la hora de la misión. */
  private drawClockHands(cx: number, cy: number): void {
    const [h, m] = (this.mission?.clock ?? "03:59").split(":").map(Number);
    const g = this.add.graphics().setDepth(4);
    const hand = (angle: number, len: number, color: number) => {
      for (let r = 1; r <= len; r++) {
        g.fillStyle(color, 1).fillRect(cx + Math.round(Math.sin(angle) * r), cy - Math.round(Math.cos(angle) * r), 1, 1);
      }
    };
    hand(((h % 12) + m / 60) * (Math.PI / 6), 2, 0x1c1830);
    hand(m * (Math.PI / 30), 3, 0xe8344e);
    g.fillStyle(0x1c1830, 1).fillRect(cx, cy, 1, 1);
  }

  /** Abre el cuaderno; desde él se puede practicar en la terminal sin tocar el progreso. */
  private async openCuaderno(): Promise<void> {
    if (this.busy || isDialogOpen() || isNotebookOpen() || this.mode !== "play" || document.querySelector(".pause, .board")) return;
    this.busy = true;
    this.player.anims.stop();
    setPrompt(null);
    await openNotebook({
      practice: async (m) => {
        this.input.keyboard!.enabled = false;
        hudVisible(false);
        await openTerminal(m, { practice: true });
        hudVisible(true);
        this.input.keyboard!.enabled = true;
        this.input.keyboard!.resetKeys();
      },
    });
    this.lastClose = performance.now();
    this.busy = false;
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
        this.puff(this.player.x, this.player.y);
      }
    } else if (this.player.anims.isPlaying) {
      this.player.anims.stop();
      this.player.setFrame(charFrame("sam", this.facing));
    }
    this.player.setDepth(100 + this.player.y);
    if (this.emoteSprite && this.emoteTarget) {
      const t = this.emoteTarget.getTopCenter();
      this.emoteSprite.setPosition(Math.round(t.x!), Math.round(t.y! - 7 + this.emoteOffset));
    }
    if (this.carried) this.carried.setPosition(Math.round(this.player.x), Math.round(this.player.y - 31 + Math.sin(this.time.now / 250)));
    for (const [n, sh] of this.shadows) sh.setPosition(Math.round(n.x), Math.round(n.y) - 1);
    for (const t of this.things) {
      if (t.id === "ruth" && this.npcs.ruth) [t.x, t.y] = [this.npcs.ruth.x, this.npcs.ruth.y + 4];
      if (t.id === "kessler" && this.npcs.kessler) [t.x, t.y] = [this.npcs.kessler.x, this.npcs.kessler.y + 6];
    }
    const dVax = Math.hypot(this.player.x - 370, this.player.y - 46);
    setHum(Math.max(0, 1 - dVax / 260), this.night);
    this.playerShadow.setPosition(Math.round(this.player.x), Math.round(this.player.y) - 1).setVisible(this.player.visible);

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

/** Lo que dicen Ruth y Kessler cuando no tienen un encargo para Sam. */
function chatter(who: "ruth" | "kessler", m: Mission | undefined): Line {
  const act = m?.act ?? 7;
  const pick = (opts: string[]) => opts[Math.floor(Math.random() * opts.length)];
  if (who === "ruth" && m && m.giver !== "ruth")
    return { who, text: m.giver === "kessler" ? "Kessler te estaba buscando. Pon cara de informe." : "La terminal es la de la izquierda. La que zumba." };
  const RUTH: Record<number, string[]> = {
    1: ["La terminal es la de la izquierda. La que zumba.", "Si la VAX pita tres veces, no toques nada y llámame."],
    2: ["Si tu función falla, no es personal. Casi nunca.", "Le puse nombre a la alarma: Pitufa."],
    3: ["Llevo tres días sin ver la luz del sol. Byte tampoco.", "El hombre del gobierno se bebió mi café. Dos veces."],
    4: ["¿Has visto la nieve? Yo tampoco: estoy aquí abajo contigo.", "Berlín Este. Nunca pensé que diría eso en un sótano de California."],
    5: ["Aprendí tres palabras en alemán: danke, bitte y Datenleitung.", "Si la redada sale bien, me voy de vacaciones. Si sale mal, también."],
    6: ["Todo lo que llega tarde llega igual. Menos el café: ese llega frío.", "Cuando esto acabe, quiero un trabajo aburrido. Muy aburrido."],
    7: ["Duerme algo, Sam. Te lo has ganado."],
  };
  const KESSLER: Record<number, string[]> = {
    1: ["Sam, ¿verdad? El astrónomo. Que la factura cuadre y no tendremos que hablar mucho.", "Una semana, Sam. Y un informe que yo entienda."],
    2: ["El decano pregunta por qué la factura de café se ha triplicado.", "Haz lo que tengas que hacer. Pero que no salga en el periódico."],
    3: ["Antes me molestaban 75 centavos. Ahora me llama gente que no dice su apellido.", "Sam. Buen trabajo. No se lo digas a nadie."],
    4: ["El gobierno quiere informes semanales. Yo quiero dormir semanalmente.", "Si alguien pregunta, aquí solo hacemos astronomía."],
    5: ["Coordinar cuatro países por télex. Esto es peor que el comité de presupuestos.", "Mañana, a esta hora, o somos héroes o somos noticia."],
    6: ["Me han pedido una charla sobre seguridad informática. A mí.", "Gracias, Sam. Lo digo una vez y no lo repito."],
    7: ["La puerta de mi despacho está abierta. Literalmente: se rompió el pestillo."],
  };
  const pool = (who === "ruth" ? RUTH : KESSLER)[Math.min(act, 7)];
  return { who, text: pick(pool) };
}

/** Lo que ve Sam por la ventana según el mes del acto. */
function windowLine(act: number, night: boolean): string {
  const lines: Record<number, [string, string]> = {
    1: ["El campus en agosto. Hace dos semanas yo miraba galaxias. Hoy miro facturas.", "Las luces de Berkeley. En algún lugar, alguien está despierto con la misma pantalla que yo."],
    2: ["Septiembre. Los estudiantes vuelven y no saben que su universidad es la puerta de un espía.", "Medianoche. La bahía está en calma. Nuestro intruso, no."],
    3: ["Diciembre. Alguien colgó luces en la residencia de enfrente. Aquí, Ruth colgó las suyas.", "Luces de Navidad en las colinas. En Alemania ya es por la mañana."],
    4: ["Está nevando en Berkeley. Los becarios salieron a hacer fotos. Nadie se lo cree.", "La nieve no hace ruido. La VAX, sí."],
    5: ["Llueve desde hace tres días. Kessler dice que es buena señal. No sabe de qué.", "Lluvia y relámpagos. En Hannover está amaneciendo."],
    6: ["Junio. El campus huele a hierba cortada y a final de curso.", "Una noche de verano con la ventana abierta. Casi parece una noche normal."],
  };
  const pair = lines[act] ?? lines[1];
  return night ? pair[1] : pair[0];
}
