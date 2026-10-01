// Ejemplos de las lecciones con el resultado escondido: primero se adivina qué
// imprime y después se comprueba (predecir antes de ver, como en el método PRIMM).
import { esc } from "./dom";
import { sfx } from "../audio/sfx";

/** Convierte el ejemplo en HTML; el "// resultado" de cada console.log queda tapado. */
export function exampleHtml(src: string): { html: string; peeks: number } {
  let peeks = 0;
  const html = src
    .split("\n")
    .map((line) => {
      const m = line.match(/^(.*console\.log\(.*?\);?\s*)\/\/\s*(.+)$/);
      if (!m) return esc(line);
      peeks++;
      return `${esc(m[1])}<button class="peek" data-v="${esc(m[2])}" title="Piensa qué imprime y pulsa para comprobarlo">// ¿?</button>`;
    })
    .join("\n");
  return { html, peeks };
}

/** Destapa el resultado al pulsar. Se engancha una vez al contenedor. */
export function bindPeeks(root: HTMLElement): void {
  root.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>(".peek");
    if (!b || b.classList.contains("shown")) return;
    b.textContent = `// ${b.dataset.v ?? ""}`;
    b.classList.add("shown");
    sfx("tick");
  });
}
