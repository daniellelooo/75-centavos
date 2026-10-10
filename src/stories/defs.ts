// Cada historia nueva: datos de portada, reparto, sus lugares (uno por parte de la
// historia), lo que hacen los personajes cuando nadie les habla y la escena final.
// El contenido (diálogos y misiones) va aparte, en src/stories/<id>/content.ts.
import type { CharName } from "../config";
import { sfx } from "../audio/sfx";
import { ROOM_W, frame, kenney, terminalDesk } from "../scenes/places";
import { el, ui, wait } from "../ui/dom";
import type { StoryId } from "./registry";
import { anim, carpet, firework, planks, tiles, wall, type FinaleCtx, type RoomDef } from "./room";

export type { StoryFlavor } from "./room";

export interface StoryDef {
  id: StoryId;
  level: number;
  title: string;
  /** Línea pequeña sobre el título: "MOUNTAIN VIEW · 1995". */
  kicker: string;
  tagline: string;
  /** Lo que sale arriba del editor de la terminal. */
  prompt: string;
  player: CharName;
  cast: CharName[];
  /** Vocabulario de JavaScript que se autocompleta (índice de misión de 75 Centavos). */
  vocabAt: number;
  /** Frases sueltas cuando se habla con alguien que no tiene encargo. */
  idle: Partial<Record<CharName, string[]>>;
  rooms: RoomDef[];
  /** En qué lugar ocurre la misión de ese índice (0 a 11). */
  roomOf(mission: number): string;
  /** Escena antes del diálogo final. */
  finale?(f: FinaleCtx): Promise<void>;
}

/** Destello blanco de cámara de fotos sobre todo el cuarto. */
async function flash(f: FinaleCtx) {
  const r = f.scene.add.rectangle(-80, -40, ROOM_W + 160, 280, 0xffffff, 0).setOrigin(0, 0).setDepth(19000);
  sfx("flash");
  await new Promise<void>((done) => f.scene.tweens.chain({ targets: r, tweens: [{ alpha: 0.75, duration: 40 }, { alpha: 0, duration: 260 }], onComplete: () => done() }));
  r.destroy();
}

function cheer(f: FinaleCtx, who: CharName[]) {
  who.forEach((w, i) => {
    const s = f.sprites[w];
    if (!s) return;
    f.scene.time.delayedCall(i * 160, () => {
      f.hop(s);
      f.bubble(s, "alegre");
    });
  });
}

// ------------------------------------------------------------------ Diez días

const ddOficina: RoomDef = {
  key: "oficina",
  card: ["Nébula Communications", "Mountain View, mayo de 1995"],
  build(c) {
    tiles(c, 0x5a6478, 0x545e72, 0x4a5266);
    wall(c, 0xd8d0c0, 0x3e6ea8, 0x8a8478);
    frame(c, undefined, 0x3a3f52);
    c.img("posters", 18, 6, 1).setDepth(3);
    c.img("chalkboard", 46, 6).setDepth(3);
    c.img("calendar", 104, 12).setDepth(3);
    c.img("window", 140, 2, 0).setDepth(3);
    c.img("clock", 184, 8).setDepth(3);
    c.img("posters", 228, 6, 0).setDepth(3);
    terminalDesk(c);
    c.prop("chair", 212, 64);
    // escritorio de Kraus, con su propia terminal y su teléfono
    c.prop("desk", 30, 96);
    anim(c, "terminal", 40, 86, "term-on", 122);
    c.solid(30, 106, 48, 14);
    c.prop("chair", 46, 114);
    c.prop("phone", 64, 99).setDepth(100 + 99 + 30);
    c.prop("mug", 34, 100).setDepth(100 + 100 + 30);
    anim(c, "server_rack", 292, 8, "rack-blink", 50);
    c.solid(292, 40, 22, 10);
    c.prop("beanbag", 118, 138);
    c.solid(120, 148, 26, 10);
    c.prop("pizza_boxes", 250, 150);
    c.solid(252, 158, 22, 8);
    c.prop("soda_cans", 262, 60);
    // el puesto de Wes, con su contador de visitas en pantalla
    c.prop("desk", 250, 98);
    anim(c, "terminal", 260, 88, "term-alert", 124);
    c.solid(250, 108, 48, 14);
    c.prop("kenney", 300, 150, kenney(16, 0));
    c.solid(302, 160, 12, 6);
    c.prop("kenney", 4, 150, kenney(17, 0));
    c.solid(6, 160, 12, 6);
    c.prop("book_piles", 160, 150);
    c.solid(162, 160, 24, 8);
    c.prop("trash", 8, 60);
  },
  spawn: [150, 176],
  homes: { kraus: [96, 120], wes: [274, 140] },
  terminal: { x: 216, y: 74, mark: [213, 30] },
  flavor: [
    { id: "pizarra", x: 68, y: 46, r: 16, label: "Pizarra", lines: [{ who: "lena", text: "«QUEDAN 10 DÍAS». Alguien tacha un número cada mañana. Con mucha fuerza." }] },
    { id: "servidor", x: 302, y: 54, r: 14, label: "Servidor", lines: [{ who: "lena", text: "Aquí vive nebula.com. Si se apaga, se apaga la empresa." }] },
    { id: "pizza", x: 262, y: 166, r: 14, label: "Cajas de pizza", lines: [{ who: "lena", text: "Pizza fría del martes. O del lunes. Nadie lo sabe." }] },
    { id: "puf", x: 132, y: 160, r: 14, label: "Puf", lines: [{ who: "lena", text: "Aquí duerme Wes desde el día cuatro. Tiene la forma exacta de Wes." }] },
  ],
  atmosphere: () => ({ daylight: [{ x: 146, w: 20 }] }),
  steam: [[37, 99]],
  routines: {
    kraus: [
      { path: [[96, 132], [96, 60], [70, 52]], face: "up", emote: "idea", ms: 2600, sound: "click" },
      { path: [[96, 132], [150, 132], [150, 90]], face: "down", emote: "serio", ms: 2200 },
    ],
    wes: [
      { path: [[310, 140], [310, 58]], face: "up", emote: "sudor", ms: 2400, sound: "key" },
      { path: [[240, 140], [240, 152]], face: "right", emote: "corazon", ms: 2000 },
    ],
  },
};

