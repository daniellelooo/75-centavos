// Medianoche — Bogotá, diciembre de 1999. En el Banco Cafetero del Sur (ficticio)
// los programas guardan los años con dos cifras y, al pasar a "00", creerán que es 1900.
// Camilo, el practicante, aprende a trabajar con fechas, textos con formato y a probar
// su código antes de la medianoche del 31. Personajes y empresa inventados.
import type { StoryContent, StoryMission } from "../types";
import type { RunOutput } from "../../game/sandbox";
import type { TestCase } from "../../game/types";
import { printed, probeErr, same, show } from "../../game/acts/util";

const START = "// Escribe tu código debajo de esta línea\n";
const ok = (feedback: string) => ({ pass: true, feedback });
const no = (feedback: string) => ({ pass: false, feedback });

/** Recorre los casos: el primero que falle devuelve su mensaje. */
function every(
  outs: RunOutput[],
  cases: TestCase[],
  one: (o: RunOutput, g: Record<string, unknown>, i: number) => string | null,
  win: string,
) {
  for (let i = 0; i < outs.length; i++) {
    const msg = one(outs[i], cases[i].globals(), i);
    if (msg) return no(msg);
  }
  return ok(win);
}

/** Lee el probe de una función del jugador: null si no existe, o el mensaje de error. */
function probeOf(o: RunOutput, fn: string): { err: string | null; v: unknown } {
  const v = o.values.__probe;
  if (v === null || v === undefined) return { err: `No encuentro la función ${fn}. Créala con function ${fn}(...) { ... }.`, v };
  const e = probeErr(o);
  if (e) {
    if (/padStart is not a function/.test(e))
      return { err: "Los números no tienen padStart: conviértelo antes en texto con String(n).padStart(2, \"0\").", v };
    return { err: `Tu función ${fn} dio un error: ${e}`, v };
  }
  return { err: null, v };
}

// ---------- La lógica de referencia (lo que debería dar el código del jugador) ----------

const completo = (aa: number) => (aa <= 49 ? 2000 + aa : 1900 + aa);
const dos = (n: number) => String(n).padStart(2, "0");
const claveRef = (t: string) => {
  const [d, m, a] = t.split("/").map(Number);
  return completo(a) * 10000 + m * 100 + d;
};
const bisiesto = (a: number) => (a % 4 === 0 && a % 100 !== 0) || a % 400 === 0;
const DIAS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const diasMes = (m: number, a: number) => (m === 2 && bisiesto(a) ? 29 : DIAS[m - 1]);
interface Fecha { dia: number; mes: number; anio: number }
const utc = (f: Fecha) => Date.UTC(f.anio, f.mes - 1, f.dia);
const entre = (a: Fecha, b: Fecha) => (utc(b) - utc(a)) / 86400000;
const interesRef = (s: number, t: number, d: number) => (d < 0 ? "0.00" : ((s * t) / 100 / 365 * d).toFixed(2));

/** La de leerFecha que la máquina presta en la misión final. */
function leerFechaRef(texto: string): number {
  const partes = String(texto).split("/");
  if (partes.length !== 3) throw new Error("Fecha mala: " + texto);
  for (const p of partes) if (p === "" || Number.isNaN(Number(p))) throw new Error("Fecha mala: " + texto);
  return claveRef(texto);
}

// ---------- Datos de los casos ----------

const LOTE_A = ["31/12/99", "3l/12/99", "15-01-00", "29/02/00", "", "02/01/00"];
const LOTE_B = ["24/12/99", "01/0l/00", "28/12/99", "31/12/99", "1999-12-30"];
const contarLote = (l: string[]) => {
  let buenas = 0;
  let malas = 0;
  for (const t of l) {
    try {
      leerFechaRef(t);
      buenas++;
    } catch {
      malas++;
    }
  }
  return { buenas, malas };
};

interface Mov { fecha: string; monto: number }
const MOV_A: Mov[] = [
  { fecha: "02/01/00", monto: 50000 },
  { fecha: "30/12/99", monto: 120000 },
  { fecha: "31/12/99", monto: -40000 },
  { fecha: "15/12/99", monto: 800000 },
  { fecha: "01/01/00", monto: 20000 },
];
const MOV_B: Mov[] = [
  { fecha: "10/01/00", monto: 300000 },
  { fecha: "24/12/99", monto: -150000 },
  { fecha: "03/01/00", monto: 75000 },
  { fecha: "28/12/99", monto: 1000000 },
];

interface Cuenta { numero: string; saldo: number; vence: string }
const CUENTAS_A: Cuenta[] = [
  { numero: "001-4471", saldo: 2500000, vence: "31/12/99" },
  { numero: "001-4472", saldo: 830000, vence: "15/01/00" },
  { numero: "001-4473", saldo: 12000000, vence: "3l/12/99" },
  { numero: "001-4474", saldo: 450000, vence: "20/11/99" },
  { numero: "001-4475", saldo: 6700000, vence: "28/02/00" },
  { numero: "001-4476", saldo: 95000, vence: "01-03-00" },
];
const CUENTAS_B: Cuenta[] = [
  { numero: "002-0101", saldo: 1200000, vence: "24/12/99" },
  { numero: "002-0102", saldo: 3400000, vence: "02/01/00" },
  { numero: "002-0103", saldo: 780000, vence: "31/12/99" },
  { numero: "002-0104", saldo: 15000000, vence: "29/02/00" },
  { numero: "002-0105", saldo: 60000, vence: "xx/12/99" },
];
const CORTE = 19991231;
const cierreRef = (cs: Cuenta[], corte: number) => {
  let total = 0;
  let vencidas = 0;
  let errores = 0;
  for (const c of cs) {
    try {
      const v = leerFechaRef(c.vence);
      total += c.saldo;
      if (v <= corte) vencidas++;
    } catch {
      errores++;
    }
  }
  return { total, vencidas, errores };
};

// La rutina de Wilson: la de siempre y la "parchada".
const rutinaVieja = (aa: number) => 1900 + aa;
const rutinaParche = (aa: number) => (aa < 49 ? 2000 + aa : 1900 + aa);
const casosDe = (entradas: number[]) => entradas.map((e) => ({ entrada: e, esperado: completo(e) }));
const CASOS_A = casosDe([99, 87, 0, 5, 49, 50]);
const CASOS_B = casosDe([0, 49, 50, 12, 98]);
const fallosDe = (fn: (n: number) => number, cs: { entrada: number; esperado: number }[]) =>
  cs.filter((c) => fn(c.entrada) !== c.esperado).length;

// ---------- Misiones ----------

