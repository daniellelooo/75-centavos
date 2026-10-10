import { describe, expect, it } from "vitest";
import { runSql, sqlCheck } from "../src/game/sandbox-sql";
import { runDom } from "../src/game/sandbox-dom";

const SETUP = "CREATE TABLE vuelos (id INTEGER, destino TEXT, plazas INTEGER); INSERT INTO vuelos VALUES (1,'Denver',40),(2,'Chicago',12),(3,'Boston',25);";

describe("sandbox SQL", () => {
  it("compara el resultado con la referencia", async () => {
    const ok = await runSql({ code: "SELECT destino FROM vuelos WHERE plazas > 20 ORDER BY destino;", setup: SETUP, solution: "SELECT destino FROM vuelos WHERE plazas > 20 ORDER BY destino" });
    const check = sqlCheck({ ordered: true, ok: "bien" });
    expect(check([ok], [{ label: "a", globals: () => ({}) }]).pass).toBe(true);
    const bad = await runSql({ code: "SELECT destino FROM vuelos ORDER BY destino", setup: SETUP, solution: "SELECT destino FROM vuelos WHERE plazas > 20 ORDER BY destino" });
    expect(check([bad], [{ label: "a", globals: () => ({}) }]).feedback).toMatch(/3 filas y deberían ser 2/);
  });
  it("traduce los errores", async () => {
    const r = await runSql({ code: "SELEC * FROM vuelos", setup: SETUP, solution: "SELECT 1" });
    expect(r.ok).toBe(false);
    expect(r.error?.message).toMatch(/syntax error/);
  });
  it("verifica cambios con una consulta posterior", async () => {
    const r = await runSql({ code: "UPDATE vuelos SET plazas = 0 WHERE id = 2;", setup: SETUP, solution: "UPDATE vuelos SET plazas = 0 WHERE id = 2;", verify: "SELECT id, plazas FROM vuelos ORDER BY id" });
    expect(sqlCheck({ ordered: true, ok: "bien" })([r], [{ label: "a", globals: () => ({}) }]).pass).toBe(true);
  });
});

describe("sandbox DOM", () => {
  const HTML = `<html><head><style>h1{color:navy}</style></head><body><h1 id="t">Hola</h1><button id="b">Clic</button><input id="i"><p id="p"></p><ul id="l"></ul></body></html>`;
  it("cambia texto, clases y estilo", () => {
    const r = runDom({ html: HTML, code: `document.querySelector("#t").textContent = "Nébula"; document.querySelector("#t").classList.add("grande"); document.querySelector("#t").style.color = "red";`, probe: `({ t: __text("#t"), c: document.querySelector("#t").className, s: document.querySelector("#t").style.color })` });
    expect(r.ok).toBe(true);
    expect(r.values.__probe).toEqual({ t: "Nébula", c: "grande", s: "red" });
    expect(String(r.values.__html)).toMatch(/Nébula/);
  });
  it("eventos: clic, escribir y crear elementos", () => {
    const code = `let n = 0;
document.querySelector("#b").addEventListener("click", () => { n++; document.querySelector("#p").textContent = "Clics: " + n; });
document.querySelector("#i").addEventListener("input", (e) => { const li = document.createElement("li"); li.textContent = e.target.value; document.querySelector("#l").appendChild(li); });`;
    const r = runDom({ html: HTML, code, probe: `(__click("#b"), __click("#b"), __type("#i", "hola"), { p: __text("#p"), li: __count("#l li"), primero: __text("#l li") })` });
    expect(r.values.__probe).toEqual({ p: "Clics: 2", li: 1, primero: "hola" });
  });
  it("delegación: el evento sube al padre", () => {
    const r = runDom({ html: `<body><ul id="l"><li>a</li><li>b</li></ul><p id="p"></p></body>`, code: `document.querySelector("#l").addEventListener("click", (e) => { document.querySelector("#p").textContent = e.target.textContent; });`, probe: `(__click("#l li:nth-child(2)"), __text("#p"))` });
    expect(r.values.__probe).toBe("b");
  });
  it("submit con preventDefault", () => {
    const r = runDom({ html: `<body><form id="f"><input id="i"></form></body>`, code: `document.querySelector("#f").addEventListener("submit", (e) => e.preventDefault());`, probe: `__submit("#f")` });
    expect(r.values.__probe).toBe(true);
  });
  it("los errores dicen la línea", () => {
    const r = runDom({ html: HTML, code: `let x = 1;\ndocument.querySelector("#nada").textContent = "x";` });
    expect(r.ok).toBe(false);
    expect(r.error?.line).toBe(2);
  });
});
