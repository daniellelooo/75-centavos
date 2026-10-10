// Código Cuervo: Inglaterra, invierno de 1941. Iris, ganadora de un concurso de
// crucigramas, descifra en Hawthorn Hall los mensajes de la red Cuervo con una
// máquina de cálculo que solo entiende JavaScript. Personajes y lugares ficticios.
// Acto 1: textos letra a letra y el César. Acto 2: frecuencias con objetos.
// Acto 3: claves de varias letras y fuerza bruta con una palabra conocida (cuna).
import type { StoryContent, StoryMission } from "../types";
import type { CheckResult, TestCase } from "../../game/types";
import type { RunOutput } from "../../game/sandbox";
import { printed, probeErr, same, show } from "../../game/acts/util";

// ---------- Referencias para generar datos y corregir ----------

export const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/** César hacia delante: cada letra avanza `s` puestos; lo demás se copia. */
export const cesar = (t: string, s: number) =>
  [...t].map((c) => {
    const p = ALFABETO.indexOf(c);
    return p < 0 ? c : ALFABETO[(((p + s) % 26) + 26) % 26];
  }).join("");

export const descesar = (t: string, s: number) => cesar(t, -s);

/** Clave de varias letras. `dir` 1 cifra, -1 descifra. Con `gastaEspacios`, la clave avanza también en los espacios (error típico). */
export const vig = (t: string, clave: string, dir: 1 | -1, gastaEspacios = false) => {
  let j = 0;
  let out = "";
  for (const c of t) {
    const p = ALFABETO.indexOf(c);
    if (p < 0) {
      out += c;
      if (gastaEspacios) j++;
      continue;
    }
    const k = ALFABETO.indexOf(clave[j % clave.length]);
    out += ALFABETO[(((p + dir * k) % 26) + 26) % 26];
    j++;
  }
  return out;
};

export const contarLetras = (t: string) => {
  const c: Record<string, number> = {};
  for (const ch of t) if (ch !== " ") c[ch] = (c[ch] || 0) + 1;
  return c;
};

const masAlta = (c: Record<string, number>) => Object.keys(c).reduce((a, b) => (c[b] > c[a] ? b : a));

// ---------- Ayudas de corrección ----------

const ok = (feedback: string): CheckResult => ({ pass: true, feedback });
const no = (feedback: string): CheckResult => ({ pass: false, feedback });

/** Recorre los casos: el primero que falle devuelve su mensaje. */
const porCaso = (
  outs: RunOutput[],
  cases: TestCase[],
  one: (o: RunOutput, g: Record<string, unknown>, i: number) => string | null,
  win: string,
): CheckResult => {
  for (let i = 0; i < outs.length; i++) {
    const o = outs[i];
    if (o.error) return no(`Error: ${o.error.message}`);
    const msg = one(o, cases[i].globals(), i);
    if (msg) return no(msg);
  }
  return ok(win);
};

/** Mensajes comunes cuando el probe llama a una función del jugador. */
const sinFuncion = (o: RunOutput, nombre: string, firma: string): string | null => {
  const p = o.values.__probe;
  if (p === "__nofn") return `No encuentro la función ${nombre}. Escríbela así: function ${nombre}(${firma}) { ... }`;
  const err = probeErr(o);
  if (err) return `Al llamar a ${nombre} hubo un error: ${err}`;
  if (Array.isArray(p) && p.every((x) => x === undefined))
    return `${nombre} no devuelve nada. Usa return para entregar el resultado; console.log solo lo enseña en pantalla.`;
  return null;
};

const START = "// Escribe tu código debajo de esta línea\n";

// ---------- Datos de los casos ----------

const C1 = [cesar("TRES BARCOS SALEN AL ALBA", 3), cesar("NIEBLA EN EL CANAL DEL NORTE", 7)];

const C2 = [
  "parte del tiempo: mar en calma, el convoy sale al alba",
  "niebla cerrada en el canal, ningun barco a la vista",
];

const C4 = [
  { plano: "EL CONVOY SALE A LAS SEIS", salto: 5 },
  { plano: "LA NIEBLA CUBRE EL CANAL", salto: 22 },
];

const C5 = [cesar("EL CONVOY ESPERA EN EL ESTE", 13), cesar("TRES BARCOS SALEN DE NOCHE", 4)];

const C6 = [
  cesar("ESTE MENSAJE ES DE ESE CUERVO QUE SE CREE TAN LISTO", 13),
  cesar("EL PUENTE DE MANDO ENVIA ESTE PARTE SIEMPRE", 8),
];

const C7: Record<string, number>[] = [
  { R: 9, E: 2, G: 6, B: 4, F: 5, N: 3, V: 1, Q: 7 },
  { M: 8, A: 11, W: 3, Q: 5, Z: 1, I: 6 },
];

const C8 = ["PUERTO AL VUELVE CONVOY EL", "NORTE AL RUMBO SIGUEN BARCOS TRES"];

const C9 = ["GRAJO", "MIRLO"];

const C10 = [
  { plano: "EL CONVOY DEL NORTE ESPERA EN EL PUERTO", clave: "GRAJO" },
  { plano: "CAMBIO DE RUTA AL AMANECER", clave: "MIRLO" },
];
const C10_FIJO = { plano: "TE CON LIMON", clave: "LUZ" };

const C11 = [
  { plano: "PARTE DEL TIEMPO VIENTO DEL OESTE", salto: 9, cuna: "TIEMPO" },
  { plano: "EL TIEMPO EMPEORA AL ANOCHECER", salto: 25, cuna: "TIEMPO" },
];

const C12 = [
  {
    plano: "EL CONVOY SERA ESPERADO EN LA ROCA NEGRA AL AMANECER",
    clave: "CORMORAN",
    claves: ["GRAJO", "MIRLO", "GARZA", "ALCAUDON", "CORMORAN", "VENCEJO"],
  },
  {
    plano: "LOS BARCOS ESPERAN AL CONVOY JUNTO A LAS ISLAS GEMELAS",
    clave: "GARZA",
    claves: ["VENCEJO", "ALCAUDON", "GARZA", "MIRLO"],
  },
];
const C12_NINGUNA = ["PALOMA", "GORRION"];

// Funciones que la máquina presta ya hechas (las de misiones anteriores).
const moverLetraHecha = (letra: string, salto: number) => ALFABETO[(ALFABETO.indexOf(letra) + salto) % 26];
const saltosHecha = (clave: string) => [...clave].map((c) => ALFABETO.indexOf(c));
const contarHecha = (texto: string) => contarLetras(texto);
const descifrarHecha = (texto: string, salto: number) => descesar(texto, salto);
const descifrarClaveHecha = (texto: string, clave: string) => vig(texto, clave, -1);

// ---------- Misiones ----------

