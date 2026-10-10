// Cada historia nueva: datos de portada, reparto y el cuarto donde pasa todo.
// El contenido (diálogos y misiones) va aparte, en src/stories/<id>/content.ts.
import type { CharName } from "../config";
import type { Line } from "../game/types";
import { FLOOR_BOTTOM, FLOOR_TOP, ROOM_W, frame, kenney, terminalDesk, type BuildCtx } from "../scenes/places";
import type { StoryId } from "./registry";

export interface StoryFlavor {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
  lines: Line[];
}

export interface StoryDef {
  id: StoryId;
  level: number;
  title: string;
  /** Línea pequeña sobre el título: "MOUNTAIN VIEW · 1995". */
  kicker: string;
  tagline: string;
  /** Tarjeta al entrar: lugar y fecha. */
  card: [string, string];
  /** Lo que sale arriba del editor de la terminal. */
  prompt: string;
  player: CharName;
  cast: CharName[];
  /** Vocabulario de JavaScript que se autocompleta (índice de misión de 75 Centavos). */
  vocabAt: number;
  /** Frases sueltas cuando se habla con alguien que no tiene encargo. */
  idle: Partial<Record<CharName, string[]>>;
  room: {
    build(c: BuildCtx): void;
    spawn: [number, number];
    homes: Partial<Record<CharName, [number, number]>>;
    terminal: { x: number; y: number; mark: [number, number] };
    flavor: StoryFlavor[];
  };
}

/** Suelo de baldosas a cuadros. */
function tiles(c: BuildCtx, a: number, b: number, joint: number, size = 16) {
  const g = c.scene.add.graphics().setDepth(0);
  for (let y = FLOOR_TOP, r = 0; y < FLOOR_BOTTOM; y += size, r++)
    for (let x = 0, k = 0; x < ROOM_W; x += size, k++) {
      g.fillStyle((r + k) % 2 ? a : b, 1).fillRect(x, y, size, size);
      g.fillStyle(joint, 1).fillRect(x, y + size - 1, size, 1).fillRect(x + size - 1, y, 1, size);
    }
  return g;
}

/** Pared lisa con un zócalo. */
function wall(c: BuildCtx, base: number, stripe: number, skirting: number) {
  const w = c.scene.add.graphics().setDepth(2);
  w.fillStyle(base, 1).fillRect(0, 0, ROOM_W, FLOOR_TOP);
  w.fillStyle(stripe, 1).fillRect(0, 24, ROOM_W, 2);
  w.fillStyle(skirting, 1).fillRect(0, 34, ROOM_W, 6);
  w.fillStyle(0x1c1830, 1).fillRect(0, 39, ROOM_W, 1);
  return w;
}

function anim(c: BuildCtx, key: string, x: number, y: number, play: string, depthY = y) {
  return c.scene.add.sprite(x, y, key, 0).setOrigin(0, 0).setDepth(100 + depthY).play(play);
}

// ------------------------------------------------------------------ Diez días

