// Consultas SQL de verdad (SQLite compilado a WebAssembly) para las misiones de
// bases de datos. Cada caso arranca una base nueva con sus tablas; se ejecuta la
// consulta del jugador y la de referencia, y el corrector compara los resultados.
import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import type { CheckResult, TestCase } from "./types";
import type { RunOutput } from "./sandbox";

export interface SqlTable {
  columns: string[];
  rows: unknown[][];
}

let engine: Promise<SqlJsStatic> | null = null;
let locate: ((file: string) => string) | undefined;

/** En el navegador hay que decir dónde está el .wasm; en los tests lo encuentra solo. */
export function setSqlWasm(url: string): void {
  locate = () => url;
}

function sql(): Promise<SqlJsStatic> {
  engine ??= initSqlJs(locate ? { locateFile: locate } : undefined);
  return engine;
}

/** Ejecuta varias sentencias y devuelve la tabla de la última que es una consulta,
 *  aunque no tenga filas (o null si ninguna era una consulta). */
function lastTable(db: Database, code: string): SqlTable | null {
  let last: SqlTable | null = null;
  for (const stmt of db.iterateStatements(code)) {
    const columns = stmt.getColumnNames();
    const rows: unknown[][] = [];
    while (stmt.step()) rows.push(stmt.get());
    if (columns.length) last = { columns, rows };
    stmt.free();
  }
  return last;
}

export interface SqlInput {
  code: string;
  setup: string;
  solution: string;
  /** Consulta que se lanza después (para comprobar un INSERT o un UPDATE). */
  verify?: string;
}

export async function runSql(input: SqlInput): Promise<RunOutput> {
  const SQL = await sql();
  const expectedDb = new SQL.Database();
  expectedDb.run(input.setup);
  let expected = lastTable(expectedDb, input.solution);
  if (input.verify) expected = lastTable(expectedDb, input.verify);
  expectedDb.close();

  const db = new SQL.Database();
  db.run(input.setup);
  try {
    if (!input.code.trim()) throw new Error("La consulta está vacía.");
    let result = lastTable(db, input.code);
    if (input.verify) result = lastTable(db, input.verify);
    return { ok: true, logs: [], values: { __result: result, __expected: expected }, calls: {} };
  } catch (e) {
    const err = e instanceof Error ? e : new Error(String(e));
    return { ok: false, logs: [], values: {}, calls: {}, error: { name: "SQLError", message: err.message } };
  } finally {
    db.close();
  }
}

// ------------------------------------------------------------------ corrector común

const norm = (v: unknown) => (typeof v === "number" ? Math.round(v * 1e6) / 1e6 : v);
const rowKey = (r: unknown[]) => JSON.stringify(r.map(norm));
const colName = (c: string) => c.toLowerCase().replace(/\s+/g, "");

