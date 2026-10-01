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