const diezDias: StoryDef = {
  id: "diez-dias",
  level: 2,
  title: "Diez días",
  kicker: "MOUNTAIN VIEW · 1995",
  tagline: "Las páginas web eran papel quieto. Tienes diez días para que cobren vida.",
  card: ["Nébula Communications", "Mountain View, mayo de 1995"],
  prompt: "LENA@NEBULA:~$ editor",
  player: "lena",
  cast: ["kraus", "wes"],
  vocabAt: 29,
  idle: {
    kraus: ["Cada día que pasa es un día menos. No es filosofía, es el calendario.", "Imagina a un millón de personas haciendo clic en algo que tú hiciste.", "¿Sabes qué vende un navegador? Que pase algo cuando tocas la página."],
    wes: ["Mi contador de visitas va por 41. Doce son mías. Bueno, veinte.", "El gris es el color de la web. Por ahora.", "Un gif de obras es arte. No me discutas."],
  },
  room: {
    build(c) {
      tiles(c, 0x5a6478, 0x545e72, 0x4a5266);
      wall(c, 0xd8d0c0, 0x3e6ea8, 0x8a8478);
      frame(c, undefined, 0x3a3f52);
      c.img("posters", 18, 6, 1).setDepth(3);
      c.img("chalkboard", 46, 6).setDepth(3);
      c.img("calendar", 104, 12).setDepth(3);
      c.img("window", 140, 2, 0).setDepth(3);
      c.img("clock", 184, 8).setDepth(3);
      c.img("posters", 256, 6, 0).setDepth(3);
      terminalDesk(c);
      c.prop("chair", 212, 64);
      // escritorio de Kraus, con su propia terminal
      c.prop("desk", 30, 96);
      anim(c, "terminal", 40, 86, "term-on", 122);
      c.solid(30, 106, 48, 14);
      c.prop("chair", 46, 114);
      c.prop("phone", 64, 99).setDepth(100 + 99 + 30);
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
      c.prop("posters", 228, 92, 3).setDepth(100 + 92 + 24);
      c.prop("kenney", 300, 150, kenney(16, 0));
      c.solid(302, 160, 12, 6);
      c.prop("trash", 8, 60);
    },
    spawn: [160, 160],
    homes: { kraus: [96, 120], wes: [274, 140] },
    terminal: { x: 216, y: 74, mark: [213, 30] },
    flavor: [
      { id: "pizarra", x: 68, y: 46, r: 16, label: "Pizarra", lines: [{ who: "lena", text: "«QUEDAN 10 DÍAS». Alguien tacha un número cada mañana. Con mucha fuerza." }] },
      { id: "servidor", x: 302, y: 54, r: 14, label: "Servidor", lines: [{ who: "lena", text: "Aquí vive nebula.com. Si se apaga, se apaga la empresa." }] },
      { id: "pizza", x: 262, y: 166, r: 14, label: "Cajas de pizza", lines: [{ who: "lena", text: "Pizza fría del martes. O del lunes. Nadie lo sabe." }] },
    ],
  },
};

// ------------------------------------------------------------------ La consulta

const laConsulta: StoryDef = {
  id: "la-consulta",
  level: 3,
  title: "La consulta",
  kicker: "SAN JOSÉ · 1974",
  tagline: "Los datos viven en cintas y tarjetas. Alguien propone preguntarles en un idioma casi humano.",
  card: ["Laboratorio de investigación", "San José, California, 1974"],
  prompt: "NORA@LAB-SJ:~$ consulta",
  player: "nora",
  cast: ["fenton", "pat"],
  vocabAt: 29,
  idle: {
    fenton: ["Una tabla es una relación. Una relación es una idea. Las ideas no se rompen.", "¿Sabe qué es lo bonito de una consulta? Que no le dice a la máquina cómo, solo qué.", "Mis colegas dicen que esto nunca funcionará. Mis colegas usan regla de cálculo."],
    pat: ["Treinta mil tarjetas. Si se caen al suelo, me jubilo.", "El café de la máquina es malo, pero es puntual.", "Si su consulta ahorra un programa, me invita a almorzar."],
  },
  room: {
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
    spawn: [160, 160],
    homes: { fenton: [62, 70], pat: [92, 124] },
    terminal: { x: 216, y: 74, mark: [213, 30] },
    flavor: [
      { id: "pizarra", x: 52, y: 46, r: 16, label: "Pizarra", lines: [{ who: "nora", text: "Una tabla dibujada con tiza: filas, columnas y una flecha que dice «¡SOLO ESTO!»." }] },
      { id: "cintas", x: 274, y: 48, r: 18, label: "Unidades de cinta", lines: [{ who: "nora", text: "Las cintas giran a tirones. Cada vuelta es una pregunta que alguien tardó semanas en programar." }] },
      { id: "clasificadora", x: 54, y: 136, r: 16, label: "Clasificadora", lines: [{ who: "pat", text: "Ordena tarjetas por una columna. Una. Si quiere dos, son dos tardes.", mood: "serio" }] },
    ],
  },
};

// ------------------------------------------------------------------ Código Cuervo

