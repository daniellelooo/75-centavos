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
};
