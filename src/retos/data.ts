// Retos de programación de la web: fuera de la historia, en formato de prueba técnica.
// Cada reto pide una función y la corrigen unos casos de prueba. Los clásicos de
// entrevista van marcados. Como en el juego, la última pista es el cuerpo de la
// solución: tests/retos.test.ts comprueba que pasa todos los casos.

export type Personaje = "margarita" | "gus" | "rochy";

export interface Nivel {
  n: number;
  titulo: string;
  temas: string;
  personaje: Personaje;
  /** Lo que dice el personaje al presentar el nivel. */
  intro: string;
}

export interface Caso {
  args: unknown[];
  esperado: unknown;
}

export interface Reto {
  id: string;
  nivel: number;
  titulo: string;
  /** Clásico de pruebas técnicas o entrevistas. */
  clasico?: boolean;
  /** Nombre de la función que hay que escribir. */
  fn: string;
  /** Enunciado; lo que va entre `comillas invertidas` se pinta como código. */
  enunciado: string;
  inicio: string;
  ejemplos: string[];
  casos: Caso[];
  pistas: string[];
  /** Comentario del personaje del nivel en el banner. */
  dice: string;
  /** Atajo que el enunciado no deja usar (p. ej. Math.max): si aparece, se avisa. */
  prohibido?: { patron: RegExp; mensaje: string };
}

export const NIVELES: Nivel[] = [
  {
    n: 1,
    titulo: "Lo básico",
    temas: "variables · operaciones · condiciones · bucles · textos",
    personaje: "margarita",
    intro: "Empecemos por lo de siempre. Una función, unos datos, una respuesta. Sin prisa.",
  },
  {
    n: 2,
    titulo: "Funciones y listas",
    temas: "arrays · recorrer listas · filter y map · textos a fondo · objetos como contador",
    personaje: "gus",
    intro: "Aquí ya se trabaja con listas, como mi cuaderno de contactos. Y caen los clásicos de entrevista. Cambio.",
  },
  {
    n: 3,
    titulo: "Objetos y algoritmos",
    temas: "objetos · recursión · pilas · búsqueda binaria · clásicos de entrevista",
    personaje: "rochy",
    intro: "Ugh. Los difíciles. Los que preguntan en las entrevistas para ver si sabes pensar. Venga, que tengo una pizza enfriándose.",
  },
];

export const PERSONAJES: Record<Personaje, { nombre: string; fila: number }> = {
  margarita: { nombre: "Margarita", fila: 3 },
  gus: { nombre: "Gus", fila: 4 },
  rochy: { nombre: "Rochy", fila: 5 },
};