const codigoCuervo: StoryDef = {
  id: "codigo-cuervo",
  level: 4,
  title: "Código Cuervo",
  kicker: "INGLATERRA · 1941",
  tagline: "Llegan mensajes cifrados que esconden la ruta de los convoyes. Cada hora cuenta.",
  card: ["Hawthorn Hall", "Inglaterra, invierno de 1941"],
  prompt: "IRIS@HAWTHORN:~$ maquina",
  player: "iris",
  cast: ["penrose", "hale"],
  vocabAt: 29,
  idle: {
    penrose: ["La tetera y yo estamos de acuerdo: el patrón está ahí. Solo hay que mirarlo bien.", "Un mensaje cifrado es un crucigrama con mal carácter.", "No me pregunte cómo funciona la máquina. Funciona. Eso basta."],
    hale: ["Cada hora sin descifrar es una hora que los barcos navegan a ciegas.", "En la marina no hay crucigramas. Hay horarios.", "Hágalo bien. Después, hágalo rápido."],
  },
  room: {
    build(c) {
      const g = c.scene.add.graphics().setDepth(0);
      for (let y = FLOOR_TOP, row = 0; y < FLOOR_BOTTOM; y += 8, row++) {
        g.fillStyle(row % 2 ? 0x6e4c2c : 0x765232, 1).fillRect(0, y, ROOM_W, 8);
        g.fillStyle(0x4a321e, 1).fillRect(0, y + 7, ROOM_W, 1);
        for (let x = (row * 23) % 48; x < ROOM_W; x += 48) g.fillStyle(0x4a321e, 1).fillRect(x, y, 1, 7);
      }
      wall(c, 0x8a9a7a, 0x6e7e60, 0x5c4a36);
      frame(c, undefined, 0x4a321e);
      c.img("kenney", 120, 8, kenney(20, 14)).setDepth(3);
      c.img("kenney", 136, 8, kenney(21, 14)).setDepth(3);
      c.img("chalkboard", 62, 6).setDepth(3);
      c.img("clock", 166, 8).setDepth(3);
      c.img("window", 252, 2, 2).setDepth(3);
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
      c.prop("chair", 84, 104);
      c.prop("chair", 158, 104).setFlipX(true);
      c.solid(104, 104, 52, 18);
      c.prop("table", 268, 120);
      c.prop("mug", 276, 121).setDepth(100 + 121 + 30);
      c.prop("papers", 284, 119).setDepth(100 + 119 + 30);
      c.solid(268, 126, 26, 10);
      c.prop("filing", 300, 28);
      c.solid(300, 44, 14, 10);
      c.prop("coatrack", 8, 140);
      c.solid(10, 166, 12, 6);
      c.prop("book_piles", 34, 150);
      c.solid(36, 160, 24, 8);
      c.prop("kenney", 286, 150, kenney(20, 17));
      c.prop("kenney", 302, 150, kenney(21, 17));
      c.solid(286, 158, 32, 8);
      c.img("calendar", 184, 12).setDepth(3);
    },
    spawn: [160, 166],
    homes: { penrose: [64, 70], hale: [184, 116] },
    terminal: { x: 216, y: 74, mark: [213, 30] },
    flavor: [
      { id: "radio", x: 34, y: 60, r: 16, label: "Radio de escucha", lines: [{ who: "iris", text: "Pitidos en morse, día y noche. Alguien en otra mansión los apunta a mano." }] },
      { id: "carta", x: 130, y: 128, r: 18, label: "Carta náutica", lines: [{ who: "hale", text: "Esos alfileres son barcos. No se mueven solos: los movemos nosotros, con lo que usted descifre.", mood: "serio" }] },
      { id: "te", x: 280, y: 138, r: 14, label: "Té", lines: [{ who: "iris", text: "Té frío con demasiado azúcar. El de Penrose. No lo toques." }] },
    ],
  },
};

// ------------------------------------------------------------------ Medianoche