const ddDemo: RoomDef = {
  key: "demo",
  card: ["Sala de prensa", "Mountain View, día diez"],
  build(c) {
    carpet(c, 0x6a2232, 0x5e1e2c);
    const w = wall(c, 0x232a48, 0xc9962e, 0x161b30);
    // estandartes de la beta a los lados de la pantalla
    for (const x of [100, 206]) {
      w.fillStyle(0x3e6ea8, 1).fillRect(x, 4, 14, 28);
      w.fillStyle(0xfed018, 1).fillRect(x + 3, 8, 8, 2).fillRect(x + 5, 12, 4, 14);
    }
    frame(c, undefined, 0x161b30);
    anim(c, "projector_screen", 130, 0, null, -97, "screen").setDepth(3);
    // atril con la terminal de la demo
    c.prop("desk", 52, 52);
    anim(c, "terminal", 62, 42, "term-on", 78);
    c.solid(52, 62, 48, 14);
    c.prop("lamp", 80, 50);
    // tres filas de periodistas a cada lado del pasillo
    [100, 124, 148].forEach((y, i) => {
      anim(c, "audience", 14, y, "crowd-murmur", y + 10, i === 0 ? "crowdL" : undefined);
      anim(c, "audience", 206, y, "crowd-murmur", y + 10, i === 0 ? "crowdR" : undefined);
      c.solid(14, y + 6, 100, 16);
      c.solid(206, y + 6, 100, 16);
    });
    c.prop("kenney", 4, 56, kenney(16, 0));
    c.solid(6, 66, 12, 6);
    c.prop("kenney", 300, 56, kenney(17, 0));
    c.solid(302, 66, 12, 6);
  },
  spawn: [160, 176],
  homes: { kraus: [200, 72], wes: [262, 76] },
  terminal: { x: 76, y: 84, mark: [73, 36] },
  flavor: [
    { id: "pantalla", x: 160, y: 56, r: 18, label: "Pantalla", lines: [{ who: "lena", text: "Cuando escriba en la terminal, la página saldrá aquí, enorme. Y yo con ella." }] },
    { id: "prensa", x: 160, y: 120, r: 18, label: "Periodistas", lines: [{ who: "lena", text: "Uno escribe «otro navegador más» en su libreta. Otro ya se durmió." }] },
  ],
  atmosphere: () => ({
    night: [
      { x: 160, y: 30, r: 130, color: [190, 210, 255], power: 1 },
      { x: 76, y: 60, r: 56, color: [255, 190, 120], power: 1 },
      { x: 230, y: 80, r: 70, color: [255, 220, 170], power: 0.85 },
      { x: 64, y: 130, r: 80, color: [255, 220, 170], power: 0.7 },
      { x: 256, y: 130, r: 80, color: [255, 220, 170], power: 0.7 },
      { x: 160, y: 170, r: 50, color: [255, 220, 170], power: 0.6 },
    ],
  }),
  routines: {
    kraus: [{ path: [[200, 72], [124, 72]], face: "down", emote: "serio", ms: 2400 }],
    wes: [{ path: [[262, 76], [262, 92]], face: "left", emote: "brillo", ms: 1800, sound: "click" }],
  },
};

