import { describe, expect, it } from "vitest";
import { TRAINING, TRAINING_EXERCISES } from "../src/game/training";
import { MISSIONS, findMission } from "../src/game/missions";
import { runSandboxed } from "../src/game/sandbox";

function play(id: string, code: string) {
  const m = findMission(id)!;
  const outs = m.cases.map((c) => runSandboxed({ code, globals: c.globals(), capture: m.capture, probe: m.probe }));
  return m.check(outs, m.cases);
}

describe("ejercicios de Margarita: la última pista los resuelve", () => {
  for (const m of TRAINING_EXERCISES) {
    it(m.id, () => {
      const r = play(m.id, m.hints[m.hints.length - 1]);
      expect(r.pass, r.feedback).toBe(true);
    });
  }
});

describe("sesiones bien enlazadas con la historia", () => {
  it("cada sesión va antes de una misión que existe", () => {
    for (const t of TRAINING) expect(MISSIONS.some((m) => m.id === t.before), t.id).toBe(true);
  });
  it("los ids no chocan con las misiones", () => {
    for (const e of TRAINING_EXERCISES) expect(MISSIONS.some((m) => m.id === e.id)).toBe(false);
  });
});

describe("errores típicos con mensaje claro", () => {
  it("t1a: total escrito a mano no sirve para otros precios", () => {
    expect(play("t1a", "let total = 3.75;\nconsole.log(total);").pass).toBe(false);
  });
  it("t1b: sin paréntesis", () => {
    expect(play("t1b", "let celsius = fahrenheit - 32 * 5 / 9;\nconsole.log(celsius);").feedback).toMatch(/paréntesis/);
  });
  it("t1c: creando otra variable", () => {
    expect(play("t1c", "let nuevo = ahorros + 20 - 7.5;\nconsole.log(nuevo);").feedback).toMatch(/no cambió/);
  });
  it("t2a: comillas normales", () => {
    expect(play("t2a", 'let tarjeta = "Feliz cumpleaños, ${nombre}. Ya tienes ${edad} años.";\nconsole.log(tarjeta);').feedback).toMatch(/comilla invertida/);
  });
  it("t2b: >= en vez de >", () => {
    expect(play("t2b", 'if (lluvia >= 50) { console.log("paraguas"); } else { console.log("sombrero"); }').feedback).toMatch(/límite|Mayor que 50/);
  });
  it("t2c: falta el último día", () => {
    expect(play("t2c", "let total = 0;\nfor (let i = 1; i < dias; i++) { total = total + i; }\nconsole.log(total);").feedback).toMatch(/último día/);
  });
  it("t2c: log dentro del bucle", () => {
    expect(play("t2c", "let total = 0;\nfor (let i = 1; i <= dias; i++) { total = total + i; console.log(total); }").feedback).toMatch(/después del bucle/);
  });
  it("t3a: empezar en 1", () => {
    expect(play("t3a", "console.log(notas[1]);\nconsole.log(notas[notas.length - 1]);").feedback).toMatch(/0/);
  });
  it("t3b: > en vez de >=", () => {
    expect(play("t3b", "let aprobadas = [];\nfor (let i = 0; i < notas.length; i++) { if (notas[i] > 6) aprobadas.push(notas[i]); }\nconsole.log(aprobadas);").feedback).toMatch(/seises/);
  });
  it("t3c: empezar en 0 falla con la lista cambiada? no: pasa, pero la última nota cuenta", () => {
    expect(play("t3c", "let mejor = notas[0];\nfor (let i = 1; i < notas.length - 1; i++) { if (notas[i] > mejor) mejor = notas[i]; }\nconsole.log(mejor);").pass).toBe(false);
  });
  it("t4a: sin return", () => {
    expect(play("t4a", "function doble(n) { n * 2; }").feedback).toMatch(/return/);
  });
  it("t4c: return dentro del bucle", () => {
    expect(play("t4c", "function gastoTotal(p) { let t = 0; for (let i = 0; i < p.length; i++) { t += p[i]; return t; } }").pass).toBe(false);
  });
});

describe("sesiones de los actos 3 a 6: errores típicos", () => {
  it("t6a: <= en vez de <", () => {
    expect(play("t6a", "let baratos = precios.filter((p) => p <= 5);\nconsole.log(baratos);").feedback).toMatch(/menor que 5/);
  });
  it("t6c: sin map", () => {
    expect(play("t6c", "let diplomas = alumnos.filter((a) => a.nota >= 6);\nconsole.log(diplomas);").feedback).toMatch(/map/);
  });
  it("t7b: cuenta compartida", () => {
    expect(play("t7b", "let cuenta = 0;\nfunction crearMetronomo(inicio) { if (cuenta === 0) cuenta = inicio; return () => { cuenta++; return cuenta; }; }").pass).toBe(false);
  });
  it("t7c: ahorro visible en el objeto", () => {
    expect(play("t7c", "function crearHucha() { return { ahorro: 0, meter(c) { this.ahorro += c; }, total() { return this.ahorro; } }; }").feedback).toMatch(/escondida/);
  });
  it("t8b: estado compartido", () => {
    expect(play("t8b", 'let af = false;\nclass Piano { constructor() {} afinar() { af = true; } estado() { return af ? "afinado" : "desafinado"; } }').feedback).toMatch(/this.afinado/);
  });
  it("t8c: sin super", () => {
    expect(play("t8c", "class Instrumento { constructor(n, c) { this.nombre = n; this.cuerdas = c; } }\nclass Violin extends Instrumento { constructor(d) { this.dueno = d; } ficha() { return ''; } }").feedback).toMatch(/super/);
  });
});
