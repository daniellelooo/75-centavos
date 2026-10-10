// Errores típicos en las misiones de Medianoche y el mensaje que debe ver el jugador.
import { describe, expect, it } from "vitest";
import { grade } from "../src/game/run-local";
import { CONTENT } from "../src/stories/medianoche/content";

const m = (id: string) => CONTENT.missions.find((x) => x.id === id)!;

describe("medianoche: errores típicos", () => {
  it("mn1: deja \"05\" como texto (sin Number)", async () => {
    const r = await grade(m("mn1"), 'let p = fecha.split("/");\nlet dia = p[0];\nlet mes = p[1];\nlet anio = p[2];\nconsole.log(anio);');
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/texto/);
    expect(r.feedback).toMatch(/Number/);
  });

  it("mn1: escribe el año a mano y falla con otra fecha", async () => {
    const r = await grade(m("mn1"), "let dia = 31;\nlet mes = 12;\nlet anio = 99;\nconsole.log(anio);");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/a mano/);
  });

  it("mn1: sin console.log", async () => {
    const r = await grade(m("mn1"), 'let p = fecha.split("/");\nlet dia = Number(p[0]);\nlet mes = Number(p[1]);\nlet anio = Number(p[2]);');
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/console\.log/);
  });

  it("mn2: return olvidado", async () => {
    const r = await grade(m("mn2"), "function anioCompleto(aa) {\n  if (aa <= 49) { 2000 + aa; } else { 1900 + aa; }\n}");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/return/);
  });

  it("mn2: la rutina vieja convierte 00 en 1900", async () => {
    const r = await grade(m("mn2"), "function anioCompleto(aa) {\n  return 1900 + aa;\n}");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/20xx/);
  });

  it("mn2: límite de la ventana con < en vez de <=", async () => {
    const r = await grade(m("mn2"), "function anioCompleto(aa) {\n  if (aa < 49) return 2000 + aa;\n  return 1900 + aa;\n}");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/límite/);
  });

  it("mn3: olvida padStart", async () => {
    const r = await grade(m("mn3"), "function formatear(dia, mes, anio) {\n  return `${dia}/${mes}/${anio}`;\n}");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/padStart/);
  });

  it("mn3: padStart sobre un número", async () => {
    const r = await grade(m("mn3"), 'function formatear(dia, mes, anio) {\n  return dia.padStart(2, "0") + "/" + mes.padStart(2, "0") + "/" + anio;\n}');
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/String/);
  });

  it("mn4: devuelve texto en vez de número", async () => {
    const r = await grade(
      m("mn4"),
      'function clave(t) {\n  const p = t.split("/");\n  const a = Number(p[2]) <= 49 ? 2000 + Number(p[2]) : 1900 + Number(p[2]);\n  return `${a}${p[1]}${p[0]}`;\n}',
    );
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/número/);
  });

  it("mn4: sin ventana, 00 queda en 1900", async () => {
    const r = await grade(m("mn4"), 'function clave(t) {\n  const p = t.split("/").map(Number);\n  return (1900 + p[2]) * 10000 + p[1] * 100 + p[0];\n}');
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/1900/);
  });

  it("mn5: bisiesto solo con el 4 falla con 1900", async () => {
    const r = await grade(m("mn5"), "function esBisiesto(a) {\n  return a % 4 === 0;\n}");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/100/);
  });

  it("mn5: sin la regla del 400 falla con 2000", async () => {
    const r = await grade(m("mn5"), "function esBisiesto(a) {\n  return a % 4 === 0 && a % 100 !== 0;\n}");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/400/);
  });

  it("mn6: lee la lista sin restar 1", async () => {
    const r = await grade(
      m("mn6"),
      "function diasDelMes(mes, anio) {\n  const d = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n  if (mes === 2 && esBisiesto(anio)) return 29;\n  return d[mes];\n}",
    );
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/mes - 1/);
  });

  it("mn6: olvida el bisiesto", async () => {
    const r = await grade(m("mn6"), "function diasDelMes(mes, anio) {\n  const d = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];\n  return d[mes - 1];\n}");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/esBisiesto/);
  });

  it("mn7: olvida que los meses de Date.UTC empiezan en 0", async () => {
    const r = await grade(
      m("mn7"),
      "function diasEntre(a, b) {\n  return (Date.UTC(b.anio, b.mes, b.dia) - Date.UTC(a.anio, a.mes, a.dia)) / 86400000;\n}",
    );
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/empiezan en 0/);
  });

  it("mn7: devuelve milisegundos", async () => {
    const r = await grade(m("mn7"), "function diasEntre(a, b) {\n  return Date.UTC(b.anio, b.mes - 1, b.dia) - Date.UTC(a.anio, a.mes - 1, a.dia);\n}");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/milisegundos/);
  });

  it("mn8: devuelve número sin toFixed", async () => {
    const r = await grade(m("mn8"), 'function interes(s, t, d) {\n  if (d < 0) return "0.00";\n  return s * t / 100 / 365 * d;\n}');
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/toFixed/);
  });

  it("mn8: paga intereses negativos con el error de 1900", async () => {
    const r = await grade(m("mn8"), "function interes(s, t, d) {\n  return (s * t / 100 / 365 * d).toFixed(2);\n}");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/0\.00/);
  });

  it("mn9: cuenta un número escrito a mano", async () => {
    const r = await grade(m("mn9"), "function probar(casos) {\n  return 3;\n}\nconsole.log(probar(casos));");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/a mano/);
  });

  it("mn10: sin try/catch el lote se cae", async () => {
    const r = await grade(
      m("mn10"),
      'let buenas = 0;\nlet malas = 0;\nfunction leerFecha(t) {\n  const p = t.split("/");\n  if (p.length !== 3) throw new Error("Fecha mala: " + t);\n  for (const x of p) if (Number.isNaN(Number(x))) throw new Error("Fecha mala: " + t);\n  return clave(t);\n}\nfor (const t of lote) { leerFecha(t); buenas++; }\nconsole.log(buenas, malas);',
    );
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/Fecha mala/);
  });

  it("mn10: no lanza error con fechas sin barras", async () => {
    const r = await grade(
      m("mn10"),
      'let buenas = 0;\nlet malas = 0;\nfunction leerFecha(t) {\n  for (const x of t.split("/")) if (Number.isNaN(Number(x))) throw new Error("Fecha mala: " + t);\n  return clave(t);\n}\nconsole.log(buenas, malas);',
    );
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/3 pedazos/);
  });

  it("mn11: ordena las fechas como texto", async () => {
    const r = await grade(m("mn11"), "const ordenados = movimientos.sort((a, b) => (a.fecha < b.fecha ? -1 : 1));\nconsole.log(ordenados[0].fecha);");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/como texto/);
  });

  it("mn11: sort sin comparador", async () => {
    const r = await grade(m("mn11"), "const ordenados = movimientos.sort();\nconsole.log(ordenados[0].fecha);");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/comparador/);
  });

  it("mn12: < en vez de <= deja fuera las que vencen el 31", async () => {
    const r = await grade(
      m("mn12"),
      "function cierre(cuentas) {\n  let total = 0, vencidas = 0, errores = 0;\n  for (const c of cuentas) {\n    try {\n      const v = leerFecha(c.vence);\n      total += c.saldo;\n      if (v < corte) vencidas++;\n    } catch (e) { errores++; }\n  }\n  return { total, vencidas, errores };\n}\nconsole.log(cierre(cuentas));",
    );
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/<=/);
  });

  it("mn12: suma el saldo antes de validar la fecha", async () => {
    const r = await grade(
      m("mn12"),
      "function cierre(cuentas) {\n  let total = 0, vencidas = 0, errores = 0;\n  for (const c of cuentas) {\n    total += c.saldo;\n    try {\n      if (leerFecha(c.vence) <= corte) vencidas++;\n    } catch (e) { errores++; }\n  }\n  return { total, vencidas, errores };\n}\nconsole.log(cierre(cuentas));",
    );
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/fecha mala/);
  });
});