const diezDias: StoryDef = {
  id: "diez-dias",
  level: 2,
  title: "Diez días",
  kicker: "MOUNTAIN VIEW · 1995",
  tagline: "Las páginas web eran papel quieto. Tienes diez días para que cobren vida.",
  prompt: "LENA@NEBULA:~$ editor",
  player: "lena",
  cast: ["kraus", "wes"],
  vocabAt: 29,
  idle: {
    kraus: ["Cada día que pasa es un día menos. No es filosofía, es el calendario.", "Imagina a un millón de personas haciendo clic en algo que tú hiciste.", "¿Sabes qué vende un navegador? Que pase algo cuando tocas la página."],
    wes: ["Mi contador de visitas va por 41. Doce son mías. Bueno, veinte.", "El gris es el color de la web. Por ahora.", "Un gif de obras es arte. No me discutas."],
  },
  rooms: [ddOficina, ddDemo],
  roomOf: (m) => (m >= 11 ? "demo" : "oficina"),
  async finale(f) {
    f.props.screen?.setFrame(1);
    sfx("success");
    await f.wait(600);
    for (let i = 0; i < 3; i++) {
      await flash(f);
      await f.wait(220);
    }
    for (const k of ["crowdL", "crowdR"]) f.props[k]?.play("crowd-clap");
    for (let i = 0; i < 8; i++) f.scene.time.delayedCall(i * 140, () => sfx("clap"));
    cheer(f, ["lena", "kraus", "wes"]);
    await f.wait(1600);
  },
};

// ------------------------------------------------------------------ La consulta

const lcLab: RoomDef = {
  key: "laboratorio",
  card: ["Laboratorio de investigación", "San José, California, 1974"],
  build(c) {
    tiles(c, 0xcbbd9c, 0xbcae8d, 0xa89a7a);
    wall(c, 0x5d7a6a, 0x7c9a87, 0x3d5e4c);
    frame(c, undefined, 0x3d5e4c);
    c.img("chalkboard", 30, 6).setDepth(3);
    c.img("clock", 96, 8).setDepth(3);
    c.img("window", 120, 2, 2).setDepth(3);
    c.img("calendar", 166, 12).setDepth(3);
    // la computadora central: armario de control y cuatro unidades de cinta
    anim(c, "vax_panel", 234, 6, "vax-panel", 40);
    for (const x of [250, 266, 282, 298]) anim(c, "vax_tape", x, 6, "vax-tape", 40);
    c.solid(234, 30, 80, 12);
    terminalDesk(c);
    c.prop("chair", 212, 64);
    // archivo de tarjetas de Pat
    c.prop("filing", 6, 28);
    c.prop("filing", 22, 28);
    c.solid(6, 44, 30, 10);
    anim(c, "card_sorter", 34, 104, "sorter-run", 130);
    c.solid(34, 112, 40, 18);
    c.prop("table", 128, 116);
    c.prop("papers", 134, 116).setDepth(100 + 116 + 30);
    c.prop("mug", 146, 117).setDepth(100 + 117 + 30);
    c.solid(128, 122, 26, 10);
    c.prop("coatrack", 300, 140);
    c.solid(302, 166, 12, 6);
    c.prop("printer", 160, 40);
    anim(c, "printer", 160, 40, "printer-run", 58);
    c.solid(160, 48, 20, 10);
    c.prop("table", 168, 140);
    c.prop("papers", 172, 140).setDepth(100 + 140 + 30);
    c.solid(168, 146, 26, 10);
    c.prop("kenney", 4, 158, kenney(17, 0));
    c.solid(6, 168, 12, 6);
  },
  spawn: [150, 176],
  homes: { fenton: [62, 70], pat: [92, 124] },
  terminal: { x: 216, y: 74, mark: [213, 30] },
  flavor: [
    { id: "pizarra", x: 52, y: 46, r: 16, label: "Pizarra", lines: [{ who: "nora", text: "Una tabla dibujada con tiza: filas, columnas y una flecha que dice «¡SOLO ESTO!»." }] },
    { id: "cintas", x: 274, y: 48, r: 18, label: "Unidades de cinta", lines: [{ who: "nora", text: "Las cintas giran a tirones. Cada vuelta es una pregunta que alguien tardó semanas en programar." }] },
    { id: "clasificadora", x: 54, y: 136, r: 16, label: "Clasificadora", lines: [{ who: "pat", text: "Ordena tarjetas por una columna. Una. Si quiere dos, son dos tardes.", mood: "serio" }] },
  ],
  atmosphere: () => ({ daylight: [{ x: 126, w: 20 }] }),
  steam: [[149, 116]],
  routines: {
    fenton: [
      { path: [[62, 70], [52, 54]], face: "up", emote: "idea", ms: 2800, sound: "click" },
      { path: [[62, 70], [110, 70], [110, 100]], face: "down", emote: "duda", ms: 2000 },
    ],
    pat: [
      { path: [[92, 124], [92, 84], [22, 84], [22, 62]], face: "up", emote: "sudor", ms: 2600 },
      { path: [[92, 124], [92, 150], [140, 150], [140, 136]], face: "up", emote: "cafe", ms: 2200, sound: "coffee" },
    ],
  },
};

