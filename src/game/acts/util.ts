import type { RunOutput } from "../sandbox";

export const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
export const show = (v: unknown) => (typeof v === "string" ? `"${v}"` : JSON.stringify(v));
export const printed = (o: RunOutput, s: string) => o.logs.some((l) => l.trim() === s);
export const probeErr = (o: RunOutput) => {
  const p = o.values.__probe as { __err?: string } | undefined;
  return p && typeof p === "object" && "__err" in p ? p.__err : null;
};
