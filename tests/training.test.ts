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

describe("chuleta de fin de acto", () => {
  it("cada misión tiene su línea", async () => {
    const { CHEAT } = await import("../src/game/cheats");
    for (const m of MISSIONS) expect(CHEAT[m.id], m.id).toBeTruthy();
  });
});

describe("expediente de Sam", () => {
  it("el rango sube al cerrar cada acto", async () => {
    const { actsDone, rankOf, RANKS } = await import("../src/game/rank");
    expect(actsDone(0)).toBe(0);
    expect(actsDone(4)).toBe(0);
    expect(actsDone(5)).toBe(1);
    expect(actsDone(MISSIONS.length)).toBe(6);
    expect(rankOf(MISSIONS.length)).toBe(RANKS[6]);
  });
});

describe("terminal libre", () => {
  it("se encuentra y ejecuta cualquier código sin comprobar nada", () => {
    const m = findMission("libre")!;
    expect(m).toBeTruthy();
    const o = runSandboxed({ code: "console.log(1 + 1);", globals: m.cases[0].globals(), capture: m.capture });
    expect(o.logs).toEqual(["2"]);
    expect(m.check([o], m.cases).pass).toBe(true);
  });
});

describe("erratas típicas", () => {
  it("detecta lenght, consol.log y fuction, y deja pasar el código bien escrito", async () => {
    const { typoHint } = await import("../src/game/errors");
    expect(typoHint("console.log(x.lenght)")).toMatch(/length/);
    expect(typoHint("consol.log(1)")).toMatch(/console.log/);
    expect(typoHint("fuction f() {}")).toMatch(/function/);
    expect(typoHint("let x = [1, 2];\nconsole.log(x.length);\nfunction f() { return 1; }")).toBeNull();
    for (const m of [...MISSIONS, ...TRAINING_EXERCISES]) expect(typoHint(m.hints[m.hints.length - 1]), m.id).toBeNull();
  });
});

describe("nombres casi iguales", () => {
  it("avisa de celcius por celsius y de Total por total, y calla si está bien", async () => {
    const { nameHint } = await import("../src/game/errors");
    expect(nameHint("let celcius = 1;", ["celsius"])).toMatch(/celsius/);
    expect(nameHint("let Total = 1;", ["total"])).toMatch(/mayúsculas/);
    expect(nameHint("function dobel(n) {}", ["doble"])).toMatch(/doble/);
    expect(nameHint("let celsius = 1;", ["celsius"])).toBeNull();
    for (const m of [...MISSIONS, ...TRAINING_EXERCISES]) {
      const probed = m.probe?.match(/typeof\s+([A-Za-z_$][\w$]*)/)?.[1];
      expect(nameHint(m.hints[m.hints.length - 1], [...m.capture, ...(probed ? [probed] : [])]), m.id).toBeNull();
    }
  });
});

describe("informe de pruebas", () => {
  it("dice qué prueba falla y detecta el número escrito a mano", async () => {
    const { caseReports, hardcodeHint, describeInputs } = await import("../src/game/report");
    const m = findMission("t2c")!;
    const code = "let total = 0;\nfor (let i = 1; i <= 7; i++) {\n  total = total + i;\n}\nconsole.log(total);";
    const outs = m.cases.map((c) => runSandboxed({ code, globals: c.globals(), capture: m.capture, probe: m.probe }));
    const reps = caseReports(m, outs);
    expect(reps.map((r) => r.pass)).toEqual([true, false]);
    expect(reps[1].inputs).toBe("dias = 30");
    expect(reps[1].printed).toBe("28");
    expect(hardcodeHint(code, m)).toMatch(/número 7.*`dias`/);
    expect(hardcodeHint(m.hints[m.hints.length - 1], m)).toBeNull();
    expect(describeInputs(findMission("t3a")!.cases[0])).toBe("notas = [6,8,7,9]");
  });
  it("no acusa de número fijo a ninguna solución de referencia", async () => {
    const { hardcodeHint } = await import("../src/game/report");
    for (const m of [...MISSIONS, ...TRAINING_EXERCISES]) expect(hardcodeHint(m.hints[m.hints.length - 1], m), m.id).toBeNull();
  });
});

describe("errores de escritura con su línea", () => {
  it("encuentra la línea y explica la causa", async () => {
    const { locateSyntax } = await import("../src/game/syntax");
    const a = locateSyntax("let total = 0;\nfor (let i = 1; i <= dias; i++ {\n  total = total + i;\n}\nconsole.log(total);")!;
    expect(a.line).toBe(2);
    expect(a.why).toMatch(/paréntesis/);
    const b = locateSyntax("if (x > 3) {\n  console.log(1);\n}}\n")!;
    expect(b.line).toBe(3);
    expect(b.why).toMatch(/sobra una llave/);
    const c = locateSyntax('let nombre = "Ruth;\nconsole.log(nombre);')!;
    expect(c.line).toBe(1);
    expect(c.why).toMatch(/comilla|texto/);
    const d = locateSyntax("function f() {\n  return 1;\n")!;
    expect(d.line).toBe(1);
    expect(d.why).toMatch(/nunca lo cerraste/);
    const e = locateSyntax("if x > 3 {\n}")!;
    expect(e.why).toMatch(/paréntesis/);
    expect(locateSyntax("let x = 1;\nconsole.log(x);")).toBeNull();
  });
  it("ninguna solución de referencia da error de escritura", async () => {
    const { locateSyntax } = await import("../src/game/syntax");
    for (const m of [...MISSIONS, ...TRAINING_EXERCISES]) expect(locateSyntax(m.hints[m.hints.length - 1]), m.id).toBeNull();
  });
});

describe("nombres que no existen", () => {
  it("explica el parámetro usado fuera de su función y sugiere el parecido", async () => {
    const { missingNameHint } = await import("../src/game/errors");
    const code = "function archivoFalso(tema) {\n  return `SDINET-${tema}.txt`;\n}\nlet archivos = [];\nfor (let i = 0; i < temas.length; i++) {\n  archivos.push(archivoFalso(tema[i]));\n}";
    const h = missingNameHint("tema", code, ["temas"])!;
    expect(h).toMatch(/parámetro de la función `archivoFalso`/);
    expect(h).toMatch(/`temas`/);
    expect(missingNameHint("totl", "let total = 0;\nconsole.log(totl);", [])).toMatch(/`total`/);
    expect(missingNameHint("xyz", "let a = 1;", [])).toBeNull();
  });
});

describe("textos sin cerrar y palabras sin comillas", () => {
  it("señala la comilla invertida sin cerrar en su línea, no la llave", async () => {
    const { locateSyntax } = await import("../src/game/syntax");
    const s = locateSyntax("function etiqueta(fruta, anio) {\n  return `Mermelada de ${fruta} (${anio}) ;\n}\n\nconsole.log(etiqueta(manzana, 2005));")!;
    expect(s.line).toBe(2);
    expect(s.why).toMatch(/comilla invertida/);
  });
  it("sugiere comillas solo cuando la palabra va como dato en una llamada", async () => {
    const { missingNameHint } = await import("../src/game/errors");
    expect(missingNameHint("manzana", "console.log(etiqueta(manzana, 2005));", [])).toMatch(/"manzana"/);
    expect(missingNameHint("contador", "contador = contador + 1;", [])).toBeNull();
  });
});
