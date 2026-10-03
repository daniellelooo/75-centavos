// Acto 3 — "El rastro" (diciembre de 1986): objetos, arrays de objetos,
// filter, map y acumuladores. Termina cuando el rastreo llega a Europa.
import type { Mission } from "../types";
import { printed, same, show } from "./util";

interface Registro {
  cuenta: string;
  hora: number;
  comando: string;
  minutos: number;
}

const REG_A: Registro[] = [
  { cuenta: "ruth", hora: 9, comando: "mail", minutos: 12 },
  { cuenta: "hunter", hora: 2, comando: "buscar nuclear", minutos: 18 },
  { cuenta: "becario3", hora: 11, comando: "fortran tarea.f", minutos: 40 },
  { cuenta: "hunter", hora: 3, comando: "buscar SDI", minutos: 25 },
  { cuenta: "kessler", hora: 10, comando: "imprimir informe", minutos: 3 },
  { cuenta: "hunter", hora: 3, comando: "buscar NORAD", minutos: 31 },
  { cuenta: "sam", hora: 2, comando: "telescopio.log", minutos: 7 },
];

const REG_B: Registro[] = [
  { cuenta: "hunter", hora: 1, comando: "buscar misiles", minutos: 9 },
  { cuenta: "ruth", hora: 15, comando: "backup", minutos: 50 },
  { cuenta: "hunter", hora: 4, comando: "copiar SDINET", minutos: 22 },
];

const deHunter = (r: Registro[]) => r.filter((x) => x.cuenta === "hunter");
const regs = (r: Registro[]) => () => ({ registros: r.map((x) => ({ ...x })) });

