// Los lugares de los mentores: cómo se dibuja cada uno, dónde está su terminal,
// qué se puede mirar y qué hace el mentor mientras Sam practica. La escena que
// los pone en marcha es HouseScene; aquí solo está lo propio de cada lugar.
import type Phaser from "phaser";
import type { CharName, Dir, EmoteName } from "../config";
import type { Line } from "../game/missions";
import type { MentorKey } from "../game/mentors";
import { pianoPhrase, sfx, type SoundName } from "../audio/sfx";

export const ROOM_W = 320;
export const FLOOR_TOP = 40;
export const FLOOR_BOTTOM = 184;
export const kenney = (col: number, row: number) => row * 27 + col;

/** Herramientas para dibujar el lugar. */
export interface BuildCtx {
  scene: Phaser.Scene;
  img(key: string, x: number, y: number, frame?: number): Phaser.GameObjects.Image;
  prop(key: string, x: number, y: number, frame?: number): Phaser.GameObjects.Image;
  solid(x: number, y: number, w: number, h: number): void;
  /** Acto en curso: cambia la luz de la ventana y el tiempo. */
  act: number;
}

/** Lo que puede hacer el mentor en su rutina. */
export interface MentorCtx {
  walk(points: [number, number][]): Promise<void>;
  face(dir: Dir): void;
  bubble(mood: EmoteName): void;
  wait(ms: number): Promise<void>;
  sfx(name: SoundName): void;
}

export interface Flavor {
  id: string;
  x: number;
  y: number;
  r: number;
  label: string;
  lines: Line[];
  sound?: () => void;
}

export interface PlaceDef {
  mentor: CharName & MentorKey;
  build(c: BuildCtx): void;
  /** Dónde está el mentor cuando no hace nada. */
  home: [number, number];
  /** La terminal de los ejercicios: punto para interactuar y flecha encima. */
  terminal: { x: number; y: number; mark: [number, number] };
  flavor: Flavor[];
  routine: { name: string; run(m: MentorCtx): Promise<void> }[];
  lines: {
    /** Está a mitad de algo y Sam le habla. */
    busy: string;
    busyDone: string;
    /** Ya no quedan ejercicios. */
    done: string;
    /** Qué ejercicio toca. */
    next(title: string): string;
    /** Sam se va sin terminar. */
    early: string;
  };
}

// ------------------------------------------------------------------ piezas comunes

function frame(c: BuildCtx, exit = { x0: 144, x1: 176 }, doorColor = 0x4a2e1e) {
  const ROOM_H = 192;
  for (let y = -8; y < ROOM_H; y += 16) {
    c.img("wall_cap_v", -8, y).setDepth(5000);
    c.img("wall_cap_v", ROOM_W, y).setDepth(5000);
  }
  for (let x = 0; x < ROOM_W; x += 16) if (x < exit.x0 || x >= exit.x1) c.img("wall_cap_h", x, FLOOR_BOTTOM).setDepth(5000);
  c.img("wall_cap_h", -8, -8).setDepth(5000).setScale(21, 1);
  c.scene.add.rectangle(exit.x0, FLOOR_BOTTOM, 32, 8, doorColor).setOrigin(0, 0).setDepth(1);
  c.scene.add.rectangle(0, FLOOR_TOP, ROOM_W, 3, 0x1c1830, 0.3).setOrigin(0, 0).setDepth(1);
}

/** La terminal de los ejercicios sobre un escritorio, a la derecha. */
function terminalDesk(c: BuildCtx) {
  c.prop("desk", 196, 46);
  c.scene.add.sprite(204, 36, "terminal", 0).setOrigin(0, 0).setDepth(100 + 72).play("term-on");
  c.solid(196, 56, 48, 14);
}

// ------------------------------------------------------------------ Margarita

