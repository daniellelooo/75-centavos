// Errores típicos en las misiones de Código Cuervo: cada uno recibe un mensaje que explica qué falta.
import { describe, expect, it } from "vitest";
import { grade } from "../src/game/run-local";
import { CONTENT } from "../src/stories/codigo-cuervo/content";

const m = (id: string) => CONTENT.missions.find((x) => x.id === id)!;

async function falla(id: string, code: string, re: RegExp) {
  const r = await grade(m(id), code);
  expect(r.pass, r.feedback).toBe(false);
  expect(r.feedback).toMatch(re);
}

describe("Código Cuervo: errores típicos", () => {
  it("cc1: contar también los espacios", () =>
    falla("cc1", "let letras = mensaje.length;\nconsole.log(letras);", /espacios/));

  it("cc1: el número escrito a mano falla con el segundo mensaje", () =>
    falla("cc1", "let letras = 21;\nconsole.log(letras);", /a mano/));

  it("cc1: sin console.log", () =>
    falla("cc1", 'let letras = 0;\nfor (let i = 0; i < mensaje.length; i++) { if (mensaje[i] !== " ") letras++; }', /console\.log/));

  it("cc2: no pasar a mayúsculas", () =>
    falla("cc2", 'let limpio = mensaje;\nlet hayConvoy = limpio.includes("CONVOY");\nlet posicion = limpio.indexOf("CONVOY");\nconsole.log(posicion);', /toUpperCase/));

  it("cc2: buscar en el mensaje original en vez de en limpio", () =>
    falla("cc2", 'let limpio = mensaje.toUpperCase();\nlet hayConvoy = limpio.includes("CONVOY");\nlet posicion = mensaje.indexOf("CONVOY");\nconsole.log(posicion);', /limpio/));

  it("cc3: olvidar el módulo y salirse del alfabeto", () =>
    falla("cc3", "function moverLetra(letra, salto) {\n  return ALFABETO[ALFABETO.indexOf(letra) + salto];\n}", /% 26/));

  it("cc3: devolver la posición en vez de la letra", () =>
    falla("cc3", "function moverLetra(letra, salto) {\n  return (ALFABETO.indexOf(letra) + salto) % 26;\n}", /número/));

  it("cc4: console.log en vez de return", () =>
    falla(
      "cc4",
      'function descifrar(texto, salto) {\n  let r = "";\n  for (let i = 0; i < texto.length; i++) {\n    let p = ALFABETO.indexOf(texto[i]);\n    r += p === -1 ? texto[i] : ALFABETO[(p - salto + 26) % 26];\n  }\n  console.log(r);\n}\ndescifrar(mensaje, salto);',
      /return/,
    ));

  it("cc4: restar sin sumar 26 deja undefined", () =>
    falla(
      "cc4",
      'function descifrar(texto, salto) {\n  let r = "";\n  for (let i = 0; i < texto.length; i++) {\n    let p = ALFABETO.indexOf(texto[i]);\n    r += p === -1 ? texto[i] : ALFABETO[(p - salto) % 26];\n  }\n  return r;\n}\nconsole.log(descifrar(mensaje, salto));',
      /undefined/,
    ));

  it("cc4: sumar el salto en vez de restarlo", () =>
    falla(
      "cc4",
      'function descifrar(texto, salto) {\n  let r = "";\n  for (let i = 0; i < texto.length; i++) {\n    let p = ALFABETO.indexOf(texto[i]);\n    r += p === -1 ? texto[i] : ALFABETO[(p + salto) % 26];\n  }\n  return r;\n}\nconsole.log(descifrar(mensaje, salto));',
      /hacia delante/,
    ));

  it("cc4: un resultado escrito a mano no sirve", () =>
    falla("cc4", 'function descifrar(texto, salto) {\n  return "EL CONVOY SALE A LAS SEIS";\n}\nconsole.log(descifrar(mensaje, salto));', /HOLA/));

  it("cc5: contar los espacios como letras", () =>
    falla("cc5", "let cuenta = {};\nfor (let i = 0; i < mensaje.length; i++) {\n  cuenta[mensaje[i]] = (cuenta[mensaje[i]] || 0) + 1;\n}\nconsole.log(cuenta);", /espacio/));

  it("cc5: olvidar el || 0 da NaN", () =>
    falla("cc5", 'let cuenta = {};\nfor (let i = 0; i < mensaje.length; i++) {\n  if (mensaje[i] !== " ") cuenta[mensaje[i]] = cuenta[mensaje[i]] + 1;\n}', /NaN/));

  it("cc6: devolver cuántas veces en vez de la letra", () =>
    falla(
      "cc6",
      "function masFrecuente(texto) {\n  let c = contar(texto);\n  let mejor = 0;\n  for (let l in c) { if (c[l] > mejor) mejor = c[l]; }\n  return mejor;\n}",
      /la letra/,
    ));

  it("cc7: sort sin flecha ordena por letras", () =>
    falla("cc7", 'let ranking = Object.keys(cuenta).sort();\nlet salto = (ALFABETO.indexOf(ranking[0]) - ALFABETO.indexOf("E") + 26) % 26;\nconsole.log(salto);', /alfabético/));

  it("cc7: ordenar al revés", () =>
    falla("cc7", 'let ranking = Object.keys(cuenta).sort((a, b) => cuenta[a] - cuenta[b]);\nlet salto = (ALFABETO.indexOf(ranking[0]) - 4 + 26) % 26;\nconsole.log(salto);', /al revés/));

  it("cc8: split('') da la vuelta a las letras", () =>
    falla("cc8", 'function enderezar(texto) {\n  return texto.split("").reverse().join("");\n}\nconsole.log(enderezar(mensaje));', /letras/));

  it("cc8: join sin espacio pega las palabras", () =>
    falla("cc8", 'function enderezar(texto) {\n  return texto.split(" ").reverse().join("");\n}\nconsole.log(enderezar(mensaje));', /join\(" "\)/));

  it("cc9: contar la A como 1", () =>
    falla("cc9", "function saltos(clave) {\n  let l = [];\n  for (let i = 0; i < clave.length; i++) l.push(ALFABETO.indexOf(clave[i]) + 1);\n  return l;\n}", /la A es 0/));

  it("cc10: los espacios gastan clave", () =>
    falla(
      "cc10",
      'function descifrarClave(texto, clave) {\n  let lista = saltos(clave);\n  let r = "";\n  for (let i = 0; i < texto.length; i++) {\n    if (texto[i] === " ") { r += " "; }\n    else { r += moverLetra(texto[i], 26 - lista[i % lista.length]); }\n  }\n  return r;\n}\nconsole.log(descifrarClave(mensaje, clave));',
      /espacios/,
    ));

  it("cc10: avanzar en vez de retroceder", () =>
    falla(
      "cc10",
      'function descifrarClave(texto, clave) {\n  let lista = saltos(clave);\n  let r = "";\n  let j = 0;\n  for (let i = 0; i < texto.length; i++) {\n    if (texto[i] === " ") { r += " "; }\n    else { r += moverLetra(texto[i], lista[j % lista.length]); j++; }\n  }\n  return r;\n}\nconsole.log(descifrarClave(mensaje, clave));',
      /26 - salto/,
    ));

  it("cc11: el bucle no llega al 25", () =>
    falla(
      "cc11",
      "function romperCesar(texto, cuna) {\n  for (let s = 0; s < 25; s++) {\n    if (descifrar(texto, s).includes(cuna)) return s;\n  }\n  return -1;\n}",
      /25/,
    ));

  it("cc11: olvidar el -1 cuando no hay salto", () =>
    falla("cc11", "function romperCesar(texto, cuna) {\n  for (let s = 0; s < 26; s++) {\n    if (descifrar(texto, s).includes(cuna)) return s;\n  }\n}", /-1/));

  it("cc12: devolver la clave en vez del mensaje", () =>
    falla(
      "cc12",
      'function romper(texto, claves) {\n  for (let i = 0; i < claves.length; i++) {\n    if (descifrarClave(texto, claves[i]).includes("CONVOY")) return claves[i];\n  }\n  return "";\n}\nconsole.log(romper(mensaje, claves));',
      /clave/,
    ));

  it('cc12: return "" dentro del bucle', () =>
    falla(
      "cc12",
      'function romper(texto, claves) {\n  for (let i = 0; i < claves.length; i++) {\n    let t = descifrarClave(texto, claves[i]);\n    if (t.includes("CONVOY")) { return t; } else { return ""; }\n  }\n}\nconsole.log(romper(mensaje, claves));',
      /dentro del bucle/,
    ));
});
