// Misiones secundarias: antes de algunos encargos, Ruth o Kessler mandan a Sam a
// practicar con Margarita, que le enseñó a programar a Ruth en 1971. Cada sesión
// son tres ejercicios cortos en la terminal de su casa, solo con lo ya aprendido.
import type { Line, Mission, TestCase } from "./types";
import type { RunOutput } from "./sandbox";
import { printed, probeErr, same, show } from "./acts/util";

export interface TrainingSet {
  id: string;
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
        task: "Margarita compró pan. Crea la variable total con precio por cantidad y muéstrala con console.log.",
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
        task: "El termómetro de Margarita marca grados Fahrenheit. Crea celsius con (fahrenheit - 32) * 5 / 9 y muéstralo.",
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
        task: "En la hucha hay ahorros. Margarita mete 20 y luego saca 7.50. Cambia ahorros con esas dos operaciones (sin crear otra variable) y muéstralo.",
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
        task: "Crea tarjeta con el texto Feliz cumpleaños, NOMBRE. Ya tienes EDAD años. (con los valores de nombre y edad) y muéstrala.",
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
        task: "Si lluvia es mayor que 50 (por ciento), muestra paraguas. Si no, muestra sombrero.",
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
        task: "Margarita practica escalas: el día 1 toca 1 escala, el día 2 toca 2... Suma cuántas escalas toca en total en dias días y muéstralo.",
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
        task: "Muestra la primera nota de la lista notas y después la última.",
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
          body: "Recorre la lista con for y usa push para añadir al final de otra lista solo lo que cumple una condición.",
          example: "let pares = [];\nfor (let i = 0; i < nums.length; i++) {\n  if (nums[i] % 2 === 0) pares.push(nums[i]);\n}",
        },
        task: "Crea la lista aprobadas con las notas mayores o iguales a 6, en el mismo orden, y muéstrala.",
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
            if (same(o.values.aprobadas, (g.notas as number[]).filter((x) => x > 6))) return "Faltan los seises: la condición es mayor o igual, >=.";
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
        task: "Guarda en mejor la nota más alta de notas y muéstrala.",
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
            if (o.values.mejor !== want) return `Con ${show(g.notas)} mejor quedó ${show(o.values.mejor)} y debía ser ${want}.${g.notas && (g.notas as number[])[0] === 2 ? " Si empiezas con mejor = 0 funciona aquí, pero empieza mejor con notas[0]." : ""}`;
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
        task: "Escribe la función doble(n) que devuelva n multiplicado por 2.",
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
        task: "Escribe etiqueta(fruta, anio) que devuelva el texto Mermelada de FRUTA (ANIO). Por ejemplo: Mermelada de higo (1986).",
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
          example: "function contar(lista) {\n  let n = 0;\n  for (let i = 0; i < lista.length; i++) n++;\n  return n;\n}",
        },
        task: "Escribe gastoTotal(precios) que sume todos los precios de la lista y devuelva el total.",
        probe: 'typeof gastoTotal !== "function" ? "__nofn" : [gastoTotal([2, 3.5, 4]), gastoTotal([]), gastoTotal([10])]',
        cases: [{ label: "tres compras", globals: () => ({}) }],
        check: ([o]) => {
          const p = o.values.__probe as unknown[];
          const err = probeErr(o);
          if (o.error) return no(`Error: ${o.error.message}`);
          if (p === ("__nofn" as unknown)) return no("No encuentro la función gastoTotal.");
          if (err) return no(`La función dio un error: ${err}`);
          if (Array.isArray(p) && p[1] === undefined) return no("Con una lista vacía devolvió undefined. ¿El return está fuera del bucle?");
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
];

export const TRAINING_EXERCISES: Mission[] = TRAINING.flatMap((t) => t.exercises);

export const trainingBefore = (missionId: string | undefined) => TRAINING.find((t) => t.before === missionId);
export const trainingById = (id: string) => TRAINING.find((t) => t.id === id);