export const ACT3: Mission[] = [
  {
    id: "m11",
    act: 3,
    title: "Ficha de conexión",
    concept: "Objetos",
    phase: "dia",
    giver: "kessler",
    clock: "08:50",
    briefing: [
      { who: "kessler", text: "Llevan tres meses jugando al gato y al ratón en mi sótano. Quiero un expediente serio." },
      { who: "kessler", text: "Cada conexión con sus datos juntos: quién, a qué hora, cuánto tiempo. Nada de papelitos sueltos." },
    ],
    lesson: {
      title: "Objetos: varios datos con nombre",
      body: "Un objeto agrupa datos relacionados entre llaves. Cada dato es una propiedad: un nombre, dos puntos y su valor. Para leer una propiedad se usa un punto: objeto.propiedad.",
      example: 'let estrella = { nombre: "Vega", brillo: 0.03, constelacion: "Lira" };\nconsole.log(estrella.nombre); // Vega',
    },
    task: "Crea el objeto `conexion` con las propiedades `cuenta` \"hunter\", `hora` 3 y `minutos` 47. Muestra `conexion.cuenta`.",
    starter: "// Escribe tu código debajo\n",
    borrowed: [],
    cases: [{ label: "conexión del martes", globals: () => ({}) }],
    capture: ["conexion"],
    check: ([o]) => {
      const v = o.values.conexion as Record<string, unknown> | undefined;
      if (v === undefined) return { pass: false, feedback: "No encuentro el objeto conexion." };
      if (typeof v !== "object" || v === null || Array.isArray(v))
        return { pass: false, feedback: `conexion no es un objeto: vale ${show(v)}. Usa llaves { }.` };
      for (const [k, want] of [["cuenta", "hunter"], ["hora", 3], ["minutos", 47]] as const) {
        if (!(k in v)) return { pass: false, feedback: `Falta la propiedad ${k}.` };
        if (v[k] !== want) {
          if (String(v[k]) === String(want)) return { pass: false, feedback: `${k} vale ${show(v[k])}: es un texto. Los números van sin comillas.` };
          return { pass: false, feedback: `${k} vale ${show(v[k])} y debía ser ${show(want)}.` };
        }
      }
      if (!printed(o, "hunter")) return { pass: false, feedback: "El objeto está bien. Falta console.log(conexion.cuenta)." };
      return { pass: true, feedback: "Una ficha ordenada. Kessler estaría orgulloso, si supiera estarlo." };
    },
    hints: [
      "Un objeto va entre llaves { }, y cada dato se escribe nombre: valor, separados por comas.",
      'Dentro de las llaves: cuenta: "hunter", hora: 3, minutos: 47',
      'let conexion = { cuenta: "hunter", hora: 3, minutos: 47 };\nconsole.log(conexion.cuenta);',
    ],
    debrief: [
      { who: "kessler", text: "Eso. Así se lleva un expediente.", mood: "alegre" },
      { who: "kessler", text: "Por cierto: llamó alguien del gobierno. Ahora sí les interesa. Dicen que \"buscaba cosas que no debía\"." },
    ],
    clue: { title: "Expediente", text: "El gobierno ahora sí se interesa. Algo grave buscaba." },
  },
  {
    id: "m12",
    act: 3,
    title: "El expediente",
    concept: "Arrays de objetos",
    phase: "dia",
    giver: "ruth",
    clock: "10:15",
    briefing: [
      { who: "ruth", text: "Volqué el registro de la semana en registros: una lista de fichas como la tuya." },
      { who: "ruth", text: "Mezcla a todo el mundo. Necesito saber cuántas son de hunter." },
    ],
    lesson: {
      title: "Listas de objetos",
      body: "Un array puede guardar objetos. Al recorrerlo, lista[i] es un objeto completo y lista[i].propiedad es uno de sus datos.",
      example: 'let estrellas = [{ nombre: "Vega" }, { nombre: "Altair" }];\nfor (let i = 0; i < estrellas.length; i++) {\n  console.log(estrellas[i].nombre);\n}',
    },
    task: "Cuenta en la variable `veces` cuántos elementos de `registros` tienen la propiedad `cuenta` igual a \"hunter\". Muestra `veces`.",
    starter: "let veces = 0;\n// recorre registros aquí\n\nconsole.log(veces);\n",
    borrowed: ["registros = [{ cuenta, hora, comando, minutos }, ...]"],
    cases: [
      { label: "registro de la semana", globals: regs(REG_A) },
      { label: "registro del fin de semana", globals: regs(REG_B) },
    ],
    capture: ["veces"],
    check: (outs, cases) => {
      for (let i = 0; i < outs.length; i++) {
        const want = deHunter(cases[i].globals().registros as Registro[]).length;
        const v = outs[i].values.veces;
        if (v === undefined) return { pass: false, feedback: "Falta la variable veces." };
        if (i === 1 && v === deHunter(REG_A).length && want !== v)
          return { pass: false, feedback: "Con otro registro tu cuenta no cambió: pusiste el número a mano." };
        if (v === (cases[i].globals().registros as Registro[]).length)
          return { pass: false, feedback: "Contaste todos los registros. Suma solo cuando registros[i].cuenta === \"hunter\"." };
        if (v !== want) return { pass: false, feedback: `Con ${cases[i].label} contaste ${show(v)} y eran ${want}.` };
        if (!printed(outs[i], String(want))) return { pass: false, feedback: "La cuenta está bien. Falta console.log(veces)." };
      }
      return { pass: true, feedback: "Tres de siete en la semana. hunter es puntual." };
    },
    hints: [
      "Recorre registros con un for, como en la misión de las horas. En cada vuelta, registros[i] es una ficha entera: mira su cuenta.",
      'if (registros[i].cuenta === "hunter") { veces++; }',
      'let veces = 0;\nfor (let i = 0; i < registros.length; i++) {\n  if (registros[i].cuenta === "hunter") {\n    veces++;\n  }\n}\nconsole.log(veces);',
    ],
    debrief: [{ who: "ruth", text: "Funciona, pero es mucho código para una pregunta tan simple. Déjame enseñarte un truco.", mood: "alegre" }],
    clue: { title: "Puntual", text: "Tres conexiones por semana, siempre de madrugada." },
  },
  {
    id: "m13",
    act: 3,
    title: "Filtrar el ruido",
    concept: "filter y flechas",
    phase: "dia",
    giver: "ruth",
    clock: "11:30",
    briefing: [
      { who: "ruth", text: "Ayer contaste a hunter a mano: un for, un if y un contador. Funciona, pero es largo." },
      { who: "ruth", text: "Las listas saben filtrarse solas. Les haces una pregunta de sí o no y se quedan con los que dicen sí." },
      { who: "ruth", text: "Quiero una lista nueva solo con los registros de hunter." },
    ],
    lesson: {
      title: "filter: quedarse con algunos",
      body: "`filter` recorre la lista por ti, elemento a elemento, y a cada uno le hace una pregunta. Se queda solo con los que responden `true` y los devuelve en una lista nueva; la original no cambia. La pregunta se escribe con una función flecha: `(n) => n > 5` se lee \"para cada n, ¿es n mayor que 5?\". La `n` es el nombre que tú le pones a cada elemento mientras se revisa, como la `i` de un for. Verás también `const` en lugar de `let`: crea una variable igual, pero que no vas a volver a cambiar. Si dudas, `let` siempre funciona.",
      example: 'let numeros = [4, 9, 2, 7];\n// para cada n: ¿es n mayor que 5?\nlet grandes = numeros.filter((n) => n > 5);\nconsole.log(grandes); // [9,7]',
    },
    task: "Crea `deHunter` con `registros.filter(...)`, quedándote solo con los que tienen `cuenta` \"hunter\". Muestra `deHunter.length`.",
    starter: "// registros es una lista; cada registro tiene cuenta, hora, comando y minutos\n",
    borrowed: ["registros = [{ cuenta, hora, comando, minutos }, ...]"],
    cases: [
      { label: "registro de la semana", globals: regs(REG_A) },
      { label: "registro del fin de semana", globals: regs(REG_B) },
    ],
    capture: ["deHunter"],
    check: (outs, cases) => {
      for (let i = 0; i < outs.length; i++) {
        const want = deHunter(cases[i].globals().registros as Registro[]);
        const v = outs[i].values.deHunter;
        if (v === undefined) return { pass: false, feedback: "Falta la variable deHunter." };
        if (!Array.isArray(v)) return { pass: false, feedback: `deHunter debe ser un array (lo que devuelve filter). Ahora vale ${show(v)}.` };
        if (v.length === 0) return { pass: false, feedback: "deHunter quedó vacío. ¿Tu flecha devuelve la comparación? (r) => r.cuenta === \"hunter\"" };
        if (!same(v, want)) return { pass: false, feedback: `Con ${cases[i].label} quedaron ${v.length} registros y debían ser ${want.length}, todos de hunter.` };
        if (!printed(outs[i], String(want.length))) return { pass: false, feedback: "El filtro funciona. Falta console.log(deHunter.length)." };
      }
      return { pass: true, feedback: "Una línea en vez de seis. Ruth sonríe por primera vez en el acto." };
    },
    hints: [
      'La pregunta para cada registro es: ¿su cuenta es "hunter"? Llama r a cada registro; su cuenta es r.cuenta.',
      'Escrita como flecha: (r) => r.cuenta === "hunter". Pásasela a registros.filter(...) y guarda el resultado en deHunter.',
      'const deHunter = registros.filter((r) => r.cuenta === "hunter");\nconsole.log(deHunter.length);',
    ],
    debrief: [{ who: "sam", text: "Ahora veamos qué hace cuando entra." }],
    clue: { title: "Filtro", text: "Separamos a hunter del resto del laboratorio." },
  },
  {
    id: "m14",
    act: 3,
    title: "Lo que busca",
    concept: "map",
    phase: "dia",
    giver: "kessler",
    clock: "15:45",
    briefing: [
      { who: "kessler", text: "El hombre del gobierno quiere saber qué escribe ese tipo. Palabra por palabra." },
      { who: "kessler", text: "No los minutos ni las horas. Solo los comandos." },
    ],
    lesson: {
      title: "map: transformar cada elemento",
      body: "`map` también recorre la lista elemento a elemento, pero en vez de preguntar, transforma: cambia cada elemento por lo que devuelva la flecha. La lista nueva tiene el mismo tamaño. `(e) => e.nombre` se lee \"de cada estrella e, quédate con su nombre\". Como `filter` devuelve una lista, puedes ponerle `.map(...)` justo detrás: primero filtras y luego transformas.",
      example: 'let estrellas = [{ nombre: "Vega", brillo: 0.03 }, { nombre: "Deneb", brillo: 1.25 }];\n// de cada estrella e, su nombre\nlet nombres = estrellas.map((e) => e.nombre);\nconsole.log(nombres); // ["Vega","Deneb"]',
    },
    task: "Crea `busquedas` con los comandos (la propiedad `comando`) de los registros de hunter: primero `filter`, luego `map`. Muestra `busquedas`.",
    starter: "// registros es una lista; cada registro tiene cuenta, hora, comando y minutos\n",
    borrowed: ["registros = [{ cuenta, hora, comando, minutos }, ...]"],
    cases: [
      { label: "registro de la semana", globals: regs(REG_A) },
      { label: "registro del fin de semana", globals: regs(REG_B) },
    ],
    capture: ["busquedas"],
    check: (outs, cases) => {
      for (let i = 0; i < outs.length; i++) {
        const all = cases[i].globals().registros as Registro[];
        const want = deHunter(all).map((r) => r.comando);
        const v = outs[i].values.busquedas;
        if (v === undefined) return { pass: false, feedback: "Falta la variable busquedas." };
        if (!Array.isArray(v)) return { pass: false, feedback: "busquedas debe ser un array." };
        if (same(v, all.map((r) => r.comando))) return { pass: false, feedback: "Están los comandos de todo el mundo. Filtra primero los de hunter." };
        if (same(v, deHunter(all))) return { pass: false, feedback: "Tienes las fichas completas. Usa map para quedarte solo con r.comando." };
        if (!same(v, want)) return { pass: false, feedback: `Obtuviste ${show(v)} y debía ser ${show(want)}.` };
      }
      return { pass: true, feedback: "nuclear, SDI, NORAD. No es un estudiante curioso." };
    },
    hints: [
      'Dos pasos: primero el filtro de ayer, registros.filter((r) => r.cuenta === "hunter"). Eso te da los registros de hunter.',
      'Detrás pon .map(...) con la flecha que, de cada registro r, se queda con su comando: (r) => r.comando',
      'const busquedas = registros\n  .filter((r) => r.cuenta === "hunter")\n  .map((r) => r.comando);\nconsole.log(busquedas);',
    ],
    debrief: [
      { who: "sam", text: "Nuclear. SDI. NORAD. No le interesa nuestra VAX. La usa de puente para llegar a otras.", mood: "sorpresa" },
      { who: "kessler", text: "...Voy a llamar otra vez a ese hombre del gobierno.", mood: "serio" },
    ],
    clue: { title: "Lo que busca", text: "nuclear, SDI, NORAD: usa la VAX de puente a redes militares." },
  },
  {
    id: "m15",
    act: 3,
    title: "Hora y media",
    concept: "Acumuladores",
    phase: "noche",
    giver: "terminal",
    clock: "02:20",
    briefing: [
      { who: "narrador", text: "Diciembre. Hace frío en el sótano y la telefónica alemana por fin colabora." },
      { who: "ruth", text: "Dicen que si esta noche suma una hora y media en línea, llegan hasta su casa." },
      { who: "sam", text: "Sumemos sus sesiones de esta noche. Si pasa de 90 minutos, lo tenemos." },
    ],
    lesson: {
      title: "for...of y acumuladores",
      body: "`for (const s of sesiones)` recorre los elementos directamente, sin índices: en cada vuelta, `s` es la siguiente sesión. Un acumulador es una variable que empieza en 0 y va sumando: `total += x` es lo mismo que `total = total + x`.",
      example: "let distancias = [4, 8, 3];\nlet total = 0;\nfor (const d of distancias) {\n  total += d;\n}\nconsole.log(total); // 15",
    },
    task: "Suma en la variable `total` los minutos (propiedad `minutos`) de todas las `sesiones` de esta noche, usando `for...of`. Muestra `total`.",
    starter: "let total = 0;\n// recorre sesiones aquí\n\nconsole.log(total);\n",
    borrowed: ["sesiones = [{ cuenta, minutos }, ...]"],
    cases: [
      { label: "sesiones de esta noche", globals: () => ({ sesiones: [{ cuenta: "hunter", minutos: 31 }, { cuenta: "quasar", minutos: 44 }, { cuenta: "nadir", minutos: 22 }] }) },
      { label: "sesiones de anoche", globals: () => ({ sesiones: [{ cuenta: "hunter", minutos: 12 }, { cuenta: "hunter", minutos: 8 }] }) },
    ],
    capture: ["total"],
    check: (outs, cases) => {
      for (let i = 0; i < outs.length; i++) {
        const ses = cases[i].globals().sesiones as { minutos: number }[];
        const want = ses.reduce((a, s) => a + s.minutos, 0);
        const v = outs[i].values.total;
        if (v === undefined) return { pass: false, feedback: "Falta la variable total." };
        if (typeof v === "string") return { pass: false, feedback: `total quedó como texto (${show(v)}): estás sumando objetos. Suma s.minutos, no s.` };
        if (i === 1 && v === 97) return { pass: false, feedback: "Con otras sesiones tu total no cambió: pusiste el número a mano." };
        if (v !== want) return { pass: false, feedback: `Con ${cases[i].label} sumaste ${show(v)} y eran ${want} minutos.` };
        if (!printed(outs[i], String(want))) return { pass: false, feedback: "El total está bien. Falta console.log(total)." };
      }
      return { pass: true, feedback: "97 minutos. Más de hora y media. La línea sigue abierta." };
    },
    hints: [
      "for...of te da cada sesión, una por vuelta, sin índices. Llámala s: su duración es s.minutos.",
      "Dentro del bucle: total += s.minutos;",
      "let total = 0;\nfor (const s of sesiones) {\n  total += s.minutos;\n}\nconsole.log(total);",
    ],
    debrief: [
      { who: "sistema", text: "03:57 — LLAMADA TELEFONICA EXTERNA — rastreo completado" },
      { who: "ruth", text: "Sam... tienen la dirección.", mood: "sorpresa" },
    ],
    clue: { title: "Rastreo", text: "97 minutos en línea: la telefónica completa el rastreo." },
  },
];