const lcJuntas: RoomDef = {
  key: "juntas",
  card: ["Sala de juntas", "San José, finales de mayo de 1974"],
  build(c) {
    planks(c, 0x5c3a24, 0x64402a, 0x3a2416);
    const w = wall(c, 0x8a5a36, 0xc08a5a, 0x5e3c26);
    for (let x = 4; x < ROOM_W; x += 20) w.fillStyle(0x744a2c, 1).fillRect(x, 4, 14, 18);
    frame(c, undefined, 0x3a2416);
    anim(c, "projector_screen", 24, 0, null, -97, "screen").setDepth(3);
    c.img("window", 250, 2, 0).setDepth(3);
    c.img("clock", 186, 8).setDepth(3);
    // la mesa larga y los seis directivos, de espaldas, mirando la pantalla
    c.prop("long_table", 96, 70);
    c.solid(96, 76, 128, 16);
    anim(c, "directors", 110, 94, "board-murmur", 110, "directors");
    c.solid(110, 100, 100, 16);
    // la terminal del laboratorio, traída con un cable muy largo
    c.prop("desk", 236, 112);
    anim(c, "terminal", 246, 102, "term-on", 138);
    c.solid(236, 122, 48, 14);
    c.prop("chair", 252, 130);
    const g = c.scene.add.graphics().setDepth(1);
    g.fillStyle(0x1c1830, 1).fillRect(306, 40, 1, 90).fillRect(284, 129, 23, 1);
    c.prop("kenney", 4, 150, kenney(16, 0));
    c.solid(6, 160, 12, 6);
    c.prop("coatrack", 300, 150);
    c.solid(302, 176, 12, 6);
    c.prop("mug", 120, 72).setDepth(100 + 72 + 30);
    c.prop("papers", 150, 72).setDepth(100 + 72 + 30);
  },
  spawn: [160, 176],
  homes: { fenton: [64, 76], pat: [200, 150] },
  terminal: { x: 258, y: 150, mark: [255, 96] },
  flavor: [
    { id: "directivos", x: 160, y: 124, r: 18, label: "Directivos", lines: [{ who: "nora", text: "Seis trajes grises. Uno ya mira el reloj. Otro, a mí." }] },
    { id: "cable", x: 296, y: 132, r: 12, label: "Cable", lines: [{ who: "pat", text: "Cuarenta metros de cable por tres pisos. Si alguien tropieza, se acabó la demostración.", mood: "serio" }] },
  ],
  atmosphere: () => ({ daylight: [{ x: 256, w: 20 }] }),
  steam: [[123, 71]],
  routines: {
    fenton: [{ path: [[64, 76], [64, 56]], face: "up", emote: "duda", ms: 2400 }],
    pat: [{ path: [[200, 150], [226, 150]], face: "right", emote: "serio", ms: 2000 }],
  },
};

const laConsulta: StoryDef = {
  id: "la-consulta",
  level: 3,
  title: "La consulta",
  kicker: "SAN JOSÉ · 1974",
  tagline: "Los datos viven en cintas y tarjetas. Alguien propone preguntarles en un idioma casi humano.",
  prompt: "NORA@LAB-SJ:~$ consulta",
  player: "nora",
  cast: ["fenton", "pat"],
  vocabAt: 29,
  idle: {
    fenton: ["Una tabla es una relación. Una relación es una idea. Las ideas no se rompen.", "¿Sabe qué es lo bonito de una consulta? Que no le dice a la máquina cómo, solo qué.", "Mis colegas dicen que esto nunca funcionará. Mis colegas usan regla de cálculo."],
    pat: ["Treinta mil tarjetas. Si se caen al suelo, me jubilo.", "El café de la máquina es malo, pero es puntual.", "Si su consulta ahorra un programa, me invita a almorzar."],
  },
  rooms: [lcLab, lcJuntas],
  roomOf: (m) => (m >= 11 ? "juntas" : "laboratorio"),
  async finale(f) {
    f.props.screen?.setFrame(2);
    sfx("success");
    await f.wait(900);
    f.props.directors?.play("board-clap");
    for (let i = 0; i < 6; i++) f.scene.time.delayedCall(i * 170, () => sfx("clap"));
    cheer(f, ["nora", "fenton", "pat"]);
    await f.wait(1700);
  },
};

// ------------------------------------------------------------------ Código Cuervo

