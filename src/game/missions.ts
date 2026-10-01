// Acto 1 — "El descuadre". Cada misión enseña una palabra del lenguaje justo
// cuando la historia la necesita. Los nombres son ficticios.

import type { RunOutput } from "./sandbox";

export type Speaker = "ruth" | "sam" | "kessler" | "narrador" | "sistema";

export interface Line {
  who: Speaker;
  text: string;
}

export interface TestCase {
  label: string;
  globals: () => Record<string, unknown>;
}

export interface CheckResult {
  pass: boolean;
  feedback: string;
}

export interface Mission {
  id: string;
  title: string;
  concept: string;
  phase: "dia" | "noche";
  briefing: Line[];
  lesson: { title: string; body: string; example: string };
  task: string;
  starter: string;
  borrowed: string[];
  cases: TestCase[];
  capture: string[];
  check: (outs: RunOutput[], cases: TestCase[]) => CheckResult;
  hints: string[];
  debrief: Line[];
  clue: { title: string; text: string };
}

const near = (a: unknown, b: number) => typeof a === "number" && Math.abs(a - b) < 1e-9;
const logged = (o: RunOutput, s: string) => o.logs.some((l) => l.trim() === s);

// Patrones de conexión fijos (no aleatorios) para que la validación sea reproducible.
const NOCHES_A = [2, 3, 7, 9, 10, 14, 15, 16, 21, 23, 28, 29];
const NOCHES_B = [1, 5, 6, 12, 19, 22, 30];