const medianoche: StoryDef = {
  id: "medianoche",
  level: 5,
  title: "Medianoche",
  kicker: "BOGOTÁ · 1999",
  tagline: "Los programas del banco guardan el año con dos cifras. A medianoche, el 99 pasa a 00.",
  card: ["Banco Cafetero del Sur", "Bogotá, diciembre de 1999"],
  prompt: "CAMILO@BANCO:~$ editor",
  player: "camilo",
  cast: ["beatriz", "wilson"],
  vocabAt: 29,
  idle: {
    beatriz: ["Mijo, tómese el tinto que se le enfría.", "Treinta años en este banco y nunca había visto a la gente tan nerviosa por un número.", "Aquí no se apaga nada hasta que el último cajero cuadre."],
    wilson: ["Yo escribí ese programa en el 84. Funcionaba. Funcionaba en el 84.", "En mis tiempos un error costaba una caja de tarjetas. Ahora cuesta un banco.", "No me toque el COBOL que me lo descuadra."],
  },
  room: {
    build(c) {
      tiles(c, 0xa8aab0, 0xb4b6bc, 0x8a8c94);
      const g = c.scene.add.graphics().setDepth(1);
      for (let y = FLOOR_TOP + 4; y < FLOOR_BOTTOM; y += 16)
        for (let x = 4; x < ROOM_W; x += 32) g.fillStyle(0x8a8c94, 1).fillRect(x, y, 1, 1).fillRect(x + 4, y, 1, 1).fillRect(x, y + 4, 1, 1).fillRect(x + 4, y + 4, 1, 1);
      const w = wall(c, 0xc8c0a8, 0x2f6a4a, 0x8a7a5c);
      // guirnalda de diciembre: rama verde con bombillos de colores
      for (let x = 70; x < 250; x += 2) {
        const y = 4 + Math.round(Math.sin(x / 10) * 2);
        w.fillStyle(0x2f5a3c, 1).fillRect(x, y, 2, 2);
        if (x % 12 === 0) w.fillStyle([0xe8344e, 0xfed018, 0x2092db][(x / 12) % 3], 1).fillRect(x, y + 2, 2, 2);
      }
      frame(c, undefined, 0x5c4a36);
      anim(c, "server_rack", 14, 8, "rack-blink", 50);
      anim(c, "server_rack", 36, 8, "rack-blink", 50);
      c.solid(14, 40, 44, 10);
      c.img("calendar", 84, 12).setDepth(3);
      c.img("window", 120, 2, 1).setDepth(3);
      c.img("clock", 166, 8).setDepth(3);
      terminalDesk(c);
      c.prop("chair", 212, 64);
      // escritorio de Wilson con su terminal verde de siempre
      c.prop("desk", 30, 112);
      anim(c, "terminal", 40, 102, "term-alert", 138);
      c.solid(30, 122, 48, 14);
      c.prop("printer", 100, 40);
      anim(c, "printer", 100, 40, "printer-run", 58);
      c.solid(100, 48, 20, 10);
      // la mesa del tinto con el radio
      c.prop("table", 262, 64);
      anim(c, "radio", 264, 58, "radio-play", 82);
      c.prop("mug", 282, 65).setDepth(100 + 65 + 30);
      c.solid(262, 70, 26, 10);
      anim(c, "xmas_tree", 292, 140, "tree-lights", 172);
      c.solid(294, 164, 16, 8);
      c.prop("kenney", 4, 158, kenney(16, 0));
      c.solid(6, 168, 12, 6);
      c.prop("chair", 46, 128);
      c.prop("filing", 300, 26);
      c.prop("filing", 284, 26);
      c.solid(284, 42, 30, 10);
      c.prop("paper_item", 126, 58);
      c.prop("paper_item", 136, 62);
      c.prop("coatrack", 196, 146);
      c.solid(198, 172, 12, 6);
      c.prop("trash", 86, 126);
    },
    spawn: [160, 166],
    homes: { beatriz: [160, 90], wilson: [96, 140] },
    terminal: { x: 216, y: 74, mark: [213, 30] },
    flavor: [
      { id: "radio", x: 274, y: 86, r: 14, label: "Radio", lines: [{ who: "camilo", text: "«...y a esta hora, en todo el país, los ingenieros siguen trabajando para que el 2000 llegue sin sustos...»" }] },
      { id: "arbol", x: 300, y: 176, r: 14, label: "Arbolito", lines: [{ who: "camilo", text: "Lo armó doña Beatriz el primero de diciembre. Las luces parpadean más tranquilas que yo." }] },
      { id: "servidores", x: 36, y: 56, r: 18, label: "Servidores", lines: [{ who: "wilson", text: "Ahí adentro están las cuentas de medio país. No les respire encima.", mood: "serio" }] },
    ],
  },
};

export const STORIES: Record<StoryId, StoryDef> = {
  "diez-dias": diezDias,
  "la-consulta": laConsulta,
  "codigo-cuervo": codigoCuervo,
  medianoche,
};
