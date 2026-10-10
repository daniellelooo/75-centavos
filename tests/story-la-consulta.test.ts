// Errores típicos en las misiones de La consulta: el corrector tiene que explicar qué falla.
import { describe, expect, it } from "vitest";
import { grade } from "../src/game/run-local";
import { CONTENT } from "../src/stories/la-consulta/content";

const m = (id: string) => CONTENT.missions.find((x) => x.id === id)!;

describe("La consulta: errores típicos", () => {
  it("lc1: columnas en otro orden", async () => {
    const r = await grade(m("lc1"), "SELECT destino, numero FROM vuelos;");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/en otro orden: deberían ir así: numero, destino/);
  });

  it("lc1: en minúsculas también vale", async () => {
    const r = await grade(m("lc1"), "select numero, destino from vuelos");
    expect(r.pass, r.feedback).toBe(true);
  });

  it("lc2: sin WHERE sobran filas", async () => {
    const r = await grade(m("lc2"), "SELECT * FROM vuelos;");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/Sobran filas/);
  });

  it("lc2: el texto sin comillas no es una ciudad sino una columna", async () => {
    const r = await grade(m("lc2"), "SELECT * FROM vuelos WHERE destino = Denver;");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/no such column: Denver/);
  });

  it("lc3: sin paréntesis el AND solo afecta a Reno", async () => {
    const r = await grade(
      m("lc3"),
      "SELECT numero, destino, plazas_libres FROM vuelos WHERE plazas_libres >= 10 AND destino = 'Reno' OR destino = 'Denver';",
    );
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/Sobran filas/);
  });

  it("lc4: orden al revés (DESC en vez de ASC)", async () => {
    const r = await grade(m("lc4"), "SELECT numero, destino, precio FROM vuelos ORDER BY precio DESC LIMIT 3;");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/La fila 1 no cuadra/);
  });

  it("lc4: olvidar el LIMIT", async () => {
    const r = await grade(m("lc4"), "SELECT numero, destino, precio FROM vuelos ORDER BY precio;");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/deberían ser 3/);
  });

  it("lc5: sin DISTINCT salen ciudades repetidas", async () => {
    const r = await grade(m("lc5"), "SELECT destino FROM vuelos;");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/devuelve 10 filas y deberían ser 5/);
  });

  it("lc6: sin AS la columna se llama COUNT(*)", async () => {
    const r = await grade(m("lc6"), "SELECT COUNT(*), SUM(plazas_libres) AS plazas, AVG(precio) AS precio_medio FROM vuelos;");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/se llama «COUNT\(\*\)» y debería llamarse «vuelos»/);
  });

  it("lc6: SUM en vez de AVG para el precio", async () => {
    const r = await grade(m("lc6"), "SELECT COUNT(*) AS vuelos, SUM(plazas_libres) AS plazas, SUM(precio) AS precio_medio FROM vuelos;");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/no deberían estar/);
  });

  it("lc7: olvidar el GROUP BY deja una sola fila", async () => {
    const r = await grade(m("lc7"), "SELECT destino, COUNT(*) AS vuelos, MIN(precio) AS desde FROM vuelos;");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/devuelve 1 fila y deberían ser 5/);
  });

  it("lc8: filtrar el grupo con WHERE en vez de HAVING", async () => {
    const r = await grade(
      m("lc8"),
      "SELECT destino, SUM(plazas_libres) AS plazas FROM vuelos WHERE SUM(plazas_libres) >= 30 GROUP BY destino;",
    );
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/misuse of aggregate/);
  });

  it("lc8: con HAVING sobre el nombre del AS también vale", async () => {
    const r = await grade(m("lc8"), "SELECT destino, SUM(plazas_libres) AS plazas FROM vuelos GROUP BY destino HAVING plazas >= 30;");
    expect(r.pass, r.feedback).toBe(true);
  });

  it("lc9: JOIN sin ON mezcla cada reserva con todos los pasajeros", async () => {
    const r = await grade(m("lc9"), "SELECT nombre, asiento FROM reservas JOIN pasajeros;");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/Sobran filas/);
  });

  it("lc9: el ON con las columnas equivocadas", async () => {
    const r = await grade(m("lc9"), "SELECT nombre, asiento FROM reservas JOIN pasajeros ON reservas.id = pasajeros.id;");
    expect(r.pass).toBe(false);
  });

  it("lc10: con JOIN normal los que no tienen reserva no salen", async () => {
    const r = await grade(
      m("lc10"),
      "SELECT nombre, telefono FROM pasajeros JOIN reservas ON reservas.pasajero_id = pasajeros.id WHERE reservas.id IS NULL;",
    );
    expect(r.pass).toBe(false);
  });

  it("lc10: LEFT JOIN sin el filtro IS NULL trae a todos", async () => {
    const r = await grade(m("lc10"), "SELECT nombre, telefono FROM pasajeros LEFT JOIN reservas ON reservas.pasajero_id = pasajeros.id;");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/Sobran filas/);
  });

  it("lc11: UPDATE sin WHERE cambia todos los vuelos", async () => {
    const r = await grade(m("lc11"), "UPDATE vuelos SET precio = precio - 10;");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/La fila 1 no cuadra/);
  });

  it("lc11: el precio escrito a mano falla en la otra semana", async () => {
    const r = await grade(m("lc11"), "UPDATE vuelos SET precio = 40 WHERE destino = 'Reno';");
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/segunda semana de mayo/);
  });

  it("lc11: un SELECT no cambia la tabla", async () => {
    const r = await grade(m("lc11"), "SELECT * FROM vuelos WHERE destino = 'Reno';");
    expect(r.pass).toBe(false);
  });

  it("lc12: orden al revés", async () => {
    const r = await grade(
      m("lc12"),
      "SELECT destino, COUNT(*) AS reservas, SUM(precio) AS ingresos FROM reservas JOIN vuelos ON reservas.vuelo_id = vuelos.id GROUP BY destino ORDER BY ingresos;",
    );
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/otro orden/);
  });

  it("lc12: sin ORDER BY no está ordenado", async () => {
    const r = await grade(
      m("lc12"),
      "SELECT destino, COUNT(*) AS reservas, SUM(precio) AS ingresos FROM reservas JOIN vuelos ON reservas.vuelo_id = vuelos.id GROUP BY destino;",
    );
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/otro orden/);
  });

  it("lc12: olvidar el GROUP BY", async () => {
    const r = await grade(
      m("lc12"),
      "SELECT destino, COUNT(*) AS reservas, SUM(precio) AS ingresos FROM reservas JOIN vuelos ON reservas.vuelo_id = vuelos.id ORDER BY ingresos DESC;",
    );
    expect(r.pass).toBe(false);
    expect(r.feedback).toMatch(/devuelve 1 fila/);
  });
});
