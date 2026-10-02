// Traduce los errores de JavaScript a algo que un principiante entienda.
// Los mensajes originales de V8/JSC están en inglés y son crípticos.

export interface FriendlyError {
  title: string;
  hint: string;
  raw: string;
}

const rules: Array<[RegExp, (m: RegExpMatchArray) => { title: string; hint: string }]> = [
  [
    /(\w+) is not defined|Can't find variable: (\w+)/,
    (m) => ({
      title: `No existe nada llamado "${m[1] ?? m[2]}"`,
      hint: "Revisa que esté bien escrito (mayúsculas incluidas) y que lo hayas creado antes con let o const.",
    }),
  ],
  [
    /Identifier '(\w+)' has already been declared|Cannot declare a let variable twice: '(\w+)'|redeclaration of \w+ (\w+)/,
    (m) => ({
      title: `"${m[1] ?? m[2] ?? m[3]}" ya existe`,
      hint: "Ese nombre ya está en uso. Usa otro nombre, o quita el let/const si solo quieres cambiar su valor.",
    }),
  ],
  [
    /Assignment to constant variable|Attempted to assign to readonly property/,
    () => ({
      title: "Intentaste cambiar una constante",
      hint: "Lo que se crea con const no se puede reasignar. Si necesitas cambiarlo, créalo con let.",
    }),
  ],
  [
    /Unexpected end of input|Unexpected end of script|missing \} /,
    () => ({
      title: "Falta cerrar algo",
      hint: "Cuenta tus llaves { } y paréntesis ( ): cada uno que abres debe cerrarse.",
    }),
  ],
  [
    /Invalid or unexpected token|Unterminated string|unterminated string/i,
    () => ({
      title: "Hay un texto sin cerrar o un símbolo raro",
      hint: 'Los textos van entre comillas que abren y cierran igual: "así" o \'así\'.',
    }),
  ],
  [
    /Unexpected token|Unexpected identifier|SyntaxError/,
    () => ({
      title: "La máquina no entiende esa línea",
      hint: "Suele ser un símbolo de más o de menos: revisa comas, paréntesis, = y comillas.",
    }),
  ],
  [
    /is not a function/,
    () => ({
      title: "Intentaste usar como función algo que no lo es",
      hint: "Solo se ponen paréntesis () después de una función. Revisa el nombre.",
    }),
  ],
  [
    /Cannot read propert|undefined is not an object|null is not an object/,
    () => ({
      title: "Le pediste algo a un valor vacío",
      hint: "Estás leyendo una propiedad de algo que es undefined o null. Comprueba de dónde viene ese valor.",
    }),
  ],
];

export function translateError(name: string, message: string): FriendlyError {
  const raw = `${name}: ${message}`;
  for (const [re, make] of rules) {
    const m = raw.match(re);
    if (m) return { ...make(m), raw };
  }
  return { title: "Algo falló al ejecutar", hint: "Lee el mensaje original de abajo y revisa la línea marcada.", raw };
}

export const TIMEOUT_ERROR: FriendlyError = {
  title: "Tu código no terminó nunca",
  hint: "Probablemente un bucle infinito: revisa que la condición del for/while llegue a ser falsa.",
  raw: "Tiempo agotado (1,5 s)",
};

/** Erratas típicas de principiante: palabra mal escrita -> la buena. */
const TYPOS: Array<[RegExp, string]> = [
  [/\.(lenght|lengh|lenth|legth|leght|length\(\))/, "length (sin paréntesis y con la g antes de la t)"],
  [/\b(consol|cosole|conosle|console\.lgo|console\.og|consloe)\b/, "console.log"],
  [/\b(fuction|funtion|fucntion|funcion|functon)\b/, "function"],
  [/\b(retrun|retun|reutrn|return\()\b/, "return"],
  [/\b(Let|LET|lte)\s/, "let (en minúsculas)"],
  [/\b(cosnt|cnost|Const)\s/, "const (en minúsculas)"],
  [/\.(pussh|psuh|puhs|Push)\(/, "push"],
  [/\.(fliter|filtr|Filter)\(/, "filter"],
  [/\b(Console)\./, "console (en minúsculas)"],
  [/\b(True|False|TRUE|FALSE)\b/, "true / false (en minúsculas)"],
];

/** Si el código tiene una errata conocida, la señala con su corrección. */
export function typoHint(code: string): string | null {
  for (const [re, fix] of TYPOS) {
    const m = code.match(re);
    if (m) return `¿Quisiste escribir ${fix}? Encontré "${m[0].trim()}".`;
  }
  return null;
}

/** Distancia de edición entre dos palabras (cuántas letras cambian). */
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

/** Si el código crea una variable o función con un nombre casi igual al que pide la
 *  tarea (celcius por celsius), lo dice: es lo que más confunde al empezar. */
export function nameHint(code: string, expected: string[]): string | null {
  const declared = [...code.matchAll(/\b(?:let|const|var|function|class)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]);
  for (const want of expected) {
    if (declared.includes(want)) continue;
    const near = declared.find((n) => n !== want && (n.toLowerCase() === want.toLowerCase() || distance(n, want) <= 2));
    if (near) return `Creaste "${near}", pero la tarea pide "${want}". Los nombres tienen que coincidir letra por letra${near.toLowerCase() === want.toLowerCase() ? ", también en mayúsculas y minúsculas" : ""}.`;
  }
  return null;
}
