import Phaser from "phaser";
import { VIEW_H, VIEW_W } from "../config";
import { save, writeSave } from "../game/state";
import { MISSIONS } from "../game/missions";
import { playDialog } from "../ui/dialog";
import { fadeIn, fadeOut } from "../ui/fade";
import { el, esc, ui, wait } from "../ui/dom";
import { setClock, setObjective, hudVisible } from "../ui/hud";
import { sfx } from "../audio/sfx";

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

const HOPS: { ll: LL; label: string; log: string; kind: number; dy?: number }[] = [
  { ll: [-122.3, 37.9], label: "BERKELEY", log: "02:51  CONEXION ENTRANTE  cuenta=hunter", kind: 1, dy: -6 },
  { ll: [-119.5, 36.2], label: "TYMNET OAKLAND", log: "02:52  la llamada entra por Tymnet", kind: 0, dy: 10 },
  { ll: [-77.2, 38.9], label: "COSTA ESTE", log: "02:53  rebota en la costa este", kind: 0 },
  { ll: [-42, 50], label: "SATELITE", log: "02:53  enlace transatlantico", kind: 2 },
  { ll: [9.7, 52.4], label: "???", log: "02:54  ORIGEN: FUERA DEL PAIS", kind: 3 },
];

export class NetScene extends Phaser.Scene {
  private layer: HTMLDivElement | null = null;

  constructor() {
    super("net");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#070a14");
    hudVisible(true);
    setObjective("RASTREO", "Sigue la llamada.");
    setClock("02:51");

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
    const pts = HOPS.map((h) => project(h.ll).map(Math.round) as [number, number]);

    for (let i = 0; i < HOPS.length; i++) {
      const h = HOPS[i];
      const [x, y] = pts[i];
      if (i > 0) await this.drawLink(pts[i - 1], pts[i], i === 3 || i === 4 ? 1300 : 800);
      const icon = this.add.sprite(x, y, "net_icons", h.kind).setDepth(10);
      this.tweens.add({ targets: icon, scale: { from: 2.2, to: 1 }, duration: 260, ease: "Back.Out" });
      if (h.kind === 3) {
        this.tweens.add({ targets: icon, alpha: 0.35, duration: 300, yoyo: true, repeat: -1, ease: "Stepped" });
        sfx("alarm");
        this.cameras.main.shake(260, 0.006);
      } else if (h.kind === 1) {
        sfx("alarm");
      }
      this.label(x, y, h.label, h.kind === 3 ? "#ff8a8a" : h.kind === 1 ? "#fed018" : "#8fd3ff", h.dy);
      this.print(h.log, h.kind === 3 ? "#ff8a8a" : undefined);
      setClock(h.log.slice(0, 5));
      await wait(650);
    }

    // el intruso recorre la ruta en bucle
    const dot = this.add.rectangle(pts[4][0], pts[4][1], 3, 3, 0xff2448).setDepth(11);
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

    await wait(900);
    await playDialog([
      { who: "sam", text: "No es un estudiante aburrido. La llamada cruza un océano." },
      { who: "sam", text: "Setenta y cinco centavos. Alguien al otro lado del mundo está usando nuestra máquina para llegar a otra parte." },
      { who: "sam", text: "Si la cierro, desaparece. Si lo observo... quizá me lleve hasta él." },
    ]);

    save.actComplete = true;
    writeSave(save);
    this.endCard();
  }

  private endCard(): void {
    setObjective(null);
    const c = el("div", "endcard pixel-frame");
    c.innerHTML = `
      <h2>ACTO 1 COMPLETADO</h2>
      <p>Empezaste sin saber programar. Ya sabes:</p>
      <ul><li>let</li><li>+ - * /</li><li>textos y \`\${}\`</li><li>if / else</li><li>for</li><li>console.log</li></ul>
      <table class="stats">${MISSIONS.map((m) => {
        const a = save.attempts[m.id] ?? 1;
        const h = save.hintsUsed[m.id] ?? 0;
        const star = a === 1 && h === 0 ? "PERFECTO" : h === 0 ? "SIN PISTAS" : `${h} PISTA${h > 1 ? "S" : ""}`;
        return `<tr><td>${esc(m.title)}</td><td>${a} intento${a > 1 ? "s" : ""}</td><td class="${a === 1 && h === 0 ? "gold" : ""}">${star}</td></tr>`;
      }).join("")}</table>
      <p>Próximamente — Acto 2, "La trampa": arrays, funciones y un archivo falso para que el intruso muerda el anzuelo.</p>
      <div class="row"><button class="btn primary back">VOLVER AL LABORATORIO</button><button class="btn menu">MENU PRINCIPAL</button></div>
    `;
    this.layer!.append(c);
    c.style.pointerEvents = "auto";
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