const MISSIONS: StoryMission[] = [
  // ===================== ACTO 1: LETRAS =====================
  {
    id: "cc1",
    act: 1,
    giver: "hale",
    title: "Contar letras",
    concept: "length y texto[i]",
    briefing: [
      { who: "hale", text: "Ha llegado el primer mensaje de la noche. Antes de nada necesito saber cuánto mide. Las letras, no los espacios.", mood: "serio" },
      { who: "penrose", text: "El comandante cree que lo que tarda un descifrado depende de las letras. Tiene razón, aunque no sepa por qué." },
      { who: "iris", text: "¿Y la máquina sabe contar letras?", mood: "sorpresa" },
      { who: "penrose", text: "La máquina sabe contar lo que usted le diga que cuente. Ahí está la gracia.", mood: "alegre" },
    ],
    lesson: {
      title: "Un texto es una fila de letras",
      body: "Un texto se recorre como un array. `texto.length` dice cuántos caracteres tiene, y los espacios también cuentan. `texto[i]` es el carácter de la posición `i`, empezando en 0. Con un `for` puedes mirarlos uno a uno y decidir qué hacer con cada uno.",
      example:
        'let pedido = "TE CON LECHE";\nconsole.log(pedido.length); // 12\nconsole.log(pedido[0]); // T\nlet es = 0;\nfor (let i = 0; i < pedido.length; i++) {\n  if (pedido[i] === "E") {\n    es++;\n  }\n}\nconsole.log(es); // 3',
    },
    task: "`mensaje` ya está cargado: un texto en mayúsculas con palabras separadas por espacios. Cuenta en la variable `letras` cuántos caracteres de `mensaje` no son un espacio (`\" \"`). Muestra `letras` con `console.log`.",
    starter: "let letras = 0;\n// recorre mensaje aquí\n\nconsole.log(letras);\n",
    borrowed: ["mensaje"],
    cases: [
      { label: "el mensaje de las diez", globals: () => ({ mensaje: C1[0] }) },
      { label: "el mensaje de medianoche", globals: () => ({ mensaje: C1[1] }) },
    ],
    capture: ["letras"],
    check: (outs, cases) =>
      porCaso(outs, cases, (o, g, i) => {
        const m = g.mensaje as string;
        const want = m.replaceAll(" ", "").length;
        const v = o.values.letras;
        if (v === undefined) return "Falta la variable letras.";
        if (v === m.length) return `Contaste también los espacios: te salen ${v} y son ${want} letras. Suma solo cuando mensaje[i] !== " ".`;
        if (i === 1 && v === C1[0].replaceAll(" ", "").length) return "Con otro mensaje tu cuenta no cambió: escribiste el número a mano.";
        if (v !== want) return `Con ${cases[i].label} contaste ${show(v)} y son ${want} letras.`;
        if (!printed(o, String(want))) return "La cuenta está bien. Falta mostrarla con console.log(letras).";
        return null;
      }, "Veintiuna letras. Hale lo apunta en su libreta como si fuera una orden."),
    hints: [
      "Recorre mensaje con un for, de 0 hasta mensaje.length. En cada vuelta, mensaje[i] es un carácter.",
      'Suma solo si no es un espacio: if (mensaje[i] !== " ") { letras++; }',
      'let letras = 0;\nfor (let i = 0; i < mensaje.length; i++) {\n  if (mensaje[i] !== " ") {\n    letras++;\n  }\n}\nconsole.log(letras);',
    ],
    debrief: [
      { who: "hale", text: "Veintiuna letras. Bien. Ahora dígame qué dicen.", mood: "serio" },
      { who: "penrose", text: "Paciencia, comandante. Primero se cuenta y luego se lee. Como con las ovejas." },
    ],
  },
  {
    id: "cc2",
    act: 1,
    giver: "penrose",
    title: "La palabra conocida",
    concept: "toUpperCase e indexOf",
    briefing: [
      { who: "penrose", text: "Un regalo: un parte del Cuervo que llegó sin cifrar. La operadora de radio lo copió en minúsculas, con prisa." },
      { who: "penrose", text: "Para la máquina, la a y la A son tan distintas como para mí el té de Ceilán y el de la India. Es decir, con mucho drama." },
      { who: "penrose", text: "Quiero saber si dice CONVOY y en qué posición. Las palabras conocidas son nuestras mejores amigas.", mood: "alegre" },
    ],
    lesson: {
      title: "Mayúsculas y buscar dentro de un texto",
      body: "`texto.toUpperCase()` devuelve el mismo texto en mayúsculas; el original no cambia. `texto.includes(\"GATO\")` responde `true` o `false`: ¿aparece GATO dentro? `texto.indexOf(\"GATO\")` dice en qué posición empieza, contando desde 0, y da `-1` si no está. Ojo: para la máquina, \"gato\" y \"GATO\" son palabras distintas.",
      example:
        'let nota = "mas te con limon";\nlet grande = nota.toUpperCase();\nconsole.log(grande); // MAS TE CON LIMON\nconsole.log(grande.includes("LIMON")); // true\nconsole.log(grande.indexOf("TE")); // 4\nconsole.log(nota.indexOf("TE")); // -1',
    },
    task: "`mensaje` ya está cargado, en minúsculas. Crea `limpio` con `mensaje` en mayúsculas. Crea `hayConvoy` (`true` o `false`: ¿aparece \"CONVOY\" en `limpio`?) y `posicion` (dónde empieza \"CONVOY\" en `limpio`, o `-1` si no está). Muestra `posicion`.",
    starter: START,
    borrowed: ["mensaje"],
    cases: [
      { label: "el parte de la mañana", globals: () => ({ mensaje: C2[0] }) },
      { label: "el parte de la tarde", globals: () => ({ mensaje: C2[1] }) },
    ],
    capture: ["limpio", "hayConvoy", "posicion"],
    check: (outs, cases) =>
      porCaso(outs, cases, (o, g, i) => {
        const m = g.mensaje as string;
        const up = m.toUpperCase();
        const { limpio, hayConvoy, posicion } = o.values;
        if (limpio === undefined) return "Falta la variable limpio.";
        if (limpio === m) return "limpio sigue en minúsculas. Créalo con mensaje.toUpperCase().";
        if (limpio !== up) return `limpio debería ser el mensaje en mayúsculas, "${up}", y es ${show(limpio)}.`;
        if (hayConvoy === undefined) return "Falta la variable hayConvoy.";
        if (hayConvoy !== up.includes("CONVOY"))
          return `Con ${cases[i].label}, hayConvoy vale ${show(hayConvoy)} y debería ser ${up.includes("CONVOY")}. Usa limpio.includes("CONVOY").`;
        if (posicion === undefined) return "Falta la variable posicion.";
        const want = up.indexOf("CONVOY");
        if (posicion === -1 && want !== -1) return "posicion vale -1: ¿buscaste en mensaje, que está en minúsculas? Busca en limpio.";
        if (posicion !== want) return `Con ${cases[i].label}, posicion vale ${show(posicion)} y CONVOY empieza en ${want}.`;
        if (!printed(o, String(want))) return "Todo bien. Falta mostrar posicion con console.log.";
        return null;
      }, "Ahí está: CONVOY. La palabra que el Cuervo no puede evitar escribir."),
    hints: [
      "Primero limpio = mensaje.toUpperCase(). Después busca siempre dentro de limpio, no de mensaje.",
      'limpio.includes("CONVOY") da true o false; limpio.indexOf("CONVOY") da la posición, o -1.',
      'let limpio = mensaje.toUpperCase();\nlet hayConvoy = limpio.includes("CONVOY");\nlet posicion = limpio.indexOf("CONVOY");\nconsole.log(posicion);',
    ],
    debrief: [
      { who: "penrose", text: "Fíjese, Iris: el Cuervo habla de convoyes en casi todos sus mensajes. Esa palabra será nuestra llave más adelante.", mood: "alegre" },
      { who: "hale", text: "Lo que me importa es que este venía sin cifrar. Los demás no vendrán así.", mood: "serio" },
    ],
  },
  {
    id: "cc3",
    act: 1,
    giver: "penrose",
    title: "Mover una letra",
    concept: "indexOf y el resto %",
    briefing: [
      { who: "penrose", text: "Los mensajes de verdad llegan así: KROD. Parece un estornudo. Es HOLA, con cada letra corrida tres puestos." },
      { who: "penrose", text: "Es el truco más viejo del mundo. Un general romano ya lo usaba. Cifrado César, lo llamamos." },
      { who: "iris", text: "¿Y qué pasa con la Z? Si la corro tres puestos, se cae del alfabeto.", mood: "sorpresa" },
      { who: "penrose", text: "Vuelve a empezar por la A, como las horas del reloj. Escribamos la función que mueve una letra.", mood: "alegre" },
    ],
    lesson: {
      title: "El alfabeto como texto, y el resto %",
      body: "Usamos un alfabeto de 26 letras, de la A a la Z, sin Ñ y sin tildes: `ALFABETO = \"ABCDEFGHIJKLMNOPQRSTUVWXYZ\"`. `ALFABETO.indexOf(\"D\")` da 3, su posición, y `ALFABETO[3]` es \"D\". El operador `%` da el resto de una división: `27 % 26` es 1. Así, al pasar de la Z (posición 25) se vuelve a la A, como en un reloj.",
      example:
        'let hora = 22;\nconsole.log((hora + 5) % 24); // 3\nlet vocales = "AEIOU";\nconsole.log(vocales.indexOf("I")); // 2\nconsole.log(vocales[(4 + 1) % 5]); // A',
    },
    task: "`ALFABETO` ya está cargado (no lo vuelvas a declarar). Escribe la función `moverLetra(letra, salto)`, que devuelva con `return` la letra que queda `salto` puestos más adelante en el alfabeto, volviendo a la A después de la Z. Por ejemplo, `moverLetra(\"C\", 2)` es \"E\" y `moverLetra(\"Y\", 3)` es \"B\".",
    starter: START,
    borrowed: ["ALFABETO"],
    cases: [
      { label: "V con salto 7", globals: () => ({ ALFABETO, __letra: "V", __salto: 7 }) },
      { label: "K con salto 20", globals: () => ({ ALFABETO, __letra: "K", __salto: 20 }) },
    ],
    capture: [],
    probe: "typeof moverLetra !== 'function' ? '__nofn' : [moverLetra('C', 2), moverLetra('Y', 3), moverLetra(__letra, __salto)]",
    check: (outs, cases) =>
      porCaso(outs, cases, (o, g) => {
        const fallo = sinFuncion(o, "moverLetra", "letra, salto");
        if (fallo) return fallo;
        const p = o.values.__probe as unknown[];
        const pruebas: [string, number][] = [["C", 2], ["Y", 3], [g.__letra as string, g.__salto as number]];
        for (let k = 0; k < pruebas.length; k++) {
          const [l, s] = pruebas[k];
          const want = moverLetraHecha(l, s);
          if (p[k] === want) continue;
          if (p[k] === undefined && ALFABETO.indexOf(l) + s > 25)
            return `moverLetra("${l}", ${s}) devolvió undefined: te saliste del alfabeto. Usa % 26 para volver a la A después de la Z.`;
          if (typeof p[k] === "number") return `moverLetra("${l}", ${s}) devolvió el número ${p[k]}. Devuelve la letra: ALFABETO[posicion].`;
          return `moverLetra("${l}", ${s}) devolvió ${show(p[k])} y debería devolver "${want}".`;
        }
        return null;
      }, "La Z ya no se cae del mundo: vuelve a la A, como debe ser."),
    hints: [
      "Busca la posición de la letra con ALFABETO.indexOf(letra), súmale salto y usa esa posición nueva en ALFABETO[...].",
      "La posición nueva es (ALFABETO.indexOf(letra) + salto) % 26. El % hace que 26 vuelva a ser 0, la A.",
      "function moverLetra(letra, salto) {\n  let posicion = ALFABETO.indexOf(letra);\n  let nueva = (posicion + salto) % 26;\n  return ALFABETO[nueva];\n}",
    ],
    debrief: [
      { who: "penrose", text: "Precioso. Una letra que sabe caminar. Ahora pongamos a caminar un mensaje entero.", mood: "alegre" },
      { who: "penrose", text: "Hacia atrás, claro. Descifrar es deshacer el camino." },
    ],
  },
  {
    id: "cc4",
    act: 1,
    giver: "hale",
    title: "Deshacer el César",
    concept: "Construir textos en una función",
    briefing: [
      { who: "hale", text: "Interceptado hace una hora. El servicio de escucha jura que es un César, y el salto ya lo han averiguado.", mood: "serio" },
      { who: "hale", text: "Necesito una función que lo descifre. No una vez: cada vez que llegue uno. Esta noche llegarán muchos." },
      { who: "penrose", text: "Descifrar es mover cada letra hacia atrás. Y los espacios se quedan quietos: no son letras." },
    ],
    lesson: {
      title: "Construir un texto nuevo",
      body: "Para transformar un texto se empieza con uno vacío, `let nuevo = \"\"`, y en el bucle se le pega cada carácter con `nuevo += ...`. Para ir hacia atrás en el alfabeto se resta, pero restar puede dar negativo: `(posicion - salto + 26) % 26` lo arregla. Si `indexOf` da -1, el carácter no es una letra (un espacio, por ejemplo) y se pega tal cual.",
      example:
        'let palabra = "TE";\nlet eco = "";\nfor (let i = 0; i < palabra.length; i++) {\n  eco += palabra[i] + palabra[i];\n}\nconsole.log(eco); // TTEE\nconsole.log((1 - 3 + 26) % 26); // 24',
    },
    task: "`ALFABETO`, `mensaje` y `salto` ya están cargados. Escribe `descifrar(texto, salto)`: devuelve con `return` un texto nuevo donde cada letra de `texto` retrocede `salto` puestos (la A con salto 1 pasa a ser la Z). Los espacios se quedan como están. Por ejemplo, `descifrar(\"KROD\", 3)` es \"HOLA\". Al final, muestra `descifrar(mensaje, salto)`.",
    starter: START,
    borrowed: ["ALFABETO", "mensaje", "salto"],
    cases: C4.map((c, i) => ({
      label: i === 0 ? "el interceptado de las once" : "el interceptado de la una",
      globals: () => ({ ALFABETO, mensaje: cesar(c.plano, c.salto), salto: c.salto }),
    })),
    capture: [],
    probe: "typeof descifrar !== 'function' ? '__nofn' : [descifrar('KROD', 3), descifrar('ABC', 1), descifrar(mensaje, salto)]",
    check: (outs, cases) =>
      porCaso(outs, cases, (o, g, i) => {
        const fallo = sinFuncion(o, "descifrar", "texto, salto");
        if (fallo) return fallo;
        const p = o.values.__probe as unknown[];
        const m = g.mensaje as string;
        const s = g.salto as number;
        const pruebas: [string, number][] = [["KROD", 3], ["ABC", 1], [m, s]];
        for (let k = 0; k < pruebas.length; k++) {
          const [t, sal] = pruebas[k];
          const want = descesar(t, sal);
          const v = p[k];
          if (v === want) continue;
          const llamada = `descifrar(${k === 2 ? "mensaje, salto" : `"${t}", ${sal}`})`;
          if (typeof v !== "string") return `${llamada} devolvió ${show(v)}. Debe devolver un texto.`;
          if (v.includes("undefined")) return `${llamada} devolvió "${v}": aparece undefined porque al restar te saliste del alfabeto. Usa (posicion - salto + 26) % 26.`;
          if (v === cesar(t, sal)) return `${llamada} movió las letras hacia delante. Para descifrar hay que restar el salto.`;
          if ((v.length === want.length || v.replaceAll(" ", "").length === want.replaceAll(" ", "").length) && [...want].some((c, x) => (c === " ") !== (v[x] === " ")))
            return `${llamada} devolvió "${v}": los espacios se perdieron o cambiaron. Si indexOf da -1, pega el carácter tal cual.`;
          return `${llamada} devolvió "${v}" y debería devolver "${want}".`;
        }
        if (!printed(o, descesar(m, s))) return `La función está bien. Falta mostrar el resultado con console.log(descifrar(mensaje, salto)).`;
        return null;
      }, "EL CONVOY SALE A LAS SEIS. Hale ya está al teléfono."),
    hints: [
      'Empieza con let resultado = "". Recorre texto; si ALFABETO.indexOf(texto[i]) es -1, pega el carácter tal cual.',
      "Si es una letra, su posición nueva es (posicion - salto + 26) % 26 y pegas ALFABETO[nueva]. Al final, return resultado.",
      'function descifrar(texto, salto) {\n  let resultado = "";\n  for (let i = 0; i < texto.length; i++) {\n    let posicion = ALFABETO.indexOf(texto[i]);\n    if (posicion === -1) {\n      resultado += texto[i];\n    } else {\n      resultado += ALFABETO[(posicion - salto + 26) % 26];\n    }\n  }\n  return resultado;\n}\nconsole.log(descifrar(mensaje, salto));',
    ],
    debrief: [
      { who: "hale", text: "El convoy de las seis saldrá a las ocho. Ochocientos hombres que nunca sabrán por qué se retrasó su desayuno.", mood: "serio" },
      { who: "hale", text: "Buen trabajo, señorita. No se acostumbre a oírmelo decir." },
      { who: "penrose", text: "Lo ha dicho. Voy a apuntarlo en la pared.", mood: "alegre" },
    ],
  },

  // ===================== ACTO 2: FRECUENCIAS =====================
  {
    id: "cc5",
    act: 2,
    giver: "penrose",
    title: "Contar con un objeto",
    concept: "Objetos como contadores",
    briefing: [
      { who: "penrose", text: "Mala noticia: el Cuervo ya no nos regala el salto. Buena noticia: los idiomas tienen manías.", mood: "serio" },
      { who: "penrose", text: "En español la E sale por todas partes. Si una letra cifrada se repite muchísimo, seguramente era una E disfrazada." },
      { who: "penrose", text: "Primero hay que contar cuántas veces sale cada letra. Mi tetera dice que es tedioso. Mi tetera no entiende de nada.", mood: "alegre" },
    ],
    lesson: {
      title: "Un objeto que lleva la cuenta",
      body: "Un objeto guarda datos con nombre entre llaves: `{ A: 2, B: 5 }`. El nombre puede venir de una variable: `cuenta[letra]` lee o crea la propiedad que se llame como lo que valga `letra`. Si aún no existe, vale `undefined`; por eso se escribe `(cuenta[letra] || 0) + 1`: si no había nada, se empieza desde 0.",
      example:
        'let votos = {};\nlet papeletas = ["TE", "CAFE", "TE"];\nfor (let i = 0; i < papeletas.length; i++) {\n  let p = papeletas[i];\n  votos[p] = (votos[p] || 0) + 1;\n}\nconsole.log(votos.TE); // 2\nconsole.log(votos["CAFE"]); // 1',
    },
    task: "`mensaje` ya está cargado. Crea el objeto `cuenta`, vacío al principio (`{}`), y recorre `mensaje`: por cada letra, suma 1 en `cuenta[letra]`. Los espacios no se cuentan. Muestra `cuenta`.",
    starter: "let cuenta = {};\n// recorre mensaje aquí\n\nconsole.log(cuenta);\n",
    borrowed: ["mensaje"],
    cases: [
      { label: "el mensaje del lunes", globals: () => ({ mensaje: C5[0] }) },
      { label: "el mensaje del martes", globals: () => ({ mensaje: C5[1] }) },
    ],
    capture: ["cuenta"],
    check: (outs, cases) =>
      porCaso(outs, cases, (o, g, i) => {
        const want = contarLetras(g.mensaje as string);
        const v = o.values.cuenta as Record<string, unknown> | undefined;
        if (v === undefined) return "Falta el objeto cuenta.";
        if (typeof v !== "object" || v === null || Array.isArray(v)) return `cuenta debe ser un objeto, con llaves { }. Ahora vale ${show(v)}.`;
        if (" " in v) return "En cuenta aparece el espacio como si fuera una letra. Sáltalo con if (mensaje[i] !== \" \").";
        const nan = Object.keys(v).find((k) => typeof v[k] === "number" && Number.isNaN(v[k]));
        if (nan) return `cuenta.${nan} vale NaN: la primera vez, cuenta[letra] es undefined. Usa (cuenta[letra] || 0) + 1.`;
        if (Object.keys(v).length === 0) return "cuenta está vacío. Recorre mensaje y suma 1 en cuenta[letra] por cada letra.";
        for (const k of Object.keys(want)) {
          if (v[k] === undefined) return `Falta la letra ${k} en cuenta: aparece ${want[k]} veces en ${cases[i].label}.`;
          if (v[k] !== want[k]) return `Con ${cases[i].label}, cuenta.${k} vale ${show(v[k])} y la ${k} aparece ${want[k]} veces.`;
        }
        const sobra = Object.keys(v).find((k) => !(k in want));
        if (sobra) return `En cuenta sobra ${show(sobra)}: no aparece en el mensaje.`;
        return null;
      }, "Cada letra con su cuenta. Penrose ya está buscando la más alta con el dedo."),
    hints: [
      "Recorre mensaje con un for. Guarda cada carácter en una variable: let letra = mensaje[i];",
      'Si no es un espacio: cuenta[letra] = (cuenta[letra] || 0) + 1;',
      'let cuenta = {};\nfor (let i = 0; i < mensaje.length; i++) {\n  let letra = mensaje[i];\n  if (letra !== " ") {\n    cuenta[letra] = (cuenta[letra] || 0) + 1;\n  }\n}\nconsole.log(cuenta);',
    ],
    debrief: [
      { who: "penrose", text: "Mire la R del lunes: sale una barbaridad. Apuesto mi tetera a que es una E con bigote postizo.", mood: "alegre" },
      { who: "iris", text: "Contar todo esto a ojo me habría llevado una hora." },
      { who: "penrose", text: "Y a la máquina, lo que tarda usted en parpadear." },
    ],
  },
  {
    id: "cc6",
    act: 2,
    giver: "hale",
    title: "La letra reina",
    concept: "for...in",
    briefing: [
      { who: "hale", text: "Penrose me ha enseñado su objeto lleno de números. No tengo tiempo de leer números. Quiero una letra.", mood: "serio" },
      { who: "hale", text: "La que más se repite. Una función: le doy el mensaje y me devuelve la letra." },
      { who: "penrose", text: "Le he dejado hecha la función contar. Que Iris la use: para eso están las funciones, para no repetirse." },
    ],
    lesson: {
      title: "Recorrer un objeto con for...in",
      body: "`for (let clave in objeto)` da una vuelta por cada propiedad: en cada vuelta, `clave` es el nombre de la propiedad y `objeto[clave]` su valor. Para quedarte con la mayor, guarda la mejor hasta ahora y cámbiala cuando aparezca otra con más.",
      example:
        'let precios = { TE: 3, CAFE: 5, LECHE: 2 };\nlet caro = "";\nfor (let cosa in precios) {\n  if (caro === "" || precios[cosa] > precios[caro]) {\n    caro = cosa;\n  }\n}\nconsole.log(caro); // CAFE',
    },
    task: "Ya tienes `contar(texto)`: devuelve un objeto con cuántas veces sale cada letra de `texto`, sin espacios, como el de la misión anterior. Escribe `masFrecuente(texto)`, que use `contar` y devuelva con `return` la letra que más veces aparece.",
    starter: START,
    borrowed: ["contar(texto) devuelve { letra: veces, ... }"],
    cases: [
      { label: "el mensaje del miércoles", globals: () => ({ contar: contarHecha, __texto: C6[0] }) },
      { label: "el mensaje del jueves", globals: () => ({ contar: contarHecha, __texto: C6[1] }) },
    ],
    capture: [],
    probe: "typeof masFrecuente !== 'function' ? '__nofn' : [masFrecuente('ABBA CB'), masFrecuente(__texto)]",
    check: (outs, cases) =>
      porCaso(outs, cases, (o, g, i) => {
        const fallo = sinFuncion(o, "masFrecuente", "texto");
        if (fallo) return fallo;
        const p = o.values.__probe as unknown[];
        const pruebas = ["ABBA CB", g.__texto as string];
        for (let k = 0; k < 2; k++) {
          const cuenta = contarLetras(pruebas[k]);
          const want = masAlta(cuenta);
          const v = p[k];
          const quien = k === 0 ? 'masFrecuente("ABBA CB")' : `Con ${cases[i].label}, masFrecuente`;
          if (v === want) continue;
          if (typeof v === "number") return `${quien} devolvió ${v}: eso es cuántas veces sale. Devuelve la letra, el nombre de la propiedad.`;
          if (v === " ") return `${quien} devolvió un espacio. Usa contar, que ya no cuenta los espacios.`;
          return `${quien} devolvió ${show(v)} y la más repetida es "${want}" (sale ${cuenta[want]} veces).`;
        }
        return null;
      }, "Una sola letra. Hale la mira como si fuera a confesar."),
    hints: [
      "Dentro de la función: let cuenta = contar(texto); y luego recorre cuenta con for (let letra in cuenta).",
      'Guarda la mejor en let mejor = ""; cámbiala si mejor === "" o si cuenta[letra] > cuenta[mejor]. Al final, return mejor.',
      'function masFrecuente(texto) {\n  let cuenta = contar(texto);\n  let mejor = "";\n  for (let letra in cuenta) {\n    if (mejor === "" || cuenta[letra] > cuenta[mejor]) {\n      mejor = letra;\n    }\n  }\n  return mejor;\n}',
    ],
    debrief: [
      { who: "hale", text: "R. ¿Y qué hago yo con una R?", mood: "sorpresa" },
      { who: "penrose", text: "Con una R, nada. Con una R que en realidad es una E, todo. Iris, ¿cuántos puestos hay de la E a la R?" },
      { who: "iris", text: "Trece. Entonces el salto del miércoles es trece.", mood: "alegre" },
    ],
  },
  {
    id: "cc7",
    act: 2,
    giver: "penrose",
    title: "El salto de la E",
    concept: "Object.keys y sort",
    briefing: [
      { who: "penrose", text: "A veces la E no gana. Un mensaje corto puede tener más A que E, por pura mala suerte." },
      { who: "penrose", text: "Así que quiero el podio entero: las letras de más a menos. Y el salto, suponiendo que la ganadora es una E." },
      { who: "hale", text: "Suponiendo. En la marina no suponemos.", mood: "serio" },
      { who: "penrose", text: "En la marina tampoco descifran, comandante.", mood: "alegre" },
    ],
    lesson: {
      title: "Ordenar con sort",
      body: "`Object.keys(objeto)` devuelve un array con los nombres de sus propiedades. `lista.sort(...)` ordena el array con una función corta, una flecha: `(a, b) => b - a` recibe dos elementos y devuelve un número. Si es negativo, `a` va antes; si es positivo, va antes `b`. Así, `(a, b) => b - a` ordena números de mayor a menor.",
      example:
        'let edades = { IRIS: 23, PENROSE: 41, HALE: 52 };\nlet nombres = Object.keys(edades);\nconsole.log(nombres.length); // 3\nnombres.sort((a, b) => edades[a] - edades[b]);\nconsole.log(nombres[0]); // IRIS',
    },
    task: "`cuenta` (un objeto con cuántas veces sale cada letra) y `ALFABETO` ya están cargados. Crea `ranking`: las letras de `cuenta` ordenadas de la que más sale a la que menos. Luego crea `salto`: los puestos que hay desde la E hasta `ranking[0]`, entre 0 y 25, con `(ALFABETO.indexOf(ranking[0]) - ALFABETO.indexOf(\"E\") + 26) % 26`. Muestra `salto`.",
    starter: START,
    borrowed: ["cuenta", "ALFABETO"],
    cases: [
      { label: "el mensaje del viernes", globals: () => ({ cuenta: { ...C7[0] }, ALFABETO }) },
      { label: "el mensaje del sábado", globals: () => ({ cuenta: { ...C7[1] }, ALFABETO }) },
    ],
    capture: ["ranking", "salto"],
    check: (outs, cases) =>
      porCaso(outs, cases, (o, g, i) => {
        const c = g.cuenta as Record<string, number>;
        const want = Object.keys(c).sort((a, b) => c[b] - c[a]);
        const wantSalto = (ALFABETO.indexOf(want[0]) - 4 + 26) % 26;
        const { ranking, salto } = o.values;
        if (ranking === undefined) return "Falta la variable ranking.";
        if (!Array.isArray(ranking)) return `ranking debe ser un array de letras. Ahora vale ${show(ranking)}. Empieza con Object.keys(cuenta).`;
        if (!same(ranking, want)) {
          if (same(ranking, Object.keys(c).sort())) return "ranking está en orden alfabético: sort sin flecha ordena por letras. Usa (a, b) => cuenta[b] - cuenta[a].";
          if (same(ranking, [...want].reverse())) return "ranking está al revés, de menos a más. Cambia el orden de la resta: cuenta[b] - cuenta[a].";
          return `Con ${cases[i].label}, ranking es ${show(ranking)} y debería ser ${show(want)}.`;
        }
        if (salto === undefined) return "El ranking está bien. Falta la variable salto.";
        if (typeof salto === "number" && salto < 0) return `salto vale ${salto}: salió negativo. Suma 26 antes de hacer % 26.`;
        if (salto !== wantSalto) return `Con ${cases[i].label}, salto vale ${show(salto)} y de la E a la ${want[0]} hay ${wantSalto} puestos.`;
        if (!printed(o, String(wantSalto))) return "Todo bien. Falta mostrar salto con console.log.";
        return null;
      }, "Salto 13. La E se esconde siempre en lo alto del podio."),
    hints: [
      "let ranking = Object.keys(cuenta); y después ranking.sort(...) con una flecha que compare cuenta[a] y cuenta[b].",
      "De mayor a menor: ranking.sort((a, b) => cuenta[b] - cuenta[a]); Luego el salto, con la fórmula del encargo.",
      'let ranking = Object.keys(cuenta);\nranking.sort((a, b) => cuenta[b] - cuenta[a]);\nlet salto = (ALFABETO.indexOf(ranking[0]) - ALFABETO.indexOf("E") + 26) % 26;\nconsole.log(salto);',
    ],
    debrief: [
      { who: "penrose", text: "Si con la primera del podio no sale nada con sentido, se prueba con la segunda. Paciencia de pescador." },
      { who: "hale", text: "Lo he probado con el mensaje de esta mañana. Funciona. No pienso decir nada más.", mood: "alegre" },
    ],
  },
  {
    id: "cc8",
    act: 2,
    giver: "hale",
    title: "Palabras al revés",
    concept: "split, reverse y join",
    briefing: [
      { who: "hale", text: "El Cuervo tiene un truco nuevo. Descifrado, dice: ALBA AL SALE CONVOY EL. Mis oficiales creen que es poesía.", mood: "sorpresa" },
      { who: "iris", text: "No es poesía. Escriben las palabras en orden inverso: empieza por la última." },
      { who: "penrose", text: "Una función que lo enderece, Iris. Como quien da la vuelta a un calcetín.", mood: "alegre" },
    ],
    lesson: {
      title: "Partir, dar la vuelta y pegar",
      body: "`texto.split(\" \")` parte un texto por los espacios y devuelve un array de palabras. `lista.reverse()` da la vuelta al array. `lista.join(\" \")` vuelve a pegar los elementos en un texto, con un espacio entre cada uno. Si partes con `split(\"\")`, en vez de palabras obtienes letras sueltas.",
      example:
        'let menu = "TE,BOLLOS,MERMELADA";\nlet platos = menu.split(",");\nconsole.log(platos.length); // 3\nconsole.log(platos.reverse().join(" y ")); // MERMELADA y BOLLOS y TE',
    },
    task: "`mensaje` ya está cargado. Escribe `enderezar(texto)`, que devuelva con `return` el texto con las palabras en orden inverso; las letras de cada palabra no cambian: `enderezar(\"ALBA AL SALE\")` es \"SALE AL ALBA\". Muestra `enderezar(mensaje)`.",
    starter: START,
    borrowed: ["mensaje"],
    cases: [
      { label: "el parte del puerto", globals: () => ({ mensaje: C8[0] }) },
      { label: "el parte del norte", globals: () => ({ mensaje: C8[1] }) },
    ],
    capture: [],
    probe: "typeof enderezar !== 'function' ? '__nofn' : [enderezar('ALBA AL SALE'), enderezar(mensaje)]",
    check: (outs, cases) =>
      porCaso(outs, cases, (o, g) => {
        const fallo = sinFuncion(o, "enderezar", "texto");
        if (fallo) return fallo;
        const p = o.values.__probe as unknown[];
        const pruebas = ["ALBA AL SALE", g.mensaje as string];
        for (let k = 0; k < 2; k++) {
          const t = pruebas[k];
          const want = t.split(" ").reverse().join(" ");
          const v = p[k];
          const llamada = k === 0 ? 'enderezar("ALBA AL SALE")' : "enderezar(mensaje)";
          if (v === want) continue;
          if (v === [...t].reverse().join("")) return `${llamada} dio la vuelta a todas las letras. Parte por palabras con split(" "), no con split("").`;
          if (Array.isArray(v)) return `${llamada} devolvió un array. Pega las palabras en un texto con join(" ").`;
          if (v === t.split(" ").reverse().join("")) return `${llamada} devolvió las palabras pegadas. Usa join(" ") para dejar un espacio entre ellas.`;
          if (v === t.split(" ").reverse().join(",")) return `${llamada} devolvió las palabras separadas por comas. Usa join(" "), con un espacio dentro.`;
          return `${llamada} devolvió ${show(v)} y debería devolver "${want}".`;
        }
        if (!printed(o, pruebas[1].split(" ").reverse().join(" "))) return "La función está bien. Falta console.log(enderezar(mensaje)).";
        return null;
      }, "EL CONVOY VUELVE AL PUERTO. La poesía era un parte de navegación."),
    hints: [
      'Tres pasos encadenados: texto.split(" ") para tener las palabras, .reverse() para darles la vuelta y .join(" ") para pegarlas.',
      'return texto.split(" ").reverse().join(" "); y fuera de la función, console.log(enderezar(mensaje));',
      'function enderezar(texto) {\n  return texto.split(" ").reverse().join(" ");\n}\nconsole.log(enderezar(mensaje));',
    ],
    debrief: [
      { who: "hale", text: "Mis oficiales están decepcionados. Querían que fuese poesía." },
      { who: "penrose", text: "Se acabó lo fácil, me temo. Ha llegado un mensaje que no cede con ningún salto. Cada letra se mueve distinto.", mood: "serio" },
    ],
  },

  // ===================== ACTO 3: LA MÁQUINA =====================
  {
    id: "cc9",
    act: 3,
    giver: "penrose",
    title: "Una clave de letras",
    concept: "De letras a números con push",
    briefing: [
      { who: "penrose", text: "Lo he entendido mientras hervía el agua. El Cuervo ya no usa un salto: usa una palabra. Cada letra es un salto.", mood: "sorpresa" },
      { who: "penrose", text: "Si la clave es LUZ, la primera letra se mueve 11, la segunda 20, la tercera 25, y vuelta a empezar." },
      { who: "iris", text: "Entonces lo primero es convertir la palabra en números." },
    ],
    lesson: {
      title: "Un array a partir de un texto",
      body: "Para convertir un texto en un array de números se empieza con un array vacío, `[]`, se recorre el texto y en cada vuelta se añade un número al final con `lista.push(numero)`. En la clave, el salto de cada letra es su posición en `ALFABETO`: la A es 0, la B es 1 y la Z es 25.",
      example:
        'let palabras = "TE CON LIMON".split(" ");\nlet largos = [];\nfor (let i = 0; i < palabras.length; i++) {\n  largos.push(palabras[i].length);\n}\nconsole.log(largos); // [2,3,5]',
    },
    task: "`ALFABETO` ya está cargado. Escribe `saltos(clave)`, que devuelva con `return` un array con la posición en `ALFABETO` de cada letra de `clave`. Por ejemplo, `saltos(\"LUZ\")` es `[11, 20, 25]`.",
    starter: START,
    borrowed: ["ALFABETO"],
    cases: [
      { label: "la clave GRAJO", globals: () => ({ ALFABETO, __clave: C9[0] }) },
      { label: "la clave MIRLO", globals: () => ({ ALFABETO, __clave: C9[1] }) },
    ],
    capture: [],
    probe: "typeof saltos !== 'function' ? '__nofn' : [saltos('LUZ'), saltos(__clave)]",
    check: (outs, cases) =>
      porCaso(outs, cases, (o, g) => {
        const fallo = sinFuncion(o, "saltos", "clave");
        if (fallo) return fallo;
        const p = o.values.__probe as unknown[];
        for (const [k, clave] of ["LUZ", g.__clave as string].entries()) {
          const want = saltosHecha(clave);
          const v = p[k];
          if (same(v, want)) continue;
          if (!Array.isArray(v)) return `saltos("${clave}") devolvió ${show(v)}. Debe devolver un array de números.`;
          if (same(v, [...clave])) return `saltos("${clave}") devolvió las letras. Añade su posición: ALFABETO.indexOf(clave[i]).`;
          if (same(v, want.map((n) => n + 1))) return `saltos("${clave}") da un puesto de más en cada letra: la A es 0, no 1.`;
          return `saltos("${clave}") devolvió ${show(v)} y debería devolver ${show(want)}.`;
        }
        return null;
      }, "La clave convertida en saltos. El Cuervo acaba de perder una pluma."),
    hints: [
      "Empieza con let lista = []; recorre clave y en cada vuelta haz lista.push(...).",
      "Lo que añades es ALFABETO.indexOf(clave[i]). Al final, return lista.",
      "function saltos(clave) {\n  let lista = [];\n  for (let i = 0; i < clave.length; i++) {\n    lista.push(ALFABETO.indexOf(clave[i]));\n  }\n  return lista;\n}",
    ],
    debrief: [
      { who: "penrose", text: "GRAJO: 6, 17, 0, 9, 14. Hasta los números tienen cara de pájaro.", mood: "alegre" },
      { who: "hale", text: "Me da igual la cara que tengan. ¿Cuándo leemos el mensaje?", mood: "serio" },
    ],
  },
  {
    id: "cc10",
    act: 3,
    giver: "hale",
    title: "La máquina de Penrose",
    concept: "Funciones que usan funciones",
    briefing: [
      { who: "hale", text: "Tenemos un mensaje con su clave: la encontraron cosida en el forro de un abrigo. Quiero leerlo antes del cambio de guardia.", mood: "serio" },
      { who: "penrose", text: "Le dejo dos piezas hechas: saltos(clave) y moverLetra(letra, salto). Solo hay que montarlas, como un reloj." },
      { who: "penrose", text: "Un detalle: los espacios no gastan clave. La clave solo avanza cuando hay una letra." },
    ],
    lesson: {
      title: "Montar funciones con otras",
      body: "Una función puede llamar a otras: así cada pieza hace una sola cosa. `moverLetra` solo avanza, pero avanzar `26 - salto` puestos es lo mismo que retroceder `salto`: das casi la vuelta entera. Para repetir la clave, el salto que toca a la letra número `j` es `lista[j % lista.length]`: al llegar al final, vuelve al principio.",
      example:
        'let turnos = ["IRIS", "PENROSE", "HALE"];\nconsole.log(turnos[3 % turnos.length]); // IRIS\nconsole.log(turnos[4 % turnos.length]); // PENROSE\nconsole.log((26 - 3) % 26); // 23',
    },
    task: "Ya tienes `saltos(clave)` y `moverLetra(letra, salto)`, que avanza una letra volviendo a la A tras la Z. Escribe `descifrarClave(texto, clave)`: cada letra de `texto` retrocede lo que diga la letra de la clave que le toca. La clave se repite y solo avanza con las letras; los espacios se copian tal cual. Devuelve el texto con `return` y muestra `descifrarClave(mensaje, clave)`.",
    starter: START,
    borrowed: ["saltos(clave)", "moverLetra(letra, salto)", "mensaje", "clave"],
    cases: C10.map((c, i) => ({
      label: i === 0 ? "el mensaje del abrigo" : "el mensaje del segundo abrigo",
      globals: () => ({ saltos: saltosHecha, moverLetra: moverLetraHecha, ALFABETO, mensaje: vig(c.plano, c.clave, 1), clave: c.clave }),
    })),
    capture: [],
    probe: `typeof descifrarClave !== 'function' ? '__nofn' : [descifrarClave(${JSON.stringify(vig(C10_FIJO.plano, C10_FIJO.clave, 1))}, ${JSON.stringify(C10_FIJO.clave)}), descifrarClave(mensaje, clave)]`,
    check: (outs, cases) =>
      porCaso(outs, cases, (o, g) => {
        const fallo = sinFuncion(o, "descifrarClave", "texto, clave");
        if (fallo) return fallo;
        const p = o.values.__probe as unknown[];
        const pruebas: [string, string, string][] = [
          [vig(C10_FIJO.plano, C10_FIJO.clave, 1), C10_FIJO.clave, `descifrarClave("${vig(C10_FIJO.plano, C10_FIJO.clave, 1)}", "${C10_FIJO.clave}")`],
          [g.mensaje as string, g.clave as string, "descifrarClave(mensaje, clave)"],
        ];
        for (let k = 0; k < 2; k++) {
          const [t, clave, llamada] = pruebas[k];
          const want = vig(t, clave, -1);
          const v = p[k];
          if (v === want) continue;
          if (typeof v !== "string") return `${llamada} devolvió ${show(v)}. Debe devolver un texto.`;
          if (v.includes("undefined")) return `${llamada} devolvió "${v}": aparece undefined. ¿Le pasas a moverLetra una letra y un número entre 0 y 26?`;
          if (v === vig(t, clave, 1)) return `${llamada} avanzó las letras en vez de retrocederlas. Usa moverLetra(letra, 26 - salto).`;
          if (v === vig(t, clave, -1, true)) return `${llamada} gasta clave en los espacios. Lleva un contador j aparte que solo sume 1 cuando hay una letra.`;
          if ((v.length === want.length || v.replaceAll(" ", "").length === want.replaceAll(" ", "").length) && [...want].some((c, x) => (c === " ") !== (v[x] === " ")))
            return `${llamada} devolvió "${v}": los espacios se perdieron o cambiaron. Cópialos tal cual.`;
          return `${llamada} devolvió "${v}" y debería devolver "${want}".`;
        }
        if (!printed(o, vig(g.mensaje as string, g.clave as string, -1))) return "La función está bien. Falta console.log(descifrarClave(mensaje, clave)).";
        return null;
      }, "EL CONVOY DEL NORTE ESPERA EN EL PUERTO. Leído antes del cambio de guardia."),
    hints: [
      'Dentro: let lista = saltos(clave); let resultado = ""; let j = 0;. La j cuenta solo las letras ya descifradas.',
      'En el bucle: si texto[i] es " ", pégalo. Si no: let s = lista[j % lista.length]; resultado += moverLetra(texto[i], 26 - s); j++;',
      'function descifrarClave(texto, clave) {\n  let lista = saltos(clave);\n  let resultado = "";\n  let j = 0;\n  for (let i = 0; i < texto.length; i++) {\n    if (texto[i] === " ") {\n      resultado += " ";\n    } else {\n      let s = lista[j % lista.length];\n      resultado += moverLetra(texto[i], 26 - s);\n      j++;\n    }\n  }\n  return resultado;\n}\nconsole.log(descifrarClave(mensaje, clave));',
    ],
    debrief: [
      { who: "hale", text: "Esperan en el puerto. Así que no saben que hemos cambiado la salida.", mood: "sorpresa" },
      { who: "hale", text: "Pero ningún abrigo más nos traerá claves. La próxima tendremos que encontrarla nosotros.", mood: "serio" },
    ],
  },
  {
    id: "cc11",
    act: 3,
    giver: "penrose",
    title: "Probar los veintiséis",
    concept: "Fuerza bruta con una cuna",
    briefing: [
      { who: "penrose", text: "Los partes del tiempo del Cuervo siguen con su César de siempre, pero cambian de salto cada hora." },
      { who: "penrose", text: "No hace falta adivinar: solo hay 26 saltos posibles. La máquina los prueba todos antes de que se enfríe el té." },
      { who: "penrose", text: "Y todos los partes dicen TIEMPO. Una palabra que seguro aparece se llama cuna. Si al descifrar sale la cuna, es el salto bueno.", mood: "alegre" },
    ],
    lesson: {
      title: "Probar todas las opciones",
      body: "Cuando las posibilidades son pocas, se prueban todas con un bucle. Dentro se pregunta si la opción funciona y, si funciona, se devuelve con `return`: la función termina ahí mismo, sin acabar el bucle. Si el bucle termina sin encontrar nada, se devuelve un valor que signifique \"no hay\", como `-1`.",
      example:
        "function primerPar(numeros) {\n  for (let i = 0; i < numeros.length; i++) {\n    if (numeros[i] % 2 === 0) {\n      return numeros[i];\n    }\n  }\n  return -1;\n}\nconsole.log(primerPar([3, 7, 8, 10])); // 8\nconsole.log(primerPar([1, 5])); // -1",
    },
    task: "Ya tienes `descifrar(texto, salto)`, la del César. Escribe `romperCesar(texto, cuna)`: prueba los saltos del 0 al 25 y devuelve con `return` el primero con el que `descifrar(texto, salto)` incluye la palabra `cuna`. Si ninguno sirve, devuelve `-1`.",
    starter: START,
    borrowed: ["descifrar(texto, salto)"],
    cases: C11.map((c, i) => ({
      label: i === 0 ? "el parte de las nueve" : "el parte de las diez",
      globals: () => ({ descifrar: descifrarHecha, __texto: cesar(c.plano, c.salto), __cuna: c.cuna }),
    })),
    capture: [],
    probe: "typeof romperCesar !== 'function' ? '__nofn' : [romperCesar(__texto, __cuna), romperCesar('XYZ XYZ', 'TIEMPO')]",
    check: (outs, cases) =>
      porCaso(outs, cases, (o, g, i) => {
        const fallo = sinFuncion(o, "romperCesar", "texto, cuna");
        if (fallo) return fallo;
        const p = o.values.__probe as unknown[];
        const want = C11[i].salto;
        const v = p[0];
        if (typeof v === "string") return `Con ${cases[i].label}, romperCesar devolvió un texto. Devuelve el salto, un número.`;
        if (v === -1 && want === 25) return `Con ${cases[i].label} devolvió -1 y el salto era 25. ¿Tu bucle llega hasta el 25? Usa s < 26.`;
        if (v === -1 && want === 0) return `Con ${cases[i].label} devolvió -1 y el salto era 0. Empieza a probar desde el 0.`;
        if (v !== want) return `Con ${cases[i].label}, romperCesar devolvió ${show(v)} y el salto bueno es ${want}.`;
        if (p[1] === undefined) return "Cuando ningún salto sirve, romperCesar debe devolver -1, después del bucle. Ahora no devuelve nada.";
        if (p[1] !== -1) return `romperCesar("XYZ XYZ", "TIEMPO") devolvió ${show(p[1])}. Ningún salto sirve ahí: debe devolver -1.`;
        return null;
      }, "Salto 9. El Cuervo tarda una hora en cambiarlo y la máquina, un suspiro."),
    hints: [
      "Un for con let s = 0; s < 26; s++. Dentro, descifra con descifrar(texto, s).",
      "Si descifrar(texto, s).includes(cuna), return s. Después del bucle, return -1.",
      "function romperCesar(texto, cuna) {\n  for (let s = 0; s < 26; s++) {\n    if (descifrar(texto, s).includes(cuna)) {\n      return s;\n    }\n  }\n  return -1;\n}",
    ],
    debrief: [
      { who: "iris", text: "Con el César bastan 26 pruebas. Con una clave de palabra, ¿cuántas habría que hacer?" },
      { who: "penrose", text: "Millones. Pero el Cuervo es vanidoso: siempre usa nombres de pájaros. Y pájaros hay pocos.", mood: "alegre" },
      { who: "hale", text: "Llega el mensaje grande. El convoy zarpa en cuatro horas.", mood: "serio" },
    ],
  },
  {
    id: "cc12",
    act: 3,
    giver: "hale",
    title: "El mensaje del convoy",
    concept: "Probar claves hasta dar con la cuna",
    briefing: [
      { who: "hale", text: "Cuarenta barcos. Cuatro horas. El Cuervo sabe por dónde pasarán, y nosotros no sabemos dónde los esperan.", mood: "serio" },
      { who: "penrose", text: "La clave será un pájaro. Tengo la lista de los que ha usado el Cuervo. Y sabemos que el mensaje dice CONVOY." },
      { who: "penrose", text: "Prueba cada pájaro con descifrarClave. El que haga aparecer CONVOY es el bueno, y entonces leemos el mensaje entero." },
      { who: "iris", text: "Cuatro horas. Me sobran tres.", mood: "alegre" },
    ],
    lesson: {
      title: "Recorrer una lista de candidatos",
      body: "Es el mismo truco de los saltos, pero en vez de números se recorre un array de textos: en cada vuelta, `claves[i]` es una candidata. En cuanto una funciona, se devuelve el resultado que interesa. Si ninguna funciona, después del bucle se devuelve un texto vacío, `\"\"`.",
      example:
        'function buscarTe(armarios) {\n  for (let i = 0; i < armarios.length; i++) {\n    if (armarios[i].includes("TE")) {\n      return "Armario " + i + ": " + armarios[i];\n    }\n  }\n  return "";\n}\nconsole.log(buscarTe(["CAFE", "TE NEGRO"])); // Armario 1: TE NEGRO',
    },
    task: "Ya tienes `descifrarClave(texto, clave)`. `claves` es un array de nombres de pájaro y `mensaje` es el mensaje grande. Escribe `romper(texto, claves)`: prueba cada clave y devuelve con `return` el texto descifrado con la primera que haga aparecer \"CONVOY\". Si ninguna sirve, devuelve `\"\"`. Muestra `romper(mensaje, claves)`.",
    starter: START,
    borrowed: ["descifrarClave(texto, clave)", "claves", "mensaje"],
    cases: C12.map((c, i) => ({
      label: i === 0 ? "el mensaje grande" : "el mensaje de la segunda escucha",
      globals: () => ({ descifrarClave: descifrarClaveHecha, claves: [...c.claves], mensaje: vig(c.plano, c.clave, 1) }),
    })),
    capture: [],
    probe: `typeof romper !== 'function' ? '__nofn' : [romper(mensaje, claves), romper(mensaje, ${JSON.stringify(C12_NINGUNA)})]`,
    check: (outs, cases) =>
      porCaso(outs, cases, (o, g, i) => {
        const fallo = sinFuncion(o, "romper", "texto, claves");
        if (fallo) return fallo;
        const p = o.values.__probe as unknown[];
        const c = C12[i];
        const v = p[0];
        if (v !== c.plano) {
          if (v === c.clave) return `romper devolvió la clave, ${c.clave}. Hale no necesita el pájaro: necesita el mensaje descifrado.`;
          if (v === "") return `Con ${cases[i].label}, romper devolvió "". ¿Pusiste el return "" dentro del bucle? Va después, cuando ya se probaron todas.`;
          if (typeof v === "string" && (g.claves as string[]).some((k) => v === descifrarClaveHecha(g.mensaje as string, k)))
            return `Con ${cases[i].label}, romper devolvió el mensaje descifrado con otra clave. Quédate con la que hace aparecer "CONVOY".`;
          return `Con ${cases[i].label}, romper devolvió ${show(v)} y debería devolver "${c.plano}".`;
        }
        if (p[1] === undefined) return 'Cuando ninguna clave sirve, romper debe devolver "", después del bucle. Ahora no devuelve nada.';
        if (p[1] !== "") return `Con las claves ${show(C12_NINGUNA)} ninguna sirve y romper devolvió ${show(p[1])}. Debe devolver "".`;
        if (!printed(o, c.plano)) return "La función está bien. Falta console.log(romper(mensaje, claves)).";
        return null;
      }, "ROCA NEGRA AL AMANECER. Hale ya está gritando rumbos por el teléfono."),
    hints: [
      "Recorre claves con un for. En cada vuelta: let intento = descifrarClave(texto, claves[i]);",
      'Si intento.includes("CONVOY"), return intento. Después del bucle, return "".',
      'function romper(texto, claves) {\n  for (let i = 0; i < claves.length; i++) {\n    let intento = descifrarClave(texto, claves[i]);\n    if (intento.includes("CONVOY")) {\n      return intento;\n    }\n  }\n  return "";\n}\nconsole.log(romper(mensaje, claves));',
    ],
    debrief: [
      { who: "hale", text: "Los esperan en la Roca Negra al amanecer. El convoy irá por el sur. Llegará tarde, pero llegará entero.", mood: "serio" },
      { who: "hale", text: "Cuarenta barcos, señorita. Los he contado dos veces.", mood: "alegre" },
    ],
  },
];

