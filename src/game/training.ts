// Misiones secundarias: antes de algunos encargos, Ruth o Kessler mandan a Sam a
// practicar con Margarita, que le enseñó a programar a Ruth en 1971. Cada sesión
// son tres ejercicios cortos en la terminal de su casa, solo con lo ya aprendido.
// Hay una sesión antes de las misiones 3, 6, 8, 11, 13, 17, 21 y 26: Margarita da
// las cuatro primeras, Gus (radioaficionado) las dos siguientes y Benny (programador) las dos últimas.
import type { Line, Mission, TestCase } from "./types";
import type { RunOutput } from "./sandbox";
import { printed, probeErr, same, show } from "./acts/util";
import type { MentorKey } from "./mentors";

export interface TrainingSet {
  id: string;
  /** Quién da la sesión y en qué lugar. */
  mentor: MentorKey;
  /** Misión que no se puede empezar hasta terminar la sesión. */
  before: string;
  title: string;
  /** Lo que dice quien manda a Sam a casa de Margarita. */
  sendoff: Line[];
  /** Al llegar a la casa. */
  welcome: Line[];
  exercises: Mission[];
  /** Al terminar los tres ejercicios. */
  farewell: Line[];
  /** Al volver al laboratorio, antes del encargo de siempre. */
  back: Line[];
}

const near = (a: unknown, b: number) => typeof a === "number" && Math.abs(a - b) < 1e-9;
const ok = (feedback: string) => ({ pass: true, feedback });
const no = (feedback: string) => ({ pass: false, feedback });

interface ExSpec {
  id: string;
  act: number;
  title: string;
  concept: string;
  lesson: Mission["lesson"];
  task: string;
  starter?: string;
  borrowed?: string[];
  cases: TestCase[];
  capture?: string[];
  probe?: string;
  check: (outs: RunOutput[], cases: TestCase[]) => { pass: boolean; feedback: string };
  hints: string[];
  debrief: string;
}

function ex(s: ExSpec): Mission {
  return {
    id: s.id,
    act: s.act,
    title: s.title,
    concept: s.concept,
    phase: "dia",
    giver: "terminal",
    clock: "17:30",
    probe: s.probe,
    briefing: [],
    lesson: s.lesson,
    task: s.task,
    starter: s.starter ?? "// Escribe tu código debajo de esta línea\n",
    borrowed: s.borrowed ?? [],
    cases: s.cases,
    capture: s.capture ?? [],
    check: s.check,
    hints: s.hints,
    debrief: [{ who: "margarita", text: s.debrief }],
    clue: { title: s.title, text: "" },
  };
}

/** Recorre todos los casos: el primero que falle devuelve su mensaje. */
const every = (outs: RunOutput[], cases: TestCase[], one: (o: RunOutput, g: Record<string, unknown>) => string | null, win: string) => {
  for (let i = 0; i < outs.length; i++) {
    const o = outs[i];
    if (o.error) return no(`Error: ${o.error.message}`);
    const msg = one(o, cases[i].globals());
    if (msg) return no(msg);
  }
  return ok(win);
};

