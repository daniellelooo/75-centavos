// Errores de escritura (sintaxis): JavaScript no dice en qué línea están porque el
// código ni llega a ejecutarse. Aquí se analiza el código con acorn para dar la
// línea y la columna exactas, y se explica la causa más probable en palabras normales.
import { parse } from "acorn";

export interface SyntaxSpot {
  line: number;
  column: number;
  /** La línea tal como la escribió el jugador. */
  text: string;
  /** Qué parece que pasa, en palabras normales. */
  why: string;
}

const PAIRS: Record<string, string> = { "(": ")", "{": "}", "[": "]" };
const NAMES: Record<string, string> = { "(": "un paréntesis (", "{": "una llave {", "[": "un corchete [", ")": "un paréntesis )", "}": "una llave }", "]": "un corchete ]" };

/** Recorre el código saltando textos y comentarios, y devuelve el primer símbolo
 *  que no cuadra: uno que se cerró sin abrirse, o uno que se abrió y nunca se cerró. */
function brackets(code: string): { kind: "extra" | "unclosed" | "mismatch" | "string"; ch: string; want?: string; pos: number; openPos?: number } | null {
  const stack: { ch: string; pos: number }[] = [];
  for (let i = 0; i < code.length; i++) {
    const c = code[i];
    if (c === "/" && code[i + 1] === "/") {
      while (i < code.length && code[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && code[i + 1] === "*") {
      const end = code.indexOf("*/", i + 2);
      i = end < 0 ? code.length : end + 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const start = i;
      i++;
      while (i < code.length && code[i] !== c) {
        if (code[i] === "\\") i++;
        // un texto con comillas normales no puede saltar de línea: si llega al final, está sin cerrar
        if (c !== "`" && code[i] === "\n") return { kind: "string", ch: c, pos: start };
        i++;
      }
      if (i >= code.length) return { kind: "string", ch: c, pos: start };
      continue;
    }
    if (c in PAIRS) stack.push({ ch: c, pos: i });
    else if (c === ")" || c === "}" || c === "]") {
      const top = stack.pop();
      if (!top) return { kind: "extra", ch: c, pos: i };
      if (PAIRS[top.ch] !== c) return { kind: "mismatch", ch: c, want: PAIRS[top.ch], pos: i, openPos: top.pos };
    }
  }
  const open = stack.pop();
  return open ? { kind: "unclosed", ch: open.ch, pos: open.pos } : null;
}

function lineCol(code: string, pos: number): { line: number; column: number } {
  const before = code.slice(0, pos);
  const line = before.split("\n").length;
  return { line, column: pos - before.lastIndexOf("\n") };
}

/** Comillas sin cerrar en una línea (sin contar las de dentro de otras comillas). */
function openQuote(text: string): string | null {
  let q: string | null = null;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === "\\") i++;
      else if (c === q) q = null;
    } else if (c === "/" && text[i + 1] === "/") break;
    else if (c === '"' || c === "'") q = c;
  }
  return q;
}

export function locateSyntax(code: string): SyntaxSpot | null {
  try {
    parse(code, { ecmaVersion: "latest", sourceType: "script", allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true });
    return null;
  } catch (e) {
    const err = e as SyntaxError & { loc?: { line: number; column: number } };
    if (!err.loc) return null;
    const lines = code.split("\n");
    let { line, column } = { line: err.loc.line, column: err.loc.column + 1 };
    let why = "Aquí la máquina esperaba otra cosa: suele ser un símbolo de más o de menos (una coma, un paréntesis, un punto y coma, un =).";

    const b = brackets(code);
    const q = openQuote(lines[line - 1] ?? "");
    if (b?.kind === "string") {
      // un texto sin cerrar se "come" todo lo que viene después: se señala donde empieza
      ({ line, column } = lineCol(code, b.pos));
      why =
        b.ch === "`"
          ? "Aquí abres un texto con la comilla invertida ` y no lo cierras. Falta otra ` al final del texto, antes del ;"
          : `Aquí abres un texto con ${b.ch} y no lo cierras en la misma línea. Falta otra ${b.ch} al final del texto.`;
    } else if (q) {
      why = `Esta línea abre un texto con ${q} y no lo cierra. Los textos empiezan y terminan con la misma comilla.`;
    } else if (b?.kind === "extra") {
      ({ line, column } = lineCol(code, b.pos));
      why = `Aquí sobra ${NAMES[b.ch]}: se cierra algo que nunca se abrió.`;
    } else if (b?.kind === "mismatch" && b.want === ")" && lineCol(code, b.openPos!).line < lineCol(code, b.pos).line) {
      // un paréntesis sin cerrar en una línea anterior: el fallo está donde se abrió
      ({ line, column } = lineCol(code, b.openPos!));
      why = "En esta línea abriste un paréntesis ( y no lo cerraste. Falta un ) antes de lo que sigue.";
    } else if (b?.kind === "mismatch") {
      ({ line, column } = lineCol(code, b.pos));
      why = `Aquí se cierra con ${NAMES[b.ch]}, pero lo último que abriste necesita ${NAMES[b.want!]}.`;
    } else if (b?.kind === "unclosed") {
      ({ line, column } = lineCol(code, b.pos));
      why = `En esta línea abriste ${NAMES[b.ch]} y nunca lo cerraste. Falta cerrarlo con ${PAIRS[b.ch]}.`;
    } else if (/Unexpected token/.test(err.message) && /^\s*(if|for|while)\b[^(]*$/.test(lines[line - 1] ?? "")) {
      why = "Después de if, for o while van paréntesis con la condición: if (x > 3) { ... }";
    } else if (/Unexpected token/.test(err.message) && /\b(let|const)\s+\w+\s*$/.test((lines[line - 1] ?? "").slice(0, column))) {
      why = "Después del nombre de la variable falta el = y su valor: let x = 5;";
    }
    return { line, column, text: lines[line - 1] ?? "", why };
  }
}