const margarita: PlaceDef = {
  mentor: "margarita",
  build(c) {
    const g = c.scene.add.graphics().setDepth(0);
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
    const w = c.scene.add.graphics().setDepth(2);
    w.fillStyle(0x6b8f71, 1).fillRect(0, 0, ROOM_W, FLOOR_TOP);
    for (let x = 0; x < ROOM_W; x += 8) {
      w.fillStyle(0x5f8265, 1).fillRect(x, 0, 2, 28);
      w.fillStyle(0x7da583, 1).fillRect(x + 4, 4 + ((x / 8) % 2) * 10, 1, 2);
    }
    w.fillStyle(0xc08a5a, 1).fillRect(0, 26, ROOM_W, 2);
    w.fillStyle(0x8a5a36, 1).fillRect(0, 28, ROOM_W, 12);
    for (let x = 4; x < ROOM_W; x += 20) w.fillStyle(0x744a2c, 1).fillRect(x, 30, 14, 8);
    w.fillStyle(0x5e3c26, 1).fillRect(0, 39, ROOM_W, 1);
    frame(c);
    // en la pared: cuadros, ventana y reloj
    c.img("kenney", 20, 6, kenney(19, 12)).setDepth(3);
    c.img("kenney", 40, 6, kenney(20, 12)).setDepth(3);
    c.img("kenney", 56, 6, kenney(21, 12)).setDepth(3);
    c.img("window", 120, 2, [4, 5].includes(c.act) ? 2 : 0).setDepth(3);
    c.img("clock", 160, 8).setDepth(3);
    c.img("kenney", 252, 6, kenney(19, 14)).setDepth(3);
    c.img("kenney", 274, 6, kenney(19, 13)).setDepth(3);
    // piano vertical contra la pared
    c.prop("kenney", 16, 24, kenney(23, 8));
    c.prop("kenney", 32, 24, kenney(24, 8));
    c.prop("kenney", 16, 40, kenney(23, 9));
    c.prop("kenney", 32, 40, kenney(24, 9));
    c.prop("chair", 24, 58);
    c.solid(16, 44, 32, 12);
    // estanterías de libros
    c.prop("kenney", 64, 26, kenney(20, 17));
    c.prop("kenney", 80, 26, kenney(21, 17));
    c.prop("kenney", 96, 26, kenney(19, 17));
    c.solid(64, 34, 48, 8);
    terminalDesk(c);
    c.prop("lamp", 226, 44);
    // rincón de lectura: dos sillones y una mesita con té entre ellos
    c.prop("kenney", 120, 100, kenney(14, 9));
    c.solid(120, 106, 16, 10);
    c.prop("table", 140, 102);
    c.prop("mug", 149, 103);
    c.solid(140, 108, 26, 10);
    c.prop("kenney", 170, 100, kenney(14, 9)).setFlipX(true);
    c.solid(170, 106, 16, 10);
    // plantas
    c.prop("kenney", 296, 26, kenney(16, 0));
    c.solid(298, 36, 12, 6);
    c.prop("kenney", 2, 160, kenney(17, 0));
    c.solid(4, 170, 12, 6);
    c.prop("kenney", 300, 150, kenney(16, 0));
    c.solid(302, 160, 12, 6);
  },
  home: [232, 92],
  terminal: { x: 216, y: 74, mark: [213, 30] },
  flavor: [
    {
      id: "piano", x: 32, y: 64, r: 16, label: "Piano",
      lines: [
        { who: "sam", text: "Do, re, mi... y ahí se acaba mi repertorio." },
        { who: "margarita", text: "Con escalas se empieza. Igual que con los bucles." },
      ],
      sound: () => { for (let i = 0; i < 5; i++) setTimeout(() => sfx("blip"), i * 140); },
    },
    { id: "books", x: 88, y: 48, r: 16, label: "Estantería", lines: [{ who: "sam", text: "Manuales de FORTRAN, de COBOL, partituras de Chopin y una novela de Agatha Christie. Todo subrayado." }] },
    { id: "tea", x: 153, y: 124, r: 12, label: "Té", lines: [{ who: "sam", text: "Té de manzanilla. Todavía caliente." }] },
  ],
  routine: [
    {
      name: "piano",
      run: async (m) => {
        await m.walk([[232, 132], [36, 132], [36, 76]]);
        m.face("up");
        const ms = pianoPhrase();
        for (let t = 0; t < ms; t += 1200) setTimeout(() => m.bubble("musica"), t);
        await m.wait(ms + 900);
        await m.walk([[36, 132], [232, 132], [232, 92]]);
      },
    },
    {
      name: "plantas",
      run: async (m) => {
        await m.walk([[290, 92], [290, 56]]);
        m.face("up");
        m.sfx("water");
        await m.wait(1800);
        await m.walk([[290, 144], [292, 146]]);
        m.face("right");
        m.sfx("water");
        await m.wait(1200);
        m.bubble("corazon");
        await m.wait(1200);
        await m.walk([[290, 92], [232, 92]]);
      },
    },
    {
      name: "libros",
      run: async (m) => {
        await m.walk([[232, 132], [88, 132], [88, 60]]);
        m.face("up");
        await m.wait(1200);
        m.bubble("duda");
        await m.wait(1800);
        m.bubble("idea");
        await m.wait(1400);
        await m.walk([[88, 132], [232, 132], [232, 92]]);
      },
    },
  ],
  lines: {
    busy: "Ahora voy. Tú ve empezando en mi terminal.",
    busyDone: "Ve tranquilo, Sam. Yo sigo con lo mío.",
    done: "Anda, vuelve con Ruth. Y saluda a Byte de mi parte.",
    next: (t) => `El siguiente se llama «${t}». Está en mi terminal. Si te atascas, pide una pista: no muerdo.`,
    early: "¿Ya te vas? Puedes volver cuando quieras, pero Ruth no te dará trabajo hasta que termines.",
  },
};

