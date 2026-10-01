import Phaser from "phaser";
import { CHEAT } from "../game/cheats";
import { TRAINING } from "../game/training";
import { VIEW_H, VIEW_W } from "../config";
import { save, writeSave } from "../game/state";
import { MISSIONS, type Line } from "../game/missions";
import { playDialog } from "../ui/dialog";
import { fadeIn, fadeOut } from "../ui/fade";
import { el, esc, ui, wait } from "../ui/dom";
import { setClock, setObjective, hudVisible, setNotebookAction } from "../ui/hud";
import { sfx } from "../audio/sfx";
import { setPauseHooks } from "../ui/pause";

type LL = [number, number];

// Contornos muy simplificados (lon, lat) para un mapa de puntos estilo pantalla de 1986.
const LAND: LL[][] = [
  [[-168,66],[-160,70],[-140,70],[-125,70],[-95,72],[-80,73],[-65,62],[-60,55],[-55,50],[-66,45],[-70,42],[-75,38],[-76,35],[-81,31],[-80,26],[-82,25],[-84,30],[-90,29],[-97,27],[-97,22],[-105,20],[-110,23],[-115,30],[-118,34],[-122,37],[-124,40],[-125,48],[-132,55],[-140,60],[-150,60],[-165,62]],
  [[-73,78],[-60,82],[-30,83],[-20,75],[-22,70],[-40,62],[-50,64],[-55,70],[-70,76]],
  [[-24,64],[-22,66.5],[-14,66.5],[-13,65],[-18,63.4]],
  [[-10,36],[-9,43],[-2,44],[-5,48],[2,51],[5,53],[8,54],[8,57],[5,59],[5,62],[14,68],[25,71],[32,70],[34,45],[28,41],[23,37],[20,40],[15,38],[12,44],[8,44],[3,42],[0,38],[-5,36]],
  [[-6,50],[2,51],[1,53],[-2,56],[-3,58.5],[-6,58],[-5,55],[-3,54],[-5,52]],
  [[-10,52],[-6,52],[-6,55],[-8,55.3],[-10,54]],
  [[-17,21],[-17,28],[-10,30],[-6,36],[10,37],[11,33],[20,31],[34,31],[34,15],[-17,15]],
];
const HOLES: LL[][] = [[[-95,60],[-80,62],[-78,55],[-82,52],[-90,57]]];

const LON0 = -135, LON1 = 35, LAT0 = 15, LAT1 = 78;
const MAP = { x: 10, y: 16, w: VIEW_W - 20, h: VIEW_H - 60 };

function project([lon, lat]: LL): [number, number] {
  return [
    MAP.x + ((lon - LON0) / (LON1 - LON0)) * MAP.w,
    MAP.y + ((LAT1 - lat) / (LAT1 - LAT0)) * MAP.h,
  ];
}

