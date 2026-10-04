import { describe, expect, it } from "vitest";
import { NIVELES, RETOS } from "../src/retos/data";
import { corregir, probeFor } from "../src/retos/check";
import { runSandboxed } from "../src/game/sandbox";

/** Ejecuta como el Worker, pero aquí mismo. */
function correr(id: string, code: string) {
  const r = RETOS.find((x) => x.id === id)!;
  const outs = r.casos.map((c) => runSandboxed({ code, globals: {}, capture: [], probe: probeFor(r.fn, c.args) }));
  return corregir(r, code, outs);
}

/** La última pista es el cuerpo de la solución: se mete dentro de la función de inicio. */
const solucion = (id: string) => {
  const r = RETOS.find((x) => x.id === id)!;
  const cuerpo = r.pistas[r.pistas.length - 1];
  return r.inicio.replace("{\n  \n}", `{\n${cuerpo}\n}`);
};

describe("retos: la última pista los resuelve", () => {
  for (const r of RETOS) {
    it(r.id, () => {
      const res = correr(r.id, solucion(r.id));
      expect(res.tipo, JSON.stringify(res)).toBe("ok");
    });
  }
});

describe("retos bien formados", () => {
  it("ids únicos y cada nivel con 8 retos", () => {
    expect(new Set(RETOS.map((r) => r.id)).size).toBe(RETOS.length);
    for (const n of NIVELES) expect(RETOS.filter((r) => r.nivel === n.n).length).toBe(8);
  });
  it("el código de inicio no resuelve nada", () => {
    for (const r of RETOS) expect(correr(r.id, r.inicio).tipo, r.id).not.toBe("ok");
  });
});

describe("retos: errores con mensaje claro", () => {
  it("sin return", () => {
    const res = correr("es-par", "function esPar(n) {\n  console.log(n % 2 === 0);\n}");
    expect(res.tipo).toBe("falla");
    if (res.tipo === "falla") expect(res.consejo).toMatch(/return/);
  });
  it("nombre de función equivocado", () => {
    const res = correr("fizzbuzz", "function fizzbuzz(n) { return n; }");
    expect(res.tipo).toBe("error");
    if (res.tipo === "error") expect(res.titulo).toMatch(/fizzBuzz/);
  });
  it("número en vez de texto", () => {
    const res = correr("fizzbuzz", 'function fizzBuzz(n) { if (n % 15 === 0) return "FizzBuzz"; if (n % 3 === 0) return "Fizz"; if (n % 5 === 0) return "Buzz"; return n; }');
    expect(res.tipo).toBe("falla");
    if (res.tipo === "falla") expect(res.consejo).toMatch(/tipo/);
  });
  it("error dentro de la función dice con qué llamada", () => {
    const res = correr("maximo", "function maximo(lista) { return lista.foo.bar; }");
    expect(res.tipo).toBe("error");
    if (res.tipo === "error") expect(res.detalle).toMatch(/maximo\(\[3, 9, 2\]\)/);
  });
  it("maximo empezando en 0 falla con los negativos", () => {
    const res = correr("maximo", "function maximo(lista) { let m = 0; for (const n of lista) if (n > m) m = n; return m; }");
    expect(res.tipo).toBe("falla");
  });
});

describe("errores de escritura", () => {
  it("un paréntesis sin cerrar se señala en su línea, no en la llave de después", async () => {
    const { locateSyntax } = await import("../src/game/syntax");
    const s = locateSyntax('function f(n) {\n  if (n % 15 === 0 return "x";\n}');
    expect(s?.line).toBe(2);
    expect(s?.why).toMatch(/paréntesis/);
  });
});

describe("retos: atajos prohibidos y valores legibles", () => {
  it("búsqueda binaria con indexOf avisa", () => {
    const res = correr("busqueda-binaria", "function buscar(lista, objetivo) { return lista.indexOf(objetivo); }");
    expect(res.tipo).toBe("error");
    if (res.tipo === "error") expect(res.titulo).toMatch(/atajo/);
  });
  it("un atajo dentro de un comentario no cuenta", () => {
    const code = solucion("aplanar").replace("{\n", "{\n  // sin .flat() a propósito\n");
    expect(correr("aplanar", code).tipo).toBe("ok");
  });
  it("los objetos se muestran como en JavaScript", async () => {
    const { mostrar } = await import("../src/retos/check");
    expect(mostrar({ h: 1, "dos palabras": "x" })).toBe('{ h: 1, "dos palabras": "x" }');
    expect(mostrar([1, [2, "a"]])).toBe('[1, [2, "a"]]');
    expect(mostrar({})).toBe("{}");
  });
  it("fibonacci recursivo ingenuo también pasa", () => {
    const res = correr("fibonacci", "function fibonacci(n) { return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2); }");
    expect(res.tipo).toBe("ok");
  });
});
