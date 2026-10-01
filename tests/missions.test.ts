import { describe, expect, it } from "vitest";
import { MISSIONS } from "../src/game/missions";
import { runSandboxed } from "../src/game/sandbox";
import { translateError } from "../src/game/errors";

function play(id: string, code: string) {
  const m = MISSIONS.find((x) => x.id === id)!;
  const outs = m.cases.map((c) => runSandboxed({ code, globals: c.globals(), capture: m.capture }));
  return m.check(outs, m.cases);
}

describe("cada misión acepta su solución de referencia (última pista)", () => {
  for (const m of MISSIONS) {
    it(m.id, () => {
      const r = play(m.id, m.hints[m.hints.length - 1]);
      expect(r.feedback).toBeTruthy();
      expect(r.pass).toBe(true);
    });
  }
});

describe("errores típicos de principiante dan una pista útil", () => {
  it("m1: olvidar console.log", () => {
    const r = play("m1", "let facturado = 2387.50;");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/console\.log/);
  });
  it("m2: restar al revés", () => {
    const r = play("m2", "let diferencia = pagado - facturado; console.log(diferencia);");
    expect(r.feedback).toMatch(/al revés/);
  });
  it("m3: escribir hunter a mano", () => {
    const r = play("m3", 'let informe = "Cuenta sin dueño: hunter"; console.log(informe);');
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/a mano/);
  });
  it("m4: usar <= en vez de <", () => {
    const r = play("m4", 'if (hora <= 6) { console.log("ALERTA") } else { console.log("normal") }');
    expect(r.feedback).toMatch(/hora = 6/);
  });
  it("m5: número a mano", () => {
    const r = play("m5", "let noches = 12; for (let d = 1; d <= 30; d++) huboConexion(d); console.log(noches);");
    expect(r.pass).toBe(false);
  });
  it("m5: off-by-one", () => {
    const r = play(
      "m5",
      "let noches = 0; for (let d = 0; d <= 30; d++) { if (huboConexion(d)) noches++; } console.log(noches);",
    );
    expect(r.feedback).toMatch(/31 días/);
  });
});

describe("sandbox", () => {
  it("captura la línea del error", () => {
    const o = runSandboxed({ code: "let a = 1;\nconsole.log(b);", globals: {}, capture: [] });
    expect(o.ok).toBe(false);
    expect(o.error?.line).toBe(2);
    expect(translateError(o.error!.name, o.error!.message).title).toMatch(/"b"/);
  });
  it("strict mode impide globales accidentales", () => {
    const o = runSandboxed({ code: "total = 5;", globals: {}, capture: [] });
    expect(o.ok).toBe(false);
  });
  it("redeclarar una variable prestada se explica", () => {
    const o = runSandboxed({ code: "let cuenta = 1;", globals: { cuenta: "x" }, capture: [] });
    expect(translateError(o.error!.name, o.error!.message).title).toMatch(/ya existe/);
  });
});
