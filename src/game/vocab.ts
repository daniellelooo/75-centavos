// Sugerencias del editor. Solo aparecen las palabras que el jugador ya conoce
// o que la misión le presta, cada una con una explicación corta en español.
import { snippetCompletion, type Completion, type CompletionContext, type CompletionResult } from "@codemirror/autocomplete";

interface Entry {
  /** Índice de la primera misión en la que aparece. */
  from: number;
  /** Solo en esta misión (variables prestadas). */
  only?: number;
  c: Completion;
}

const snip = (tpl: string, c: Completion) => snippetCompletion(tpl, c);

const ENTRIES: Entry[] = [
  { from: 0, c: snip("console.log(${valor});", { label: "console.log", type: "function", detail: "mostrar", info: "Muestra un valor en la consola de abajo." }) },
  { from: 0, c: snip("let ${nombre} = ${valor};", { label: "let", type: "keyword", detail: "crear variable", info: "Crea una variable. Su valor puede cambiar después." }) },
  { from: 2, c: snip("`${texto} \\${${variable}}`", { label: "plantilla", type: "text", detail: "`texto ${variable}`", info: "Texto con comillas invertidas que puede llevar variables dentro." }) },
  { from: 3, c: snip("if (${condicion}) {\n\t${}\n}", { label: "if", type: "keyword", detail: "si...", info: "Ejecuta el bloque solo si la condición es verdadera." }) },
  { from: 3, c: snip("if (${condicion}) {\n\t${}\n} else {\n\t\n}", { label: "if / else", type: "keyword", detail: "si... si no...", info: "Un camino si la condición se cumple y otro si no." }) },
  { from: 4, c: snip("for (let ${i} = 1; ${i} <= ${30}; ${i}++) {\n\t${}\n}", { label: "for", type: "keyword", detail: "repetir", info: "Repite el bloque: dónde empieza; hasta cuándo; cómo avanza." }) },
  { from: 1, only: 1, c: { label: "facturado", type: "variable", detail: "2387.5", info: "Prestada: lo que facturó el laboratorio." } },
  { from: 1, only: 1, c: { label: "pagado", type: "variable", detail: "2386.75", info: "Prestada: lo que pagaron los usuarios." } },
  { from: 2, only: 2, c: { label: "cuenta", type: "variable", detail: "texto", info: "Prestada: la cuenta que usó los 9 segundos." } },
  { from: 3, only: 3, c: { label: "hora", type: "variable", detail: "0 a 23", info: "Prestada: la hora de la conexión." } },
  { from: 4, only: 4, c: snip("huboConexion(${dia})", { label: "huboConexion", type: "function", detail: "(dia) → true/false", info: "Prestada: dice si hunter se conectó ese día." }) },
];

export function vocabFor(missionIndex: number) {
  const list = ENTRIES.filter((e) => e.from <= missionIndex && (e.only === undefined || e.only === missionIndex)).map((e) => ({
    ...e.c,
    boost: 20,
  }));
  return (ctx: CompletionContext): CompletionResult | null => {
    const word = ctx.matchBefore(/[\w.$]*/);
    if (!word || (word.from === word.to && !ctx.explicit)) return null;
    return { from: word.from, options: list, validFor: /^[\w.$]*$/ };
  };
}