// ------------------------------------------------------------------ Gus, el radioaficionado

const gus: PlaceDef = {
  mentor: "gus",
  build(c) {
    const g = c.scene.add.graphics().setDepth(0);
    // suelo de cemento: losas grandes, una grieta y una mancha de aceite
    g.fillStyle(0x8c8a86, 1).fillRect(0, FLOOR_TOP, ROOM_W, FLOOR_BOTTOM - FLOOR_TOP);
    for (let y = FLOOR_TOP; y < FLOOR_BOTTOM; y += 2)
      for (let x = (y * 3) % 7; x < ROOM_W; x += 7) g.fillStyle(0x84827e, 1).fillRect(x, y, 1, 1);
    for (let x = 0; x < ROOM_W; x += 64) g.fillStyle(0x76746f, 1).fillRect(x, FLOOR_TOP, 1, FLOOR_BOTTOM - FLOOR_TOP);
    g.fillStyle(0x76746f, 1).fillRect(0, 110, ROOM_W, 1);
    g.fillStyle(0x5c5a56, 1).fillRect(96, 128, 3, 1).fillRect(99, 129, 4, 1).fillRect(103, 130, 3, 1).fillRect(106, 131, 5, 1);
    g.fillStyle(0x4c4b52, 0.8).fillEllipse(150, 150, 34, 12);
    g.fillStyle(0x5e5d66, 0.8).fillEllipse(146, 148, 14, 4);
    // pared de bloques de hormigón
    const w = c.scene.add.graphics().setDepth(2);
    w.fillStyle(0xa79f8c, 1).fillRect(0, 0, ROOM_W, FLOOR_TOP);
    for (let y = 0, row = 0; y < FLOOR_TOP; y += 8, row++) {
      w.fillStyle(0x8e8674, 1).fillRect(0, y + 7, ROOM_W, 1);
      for (let x = row % 2 ? 0 : 12; x < ROOM_W; x += 24) w.fillStyle(0x8e8674, 1).fillRect(x, y, 1, 7);
    }
    w.fillStyle(0x7a7262, 1).fillRect(0, 39, ROOM_W, 1);
    frame(c, undefined, 0x55534f);
    // en la pared: tablero de herramientas, mapamundi y las tarjetas QSL
    c.img("pegboard", 18, 4).setDepth(3);
    c.img("kenney", 120, 8, kenney(20, 14)).setDepth(3);
    c.img("kenney", 136, 8, kenney(21, 14)).setDepth(3);
    c.img("qsl_cards", 252, 6).setDepth(3);
    // banco de trabajo con el equipo de radio
    c.prop("workbench", 14, 28);
    c.scene.add.sprite(30, 22, "radio_rig", 0).setOrigin(0, 0).setDepth(100 + 50).play("radio-rx");
    c.solid(14, 38, 48, 12);
    terminalDesk(c);
    c.prop("lamp", 226, 44);
    c.prop("chair", 212, 64);
    // rincón del garaje: la bici de Gus, neumáticos y cajas
    c.prop("bicycle", 222, 140);
    c.solid(224, 152, 30, 6);
    c.prop("tire_stack", 292, 136);
    c.solid(294, 150, 18, 8);
    c.prop("tapebox", 20, 150, 0);
    c.solid(20, 158, 18, 8);
    c.prop("tapebox", 40, 152, 1);
    c.solid(40, 160, 18, 8);
    // mesa plegable con un termo y revistas de radio
    c.prop("table", 112, 100);
    c.prop("mug", 118, 101);
    c.prop("papers", 126, 99);
    c.solid(112, 106, 26, 10);
    c.prop("chair", 140, 100);
  },
  home: [232, 92],
  terminal: { x: 216, y: 74, mark: [213, 30] },
  flavor: [
    {
      id: "radio", x: 46, y: 62, r: 18, label: "Equipo de radio",
      lines: [
        { who: "sam", text: "Una voz en japonés, luego pitidos. ¿Esto llega hasta Japón desde un garaje?" },
        { who: "gus", text: "Con buena propagación, hasta la Antártida. Ayer hablé con un pingüino. Bueno, con un científico. Parecía un pingüino.", mood: "alegre" },
      ],
      sound: () => { for (let i = 0; i < 6; i++) setTimeout(() => sfx(i % 3 === 2 ? "blip" : "tick"), i * 160); },
    },
    { id: "qsl", x: 266, y: 46, r: 16, label: "Tarjetas QSL", lines: [{ who: "sam", text: "Tarjetas de Japón, Brasil, Finlandia... Cada una es una conversación por radio con alguien al otro lado del mundo." }] },
    { id: "bike", x: 238, y: 160, r: 16, label: "Bicicleta", lines: [{ who: "gus", text: "Esa la arreglé con una antena vieja. Frena regular, pero recibe onda corta." }] },
  ],
  routine: [
    {
      name: "radio",
      run: async (m) => {
        await m.walk([[232, 84], [46, 84], [46, 64]]);
        m.face("up");
        for (let i = 0; i < 8; i++) setTimeout(() => m.sfx(i % 3 === 2 ? "blip" : "tick"), i * 180);
        m.bubble("duda");
        await m.wait(1700);
        m.bubble("sorpresa");
        await m.wait(900);
        m.bubble("alegre");
        await m.wait(1500);
        await m.walk([[46, 84], [232, 84], [232, 92]]);
      },
    },
    {
      name: "banco",
      run: async (m) => {
        await m.walk([[232, 84], [26, 84], [26, 64]]);
        m.face("up");
        for (let i = 0; i < 5; i++) setTimeout(() => m.sfx("click"), 300 + i * 420);
        await m.wait(1400);
        m.bubble("sudor");
        await m.wait(1600);
        m.bubble("idea");
        await m.wait(1200);
        await m.walk([[26, 84], [232, 84], [232, 92]]);
      },
    },
    {
      name: "bici",
      run: async (m) => {
        await m.walk([[232, 128], [238, 128]]);
        m.face("down");
        await m.wait(1500);
        m.bubble("enfado");
        m.sfx("click");
        await m.wait(1800);
        m.bubble("brillo");
        await m.wait(1200);
        await m.walk([[232, 128], [232, 92]]);
      },
    },
  ],
  lines: {
    busy: "¡Un momento, que tengo a Finlandia en la línea! Tú dale a la terminal. Cambio.",
    busyDone: "Recibido, Sam. Vuelve cuando quieras. Cambio y corto.",
    done: "Misión cumplida. Dile a Ruth que Gus le manda saludos en veinte metros.",
    next: (t) => `Siguiente ejercicio: «${t}». Está en la computadora del escritorio. Cambio.`,
    early: "¿Cortas a medio contacto? Vuelve luego: Ruth no te dará trabajo sin terminar esto. Cambio.",
  },
};