const ccBiblioteca: RoomDef = {
  key: "biblioteca",
  card: ["Hawthorn Hall", "La biblioteca, invierno de 1941"],
  build(c) {
    planks(c, 0x6e4c2c, 0x765232, 0x4a321e);
    wall(c, 0x8a9a7a, 0x6e7e60, 0x5c4a36);
    frame(c, undefined, 0x4a321e);
    c.img("kenney", 120, 8, kenney(20, 14)).setDepth(3);
    c.img("kenney", 136, 8, kenney(21, 14)).setDepth(3);
    c.img("chalkboard", 62, 6).setDepth(3);
    c.img("clock", 166, 8).setDepth(3);
    c.img("calendar", 184, 12).setDepth(3);
    c.img("window", 252, 2, c.act >= 2 ? 3 : 2).setDepth(3);
    // la radio de escucha, donde llegan los mensajes de la red Cuervo
    c.prop("workbench", 6, 28);
    anim(c, "radio_rig", 14, 22, "radio-rx", 50);
    c.solid(6, 38, 48, 12);
    terminalDesk(c);
    c.prop("lamp", 226, 44);
    c.prop("chair", 212, 64);
    // la mesa de cartas náuticas con la ruta del convoy, sobre una alfombra gastada
    c.img("rug", 98, 92).setDepth(1);
    anim(c, "map_table", 104, 98, "map-route", 126);
    c.solid(104, 104, 52, 18);
    c.prop("chair", 84, 104);
    c.prop("chair", 158, 104).setFlipX(true);
    c.prop("table", 268, 120);
    c.prop("mug", 276, 121).setDepth(100 + 121 + 30);
    c.prop("papers", 284, 119).setDepth(100 + 119 + 30);
    c.solid(268, 126, 26, 10);
    c.prop("filing", 300, 28);
    c.solid(300, 44, 14, 10);
    c.prop("coatrack", 8, 140);
    c.solid(10, 166, 12, 6);
    // la biblioteca de la mansión: estanterías y libros apilados por todas partes
    for (const [x, t] of [[24, 20], [40, 21], [56, 20]] as const) c.prop("kenney", x, 150, kenney(t, 17));
    c.solid(24, 158, 48, 8);
    c.prop("kenney", 286, 150, kenney(20, 17));
    c.prop("kenney", 302, 150, kenney(21, 17));
    c.solid(286, 158, 32, 8);
    c.prop("book_piles", 220, 150);
    c.solid(222, 160, 24, 8);
    // la estufa de carbón, con el fuego que se aviva
    anim(c, "stove", 166, 134, "stove-fire", 174);
    c.solid(166, 164, 20, 10);
  },
  spawn: [150, 176],
  homes: { penrose: [64, 70], hale: [184, 116] },
  terminal: { x: 216, y: 74, mark: [213, 30] },
  flavor: [
    { id: "radio", x: 34, y: 60, r: 16, label: "Radio de escucha", lines: [{ who: "iris", text: "Pitidos en morse, día y noche. Alguien en otra mansión los apunta a mano." }] },
    { id: "carta", x: 130, y: 128, r: 18, label: "Carta náutica", lines: [{ who: "hale", text: "Esos alfileres son barcos. No se mueven solos: los movemos nosotros, con lo que usted descifre.", mood: "serio" }] },
    { id: "te", x: 280, y: 138, r: 14, label: "Té", lines: [{ who: "iris", text: "Té frío con demasiado azúcar. El de Penrose. No lo toques." }] },
    { id: "estufa", x: 176, y: 180, r: 12, label: "Estufa", lines: [{ who: "iris", text: "La única cosa caliente de la mansión. Penrose dice que le habla en código." }] },
  ],
  atmosphere: (act) => ({ snow: [{ x: 252, y: 2 }], daylight: act === 1 ? [{ x: 258, w: 20 }] : undefined }),
  steam: [[279, 120], [175, 134]],
  routines: {
    penrose: [
      { path: [[64, 70], [34, 62]], face: "up", emote: "duda", ms: 2800, sound: "ring" },
      { path: [[64, 70], [64, 88], [260, 88], [276, 112]], face: "down", emote: "cafe", ms: 2400, sound: "coffee" },
    ],
    hale: [
      { path: [[184, 116], [184, 134], [130, 134]], face: "up", emote: "serio", ms: 2600 },
      { path: [[184, 116], [184, 60]], face: "up", emote: "sudor", ms: 2000 },
    ],
  },
};

