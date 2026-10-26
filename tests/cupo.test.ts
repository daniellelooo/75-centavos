import { describe, expect, it } from "vitest";
import { AVISO_CUPO, LIMITE_CUENTAS, cupoLleno } from "../src/shared/cupo";

describe("cupo de cuentas", () => {
  it("queda cupo por debajo del límite de Clerk", () => {
    expect(cupoLleno(0)).toBe(false);
    expect(cupoLleno(LIMITE_CUENTAS - 1)).toBe(false);
  });
  it("se llena al llegar al límite", () => {
    expect(cupoLleno(LIMITE_CUENTAS)).toBe(true);
    expect(cupoLleno(LIMITE_CUENTAS + 5)).toBe(true);
  });
  it("el aviso dice que se puede jugar sin sesión y guardar en el navegador", () => {
    expect(AVISO_CUPO.texto).toMatch(/sin sesión/);
    expect(AVISO_CUPO.texto).toMatch(/navegador/);
  });
});