export const RETOS: Reto[] = [
  // ------------------------------------------------------------------ nivel 1
  {
    id: "fahrenheit",
    nivel: 1,
    titulo: "De Celsius a Fahrenheit",
    fn: "aFahrenheit",
    enunciado:
      "Escribe la función `aFahrenheit(celsius)` que recibe una temperatura en grados Celsius y devuelve los grados Fahrenheit. La fórmula es `celsius * 9 / 5 + 32`.",
    inicio: "function aFahrenheit(celsius) {\n  \n}\n",
    ejemplos: ["aFahrenheit(0)    → 32", "aFahrenheit(100)  → 212"],
    casos: [
      { args: [0], esperado: 32 },
      { args: [100], esperado: 212 },
      { args: [-40], esperado: -40 },
      { args: [25], esperado: 77 },
      { args: [30], esperado: 86 },
    ],
    pistas: [
      "La función tiene que devolver el resultado con `return`, no mostrarlo con console.log.",
      "return celsius * 9 / 5 + 32;",
    ],
    dice: "En Berkeley nunca supe si hacía frío o calor hasta que lo pasé a Fahrenheit.",
  },
  {
    id: "es-par",
    nivel: 1,
    titulo: "¿Es par?",
    fn: "esPar",
    enunciado:
      "Escribe `esPar(n)`: devuelve `true` si el número es par y `false` si es impar. Un número es par cuando el resto de dividirlo entre 2 es 0; el resto se calcula con `%`.",
    inicio: "function esPar(n) {\n  \n}\n",
    ejemplos: ["esPar(4)  → true", "esPar(7)  → false"],
    casos: [
      { args: [4], esperado: true },
      { args: [7], esperado: false },
      { args: [0], esperado: true },
      { args: [-3], esperado: false },
      { args: [10], esperado: true },
    ],
    pistas: ["`n % 2` da 0 si es par. Compáralo con `===`.", "return n % 2 === 0;"],
    dice: "Pares e impares: lo primero que le enseñé a Ruth. Lo segundo fue a no fiarse de nada.",
  },
  {
    id: "mayor-de-tres",
    nivel: 1,
    titulo: "El mayor de tres",
    fn: "mayorDeTres",
    enunciado:
      "Escribe `mayorDeTres(a, b, c)` que devuelve el mayor de los tres números. Hazlo con `if`, sin usar `Math.max`.",
    inicio: "function mayorDeTres(a, b, c) {\n  \n}\n",
    ejemplos: ["mayorDeTres(1, 2, 3)  → 3", "mayorDeTres(9, 4, 7)  → 9"],
    casos: [
      { args: [1, 2, 3], esperado: 3 },
      { args: [9, 4, 7], esperado: 9 },
      { args: [5, 8, 2], esperado: 8 },
      { args: [-1, -5, -3], esperado: -1 },
      { args: [4, 4, 2], esperado: 4 },
    ],
    prohibido: { patron: /Math\.max/, mensaje: "Este reto se hace con if, sin Math.max: la gracia es practicar las comparaciones." },
    pistas: [
      "Guarda el primero como el mayor y compáralo con los otros dos: si alguno es más grande, pasa a ser el mayor.",
      "let mayor = a;\nif (b > mayor) mayor = b;\nif (c > mayor) mayor = c;\nreturn mayor;",
    ],
    dice: "Tres candidatos y uno gana. Como en las elecciones del club de bridge, pero más limpio.",
  },
  {
    id: "fizzbuzz",
    nivel: 1,
    titulo: "FizzBuzz",
    clasico: true,
    fn: "fizzBuzz",
    enunciado:
      "El clásico de las entrevistas. Escribe `fizzBuzz(n)` que devuelve un texto: `\"FizzBuzz\"` si `n` es múltiplo de 3 y de 5, `\"Fizz\"` si solo es múltiplo de 3, `\"Buzz\"` si solo es múltiplo de 5, y si no, el propio número como texto (`\"7\"`).",
    inicio: "function fizzBuzz(n) {\n  \n}\n",
    ejemplos: ['fizzBuzz(3)   → "Fizz"', 'fizzBuzz(15)  → "FizzBuzz"', 'fizzBuzz(7)   → "7"'],
    casos: [
      { args: [3], esperado: "Fizz" },
      { args: [5], esperado: "Buzz" },
      { args: [15], esperado: "FizzBuzz" },
      { args: [7], esperado: "7" },
      { args: [30], esperado: "FizzBuzz" },
      { args: [9], esperado: "Fizz" },
      { args: [10], esperado: "Buzz" },
      { args: [1], esperado: "1" },
    ],
    pistas: [
      "El orden importa: comprueba primero el caso de 3 y 5 a la vez (múltiplo de 15); si lo dejas para el final, nunca llegará.",
      "Para devolver el número como texto: `String(n)`.",
      'if (n % 15 === 0) return "FizzBuzz";\nif (n % 3 === 0) return "Fizz";\nif (n % 5 === 0) return "Buzz";\nreturn String(n);',
    ],
    dice: "Dicen que la mitad de los que se presentan a un trabajo no saben hacer esto. Tú sí vas a saber.",
  },
  {
    id: "suma-hasta",
    nivel: 1,
    titulo: "Sumar hasta n",
    fn: "sumaHasta",
    enunciado: "Escribe `sumaHasta(n)` que devuelve la suma de todos los números desde 1 hasta `n`. Si `n` es 0, devuelve 0.",
    inicio: "function sumaHasta(n) {\n  \n}\n",
    ejemplos: ["sumaHasta(5)   → 15   (1 + 2 + 3 + 4 + 5)", "sumaHasta(10)  → 55"],
    casos: [
      { args: [5], esperado: 15 },
      { args: [1], esperado: 1 },
      { args: [10], esperado: 55 },
      { args: [100], esperado: 5050 },
      { args: [0], esperado: 0 },
    ],
    pistas: [
      "Empieza con `let total = 0;` y recorre con un `for` de 1 a n, sumando cada número al total.",
      "let total = 0;\nfor (let i = 1; i <= n; i++) {\n  total += i;\n}\nreturn total;",
    ],
    dice: "Gauss lo hizo de cabeza a los nueve años. Nosotros tenemos un bucle, que es casi igual de elegante.",
  },
  {
    id: "contar-vocales",
    nivel: 1,
    titulo: "Contar vocales",
    fn: "contarVocales",
    enunciado:
      "Escribe `contarVocales(texto)` que devuelve cuántas vocales (a, e, i, o, u) tiene el texto, tanto en minúsculas como en mayúsculas.",
    inicio: "function contarVocales(texto) {\n  \n}\n",
    ejemplos: ['contarVocales("hola")        → 2', 'contarVocales("JavaScript")  → 3'],
    casos: [
      { args: ["hola"], esperado: 2 },
      { args: ["JavaScript"], esperado: 3 },
      { args: ["xyz"], esperado: 0 },
      { args: ["Murcielago"], esperado: 5 },
      { args: [""], esperado: 0 },
      { args: ["AEIOU"], esperado: 5 },
    ],
    pistas: [
      "Pasa el texto a minúsculas con `texto.toLowerCase()` y recorre letra a letra con un `for`.",
      '`"aeiou".includes(letra)` te dice si una letra es vocal.',
      'let n = 0;\nfor (const letra of texto.toLowerCase()) {\n  if ("aeiou".includes(letra)) n++;\n}\nreturn n;',
    ],
    dice: "Mis partituras tienen más notas que vocales este enunciado. Cuéntalas bien.",
  },
  {
    id: "invertir",
    nivel: 1,
    titulo: "Dar la vuelta a un texto",
    clasico: true,
    fn: "invertir",
    enunciado: "Escribe `invertir(texto)` que devuelve el texto al revés.",
    inicio: "function invertir(texto) {\n  \n}\n",
    ejemplos: ['invertir("hola")      → "aloh"', 'invertir("Berkeley")  → "yelekreB"'],
    casos: [
      { args: ["hola"], esperado: "aloh" },
      { args: ["Berkeley"], esperado: "yelekreB" },
      { args: ["a"], esperado: "a" },
      { args: [""], esperado: "" },
      { args: ["75 centavos"], esperado: "sovatnec 57" },
    ],
    pistas: [
      "Puedes recorrer el texto desde la última letra (`texto.length - 1`) hasta la primera e ir pegando cada letra a un texto nuevo.",
      'Otra forma: `texto.split("")` lo convierte en lista de letras, `.reverse()` le da la vuelta y `.join("")` lo vuelve a unir.',
      'return texto.split("").reverse().join("");',
    ],
    dice: "Leer al revés es un buen truco. Así encontré un error en un programa de la NASA, en 1969.",
  },
  {
    id: "factorial",
    nivel: 1,
    titulo: "Factorial",
    clasico: true,
    fn: "factorial",
    enunciado:
      "Escribe `factorial(n)`: el producto de todos los números de 1 a `n`. Por ejemplo, el factorial de 5 es 1 × 2 × 3 × 4 × 5 = 120. El factorial de 0 es 1.",
    inicio: "function factorial(n) {\n  \n}\n",
    ejemplos: ["factorial(5)  → 120", "factorial(0)  → 1"],
    casos: [
      { args: [0], esperado: 1 },
      { args: [1], esperado: 1 },
      { args: [5], esperado: 120 },
      { args: [7], esperado: 5040 },
      { args: [10], esperado: 3628800 },
    ],
    pistas: [
      "Como sumar hasta n, pero multiplicando: empieza en `let resultado = 1;` (no en 0, o todo dará 0).",
      "let resultado = 1;\nfor (let i = 2; i <= n; i++) {\n  resultado *= i;\n}\nreturn resultado;",
    ],
    dice: "El factorial crece rapidísimo. Con 20 ya no cabía en mi primera calculadora.",
  },

  // ------------------------------------------------------------------ nivel 2
  {
    id: "maximo",
    nivel: 2,
    titulo: "El mayor de una lista",
    fn: "maximo",
    enunciado: "Escribe `maximo(lista)` que devuelve el número más grande de una lista. La lista siempre tiene al menos un número. Hazlo recorriéndola, sin `Math.max`.",
    inicio: "function maximo(lista) {\n  \n}\n",
    ejemplos: ["maximo([3, 9, 2])     → 9", "maximo([-5, -2, -8])  → -2"],
    casos: [
      { args: [[3, 9, 2]], esperado: 9 },
      { args: [[-5, -2, -8]], esperado: -2 },
      { args: [[7]], esperado: 7 },
      { args: [[1, 1, 1]], esperado: 1 },
      { args: [[10, 50, 20, 50]], esperado: 50 },
    ],
    prohibido: { patron: /Math\.max/, mensaje: "Este reto se hace recorriendo la lista, sin Math.max." },
    pistas: [
      "No empieces con `let mayor = 0`: si todos son negativos, devolverías 0. Empieza con el primero: `lista[0]`.",
      "let mayor = lista[0];\nfor (const n of lista) {\n  if (n > mayor) mayor = n;\n}\nreturn mayor;",
    ],
    dice: "La señal más fuerte de la noche. Así elijo con quién hablar. Cambio.",
  },
  {
    id: "promedio",
    nivel: 2,
    titulo: "Promedio",
    fn: "promedio",
    enunciado: "Escribe `promedio(lista)` que devuelve la media de los números: la suma entre cuántos hay. Si la lista está vacía, devuelve 0.",
    inicio: "function promedio(lista) {\n  \n}\n",
    ejemplos: ["promedio([2, 4, 6])  → 4", "promedio([])         → 0"],
    casos: [
      { args: [[2, 4, 6]], esperado: 4 },
      { args: [[10]], esperado: 10 },
      { args: [[1, 2]], esperado: 1.5 },
      { args: [[5, 5, 5, 5]], esperado: 5 },
      { args: [[]], esperado: 0 },
    ],
    pistas: [
      "Primero el caso especial: `if (lista.length === 0) return 0;`. Si no, dividirías entre cero.",
      "if (lista.length === 0) return 0;\nlet suma = 0;\nfor (const n of lista) suma += n;\nreturn suma / lista.length;",
    ],
    dice: "La media de mis contactos por noche es 4,2. El 0,2 fue un barco que se cortó a mitad.",
  },
  {
    id: "solo-pares",
    nivel: 2,
    titulo: "Solo los pares",
    fn: "soloPares",
    enunciado: "Escribe `soloPares(lista)` que devuelve una lista nueva con solo los números pares, en el mismo orden.",
    inicio: "function soloPares(lista) {\n  \n}\n",
    ejemplos: ["soloPares([1, 2, 3, 4])  → [2, 4]", "soloPares([7, 9])        → []"],
    casos: [
      { args: [[1, 2, 3, 4]], esperado: [2, 4] },
      { args: [[7, 9]], esperado: [] },
      { args: [[0, -2, 3]], esperado: [0, -2] },
      { args: [[]], esperado: [] },
      { args: [[8, 6, 5, 4]], esperado: [8, 6, 4] },
    ],
    pistas: ["`filter` se queda con los elementos para los que la función devuelve true.", "return lista.filter((n) => n % 2 === 0);"],
    dice: "Filtrar es lo mío: de cien señales me quedo con las que se entienden.",
  },
  {
    id: "palindromo",
    nivel: 2,
    titulo: "¿Es palíndromo?",
    clasico: true,
    fn: "esPalindromo",
    enunciado:
      "Un palíndromo se lee igual al derecho y al revés. Escribe `esPalindromo(texto)` que devuelve `true` o `false`, sin tener en cuenta las mayúsculas ni los espacios.",
    inicio: "function esPalindromo(texto) {\n  \n}\n",
    ejemplos: ['esPalindromo("radar")               → true', 'esPalindromo("Anita lava la tina")  → true', 'esPalindromo("hola")                → false'],
    casos: [
      { args: ["radar"], esperado: true },
      { args: ["Anilina"], esperado: true },
      { args: ["hola"], esperado: false },
      { args: ["Anita lava la tina"], esperado: true },
      { args: ["a"], esperado: true },
      { args: ["ab"], esperado: false },
    ],
    pistas: [
      'Limpia el texto primero: minúsculas con `toLowerCase()` y sin espacios con `replaceAll(" ", "")`.',
      "Luego compara el texto limpio con su versión al revés (el reto de dar la vuelta a un texto te sirve aquí).",
      'const limpio = texto.toLowerCase().replaceAll(" ", "");\nreturn limpio === limpio.split("").reverse().join("");',
    ],
    dice: "En radio tenemos uno: «oír o». Bueno, no. Pero «radar» sí, y es de mi gremio.",
  },
  {
    id: "contar-palabras",
    nivel: 2,
    titulo: "Contar palabras",
    fn: "contarPalabras",
    enunciado:
      "Escribe `contarPalabras(frase)` que devuelve cuántas palabras tiene la frase. Cuidado: puede haber espacios de más al principio, al final o entre palabras.",
    inicio: "function contarPalabras(frase) {\n  \n}\n",
    ejemplos: ['contarPalabras("Cambio y corto")      → 3', 'contarPalabras("  dos   espacios  ")  → 2'],
    casos: [
      { args: ["hola mundo"], esperado: 2 },
      { args: ["Cambio y corto"], esperado: 3 },
      { args: [""], esperado: 0 },
      { args: ["  dos   espacios  "], esperado: 2 },
      { args: ["uno"], esperado: 1 },
    ],
    pistas: [
      '`frase.split(" ")` corta por espacios, pero con espacios de más deja trozos vacíos `""`. Quítalos con `filter`.',
      'return frase.split(" ").filter((p) => p !== "").length;',
    ],
    dice: "En morse cada palabra cuesta. Por eso las cuento antes de mandarlas.",
  },
  {
    id: "sin-duplicados",
    nivel: 2,
    titulo: "Sin repetidos",
    clasico: true,
    fn: "sinDuplicados",
    enunciado: "Escribe `sinDuplicados(lista)` que devuelve una lista nueva sin elementos repetidos, conservando el orden en que aparece cada uno por primera vez.",
    inicio: "function sinDuplicados(lista) {\n  \n}\n",
    ejemplos: ["sinDuplicados([1, 2, 2, 3, 1])  → [1, 2, 3]", 'sinDuplicados(["a", "b", "a"])  → ["a", "b"]'],
    casos: [
      { args: [[1, 2, 2, 3, 1]], esperado: [1, 2, 3] },
      { args: [["a", "b", "a"]], esperado: ["a", "b"] },
      { args: [[]], esperado: [] },
      { args: [[5, 5, 5]], esperado: [5] },
      { args: [[3, 1, 3, 2, 1]], esperado: [3, 1, 2] },
    ],
    pistas: [
      "Crea una lista vacía y recorre la original: añade cada elemento solo si todavía no está (`resultado.includes(x)`).",
      "Atajo de los que saben: `[...new Set(lista)]`. Un Set no admite repetidos.",
      "const resultado = [];\nfor (const x of lista) {\n  if (!resultado.includes(x)) resultado.push(x);\n}\nreturn resultado;",
    ],
    dice: "Una tarjeta QSL por país. Si me llega otra de Finlandia, a la caja de repetidas.",
  },
  {
    id: "anagramas",
    nivel: 2,
    titulo: "¿Son anagramas?",
    clasico: true,
    fn: "sonAnagramas",
    enunciado:
      "Dos palabras son anagramas si tienen exactamente las mismas letras, en otro orden (amor y roma). Escribe `sonAnagramas(a, b)` que devuelve `true` o `false`, sin tener en cuenta las mayúsculas.",
    inicio: "function sonAnagramas(a, b) {\n  \n}\n",
    ejemplos: ['sonAnagramas("amor", "roma")    → true', 'sonAnagramas("perro", "pera")  → false'],
    casos: [
      { args: ["amor", "roma"], esperado: true },
      { args: ["Roma", "Mora"], esperado: true },
      { args: ["gato", "toga"], esperado: true },
      { args: ["perro", "pera"], esperado: false },
      { args: ["abc", "abd"], esperado: false },
      { args: ["aab", "abb"], esperado: false },
    ],
    pistas: [
      "Si ordenas las letras de las dos palabras, los anagramas quedan iguales: `amor` y `roma` dan los dos `amor`.",
      'Para ordenar letras: `palabra.toLowerCase().split("").sort().join("")`.',
      'const ordenar = (p) => p.toLowerCase().split("").sort().join("");\nreturn ordenar(a) === ordenar(b);',
    ],
    dice: "Mi indicativo desordenado da una palabra muy fea. No te la voy a decir. Cambio.",
  },
  {
    id: "dos-sumas",
    nivel: 2,
    titulo: "Dos que suman",
    clasico: true,
    fn: "dosSumas",
    enunciado:
      "El famoso «Two Sum». Escribe `dosSumas(numeros, objetivo)` que devuelve las posiciones `[i, j]` de los dos números de la lista que suman `objetivo`, con `i` menor que `j`. Siempre hay exactamente una pareja, y no puedes usar el mismo número dos veces.",
    inicio: "function dosSumas(numeros, objetivo) {\n  \n}\n",
    ejemplos: ["dosSumas([2, 7, 11, 15], 9)  → [0, 1]   (2 + 7 = 9)", "dosSumas([3, 2, 4], 6)       → [1, 2]"],
    casos: [
      { args: [[2, 7, 11, 15], 9], esperado: [0, 1] },
      { args: [[3, 2, 4], 6], esperado: [1, 2] },
      { args: [[3, 3], 6], esperado: [0, 1] },
      { args: [[1, 5, 9, 13], 22], esperado: [2, 3] },
      { args: [[-1, 4, 8, 2], 1], esperado: [0, 3] },
    ],
    pistas: [
      "Prueba todas las parejas con dos `for`, uno dentro del otro: el de fuera para `i` y el de dentro empezando en `i + 1` para `j`.",
      "for (let i = 0; i < numeros.length; i++) {\n  for (let j = i + 1; j < numeros.length; j++) {\n    if (numeros[i] + numeros[j] === objetivo) return [i, j];\n  }\n}",
    ],
    dice: "Este lo preguntan en todas las entrevistas, me dice mi sobrino. Él trabaja en una empresa de computadoras. Cambio.",
  },

  // ------------------------------------------------------------------ nivel 3
  {
    id: "contar-letras",
    nivel: 3,
    titulo: "Contar cada letra",
    fn: "contarLetras",
    enunciado:
      "Escribe `contarLetras(texto)` que devuelve un objeto con cuántas veces aparece cada letra. Los espacios no se cuentan, y las mayúsculas cuentan aparte de las minúsculas.",
    inicio: "function contarLetras(texto) {\n  \n}\n",
    ejemplos: ['contarLetras("hola")    → { h: 1, o: 1, l: 1, a: 1 }', 'contarLetras("banana")  → { b: 1, a: 3, n: 2 }'],
    casos: [
      { args: ["hola"], esperado: { h: 1, o: 1, l: 1, a: 1 } },
      { args: ["banana"], esperado: { b: 1, a: 3, n: 2 } },
      { args: [""], esperado: {} },
      { args: ["a a"], esperado: { a: 2 } },
      { args: ["Aa"], esperado: { A: 1, a: 1 } },
    ],
    pistas: [
      "Empieza con un objeto vacío `{}` y recorre el texto letra a letra. Un objeto sirve de contador: la letra es la clave y el número, el valor.",
      "Si la letra todavía no está en el objeto, `cuenta[letra]` vale undefined. `(cuenta[letra] ?? 0) + 1` empieza en 1 la primera vez.",
      'const cuenta = {};\nfor (const letra of texto) {\n  if (letra === " ") continue;\n  cuenta[letra] = (cuenta[letra] ?? 0) + 1;\n}\nreturn cuenta;',
    ],
    dice: "Así cuento las cajas de pizza. Bueno, así las contaría si las contara.",
  },
  {
    id: "mas-caro",
    nivel: 3,
    titulo: "El más caro",
    fn: "masCaro",
    enunciado:
      "Recibes una lista de productos, cada uno un objeto con `nombre` y `precio`. Escribe `masCaro(productos)` que devuelve el nombre del más caro. Si hay empate, el que aparece primero. La lista nunca está vacía.",
    inicio: "function masCaro(productos) {\n  \n}\n",
    ejemplos: ['masCaro([\n  { nombre: "pizza", precio: 12 },\n  { nombre: "teclado", precio: 45 },\n])  → "teclado"'],
    casos: [
      { args: [[{ nombre: "pizza", precio: 12 }, { nombre: "refresco", precio: 2 }, { nombre: "teclado", precio: 45 }]], esperado: "teclado" },
      { args: [[{ nombre: "disquete", precio: 3 }]], esperado: "disquete" },
      { args: [[{ nombre: "cable", precio: 5 }, { nombre: "enchufe", precio: 5 }]], esperado: "cable" },
      { args: [[{ nombre: "módem", precio: 300 }, { nombre: "ratón", precio: 20 }, { nombre: "monitor", precio: 250 }]], esperado: "módem" },
    ],
    pistas: [
      "Como el mayor de una lista, pero guardando el producto entero: `let mejor = productos[0];` y comparas `p.precio > mejor.precio`.",
      "Usa `>` y no `>=`: así, si hay empate, se queda el primero.",
      "let mejor = productos[0];\nfor (const p of productos) {\n  if (p.precio > mejor.precio) mejor = p;\n}\nreturn mejor.nombre;",
    ],
    dice: "El módem. Siempre es el módem. Trescientos dólares para oír pitidos.",
  },
  {
    id: "fibonacci",
    nivel: 3,
    titulo: "Fibonacci",
    clasico: true,
    fn: "fibonacci",
    enunciado:
      "En la serie de Fibonacci cada número es la suma de los dos anteriores: 0, 1, 1, 2, 3, 5, 8, 13... Escribe `fibonacci(n)` que devuelve el número que ocupa la posición `n`, contando desde 0.",
    inicio: "function fibonacci(n) {\n  \n}\n",
    ejemplos: ["fibonacci(0)   → 0", "fibonacci(6)   → 8", "fibonacci(10)  → 55"],
    casos: [
      { args: [0], esperado: 0 },
      { args: [1], esperado: 1 },
      { args: [2], esperado: 1 },
      { args: [10], esperado: 55 },
      { args: [20], esperado: 6765 },
      { args: [25], esperado: 75025 },
    ],
    pistas: [
      "Los dos primeros son fáciles: si `n` es 0 o 1, devuelve `n`.",
      "Para el resto, avanza con dos variables, `a` y `b` (los dos últimos números), y en cada paso calcula el siguiente. La versión recursiva (`fibonacci(n - 1) + fibonacci(n - 2)`) también vale, pero repite muchísimo trabajo.",
      "if (n < 2) return n;\nlet a = 0;\nlet b = 1;\nfor (let i = 2; i <= n; i++) {\n  const siguiente = a + b;\n  a = b;\n  b = siguiente;\n}\nreturn b;",
    ],
    dice: "La versión recursiva tarda tanto que me da tiempo a echarme la siesta. Por eso me gusta.",
  },
  {
    id: "primer-no-repetido",
    nivel: 3,
    titulo: "La primera que no se repite",
    clasico: true,
    fn: "primerNoRepetido",
    enunciado:
      "Escribe `primerNoRepetido(texto)` que devuelve el primer carácter que aparece una sola vez en el texto. Si todos se repiten, devuelve un texto vacío `\"\"`.",
    inicio: "function primerNoRepetido(texto) {\n  \n}\n",
    ejemplos: ['primerNoRepetido("abacabad")  → "c"', 'primerNoRepetido("aabb")      → ""'],
    casos: [
      { args: ["abacabad"], esperado: "c" },
      { args: ["aabb"], esperado: "" },
      { args: ["leetcode"], esperado: "l" },
      { args: ["Rochy"], esperado: "R" },
      { args: [""], esperado: "" },
      { args: ["xxyzz"], esperado: "y" },
    ],
    pistas: [
      "Un carácter aparece una sola vez si la primera y la última vez que aparece están en la misma posición: `texto.indexOf(c) === texto.lastIndexOf(c)`.",
      "Otra forma: cuenta primero cada letra con un objeto (como en el reto de contar letras) y luego busca la primera con cuenta 1.",
      'for (const c of texto) {\n  if (texto.indexOf(c) === texto.lastIndexOf(c)) return c;\n}\nreturn "";',
    ],
    dice: "Como mis calcetines. Siempre hay uno que no tiene pareja.",
  },
  {
    id: "romanos",
    nivel: 3,
    titulo: "Números romanos",
    clasico: true,
    fn: "romanoANumero",
    enunciado:
      "Escribe `romanoANumero(romano)` que pasa un número romano a número normal. I=1, V=5, X=10, L=50, C=100, D=500, M=1000. Normalmente se suman, pero si un símbolo va antes de otro mayor, se resta: IV es 4 y IX es 9.",
    inicio: "function romanoANumero(romano) {\n  \n}\n",
    ejemplos: ['romanoANumero("III")      → 3', 'romanoANumero("IX")       → 9', 'romanoANumero("MCMXCIV")  → 1994'],
    casos: [
      { args: ["III"], esperado: 3 },
      { args: ["IV"], esperado: 4 },
      { args: ["IX"], esperado: 9 },
      { args: ["XL"], esperado: 40 },
      { args: ["LVIII"], esperado: 58 },
      { args: ["MCMXCIV"], esperado: 1994 },
      { args: ["MMXXVI"], esperado: 2026 },
    ],
    pistas: [
      "Guarda los valores en un objeto: `const valor = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };`.",
      "Recorre las letras con su posición. Si la letra vale menos que la siguiente, réstala; si no, súmala.",
      "const valor = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };\nlet total = 0;\nfor (let i = 0; i < romano.length; i++) {\n  const actual = valor[romano[i]];\n  const siguiente = valor[romano[i + 1]] ?? 0;\n  if (actual < siguiente) total -= actual;\n  else total += actual;\n}\nreturn total;",
    ],
    dice: "Los créditos de las películas vienen en romanos para que no sepas lo vieja que es. A mí no me engañan.",
  },
  {
    id: "parentesis",
    nivel: 3,
    titulo: "Paréntesis equilibrados",
    clasico: true,
    fn: "equilibrados",
    enunciado:
      "Escribe `equilibrados(texto)` que devuelve `true` si los paréntesis `()`, corchetes `[]` y llaves `{}` del texto están bien cerrados: cada uno que se abre se cierra, y en el orden correcto. Lo demás del texto se ignora.",
    inicio: "function equilibrados(texto) {\n  \n}\n",
    ejemplos: ['equilibrados("([])")  → true', 'equilibrados("(]")    → false', 'equilibrados(")(")    → false'],
    casos: [
      { args: ["()"], esperado: true },
      { args: ["([])"], esperado: true },
      { args: ["{[()()]}"], esperado: true },
      { args: ["(]"], esperado: false },
      { args: ["(("], esperado: false },
      { args: [")("], esperado: false },
      { args: [""], esperado: true },
      { args: ["if (x[0]) { y(); }"], esperado: true },
    ],
    pistas: [
      "Usa una pila: una lista donde metes con `push` cada símbolo que abre y sacas con `pop` el último cuando llega uno que cierra.",
      "Al cerrar, lo que sacas tiene que ser su pareja: `)` con `(`, `]` con `[`, `}` con `{`. Al final, la pila tiene que quedar vacía.",
      'const pila = [];\nconst pareja = { ")": "(", "]": "[", "}": "{" };\nfor (const c of texto) {\n  if ("([{".includes(c)) pila.push(c);\n  else if (c in pareja && pila.pop() !== pareja[c]) return false;\n}\nreturn pila.length === 0;',
    ],
    dice: "Esto es lo que hace el compilador cuando te olvidas una llave. Y luego me echan la culpa a mí.",
  },
  {
    id: "busqueda-binaria",
    nivel: 3,
    titulo: "Búsqueda binaria",
    clasico: true,
    fn: "buscar",
    enunciado:
      "Recibes una lista de números ordenada de menor a mayor. Escribe `buscar(lista, objetivo)` que devuelve la posición del objetivo, o `-1` si no está. Hazlo con búsqueda binaria: mira el del medio y descarta la mitad donde no puede estar. Sin `indexOf` ni `includes`.",
    inicio: "function buscar(lista, objetivo) {\n  \n}\n",
    ejemplos: ["buscar([1, 3, 5, 7, 9], 7)  → 3", "buscar([1, 3, 5, 7, 9], 4)  → -1"],
    casos: [
      { args: [[1, 3, 5, 7, 9], 7], esperado: 3 },
      { args: [[1, 3, 5, 7, 9], 1], esperado: 0 },
      { args: [[1, 3, 5, 7, 9], 9], esperado: 4 },
      { args: [[1, 3, 5, 7, 9], 4], esperado: -1 },
      { args: [[], 3], esperado: -1 },
      { args: [[2, 4, 6, 8, 10, 12, 14, 16], 14], esperado: 6 },
    ],
    prohibido: { patron: /\.(indexOf|includes|findIndex|find)\(/, mensaje: "Este reto se hace con búsqueda binaria, sin indexOf, includes ni find: la idea es partir la lista por la mitad." },
    pistas: [
      "Lleva dos marcas, `izq = 0` y `der = lista.length - 1`. Mientras `izq <= der`, mira el del medio: `Math.floor((izq + der) / 2)`.",
      "Si el del medio es menor que el objetivo, el objetivo está a la derecha: `izq = medio + 1`. Si es mayor, a la izquierda: `der = medio - 1`.",
      "let izq = 0;\nlet der = lista.length - 1;\nwhile (izq <= der) {\n  const medio = Math.floor((izq + der) / 2);\n  if (lista[medio] === objetivo) return medio;\n  if (lista[medio] < objetivo) izq = medio + 1;\n  else der = medio - 1;\n}\nreturn -1;",
    ],
    dice: "Así busco en la guía telefónica. Abro por la mitad y tiro hacia donde sea. Es lo más rápido que hago en todo el día.",
  },
  {
    id: "aplanar",
    nivel: 3,
    titulo: "Aplanar una lista",
    clasico: true,
    fn: "aplanar",
    enunciado:
      "Una lista puede tener listas dentro, y esas, otras más. Escribe `aplanar(lista)` que devuelve una sola lista con todos los elementos, en orden y sin listas dentro. Sin usar `.flat()`: hazlo con recursión, una función que se llama a sí misma.",
    inicio: "function aplanar(lista) {\n  \n}\n",
    ejemplos: ["aplanar([1, [2, [3, 4]], 5])  → [1, 2, 3, 4, 5]", "aplanar([[1], [2], [3]])      → [1, 2, 3]"],
    casos: [
      { args: [[1, [2, [3, 4]], 5]], esperado: [1, 2, 3, 4, 5] },
      { args: [[]], esperado: [] },
      { args: [[[1], [2], [3]]], esperado: [1, 2, 3] },
      { args: [[1, 2, 3]], esperado: [1, 2, 3] },
      { args: [[[[["hondo"]]]]], esperado: ["hondo"] },
      { args: [[1, [], [2, []]]], esperado: [1, 2] },
    ],
    prohibido: { patron: /\.flat(Map)?\(/, mensaje: "Este reto se hace sin .flat(): la gracia es escribir tú la recursión." },
    pistas: [
      "Recorre la lista. Si un elemento no es una lista, lo añades al resultado. `Array.isArray(x)` te dice si lo es.",
      "Si el elemento es una lista, llama a `aplanar(x)` con él (la función se llama a sí misma) y añade todo lo que devuelve: `resultado.push(...aplanar(x))`.",
      "const resultado = [];\nfor (const x of lista) {\n  if (Array.isArray(x)) resultado.push(...aplanar(x));\n  else resultado.push(x);\n}\nreturn resultado;",
    ],
    dice: "Mi cuarto, pero con datos: cajas dentro de cajas dentro de cajas. Este es el último. Luego, siesta.",
  },
];
