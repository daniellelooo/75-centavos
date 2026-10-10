// JavaScript sobre una página web (para Diez días). La página de cada misión se
// construye con linkedom, un DOM ligero que funciona dentro del Worker: así un
// bucle infinito no congela el juego. Después del código del jugador se evalúa la
// sonda de la misión, que puede simular clics o teclas y leer cómo quedó la página.
import { parseHTML } from "linkedom";
import type { RunOutput } from "./sandbox";

export interface DomInput {
  code: string;
  html: string;
  probe?: string;
}

function format(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean" || v == null) return String(v);
  if (v && typeof v === "object" && "tagName" in v) return `<${String((v as { tagName: string }).tagName).toLowerCase()}>`;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

function lineFromStack(err: unknown, offset: number): number | undefined {
  const stack = err instanceof Error ? err.stack ?? "" : "";
  const m = stack.match(/<anonymous>:(\d+):\d+/);
  if (!m) return undefined;
  const line = Number(m[1]) - offset;
  return line > 0 ? line : undefined;
}

/** Lo que no se puede mandar fuera del Worker (un nodo, una función) viaja como texto. */
function plain(v: unknown): unknown {
  try {
    return structuredClone(v);
  } catch {
    return format(v);
  }
}

export function runDom(input: DomInput): RunOutput {
  const logs: string[] = [];
  const { window, document } = parseHTML(input.html);
  const win = window as unknown as {
    Event: new (t: string, o?: EventInit) => Event;
    KeyboardEvent?: new (t: string, o?: KeyboardEventInit) => Event;
  };
  const fakeConsole = {
    log: (...args: unknown[]) => {
      if (logs.length < 500) logs.push(args.map(format).join(" "));
    },
  };
  const alerts: string[] = [];
  const el = (sel: string) => {
    const n = document.querySelector(sel);
    if (!n) throw new Error(`La página no tiene ningún elemento ${sel}`);
    return n as unknown as HTMLElement & { value: string };
  };
  // ayudas para la sonda: simulan lo que haría una persona en la página
  const helpers = {
    __click: (sel: string) => el(sel).dispatchEvent(new win.Event("click", { bubbles: true, cancelable: true })),
    __type: (sel: string, text: string) => {
      const n = el(sel);
      n.value = text;
      n.setAttribute("value", text);
      n.dispatchEvent(new win.Event("input", { bubbles: true }));
    },
    __submit: (sel: string) => {
      const ev = new win.Event("submit", { bubbles: true, cancelable: true });
      el(sel).dispatchEvent(ev);
      return ev.defaultPrevented;
    },
    __key: (key: string) => {
      const ev = new win.Event("keydown", { bubbles: true });
      Object.defineProperty(ev, "key", { value: key });
      document.dispatchEvent(ev);
    },
    __text: (sel: string) => document.querySelector(sel)?.textContent?.trim() ?? null,
    __count: (sel: string) => document.querySelectorAll(sel).length,
    __alerts: () => alerts.slice(),
  };
  const alert = (msg: unknown) => {
    alerts.push(format(msg));
    logs.push(`[alert] ${format(msg)}`);
  };

  const names = ["console", "document", "window", "alert", ...Object.keys(helpers)];
  const values = [fakeConsole, document, window, alert, ...Object.values(helpers)];
  const probe = input.probe
    ? `__probe: (() => { try { return (${input.probe}); } catch (e) { return { __err: String((e && e.message) || e) }; } })()`
    : "__probe: undefined";
  const body = `"use strict";\n${input.code}\n;return { ${probe} };`;
  const offset = 3;
  const snapshot = () => (document.documentElement as unknown as { outerHTML: string }).outerHTML;
  try {
    const fn = new Function(...names, body);
    const captured = fn(...values) as Record<string, unknown>;
    return { ok: true, logs, values: { __probe: plain(captured.__probe), __html: snapshot() }, calls: {} };
  } catch (err) {
    const e = err instanceof Error ? err : new Error(String(err));
    return { ok: false, logs, values: { __html: snapshot() }, calls: {}, error: { name: e.name, message: e.message, line: lineFromStack(err, offset) } };
  }
}
