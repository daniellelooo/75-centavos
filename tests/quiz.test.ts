import { describe, expect, it } from "vitest";
import { QUIZ } from "../src/game/concepts";
import { MISSIONS } from "../src/game/missions";
import { runSandboxed } from "../src/game/sandbox";

const norm = (s: string) => s.replace(/\s+/g, "").replace(/'/g, '"');

describe("preguntas del cuaderno: la respuesta marcada es la que imprime JavaScript", () => {
  it("hay una pregunta por misión", () => {
    for (const m of MISSIONS) expect(QUIZ[m.id], m.id).toBeTruthy();
  });
  for (const [id, q] of Object.entries(QUIZ)) {
    it(id, () => {
      const o = runSandboxed({ code: q.code, globals: {}, capture: [] });
      expect(o.ok).toBe(true);
      expect(norm(o.logs[o.logs.length - 1] ?? "undefined")).toBe(norm(q.options[q.answer]));
    });
  }
});