export const TRAINING: TrainingSet[] = [
  {
    id: "t1",
    mentor: "margarita",
    before: "m3",
    title: "Cuentas de la tienda",
    sendoff: [
      { who: "ruth", text: "Antes de seguir, quiero que practiques un poco. No con la VAX: con alguien que enseña mejor que yo." },
      { who: "ruth", text: "Margarita. Me enseñó a programar en 1971, con tarjetas perforadas. Vive en Elmwood, a diez minutos en bici." },
      { who: "ruth", text: "Sal por la puerta. Ya le avisé de que ibas.", mood: "alegre" },
    ],
    welcome: [
      { who: "margarita", text: "Tú debes de ser Sam. Ruth dice que tienes buena cabeza y mala letra. Pasa.", mood: "alegre" },
      { who: "margarita", text: "Las variables y las cuentas se aprenden como el piano: repitiendo. Te dejé tres ejercicios en mi terminal." },
    ],
    exercises: [
      ex({
        id: "t1a",
        act: 1,
        title: "El pan de la mañana",
        concept: "Variables",
        lesson: {
          title: "Multiplicar con variables",
          body: "Si una variable guarda un precio y otra una cantidad, la multiplicación (*) da el total. Guarda el resultado en una variable nueva y muéstralo.",
          example: "let galletas = 6;\nlet cajas = 2;\nlet todas = galletas * cajas;\nconsole.log(todas); // 12",
        },
        task: "Margarita compró pan. Crea la variable `total` con `precio` por `cantidad` y muéstrala con `console.log`.",
        borrowed: ["precio", "cantidad"],
        cases: [
          { label: "3 panes a 1.25", globals: () => ({ precio: 1.25, cantidad: 3 }) },
          { label: "5 panes a 0.80", globals: () => ({ precio: 0.8, cantidad: 5 }) },
        ],
        capture: ["total"],
        check: (outs, cases) =>
          every(outs, cases, (o, g) => {
            const want = (g.precio as number) * (g.cantidad as number);
            if (o.values.total === undefined) return "Falta la variable total.";
            if (!near(o.values.total, want)) return `total vale ${show(o.values.total)}, pero ${g.cantidad} panes a ${g.precio} son ${want}. ¿Usaste las variables precio y cantidad?`;
            if (!printed(o, String(want))) return "La cuenta está bien. Falta mostrarla con console.log(total).";
            return null;
          }, "Exacto. Y funciona con cualquier precio: eso es lo bueno de las variables."),
        hints: ["Multiplica las dos variables que ya existen: precio * cantidad", "let total = precio * cantidad;", "let total = precio * cantidad;\nconsole.log(total);"],
        debrief: "Bien. No escribiste el número a mano: lo calculó la máquina. Así debe ser.",
      }),
      ex({
        id: "t1b",
        act: 1,
        title: "El termómetro del jardín",
        concept: "Operaciones",
        lesson: {
          title: "Paréntesis: primero lo de dentro",
          body: "Como en matemáticas, * y / van antes que + y -. Si quieres restar primero, usa paréntesis.",
          example: "let a = (10 - 4) * 2; // 12\nlet b = 10 - 4 * 2;   // 2",
        },
        task: "El termómetro de Margarita marca grados Fahrenheit. Crea la variable `celsius` con `(fahrenheit - 32) * 5 / 9` y muéstrala.",
        borrowed: ["fahrenheit"],
        cases: [
          { label: "agua hirviendo (212 °F)", globals: () => ({ fahrenheit: 212 }) },
          { label: "mañana fresca (50 °F)", globals: () => ({ fahrenheit: 50 }) },
        ],
        capture: ["celsius"],
        check: (outs, cases) =>
          every(outs, cases, (o, g) => {
            const f = g.fahrenheit as number;
            const want = ((f - 32) * 5) / 9;
            if (o.values.celsius === undefined) return "Falta la variable celsius.";
            if (near(o.values.celsius, f - (32 * 5) / 9)) return "Te faltan los paréntesis: sin ellos se multiplica antes de restar.";
            if (!near(o.values.celsius, want)) return `celsius vale ${show(o.values.celsius)} y para ${f} °F debería ser ${want}.`;
            if (!printed(o, String(want))) return "La fórmula está bien. Muéstrala con console.log(celsius).";
            return null;
          }, "Cien grados el agua hirviendo. La física y la máquina están de acuerdo."),
        hints: ["Escribe la fórmula tal cual, con paréntesis alrededor de fahrenheit - 32", "let celsius = (fahrenheit - 32) * 5 / 9;", "let celsius = (fahrenheit - 32) * 5 / 9;\nconsole.log(celsius);"],
        debrief: "Los paréntesis son como las comillas de un chisme: cambian todo el sentido.",
      }),
      ex({
        id: "t1c",
        act: 1,
        title: "La hucha",
        concept: "Reasignar",
        lesson: {
          title: "Cambiar el valor de una variable",
          body: "Una variable creada con let puede cambiar. Sin let delante, se le da un valor nuevo: ahorros = ahorros + 5 suma 5 a lo que ya había.",
          example: "let pasos = 10;\npasos = pasos + 3;\nconsole.log(pasos); // 13",
        },
        task: "En la hucha hay `ahorros`. Margarita mete 20 y luego saca 7.50. Cambia `ahorros` con esas dos operaciones (sin crear otra variable) y muéstrala.",
        starter: "// ahorros ya existe: no uses let con él\n",
        borrowed: ["ahorros"],
        cases: [
          { label: "hucha con 12", globals: () => ({ ahorros: 12 }) },
          { label: "hucha con 40", globals: () => ({ ahorros: 40 }) },
        ],
        capture: ["ahorros"],
        check: (outs, cases) =>
          every(outs, cases, (o, g) => {
            const want = (g.ahorros as number) + 20 - 7.5;
            if (near(o.values.ahorros, g.ahorros as number)) return "ahorros no cambió. Escribe ahorros = ahorros + 20; y después la resta.";
            if (!near(o.values.ahorros, want)) return `ahorros quedó en ${show(o.values.ahorros)}. Empezando con ${g.ahorros}, debería quedar ${want}.`;
            if (!printed(o, String(want))) return "La cuenta está bien. Falta console.log(ahorros).";
            return null;
          }, "Una variable es una caja: puedes cambiar lo que guarda."),
        hints: ["Primero: ahorros = ahorros + 20;", "Después: ahorros = ahorros - 7.50;", "ahorros = ahorros + 20;\nahorros = ahorros - 7.50;\nconsole.log(ahorros);"],
        debrief: "Muy bien. Ruth tardó una semana en entender eso. No se lo digas.",
      }),
    ],
    farewell: [
      { who: "margarita", text: "Suficiente por hoy. Vuelve al laboratorio, que Ruth no sabe esperar.", mood: "alegre" },
      { who: "margarita", text: "Y Sam: si algo no te cuadra, no es la máquina. Casi nunca es la máquina." },
    ],
    back: [{ who: "ruth", text: "¿Te dio galletas? A mí nunca me daba galletas. Bueno, a lo nuestro." }],
  },
  {
    id: "t2",
    mentor: "margarita",
    before: "m6",
    title: "La agenda de Margarita",
    sendoff: [
      { who: "ruth", text: "Ahora vienen las listas. Antes, pásate otra vez por casa de Margarita." },
      { who: "ruth", text: "Dice que si no repasas los bucles, se te oxidan. Tiene razón, y lo odio." },
    ],
    welcome: [
      { who: "margarita", text: "Otra vez por aquí. Bien: textos, decisiones y repeticiones. Lo que hace una máquina en todo el día.", mood: "alegre" },
    ],
    exercises: [
      ex({
        id: "t2a",
        act: 1,
        title: "La tarjeta de cumpleaños",
        concept: "Plantillas",
        lesson: {
          title: "Textos con huecos",
          body: "Con la comilla invertida ` se escriben plantillas: lo que va dentro de ${...} se sustituye por su valor.",
          example: "let gato = \"Byte\";\nconsole.log(`Hola, ${gato}`); // Hola, Byte",
        },
        task: "Crea la variable `tarjeta` con el texto \"Feliz cumpleaños, NOMBRE. Ya tienes EDAD años.\", usando los valores de `nombre` y `edad`, y muéstrala.",
        borrowed: ["nombre", "edad"],
        cases: [
          { label: "Ruth", globals: () => ({ nombre: "Ruth", edad: 34 }) },
          { label: "Margarita", globals: () => ({ nombre: "Margarita", edad: 71 }) },
        ],
        capture: ["tarjeta"],
        check: (outs, cases) =>
          every(outs, cases, (o, g) => {
            const want = `Feliz cumpleaños, ${g.nombre}. Ya tienes ${g.edad} años.`;
            if (o.values.tarjeta === undefined) return "Falta la variable tarjeta.";
            if (typeof o.values.tarjeta === "string" && o.values.tarjeta.includes("${")) return "Se ve ${ en el texto: usa la comilla invertida ` en vez de comillas normales.";
            if (o.values.tarjeta !== want) return `La tarjeta dice ${show(o.values.tarjeta)}. Debería decir ${show(want)}.`;
            if (!printed(o, want)) return "La tarjeta está bien. Falta console.log(tarjeta).";
            return null;
          }, "Una tarjeta para cada uno, con el mismo código."),
        hints: ["Usa la comilla invertida: `Feliz cumpleaños, ${nombre}. ...`", "let tarjeta = `Feliz cumpleaños, ${nombre}. Ya tienes ${edad} años.`;", "let tarjeta = `Feliz cumpleaños, ${nombre}. Ya tienes ${edad} años.`;\nconsole.log(tarjeta);"],
        debrief: "Setenta y uno. No hace falta que lo repitas en voz alta.",
      }),
      ex({
        id: "t2b",
        act: 1,
        title: "¿Paraguas?",
        concept: "if / else",
        lesson: {
          title: "Decidir",
          body: "if (condición) { ... } else { ... } ejecuta un bloque u otro. Las comparaciones son <, >, <=, >= y ===.",
          example: "if (temperatura > 30) {\n  console.log(\"calor\");\n} else {\n  console.log(\"bien\");\n}",
        },
        task: "Si `lluvia` es mayor que 50 (por ciento), muestra \"paraguas\". Si no, muestra \"sombrero\".",
        borrowed: ["lluvia"],
        cases: [
          { label: "día nublado (80)", globals: () => ({ lluvia: 80 }) },
          { label: "día claro (10)", globals: () => ({ lluvia: 10 }) },
          { label: "justo en el límite (50)", globals: () => ({ lluvia: 50 }) },
        ],
        check: (outs, cases) =>
          every(outs, cases, (o, g) => {
            const want = (g.lluvia as number) > 50 ? "paraguas" : "sombrero";
            if (!o.logs.length) return "No se mostró nada. Usa console.log dentro de cada bloque.";
            if (o.logs.length > 1) return "Se mostraron dos cosas: cada caso debe mostrar solo una. ¿Falta el else?";
            if (o.logs[0].trim() !== want) return `Con lluvia ${g.lluvia} salió ${show(o.logs[0])} y debía salir ${want}.${g.lluvia === 50 ? " Mayor que 50 no incluye el 50: usa >." : ""}`;
            return null;
          }, "Paraguas cuando toca, sombrero cuando no. Berkeley en una línea."),
        hints: ["La condición es lluvia > 50", "if (lluvia > 50) { ... } else { ... }", "if (lluvia > 50) {\n  console.log(\"paraguas\");\n} else {\n  console.log(\"sombrero\");\n}"],
        debrief: "En esta casa el paraguas está siempre junto a la puerta. Por si acaso.",
      }),
      ex({
        id: "t2c",
        act: 1,
        title: "Escalas de piano",
        concept: "Bucle for",
        lesson: {
          title: "Repetir contando",
          body: "for (let i = 1; i <= n; i++) { ... } repite el bloque con i = 1, 2, 3... hasta n. Con una variable fuera del bucle puedes ir acumulando.",
          example: "let suma = 0;\nfor (let i = 1; i <= 3; i++) {\n  suma = suma + i;\n}\nconsole.log(suma); // 6",
        },
        task: "Margarita practica escalas: el día 1 toca 1 escala, el día 2 toca 2, y así cada día. La variable `dias` dice cuántos días practica. Suma todas las escalas de esos días y muestra el total.",
        borrowed: ["dias"],
        cases: [
          { label: "una semana", globals: () => ({ dias: 7 }) },
          { label: "un mes", globals: () => ({ dias: 30 }) },
        ],
        check: (outs, cases) =>
          every(outs, cases, (o, g) => {
            const n = g.dias as number;
            const want = (n * (n + 1)) / 2;
            if (!o.logs.length) return "No se mostró nada. Muestra el total al final, fuera del bucle.";
            if (o.logs.length > 1) return "Se mostraron muchos números: pon el console.log después del bucle, no dentro.";
            if (o.logs[0].trim() === String(want - n)) return "Te falta el último día: la condición debe ser i <= dias.";
            if (o.logs[0].trim() !== String(want)) return `En ${n} días son ${want} escalas y salió ${o.logs[0]}. ¿Usaste dias en la condición?`;
            return null;
          }, "Doscientas escalas en un mes. Por eso toca tan bien."),
        hints: ["Empieza con let total = 0; antes del bucle", "Dentro del bucle: total = total + i;", "let total = 0;\nfor (let i = 1; i <= dias; i++) {\n  total = total + i;\n}\nconsole.log(total);"],
        debrief: "Las escalas aburren. Pero sin escalas no hay sonata. Con los bucles es igual.",
      }),
    ],
    farewell: [{ who: "margarita", text: "Muy bien. Llévale esto a Ruth: es un bizcocho. No le digas que es de ayer.", mood: "alegre" }],
    back: [{ who: "ruth", text: "Bizcocho de ayer. Lo reconozco. Gracias. Vamos con las listas." }],
  },
  {
    id: "t3",
    mentor: "margarita",
    before: "m8",
    title: "Las notas del conservatorio",
    sendoff: [
      { who: "kessler", text: "Ruth me dice que vas a escribir funciones. Antes, ella insiste en que veas a esa señora del piano." },
      { who: "kessler", text: "Margarita. Fue la mejor programadora del centro de cálculo. Y la más difícil. Ve." },
    ],
    welcome: [
      { who: "margarita", text: "Listas. Doy clases de piano a cuatro niños y llevo sus notas en la máquina. Ayúdame con ellas." },
    ],
    exercises: [
      ex({
        id: "t3a",
        act: 2,
        title: "Primera y última",
        concept: "Índices",
        lesson: {
          title: "Leer una posición",
          body: "Las posiciones de una lista empiezan en 0. La última es lista.length - 1.",
          example: "let frutas = [\"pera\", \"uva\", \"kiwi\"];\nconsole.log(frutas[0]); // pera\nconsole.log(frutas[frutas.length - 1]); // kiwi",
        },
        task: "Muestra la primera nota de la lista `notas` y después la última.",
        borrowed: ["notas"],
        cases: [
          { label: "notas de Ana", globals: () => ({ notas: [6, 8, 7, 9] }) },
          { label: "notas de Leo", globals: () => ({ notas: [5, 4, 7, 8, 10, 6] }) },
        ],
        check: (outs, cases) =>
          every(outs, cases, (o, g) => {
            const n = g.notas as number[];
            const want = [String(n[0]), String(n[n.length - 1])];
            const got = o.logs.map((l) => l.trim());
            if (got.length !== 2) return `Deben salir dos números y salieron ${got.length}.`;
            if (got[0] === String(n[1])) return "La primera posición es la 0, no la 1.";
            if (got[1] === "undefined") return "notas[notas.length] no existe: la última es notas.length - 1.";
            if (!same(got, want)) return `Salió ${got.join(" y ")} y debía salir ${want.join(" y ")}. La última depende de length: no la escribas a mano.`;
            return null;
          }, "Cero y length menos uno. Te vas a acordar de esto toda la vida."),
        hints: ["La primera: notas[0]", "La última: notas[notas.length - 1]", "console.log(notas[0]);\nconsole.log(notas[notas.length - 1]);"],
        debrief: "Empezar a contar en cero parece una locura. Luego se vuelve costumbre.",
      }),
      ex({
        id: "t3b",
        act: 2,
        title: "Los aprobados",
        concept: "push",
        lesson: {
          title: "Llenar una lista nueva",
          body: "Recorre la lista con for y usa `push` para añadir al final de otra lista solo lo que cumple una condición. Si el bloque del if tiene una sola línea, puedes escribirlo sin llaves: `if (x > 5) lista.push(x);` Es lo mismo.",
          example: "let edades = [12, 30, 8, 41];\nlet mayores = [];\nfor (let i = 0; i < edades.length; i++) {\n  if (edades[i] >= 18) {\n    mayores.push(edades[i]);\n  }\n}\nconsole.log(mayores); // [30,41]",
        },
        task: "Crea la lista `aprobadas` con las notas de `notas` mayores o iguales a 6, en el mismo orden, y muéstrala.",
        borrowed: ["notas"],
        cases: [
          { label: "clase del martes", globals: () => ({ notas: [6, 3, 8, 5, 10] }) },
          { label: "clase del jueves", globals: () => ({ notas: [4, 9, 6, 6, 2, 7] }) },
        ],
        capture: ["aprobadas"],
        check: (outs, cases) =>
          every(outs, cases, (o, g) => {
            const want = (g.notas as number[]).filter((x) => x >= 6);
            if (!Array.isArray(o.values.aprobadas)) return "Falta la lista aprobadas. Empieza con let aprobadas = [];";
            if (!same(o.values.aprobadas, want) && same(o.values.aprobadas, (g.notas as number[]).filter((x) => x > 6))) return "Faltan los seises: la condición es mayor o igual, >=.";
            if (!same(o.values.aprobadas, want)) return `aprobadas quedó ${show(o.values.aprobadas)} y debía ser ${show(want)}.`;
            if (!o.logs.length) return "La lista está bien. Muéstrala con console.log(aprobadas).";
            return null;
          }, "Nadie suspende por un seis en esta casa."),
        hints: ["let aprobadas = []; y después un for que recorra notas", "Dentro: if (notas[i] >= 6) aprobadas.push(notas[i]);", "let aprobadas = [];\nfor (let i = 0; i < notas.length; i++) {\n  if (notas[i] >= 6) {\n    aprobadas.push(notas[i]);\n  }\n}\nconsole.log(aprobadas);"],
        debrief: "Recorrer y filtrar. Vas a hacer eso mil veces con los registros de Ruth.",
      }),
      ex({
        id: "t3c",
        act: 2,
        title: "La mejor nota",
        concept: "Máximo",
        lesson: {
          title: "Recordar el mayor",
          body: "Para encontrar el mayor, guarda el primero y recorre la lista: si alguno es más grande, pasa a ser el nuevo mayor.",
          example: "let alto = lista[0];\nfor (let i = 1; i < lista.length; i++) {\n  if (lista[i] > alto) alto = lista[i];\n}",
        },
        task: "Guarda en la variable `mejor` la nota más alta de `notas` y muéstrala.",
        borrowed: ["notas"],
        cases: [
          { label: "clase del martes", globals: () => ({ notas: [6, 3, 8, 5, 7] }) },
          { label: "todas bajas", globals: () => ({ notas: [2, 4, 1, 3] }) },
          { label: "la mejor al final", globals: () => ({ notas: [5, 6, 7, 10] }) },
        ],
        capture: ["mejor"],
        check: (outs, cases) =>
          every(outs, cases, (o, g) => {
            const want = Math.max(...(g.notas as number[]));
            if (o.values.mejor === undefined) return "Falta la variable mejor.";
            if (o.values.mejor !== want) return `Con ${show(g.notas)} mejor quedó ${show(o.values.mejor)} y debía ser ${want}.${o.values.mejor !== undefined && !(g.notas as number[]).includes(o.values.mejor as number) ? " Ese número no está en la lista: parece que empezaste con un valor escrito a mano. Empieza con let mejor = notas[0]; así sirve para cualquier lista." : ""}`;
            if (!printed(o, String(want))) return "Está bien. Falta console.log(mejor).";
            return null;
          }, "El diez del pequeño Leo. Se lo diré el sábado."),
        hints: ["Empieza con let mejor = notas[0];", "Recorre la lista y si notas[i] > mejor, cambia mejor", "let mejor = notas[0];\nfor (let i = 1; i < notas.length; i++) {\n  if (notas[i] > mejor) {\n    mejor = notas[i];\n  }\n}\nconsole.log(mejor);"],
        debrief: "Así se busca un récord. O un intruso: el que más tiempo pasa conectado.",
      }),
    ],
    farewell: [{ who: "margarita", text: "Dile a Kessler que sigo esperando que me devuelva mi manual de FORTRAN. Desde 1974.", mood: "serio" }],
    back: [{ who: "kessler", text: "¿Manual de FORTRAN? No sé de qué habla. Bueno. Funciones." }],
  },
  {
    id: "t4",
    mentor: "margarita",
    before: "m11",
    title: "Recetas",
    sendoff: [
      { who: "kessler", text: "Lo que viene es delicado. Ruth quiere que practiques funciones con Margarita antes de tocar los registros." },
      { who: "kessler", text: "Ve. Y si te pregunta por un manual, no me has visto." },
    ],
    welcome: [
      { who: "margarita", text: "Una función es una receta: le das ingredientes y te devuelve el plato. Hoy cocinamos.", mood: "alegre" },
    ],
    exercises: [
      ex({
        id: "t4a",
        act: 2,
        title: "Doble ración",
        concept: "Funciones",
        lesson: {
          title: "Devolver un resultado",
          body: "function nombre(parametro) { return ...; } crea una función. return entrega el resultado a quien la llama.",
          example: "function triple(n) {\n  return n * 3;\n}\nconsole.log(triple(4)); // 12",
        },
        task: "Escribe la función `doble(n)` que devuelva `n` multiplicado por 2.",
        probe: 'typeof doble !== "function" ? "__nofn" : [doble(4), doble(0), doble(2.5), doble(-3)]',
        cases: [{ label: "cuatro raciones", globals: () => ({}) }],
        check: ([o]) => {
          const p = o.values.__probe;
          const err = probeErr(o);
          if (o.error) return no(`Error: ${o.error.message}`);
          if (p === "__nofn") return no("No encuentro la función doble. Empieza con function doble(n) {");
          if (err) return no(`La función dio un error: ${err}`);
          if (same(p, [undefined, undefined, undefined, undefined])) return no("La función no devuelve nada. ¿Falta return?");
          if (!same(p, [8, 0, 5, -6])) return no(`doble(4), doble(0), doble(2.5) y doble(-3) dieron ${show(p)}. Debían dar [8,0,5,-6].`);
          return ok("Doble ración para cualquier número.");
        },
        hints: ["function doble(n) { ... }", "Dentro: return n * 2;", "function doble(n) {\n  return n * 2;\n}"],
        debrief: "Escribes la receta una vez y la usas siempre. Eso es una función.",
      }),
      ex({
        id: "t4b",
        act: 2,
        title: "La etiqueta del frasco",
        concept: "Parámetros",
        lesson: {
          title: "Varios ingredientes",
          body: "Una función puede recibir varios parámetros separados por comas. Puedes devolver un texto hecho con una plantilla.",
          example: "function saludo(nombre, hora) {\n  return `Hola, ${nombre}. Son las ${hora}.`;\n}",
        },
        task: "Escribe la función `etiqueta(fruta, anio)` que devuelva el texto \"Mermelada de FRUTA (ANIO)\". Por ejemplo: \"Mermelada de higo (1986)\".",
        probe: 'typeof etiqueta !== "function" ? "__nofn" : [etiqueta("higo", 1986), etiqueta("ciruela", 1985)]',
        cases: [{ label: "dos frascos", globals: () => ({}) }],
        check: ([o]) => {
          const p = o.values.__probe;
          const err = probeErr(o);
          if (o.error) return no(`Error: ${o.error.message}`);
          if (p === "__nofn") return no("No encuentro la función etiqueta.");
          if (err) return no(`La función dio un error: ${err}`);
          const want = ["Mermelada de higo (1986)", "Mermelada de ciruela (1985)"];
          if (!same(p, want)) return no(`Las etiquetas salieron ${show(p)}. Debían ser ${show(want)}.`);
          return ok("Etiquetas perfectas. La despensa por fin tiene orden.");
        },
        hints: ["function etiqueta(fruta, anio) { ... }", "return `Mermelada de ${fruta} (${anio})`;", "function etiqueta(fruta, anio) {\n  return `Mermelada de ${fruta} (${anio})`;\n}"],
        debrief: "La de higo es la mejor. Llévate un frasco para Ruth.",
      }),
      ex({
        id: "t4c",
        act: 2,
        title: "La lista de la compra",
        concept: "Función + bucle",
        lesson: {
          title: "Una función que recorre",
          body: "Dentro de una función puede haber variables y bucles. Lo único que sale de ella es lo que devuelve return.",
          example: "function contarAltas(notas) {\n  let altas = 0;\n  for (let i = 0; i < notas.length; i++) {\n    if (notas[i] > 8) {\n      altas++;\n    }\n  }\n  return altas;\n}\nconsole.log(contarAltas([9, 5, 10])); // 2",
        },
        task: "Escribe la función `gastoTotal(precios)` que sume todos los números de la lista `precios` y devuelva el total.",
        probe: 'typeof gastoTotal !== "function" ? "__nofn" : [gastoTotal([2, 3.5, 4]), gastoTotal([]), gastoTotal([10])]',
        cases: [{ label: "tres compras", globals: () => ({}) }],
        check: ([o]) => {
          const p = o.values.__probe as unknown[];
          const err = probeErr(o);
          if (o.error) return no(`Error: ${o.error.message}`);
          if (p === ("__nofn" as unknown)) return no("No encuentro la función gastoTotal.");
          if (err) return no(`La función dio un error: ${err}`);
          if (Array.isArray(p) && p[1] === undefined) return no("Con una lista vacía devolvió undefined: el return quedó dentro del bucle. Ponlo después de la llave que cierra el for.");
          if (!same(p, [9.5, 0, 10])) return no(`Dio ${show(p)} y debía dar [9.5,0,10]. Fíjate en que la suma empiece en 0 y el return vaya después del bucle.`);
          return ok("Nueve dólares y medio. Los precios de 1986, Sam.");
        },
        hints: ["Dentro de la función: let total = 0; y un for", "Suma cada precio con total = total + precios[i]; y devuelve total después del bucle", "function gastoTotal(precios) {\n  let total = 0;\n  for (let i = 0; i < precios.length; i++) {\n    total = total + precios[i];\n  }\n  return total;\n}"],
        debrief: "Ya sabes todo lo que yo sabía en 1971. Bueno, casi todo.",
      }),
    ],
    farewell: [
      { who: "margarita", text: "Ya no te hace falta venir tanto. Pero vuelve igual: el piano suena mejor con público.", mood: "alegre" },
    ],
    back: [{ who: "kessler", text: "¿Volviste sin manual? Perfecto. A trabajar." }],
  },
  {
    id: "t5",
    mentor: "gus",
    before: "m13",
    title: "El cuaderno de bitácora",
    sendoff: [
      { who: "ruth", text: "Vas a filtrar registros como un profesional. Pero antes, quiero que conozcas a un amigo: Gus. Radioaficionado." },
      { who: "ruth", text: "Lleva todas sus conversaciones por radio en fichas, desde 1962. Vive en un garaje de Oakland lleno de antenas. Ve." },
      { who: "ruth", text: "Y si te pregunta por mi antena, di que está perfecta. No lo está.", mood: "alegre" },
    ],
    welcome: [
      { who: "gus", text: "¡Aquí W6GUS, adelante! Tú debes de ser Sam. Ruth dice que sabes de estrellas; yo, de ondas. Pasa, cuidado con los cables.", mood: "alegre" },
      { who: "gus", text: "Hoy, fichas. Un objeto guarda varios datos con nombre, como mis tarjetas de contacto: quién, desde dónde, en qué banda." },
    ],
    exercises: [
      ex({
        id: "t5a",
        act: 3,
        title: "La ficha del contacto",
        concept: "Objetos",
        lesson: {
          title: "Un objeto, varios datos",
          body: "Un objeto se escribe entre llaves `{ }` con pares `nombre: valor` separados por comas. Cada dato se lee con un punto: `objeto.dato`.",
          example: 'let gato = { nombre: "Byte", edad: 4 };\nconsole.log(gato.nombre); // Byte',
        },
        task: "Crea el objeto `contacto` con `indicativo` \"JA1ABC\", `pais` \"Japón\" y `banda` 20. Después muestra `contacto.pais`.",
        cases: [{ label: "contacto de anoche", globals: () => ({}) }],
        capture: ["contacto"],
        check: ([o]) => {
          if (o.error) return no(`Error: ${o.error.message}`);
          const a = o.values.contacto as Record<string, unknown> | undefined;
          if (!a || typeof a !== "object") return no("Falta el objeto contacto. Empieza con let contacto = { ... };");
          if (a.indicativo !== "JA1ABC") return no(`contacto.indicativo vale ${show(a.indicativo)} y debía ser "JA1ABC".`);
          if (a.pais !== "Japón") return no(`contacto.pais vale ${show(a.pais)} y debía ser "Japón", con tilde.`);
          if (a.banda !== 20) return no(`contacto.banda vale ${show(a.banda)}. Es un número: 20, sin comillas.`);
          if (!printed(o, "Japón")) return no("La ficha está bien. Falta mostrar contacto.pais con console.log.");
          return ok("Ficha completa. Un contacto con Japón desde un garaje de Oakland.");
        },
        hints: [
          "Un objeto va entre llaves { }, y cada dato se escribe nombre: valor, separados por comas.",
          'Empieza así: let contacto = { indicativo: "JA1ABC", ... };  y añade pais y banda.',
          'let contacto = { indicativo: "JA1ABC", pais: "Japón", banda: 20 };\nconsole.log(contacto.pais);',
        ],
        debrief: "Una ficha por contacto. Tengo cuatro mil en cajas de zapatos. Ahora caben en una línea.",
      }),
      ex({
        id: "t5b",
        act: 3,
        title: "Un contacto más",
        concept: "Cambiar un dato",
        lesson: {
          title: "Modificar un objeto",
          body: "Un dato de un objeto se cambia igual que una variable: `objeto.dato = nuevo valor`. Para sumar uno a lo que ya había: `objeto.dato = objeto.dato + 1`.",
          example: "let gato = { nombre: \"Byte\", edad: 4 };\ngato.edad = gato.edad + 1;\nconsole.log(gato.edad); // 5",
        },
        task: "Gus acaba de hablar con alguien nuevo: súmale 1 a `estacion.contactos` y muestra el número nuevo.",
        borrowed: ["estacion"],
        cases: [
          { label: "estación con 41 contactos", globals: () => ({ estacion: { indicativo: "W6GUS", contactos: 41 } }) },
          { label: "estación con 99 contactos", globals: () => ({ estacion: { indicativo: "W6GUS", contactos: 99 } }) },
        ],
        capture: ["estacion"],
        check: (outs, cases) =>
          every(outs, cases, (o, g) => {
            const want = (g.estacion as { contactos: number }).contactos + 1;
            const a = o.values.estacion as { contactos?: unknown } | undefined;
            if (!a || a.contactos === want - 1) return "estacion.contactos no cambió. Escribe estacion.contactos = estacion.contactos + 1;";
            if (a.contactos !== want) return `estacion.contactos quedó en ${show(a.contactos)} y debía ser ${want}. ¿Escribiste el número a mano?`;
            if (!printed(o, String(want))) return "El número está bien. Muéstralo con console.log(estacion.contactos).";
            return null;
          }, "Uno más en el cuaderno de bitácora. Y sin crear otra ficha."),
        hints: [
          "Usa el punto para leer el dato y también para cambiarlo: estacion.contactos",
          "A la izquierda del = va el dato que cambias, y a la derecha su valor más uno.",
          "estacion.contactos = estacion.contactos + 1;\nconsole.log(estacion.contactos);",
        ],
        debrief: "¡Cien contactos! Eso merece una tarjeta QSL dorada.",
      }),
      ex({
        id: "t5c",
        act: 3,
        title: "Las tarjetas de Japón",
        concept: "Lista de objetos",
        lesson: {
          title: "Recorrer fichas",
          body: "En una lista de objetos, `tarjetas[i]` es una ficha entera y `tarjetas[i].pais` uno de sus datos. Con un for recorres todas y con un if preguntas a cada una.",
          example: 'let libros = [{ autor: "Christie" }, { autor: "Poe" }];\nconsole.log(libros[1].autor); // Poe',
        },
        task: "Cuenta cuántas tarjetas de la lista `tarjetas` tienen `pais` \"Japón\" y muestra el número.",
        borrowed: ["tarjetas"],
        cases: [
          {
            label: "caja de este mes",
            globals: () => ({
              tarjetas: [
                { indicativo: "JA1ABC", pais: "Japón" },
                { indicativo: "PY2XYZ", pais: "Brasil" },
                { indicativo: "JH3KLM", pais: "Japón" },
                { indicativo: "OH2AB", pais: "Finlandia" },
              ],
            }),
          },
          {
            label: "caja del año pasado",
            globals: () => ({
              tarjetas: [
                { indicativo: "VK2DEF", pais: "Australia" },
                { indicativo: "JA7QRS", pais: "Japón" },
                { indicativo: "JE1TUV", pais: "Japón" },
                { indicativo: "JR6WXY", pais: "Japón" },
                { indicativo: "EA4ZZZ", pais: "España" },
              ],
            }),
          },
        ],
        check: (outs, cases) =>
          every(outs, cases, (o, g) => {
            const want = (g.tarjetas as { pais: string }[]).filter((p) => p.pais === "Japón").length;
            const got = o.logs.map((l) => l.trim());
            if (!got.length) return "No se mostró nada. Muestra el contador al final, fuera del bucle.";
            if (got.length > 1) return "Se mostraron varios números: el console.log va después del bucle.";
            if (got[0] !== String(want)) return `Salió ${got[0]} y hay ${want} de Japón. Compara tarjetas[i].pais === "Japón".`;
            return null;
          }, "Japón gana. Allí hay más radioaficionados que en ningún sitio."),
        hints: [
          "Necesitas un contador que empiece en 0 y un for que recorra tarjetas. En cada vuelta, pregunta por el país de esa tarjeta.",
          'Dentro del for: if (tarjetas[i].pais === "Japón") cuantas++;',
          'let cuantas = 0;\nfor (let i = 0; i < tarjetas.length; i++) {\n  if (tarjetas[i].pais === "Japón") {\n    cuantas++;\n  }\n}\nconsole.log(cuantas);',
        ],
        debrief: "Contar fichas que cumplen algo. Mañana Ruth te enseñará a hacerlo con una sola palabra: filter.",
      }),
    ],
    farewell: [
      { who: "gus", text: "¡Setenta y tres, Sam! Así nos despedimos en la radio: saludos. Dile a Ruth que su antena sigue torcida.", mood: "alegre" },
    ],
    back: [{ who: "ruth", text: "¿Te habló de mi antena? Lleva diez años con lo mismo. Bueno: a filtrar." }],
  },
  {
    id: "t6",
    mentor: "gus",
    before: "m17",
    title: "Quién está en el aire",
    sendoff: [
      { who: "kessler", text: "Lo de hoy es difícil incluso para mí. Ruth quiere que repases filter y map con su amigo de la radio." },
      { who: "kessler", text: "Hay nieve en las colinas. Ve con cuidado con la bici." },
    ],
    welcome: [
      { who: "gus", text: "¡Nieve en Oakland! La propagación está loca: hace una hora oí a un barco ballenero. Pasa, que hace frío.", mood: "sorpresa" },
      { who: "gus", text: "Hoy, filter y map. Yo los uso para saber quién está en el aire y a quién mandarle tarjeta." },
    ],
    exercises: [
      ex({
        id: "t6a",
        act: 4,
        title: "Señales débiles",
        concept: "filter",
        lesson: {
          title: "Quedarse con algunos",
          body: "`lista.filter((x) => condición)` revisa cada elemento y devuelve una lista nueva solo con los que cumplen la condición.",
          example: "let edades = [12, 30, 8];\nlet adultos = edades.filter((e) => e >= 18); // [30]",
        },
        task: "Las señales de la radio van del 1 al 9. Crea `debiles` con las de `senales` menores que 5, usando `filter`, y muéstrala.",
        borrowed: ["senales"],
        cases: [
          { label: "esta tarde", globals: () => ({ senales: [3, 7, 1, 5, 9] }) },
          { label: "esta noche", globals: () => ({ senales: [6, 4, 2] }) },
        ],
        capture: ["debiles"],
        check: (outs, cases) =>
          every(outs, cases, (o, g) => {
            const want = (g.senales as number[]).filter((p) => p < 5);
            if (!Array.isArray(o.values.debiles)) return "Falta la lista debiles.";
            if (!same(o.values.debiles, want) && same(o.values.debiles, (g.senales as number[]).filter((p) => p <= 5))) return "El 5 no es menor que 5: usa <, no <=.";
            if (!same(o.values.debiles, want)) return `debiles quedó ${show(o.values.debiles)} y debía ser ${show(want)}.`;
            if (!o.logs.length) return "Muéstrala con console.log(debiles).";
            return null;
          }, "Una línea en vez de un bucle entero."),
        hints: [
          "filter necesita una pregunta para cada señal: ¿es menor que 5?",
          "La pregunta como flecha: (s) => s < 5. Pásasela a senales.filter(...).",
          "let debiles = senales.filter((s) => s < 5);\nconsole.log(debiles);",
        ],
        debrief: "Con esas señales no se oye ni un estornudo. Fuera.",
      }),
      ex({
        id: "t6b",
        act: 4,
        title: "Los indicativos",
        concept: "map",
        lesson: {
          title: "Transformar cada uno",
          body: "`lista.map((x) => ...)` devuelve una lista nueva del mismo tamaño, con lo que devuelve la flecha para cada elemento.",
          example: "let precios = [2, 4];\nlet dobles = precios.map((p) => p * 2); // [4,8]",
        },
        task: "Crea `indicativos` con el indicativo de cada contacto de `contactos`, usando `map`, y muéstralo.",
        borrowed: ["contactos"],
        cases: [
          { label: "esta tarde", globals: () => ({ contactos: [{ indicativo: "JA1ABC", senal: 8 }, { indicativo: "OH2AB", senal: 4 }, { indicativo: "PY2XYZ", senal: 9 }] }) },
          { label: "esta noche", globals: () => ({ contactos: [{ indicativo: "VK2DEF", senal: 6 }] }) },
        ],
        capture: ["indicativos"],
        check: (outs, cases) =>
          every(outs, cases, (o, g) => {
            const want = (g.contactos as { indicativo: string }[]).map((a) => a.indicativo);
            if (!Array.isArray(o.values.indicativos)) return "Falta la lista indicativos.";
            if (!same(o.values.indicativos, want)) return `indicativos quedó ${show(o.values.indicativos)} y debía ser ${show(want)}. La flecha devuelve c.indicativo.`;
            if (!o.logs.length) return "Muéstrala con console.log(indicativos).";
            return null;
          }, "Una lista de fichas convertida en una lista de indicativos."),
        hints: [
          "map cambia cada contacto por otra cosa: aquí, por su indicativo.",
          "La flecha recibe un contacto y devuelve su indicativo: (c) => c.indicativo",
          "let indicativos = contactos.map((c) => c.indicativo);\nconsole.log(indicativos);",
        ],
        debrief: "Así anoto a quién he oído cada noche. Antes lo hacía a mano, con frío.",
      }),
      ex({
        id: "t6c",
        act: 4,
        title: "Tarjetas por mandar",
        concept: "filter + map",
        lesson: {
          title: "Encadenar",
          body: "El resultado de `filter` es una lista, así que se le puede aplicar `map` justo detrás: `lista.filter(...).map(...)`. Primero filtras y luego transformas.",
          example: "let grandes = [3, 8, 10].filter((n) => n > 5).map((n) => n * 10); // [80,100]",
        },
        task: "Gus solo manda tarjeta a quien se oye bien. Crea `porMandar` con los indicativos de los contactos con `senal` mayor o igual a 6, encadenando `filter` y `map`. Muéstralo.",
        borrowed: ["contactos"],
        cases: [
          { label: "esta tarde", globals: () => ({ contactos: [{ indicativo: "JA1ABC", senal: 8 }, { indicativo: "OH2AB", senal: 5 }, { indicativo: "PY2XYZ", senal: 6 }] }) },
          { label: "esta noche", globals: () => ({ contactos: [{ indicativo: "VK2DEF", senal: 4 }, { indicativo: "EA4ZZZ", senal: 9 }] }) },
        ],
        capture: ["porMandar"],
        check: (outs, cases) =>
          every(outs, cases, (o, g) => {
            const al = g.contactos as { indicativo: string; senal: number }[];
            const want = al.filter((a) => a.senal >= 6).map((a) => a.indicativo);
            if (!Array.isArray(o.values.porMandar)) return "Falta la lista porMandar.";
            if (o.values.porMandar.length && typeof o.values.porMandar[0] === "object") return "Te salieron fichas enteras: falta el map que saca el indicativo.";
            if (!same(o.values.porMandar, want) && same(o.values.porMandar, al.filter((a) => a.senal > 6).map((a) => a.indicativo))) return "Falta quien se oye con un 6 justo: usa >=.";
            if (!same(o.values.porMandar, want)) return `porMandar quedó ${show(o.values.porMandar)} y debía ser ${show(want)}.`;
            if (!o.logs.length) return "Muéstrala con console.log(porMandar).";
            return null;
          }, "Tarjetas listas. El cartero de Oakland ya me conoce por el nombre."),
        hints: [
          "Dos pasos: primero quédate con los contactos de señal 6 o más; después cambia cada uno por su indicativo.",
          "Primero contactos.filter((c) => c.senal >= 6), y justo detrás .map((c) => c.indicativo)",
          "let porMandar = contactos.filter((c) => c.senal >= 6).map((c) => c.indicativo);\nconsole.log(porMandar);",
        ],
        debrief: "Filtrar y transformar. Con eso se lee cualquier registro del mundo. Cambio.",
      }),
    ],
    farewell: [
      { who: "gus", text: "Lo próximo que te enseñará Ruth tiene un nombre raro: closures. Yo no sé qué son. Pero suena a antena." },
      { who: "gus", text: "Para eso, mejor Benny. Ya lo conocerás. Setenta y tres, Sam.", mood: "alegre" },
    ],
    back: [{ who: "kessler", text: "¿Closures? Yo tampoco las entiendo. Por eso estás tú aquí." }],
  },
  {
    id: "t7",
    mentor: "benny",
    before: "m21",
    title: "Cajas con memoria",
    sendoff: [
      { who: "kessler", text: "Cuatro países van a leer nuestros datos. Necesitamos orden. Ruth dice que antes veas a Benny." },
      { who: "kessler", text: "Un estudiante de doctorado que vive de pizza y sabe más que todo el departamento junto. No lo despiertes antes de mediodía." },
    ],
    welcome: [
      { who: "benny", text: "Ugh. Tú eres el de la VAX. Ruth me debe una. Pasa. No pises los cables. Ni las cajas. Ni nada.", mood: "serio" },
      { who: "benny", text: "Funciones que fabrican funciones. Lo explico una vez. Bueno, las veces que haga falta. Pero rápido." },
    ],
    exercises: [
      ex({
        id: "t7a",
        act: 5,
        title: "El prompt",
        concept: "Funciones que devuelven funciones",
        lesson: {
          title: "Una función que fabrica otra",
          body: "Una función puede devolver otra función. La de dentro recuerda los parámetros de la de fuera aunque esta ya haya terminado.",
          example: "function multiplicarPor(n) {\n  return (x) => x * n;\n}\nconst triple = multiplicarPor(3);\nconsole.log(triple(5)); // 15",
        },
        task: "Escribe la función `crearPrompt(usuario)` que devuelva otra función. Esa otra recibe un comando y devuelve el texto \"USUARIO> COMANDO\". Por ejemplo, `crearPrompt(\"sam\")(\"ls\")` devuelve \"sam> ls\".",
        probe: 'typeof crearPrompt !== "function" ? "__nofn" : (() => { const a = crearPrompt("sam"); const b = crearPrompt("benny"); if (typeof a !== "function") return "__nofnret"; return [a("ls"), b("make"), a("who")]; })()',
        cases: [{ label: "tres comandos", globals: () => ({}) }],
        check: ([o]) => {
          const p = o.values.__probe;
          const err = probeErr(o);
          if (o.error) return no(`Error: ${o.error.message}`);
          if (p === "__nofn") return no("No encuentro la función crearPrompt.");
          if (p === "__nofnret") return no("crearPrompt tiene que devolver una función: return (comando) => ...");
          if (err) return no(`La función dio un error: ${err}`);
          const want = ["sam> ls", "benny> make", "sam> who"];
          if (!same(p, want)) return no(`Los prompts salieron ${show(p)} y debían ser ${show(want)}. Ojo al espacio después del >.`);
          return ok("Cada prompt recuerda a su usuario.");
        },
        hints: [
          "crearPrompt no devuelve un texto: devuelve una función que, cuando la llames con un comando, arma el texto.",
          "Dentro de crearPrompt: return (comando) => ...  y esa flecha usa usuario y comando en una plantilla.",
          "function crearPrompt(usuario) {\n  return (comando) => `${usuario}> ${comando}`;\n}",
        ],
        debrief: "La función de dentro se lleva el usuario en el bolsillo. Eso es una closure. Ya está. Siguiente.",
      }),
      ex({
        id: "t7b",
        act: 5,
        title: "El marcador del arcade",
        concept: "Closure con estado",
        lesson: {
          title: "Una variable que sobrevive",
          body: "Si la función de dentro cambia una variable de la de fuera, ese cambio se conserva entre llamadas. Cada vez que fabricas una función nueva, tiene su propia variable.",
          example: "function crearPasos() {\n  let n = 0;\n  return () => {\n    n++;\n    return n;\n  };\n}\nconst paso = crearPasos();\nconsole.log(paso()); // 1\nconsole.log(paso()); // 2",
        },
        task: "Escribe la función `crearMarcador(inicio)` que devuelva otra función. Cada vez que se llama, suma 1 a una cuenta que empieza en `inicio` y devuelve la cuenta.",
        probe: 'typeof crearMarcador !== "function" ? "__nofn" : (() => { const a = crearMarcador(10); const b = crearMarcador(0); if (typeof a !== "function") return "__nofnret"; return [a(), a(), b(), a(), b()]; })()',
        cases: [{ label: "dos marcadores", globals: () => ({}) }],
        check: ([o]) => {
          const p = o.values.__probe;
          const err = probeErr(o);
          if (o.error) return no(`Error: ${o.error.message}`);
          if (p === "__nofn") return no("No encuentro la función crearMarcador.");
          if (p === "__nofnret") return no("crearMarcador tiene que devolver una función.");
          if (err) return no(`Dio un error: ${err}`);
          if (same(p, [11, 11, 1, 11, 1])) return no("Siempre devuelve lo mismo: la cuenta tiene que vivir fuera de la función devuelta, en crearMarcador.");
          if (same(p, [11, 12, 13, 14, 15])) return no("Los dos marcadores comparten la cuenta: créala dentro de crearMarcador, no fuera.");
          if (!same(p, [11, 12, 1, 13, 2])) return no(`Dio ${show(p)} y debía dar [11,12,1,13,2].`);
          return ok("Cada máquina recreativa lleva su propio marcador.");
        },
        hints: [
          "La cuenta tiene que vivir dentro de crearMarcador, fuera de la función que devuelves. Así cada marcador tiene la suya.",
          "Dentro de crearMarcador: let cuenta = inicio;  y devuelve una flecha que haga cuenta++ y return cuenta;",
          "function crearMarcador(inicio) {\n  let cuenta = inicio;\n  return () => {\n    cuenta++;\n    return cuenta;\n  };\n}",
        ],
        debrief: "Dos marcadores, dos cuentas. Ninguno le roba puntos al otro. Como debe ser.",
      }),
      ex({
        id: "t7c",
        act: 5,
        title: "El monedero de fichas",
        concept: "Objeto con closure",
        lesson: {
          title: "Datos privados",
          body: "Una función puede devolver un objeto con métodos que comparten una variable escondida. Desde fuera solo se usa lo que los métodos permiten.",
          example: "function crearCaja() {\n  let cosas = 0;\n  return {\n    meter() { cosas++; },\n    cuantas() { return cosas; },\n  };\n}",
        },
        task: "Escribe la función `crearMonedero()` que devuelva un objeto con dos métodos: `meter(fichas)`, que suma las fichas al saldo, y `total()`, que devuelve el saldo. El saldo empieza en 0 y no se ve desde fuera.",
        probe: 'typeof crearMonedero !== "function" ? "__nofn" : (() => { const h = crearMonedero(); const g = crearMonedero(); if (!h || typeof h.meter !== "function" || typeof h.total !== "function") return "__nometh"; h.meter(5); h.meter(2.5); g.meter(1); return [h.total(), g.total(), Object.keys(h).sort()]; })()',
        cases: [{ label: "dos monederos", globals: () => ({}) }],
        check: ([o]) => {
          const p = o.values.__probe as unknown[];
          const err = probeErr(o);
          if (o.error) return no(`Error: ${o.error.message}`);
          if (p === ("__nofn" as unknown)) return no("No encuentro la función crearMonedero.");
          if (p === ("__nometh" as unknown)) return no("crearMonedero tiene que devolver un objeto con los métodos meter y total.");
          if (err) return no(`Dio un error: ${err}`);
          if (p[0] === 8.5 && p[1] === 8.5) return no("Los dos monederos comparten el saldo: la variable va dentro de crearMonedero.");
          if (p[0] !== 7.5 || p[1] !== 1) return no(`Los monederos tienen ${show(p[0])} y ${show(p[1])}; debían tener 7.5 y 1.`);
          if (!same(p[2], ["meter", "total"])) return no(`El objeto tiene ${show(p[2])}. El saldo debe ser una variable escondida, no un dato del objeto.`);
          return ok("Nadie toca el saldo sin pasar por la ranura.");
        },
        hints: [
          "El saldo es una variable dentro de crearMonedero; el objeto que devuelves solo tiene los dos métodos, que la usan.",
          "Dentro de crearMonedero: let saldo = 0; y return { meter(fichas) { ... }, total() { ... } };",
          "function crearMonedero() {\n  let saldo = 0;\n  return {\n    meter(fichas) {\n      saldo += fichas;\n    },\n    total() {\n      return saldo;\n    },\n  };\n}",
        ],
        debrief: "Así se protege lo que importa. Las contraseñas, igual. Y mis fichas del Pac-Man.",
      }),
    ],
    farewell: [
      { who: "benny", text: "Ya está. Lo siguiente son las clases: moldes para fabricar objetos. Otro día. O nunca." },
      { who: "benny", text: "No, en serio. Vuelve. Pero trae pizza.", mood: "alegre" },
    ],
    back: [{ who: "kessler", text: "Hueles a pizza fría. ¿Has aprendido algo? Bien. Clases." }],
  },
  {
    id: "t8",
    mentor: "benny",
    before: "m26",
    title: "La sala de máquinas",
    sendoff: [
      { who: "ruth", text: "Lo último que te queda es el tiempo: esperar respuestas. Antes, una sesión más con Benny." },
      { who: "ruth", text: "Dice que no tiene tiempo. Tiene todo el tiempo del mundo. Ve." },
    ],
    welcome: [
      { who: "benny", text: "Otra vez tú. Vale. Clases: moldes para fabricar objetos iguales. Así hago los enemigos de mis juegos." },
    ],
    exercises: [
      ex({
        id: "t8a",
        act: 6,
        title: "El molde",
        concept: "Clases",
        lesson: {
          title: "class y constructor",
          body: "`class Nombre { constructor(a, b) { this.a = a; } }` define un molde. `new Nombre(...)` fabrica un objeto con esos datos. `this` es el objeto que se está fabricando.",
          example: 'class Gato {\n  constructor(nombre) {\n    this.nombre = nombre;\n  }\n}\nconst g = new Gato("Byte");\nconsole.log(g.nombre); // Byte',
        },
        task: "Escribe la clase `Ordenador` con un `constructor(nombre, memoria)` que guarde los dos datos en `this`.",
        probe: 'typeof Ordenador !== "function" ? "__nocls" : (() => { const a = new Ordenador("VAX", 8); const b = new Ordenador("C64", 64); return [a.nombre, a.memoria, b.nombre, b.memoria]; })()',
        cases: [{ label: "dos máquinas", globals: () => ({}) }],
        check: ([o]) => {
          const p = o.values.__probe;
          const err = probeErr(o);
          if (o.error) return no(`Error: ${o.error.message}`);
          if (p === "__nocls") return no("No encuentro la clase Ordenador.");
          if (err) return no(`Dio un error: ${err}`);
          if (same(p, [undefined, undefined, undefined, undefined])) return no("Los objetos salen vacíos: guarda los datos con this.nombre = nombre;");
          if (!same(p, ["VAX", 8, "C64", 64])) return no(`Salió ${show(p)} y debía ser ["VAX",8,"C64",64].`);
          return ok("Un molde, tantas máquinas como quieras.");
        },
        hints: [
          "La clase tiene un constructor que recibe nombre y memoria, y los guarda en el objeto nuevo con this.",
          "class Ordenador { constructor(nombre, memoria) { ... } }  y dentro: this.nombre = nombre; this.memoria = memoria;",
          "class Ordenador {\n  constructor(nombre, memoria) {\n    this.nombre = nombre;\n    this.memoria = memoria;\n  }\n}",
        ],
        debrief: "this es el objeto que se está fabricando. Cada uno tiene el suyo. Fácil. Siguiente.",
      }),
      ex({
        id: "t8b",
        act: 6,
        title: "Encender",
        concept: "Métodos",
        lesson: {
          title: "Métodos con this",
          body: "Un método se escribe dentro de la clase, después del constructor. Con `this` lee y cambia los datos del propio objeto.",
          example: "class Contador {\n  constructor() {\n    this.n = 0;\n  }\n  sumar() {\n    this.n++;\n  }\n}",
        },
        task: "Escribe la clase `Terminal`: su `constructor()` pone `this.encendida = false`, el método `encender()` la pone en `true` y el método `estado()` devuelve \"encendida\" o \"apagada\".",
        probe: 'typeof Terminal !== "function" ? "__nocls" : (() => { const a = new Terminal(); const b = new Terminal(); if (typeof a.encender !== "function" || typeof a.estado !== "function") return "__nometh"; const antes = a.estado(); a.encender(); return [antes, a.estado(), b.estado()]; })()',
        cases: [{ label: "dos terminales", globals: () => ({}) }],
        check: ([o]) => {
          const p = o.values.__probe;
          const err = probeErr(o);
          if (o.error) return no(`Error: ${o.error.message}`);
          if (p === "__nocls") return no("No encuentro la clase Terminal.");
          if (p === "__nometh") return no("Faltan los métodos encender() o estado() dentro de la clase.");
          if (err) return no(`Dio un error: ${err}`);
          if (same(p, ["apagada", "encendida", "encendida"])) return no("Al encender una se encendieron las dos: usa this.encendida, no una variable de fuera.");
          if (!same(p, ["apagada", "encendida", "apagada"])) return no(`Salió ${show(p)} y debía ser ["apagada","encendida","apagada"].`);
          return ok("Cada terminal se enciende por su cuenta.");
        },
        hints: [
          "Cada terminal guarda si está encendida en this.encendida. Los métodos solo leen o cambian ese dato.",
          'encender() solo cambia el dato: this.encendida = true;. Y estado() pregunta con un if: si this.encendida es true, devuelve "encendida"; si no, "apagada".',
          'class Terminal {\n  constructor() {\n    this.encendida = false;\n  }\n  encender() {\n    this.encendida = true;\n  }\n  estado() {\n    if (this.encendida) {\n      return "encendida";\n    }\n    return "apagada";\n  }\n}',
        ],
        debrief: "La mía lleva encendida desde el martes. Compilando. No preguntes.",
      }),
      ex({
        id: "t8c",
        act: 6,
        title: "Una familia de máquinas",
        concept: "extends y super",
        lesson: {
          title: "Heredar",
          body: "`class Hija extends Madre` hereda todo lo de la madre. En su constructor hay que llamar primero a `super(...)` con los datos que necesita la madre; después ya puedes usar `this`.",
          example: 'class Animal {\n  constructor(nombre) { this.nombre = nombre; }\n}\nclass Gato extends Animal {\n  constructor(nombre) {\n    super(nombre);\n    this.patas = 4;\n  }\n}\nconsole.log(new Gato("Byte").patas); // 4',
        },
        task: "Ya existe la clase `Ordenador(nombre, memoria)`. Escribe la clase `Portatil` que extienda `Ordenador`: su `constructor(dueno)` llama a `super(\"Osborne\", 64)` y guarda `this.dueno`, y su método `ficha()` devuelve el nombre, la palabra de y el dueño. Por ejemplo: \"Osborne de Sam\".",
        starter: "class Ordenador {\n  constructor(nombre, memoria) {\n    this.nombre = nombre;\n    this.memoria = memoria;\n  }\n}\n\n// Escribe Portatil debajo\n",
        probe: 'typeof Portatil !== "function" ? "__nocls" : (() => { const v = new Portatil("Sam"); if (typeof v.ficha !== "function") return "__nometh"; return [v.nombre, v.memoria, v.dueno, v.ficha(), v instanceof Ordenador]; })()',
        cases: [{ label: "el portátil de Sam", globals: () => ({}) }],
        check: ([o]) => {
          const p = o.values.__probe;
          const err = probeErr(o);
          if (o.error) return no(`Error: ${o.error.message}`);
          if (p === "__nocls") return no("No encuentro la clase Portatil.");
          if (p === "__nometh") return no("Falta el método ficha() en Portatil.");
          if (err) return no(/super/.test(err) || /this/.test(err) ? "En el constructor de Portatil hay que llamar a super(\"Osborne\", 64) antes de usar this." : `Dio un error: ${err}`);
          if (!same(p, ["Osborne", 64, "Sam", "Osborne de Sam", true])) return no(`Salió ${show(p)} y debía ser ["Osborne",64,"Sam","Osborne de Sam",true]. ¿Usaste extends Ordenador?`);
          return ok("Un portátil es un ordenador, con lo suyo propio.");
        },
        hints: [
          "Portatil hereda de Ordenador: la cabecera es class Portatil extends Ordenador. Lo primero del constructor es super(...).",
          'Dentro del constructor: super("Osborne", 64); this.dueno = dueno;  y ficha() devuelve una plantilla con this.nombre y this.dueno.',
          'class Ordenador {\n  constructor(nombre, memoria) {\n    this.nombre = nombre;\n    this.memoria = memoria;\n  }\n}\n\nclass Portatil extends Ordenador {\n  constructor(dueno) {\n    super("Osborne", 64);\n    this.dueno = dueno;\n  }\n  ficha() {\n    return `${this.nombre} de ${this.dueno}`;\n  }\n}',
        ],
        debrief: "Ya sabes lo que yo sabía en primero de doctorado. Bueno, casi. Lo de esperar te lo enseña Ruth.",
      }),
    ],
    farewell: [
      { who: "benny", text: "Ya no te hace falta venir. Pero si traes pizza, la puerta está abierta. Literalmente: se rompió el pestillo.", mood: "alegre" },
    ],
    back: [{ who: "ruth", text: "¿Benny te dio las gracias? Lo apunto como un milagro." }],
  },
];

// el comentario tras cada ejercicio lo dice el mentor de su sesión
for (const t of TRAINING) for (const e of t.exercises) for (const l of e.debrief) if (l.who === "margarita") l.who = t.mentor;

export const TRAINING_EXERCISES: Mission[] = TRAINING.flatMap((t) => t.exercises);

export const trainingBefore = (missionId: string | undefined) => TRAINING.find((t) => t.before === missionId);
export const trainingById = (id: string) => TRAINING.find((t) => t.id === id);

/** La sesión (y con ella el mentor) a la que pertenece un ejercicio. */
export const setOfExercise = (id: string) => TRAINING.find((t) => t.exercises.some((e) => e.id === id));