export const MISSIONS: Mission[] = [
  {
    id: "m1",
    title: "La factura",
    concept: "Variables",
    phase: "dia",
    briefing: [
      { who: "ruth", text: "Primer día de Sam en sistemas. Bienvenido al sótano, astrónomo." },
      { who: "ruth", text: "El laboratorio cobra cada segundo de computadora a quien la usa. Este mes facturamos 2387.50 dólares." },
      { who: "ruth", text: "Anótalo en la terminal. La máquina olvida todo lo que no guardas en una variable." },
    ],
    lesson: {
      title: "Variables: etiquetas para recordar",
      body: "Una variable es un nombre que apunta a un valor. Se crea con let. Para ver un valor en la pantalla usa console.log(...). Los decimales se escriben con punto.",
      example: "let cafes = 3;\nconsole.log(cafes); // 3",
    },
    task: "Crea una variable llamada facturado con el valor 2387.50 y muéstrala con console.log.",
    starter: "// Escribe tu código debajo de esta línea\n",
    borrowed: [],
    cases: [{ label: "factura de agosto", globals: () => ({}) }],
    capture: ["facturado"],
    check: ([o]) => {
      if (o.values.facturado === undefined)
        return { pass: false, feedback: "No encuentro ninguna variable llamada facturado. Créala con let facturado = ..." };
      if (!near(o.values.facturado, 2387.5))
        return { pass: false, feedback: `facturado vale ${String(o.values.facturado)}, pero la factura dice 2387.50.` };
      if (!logged(o, "2387.5"))
        return { pass: false, feedback: "La variable está bien. Falta mostrarla: console.log(facturado)." };
      return { pass: true, feedback: "Anotado. La máquina ya lo recuerda." };
    },
    hints: [
      "Empieza escribiendo: let facturado =",
      "El valor es un número, sin comillas y con punto decimal: 2387.50",
      "let facturado = 2387.50;\nconsole.log(facturado);",
    ],
    debrief: [{ who: "ruth", text: "Bien. Ahora lo que pagaron los usuarios. Eso nunca falla." }],
    clue: { title: "Factura de agosto", text: "Facturado: $2387.50" },
  },
  {
    id: "m2",
    title: "El descuadre",
    concept: "Operaciones",
    phase: "dia",
    briefing: [
      { who: "ruth", text: "Los usuarios pagaron 2386.75. Te dejé los dos números cargados en la terminal: facturado y pagado." },
      { who: "ruth", text: "Réstalos. Debería dar cero. Siempre da cero." },
    ],
    lesson: {
      title: "Operaciones: la máquina calcula por ti",
      body: "Con variables se puede operar: + suma, - resta, * multiplica, / divide. El resultado puede guardarse en otra variable.",
      example: "let ingresos = 10;\nlet gastos = 4;\nlet queda = ingresos - gastos;\nconsole.log(queda); // 6",
    },
    task: "Crea la variable diferencia con facturado menos pagado, y muéstrala con console.log.",
    starter: "// facturado y pagado ya existen: úsalos\n",
    borrowed: ["facturado = 2387.5", "pagado = 2386.75"],
    cases: [{ label: "cuentas de agosto", globals: () => ({ facturado: 2387.5, pagado: 2386.75 }) }],
    capture: ["diferencia"],
    check: ([o]) => {
      if (o.values.diferencia === undefined)
        return { pass: false, feedback: "Falta la variable diferencia." };
      if (near(o.values.diferencia, -0.75))
        return { pass: false, feedback: "Te dio -0.75: restaste al revés. Es facturado - pagado." };
      if (!near(o.values.diferencia, 0.75))
        return { pass: false, feedback: `diferencia vale ${String(o.values.diferencia)}. Usa las variables, no escribas números a mano.` };
      if (!o.logs.some((l) => l.includes("0.75")))
        return { pass: false, feedback: "El cálculo está bien. Falta mostrarlo con console.log(diferencia)." };
      return { pass: true, feedback: "0.75. No es cero." };
    },
    hints: [
      "La resta usa el signo -. El orden importa.",
      "let diferencia = facturado - pagado;",
      "let diferencia = facturado - pagado;\nconsole.log(diferencia);",
    ],
    debrief: [
      { who: "sam", text: "Setenta y cinco centavos. Nueve segundos de computadora que nadie pagó." },
      { who: "ruth", text: "Un redondeo. Olvídalo." },
      { who: "sam", text: "Los astrónomos no olvidamos nueve segundos. Así se encuentran planetas." },
    ],
    clue: { title: "El descuadre", text: "$0.75 sin pagar. 9 segundos de CPU." },
  },
  {
    id: "m3",
    title: "Una cuenta sin dueño",
    concept: "Textos",
    phase: "dia",
    briefing: [
      { who: "narrador", text: "Los nueve segundos se cobraron a una cuenta. La terminal te la deja en la variable cuenta." },
      { who: "ruth", text: "Si vas a seguir con esto, escribe un informe. Kessler solo lee informes." },
    ],
    lesson: {
      title: "Textos y plantillas",
      body: "Los textos van entre comillas. Con comillas invertidas (`) puedes meter variables dentro usando ${...}. A esto se le llama plantilla.",
      example: "let nombre = \"Ruth\";\nlet saludo = `Hola, ${nombre}`;\nconsole.log(saludo); // Hola, Ruth",
    },
    task: "Crea la variable informe con el texto: Cuenta sin dueño: seguido de la cuenta (usa una plantilla). Muéstrala.",
    starter: "// cuenta ya existe\n",
    borrowed: ["cuenta = \"hunter\""],
    cases: [
      { label: "cuenta real", globals: () => ({ cuenta: "hunter" }) },
      { label: "otra cuenta de prueba", globals: () => ({ cuenta: "sventek" }) },
    ],
    capture: ["informe"],
    check: (outs, cases) => {
      for (let i = 0; i < outs.length; i++) {
        const o = outs[i];
        const cuenta = cases[i].globals().cuenta as string;
        const esperado = `Cuenta sin dueño: ${cuenta}`;
        if (o.values.informe === undefined) return { pass: false, feedback: "Falta la variable informe." };
        if (o.values.informe !== esperado) {
          if (i > 0 && o.values.informe === "Cuenta sin dueño: hunter")
            return { pass: false, feedback: `Escribiste "hunter" a mano. Cuando la cuenta fue "${cuenta}", tu informe no cambió. Usa \${cuenta}.` };
          return { pass: false, feedback: `Tu informe dice "${String(o.values.informe)}". Debía decir "${esperado}". Fíjate en los espacios y los dos puntos.` };
        }
        if (!logged(o, esperado)) return { pass: false, feedback: "El informe está bien. Falta mostrarlo con console.log(informe)." };
      }
      return { pass: true, feedback: "Informe listo. Funciona con cualquier cuenta." };
    },
    hints: [
      "Las plantillas usan comillas invertidas: ` (al lado del 0 o del Enter según tu teclado).",
      "Dentro de la plantilla, la variable va así: ${cuenta}",
      "let informe = `Cuenta sin dueño: ${cuenta}`;\nconsole.log(informe);",
    ],
    debrief: [
      { who: "kessler", text: "¿hunter? No tenemos a nadie llamado hunter. Ciérrala." },
      { who: "sam", text: "Si la cierro, se va. Si la vigilo, quizá vuelva." },
      { who: "kessler", text: "Tienes una semana." },
    ],
    clue: { title: "La cuenta", text: "\"hunter\" — nadie en el laboratorio la reconoce." },
  },
  {
    id: "m4",
    title: "Turno de madrugada",
    concept: "Decisiones",
    phase: "dia",
    briefing: [
      { who: "ruth", text: "hunter siempre entra de madrugada. Haz que la terminal avise sola." },
      { who: "ruth", text: "Antes de las 6 de la mañana: ALERTA. Después: normal. La hora te llega en la variable hora." },
    ],
    lesson: {
      title: "Decisiones: if y else",
      body: "if ejecuta un bloque solo si la condición es verdadera; else, si es falsa. Para comparar: < menor, > mayor, <= menor o igual, === igual.",
      example: "if (cafes < 2) {\n  console.log(\"falta cafe\");\n} else {\n  console.log(\"suficiente\");\n}",
    },
    task: "Si hora es menor que 6, muestra ALERTA. Si no, muestra normal. Lo probaremos con varias horas.",
    starter: "// hora ya existe (de 0 a 23)\n",
    borrowed: ["hora = 3, 14, 0, 6 ..."],
    cases: [3, 14, 0, 6, 23, 5].map((h) => ({ label: `hora = ${h}`, globals: () => ({ hora: h }) })),
    capture: [],
    check: (outs, cases) => {
      for (let i = 0; i < outs.length; i++) {
        const h = cases[i].globals().hora as number;
        const want = h < 6 ? "ALERTA" : "normal";
        const got = outs[i].logs.map((l) => l.trim());
        if (got.length === 0) return { pass: false, feedback: `Con hora = ${h} no se mostró nada.` };
        if (got.length > 1) return { pass: false, feedback: `Con hora = ${h} se mostraron ${got.length} mensajes. Debe salir solo uno.` };
        if (got[0] !== want)
          return {
            pass: false,
            feedback:
              h === 6
                ? `Con hora = 6 mostraste "${got[0]}". A las 6 en punto ya es normal: usa < y no <=.`
                : `Con hora = ${h} mostraste "${got[0]}"; debía ser "${want}".`,
          };
      }
      return { pass: true, feedback: "Seis horas probadas, seis respuestas correctas." };
    },
    hints: [
      "La condición es: hora < 6",
      "if (hora < 6) { ... } else { ... }",
      "if (hora < 6) {\n  console.log(\"ALERTA\");\n} else {\n  console.log(\"normal\");\n}",
    ],
    debrief: [
      { who: "ruth", text: "Vete a casa, Sam. Si suena, suena." },
      { who: "narrador", text: "Esa noche no dormiste. A las 2:47 volviste al laboratorio en bicicleta." },
    ],
    clue: { title: "Horario", text: "hunter solo entra antes de las 6 a. m." },
  },
  {
    id: "m5",
    title: "Noches en vela",
    concept: "Bucles",
    phase: "noche",
    briefing: [
      { who: "narrador", text: "El laboratorio de noche. Solo el zumbido de las terminales." },
      { who: "sam", text: "La impresora guarda un registro de cada día del mes. huboConexion(dia) me dice si hunter entró ese día." },
      { who: "sam", text: "Treinta días. No voy a preguntar treinta veces a mano." },
    ],
    lesson: {
      title: "Bucles: repetir sin copiar",
      body: "for repite un bloque mientras se cumpla una condición. Tiene tres partes: dónde empieza, hasta cuándo sigue y cómo avanza. Con ++ sumas uno a una variable.",
      example: "let total = 0;\nfor (let i = 1; i <= 3; i++) {\n  total++;\n}\nconsole.log(total); // 3",
    },
    task: "Recorre los días del 1 al 30. Cuenta en la variable noches cuántos días huboConexion(dia) es true. Muestra noches.",
    starter: "let noches = 0;\n// recorre los días aquí\n\nconsole.log(noches);\n",
    borrowed: ["huboConexion(dia) → true o false", "dias = 30"],
    cases: [
      { label: "registro de agosto", globals: () => ({ dias: 30, huboConexion: (d: number) => NOCHES_A.includes(d) }) },
      { label: "registro de septiembre", globals: () => ({ dias: 30, huboConexion: (d: number) => NOCHES_B.includes(d) }) },
    ],
    capture: ["noches"],
    check: (outs) => {
      const expected = [NOCHES_A.length, NOCHES_B.length];
      for (let i = 0; i < outs.length; i++) {
        const o = outs[i];
        const n = o.values.noches;
        const asked = o.calls.huboConexion ?? 0;
        if (n === undefined) return { pass: false, feedback: "Falta la variable noches." };
        if (asked < 30) return { pass: false, feedback: `Solo preguntaste ${asked} días. Hay que revisar los 30.` };
        if (asked > 30)
          return { pass: false, feedback: `Revisaste ${asked} días. Empieza en 1 y termina en 30 incluido (<= 30).` };
        if (n !== expected[i]) {
          if (n === expected[0] && i === 1)
            return { pass: false, feedback: "Escribiste el número a mano: con otro registro tu respuesta no cambió." };
          return { pass: false, feedback: `Contaste ${String(n)} noches y eran ${expected[i]}. Suma uno solo cuando huboConexion(dia) sea true.` };
        }
        if (!logged(o, String(expected[i]))) return { pass: false, feedback: "La cuenta está bien. Falta console.log(noches)." };
      }
      return { pass: true, feedback: "Doce noches en agosto. Siempre de madrugada." };
    },
    hints: [
      "for (let dia = 1; dia <= 30; dia++) { ... }",
      "Dentro del bucle: if (huboConexion(dia)) { noches++; }",
      "let noches = 0;\nfor (let dia = 1; dia <= 30; dia++) {\n  if (huboConexion(dia)) {\n    noches++;\n  }\n}\nconsole.log(noches);",
    ],
    debrief: [
      { who: "sistema", text: "02:51 — CONEXION ENTRANTE — cuenta: hunter" },
      { who: "sam", text: "Está aquí. Ahora mismo." },
    ],
    clue: { title: "Doce noches", text: "12 conexiones en agosto, todas de madrugada." },
  },
];

export const ACT_TITLE = "Acto 1 — El descuadre";