const missions: StoryMission[] = [
  // ===================== ACTO 1: DOS CIFRAS =====================
  {
    id: "mn1",
    act: 1,
    giver: "beatriz",
    title: "Partir la fecha",
    concept: "split y Number",
    briefing: [
      { who: "beatriz", text: "Mijo, deje el inventario un momento. Siéntese aquí, que esto es más urgente." },
      { who: "beatriz", text: "Las fechas del banco llegan como texto: \"31/12/99\". Para hacer cuentas con ellas hay que partirlas en día, mes y año." },
      { who: "beatriz", text: "Le dejé una en la variable fecha. Pártala y conviértala en números, por favor." },
    ],
    lesson: {
      title: "Partir un texto y volverlo número",
      body: "`texto.split(\"/\")` corta un texto en cada barra y devuelve una lista con los pedazos. Esos pedazos siguen siendo texto: \"05\" no es el número 5, y \"05\" + 1 da \"051\". Para convertirlos usa `Number(...)`: `Number(\"05\")` vale 5.",
      example: 'let hora = "07:45";\nlet partes = hora.split(":");\nconsole.log(partes); // ["07","45"]\nlet h = Number(partes[0]);\nconsole.log(h + 1); // 8',
    },
    task: "Parte `fecha` con `split(\"/\")` y guarda en `dia`, `mes` y `anio` sus tres pedazos convertidos a número con `Number`. Muestra `anio` con `console.log`.",
    starter: START,
    borrowed: ["fecha"],
    cases: [
      { label: "el cierre", globals: () => ({ fecha: "31/12/99" }) },
      { label: "el primer lunes del año", globals: () => ({ fecha: "05/01/00" }) },
    ],
    capture: ["dia", "mes", "anio"],
    check: (outs, cases) =>
      every(outs, cases, (o, g, i) => {
        const [d, m, a] = String(g.fecha).split("/");
        const want: Record<string, string> = { dia: d, mes: m, anio: a };
        for (const k of ["dia", "mes", "anio"]) {
          const v = o.values[k];
          if (v === undefined) return `Falta la variable ${k}.`;
          if (typeof v === "string")
            return `${k} vale ${show(v)}: sigue siendo texto. Pásalo por Number(...) para que sea un número.`;
          if (v !== Number(want[k])) {
            if (i > 0) return `Con la fecha "${g.fecha}", ${k} vale ${show(v)} y debía ser ${Number(want[k])}. ¿Lo escribiste a mano?`;
            return `${k} vale ${show(v)} y debía ser ${Number(want[k])}. Recuerda: el pedazo 0 es el día, el 1 el mes y el 2 el año.`;
          }
        }
        if (!printed(o, String(Number(a)))) return "Las tres partes están bien. Falta mostrar anio con console.log(anio).";
        return null;
      }, "Día, mes y año, y ya son números. Ahora sí se puede hacer cuentas."),
    hints: [
      "Primero guarda la lista: let partes = fecha.split(\"/\"); El día es partes[0].",
      "let dia = Number(partes[0]); y lo mismo con partes[1] para mes y partes[2] para anio.",
      'let partes = fecha.split("/");\nlet dia = Number(partes[0]);\nlet mes = Number(partes[1]);\nlet anio = Number(partes[2]);\nconsole.log(anio);',
    ],
    debrief: [
      { who: "camilo", text: "El año me da 99. O cero, si la fecha es del próximo año. ¿Eso es grave?", mood: "sorpresa" },
      { who: "beatriz", text: "Para un computador, cero es menos que noventa y nueve. Por eso está usted aquí, mijo.", mood: "serio" },
    ],
  },
  {
    id: "mn2",
    act: 1,
    giver: "wilson",
    title: "La ventana",
    concept: "Regla de ventana",
    briefing: [
      { who: "wilson", text: "Yo escribí eso en el ochenta y cuatro. En tarjetas perforadas cada columna costaba, y nadie iba a gastar dos en \"19\"." },
      { who: "wilson", text: "Mi rutina hace 1900 más el año. Funcionó quince años sin una sola queja, joven." },
      { who: "beatriz", text: "Funcionó hasta ahora, Wilson. Camilo, necesitamos una regla para saber el siglo de cada año de dos cifras." },
    ],
    lesson: {
      title: "Una ventana para adivinar el siglo",
      body: "Con dos cifras no se sabe el siglo, así que se elige una regla: de 00 a 49 es 20xx y de 50 a 99 es 19xx. Eso es un `if` con `else` dentro de una función que devuelve el año completo con `return`. Sin `return`, la función devuelve `undefined`.",
      example: "function temporada(mes) {\n  if (mes <= 6) {\n    return \"primer semestre\";\n  } else {\n    return \"segundo semestre\";\n  }\n}\nconsole.log(temporada(12)); // segundo semestre",
    },
    task: "Escribe la función `anioCompleto(aa)` que recibe un año de dos cifras (un número) y devuelve el año de cuatro: de 0 a 49 suma 2000, de 50 a 99 suma 1900.",
    starter: START,
    borrowed: [],
    probe: "typeof anioCompleto === 'function' ? __casos.map((x) => anioCompleto(x)) : null",
    cases: [
      { label: "años del archivo", globals: () => ({ __casos: [99, 0, 49, 50, 5] }) },
      { label: "otros años", globals: () => ({ __casos: [87, 12, 50, 49, 1] }) },
    ],
    capture: [],
    check: (outs, cases) =>
      every(outs, cases, (o, g) => {
        const { err, v } = probeOf(o, "anioCompleto");
        if (err) return err;
        const xs = g.__casos as number[];
        const got = v as unknown[];
        if (got.every((r) => r === undefined)) return "anioCompleto devuelve undefined: te falta el return.";
        for (let k = 0; k < xs.length; k++) {
          const want = completo(xs[k]);
          if (got[k] === want) continue;
          if (xs[k] < 10 && got[k] === 1900 + xs[k])
            return `anioCompleto(${xs[k]}) dio ${show(got[k])}: justo el error del banco. De 0 a 49 es 20xx.`;
          if (xs[k] === 49 || xs[k] === 50)
            return `anioCompleto(${xs[k]}) dio ${show(got[k])} y debía ser ${want}. Revisa el límite: 49 es 2049 y 50 es 1950. ¿Usaste < en vez de <=?`;
          return `anioCompleto(${xs[k]}) dio ${show(got[k])} y debía ser ${want}.`;
        }
        return null;
      }, "99 es 1999 y 00 es 2000. El banco ya sabe en qué siglo vive."),
    hints: [
      "Dentro de la función pregunta: if (aa <= 49). Si es así, el año es 2000 + aa.",
      "En el else, devuelve 1900 + aa. No olvides el return en los dos caminos.",
      "function anioCompleto(aa) {\n  if (aa <= 49) {\n    return 2000 + aa;\n  } else {\n    return 1900 + aa;\n  }\n}",
    ],
    debrief: [
      { who: "wilson", text: "¿Y en el 2050 qué? Ahí vuelve el problema.", mood: "serio" },
      { who: "camilo", text: "En el 2050 ya habrá otro practicante, don Wilson.", mood: "alegre" },
      { who: "wilson", text: "Eso mismo decía yo en el ochenta y cuatro." },
    ],
  },
  {
    id: "mn3",
    act: 1,
    giver: "beatriz",
    title: "Ceros a la izquierda",
    concept: "padStart",
    briefing: [
      { who: "beatriz", text: "Los extractos salen impresos con fechas como 5/1/2000. El formato del banco es 05/01/2000, con ceros." },
      { who: "beatriz", text: "Si no, la impresora de matriz corre las columnas y el cliente ve su saldo debajo de la fecha. Un desastre." },
    ],
    lesson: {
      title: "Rellenar con ceros",
      body: "`padStart(largo, relleno)` alarga un texto por la izquierda hasta el largo que pidas: `\"7\".padStart(2, \"0\")` da \"07\". Solo funciona con textos, así que un número se convierte primero con `String(n)`. Si el texto ya tiene ese largo, no cambia.",
      example: 'let caja = 3;\nlet rotulo = "CAJA-" + String(caja).padStart(3, "0");\nconsole.log(rotulo); // CAJA-003',
    },
    task: "Escribe la función `formatear(dia, mes, anio)` que recibe tres números y devuelve el texto \"dd/mm/aaaa\", con el día y el mes siempre a dos cifras. Por ejemplo, `formatear(5, 1, 2000)` devuelve \"05/01/2000\".",
    starter: START,
    borrowed: [],
    probe: "typeof formatear === 'function' ? __casos.map((c) => formatear(c[0], c[1], c[2])) : null",
    cases: [
      { label: "extractos de enero", globals: () => ({ __casos: [[5, 1, 2000], [31, 12, 1999], [9, 9, 1999]] }) },
      { label: "extractos de febrero", globals: () => ({ __casos: [[1, 2, 2000], [24, 12, 1999], [15, 10, 2001]] }) },
    ],
    capture: [],
    check: (outs, cases) =>
      every(outs, cases, (o, g) => {
        const { err, v } = probeOf(o, "formatear");
        if (err) return err;
        const cs = g.__casos as number[][];
        const got = v as unknown[];
        if (got.every((r) => r === undefined)) return "formatear devuelve undefined: te falta el return.";
        for (let k = 0; k < cs.length; k++) {
          const [d, m, a] = cs[k];
          const want = `${dos(d)}/${dos(m)}/${a}`;
          if (got[k] === want) continue;
          if (got[k] === `${d}/${m}/${a}`)
            return `formatear(${d}, ${m}, ${a}) dio "${d}/${m}/${a}". Faltan los ceros: usa padStart(2, "0") en el día y el mes.`;
          if (typeof got[k] !== "string") return `formatear debe devolver un texto, y devolvió ${show(got[k])}.`;
          return `formatear(${d}, ${m}, ${a}) dio ${show(got[k])} y debía ser "${want}".`;
        }
        return null;
      }, "05/01/2000. La matriz de puntos queda derechita."),
    hints: [
      "El día como texto de dos cifras es String(dia).padStart(2, \"0\"). Haz lo mismo con el mes.",
      "Une las partes con una plantilla: `${d}/${m}/${anio}`, donde d y m ya llevan sus ceros.",
      "function formatear(dia, mes, anio) {\n  const d = String(dia).padStart(2, \"0\");\n  const m = String(mes).padStart(2, \"0\");\n  return `${d}/${m}/${anio}`;\n}",
    ],
    debrief: [
      { who: "beatriz", text: "Mírelo, Wilson. Derechito.", mood: "alegre" },
      { who: "wilson", text: "En mi época eso se hacía con un formato PIC 99. Pero sí, quedó bien." },
    ],
  },
  {
    id: "mn4",
    act: 1,
    giver: "wilson",
    title: "Comparar fechas",
    concept: "Fecha como AAAAMMDD",
    briefing: [
      { who: "wilson", text: "Le cuento lo que me tiene sin dormir. Para saber si una cuenta venció, el programa compara textos." },
      { who: "wilson", text: "Y \"01/01/00\" es menor que \"31/12/99\" para la máquina. Así que el primero de enero queda antes que la Navidad." },
      { who: "wilson", text: "Necesito una forma de comparar que no falle. Usted que es de la nueva generación." },
    ],
    lesson: {
      title: "Comparar fechas como números",
      body: "Los textos se comparan letra por letra, así que \"01/01/00\" < \"31/12/99\" es `true`. El truco es convertir cada fecha en un número AAAAMMDD: año por 10000, más mes por 100, más día. Así 31/12/1999 es 19991231 y 1/1/2000 es 20000101: el número mayor siempre es la fecha posterior.",
      example: 'console.log("01/01/00" < "31/12/99"); // true\nlet n = 2000 * 10000 + 3 * 100 + 15;\nconsole.log(n); // 20000315',
    },
    task: "Escribe la función `clave(texto)` que recibe una fecha \"dd/mm/aa\" y devuelve el número AAAAMMDD, con el siglo según la ventana (de 00 a 49 es 20xx, de 50 a 99 es 19xx). `clave(\"31/12/99\")` devuelve 19991231.",
    starter: START,
    borrowed: [],
    probe: "typeof clave === 'function' ? __casos.map((t) => clave(t)) : null",
    cases: [
      { label: "vencimientos de diciembre", globals: () => ({ __casos: ["31/12/99", "01/01/00", "05/01/00", "15/06/87"] }) },
      { label: "vencimientos de marzo", globals: () => ({ __casos: ["24/12/99", "02/01/00", "28/02/49", "01/03/50"] }) },
    ],
    capture: [],
    check: (outs, cases) =>
      every(outs, cases, (o, g) => {
        const { err, v } = probeOf(o, "clave");
        if (err) return err;
        const ts = g.__casos as string[];
        const got = v as unknown[];
        if (got.every((r) => r === undefined)) return "clave devuelve undefined: te falta el return.";
        for (let k = 0; k < ts.length; k++) {
          const want = claveRef(ts[k]);
          const r = got[k];
          if (r === want) continue;
          if (typeof r === "string")
            return `clave("${ts[k]}") devolvió el texto ${show(r)}. Tiene que ser un número: año * 10000 + mes * 100 + día.`;
          const [d, m, a] = ts[k].split("/").map(Number);
          if (r === (1900 + a) * 10000 + m * 100 + d)
            return `clave("${ts[k]}") dio ${r}: quedó en 1900. Aplica la ventana: de 00 a 49 es 2000 más el año.`;
          if (r === a * 10000 + m * 100 + d)
            return `clave("${ts[k]}") dio ${r}: falta el siglo. Convierte el año de dos cifras en uno de cuatro antes de multiplicar.`;
          return `clave("${ts[k]}") dio ${show(r)} y debía ser ${want}.`;
        }
        return null;
      }, "20000101 es mayor que 19991231. El primero de enero vuelve a ir después de Navidad."),
    hints: [
      "Parte el texto con split(\"/\") y convierte cada pedazo con Number, como en la primera misión.",
      "Con el año: if (anio <= 49) { anio = 2000 + anio; } else { anio = 1900 + anio; }. Al final, return anio * 10000 + mes * 100 + dia;",
      "function clave(texto) {\n  const partes = texto.split(\"/\");\n  const dia = Number(partes[0]);\n  const mes = Number(partes[1]);\n  let anio = Number(partes[2]);\n  if (anio <= 49) {\n    anio = 2000 + anio;\n  } else {\n    anio = 1900 + anio;\n  }\n  return anio * 10000 + mes * 100 + dia;\n}",
    ],
    debrief: [
      { who: "wilson", text: "Un número que ya trae el orden adentro. Eso es elegante.", mood: "sorpresa" },
      { who: "wilson", text: "No se le suba a la cabeza. Todavía falta febrero." },
    ],
  },

  // ===================== ACTO 2: BISIESTO =====================
  {
    id: "mn5",
    act: 2,
    giver: "beatriz",
    title: "El 29 de febrero",
    concept: "Años bisiestos",
    briefing: [
      { who: "beatriz", text: "Me llamaron de Contraloría. Quieren saber si el sistema sabe que el 2000 tiene 29 de febrero." },
      { who: "camilo", text: "Pues claro, es múltiplo de cuatro." },
      { who: "beatriz", text: "1900 también era múltiplo de cuatro y no tuvo 29 de febrero, mijo. Lea bien la regla antes de opinar.", mood: "serio" },
    ],
    lesson: {
      title: "La regla completa del bisiesto",
      body: "Un año es bisiesto si se divide por 4, salvo los que se dividen por 100, que no lo son; pero los que se dividen por 400 sí lo son. Por eso 1900 no fue bisiesto y 2000 sí. `a % 4 === 0` pregunta si `a` se divide por 4; `&&` es \"y\", `||` es \"o\" y `!==` es \"distinto de\".",
      example: "function esPar(n) {\n  return n % 2 === 0;\n}\nconsole.log(esPar(14)); // true\nconsole.log(15 % 4 === 0 || 15 % 5 === 0); // true",
    },
    task: "Escribe la función `esBisiesto(anio)` que devuelve `true` o `false` con la regla completa: divisible por 4 y no por 100, o divisible por 400.",
    starter: START,
    borrowed: [],
    probe: "typeof esBisiesto === 'function' ? __casos.map((a) => esBisiesto(a)) : null",
    cases: [
      { label: "años de la circular", globals: () => ({ __casos: [1996, 1999, 1900, 2000, 2004, 2100] }) },
      { label: "años de Contraloría", globals: () => ({ __casos: [2001, 1988, 1800, 2400, 1997, 2000] }) },
    ],
    capture: [],
    check: (outs, cases) =>
      every(outs, cases, (o, g) => {
        const { err, v } = probeOf(o, "esBisiesto");
        if (err) return err;
        const as = g.__casos as number[];
        const got = v as unknown[];
        if (got.every((r) => r === undefined)) return "esBisiesto devuelve undefined: te falta el return.";
        for (let k = 0; k < as.length; k++) {
          const a = as[k];
          const r = got[k];
          if (r !== true && r !== false) return `esBisiesto(${a}) devolvió ${show(r)}. Tiene que devolver true o false.`;
          if (r === bisiesto(a)) continue;
          if (a % 100 === 0 && a % 400 !== 0)
            return `esBisiesto(${a}) dio true. ${a} se divide por 4, pero también por 100: no es bisiesto. Te falta esa excepción.`;
          if (a % 400 === 0)
            return `esBisiesto(${a}) dio false. ${a} se divide por 400, así que sí es bisiesto: es la excepción de la excepción.`;
          return `esBisiesto(${a}) dio ${r} y debía ser ${bisiesto(a)}.`;
        }
        return null;
      }, "1900 no, 2000 sí. Contraloría puede dormir tranquila."),
    hints: [
      "Son dos maneras de ser bisiesto: (divisible por 4 y no por 100) o (divisible por 400).",
      "La primera parte es anio % 4 === 0 && anio % 100 !== 0. La segunda, anio % 400 === 0. Únelas con ||.",
      "function esBisiesto(anio) {\n  return (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;\n}",
    ],
    debrief: [
      { who: "camilo", text: "O sea que el 2000 es bisiesto de rebote. Por ser múltiplo de 400.", mood: "sorpresa" },
      { who: "beatriz", text: "Eso. Y ahora vamos a ver cuántos días tiene cada mes, que de eso depende el interés.", mood: "alegre" },
    ],
  },
  {
    id: "mn6",
    act: 2,
    giver: "wilson",
    title: "Días del mes",
    concept: "Listas e índice desde 0",
    briefing: [
      { who: "wilson", text: "Treinta días trae noviembre, con abril, junio y septiembre. Así me lo enseñó mi mamá." },
      { who: "wilson", text: "El programa de liquidación necesita saber los días de cada mes. Febrero según el año, con su función de ayer." },
    ],
    lesson: {
      title: "Una lista como tabla",
      body: "Una lista puede servir de tabla: en la posición 0 los días de enero, en la 1 los de febrero... Las listas empiezan en 0, así que el mes 1 está en la posición 0: se lee con `lista[mes - 1]`. Febrero es el caso especial: se pregunta aparte.",
      example: 'let turnos = ["mañana", "tarde", "noche"];\nlet numero = 2;\nconsole.log(turnos[numero - 1]); // tarde',
    },
    task: "Escribe la función `diasDelMes(mes, anio)` que devuelve cuántos días tiene ese mes (enero es 1). Usa una lista con los días de cada mes y, si el mes es 2 y `esBisiesto(anio)` es `true`, devuelve 29.",
    starter: START,
    borrowed: ["esBisiesto(anio): la función de la misión anterior"],
    probe: "typeof diasDelMes === 'function' ? __casos.map((c) => diasDelMes(c[0], c[1])) : null",
    cases: [
      { label: "liquidación de diciembre", globals: () => ({ esBisiesto: bisiesto, __casos: [[2, 2000], [2, 1900], [12, 1999], [4, 2000], [1, 2000]] }) },
      { label: "liquidación de enero", globals: () => ({ esBisiesto: bisiesto, __casos: [[2, 1996], [2, 1999], [11, 1999], [1, 2000], [2, 2100]] }) },
    ],
    capture: [],
    check: (outs, cases) =>
      every(outs, cases, (o, g) => {
        const { err, v } = probeOf(o, "diasDelMes");
        if (err) return err;
        const cs = g.__casos as number[][];
        const got = v as unknown[];
        if (got.every((r) => r === undefined)) return "diasDelMes devuelve undefined: te falta el return.";
        for (let k = 0; k < cs.length; k++) {
          const [m, a] = cs[k];
          const want = diasMes(m, a);
          const r = got[k];
          if (r === want) continue;
          if (m === 12 && r === undefined)
            return "diasDelMes(12, ...) dio undefined. Las listas empiezan en 0: diciembre está en la posición 11. Usa lista[mes - 1].";
          if (r === DIAS[m % 12])
            return `diasDelMes(${m}, ${a}) dio ${r}: leíste el mes siguiente. Enero está en la posición 0, así que usa lista[mes - 1].`;
          if (m === 2 && r === 28 && want === 29)
            return `Febrero de ${a} tiene 29 días y te dio 28. Pregunta esBisiesto(anio) cuando el mes sea 2.`;
          if (m === 2 && r === 29 && want === 28)
            return `Febrero de ${a} tiene 28 días y te dio 29. Solo es 29 si esBisiesto(anio) es true.`;
          return `diasDelMes(${m}, ${a}) dio ${show(r)} y debía ser ${want}.`;
        }
        return null;
      }, "Treinta días trae noviembre, y la máquina ya se lo sabe."),
    hints: [
      "Crea la lista dentro de la función: const dias = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];",
      "Antes de leer la lista, pregunta: if (mes === 2 && esBisiesto(anio)) { return 29; }. Si no, return dias[mes - 1];",
      "function diasDelMes(mes, anio) {\n  const dias = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n  if (mes === 2 && esBisiesto(anio)) {\n    return 29;\n  }\n  return dias[mes - 1];\n}",
    ],
    debrief: [
      { who: "wilson", text: "Mi mamá estaría contenta. Aunque ella nunca confió en las calculadoras.", mood: "alegre" },
      { who: "beatriz", text: "Wilson, cuéntele lo de los intereses. Ese es el que más miedo da.", mood: "serio" },
    ],
  },
  {
    id: "mn7",
    act: 2,
    giver: "beatriz",
    title: "Días entre fechas",
    concept: "Date.UTC",
    briefing: [
      { who: "beatriz", text: "El interés de un CDT se paga por los días que el dinero estuvo quieto. Del último pago hasta el corte." },
      { who: "beatriz", text: "Si el sistema cree que el corte es en 1900, salen menos treinta y seis mil días. Imagínese el extracto." },
      { who: "beatriz", text: "JavaScript trae un reloj propio. Úselo para contar los días bien, mijo." },
    ],
    lesson: {
      title: "Contar días con Date.UTC",
      body: "`Date.UTC(anio, mes, dia)` devuelve los milisegundos que han pasado desde 1970 hasta ese día. Ojo: ahí los meses empiezan en 0 (enero es 0, diciembre es 11), así que se pasa `mes - 1`. Si restas dos fechas y divides entre 86400000 (los milisegundos de un día) obtienes los días entre ellas.",
      example: "const unDia = 1000 * 60 * 60 * 24;\nconst ida = Date.UTC(1999, 6, 20);   // 20 de julio\nconst vuelta = Date.UTC(1999, 7, 7); // 7 de agosto\nconsole.log((vuelta - ida) / unDia); // 18",
    },
    task: "Escribe la función `diasEntre(a, b)` que recibe dos fechas como objetos `{ dia, mes, anio }` (con `mes` de 1 a 12 y `anio` de cuatro cifras) y devuelve cuántos días hay de `a` a `b`, usando `Date.UTC`.",
    starter: START,
    borrowed: [],
    probe: "typeof diasEntre === 'function' ? __casos.map((p) => diasEntre(p[0], p[1])) : null",
    cases: [
      {
        label: "CDT de noviembre",
        globals: () => ({
          __casos: [
            [{ dia: 15, mes: 11, anio: 1999 }, { dia: 31, mes: 12, anio: 1999 }],
            [{ dia: 31, mes: 12, anio: 1999 }, { dia: 1, mes: 1, anio: 2000 }],
            [{ dia: 1, mes: 2, anio: 2000 }, { dia: 1, mes: 3, anio: 2000 }],
          ],
        }),
      },
      {
        label: "CDT de diciembre",
        globals: () => ({
          __casos: [
            [{ dia: 1, mes: 12, anio: 1999 }, { dia: 31, mes: 12, anio: 1999 }],
            [{ dia: 28, mes: 2, anio: 2000 }, { dia: 1, mes: 3, anio: 2000 }],
            [{ dia: 15, mes: 1, anio: 2000 }, { dia: 15, mes: 2, anio: 2000 }],
          ],
        }),
      },
    ],
    capture: [],
    check: (outs, cases) =>
      every(outs, cases, (o, g) => {
        const { err, v } = probeOf(o, "diasEntre");
        if (err) return err;
        const ps = g.__casos as Fecha[][];
        const got = v as unknown[];
        if (got.every((r) => r === undefined)) return "diasEntre devuelve undefined: te falta el return.";
        const sinMenos = ps.map(([a, b]) => (Date.UTC(b.anio, b.mes, b.dia) - Date.UTC(a.anio, a.mes, a.dia)) / 86400000);
        if (same(got, sinMenos) && !same(got, ps.map(([a, b]) => entre(a, b))))
          return "Los días salen corridos un mes. En Date.UTC los meses empiezan en 0: pasa mes - 1.";
        for (let k = 0; k < ps.length; k++) {
          const [a, b] = ps[k];
          const want = entre(a, b);
          const r = got[k];
          if (r === want) continue;
          const txt = `del ${a.dia}/${a.mes}/${a.anio} al ${b.dia}/${b.mes}/${b.anio}`;
          if (r === want * 86400000) return `Te dio ${r}: son milisegundos. Divide la resta entre 86400000, los milisegundos de un día.`;
          if (r === -want) return `Te dio ${r}: restaste al revés. Es la fecha b menos la fecha a.`;
          if (typeof r === "number" && Math.abs(r - want) < 0.1)
            return `Te dio ${r}, con decimales. Usa Date.UTC y no new Date: así la hora local no se mete en la cuenta.`;
          return `${txt} te dio ${show(r)} y son ${want} días.`;
        }
        return null;
      }, "Del 1 al 29 de febrero, 29 días. El reloj de JavaScript sí sabe del bisiesto."),
    hints: [
      "Convierte cada fecha: Date.UTC(a.anio, a.mes - 1, a.dia). Los meses de Date.UTC empiezan en 0.",
      "Resta la de b menos la de a y divide entre 1000 * 60 * 60 * 24.",
      "function diasEntre(a, b) {\n  const inicio = Date.UTC(a.anio, a.mes - 1, a.dia);\n  const fin = Date.UTC(b.anio, b.mes - 1, b.dia);\n  return (fin - inicio) / (1000 * 60 * 60 * 24);\n}",
    ],
    debrief: [
      { who: "camilo", text: "¿Por qué los meses empiezan en cero y los días en uno? ¿Quién decidió eso?", mood: "sorpresa" },
      { who: "wilson", text: "Alguien con prisa, como siempre. Yo por lo menos ponía un comentario.", mood: "alegre" },
    ],
  },
  {
    id: "mn8",
    act: 2,
    giver: "wilson",
    title: "Intereses del día",
    concept: "toFixed",
    briefing: [
      { who: "wilson", text: "Ahora la plata. El interés del día es saldo por tasa anual, entre cien, entre 365, por los días." },
      { who: "wilson", text: "Y se imprime con dos decimales. En el banco nadie confía en un número con quince decimales." },
      { who: "wilson", text: "Y si los días salen negativos, que es lo que pasa con lo de 1900, no se paga nada. Cero." },
    ],
    lesson: {
      title: "Redondear para imprimir",
      body: "Las cuentas con decimales dan números largos, como 1234.5678901. `numero.toFixed(2)` lo redondea a dos decimales y lo devuelve como texto: \"1234.57\". Es para mostrar o imprimir, no para seguir sumando. `(0).toFixed(2)` da \"0.00\".",
      example: "let galones = 12.3456;\nconsole.log(galones.toFixed(2)); // 12.35\nconsole.log((10 / 3).toFixed(1)); // 3.3",
    },
    task: "Escribe la función `interes(saldo, tasa, dias)` que devuelve el texto con dos decimales de `saldo * tasa / 100 / 365 * dias`, usando `toFixed(2)`. Si `dias` es negativo, devuelve \"0.00\".",
    starter: START,
    borrowed: [],
    probe: "typeof interes === 'function' ? __casos.map((c) => interes(c[0], c[1], c[2])) : null",
    cases: [
      { label: "CDT de doña Gloria", globals: () => ({ __casos: [[1500000, 24, 30], [850000, 18, 1], [2000000, 30, -36500]] }) },
      { label: "CDT de la cooperativa", globals: () => ({ __casos: [[3200000, 22, 46], [120000, 12, 15], [500000, 24, -36524]] }) },
    ],
    capture: [],
    check: (outs, cases) =>
      every(outs, cases, (o, g) => {
        const { err, v } = probeOf(o, "interes");
        if (err) return err;
        const cs = g.__casos as number[][];
        const got = v as unknown[];
        if (got.every((r) => r === undefined)) return "interes devuelve undefined: te falta el return.";
        for (let k = 0; k < cs.length; k++) {
          const [s, t, d] = cs[k];
          const want = interesRef(s, t, d);
          const r = got[k];
          if (r === want) continue;
          if (d < 0) return `Con ${d} días (el error de 1900) devolviste ${show(r)}. Si dias es negativo, devuelve "0.00".`;
          if (typeof r === "number")
            return `interes(${s}, ${t}, ${d}) devolvió el número ${r}. Usa toFixed(2) para dejarlo como texto con dos decimales.`;
          if (typeof r === "string" && Math.abs(Number(r) - Number(want)) < 0.011) continue;
          if (typeof r === "string" && Math.abs(Number(r) - Number(want) * 100) < 1.5)
            return `interes(${s}, ${t}, ${d}) dio ${r}: cien veces más. La tasa viene en por ciento, divídela entre 100.`;
          return `interes(${s}, ${t}, ${d}) dio ${show(r)} y debía ser "${want}".`;
        }
        return null;
      }, "Dos decimales y nada de intereses negativos. Wilson asiente, que en él es mucho."),
    hints: [
      "Primero el caso raro: if (dias < 0) { return \"0.00\"; }",
      "Después calcula const valor = saldo * tasa / 100 / 365 * dias; y devuelve valor.toFixed(2).",
      "function interes(saldo, tasa, dias) {\n  if (dias < 0) {\n    return \"0.00\";\n  }\n  const valor = saldo * tasa / 100 / 365 * dias;\n  return valor.toFixed(2);\n}",
    ],
    debrief: [
      { who: "wilson", text: "Le voy a decir algo, pelado. Esto lo habría tardado yo una semana con las tarjetas." },
      { who: "beatriz", text: "No se acostumbre a los elogios, Camilo. Él los da una vez por década.", mood: "alegre" },
    ],
  },

  // ===================== ACTO 3: MEDIANOCHE =====================
  {
    id: "mn9",
    act: 3,
    giver: "beatriz",
    title: "Probar antes",
    concept: "Pruebas",
    briefing: [
      { who: "beatriz", text: "Wilson dice que ya arregló su rutina de años. Yo no firmo nada que no se haya probado." },
      { who: "beatriz", text: "Le dejé rutinaWilson y una lista casos, cada uno con la entrada y lo que debería dar. Cuénteme cuántos fallan." },
    ],
    lesson: {
      title: "Probar con casos esperados",
      body: "Probar es comparar lo que da una función con lo que debería dar. Se arma una lista de casos `{ entrada, esperado }`, se recorre y se cuenta cada vez que el resultado es distinto (`!==`) de lo esperado. Si la cuenta da 0, la función pasó todas las pruebas.",
      example: "function doble(n) { return n * 2; }\nconst pruebas = [{ entrada: 2, esperado: 4 }, { entrada: 5, esperado: 11 }];\nlet malas = 0;\nfor (const p of pruebas) {\n  if (doble(p.entrada) !== p.esperado) malas++;\n}\nconsole.log(malas); // 1",
    },
    task: "Escribe la función `probar(casos)` que llama a `rutinaWilson(c.entrada)` con cada caso y devuelve cuántos dan distinto de `c.esperado`. Luego muestra `probar(casos)` con `console.log`.",
    starter: START,
    borrowed: ["rutinaWilson(aa): la rutina de años de Wilson", "casos"],
    probe: "typeof probar === 'function' ? probar(casos) : null",
    cases: [
      { label: "la rutina de siempre", globals: () => ({ rutinaWilson: rutinaVieja, casos: CASOS_A.map((c) => ({ ...c })) }) },
      { label: "la rutina parchada", globals: () => ({ rutinaWilson: rutinaParche, casos: CASOS_B.map((c) => ({ ...c })) }) },
    ],
    capture: [],
    check: (outs, cases) =>
      every(outs, cases, (o, g, i) => {
        const { err, v } = probeOf(o, "probar");
        if (err) return err;
        const cs = g.casos as { entrada: number; esperado: number }[];
        const fn = i === 0 ? rutinaVieja : rutinaParche;
        const want = fallosDe(fn, cs);
        if (v === undefined) return "probar devuelve undefined: te falta el return con la cuenta.";
        if (v === cs.length - want && v !== want)
          return `probar dio ${show(v)}: contaste los casos que pasan. Suma solo cuando el resultado es distinto (!==) de lo esperado.`;
        if (v !== want) {
          if (i > 0) return `Con ${cases[i].label}, probar dio ${show(v)} y fallan ${want}. ¿Escribiste el número a mano?`;
          return `probar dio ${show(v)} y fallan ${want} casos.`;
        }
        if (!printed(o, String(want))) return "La función cuenta bien. Falta mostrar el resultado: console.log(probar(casos)).";
        return null;
      }, "Tres fallos en la vieja, uno en la parchada. Los números no mienten, Wilson."),
    hints: [
      "Dentro de probar, empieza con let fallos = 0; y recorre casos con for (const c of casos).",
      "En cada vuelta: if (rutinaWilson(c.entrada) !== c.esperado) { fallos++; }. Al final, return fallos;",
      "function probar(casos) {\n  let fallos = 0;\n  for (const c of casos) {\n    if (rutinaWilson(c.entrada) !== c.esperado) {\n      fallos++;\n    }\n  }\n  return fallos;\n}\nconsole.log(probar(casos));",
    ],
    debrief: [
      { who: "wilson", text: "Puse menor que en vez de menor o igual. El 49 se me fue a 1949.", mood: "serio" },
      { who: "wilson", text: "Treinta años programando y me pilla un practicante con una lista de casos. Bueno. Lo arreglo." },
    ],
  },
  {
    id: "mn10",
    act: 3,
    giver: "wilson",
    title: "El lote sucio",
    concept: "try, catch y throw",
    briefing: [
      { who: "wilson", text: "Hoy es 31. A las seis llegó el lote de las sucursales, digitado a mano. Mire esto: \"3l/12/99\", con ele." },
      { who: "wilson", text: "Si una fecha mala tumba el proceso, se cae todo el lote. Las malas se apartan y las buenas siguen." },
    ],
    lesson: {
      title: "Lanzar y atrapar errores",
      body: "`throw new Error(\"mensaje\")` detiene la función y avisa que algo salió mal. Quien la llama puede atrapar ese aviso con `try { ... } catch (e) { ... }`: si algo lanza un error dentro del `try`, el programa salta al `catch` y sigue. `Number.isNaN(x)` dice si `x` no es un número válido, como `Number(\"3l\")`.",
      example: 'function raiz(n) {\n  if (n < 0) throw new Error("Negativo: " + n);\n  return Math.sqrt(n);\n}\ntry {\n  raiz(-4);\n} catch (e) {\n  console.log(e.message); // Negativo: -4\n}',
    },
    task: "Escribe `leerFecha(texto)`: si `texto.split(\"/\")` no da 3 pedazos, o alguno con `Number` da `NaN`, lanza `new Error(\"Fecha mala: \" + texto)`; si no, devuelve `clave(texto)`. Después recorre `lote` con `try`/`catch` y cuenta en `buenas` y `malas`. Muestra `console.log(buenas, malas)`.",
    starter: "let buenas = 0;\nlet malas = 0;\n// Escribe tu código debajo de esta línea\n",
    borrowed: ["clave(texto): la función de la misión 4", "lote"],
    probe: "typeof leerFecha === 'function' ? [(() => { try { leerFecha('ab/cd/ef'); return 'no lanzó'; } catch (e) { return 'lanzó'; } })(), (() => { try { leerFecha('311299'); return 'no lanzó'; } catch (e) { return 'lanzó'; } })(), leerFecha('05/01/00')] : null",
    cases: [
      { label: "lote de Chapinero", globals: () => ({ clave: claveRef, lote: [...LOTE_A] }) },
      { label: "lote de Kennedy", globals: () => ({ clave: claveRef, lote: [...LOTE_B] }) },
    ],
    capture: ["buenas", "malas"],
    check: (outs, cases) =>
      every(outs, cases, (o, g, i) => {
        const { err, v } = probeOf(o, "leerFecha");
        if (err) return err;
        const p = v as unknown[];
        if (p[0] !== "lanzó") return "leerFecha(\"ab/cd/ef\") no lanzó ningún error. Si algún pedazo da NaN, usa throw new Error(\"Fecha mala: \" + texto).";
        if (p[1] !== "lanzó") return "leerFecha(\"311299\") no lanzó ningún error. Si split(\"/\") no da 3 pedazos, también es una fecha mala.";
        if (p[2] !== 20000105) return `leerFecha("05/01/00") devolvió ${show(p[2])}. Cuando la fecha es buena, devuelve clave(texto).`;
        const want = contarLote(g.lote as string[]);
        if (o.values.buenas !== want.buenas || o.values.malas !== want.malas) {
          if (i > 0) return `Con ${cases[i].label} contaste ${show(o.values.buenas)} buenas y ${show(o.values.malas)} malas, y son ${want.buenas} y ${want.malas}. ¿Recorres lote?`;
          return `Contaste ${show(o.values.buenas)} buenas y ${show(o.values.malas)} malas, y son ${want.buenas} y ${want.malas}. Suma buenas dentro del try y malas dentro del catch.`;
        }
        if (!printed(o, `${want.buenas} ${want.malas}`)) return "La cuenta está bien. Falta mostrarla: console.log(buenas, malas).";
        return null;
      }, "Las malas, a un lado. Las buenas, adelante. El lote no se cayó."),
    hints: [
      "En leerFecha: const partes = texto.split(\"/\"); y luego if (partes.length !== 3) throw new Error(\"Fecha mala: \" + texto);",
      "Revisa cada pedazo con for (const p of partes) { if (Number.isNaN(Number(p))) throw ... }. Para el lote: for (const t of lote) { try { leerFecha(t); buenas++; } catch (e) { malas++; } }",
      "let buenas = 0;\nlet malas = 0;\nfunction leerFecha(texto) {\n  const partes = texto.split(\"/\");\n  if (partes.length !== 3) {\n    throw new Error(\"Fecha mala: \" + texto);\n  }\n  for (const p of partes) {\n    if (Number.isNaN(Number(p))) {\n      throw new Error(\"Fecha mala: \" + texto);\n    }\n  }\n  return clave(texto);\n}\nfor (const t of lote) {\n  try {\n    leerFecha(t);\n    buenas++;\n  } catch (e) {\n    malas++;\n  }\n}\nconsole.log(buenas, malas);",
    ],
    debrief: [
      { who: "wilson", text: "En el ochenta y nueve un lote así me tumbó la nómina entera. La gente cobró el 3 de enero. Todavía me lo recuerdan.", mood: "serio" },
      { who: "camilo", text: "Esta vez nadie se queda sin aguinaldo, don Wilson.", mood: "alegre" },
    ],
  },
  {
    id: "mn11",
    act: 3,
    giver: "beatriz",
    title: "En orden",
    concept: "sort con comparador",
    briefing: [
      { who: "beatriz", text: "Son las diez de la noche. Los movimientos de la última semana llegaron revueltos y el extracto los quiere en orden." },
      { who: "beatriz", text: "Del más viejo al más nuevo. Y ojo, mijo: ya sabe lo que pasa si los ordena como texto." },
    ],
    lesson: {
      title: "Ordenar con sort",
      body: "`lista.sort((a, b) => ...)` ordena la lista. La flecha compara dos elementos: si devuelve un número negativo, `a` va primero; si es positivo, `b` va primero. Con números basta `a - b` para ordenar de menor a mayor. `sort` cambia la lista original y además la devuelve.",
      example: 'let pedidos = [{ mesa: 4, hora: 1930 }, { mesa: 2, hora: 1845 }];\npedidos.sort((a, b) => a.hora - b.hora);\nconsole.log(pedidos[0].mesa); // 2',
    },
    task: "Crea `ordenados` con `movimientos` ordenados de la fecha más antigua a la más nueva, comparando `clave(a.fecha) - clave(b.fecha)` dentro de `sort`. Muestra `ordenados[0].fecha`.",
    starter: START,
    borrowed: ["clave(texto): la función de la misión 4", "movimientos"],
    cases: [
      { label: "semana de Navidad", globals: () => ({ clave: claveRef, movimientos: MOV_A.map((m) => ({ ...m })) }) },
      { label: "semana de Año Nuevo", globals: () => ({ clave: claveRef, movimientos: MOV_B.map((m) => ({ ...m })) }) },
    ],
    capture: ["ordenados"],
    check: (outs, cases) =>
      every(outs, cases, (o, g) => {
        const movs = g.movimientos as Mov[];
        const want = [...movs].sort((a, b) => claveRef(a.fecha) - claveRef(b.fecha));
        const v = o.values.ordenados;
        if (v === undefined) return "Falta la variable ordenados.";
        if (!Array.isArray(v)) return `ordenados debe ser una lista, y vale ${show(v)}.`;
        if (same(v, want)) {
          if (!printed(o, want[0].fecha)) return "El orden está bien. Falta mostrar console.log(ordenados[0].fecha).";
          return null;
        }
        if (same(v, [...want].reverse())) return "Quedaron al revés: del más nuevo al más viejo. Usa clave(a.fecha) - clave(b.fecha), en ese orden.";
        if (same(v, movs)) return "La lista quedó igual. Sin comparador, sort no sabe ordenar objetos: pásale (a, b) => clave(a.fecha) - clave(b.fecha).";
        const comoTexto = [...movs].sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));
        if (same(v, comoTexto)) return `Los ordenaste como texto y "${comoTexto[0].fecha}" quedó primero. Compara con clave(...), que convierte la fecha en número.`;
        return `El primero quedó ${show((v[0] as Mov | undefined)?.fecha)} y debía ser "${want[0].fecha}".`;
      }, "Del 15 de diciembre al 2 de enero, en su sitio. El extracto ya se puede imprimir."),
    hints: [
      "La flecha de sort recibe dos movimientos, a y b. Compara sus fechas convertidas: clave(a.fecha) y clave(b.fecha).",
      "const ordenados = movimientos.sort((a, b) => clave(a.fecha) - clave(b.fecha));",
      "const ordenados = movimientos.sort((a, b) => clave(a.fecha) - clave(b.fecha));\nconsole.log(ordenados[0].fecha);",
    ],
    debrief: [
      { who: "narrador", text: "En la sala de cómputo hace frío. Afuera llueve y en el radio de Wilson ya empezaron a contar las horas." },
      { who: "beatriz", text: "Falta una sola cosa, Camilo. La corrida del cierre. Y esa no se puede repetir.", mood: "serio" },
    ],
  },
  {
    id: "mn12",
    act: 3,
    giver: "beatriz",
    title: "La corrida de las 23:59",
    concept: "Todo junto",
    briefing: [
      { who: "beatriz", text: "Son las 23:59. Esta es la corrida del cierre: todas las cuentas, con su saldo y su fecha de vencimiento." },
      { who: "beatriz", text: "Necesito el total de lo que se puede leer, cuántas vencen hasta el corte y cuántas fechas vienen malas." },
      { who: "wilson", text: "Las malas no se suman, joven. Esas se revisan el lunes con calma.", mood: "serio" },
    ],
    lesson: {
      title: "Una corrida completa",
      body: "Un cierre junta todo: recorrer una lista, convertir y validar cada dato, atrapar los errores sin detener el lote, sumar y contar. Un objeto como `{ total, vencidas, errores }` sirve para devolver varios resultados juntos. Escribir `{ total, vencidas }` es lo mismo que `{ total: total, vencidas: vencidas }`.",
      example: 'function resumen(notas) {\n  let suma = 0;\n  let perdidas = 0;\n  for (const n of notas) {\n    suma += n;\n    if (n < 3) perdidas++;\n  }\n  return { suma, perdidas };\n}\nconsole.log(resumen([4, 2.5, 5])); // {"suma":11.5,"perdidas":1}',
    },
    task: "Escribe `cierre(cuentas)` que devuelve `{ total, vencidas, errores }`. Para cada cuenta, dentro de un `try`: `leerFecha(c.vence)` (lanza un error si la fecha es mala); si no lanza, suma `c.saldo` a `total` y, si la fecha es menor o igual a `corte`, suma 1 a `vencidas`. En el `catch`, suma 1 a `errores`. Muestra `cierre(cuentas)`.",
    starter: START,
    borrowed: ["leerFecha(texto): devuelve AAAAMMDD o lanza un error", "corte", "cuentas"],
    probe: "typeof cierre === 'function' ? cierre(cuentas) : null",
    cases: [
      { label: "sucursal Chapinero", globals: () => ({ leerFecha: leerFechaRef, corte: CORTE, cuentas: CUENTAS_A.map((c) => ({ ...c })) }) },
      { label: "sucursal Kennedy", globals: () => ({ leerFecha: leerFechaRef, corte: CORTE, cuentas: CUENTAS_B.map((c) => ({ ...c })) }) },
    ],
    capture: [],
    check: (outs, cases) =>
      every(outs, cases, (o, g, i) => {
        const { err, v } = probeOf(o, "cierre");
        if (err) return err;
        const cs = g.cuentas as Cuenta[];
        const want = cierreRef(cs, CORTE);
        if (v === undefined) return "cierre devuelve undefined: te falta el return con el objeto { total, vencidas, errores }.";
        if (typeof v !== "object" || Array.isArray(v)) return `cierre debe devolver un objeto { total, vencidas, errores }, y devolvió ${show(v)}.`;
        const r = v as Record<string, unknown>;
        for (const k of ["total", "vencidas", "errores"]) if (!(k in r)) return `Al objeto que devuelve cierre le falta ${k}.`;
        const todo = cs.reduce((s, c) => s + c.saldo, 0);
        if (r.total === todo && want.total !== todo)
          return `total da ${todo}: sumaste también las cuentas con fecha mala. Suma el saldo después de leerFecha, dentro del try.`;
        if (r.total !== want.total) {
          if (i > 0) return `Con ${cases[i].label}, total da ${show(r.total)} y debía ser ${want.total}. ¿Lo escribiste a mano?`;
          return `total da ${show(r.total)} y debía ser ${want.total}.`;
        }
        if (r.errores !== want.errores) return `errores da ${show(r.errores)} y son ${want.errores}. Suma 1 en el catch.`;
        if (r.vencidas !== want.vencidas) {
          const menor = cs.filter((c) => { try { return leerFechaRef(c.vence) < CORTE; } catch { return false; } }).length;
          if (r.vencidas === menor)
            return `vencidas da ${menor}: te faltan las que vencen justo el 31 de diciembre. Es menor o igual: <= corte.`;
          return `vencidas da ${show(r.vencidas)} y son ${want.vencidas}. Compara lo que devuelve leerFecha con corte.`;
        }
        if (!o.logs.some((l) => l.includes(`"total":${want.total}`))) return "El cierre cuadra. Falta mostrarlo: console.log(cierre(cuentas)).";
        return null;
      }, "Total, vencidas y errores. 23:59:59. El cierre cuadra."),
    hints: [
      "Empieza con let total = 0; let vencidas = 0; let errores = 0; y recorre cuentas con for (const c of cuentas).",
      "Dentro del for: try { const v = leerFecha(c.vence); total += c.saldo; if (v <= corte) vencidas++; } catch (e) { errores++; }. Al final, return { total, vencidas, errores };",
      "function cierre(cuentas) {\n  let total = 0;\n  let vencidas = 0;\n  let errores = 0;\n  for (const c of cuentas) {\n    try {\n      const v = leerFecha(c.vence);\n      total += c.saldo;\n      if (v <= corte) {\n        vencidas++;\n      }\n    } catch (e) {\n      errores++;\n    }\n  }\n  return { total, vencidas, errores };\n}\nconsole.log(cierre(cuentas));",
    ],
    debrief: [
      { who: "sistema", text: "CIERRE 31/12/1999 ... OK. FECHA DEL SISTEMA: 01/01/2000 00:00:00." },
      { who: "camilo", text: "Dice 2000. Dos mil. No mil novecientos.", mood: "sorpresa" },
    ],
  },
];

