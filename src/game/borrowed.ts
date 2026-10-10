// Lo que la máquina le "presta" al jugador en cada misión. Si la misión solo da el
// nombre (p. ej. "contactos"), se enseña su valor real del primer caso, para que
// se vea la forma de los datos sin tener que hacer un console.log primero.
import type { Exercise as Mission } from "./types";

const IDENT = /^[A-Za-z_$][\w$]*$/;
const MAX_ITEMS = 3;

/** Un valor escrito como en JavaScript, en una línea; las listas largas se cortan con "...". */
export function jsValue(v: unknown): string {
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "function") return "función";
  if (Array.isArray(v)) {
    const items = v.slice(0, MAX_ITEMS).map(jsValue);
    if (v.length > MAX_ITEMS) items.push("...");
    return `[${items.join(", ")}]`;
  }
  if (v && typeof v === "object") {
    const pares = Object.entries(v).map(([k, x]) => `${IDENT.test(k) ? k : JSON.stringify(k)}: ${jsValue(x)}`);
    return pares.length ? `{ ${pares.join(", ")} }` : "{}";
  }
  return String(v);
}

/** Igual, pero una lista de objetos va un elemento por línea para que se lea. */
function jsBlock(name: string, v: unknown): string {
  const flat = `${name} = ${jsValue(v)}`;
  if (flat.length <= 56) return flat;
  if (Array.isArray(v)) {
    const items = v.slice(0, MAX_ITEMS).map((x) => `  ${jsValue(x)},`);
    if (v.length > MAX_ITEMS) items.push("  ...");
    return `${name} = [\n${items.join("\n")}\n]`;
  }
  if (v && typeof v === "object") {
    const pares = Object.entries(v).map(([k, x]) => `  ${IDENT.test(k) ? k : JSON.stringify(k)}: ${jsValue(x)},`);
    return `${name} = {\n${pares.join("\n")}\n}`;
  }
  return flat;
}

export interface Borrowed {
  /** Descripciones ya escritas en la misión ("horas = [3, 14, ...]"). */
  described: string[];
  /** Valores de ejemplo para los que solo venían por su nombre. */
  shown: string[];
}

export function borrowedFor(mission: Mission): Borrowed {
  const sample = mission.cases[0]?.globals() ?? {};
  const described: string[] = [];
  const shown: string[] = [];
  for (const b of mission.borrowed) {
    if (IDENT.test(b) && b in sample) shown.push(jsBlock(b, sample[b]));
    else described.push(b);
  }
  return { described, shown };
}