export const CONTENT: StoryContent = {
  intro: [
    { who: "narrador", text: "Inglaterra, invierno de 1941. En Hawthorn Hall, una mansión perdida entre campos helados, las luces no se apagan nunca." },
    { who: "narrador", text: "Por fuera parece una casa de campo venida a menos. Por dentro, cien personas leen mensajes que no son para ellas." },
    { who: "narrador", text: "Iris ganó el concurso de crucigramas del periódico en once minutos. Una semana después, un coche negro la esperaba en su puerta." },
    { who: "iris", text: "Nadie me ha dicho qué hago aquí. Solo que firme un papel y que no se lo cuente ni a mi madre.", mood: "sorpresa" },
    { who: "penrose", text: "Bienvenida. Esto es la red Cuervo: mensajes cifrados que dicen por dónde pasan nuestros convoyes. Y esto es la máquina.", mood: "alegre" },
    { who: "penrose", text: "La construí yo. Le escribes órdenes en un idioma llamado JavaScript y responde. No me pregunte cómo. Yo tampoco lo sé del todo." },
    { who: "hale", text: "Comandante Hale, marina. Cada mensaje que descifren a tiempo es un convoy que cambia de rumbo. Cada uno que no, no. Empiecen.", mood: "serio" },
  ],
  acts: [
    {
      n: 1,
      title: "Letras",
      date: "Diciembre de 1941",
      opening: [
        { who: "narrador", text: "La biblioteca de Hawthorn Hall. Huele a tinta, a estufa de carbón y a té que nadie se termina." },
        { who: "narrador", text: "Antes de romper un cifrado hay que aprender a mirar un texto: letra a letra, como quien pasa las cuentas de un collar." },
      ],
    },
    {
      n: 2,
      title: "Frecuencias",
      date: "Enero de 1942",
      opening: [
        { who: "narrador", text: "Enero. El lago de la finca se ha helado y el Cuervo ha cambiado de salto tres veces en una semana." },
        { who: "narrador", text: "Penrose dice que todo idioma deja huellas: letras que se repiten más que otras. Y las huellas no se pueden esconder." },
      ],
    },
    {
      n: 3,
      title: "La máquina",
      date: "Febrero de 1942",
      opening: [
        { who: "narrador", text: "Febrero. Los mensajes del Cuervo ya no ceden con un solo salto: cada letra se mueve distinto." },
        { who: "narrador", text: "En el muelle, un convoy de cuarenta barcos espera órdenes. El comandante Hale ha dejado de dormir." },
      ],
    },
  ],
  missions: MISSIONS,
  ending: [
    { who: "narrador", text: "Al amanecer, cuarenta barcos giraron al sur. En la Roca Negra no los vio nadie, y nadie supo nunca por qué." },
    { who: "narrador", text: "No hubo medallas ni periódicos. Iris firmó otro papel: esto tampoco podría contarlo jamás." },
    { who: "iris", text: "Vine por un crucigrama. Ahora sé hacer que una máquina lea por mí: letras, cuentas, saltos y claves." },
    { who: "penrose", text: "Y algo más importante: sabe buscar el patrón. Las máquinas cambian. Los patrones se quedan.", mood: "alegre" },
    { who: "hale", text: "Penrose. Me han dicho que usted habla con esa tetera." },
    { who: "penrose", text: "Y ella conmigo, comandante. ¿Le sirvo una taza?", mood: "alegre" },
    { who: "hale", text: "...Con leche. Y sin decírselo a nadie.", mood: "alegre" },
    { who: "narrador", text: "Esa noche, por primera vez, el comandante Hale se sentó con los demás a esperar el siguiente mensaje." },
  ],
};
