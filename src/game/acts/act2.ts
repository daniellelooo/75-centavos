// Acto 2 — "La trampa" (septiembre de 1986): arrays, recorrerlos y funciones.
// Inspirado en el anzuelo real de archivos falsos que retuvo al intruso en línea.
import type { Mission } from "../types";
import { printed, probeErr, same, show } from "./util";

const HORAS_A = [3, 14, 2, 23, 4, 5, 11, 1];
const HORAS_B = [9, 0, 5, 17, 6, 2];
const soloMadrugada = (h: number[]) => h.filter((x) => x < 6);

const TEMAS_A = ["misiles", "satelites", "presupuesto"];
const TEMAS_B = ["radares", "contratos"];

export const ACT2: Mission[] = [
  {
    id: "m6",
    act: 2,
    title: "Tres nombres",
    concept: "Arrays",
    phase: "dia",
    giver: "ruth",
    clock: "10:40",
    briefing: [
      { who: "ruth", text: "Malas noticias. hunter no viene solo: anoche entraron otras dos cuentas que nadie usa.", mood: "serio" },
      { who: "ruth", text: "quasar y nadir. Las tres a la misma hora, desde la misma línea." },
      { who: "ruth", text: "Apúntalas juntas. Una variable para cada una no escala, Sam." },
    ],
    lesson: {
      title: "Arrays: una lista en una sola variable",
      body: "Un array guarda varios valores en orden, entre corchetes y separados por comas. Cada elemento tiene una posición que empieza en 0. Con .length sabes cuántos hay.",
      example: 'let planetas = ["Mercurio", "Venus", "Tierra"];\nconsole.log(planetas[0]);     // Mercurio\nconsole.log(planetas.length); // 3',
    },
    task: 'Crea el array sospechosas con "hunter", "quasar" y "nadir", en ese orden. Muestra cuántas son con console.log(sospechosas.length).',
    starter: "// Escribe tu código debajo\n",
    borrowed: [],
    cases: [{ label: "las tres cuentas", globals: () => ({}) }],
    capture: ["sospechosas"],
    check: ([o]) => {
      const v = o.values.sospechosas;
      if (v === undefined) return { pass: false, feedback: "No encuentro el array sospechosas." };
      if (!Array.isArray(v)) return { pass: false, feedback: `sospechosas no es un array: vale ${show(v)}. Usa corchetes [ ].` };
      if (v.length !== 3) return { pass: false, feedback: `Tu array tiene ${v.length} elementos y deberían ser 3.` };
      if (!same(v, ["hunter", "quasar", "nadir"])) {
        if (same([...v].sort(), ["hunter", "nadir", "quasar"])) return { pass: false, feedback: "Están las tres, pero el orden importa: hunter, quasar, nadir." };
        return { pass: false, feedback: `Tu array es ${show(v)}. Revisa que cada nombre vaya entre comillas y bien escrito.` };
      }
      if (!printed(o, "3")) return { pass: false, feedback: "El array está bien. Falta console.log(sospechosas.length)." };
      return { pass: true, feedback: "Tres cuentas, una sola lista." };
    },
    hints: [
      'Los arrays van entre corchetes: ["a", "b"]',
      'let sospechosas = ["hunter", "quasar", "nadir"];',
      'let sospechosas = ["hunter", "quasar", "nadir"];\nconsole.log(sospechosas.length);',
    ],
    debrief: [
      { who: "ruth", text: "Tres nombres para una sola persona, apuesto." },
      { who: "sam", text: "O tres personas con una sola costumbre: no dormir." },
    ],
    clue: { title: "Tres cuentas", text: "hunter, quasar y nadir: misma hora, misma línea." },
  },
  {
    id: "m7",
    act: 2,
    title: "Solo de madrugada",
    concept: "Recorrer arrays",
    phase: "dia",
    giver: "ruth",
    clock: "11:05",
    briefing: [
      { who: "ruth", text: "Te pasé las horas de todas las conexiones de anoche en la variable horas." },
      { who: "ruth", text: "Hay de todo: becarios, gente de día... Quédate solo con las de madrugada, antes de las 6." },
    ],
    lesson: {
      title: "Recorrer un array y llenar otro",
      body: "Con un for puedes visitar cada posición: i va de 0 hasta lista.length - 1, y lista[i] es el elemento. Con .push(valor) añades un elemento al final de otro array.",
      example: "let notas = [7, 3, 9];\nlet altas = [];\nfor (let i = 0; i < notas.length; i++) {\n  if (notas[i] > 5) {\n    altas.push(notas[i]);\n  }\n}\nconsole.log(altas); // [7, 9]",
    },
    task: "Crea el array vacío madrugada. Recorre horas y guarda con push las que sean menores que 6. Muestra madrugada.",
    starter: "let madrugada = [];\n// recorre horas aquí\n\nconsole.log(madrugada);\n",
    borrowed: ["horas = [3, 14, 2, 23, ...]"],
    cases: [
      { label: "conexiones del lunes", globals: () => ({ horas: [...HORAS_A] }) },
      { label: "conexiones del martes", globals: () => ({ horas: [...HORAS_B] }) },
    ],
    capture: ["madrugada"],
    check: (outs, cases) => {
      for (let i = 0; i < outs.length; i++) {
        const h = cases[i].globals().horas as number[];
        const want = soloMadrugada(h);
        const v = outs[i].values.madrugada;
        if (!Array.isArray(v)) return { pass: false, feedback: "madrugada debe ser un array. Empieza con let madrugada = [];" };
        if (same(v, h)) return { pass: false, feedback: "Guardaste todas las horas. Usa un if para quedarte solo con las menores que 6." };
        if (i === 1 && same(v, soloMadrugada(HORAS_A)))
          return { pass: false, feedback: "Con otras horas tu resultado no cambió: escribiste los números a mano." };
        if (v.length > 0 && v.length === want.length + 1 && v[v.length - 1] === undefined)
          return { pass: false, feedback: "Hay un undefined al final: tu bucle se pasa una posición. Usa i < horas.length." };
        if (!same(v, want)) return { pass: false, feedback: `Con ${cases[i].label} obtuviste ${show(v)} y era ${show(want)}.` };
      }
      return { pass: true, feedback: "Solo la madrugada. Siempre la madrugada." };
    },
    hints: [
      "for (let i = 0; i < horas.length; i++) { ... }",
      "Dentro: if (horas[i] < 6) { madrugada.push(horas[i]); }",
      "let madrugada = [];\nfor (let i = 0; i < horas.length; i++) {\n  if (horas[i] < 6) {\n    madrugada.push(horas[i]);\n  }\n}\nconsole.log(madrugada);",
    ],
    debrief: [
      { who: "sam", text: "Entre la una y las cinco. Como si su día empezara cuando el nuestro acaba." },
      { who: "ruth", text: "O como si viviera en otra zona horaria.", mood: "sorpresa" },
      { who: "sam", text: "..." },
    ],
    clue: { title: "Huso horario", text: "Solo entra entre la 1 y las 5. ¿Su mañana es nuestra noche?" },
  },
  {
    id: "m8",
    act: 2,
    title: "La alarma de bolsillo",
    concept: "Funciones",
    phase: "dia",
    giver: "kessler",
    clock: "14:20",
    briefing: [
      { who: "kessler", text: "Sam. El FBI dice que setenta y cinco centavos no son asunto federal. La policía dice que es asunto del FBI." },
      { who: "kessler", text: "Así que es asunto tuyo. Pero quiero un aviso automático: si entra una de esas cuentas, que el sistema lo sepa." },
      { who: "kessler", text: "Y que no me despierte a mí.", mood: "serio" },
    ],
    lesson: {
      title: "Funciones: una pregunta que puedes repetir",
      body: "Una función agrupa código bajo un nombre. Recibe datos (parámetros) y devuelve un resultado con return. Para unir condiciones, || significa \"o\": basta con que una sea verdadera.",
      example: 'function esFinde(dia) {\n  return dia === "sabado" || dia === "domingo";\n}\nconsole.log(esFinde("sabado")); // true\nconsole.log(esFinde("lunes"));  // false',
    },
    task: 'Escribe la función esSospechosa(cuenta) que devuelva true si la cuenta es "hunter", "quasar" o "nadir", y false en cualquier otro caso.',
    starter: "function esSospechosa(cuenta) {\n  // tu código\n}\n",
    borrowed: [],
    cases: [{ label: "cinco cuentas de prueba", globals: () => ({}) }],
    capture: [],
    probe: 'typeof esSospechosa !== "function" ? "__nofn" : ["hunter", "ruth", "nadir", "kessler", "quasar", "Hunter"].map((c) => esSospechosa(c))',
    check: ([o]) => {
      const p = o.values.__probe;
      const err = probeErr(o);
      if (p === "__nofn") return { pass: false, feedback: "No encuentro la función esSospechosa. Revisa el nombre (mayúsculas incluidas)." };
      if (err) return { pass: false, feedback: `Tu función falló al probarla: ${err}` };
      const got = p as unknown[];
      const want = [true, false, true, false, true, false];
      if (got.every((x) => x === undefined)) return { pass: false, feedback: "Tu función no devuelve nada (undefined). Falta el return." };
      const names = ["hunter", "ruth", "nadir", "kessler", "quasar", "Hunter"];
      for (let i = 0; i < want.length; i++) {
        if (got[i] !== want[i])
          return {
            pass: false,
            feedback:
              i === 5
                ? 'Con "Hunter" (mayúscula) devolviste true. Para JavaScript "Hunter" y "hunter" son textos distintos: compara exactamente con ===.'
                : `esSospechosa("${names[i]}") devolvió ${show(got[i])} y debía devolver ${want[i]}.`,
          };
      }
      return { pass: true, feedback: "Seis cuentas probadas. La alarma no se equivoca." };
    },
    hints: [
      "Dentro de la función: return cuenta === \"hunter\" || ...",
      'Une las tres comparaciones con ||: cuenta === "hunter" || cuenta === "quasar" || cuenta === "nadir"',
      'function esSospechosa(cuenta) {\n  return cuenta === "hunter" || cuenta === "quasar" || cuenta === "nadir";\n}',
    ],
    debrief: [
      { who: "kessler", text: "Bien. Una función. Eso puedo explicárselo al decano.", mood: "alegre" },
      { who: "ruth", text: "Le conecté tu función a un pitido en mi terminal. Si suena de noche, te llamo." },
    ],
    clue: { title: "Sin ayuda", text: "FBI y policía no quieren el caso. Estamos solos." },
  },
  {
    id: "m9",
    act: 2,
    title: "Minutos en línea",
    concept: "Parámetros",
    phase: "dia",
    giver: "ruth",
    clock: "16:30",
    briefing: [
      { who: "ruth", text: "La compañía telefónica puede rastrear la llamada. Pero tarda: necesita que siga conectado un buen rato." },
      { who: "ruth", text: "Necesito saber cuánto dura cada visita. Te doy hora y minuto de entrada y de salida." },
    ],
    lesson: {
      title: "Varios parámetros y return",
      body: "Una función puede recibir varios datos separados por comas. Dentro los usas como variables normales y con return entregas el resultado. Para pasar horas a minutos: horas * 60 + minutos.",
      example: "function area(ancho, alto) {\n  return ancho * alto;\n}\nconsole.log(area(3, 4)); // 12",
    },
    task: "Escribe duracion(h1, m1, h2, m2): recibe la hora y minuto de entrada y de salida, y devuelve cuántos minutos estuvo conectado. Luego muestra duracion(2, 51, 3, 40).",
    starter: "function duracion(h1, m1, h2, m2) {\n  // tu código\n}\n\nconsole.log(duracion(2, 51, 3, 40));\n",
    borrowed: [],
    cases: [{ label: "visitas de esta semana", globals: () => ({}) }],
    capture: [],
    probe: 'typeof duracion !== "function" ? "__nofn" : [duracion(2, 51, 3, 40), duracion(1, 0, 1, 30), duracion(3, 10, 5, 5), duracion(0, 0, 0, 0)]',
    check: ([o]) => {
      const p = o.values.__probe;
      const err = probeErr(o);
      if (p === "__nofn") return { pass: false, feedback: "No encuentro la función duracion." };
      if (err) return { pass: false, feedback: `Tu función falló: ${err}` };
      const got = p as unknown[];
      const want = [49, 30, 115, 0];
      if (got.every((x) => x === undefined)) return { pass: false, feedback: "Tu función no devuelve nada. Falta el return." };
      if (got[0] === -49) return { pass: false, feedback: "Te dio -49: restaste al revés. Es salida menos entrada." };
      if (got[0] === 89) return { pass: false, feedback: "Te dio 89: sumaste los minutos en vez de pasar todo a minutos. (h2 * 60 + m2) - (h1 * 60 + m1)." };
      const cases = ["2:51 a 3:40", "1:00 a 1:30", "3:10 a 5:05", "0:00 a 0:00"];
      for (let i = 0; i < want.length; i++)
        if (got[i] !== want[i]) return { pass: false, feedback: `De ${cases[i]} devolviste ${show(got[i])}; eran ${want[i]} minutos.` };
      if (!printed(o, "49")) return { pass: false, feedback: "La función está bien. Falta mostrar console.log(duracion(2, 51, 3, 40))." };
      return { pass: true, feedback: "49 minutos. No basta para rastrearlo." };
    },
    hints: [
      "Pasa cada hora a minutos: h1 * 60 + m1",
      "return (h2 * 60 + m2) - (h1 * 60 + m1);",
      "function duracion(h1, m1, h2, m2) {\n  return (h2 * 60 + m2) - (h1 * 60 + m1);\n}\n\nconsole.log(duracion(2, 51, 3, 40));",
    ],
    debrief: [
      { who: "ruth", text: "Cuarenta y nueve minutos. La telefónica pide más de una hora para seguirle hasta el final." },
      { who: "sam", text: "Entonces hay que darle una razón para quedarse." },
    ],
    clue: { title: "Una hora", text: "El rastreo necesita que siga conectado más de 60 minutos." },
  },
  {
    id: "m10",
    act: 2,
    title: "El anzuelo",
    concept: "Funciones y bucles",
    phase: "noche",
    giver: "terminal",
    clock: "03:05",
    briefing: [
      { who: "narrador", text: "Medianoche en el sótano. Ruth se quedó; dice que por el café, pero no ha bebido ni una taza." },
      { who: "ruth", text: "Busca proyectos militares. Pues démosle uno. Montones de archivos falsos con nombres jugosos." },
      { who: "ruth", text: "Que tarde horas en leerlos. Y mientras lee, la telefónica sigue la línea." },
      { who: "sam", text: "Un proyecto que no existe, con documentos que nadie escribió. Me gusta.", mood: "alegre" },
    ],
    lesson: {
      title: "Funciones dentro de bucles",
      body: "Las piezas se combinan: una función hace una tarea pequeña y un bucle la repite para cada elemento de un array. Así no copias el mismo código una y otra vez.",
      example: "function saludo(nombre) {\n  return `Hola, ${nombre}`;\n}\nlet nombres = [\"Ruth\", \"Sam\"];\nfor (let i = 0; i < nombres.length; i++) {\n  console.log(saludo(nombres[i]));\n}",
    },
    task: "Escribe archivoFalso(tema) que devuelva el texto SDINET-tema.txt (por ejemplo SDINET-misiles.txt). Después recorre temas, guarda cada archivoFalso(...) en el array archivos y muestra archivos.length.",
    starter: "function archivoFalso(tema) {\n  // tu código\n}\n\nlet archivos = [];\n// recorre temas aquí\n\nconsole.log(archivos.length);\n",
    borrowed: ['temas = ["misiles", "satelites", ...]'],
    cases: [
      { label: "temas de la primera noche", globals: () => ({ temas: [...TEMAS_A] }) },
      { label: "temas de reserva", globals: () => ({ temas: [...TEMAS_B] }) },
    ],
    capture: ["archivos"],
    probe: 'typeof archivoFalso !== "function" ? "__nofn" : archivoFalso("radares")',
    check: (outs, cases) => {
      const p = outs[0].values.__probe;
      if (p === "__nofn") return { pass: false, feedback: "No encuentro la función archivoFalso." };
      if (p === undefined) return { pass: false, feedback: "archivoFalso no devuelve nada. Falta el return." };
      if (p !== "SDINET-radares.txt")
        return { pass: false, feedback: `archivoFalso("radares") devolvió ${show(p)}; debía ser "SDINET-radares.txt". Revisa el guion y el .txt.` };
      for (let i = 0; i < outs.length; i++) {
        const temas = cases[i].globals().temas as string[];
        const want = temas.map((t) => `SDINET-${t}.txt`);
        const v = outs[i].values.archivos;
        if (!Array.isArray(v)) return { pass: false, feedback: "archivos debe ser un array." };
        if (!same(v, want)) return { pass: false, feedback: `Con ${cases[i].label} archivos quedó ${show(v)} y debía ser ${show(want)}.` };
        if (!printed(outs[i], String(want.length))) return { pass: false, feedback: "Los archivos están bien. Falta console.log(archivos.length)." };
      }
      return { pass: true, feedback: "Archivos falsos listos. El anzuelo está puesto." };
    },
    hints: [
      "return `SDINET-${tema}.txt`;",
      "for (let i = 0; i < temas.length; i++) { archivos.push(archivoFalso(temas[i])); }",
      "function archivoFalso(tema) {\n  return `SDINET-${tema}.txt`;\n}\n\nlet archivos = [];\nfor (let i = 0; i < temas.length; i++) {\n  archivos.push(archivoFalso(temas[i]));\n}\nconsole.log(archivos.length);",
    ],
    debrief: [
      { who: "sistema", text: "03:12 — CONEXION ENTRANTE — cuenta: quasar" },
      { who: "sistema", text: "03:14 — quasar abre SDINET-misiles.txt" },
      { who: "ruth", text: "Mordió.", mood: "alegre" },
    ],
    clue: { title: "El anzuelo", text: "Archivos SDINET falsos. quasar los está leyendo." },
  },
];
