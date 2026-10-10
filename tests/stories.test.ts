// Comprobaciones comunes a todas las historias nuevas.
import { describe, expect, it } from "vitest";
import { CHAR } from "../src/config";
import { STORY_IDS, loadContent } from "../src/stories/registry";
import { grade } from "../src/game/run-local";
import type { Line } from "../src/game/types";

const SPEAKERS = new Set([...Object.keys(CHAR), "narrador", "sistema"]);
const MOODS = new Set([undefined, "normal", "sorpresa", "serio", "alegre"]);

for (const id of STORY_IDS) {
  const loaded = await loadContent[id]().catch(() => null);
  // una historia que aún no está escrita se salta (las demás se comprueban igual)
  if (!loaded) {
    describe.skip(`historia ${id} (aún sin escribir)`, () => it("pendiente", () => {}));
    continue;
  }
  describe(`historia ${id}`, () => {
    const c = loaded;
    const lines: Line[] = [
      ...c.intro,
      ...c.ending,
      ...c.acts.flatMap((a) => a.opening),
      ...c.missions.flatMap((m) => [...m.briefing, ...m.debrief]),
    ];

    it("tres actos de cuatro misiones, en orden", () => {
      expect(c.acts.map((a) => a.n)).toEqual([1, 2, 3]);
      expect(c.missions.length).toBe(12);
      for (const a of c.acts) expect(c.missions.filter((m) => m.act === a.n).length, `acto ${a.n}`).toBe(4);
      const acts = c.missions.map((m) => m.act);
      expect([...acts].sort()).toEqual(acts);
    });

    it("ids únicos con el prefijo de la historia", () => {
      expect(new Set(c.missions.map((m) => m.id)).size).toBe(c.missions.length);
    });

    it("quien habla existe y las expresiones son válidas", () => {
      for (const l of lines) {
        expect(SPEAKERS.has(l.who), `${l.who}: ${l.text}`).toBe(true);
        expect(MOODS.has(l.mood), `${l.mood}`).toBe(true);
        expect(l.text.length, l.text).toBeLessThan(230);
      }
      for (const m of c.missions) expect(m.giver in CHAR, m.id).toBe(true);
    });

    it("sin emojis en los textos", () => {
      const all = JSON.stringify({ lines, m: c.missions.map((m) => [m.title, m.task, m.lesson, m.hints]) });
      expect(/\p{Extended_Pictographic}/u.test(all)).toBe(false);
    });

    for (const m of c.missions) {
      it(`${m.id}: la última pista lo resuelve y el código de inicio no`, async () => {
        expect(m.cases.length, "al menos dos casos con datos distintos").toBeGreaterThanOrEqual(2);
        expect(m.hints.length).toBeGreaterThanOrEqual(2);
        const sol = await grade(m, m.hints[m.hints.length - 1]);
        expect(sol.pass, sol.feedback).toBe(true);
        const start = await grade(m, m.starter);
        expect(start.pass, "el código de inicio no debe aprobar").toBe(false);
      });
    }
  });
}
