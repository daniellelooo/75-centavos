// Preguntas de repaso del cuaderno: "¿qué imprime este código?".
// Una por misión. La práctica de recuperar (intentar recordar) fija lo aprendido
// mucho mejor que releer.

export interface Quiz {
  code: string;
  options: string[];
  answer: number;
  why: string;
}

export const QUIZ: Record<string, Quiz> = {
  m1: {
    code: "let x = 4;\nx = 7;\nconsole.log(x);",
    options: ["4", "7", "4 y 7"],
    answer: 1,
    why: "Al reasignar, la variable deja de apuntar al 4 y apunta al 7.",
  },
  m2: {
    code: "let a = 10;\nlet b = 3;\nconsole.log(a - b * 2);",
    options: ["14", "4", "1"],
    answer: 1,
    why: "La multiplicación va antes que la resta: 10 - 6 = 4.",
  },
  m3: {
    code: 'let n = "Ruth";\nconsole.log(`Hola ${n}`);',
    options: ["Hola ${n}", "Hola Ruth", "Hola n"],
    answer: 1,
    why: "Dentro de una plantilla (comillas invertidas), ${n} se sustituye por el valor de n.",
  },
  m4: {
    code: 'let h = 6;\nif (h < 6) {\n  console.log("noche");\n} else {\n  console.log("día");\n}',
    options: ["noche", "día", "nada"],
    answer: 1,
    why: "6 < 6 es falso, así que se ejecuta el else.",
  },
  m5: {
    code: "let c = 0;\nfor (let i = 1; i <= 4; i++) {\n  c++;\n}\nconsole.log(c);",
    options: ["3", "4", "5"],
    answer: 1,
    why: "i toma 1, 2, 3 y 4: cuatro vueltas.",
  },
  m6: {
    code: 'let l = ["a", "b", "c"];\nconsole.log(l[1]);',
    options: ["a", "b", "c"],
    answer: 1,
    why: "Las posiciones empiezan en 0: l[0] es a, l[1] es b.",
  },
  m7: {
    code: "let n = [5, 1, 8];\nlet r = [];\nfor (let i = 0; i < n.length; i++) {\n  if (n[i] > 2) r.push(n[i]);\n}\nconsole.log(r.length);",
    options: ["1", "2", "3"],
    answer: 1,
    why: "Solo 5 y 8 son mayores que 2.",
  },
  m8: {
    code: "function doble(x) {\n  x * 2;\n}\nconsole.log(doble(4));",
    options: ["8", "undefined", "x * 2"],
    answer: 1,
    why: "Sin return la función calcula pero no entrega nada: devuelve undefined.",
  },
  m9: {
    code: "function resta(a, b) {\n  return a - b;\n}\nconsole.log(resta(2, 9));",
    options: ["7", "-7", "29"],
    answer: 1,
    why: "Los argumentos llegan en orden: a = 2 y b = 9.",
  },
  m10: {
    code: 'function f(t) {\n  return t + "!";\n}\nlet r = [];\nlet l = ["a", "b"];\nfor (let i = 0; i < l.length; i++) {\n  r.push(f(l[i]));\n}\nconsole.log(r);',
    options: ['["a!", "b!"]', '["a", "b"]', '"a!b!"'],
    answer: 0,
    why: "El bucle llama a f con cada elemento y guarda cada resultado.",
  },
  m11: {
    code: 'let e = { nombre: "Vega", brillo: 3 };\nconsole.log(e.brillo);',
    options: ["Vega", "3", "brillo"],
    answer: 1,
    why: "objeto.propiedad devuelve el valor de esa propiedad.",
  },
  m12: {
    code: "let l = [{ n: 1 }, { n: 5 }];\nconsole.log(l[1].n);",
    options: ["1", "5", "undefined"],
    answer: 1,
    why: "l[1] es el segundo objeto, y su propiedad n vale 5.",
  },
  m13: {
    code: "let v = [3, 8, 1, 9];\nconsole.log(v.filter((x) => x > 4));",
    options: ["[8, 9]", "[3, 1]", "2"],
    answer: 0,
    why: "filter se queda con los elementos para los que la flecha devuelve true.",
  },
  m14: {
    code: "let v = [1, 2, 3];\nconsole.log(v.map((x) => x * 10));",
    options: ["[10, 20, 30]", "60", "[1, 2, 3]"],
    answer: 0,
    why: "map devuelve un array del mismo tamaño con cada elemento transformado.",
  },
  m15: {
    code: "let t = 0;\nfor (const x of [2, 4, 6]) {\n  t += x;\n}\nconsole.log(t);",
    options: ["6", "12", "246"],
    answer: 1,
    why: "El acumulador suma 2, luego 4, luego 6: 12.",
  },
  m16: {
    code: "let x = 1;\nif (true) {\n  let x = 2;\n}\nconsole.log(x);",
    options: ["1", "2", "error"],
    answer: 0,
    why: "El x de dentro del if es otra variable que muere al cerrar la llave; fuera sigue el x de fuera.",
  },
  m17: {
    code: "function crear() {\n  let n = 0;\n  return () => ++n;\n}\nconst a = crear();\nconst b = crear();\na();\na();\nconsole.log(b());",
    options: ["1", "3", "2"],
    answer: 0,
    why: "Cada llamada a crear() tiene su propio n: b empieza en cero aunque a ya contara dos veces.",
  },
  m18: {
    code: "function mas(n) {\n  return (x) => x + n;\n}\nconst mas10 = mas(10);\nconsole.log(mas10(5));",
    options: ["15", "10", "5"],
    answer: 0,
    why: "mas10 recuerda n = 10 y lo suma al 5 que recibe.",
  },
  m19: {
    code: 'const tiene = (p) => (t) => t.includes(p);\nconst l = ["pago uno", "hola", "otro pago"];\nconsole.log(l.filter(tiene("pago")).length);',
    options: ["2", "1", "3"],
    answer: 0,
    why: 'tiene("pago") fabrica la función que filter necesita; dos mensajes contienen "pago".',
  },
  m20: {
    code: "function caja() {\n  let s = \"secreto\";\n  return { ver() { return s.length; } };\n}\nconst c = caja();\nconsole.log(c.s);",
    options: ["undefined", "secreto", "7"],
    answer: 0,
    why: "s es privada: vive en el closure, no es una propiedad del objeto. Solo ver() puede tocarla.",
  },
  m21: {
    code: "class Punto {\n  constructor(x) {\n    this.x = x;\n  }\n}\nconst p = new Punto(4);\nconsole.log(p.x * 2);",
    options: ["8", "4", "undefined"],
    answer: 0,
    why: "El constructor guardó 4 en this.x.",
  },
  m22: {
    code: "class Gato {\n  constructor(n) { this.n = n; }\n  hola() { return `soy ${this.n}`; }\n}\nconsole.log(new Gato(\"Byte\").hola());",
    options: ["soy Byte", "soy n", "soy undefined"],
    answer: 0,
    why: "Dentro del método, this es el gato que lo llama.",
  },
  m23: {
    code: "class Caja {\n  constructor() { this.cosas = []; }\n  meter(x) { this.cosas.push(x); }\n}\nconst a = new Caja();\nconst b = new Caja();\na.meter(1);\na.meter(2);\nconsole.log(b.cosas.length);",
    options: ["0", "2", "1"],
    answer: 0,
    why: "Cada objeto tiene su propio array: lo que entra en a no entra en b.",
  },
  m24: {
    code: "class A {\n  hola() { return \"A\"; }\n}\nclass B extends A {}\nconsole.log(new B().hola());",
    options: ["A", "B", "error"],
    answer: 0,
    why: "B hereda los métodos de A aunque no defina ninguno propio.",
  },
  m25: {
    code: "const cola = [\"x\", \"y\", \"z\"];\ncola.shift();\nconsole.log(cola.length);",
    options: ["2", "3", "1"],
    answer: 0,
    why: "shift() saca el primer elemento del array: quedan dos.",
  },
  m26: {
    code: 'setTimeout(() => console.log("B"), 0);\nconsole.log("A");',
    options: ["A y luego B", "B y luego A", "solo A"],
    answer: 0,
    why: "Aunque sea 0 ms, lo de setTimeout espera a que termine el código actual.",
  },
  m27: {
    code: "const p = Promise.resolve(3);\np.then((n) => console.log(n * 2));",
    options: ["6", "3", "Promise"],
    answer: 0,
    why: "then recibe el valor de la promesa, 3, cuando está listo.",
  },
  m28: {
    code: "async function dos() {\n  const n = await Promise.resolve(1);\n  return n + 1;\n}\ndos().then(console.log);",
    options: ["2", "1", "Promise"],
    answer: 0,
    why: "await espera el 1 y la función async entrega su return a través de then.",
  },
  m29: {
    code: 'try {\n  null.x;\n  console.log("ok");\n} catch (e) {\n  console.log("atrapado");\n}',
    options: ["atrapado", "ok", "error y se para"],
    answer: 0,
    why: "Leer una propiedad de null lanza un error; catch lo atrapa y el programa sigue.",
  },
  m30: {
    code: "const r = await Promise.all([Promise.resolve(1), Promise.resolve(2)]);\nconsole.log(r);",
    options: ["[1, 2]", "3", "1"],
    answer: 0,
    why: "Promise.all entrega un array con los resultados, en el mismo orden.",
  },
};
