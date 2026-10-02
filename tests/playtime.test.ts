import { describe, expect, it } from "vitest";

describe("formato del tiempo de juego", () => {
  it("minutos y horas legibles", async () => {
    (globalThis as unknown as { document: unknown }).document ??= { hidden: true, querySelector: () => null, addEventListener: () => {} };
    const { formatTime } = await import("../src/game/playtime");
    expect(formatTime(20_000)).toBe("menos de 1 min");
    expect(formatTime(42 * 60_000)).toBe("42 min");
    expect(formatTime(65 * 60_000)).toBe("1 h 05 min");
  });
});
