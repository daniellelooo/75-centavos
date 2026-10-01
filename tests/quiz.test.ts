import { describe, expect, it } from "vitest";
import { QUIZ } from "../src/game/concepts";
import { MISSIONS } from "../src/game/missions";
import { runSandboxedAsync } from "../src/game/sandbox";

const norm = (s: string) => s.replace(/\s+/g, "").replace(/'/g, '"');

describe("preguntas del cuaderno: la respuesta marcada es la que imprime JavaScript", () => {
  it("hay una pregunta por misión", () => {
    for (const m of MISSIONS) expect(QUIZ[m.id], m.id).toBeTruthy();
  });
  for (const [id, q] of Object.entries(QUIZ)) {
    it(id, async () => {
      const o = await runSandboxedAsync({ code: q.code, globals: {}, capture: [] });
      expect(o.ok).toBe(true);
      const all = o.logs.join(" y luego ");
      const last = o.logs[o.logs.length - 1] ?? "undefined";
      const want = norm(q.options[q.answer]);
      expect([norm(last), norm(all)]).toContain(want);
    });
  }
});