// ------------------------------------------------------------------ Rochy, el programador

const rochy: PlaceDef = {
  mentor: "rochy",
  build(c) {
    const g = c.scene.add.graphics().setDepth(0);
    // moqueta verde oscura
    g.fillStyle(0x2f4746, 1).fillRect(0, FLOOR_TOP, ROOM_W, FLOOR_BOTTOM - FLOOR_TOP);
    for (let y = FLOOR_TOP; y < FLOOR_BOTTOM; y += 2)
      for (let x = (y * 5) % 6; x < ROOM_W; x += 6) g.fillStyle(0x344f4e, 1).fillRect(x, y, 1, 1);
    // pared morada con una tira de corcho
    const w = c.scene.add.graphics().setDepth(2);
    w.fillStyle(0x3a2f52, 1).fillRect(0, 0, ROOM_W, FLOOR_TOP);
    for (let x = 0; x < ROOM_W; x += 10) w.fillStyle(0x332947, 1).fillRect(x, 0, 3, FLOOR_TOP);
    w.fillStyle(0x2a2140, 1).fillRect(0, 36, ROOM_W, 4);
    w.fillStyle(0x1c1830, 1).fillRect(0, 39, ROOM_W, 1);
    frame(c, undefined, 0x2a2140);
    // pósteres (naves, ordenadores y anime) y la ventana con la persiana bajada
    c.img("posters", 16, 6, 0).setDepth(3);
    c.img("posters", 40, 6, 3).setDepth(3);
    c.img("window", 120, 2, 1).setDepth(3);
    c.img("posters", 162, 6, 2).setDepth(3);
    c.img("posters", 184, 6, 1).setDepth(3);
    // dos armarios de servidores en el rincón, con las luces parpadeando
    for (const [x, d] of [[274, 0], [296, 400]] as const) {
      const r = c.scene.add.sprite(x, 8, "server_rack", 0).setOrigin(0, 0).setDepth(100 + 50);
      c.scene.time.delayedCall(d, () => r.play("rack-blink"));
    }
    c.solid(274, 40, 44, 10);
    // cama individual sin hacer: cabecera con almohada y la manta
    c.prop("bed", 14, 42);
    c.solid(14, 46, 22, 32);
    // alfombra vieja en el centro, con una consola y su mando
    c.img("rug", 128, 104).setDepth(1);
    // escritorio con dos terminales: la de los ejercicios y la que compila desde el martes
    terminalDesk(c);
    c.scene.add.sprite(224, 36, "terminal", 3).setOrigin(0, 0).setDepth(100 + 72).play("term-alert");
    c.prop("chair", 212, 64);
    c.prop("soda_cans", 254, 60);
    // estantería con manuales, el puf y las cajas de pizza
    c.prop("kenney", 60, 26, kenney(20, 17));
    c.prop("kenney", 76, 26, kenney(21, 17));
    c.prop("kenney", 92, 26, kenney(20, 17));
    c.prop("kenney", 108, 26, kenney(21, 17));
    c.solid(60, 34, 64, 8);
    c.prop("book_piles", 126, 30);
    c.prop("book_piles", 30, 150);
    c.solid(32, 160, 24, 8);
    c.prop("beanbag", 56, 114);
    c.solid(58, 124, 26, 10);
    c.prop("pizza_boxes", 270, 140);
    c.solid(272, 148, 22, 8);
    c.prop("trash", 300, 100);
  },
  home: [232, 92],
  terminal: { x: 216, y: 74, mark: [213, 30] },
  flavor: [
    {
      id: "terminal2", x: 238, y: 74, r: 10, label: "La otra terminal",
      lines: [
        { who: "sam", text: "Pone COMPILANDO... 61%. ¿Desde cuándo?" },
        { who: "rochy", text: "Desde el martes. No la toques. Ni la mires mucho.", mood: "serio" },
      ],
    },
    { id: "pizza", x: 282, y: 156, r: 16, label: "Cajas de pizza", lines: [{ who: "sam", text: "Cinco cajas vacías. Una con una nota: \"no tirar, es arte\"." }] },
    { id: "manuales", x: 92, y: 48, r: 22, label: "Estanterías", lines: [{ who: "sam", text: "El manual de C de Kernighan y Ritchie, tres de UNIX, uno de LISP y una pila de cómics japoneses encima de todo." }] },
    {
      id: "servidores", x: 296, y: 56, r: 18, label: "Servidores",
      lines: [
        { who: "sam", text: "¿Tienes dos armarios de servidores en el cuarto?" },
        { who: "rochy", text: "Me los dio la universidad. Bueno, los iban a tirar. Calientan el cuarto gratis." },
      ],
    },
    {
      id: "posteres", x: 184, y: 46, r: 16, label: "Pósteres",
      lines: [
        { who: "sam", text: "Un robot gigante y una chica de ojos enormes. ¿Qué es esto?" },
        { who: "rochy", text: "Anime. De Japón. Me llegan las cintas por correo, subtituladas por un tipo de Ohio.", mood: "alegre" },
      ],
    },
  ],
  routine: [
    {
      name: "pizza",
      run: async (m) => {
        await m.walk([[232, 130], [282, 130], [282, 136]]);
        m.face("down");
        await m.wait(900);
        m.bubble("corazon");
        await m.wait(2200);
        await m.walk([[282, 130], [232, 130], [232, 92]]);
      },
    },
    {
      name: "teclear",
      run: async (m) => {
        await m.walk([[240, 92], [240, 72]]);
        m.face("up");
        for (let i = 0; i < 14; i++) setTimeout(() => m.sfx("key"), i * 110);
        await m.wait(1400);
        m.bubble("enfado");
        await m.wait(1200);
        m.bubble("idea");
        await m.wait(1000);
        await m.walk([[240, 92], [232, 92]]);
      },
    },
    {
      name: "siesta",
      run: async (m) => {
        await m.walk([[232, 140], [72, 140], [72, 130]]);
        m.face("down");
        await m.wait(800);
        for (let t = 0; t < 3600; t += 1300) setTimeout(() => m.bubble("zzz"), t);
        await m.wait(3800);
        m.bubble("sorpresa");
        await m.wait(700);
        await m.walk([[72, 140], [232, 140], [232, 92]]);
      },
    },
  ],
  lines: {
    busy: "Ugh. Estoy ocupado. La terminal está ahí. Sí, esa.",
    busyDone: "Ya está, ¿no? Cierra la puerta al salir.",
    done: "Hemos terminado. Por fin. Vete antes de que me pidas otra cosa.",
    next: (t) => `«${t}». En la terminal de la izquierda. La de la derecha no: está compilando desde el martes.`,
    early: "¿Te vas? Bien. Digo... vuelve cuando quieras. Pero Kessler no te dará trabajo sin esto.",
  },
};

export const PLACES: Record<MentorKey, PlaceDef> = { margarita, gus, rochy };