export const CONTENT: StoryContent = {
  intro: [
    { who: "narrador", text: "Bogotá, diciembre de 1999. Llueve todas las tardes, suenan villancicos en el centro y todo el mundo habla del fin del milenio." },
    { who: "narrador", text: "En el sótano del Banco Cafetero del Sur, la sala de cómputo está a dieciocho grados y huele a tinto recalentado." },
    { who: "narrador", text: "Los programas del banco guardan los años con dos cifras. \"99\" es 1999. Y cuando el reloj pase a \"00\", creerán que es 1900." },
    { who: "beatriz", text: "Intereses negativos, cuentas vencidas hace un siglo, cajeros que no dan plata. Eso es lo que nos espera si no hacemos nada.", mood: "serio" },
    { who: "camilo", text: "A mí me contrataron para el inventario de diciembre. Contar monitores, más que todo.", mood: "sorpresa" },
    { who: "beatriz", text: "Los monitores pueden esperar, mijo. Tómese ese tinto y siéntese. Tenemos hasta la medianoche del 31." },
  ],
  acts: [
    {
      n: 1,
      title: "Dos cifras",
      date: "Lunes 13 de diciembre de 1999",
      opening: [
        { who: "narrador", text: "Faltan dieciocho días. En la sala de cómputo, Doña Beatriz pega en la pared un calendario con los días tachados en rojo." },
        { who: "narrador", text: "Wilson, que escribió media aplicación en los ochenta, mira al practicante nuevo por encima de las gafas." },
      ],
    },
    {
      n: 2,
      title: "Bisiesto",
      date: "Lunes 20 de diciembre de 1999",
      opening: [
        { who: "narrador", text: "Faltan once días. Ya llegó la prima de diciembre y en la oficina rezan la novena a las cinco, con natilla y buñuelos." },
        { who: "narrador", text: "Las fechas ya se leen bien. Ahora toca contar días, y los días tienen trampas." },
      ],
    },
    {
      n: 3,
      title: "Medianoche",
      date: "Viernes 31 de diciembre de 1999",
      opening: [
        { who: "narrador", text: "El último día del milenio. Media ciudad salió para tierra caliente. En el sótano del banco quedan tres personas y una greca." },
        { who: "narrador", text: "Lo que no se pruebe hoy no se arregla mañana. Mañana ya es 2000." },
      ],
    },
  ],
  missions,
  ending: [
    { who: "narrador", text: "Afuera estallan los voladores. En el radio, la cuenta regresiva llega a cero y los relojes de la sala pasan a 00." },
    { who: "narrador", text: "Los cajeros siguen dando plata. Los intereses salen positivos. Nadie llama. Nada se rompe." },
    { who: "beatriz", text: "Mañana los periódicos van a decir que el efecto 2000 fue puro cuento. Que no pasó nada.", mood: "alegre" },
    { who: "beatriz", text: "Y no pasó nada porque ustedes trabajaron. Así se ve el éxito en sistemas, mijo: nadie se entera." },
    { who: "wilson", text: "Tome, pelado. Esta taza me acompañó desde la primera tarjeta perforada. Ya no la necesito.", mood: "normal" },
    { who: "camilo", text: "Don Wilson... ¿y usted en qué se va a tomar el tinto?", mood: "sorpresa" },
    { who: "wilson", text: "En una nueva. Año nuevo, taza nueva. Usted me enseñó que las cosas viejas también se prueban.", mood: "alegre" },
    { who: "narrador", text: "Partir fechas, adivinar siglos, contar días, probar antes de confiar. Camilo vino a contar monitores y aprendió a cuidar el tiempo." },
  ],
};
