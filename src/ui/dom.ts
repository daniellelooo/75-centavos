export const ui = document.getElementById("ui") as HTMLDivElement;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  cls = "",
  html = "",
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (html) node.innerHTML = html;
  return node;
}

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