const ccOperaciones: RoomDef = {
  key: "operaciones",
  card: ["Sala de operaciones", "Hawthorn Hall, febrero de 1942"],
  build(c) {
    tiles(c, 0x6a6a76, 0x5c5c66, 0x45454f);
    wall(c, 0x3d5e4c, 0x2f4a3c, 0x2a2140);
    frame(c, undefined, 0x2a2140);
    anim(c, "wall_map", 104, 4, null, -97, "map").setDepth(3);
    c.img("window", 260, 2, 3).setDepth(3);
    c.img("clock", 232, 10).setDepth(3);
    c.prop("workbench", 6, 28);
    anim(c, "radio_rig", 14, 22, "radio-rx", 50);
    c.solid(6, 38, 48, 12);
    terminalDesk(c);
    c.prop("lamp", 226, 44);
    c.prop("chair", 212, 64);
    c.img("rug", 104, 96).setDepth(1);
    anim(c, "map_table", 110, 102, "map-route", 130, "table");
    c.solid(110, 108, 52, 18);
    c.prop("lamp", 128, 92).setDepth(100 + 130 + 2);
    c.prop("phone", 60, 34).setDepth(100 + 50 + 2);
    c.prop("filing", 284, 28);
    c.prop("filing", 300, 28);
    c.solid(284, 44, 30, 10);
    c.prop("table", 40, 150);
    c.prop("mug", 46, 151).setDepth(100 + 151 + 30);
    c.prop("papers", 56, 149).setDepth(100 + 149 + 30);
    c.solid(40, 156, 26, 10);
    c.prop("coatrack", 300, 146);
    c.solid(302, 172, 12, 6);
  },
  spawn: [150, 176],
  homes: { penrose: [60, 76], hale: [196, 118] },
  terminal: { x: 216, y: 74, mark: [213, 30] },
  flavor: [
    { id: "mapa", x: 160, y: 50, r: 22, label: "Carta del Atlántico", lines: [{ who: "hale", text: "Cuarenta barcos. Esa línea roja es hacia donde van. Mañana puede ser hacia donde los esperan.", mood: "serio" }] },
    { id: "telefono", x: 66, y: 56, r: 12, label: "Teléfono", lines: [{ who: "iris", text: "Línea directa con el puerto. Cada vez que suena, Hale contesta antes del segundo timbre." }] },
  ],
  atmosphere: () => ({
    night: [
      { x: 136, y: 112, r: 90, color: [255, 200, 130], power: 1 },
      { x: 230, y: 54, r: 60, color: [255, 200, 130], power: 1 },
      { x: 50, y: 60, r: 64, color: [255, 160, 60], power: 0.9 },
      { x: 160, y: 24, r: 80, color: [180, 200, 255], power: 0.7 },
      { x: 196, y: 120, r: 50, color: [255, 200, 130], power: 0.8 },
      { x: 60, y: 150, r: 50, color: [255, 200, 130], power: 0.7 },
    ],
    rain: [{ x: 260, y: 2 }],
    lightning: true,
  }),
  steam: [[49, 150]],
  routines: {
    hale: [
      { path: [[196, 118], [180, 118], [180, 60]], face: "up", emote: "serio", ms: 2600 },
      { path: [[196, 118], [196, 140], [136, 140]], face: "up", emote: "sudor", ms: 2200 },
    ],
    penrose: [{ path: [[60, 76], [34, 62]], face: "up", emote: "duda", ms: 2800, sound: "ring" }],
  },
};

const codigoCuervo: StoryDef = {
  id: "codigo-cuervo",
  level: 4,
  title: "Código Cuervo",
  kicker: "INGLATERRA · 1941",
  tagline: "Llegan mensajes cifrados que esconden la ruta de los convoyes. Cada hora cuenta.",
  prompt: "IRIS@HAWTHORN:~$ maquina",
  player: "iris",
  cast: ["penrose", "hale"],
  vocabAt: 29,
  idle: {
    penrose: ["La tetera y yo estamos de acuerdo: el patrón está ahí. Solo hay que mirarlo bien.", "Un mensaje cifrado es un crucigrama con mal carácter.", "No me pregunte cómo funciona la máquina. Funciona. Eso basta."],
    hale: ["Cada hora sin descifrar es una hora que los barcos navegan a ciegas.", "En la marina no hay crucigramas. Hay horarios.", "Hágalo bien. Después, hágalo rápido."],
  },
  rooms: [ccBiblioteca, ccOperaciones],
  roomOf: (m) => (m >= 8 ? "operaciones" : "biblioteca"),
  async finale(f) {
    sfx("ring");
    await f.wait(500);
    // el convoy gira al sur: la ruta parpadea entre las dos y se queda en la nueva
    for (let i = 0; i < 6; i++) {
      f.props.map?.setFrame(i % 2 ? 0 : 1);
      f.props.table?.anims.stop();
      f.props.table?.setFrame(i % 2 ? 0 : 1);
      sfx("tick");
      await f.wait(260);
    }
    f.props.map?.setFrame(1);
    f.props.table?.setFrame(1);
    const hale = f.sprites.hale;
    if (hale) f.bubble(hale, "sorpresa");
    await f.wait(900);
    cheer(f, ["iris", "penrose"]);
    await f.wait(700);
    if (hale) f.bubble(hale, "cafe");
    await f.wait(1200);
  },
};

// ------------------------------------------------------------------ Medianoche

