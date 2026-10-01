// Sugerencias del editor. Solo aparecen las palabras que el jugador ya conoce
// o que la misión le presta, cada una con una explicación corta en español.
import { snippetCompletion, type Completion, type CompletionContext, type CompletionResult } from "@codemirror/autocomplete";
import { MISSIONS } from "./missions";

interface Entry {
  /** Id de la misión desde la que aparece. */
  from: string;
  /** Solo en estas misiones (variables prestadas). */
  only?: string[];
  c: Completion;
}

const snip = (tpl: string, c: Completion) => snippetCompletion(tpl, c);

const WORDS: Entry[] = [
  { from: "m1", c: snip("console.log(${valor});", { label: "console.log", type: "function", detail: "mostrar", info: "Muestra un valor en la consola de abajo." }) },
  { from: "m1", c: snip("let ${nombre} = ${valor};", { label: "let", type: "keyword", detail: "crear variable", info: "Crea una variable. Su valor puede cambiar después." }) },
  { from: "m3", c: snip("`${texto} \\${${variable}}`", { label: "plantilla", type: "text", detail: "`texto ${variable}`", info: "Texto con comillas invertidas que puede llevar variables dentro." }) },
  { from: "m4", c: snip("if (${condicion}) {\n\t${}\n}", { label: "if", type: "keyword", detail: "si...", info: "Ejecuta el bloque solo si la condición es verdadera." }) },
  { from: "m4", c: snip("if (${condicion}) {\n\t${}\n} else {\n\t\n}", { label: "if / else", type: "keyword", detail: "si... si no...", info: "Un camino si la condición se cumple y otro si no." }) },
  { from: "m5", c: snip("for (let ${i} = 1; ${i} <= ${30}; ${i}++) {\n\t${}\n}", { label: "for", type: "keyword", detail: "repetir", info: "Repite el bloque: dónde empieza; hasta cuándo; cómo avanza." }) },
  { from: "m7", c: snip("for (let i = 0; i < ${lista}.length; i++) {\n\t${}\n}", { label: "for (recorrer)", type: "keyword", detail: "cada posición", info: "Visita cada posición de un array, de 0 a length - 1." }) },
  { from: "m8", c: snip("function ${nombre}(${parametro}) {\n\treturn ${};\n}", { label: "function", type: "keyword", detail: "crear función", info: "Agrupa código bajo un nombre. Recibe parámetros y devuelve con return." }) },
  { from: "m8", c: { label: "return", type: "keyword", detail: "devolver", info: "Entrega el resultado de la función y la termina." } },
  { from: "m11", c: snip("{ ${clave}: ${valor} }", { label: "objeto", type: "type", detail: "{ clave: valor }", info: "Agrupa datos con nombre. Se leen con objeto.clave." }) },
  { from: "m13", c: snip("(${x}) => ${}", { label: "flecha", type: "function", detail: "(x) => ...", info: "Función corta: recibe x y devuelve lo que hay a la derecha." }) },
  { from: "m15", c: snip("for (const ${x} of ${lista}) {\n\t${}\n}", { label: "for...of", type: "keyword", detail: "cada elemento", info: "Recorre los elementos directamente, sin índices." }) },
  // variables prestadas
  { from: "m2", only: ["m2"], c: { label: "facturado", type: "variable", detail: "2387.5", info: "Prestada: lo que facturó el laboratorio." } },
  { from: "m2", only: ["m2"], c: { label: "pagado", type: "variable", detail: "2386.75", info: "Prestada: lo que pagaron los usuarios." } },
  { from: "m3", only: ["m3"], c: { label: "cuenta", type: "variable", detail: "texto", info: "Prestada: la cuenta que usó los 9 segundos." } },
  { from: "m4", only: ["m4"], c: { label: "hora", type: "variable", detail: "0 a 23", info: "Prestada: la hora de la conexión." } },
  { from: "m5", only: ["m5"], c: snip("huboConexion(${dia})", { label: "huboConexion", type: "function", detail: "(dia) → true/false", info: "Prestada: dice si hunter se conectó ese día." }) },
  { from: "m7", only: ["m7"], c: { label: "horas", type: "variable", detail: "array", info: "Prestada: las horas de todas las conexiones." } },
  { from: "m10", only: ["m10"], c: { label: "temas", type: "variable", detail: "array", info: "Prestada: temas para los archivos falsos." } },
  { from: "m12", only: ["m12", "m13", "m14"], c: { label: "registros", type: "variable", detail: "array de objetos", info: "Prestada: { cuenta, hora, comando, minutos } de cada conexión." } },
  { from: "m15", only: ["m15"], c: { label: "sesiones", type: "variable", detail: "array de objetos", info: "Prestada: { cuenta, minutos } de cada sesión de esta noche." } },
];

/** Lo que se ofrece tras un punto: lista.length, lista.push(...)... */
const MEMBERS: Entry[] = [
  { from: "m1", c: snip("log(${valor})", { label: "log", type: "method", detail: "console.log", info: "Muestra un valor en la consola." }) },
  { from: "m6", c: { label: "length", type: "property", detail: "cuántos hay", info: "Número de elementos de un array (o letras de un texto)." } },
  { from: "m7", c: snip("push(${valor})", { label: "push", type: "method", detail: "añadir al final", info: "Añade un elemento al final del array." }) },
  { from: "m13", c: snip("filter((${x}) => ${condicion})", { label: "filter", type: "method", detail: "quedarse con algunos", info: "Array nuevo con los elementos que cumplen la condición." }) },
  { from: "m14", c: snip("map((${x}) => ${valor})", { label: "map", type: "method", detail: "transformar cada uno", info: "Array nuevo con el resultado de la función para cada elemento." }) },
];

const indexOf = (id: string) => MISSIONS.findIndex((m) => m.id === id);

export function vocabFor(missionIndex: number) {
  const id = MISSIONS[missionIndex]?.id ?? "";
  const pick = (list: Entry[]) =>
    list
      .filter((e) => indexOf(e.from) <= missionIndex && (!e.only || e.only.includes(id)))
      .map((e) => ({ ...e.c, boost: 20 }));
  const words = pick(WORDS);
  const members = pick(MEMBERS);
  return (ctx: CompletionContext): CompletionResult | null => {
    const word = ctx.matchBefore(/[\w$]*\.?[\w$]*/);
    if (!word || (word.from === word.to && !ctx.explicit)) return null;
    const dot = word.text.indexOf(".");
    if (dot >= 0) return { from: word.from + dot + 1, options: members, validFor: /^[\w$]*$/ };
    return { from: word.from, options: words, validFor: /^[\w$]*$/ };
  };
}