function inside(p: LL, poly: LL[]): boolean {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

interface Hop { ll: LL; label: string; log: string; kind: number; dy?: number }
interface Finale {
  hops: Hop[];
  /** Ampliación de Alemania Occidental: los nodos están demasiado juntos para el mapa grande. */
  inset?: { nodes: { x: number; y: number; label: string; kind: number; log: string }[] };
  dialog: Line[];
  learned: string[];
  teaser: string;
  next?: number;
  /** Final de la historia: todos los nodos se cierran en verde. */
  closing?: boolean;
  /** Epílogo tras el diálogo (líneas de narrador). */
  epilogue?: Line[];
}

const ROUTE = (t: string[]): Hop[] => [
  { ll: [-122.3, 37.9], label: "BERKELEY", log: `${t[0]}  CONEXION ENTRANTE  cuenta=hunter`, kind: 1, dy: -6 },
  { ll: [-119.5, 36.2], label: "TYMNET OAKLAND", log: `${t[1]}  la llamada entra por Tymnet`, kind: 0, dy: 10 },
  { ll: [-77.2, 38.9], label: "COSTA ESTE", log: `${t[2]}  rebota en la costa este`, kind: 0 },
  { ll: [-42, 50], label: "SATÉLITE", log: `${t[3]}  enlace transatlántico`, kind: 2 },
];

const FINALES: Record<number, Finale> = {
  1: {
    hops: [...ROUTE(["02:51", "02:52", "02:53", "02:53"]), { ll: [9.7, 52.4], label: "???", log: "02:54  ORIGEN: FUERA DEL PAÍS", kind: 3 }],
    dialog: [
      { who: "sam", text: "No es un estudiante aburrido. La llamada cruza un océano.", mood: "sorpresa" },
      { who: "sam", text: "Setenta y cinco centavos. Alguien al otro lado del mundo está usando nuestra máquina para llegar a otra parte." },
      { who: "sam", text: "Si la cierro, desaparece. Si lo observo... quizá me lleve hasta él." },
    ],
    learned: ["let", "+ - * /", "textos y `${}`", "if / else", "for", "console.log"],
    teaser: "Acto 2, \"La trampa\": arrays, funciones y un anzuelo para que el intruso se quede en línea.",
    next: 2,
  },
  2: {
    hops: [...ROUTE(["03:12", "03:12", "03:13", "03:13"]), { ll: [9.2, 52.8], label: "ALEMANIA OCC.", log: "03:41  la línea cruza a la red alemana", kind: 0, dy: -10 }],
    inset: {
      nodes: [
        { x: 30, y: 22, label: "BREMEN", kind: 0, log: "04:20  Universidad de Bremen: otra puerta" },
        { x: 70, y: 46, label: "???", kind: 3, log: "04:22  la línea sigue... y se pierde" },
      ],
    },
    dialog: [
      { who: "ruth", text: "Setenta minutos leyendo documentos que no existen. La telefónica lo siguió hasta Alemania." },
      { who: "sam", text: "Una universidad en Bremen. Pero la universidad no es él: es otra puerta." },
      { who: "sam", text: "Detrás hay alguien más. Y ahora sabemos que le interesan los secretos militares." },
    ],
    learned: ["[ ] arrays", ".length", ".push()", "function", "return", "parámetros", "||"],
    teaser: "Acto 3, \"El rastro\": objetos, filter y map para leer sus pasos y terminar el rastreo.",
    next: 3,
  },
  3: {
    hops: [...ROUTE(["02:20", "02:21", "02:21", "02:22"]), { ll: [9.2, 52.8], label: "ALEMANIA OCC.", log: "02:58  la línea cruza a la red alemana", kind: 0, dy: -10 }],
    inset: {
      nodes: [
        { x: 30, y: 22, label: "BREMEN", kind: 0, log: "03:30  Universidad de Bremen" },
        { x: 70, y: 46, label: "HANNOVER", kind: 3, log: "03:57  ORIGEN: UN APARTAMENTO EN HANNOVER" },
      ],
    },
    dialog: [
      { who: "ruth", text: "Hannover. Un apartamento. Hay un nombre en el contrato del teléfono.", mood: "sorpresa" },
      { who: "sam", text: "Todo empezó con setenta y cinco centavos." },
      { who: "narrador", text: "Pero en la última sesión de hunter aparece algo que nadie esperaba: una lista de compradores." },
      { who: "sam", text: "No trabaja solo. Vende lo que encuentra. Y alguien paga.", mood: "serio" },
    ],
    learned: ["{ objetos }", ".propiedad", "arrays de objetos", "filter", "map", "=>", "for...of", "+="],
    teaser: "Acto 4, \"El comprador\": alcance y closures para seguir el dinero.",
    next: 4,
  },
  4: {
    hops: [...ROUTE(["02:10", "02:11", "02:11", "02:12"]), { ll: [9.2, 52.8], label: "ALEMANIA OCC.", log: "02:30  el intento viene de Alemania", kind: 0, dy: -10 }],
    inset: {
      nodes: [
        { x: 70, y: 46, label: "HANNOVER", kind: 0, log: "02:41  Hannover: intento bloqueado" },
        { x: 106, y: 26, label: "BERLÍN ESTE", kind: 3, log: "02:44  los pagos salen de Berlín Este" },
      ],
    },
    dialog: [
      { who: "sam", text: "Hannover roba, Berlín Este paga. Y nuestra VAX era la puerta de entrada.", mood: "serio" },
      { who: "ruth", text: "Esto ya no es cosa de un laboratorio, Sam." },
      { who: "sam", text: "Entonces necesitamos que todos trabajen juntos. Y que lo entiendan igual." },
    ],
    learned: ["alcance { }", "closures", "funciones que crean funciones", ".includes()", "estado privado"],
    teaser: "Acto 5, \"La conexión\": clases y this para coordinar la redada.",
    next: 5,
  },
  5: {
    hops: [...ROUTE(["21:45", "21:46", "21:46", "21:47"]), { ll: [9.2, 52.8], label: "ALEMANIA OCC.", log: "22:00  la línea sigue abierta", kind: 0, dy: -10 }],
    inset: {
      nodes: [
        { x: 30, y: 22, label: "BREMEN", kind: 0, log: "22:04  Bremen: línea estable" },
        { x: 70, y: 46, label: "HANNOVER", kind: 3, log: "22:09  CORTE EN ORIGEN: REDADA" },
      ],
    },
    dialog: [
      { who: "kessler", text: "Llamó la policía alemana. Dos detenidos en Hannover. Uno de ellos firmaba como hunter.", mood: "serio" },
      { who: "ruth", text: "Se acabó.", mood: "alegre" },
      { who: "sam", text: "No del todo. Sus puertas traseras siguen abiertas en media red.", mood: "serio" },
    ],
    learned: ["class", "constructor", "this", "métodos", "extends", "super", ".shift()"],
    teaser: "Acto 6, \"Tiempo real\": promesas, async y await para cerrar la última puerta.",
    next: 6,
  },
  6: {
    hops: [...ROUTE(["03:33", "03:33", "03:33", "03:33"]), { ll: [9.2, 52.8], label: "ALEMANIA OCC.", log: "03:33  todas las respuestas a la vez", kind: 0, dy: -10 }],
    closing: true,
    dialog: [
      { who: "ruth", text: "Todas cerradas. Ni una puerta abierta de Hannover a Berkeley.", mood: "alegre" },
      { who: "kessler", text: "Sam. El decano quiere conocerte. Y quiere saber por qué el café cuesta lo que cuesta." },
      { who: "sam", text: "Dígale que fueron setenta y cinco centavos muy bien invertidos.", mood: "alegre" },
    ],
    epilogue: [
      { who: "narrador", text: "Años después hubo un juicio en Alemania. La historia real que inspiró este juego es todavía más extraña." },
      { who: "narrador", text: "Ruth pidió vacaciones por primera vez en seis años. Byte se quedó con su silla." },
      { who: "narrador", text: "Sam volvió al telescopio. Pero ya no miraba solo las estrellas: ahora también leía los registros." },
      { who: "narrador", text: "Un año antes no sabía qué era una variable. Ahora escribía funciones, clases y promesas sin pedir permiso a nadie." },
      { who: "narrador", text: "No se volvió experto de la noche a la mañana. Pero había superado el primer nivel de un camino largo: el de desarrollador JavaScript junior." },
      { who: "narrador", text: "Todo empezó por setenta y cinco centavos. Y por alguien que no quiso olvidarlos." },
    ],
    learned: ["setTimeout", "promesas", ".then()", "async / await", "try / catch", "Promise.all"],
    teaser: "Fin de la historia principal. Inspirada en el caso real que un astrónomo de Berkeley destapó en 1986-87; personajes y nombres ficticios. Próximamente: nuevas historias con el DOM, eventos y módulos.",
  },
};

export class NetScene extends Phaser.Scene {
  private layer: HTMLDivElement | null = null;
  private act = 1;
  private fin: Finale = FINALES[1];

  init(data: { act?: number }): void {
    this.act = data.act ?? 1;
    this.fin = FINALES[this.act] ?? FINALES[1];
    this.log = undefined as unknown as HTMLDivElement;
  }

  constructor() {
    super("net");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#070a14");
    setPauseHooks(
      {
        freeze: (v) => (v ? this.scene.pause() : this.scene.resume()),
        toTitle: async () => {
          await fadeOut();
          this.scene.start("lab", { mode: "title" });
        },
      },
      () => false,
    );
    hudVisible(true);
    setNotebookAction(null);
    setObjective("RASTREO", "Sigue la llamada.");
    setClock(this.fin.hops[0].log.slice(0, 5));

    const g = this.add.graphics();
    // rejilla de fondo
    g.fillStyle(0x121a30, 1);
    for (let x = MAP.x; x < MAP.x + MAP.w; x += 24) g.fillRect(x, MAP.y, 1, MAP.h);
    for (let y = MAP.y; y < MAP.y + MAP.h; y += 24) g.fillRect(MAP.x, y, MAP.w, 1);

    // tierra en puntos, se revela por filas
    const dots: [number, number][] = [];
    for (let py = MAP.y; py < MAP.y + MAP.h; py += 3) {
      for (let px = MAP.x + ((py / 3) % 2 ? 1 : 0); px < MAP.x + MAP.w; px += 3) {
        const lon = LON0 + ((px - MAP.x) / MAP.w) * (LON1 - LON0);
        const lat = LAT1 - ((py - MAP.y) / MAP.h) * (LAT1 - LAT0);
        const p: LL = [lon, lat];
        if (LAND.some((poly) => inside(p, poly)) && !HOLES.some((h) => inside(p, h))) dots.push([px, py]);
      }
    }
    const land = this.add.graphics();
    let shown = 0;
    this.time.addEvent({
      delay: 16,
      repeat: 60,
      callback: () => {
        const upto = Math.min(dots.length, shown + Math.ceil(dots.length / 60));
        for (let i = shown; i < upto; i++) {
          const [x, y] = dots[i];
          land.fillStyle((x + y) % 7 === 0 ? 0x3d5e8c : 0x2b3a63, 1);
          land.fillRect(x, y, 2, 2);
        }
        shown = upto;
      },
    });

    // borde de pantalla
    const frame = this.add.graphics();
    frame.lineStyle(1, 0x2e2a48, 1).strokeRect(MAP.x - 2, MAP.y - 2, MAP.w + 4, MAP.h + 4);

    this.layer = el("div", "net-layer");
    this.layer.style.cssText = "position:absolute;inset:0;pointer-events:none;font-family:var(--font-crt);";
    ui.append(this.layer);
    this.events.once("shutdown", () => this.layer?.remove());

    void this.run();
  }

  private label(x: number, y: number, text: string, color: string, dy = 0): HTMLDivElement {
    const d = el("div", "", esc(text));
    d.style.cssText = `position:absolute;left:calc(${x + 8} * var(--u));top:calc(${y - 6 + dy} * var(--u));font-size:calc(8 * var(--u));color:${color};text-shadow:0 0 calc(3*var(--u)) ${color};animation:fadein .3s steps(3) both;white-space:nowrap`;
    this.layer!.append(d);
    return d;
  }

  private log!: HTMLDivElement;
  private print(text: string, color = "var(--amber)"): void {
    if (!this.log) {
      this.log = el("div", "pixel-frame");
      this.log.style.cssText =
        "position:absolute;left:calc(10*var(--u));right:calc(10*var(--u));bottom:calc(6*var(--u));height:calc(36*var(--u));padding:calc(3*var(--u)) calc(6*var(--u));font-size:calc(8.5*var(--u));line-height:1.05;overflow:hidden;color:var(--amber);text-shadow:0 0 calc(2*var(--u)) rgba(254,160,24,.6)";
      this.layer!.append(this.log);
    }
    const line = el("div", "", esc(text));
    line.style.color = color;
    this.log.append(line);
    while (this.log.children.length > 3) this.log.firstElementChild?.remove();
    sfx("tick");
  }

  private drawLink(a: [number, number], b: [number, number], ms: number): Promise<void> {
    return new Promise((resolve) => {
      const g = this.add.graphics().setDepth(5);
      const steps = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]));
      // arco suave para los saltos largos
      const lift = Math.min(28, steps / 6);
      let i = 0;
      this.time.addEvent({
        delay: ms / steps,
        repeat: steps - 1,
        callback: () => {
          const t = i / steps;
          const x = a[0] + (b[0] - a[0]) * t;
          const y = a[1] + (b[1] - a[1]) * t - Math.sin(Math.PI * t) * lift;
          g.fillStyle(i % 4 < 2 ? 0xfed018 : 0xd35600, 1);
          g.fillRect(Math.round(x), Math.round(y), 1, 1);
          i++;
          if (i >= steps) resolve();
        },
      });
    });
  }

  private async run(): Promise<void> {
    await fadeIn();
    await wait(1100);
    const HOPS = this.fin.hops;
    const pts = HOPS.map((h) => project(h.ll).map(Math.round) as [number, number]);

    for (let i = 0; i < HOPS.length; i++) {
      const h = HOPS[i];
      const [x, y] = pts[i];
      if (i > 0) await this.drawLink(pts[i - 1], pts[i], i === 3 || i === 4 ? 1300 : 800);
      const icon = h.kind === 2
        ? this.add.sprite(x, y, "satellite").setDepth(10).play("sat-blink")
        : this.add.sprite(x, y, "net_icons", h.kind).setDepth(10);
      if (h.kind === 2) this.tweens.add({ targets: icon, y: y - 2, duration: 1200, yoyo: true, repeat: -1, ease: "Stepped", delay: 400 });
      this.tweens.add({ targets: icon, scale: { from: 2.2, to: 1 }, duration: 260, ease: "Back.Out" });
      if (h.kind === 3) {
        this.tweens.add({ targets: icon, alpha: 0.35, duration: 300, yoyo: true, repeat: -1, ease: "Stepped" });
        sfx("alarm");
        this.cameras.main.shake(260, 0.006);
      } else if (h.kind === 1) {
        sfx("alarm");
      }
      this.label(h.kind === 2 ? x + 5 : x, y, h.label, h.kind === 3 ? "#ff8a8a" : h.kind === 1 ? "#fed018" : "#8fd3ff", h.dy);
      this.print(h.log, h.kind === 3 ? "#ff8a8a" : undefined);
      setClock(h.log.slice(0, 5));
      await wait(650);
    }

    if (this.fin.inset) await this.runInset(pts[pts.length - 1]);
    if (this.fin.closing) {
      // todas las puertas se cierran, una tras otra, en verde
      for (let i = pts.length - 1; i >= 0; i--) {
        const [x, y] = pts[i];
        const ok = this.add.sprite(x, y, "net_icons", 4).setDepth(12);
        this.tweens.add({ targets: ok, scale: { from: 2.4, to: 1 }, duration: 240, ease: "Back.Out" });
        this.print(`03:34  ${HOPS[i].label}: puerta cerrada`, "#9be3a8");
        sfx("success");
        await wait(420);
      }
    }

    // el intruso recorre la ruta en bucle (salvo en el final: ya no queda nadie)
    const end = pts[pts.length - 1];
    if (!this.fin.closing) {
    const dot = this.add.rectangle(end[0], end[1], 3, 3, 0xff2448).setDepth(11);
    const path = [...pts].reverse();
    const loop = async () => {
      for (let i = 1; i < path.length; i++) {
        await new Promise<void>((r) =>
          this.tweens.add({ targets: dot, x: path[i][0], y: path[i][1], duration: 700, onComplete: () => r() }),
        );
      }
      dot.setPosition(path[0][0], path[0][1]);
    };
    this.time.addEvent({ delay: 3000, loop: true, callback: () => void loop() });
    void loop();
    }

    await wait(900);
    await playDialog(this.fin.dialog);
    if (this.fin.epilogue) {
      await fadeOut();
      await playDialog(this.fin.epilogue);
      await fadeIn();
    }

    save.actComplete = true;
    writeSave(save);
    this.endCard();
  }

  /** Ampliación de Alemania Occidental con los últimos saltos. */
  private async runInset(from: [number, number]): Promise<void> {
    const box = { x: 296, y: 128, w: 120, h: 70 };
    const g = this.add.graphics().setDepth(20);
    g.fillStyle(0x070a14, 0.95).fillRect(box.x, box.y, box.w, box.h);
    g.lineStyle(1, 0x8fd3ff, 1).strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
    // línea punteada desde Europa hasta la ampliación
    const lens = this.add.graphics().setDepth(19);
    const n = 40;
    for (let i = 0; i < n; i += 2) {
      const t = i / n;
      lens.fillStyle(0x8fd3ff, 0.7).fillRect(Math.round(from[0] + (box.x + box.w - from[0]) * t), Math.round(from[1] + (box.y - from[1]) * t), 1, 1);
    }
    // contorno muy simplificado de Alemania Occidental, en puntos
    const shape = [[18, 12], [44, 8], [62, 14], [84, 20], [96, 34], [92, 56], [70, 62], [44, 60], [24, 48], [14, 30]];
    const poly = shape.map(([x, y]) => [x, y] as LL);
    for (let y = 6; y < 66; y += 3)
      for (let x = 8; x < 112; x += 3)
        if (inside([x, y], poly)) g.fillStyle((x + y) % 7 === 0 ? 0x3d5e8c : 0x2b3a63, 1).fillRect(box.x + x, box.y + y, 2, 2);
    this.label(box.x - 6, box.y - 4, "ALEMANIA OCCIDENTAL", "#8fd3ff", -4);
    let prev: [number, number] | null = null;
    for (const nd of this.fin.inset!.nodes) {
      const p: [number, number] = [box.x + nd.x, box.y + nd.y];
      if (prev) await this.drawLink(prev, p, 900);
      const icon = this.add.sprite(p[0], p[1], "net_icons", nd.kind).setDepth(21);
      this.tweens.add({ targets: icon, scale: { from: 2.2, to: 1 }, duration: 260, ease: "Back.Out" });
      if (nd.kind === 3) {
        this.tweens.add({ targets: icon, alpha: 0.35, duration: 300, yoyo: true, repeat: -1, ease: "Stepped" });
        sfx("alarm");
        this.cameras.main.shake(260, 0.006);
      }
      const lbl = this.label(p[0], p[1], nd.label, nd.kind === 3 ? "#ff8a8a" : "#8fd3ff");
      lbl.style.zIndex = "2";
      this.print(nd.log, nd.kind === 3 ? "#ff8a8a" : undefined);
      setClock(nd.log.slice(0, 5));
      prev = p;
      await wait(700);
    }
  }

  private endCard(): void {
    setObjective(null);
    const acts = MISSIONS.filter((m) => m.act === this.act);
    const next = this.fin.next;
    const c = el("div", "endcard pixel-frame");
    c.innerHTML = `
      <h2>${this.fin.closing ? "HISTORIA COMPLETADA" : `ACTO ${this.act} COMPLETADO`}</h2>
      <p>${this.act === 1 ? "Empezaste sin saber programar. Ya sabes:" : "Nuevo en tu cuaderno:"}</p>
      <ul>${this.fin.learned.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>
      <div class="cheat"><small>CHULETA DEL ACTO</small>${acts
        .map((m) => `<div><span>${esc(m.concept)}</span><code>${esc(CHEAT[m.id] ?? "")}</code></div>`)
        .join("")}</div>
      ${(() => {
        const sets = TRAINING.filter((t) => t.exercises[0].act === this.act && (save.training[t.id] ?? 0) >= t.exercises.length);
        return sets.length ? `<p class="with-marga">Con Margarita: ${sets.map((t) => esc(t.title)).join(" · ")} · ${sets.length * 3} ejercicios de práctica</p>` : "";
      })()}
      <table class="stats">${acts.map((m) => {
        const a = save.attempts[m.id] ?? 1;
        const h = save.hintsUsed[m.id] ?? 0;
        const star = a === 1 && h === 0 ? "PERFECTO" : h === 0 ? "SIN PISTAS" : `${h} PISTA${h > 1 ? "S" : ""}`;
        return `<tr><td>${esc(m.title)}</td><td>${a} intento${a > 1 ? "s" : ""}</td><td class="${a === 1 && h === 0 ? "gold" : ""}">${star}</td></tr>`;
      }).join("")}</table>
      ${this.fin.closing ? `<div class="levelup"><small>NIVEL ALCANZADO</small><b>Desarrollador JavaScript junior</b><span>Nivel 1 de varios · el camino sigue</span></div>` : ""}
      ${this.fin.closing ? `<p>${MISSIONS.length} misiones resueltas · ${MISSIONS.filter((m) => (save.attempts[m.id] ?? 1) === 1 && !(save.hintsUsed[m.id] ?? 0)).length} perfectas. Todo lo aprendido sigue en tu cuaderno.</p>` : ""}
      <p>${esc(this.fin.teaser)}</p>
      <div class="row"><button class="btn primary back">${next ? `CONTINUAR: ACTO ${next}` : "VOLVER AL LABORATORIO"}</button><button class="btn menu">MENU PRINCIPAL</button></div>
    `;
    this.layer!.append(c);
    c.style.pointerEvents = "auto";
    c.style.zIndex = "10";
    sfx("success");
    (c.querySelector(".back") as HTMLButtonElement).onclick = async () => {
      await fadeOut();
      this.scene.start("lab", { mode: "play" });
    };
    (c.querySelector(".menu") as HTMLButtonElement).onclick = async () => {
      await fadeOut();
      this.scene.start("lab", { mode: "title" });
      await fadeIn();
    };
    (c.querySelector(".back") as HTMLButtonElement).focus();
  }
}