const mnComputo: RoomDef = {
  key: "computo",
  card: ["Banco Cafetero del Sur", "Sala de cómputo, Bogotá"],
  build(c) {
    tiles(c, 0xa8aab0, 0xb4b6bc, 0x8a8c94);
    const g = c.scene.add.graphics().setDepth(1);
    for (let y = 44; y < 184; y += 16)
      for (let x = 4; x < ROOM_W; x += 32) g.fillStyle(0x8a8c94, 1).fillRect(x, y, 1, 1).fillRect(x + 4, y, 1, 1).fillRect(x, y + 4, 1, 1).fillRect(x + 4, y + 4, 1, 1);
    wall(c, 0xc8c0a8, 0x2f6a4a, 0x8a7a5c);
    frame(c, undefined, 0x5c4a36);
    anim(c, "server_rack", 14, 8, "rack-blink", 50);
    anim(c, "server_rack", 36, 8, "rack-blink", 50);
    c.solid(14, 40, 44, 10);
    c.img("calendar", 84, 12).setDepth(3);
    c.img("window", 120, 2, c.act === 3 ? 1 : 2).setDepth(3);
    c.img("clock", 166, 8).setDepth(3);
    terminalDesk(c);
    c.prop("chair", 212, 64);
    // escritorio de Wilson con su terminal verde de siempre
    c.prop("desk", 30, 112);
    anim(c, "terminal", 40, 102, "term-alert", 138);
    c.solid(30, 122, 48, 14);
    c.prop("chair", 46, 128);
    c.prop("printer", 100, 40);
    anim(c, "printer", 100, 40, "printer-run", 58);
    c.solid(100, 48, 20, 10);
    c.prop("paper_item", 126, 58);
    c.prop("paper_item", 136, 62);
    // la mesa del tinto con el radio
    c.prop("table", 262, 64);
    anim(c, "radio", 264, 58, "radio-play", 82);
    c.prop("mug", 282, 65).setDepth(100 + 65 + 30);
    c.solid(262, 70, 26, 10);
    anim(c, "xmas_tree", 292, 140, "tree-lights", 172);
    c.solid(294, 164, 16, 8);
    c.prop("kenney", 4, 158, kenney(16, 0));
    c.solid(6, 168, 12, 6);
    c.prop("filing", 300, 26);
    c.prop("filing", 284, 26);
    c.solid(284, 42, 30, 10);
    c.prop("coatrack", 196, 146);
    c.solid(198, 172, 12, 6);
    c.prop("trash", 86, 126);
  },
  spawn: [150, 176],
  homes: { beatriz: [160, 90], wilson: [96, 140] },
  terminal: { x: 216, y: 74, mark: [213, 30] },
  flavor: [
    { id: "radio", x: 274, y: 86, r: 14, label: "Radio", lines: [{ who: "camilo", text: "«...y a esta hora, en todo el país, los ingenieros siguen trabajando para que el 2000 llegue sin sustos...»" }] },
    { id: "arbol", x: 300, y: 176, r: 14, label: "Arbolito", lines: [{ who: "camilo", text: "Lo armó doña Beatriz el primero de diciembre. Las luces parpadean más tranquilas que yo." }] },
    { id: "servidores", x: 36, y: 56, r: 18, label: "Servidores", lines: [{ who: "wilson", text: "Ahí adentro están las cuentas de medio país. No les respire encima.", mood: "serio" }] },
  ],
  atmosphere: (act) =>
    act === 3
      ? {
          night: [
            { x: 216, y: 56, r: 52, color: [140, 255, 170], power: 1 },
            { x: 52, y: 116, r: 44, color: [140, 255, 170], power: 0.9 },
            { x: 274, y: 62, r: 36, color: [255, 190, 110], power: 0.8 },
            { x: 300, y: 150, r: 40, color: [255, 120, 140], power: 0.8 },
            { x: 136, y: 20, r: 40, color: [140, 160, 255], power: 0.5 },
          ],
          xmas: [70, 250, 4],
        }
      : { rain: [{ x: 120, y: 2 }], xmas: [70, 250, 4] },
  steam: [[285, 64]],
  routines: {
    wilson: [
      { path: [[96, 140], [54, 140]], face: "up", emote: "sudor", ms: 2800, sound: "key" },
      { path: [[96, 140], [96, 96], [124, 70]], face: "up", emote: "duda", ms: 2200, sound: "printTick" },
    ],
    beatriz: [
      { path: [[160, 90], [254, 90]], face: "up", emote: "cafe", ms: 2600, sound: "coffee" },
      { path: [[160, 90], [160, 120], [280, 120], [280, 132]], face: "down", emote: "corazon", ms: 2000 },
    ],
  },
};

