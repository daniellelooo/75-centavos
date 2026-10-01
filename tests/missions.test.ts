import { describe, expect, it } from "vitest";
import { MISSIONS } from "../src/game/missions";
import { runSandboxed, runSandboxedAsync } from "../src/game/sandbox";
import { translateError } from "../src/game/errors";

function play(id: string, code: string) {
  const m = MISSIONS.find((x) => x.id === id)!;
  const outs = m.cases.map((c) => runSandboxed({ code, globals: c.globals(), capture: m.capture, probe: m.probe }));
  return m.check(outs, m.cases);
}

async function playAny(id: string, code: string) {
  const m = MISSIONS.find((x) => x.id === id)!;
  if (!m.async) return play(id, code);
  const outs = [];
  for (const c of m.cases) outs.push(await runSandboxedAsync({ code, globals: c.globals(), capture: m.capture, probe: m.probe }));
  return m.check(outs, m.cases);
}

describe("cada misión acepta su solución de referencia (última pista)", () => {
  for (const m of MISSIONS) {
    it(m.id, async () => {
      const r = await playAny(m.id, m.hints[m.hints.length - 1]);
      expect(r.feedback).toBeTruthy();
      expect(r.pass, r.feedback).toBe(true);
    });
  }
});

describe("actos 4 a 6: errores típicos", () => {
  it("m16: el código original de Ruth falla con un error legible", () => {
    const o = runSandboxed({ code: MISSIONS.find((m) => m.id === "m16")!.starter, globals: { llamadas: [1, 2] }, capture: ["total"] });
    expect(o.ok).toBe(false);
  });
  it("m16: total dentro del bucle", async () => {
    const r = await playAny("m16", "let total;\nfor (let i = 0; i < llamadas.length; i++) { total = 0; total += llamadas[i]; }\nconsole.log(total);");
    expect(r.feedback).toMatch(/última llamada/);
  });
  it("m17: cuenta compartida entre contadores", async () => {
    const r = await playAny("m17", "let cuenta = 0;\nfunction crearContador() { return function () { cuenta++; return cuenta; }; }");
    expect(r.feedback).toMatch(/comparten/);
  });
  it("m17: cuenta dentro de la función devuelta", async () => {
    const r = await playAny("m17", "function crearContador() { return function () { let cuenta = 0; cuenta++; return cuenta; }; }");
    expect(r.feedback).toMatch(/Siempre devuelve 1/);
  });
  it("m20: no se bloquea", async () => {
    const r = await playAny("m20", "function crearBoveda(clave) { return { abrir(i) { return i === clave; } }; }");
    expect(r.feedback).toMatch(/bloqueada/);
  });
  it("m22: olvidar this", async () => {
    const r = await playAny("m22", "class Nodo { constructor(nombre, ciudad) { this.nombre = nombre; this.ciudad = ciudad; } describir() { return `${typeof nombre === 'undefined' ? undefined : nombre} (x)`; } }");
    expect(r.feedback).toMatch(/this/);
  });
  it("m24: sin super", async () => {
    const r = await playAny("m24", "class Usuario { constructor(n) { this.nombre = n; } }\nclass Intruso extends Usuario { constructor(n, a) { this.alias = a; } ficha() { return ''; } }");
    expect(r.feedback).toMatch(/super/);
  });
  it("m26: orden al revés", async () => {
    const r = await playAny("m26", 'setTimeout(() => console.log("conectando"), 300);\nconsole.log("listo");');
    expect(r.feedback).toMatch(/al revés/);
  });
  it("m27: mostrar la promesa", async () => {
    const r = await playAny("m27", 'console.log(preguntarNodo("Bremen"));');
    expect(r.feedback).toMatch(/promesa/);
  });
  it("m28: olvidar await", async () => {
    const r = await playAny("m28", "async function revisar(nombres) { const a = []; for (const n of nombres) { const r = preguntarNodo(n); if (r.activo) a.push(n); } return a; }");
    expect(r.feedback).toMatch(/await/);
  });
  it("m29: sin try/catch", async () => {
    const r = await playAny("m29", "async function estado(n) { const r = await preguntarNodo(n); return r.activo; }");
    expect(r.feedback).toMatch(/try/);
  });
  it("m30: de uno en uno es demasiado lento", async () => {
    const r = await playAny("m30", "let abiertos = 0;\nfor (const n of nodos) { const r = await preguntarNodo(n); if (r.activo) abiertos++; }\nconsole.log(abiertos);");
    expect(r.feedback).toMatch(/uno en uno/);
  });
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

describe("actos 2 y 3: errores típicos", () => {
  it("m6: orden equivocado", () => {
    expect(play("m6", 'let sospechosas = ["nadir", "quasar", "hunter"]; console.log(sospechosas.length);').feedback).toMatch(/orden/);
  });
  it("m7: guardar todas las horas", () => {
    const code = "let madrugada = []; for (let i = 0; i < horas.length; i++) { madrugada.push(horas[i]); } console.log(madrugada);";
    expect(play("m7", code).feedback).toMatch(/if/);
  });
  it("m8: olvidar el return", () => {
    const code = 'function esSospechosa(cuenta) { cuenta === "hunter" || cuenta === "quasar" || cuenta === "nadir"; }';
    expect(play("m8", code).feedback).toMatch(/return/);
  });
  it("m8: sin función", () => {
    expect(play("m8", "let x = 1;").feedback).toMatch(/No encuentro/);
  });
  it("m9: sumar minutos sin convertir", () => {
    const code = "function duracion(h1, m1, h2, m2) { return (h2 - h1) * 60 + (m2 + m1); } console.log(duracion(2, 51, 3, 40));";
    expect(play("m9", code).pass).toBe(false);
  });
  it("m10: nombre de archivo sin .txt", () => {
    const code = "function archivoFalso(t) { return `SDINET-${t}`; } let archivos = []; for (const t of temas) archivos.push(archivoFalso(t)); console.log(archivos.length);";
    expect(play("m10", code).feedback).toMatch(/SDINET-radares\.txt/);
  });
  it("m11: número entre comillas", () => {
    expect(play("m11", 'let conexion = { cuenta: "hunter", hora: "3", minutos: 47 }; console.log(conexion.cuenta);').feedback).toMatch(/comillas/);
  });
  it("m12: contar todo", () => {
    expect(play("m12", "let veces = 0; for (const r of registros) veces++; console.log(veces);").feedback).toMatch(/todos/);
  });
  it("m14: olvidar el filter", () => {
    expect(play("m14", "const busquedas = registros.map((r) => r.comando); console.log(busquedas);").feedback).toMatch(/Filtra/);
  });
  it("m15: sumar objetos en vez de minutos", () => {
    expect(play("m15", "let total = 0; for (const s of sesiones) { total += s; } console.log(total);").feedback).toMatch(/texto/);
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