/** Compara el resultado del jugador con el de la consulta de referencia en cada caso. */
export function sqlCheck(opts: { ordered: boolean; ok: string; names?: boolean }) {
  return (outs: RunOutput[], cases: TestCase[]): CheckResult => {
    for (let i = 0; i < outs.length; i++) {
      const got = outs[i].values.__result as SqlTable | null;
      const want = outs[i].values.__expected as SqlTable | null;
      const where = cases.length > 1 ? ` (con los datos de «${cases[i].label}»)` : "";
      if (!want) return { pass: false, feedback: "La misión no tiene resultado de referencia." };
      if (!got) return { pass: false, feedback: "Tu consulta no devolvió ninguna tabla. Las preguntas se hacen con SELECT ... FROM ..." };
      if (got.columns.length !== want.columns.length)
        return { pass: false, feedback: `Tu resultado tiene ${got.columns.length} columna${got.columns.length === 1 ? "" : "s"} (${got.columns.join(", ")}) y debería tener ${want.columns.length}: ${want.columns.join(", ")}.` };
      if (opts.names !== false) {
        const bad = want.columns.findIndex((c, j) => colName(c) !== colName(got.columns[j]));
        if (bad >= 0) {
          const reordered = [...want.columns.map(colName)].sort().join() === [...got.columns.map(colName)].sort().join();
          return {
            pass: false,
            feedback: reordered
              ? `Las columnas están, pero en otro orden: deberían ir así: ${want.columns.join(", ")}.`
              : `La columna ${bad + 1} se llama «${got.columns[bad]}» y debería llamarse «${want.columns[bad]}». Si es un cálculo (COUNT, SUM, AVG...), ponle ese nombre con AS: ... AS ${want.columns[bad]}.`,
          };
        }
      }
      if (got.rows.length !== want.rows.length) {
        const more = got.rows.length > want.rows.length;
        const why = more
          ? "Sobran filas: ¿falta una condición en el WHERE, agrupar con GROUP BY, quitar repetidos con DISTINCT o un LIMIT?"
          : got.rows.length === 0
            ? "No sale ninguna fila: ¿la condición es demasiado estricta, o un JOIN deja fuera filas que necesitas (LEFT JOIN las conserva)?"
            : "Faltan filas: ¿la condición es demasiado estricta, o un JOIN deja fuera filas que necesitas?";
        return { pass: false, feedback: `Tu consulta devuelve ${got.rows.length} fila${got.rows.length === 1 ? "" : "s"} y deberían ser ${want.rows.length}${where}. ${why}` };
      }
      if (opts.ordered) {
        const j = got.rows.findIndex((r, k) => rowKey(r) !== rowKey(want.rows[k]));
        if (j >= 0) {
          const sameSet = [...got.rows.map(rowKey)].sort().join() === [...want.rows.map(rowKey)].sort().join();
          return {
            pass: false,
            feedback: sameSet
              ? `Las filas son las correctas pero en otro orden${where}. Revisa el ORDER BY (ASC sube, DESC baja).`
              : `La fila ${j + 1} no cuadra${where}: sale (${got.rows[j].map(String).join(", ")}) y debería ser (${want.rows[j].map(String).join(", ")}).`,
          };
        }
      } else {
        const a = got.rows.map(rowKey).sort();
        const b = want.rows.map(rowKey).sort();
        const j = a.findIndex((r, k) => r !== b[k]);
        if (j >= 0) return { pass: false, feedback: `Hay filas que no deberían estar${where}: por ejemplo (${(JSON.parse(a[j]) as unknown[]).map(String).join(", ")}).` };
      }
    }
    return { pass: true, feedback: opts.ok };
  };
}

/** Errores de SQLite en palabras normales. */
export function translateSqlError(message: string): { title: string; hint: string } {
  let m: RegExpMatchArray | null;
  if ((m = message.match(/no such table: (\S+)/))) return { title: `No existe ninguna tabla llamada «${m[1]}»`, hint: "Revisa el nombre de la tabla: las que hay están en el encargo." };
  if ((m = message.match(/no such column: (\S+)/))) return { title: `No existe ninguna columna llamada «${m[1]}»`, hint: "Revisa cómo se escribe la columna. Si es un texto, va entre comillas simples: 'Madrid'." };
  if ((m = message.match(/near "([^"]*)": syntax error/)))
    return { title: `La máquina no entiende la consulta cerca de «${m[1]}»`, hint: "Suele faltar o sobrar una coma, una comilla o una palabra clave. El orden es SELECT ... FROM ... WHERE ... GROUP BY ... ORDER BY ..." };
  if (/incomplete input/.test(message)) return { title: "La consulta está incompleta", hint: "Falta terminarla: ¿una comilla o un paréntesis sin cerrar?" };
  if (/misuse of aggregate/.test(message)) return { title: "Una función de resumen está fuera de sitio", hint: "COUNT, SUM o AVG no pueden ir en el WHERE. Para filtrar por un resumen se usa HAVING, después del GROUP BY." };
  if (/ambiguous column name: (\S+)/.test(message)) return { title: "Hay dos columnas con el mismo nombre", hint: "Al unir tablas, di de cuál es cada columna: tabla.columna." };
  if (/vacía/.test(message)) return { title: "La consulta está vacía", hint: "Escribe una consulta que empiece por SELECT." };
  return { title: "La base de datos no aceptó la consulta", hint: "Lee el mensaje original de abajo." };
}