const mnCajeros: RoomDef = {
  key: "cajeros",
  card: ["Piso de cajeros", "Banco Cafetero del Sur, novena de las cinco"],
  build(c) {
    tiles(c, 0xd8d0c0, 0xcbc2b0, 0xb4a78c);
    wall(c, 0xe6dabf, 0x2f6a4a, 0x6e4c2c);
    frame(c, undefined, 0x6e4c2c);
    // ventanillas de caja
    c.prop("teller", 20, 6);
    c.solid(20, 26, 112, 22);
    terminalDesk(c);
    c.prop("chair", 212, 64);
    // el pesebre de la novena, con natilla y buñuelos en la mesa
    anim(c, "pesebre", 140, 104, "pesebre-star", 134);
    c.solid(140, 122, 48, 10);
    anim(c, "xmas_tree", 292, 30, "tree-lights", 62);
    c.solid(294, 54, 16, 8);
    c.prop("table", 250, 130);
    c.prop("mug", 256, 131).setDepth(100 + 131 + 30);
    c.prop("papers", 266, 130).setDepth(100 + 130 + 30);
    c.solid(250, 136, 26, 10);
    // sillas de espera de los clientes
    for (const x of [24, 42, 60, 78]) c.prop("chair", x, 140);
    c.solid(24, 150, 70, 8);
    c.prop("kenney", 300, 150, kenney(16, 0));
    c.solid(302, 160, 12, 6);
    c.prop("kenney", 4, 60, kenney(17, 0));
    c.solid(6, 70, 12, 6);
  },
  spawn: [150, 176],
  homes: { beatriz: [180, 90], wilson: [92, 70] },
  terminal: { x: 216, y: 74, mark: [213, 30] },
  flavor: [
    { id: "pesebre", x: 164, y: 140, r: 16, label: "Pesebre", lines: [{ who: "camilo", text: "El niño Dios todavía no está: se pone el 24. Al lado, alguien dejó una calculadora." }] },
    { id: "natilla", x: 262, y: 150, r: 14, label: "Natilla y buñuelos", lines: [{ who: "camilo", text: "Natilla de doña Beatriz y buñuelos de la cafetería. Es la tercera vez que paso «por casualidad»." }] },
    { id: "cajas", x: 76, y: 56, r: 22, label: "Ventanillas", lines: [{ who: "wilson", text: "Si el sistema falla el primero de enero, aquí se arma la fila más larga de la historia de Bogotá.", mood: "serio" }] },
  ],
  atmosphere: () => ({ xmas: [8, 312, 2] }),
  steam: [[259, 130]],
  routines: {
    beatriz: [
      { path: [[180, 90], [164, 96]], face: "down", emote: "corazon", ms: 2600 },
      { path: [[180, 90], [262, 90], [262, 122]], face: "down", emote: "cafe", ms: 2200, sound: "coffee" },
    ],
    wilson: [
      { path: [[92, 70], [60, 70], [60, 56]], face: "up", emote: "serio", ms: 2400, sound: "printTick" },
      { path: [[92, 70], [92, 120], [116, 120]], face: "right", emote: "duda", ms: 2000 },
    ],
  },
};

/** Cuenta atrás de medianoche en grande, sobre la pantalla del juego. */
async function countdown() {
  const box = el("div", "countdown");
  ui.append(box);
  for (let n = 10; n >= 0; n--) {
    box.textContent = String(n);
    box.classList.remove("beat");
    void box.offsetWidth;
    box.classList.add("beat");
    sfx(n === 0 ? "alarm" : "tick");
    await wait(n === 0 ? 400 : 650);
  }
  box.textContent = "2000";
  box.classList.add("year");
  await wait(900);
  box.remove();
}

const medianoche: StoryDef = {
  id: "medianoche",
  level: 5,
  title: "Medianoche",
  kicker: "BOGOTÁ · 1999",
  tagline: "Los programas del banco guardan el año con dos cifras. A medianoche, el 99 pasa a 00.",
  prompt: "CAMILO@BANCO:~$ editor",
  player: "camilo",
  cast: ["beatriz", "wilson"],
  vocabAt: 29,
  idle: {
    beatriz: ["Mijo, tómese el tinto que se le enfría.", "Treinta años en este banco y nunca había visto a la gente tan nerviosa por un número.", "Aquí no se apaga nada hasta que el último cajero cuadre."],
    wilson: ["Yo escribí ese programa en el 84. Funcionaba. Funcionaba en el 84.", "En mis tiempos un error costaba una caja de tarjetas. Ahora cuesta un banco.", "No me toque el COBOL que me lo descuadra."],
  },
  rooms: [mnComputo, mnCajeros],
  roomOf: (m) => (m >= 4 && m <= 7 ? "cajeros" : "computo"),
  async finale(f) {
    await countdown();
    // voladores en la ventana de la sala
    const colors = [0xe8344e, 0xfed018, 0x4ba86d, 0x2092db, 0xf7f7f2];
    for (let i = 0; i < 14; i++) {
      f.scene.time.delayedCall(i * 230, () => {
        const color = colors[i % colors.length];
        firework(f.scene, 124 + Math.floor(Math.random() * 24), 6 + Math.floor(Math.random() * 14), color);
        // el estallido ilumina un instante toda la sala, del color del volador
        const glow = f.scene.add.rectangle(-20, -20, ROOM_W + 40, 240, color, 0).setOrigin(0, 0).setDepth(10002).setBlendMode("ADD");
        f.scene.tweens.chain({ targets: glow, tweens: [{ alpha: 0.16, duration: 60 }, { alpha: 0, duration: 500 }], onComplete: () => glow.destroy() });
        if (i % 2 === 0) sfx("boom");
      });
    }
    cheer(f, ["camilo", "beatriz", "wilson"]);
    await f.wait(1200);
    cheer(f, ["camilo", "beatriz", "wilson"]);
    await f.wait(2200);
  },
};

export const STORIES: Record<StoryId, StoryDef> = {
  "diez-dias": diezDias,
  "la-consulta": laConsulta,
  "codigo-cuervo": codigoCuervo,
  medianoche,
};
