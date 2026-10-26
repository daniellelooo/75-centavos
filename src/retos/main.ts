// Página de retos: la lista por niveles (#/) y cada reto con su editor (#/id).
// Un personaje de la historia presenta cada nivel desde el banner.
import { EditorView, basicSetup } from "codemirror";
import { keymap } from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { acceptCompletion } from "@codemirror/autocomplete";
import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";
import { entrar } from "../shared/auth";
import { NIVELES, PERSONAJES, RETOS, type Nivel, type Personaje, type Reto } from "./data";
import { comprobar, type Resultado } from "./check";
import { conectar, enLaNube, guardarCodigo, marcarResuelto, nivelAlcanzado, progreso } from "./progreso";

const root = document.querySelector<HTMLElement>("#retos")!;
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
/** Texto del enunciado: lo que va entre `comillas invertidas` sale como código. */
const rico = (s: string) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");

const MOOD = { normal: 0, sorpresa: 1, serio: 2, alegre: 3 } as const;
function retrato(p: Personaje, mood: keyof typeof MOOD = "normal", clase = ""): string {
  const { fila } = PERSONAJES[p];
  return `<div class="r-face ${clase}" style="--col:${MOOD[mood]};--fila:${fila}" role="img" aria-label="${PERSONAJES[p].nombre}"></div>`;
}

const amber = HighlightStyle.define([
  { tag: t.keyword, color: "#fff4c9" },
  { tag: [t.number, t.bool, t.null], color: "#8fd3ff" },
  { tag: [t.string, t.special(t.string)], color: "#9be3a8" },
  { tag: t.comment, color: "#8a6a4a" },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: "#ffd27a" },
  { tag: t.operator, color: "#ff9a4a" },
  { tag: [t.variableName, t.propertyName], color: "#fed018" },
  { tag: t.punctuation, color: "#d38a3a" },
]);

const nivelDe = (r: Reto) => NIVELES.find((n) => n.n === r.nivel)!;
const hechos = () => RETOS.filter((r) => progreso.resueltos[r.id]).length;

let editor: EditorView | null = null;

// ------------------------------------------------------------------ lista

function cuentaHtml(): string {
  if (enLaNube()) return `<span class="r-cloud on">Guardado en tu cuenta</span>`;
  return `<span class="r-cloud">Tu progreso se guarda en este navegador. <button type="button" class="r-link" data-entrar>Entra</button> para guardarlo en tu cuenta.</span>`;
}

function lista(): void {
  document.title = "Retos de programación en JavaScript — Eternal Games";
  const n = hechos();
  const actual = NIVELES.find((nv) => RETOS.some((r) => r.nivel === nv.n && !progreso.resueltos[r.id])) ?? NIVELES[NIVELES.length - 1];
  const pct = Math.round((n / RETOS.length) * 100);
  const alcanzado = nivelAlcanzado();
  root.innerHTML = `
    <section class="r-hero">
      ${retrato(actual.personaje, n === RETOS.length ? "alegre" : "normal", "big")}
      <div class="r-hero-text">
        <div class="r-say"><b>${PERSONAJES[actual.personaje].nombre}</b>${esc(n === RETOS.length ? "Los has hecho todos. Pronto llegan más niveles; mientras, ¿por qué no repasas alguno de otra forma?" : actual.intro)}</div>
        <h1>Retos de programación</h1>
        <p>Ejercicios cortos de JavaScript, del primer <code>if</code> a los clásicos de las pruebas técnicas. Escribes una función y unas pruebas te dicen al momento si funciona y, si no, en qué caso falla.</p>
        <div class="r-progress"><div class="bar-prog"><i style="width:${pct}%"></i></div><span>${n} de ${RETOS.length} resueltos${alcanzado ? ` · nivel ${alcanzado} completado` : ""}</span></div>
        ${cuentaHtml()}
      </div>
    </section>
    ${NIVELES.map(nivelHtml).join("")}
    <p class="r-more muted">Más niveles en camino. Si ya los has hecho todos, prueba a resolver alguno de otra forma: casi siempre hay más de una.</p>`;
  bindEntrar();
}

function nivelHtml(nv: Nivel): string {
  const rs = RETOS.filter((r) => r.nivel === nv.n);
  const ok = rs.filter((r) => progreso.resueltos[r.id]).length;
  return `
    <section class="r-level">
      <div class="r-level-head">
        ${retrato(nv.personaje, ok === rs.length ? "alegre" : "normal", "small")}
        <div>
          <div class="level">NIVEL ${nv.n} · CON ${PERSONAJES[nv.personaje].nombre.toUpperCase()} · ${ok} DE ${rs.length}</div>
          <h2>${esc(nv.titulo)}</h2>
          <p class="r-temas">${esc(nv.temas)}</p>
        </div>
      </div>
      <ol class="r-list">
        ${rs
          .map(
            (r, i) => `<li><a href="#/${r.id}" class="${progreso.resueltos[r.id] ? "done" : ""}">
              <span class="num">${String(i + 1).padStart(2, "0")}</span>
              <span class="tit">${esc(r.titulo)}</span>
              ${r.clasico ? `<span class="tag">CLÁSICO DE ENTREVISTA</span>` : ""}
              <span class="st">${progreso.resueltos[r.id] ? "RESUELTO" : ""}</span>
            </a></li>`,
          )
          .join("")}
      </ol>
    </section>`;
}

function bindEntrar(): void {
  root.querySelectorAll<HTMLButtonElement>("[data-entrar]").forEach((b) => {
    b.onclick = () => void entrar({ forceRedirectUrl: location.href });
  });
}

// ------------------------------------------------------------------ un reto

function reto(r: Reto): void {
  const nv = nivelDe(r);
  const rs = RETOS.filter((x) => x.nivel === r.nivel);
  const idx = rs.indexOf(r);
  const siguiente = RETOS[RETOS.indexOf(r) + 1];
  document.title = `${r.titulo} — Retos de JavaScript — Eternal Games`;
  root.innerHTML = `
    <a class="r-back" href="#/">&lt; Todos los retos</a>
    <section class="r-banner">
      ${retrato(nv.personaje, progreso.resueltos[r.id] ? "alegre" : "normal", "mid")}
      <div class="r-say"><b>${PERSONAJES[nv.personaje].nombre}</b><span class="r-said">${esc(r.dice)}</span></div>
    </section>
    <div class="r-grid">
      <article class="r-statement">
        <div class="level">NIVEL ${nv.n} · RETO ${idx + 1} DE ${rs.length}${r.clasico ? " · CLÁSICO DE ENTREVISTA" : ""}</div>
        <h1>${esc(r.titulo)}</h1>
        <p>${rico(r.enunciado)}</p>
        <h3>Ejemplos</h3>
        <pre class="r-ex">${r.ejemplos.map(esc).join("\n")}</pre>
        <div class="r-hints"></div>
        <button type="button" class="r-btn ghost" data-pista>Ver una pista (1 de ${r.pistas.length})</button>
      </article>
      <div class="r-work">
        <div class="r-editor"></div>
        <div class="r-actions">
          <button type="button" class="play" data-run>Ejecutar pruebas</button>
          <span class="muted">Ctrl + Enter</span>
          <button type="button" class="r-btn ghost" data-reset>Empezar de cero</button>
        </div>
        <div class="r-out" aria-live="polite">${progreso.resueltos[r.id] ? `<p class="r-ok">Ya lo resolviste. Puedes intentarlo de otra forma.</p>` : `<p class="muted">Escribe la función y pulsa Ejecutar pruebas.</p>`}</div>
        ${siguiente ? `<a class="r-next" href="#/${siguiente.id}">Siguiente: ${esc(siguiente.titulo)} &gt;</a>` : ""}
      </div>
    </div>`;

  // editor
  editor?.destroy();
  editor = new EditorView({
    doc: progreso.codigo[r.id] ?? r.inicio,
    parent: root.querySelector(".r-editor") as HTMLElement,
    extensions: [
      basicSetup,
      EditorView.lineWrapping,
      javascript(),
      Prec.highest(keymap.of([{ key: "Tab", run: acceptCompletion }])),
      keymap.of([indentWithTab, { key: "Mod-Enter", run: () => (void ejecutar(), true) }]),
      syntaxHighlighting(amber),
      EditorView.updateListener.of((u) => {
        if (u.docChanged) guardarCodigo(r.id, u.state.doc.toString());
      }),
    ],
  });
  editor.focus();

  // pistas, una a una
  let vistas = 0;
  const hintBtn = root.querySelector<HTMLButtonElement>("[data-pista]")!;
  const hints = root.querySelector<HTMLElement>(".r-hints")!;
  hintBtn.onclick = () => {
    const p = r.pistas[vistas++];
    const ultima = vistas === r.pistas.length;
    hints.insertAdjacentHTML(
      "beforeend",
      ultima ? `<div class="r-hint"><b>Solución</b><pre>${esc(p)}</pre></div>` : `<div class="r-hint"><b>Pista ${vistas}</b>${rico(p)}</div>`,
    );
    if (vistas >= r.pistas.length) hintBtn.remove();
    else hintBtn.textContent = vistas === r.pistas.length - 1 ? "Ver la solución" : `Ver otra pista (${vistas + 1} de ${r.pistas.length})`;
  };

  root.querySelector<HTMLButtonElement>("[data-reset]")!.onclick = () => {
    if (!editor || !confirm("¿Borrar lo que escribiste en este reto y empezar de cero?")) return;
    editor.dispatch({ changes: { from: 0, to: editor.state.doc.length, insert: r.inicio } });
    editor.focus();
  };

  const runBtn = root.querySelector<HTMLButtonElement>("[data-run]")!;
  const out = root.querySelector<HTMLElement>(".r-out")!;
  let corriendo = false;
  async function ejecutar(): Promise<void> {
    if (corriendo || !editor) return;
    corriendo = true;
    runBtn.disabled = true;
    out.innerHTML = `<p class="muted">Ejecutando las pruebas...</p>`;
    const res = await comprobar(r, editor.state.doc.toString());
    corriendo = false;
    runBtn.disabled = false;
    out.innerHTML = resultadoHtml(res);
    const face = root.querySelector<HTMLElement>(".r-banner .r-face")!;
    const said = root.querySelector<HTMLElement>(".r-said")!;
    if (res.tipo === "ok") {
      const nuevo = marcarResuelto(r.id);
      face.style.setProperty("--col", String(MOOD.alegre));
      said.textContent = nuevo ? felicitacion(nv.personaje) : "Otra vez bien. Se nota que ya no es suerte.";
    } else {
      face.style.setProperty("--col", String(res.tipo === "error" ? MOOD.sorpresa : MOOD.serio));
      said.textContent = res.tipo === "error" ? "Algo se ha roto antes de llegar a las pruebas. Mira el mensaje." : "Casi. Mira qué caso no cuadra.";
    }
  }
  runBtn.onclick = () => void ejecutar();
}

function felicitacion(p: Personaje): string {
  const frases: Record<Personaje, string[]> = {
    margarita: ["Muy bien. Limpio y claro, como tiene que ser.", "Eso es. Ruth tardó más la primera vez, no se lo digas.", "Perfecto. Siguiente, cuando quieras."],
    gus: ["¡Recibido cinco por cinco! Señal perfecta. Cambio.", "Contacto confirmado. Esto merece tarjeta QSL.", "Copiado. Limpio como una noche sin interferencias."],
    rochy: ["Bien. Iba a decir algo más, pero me da pereza.", "Correcto. Ni yo lo habría hecho... bueno, sí, pero más tarde."],
  };
  const l = frases[p];
  return l[Math.floor(Math.random() * l.length)];
}

function resultadoHtml(res: Resultado): string {
  const logs = res.logs.length
    ? `<details class="r-logs"><summary>Lo que mostró tu console.log</summary><pre>${esc(res.logs.slice(0, 40).join("\n"))}</pre></details>`
    : "";
  if (res.tipo === "error") {
    const linea = res.linea ? `<div class="r-line"><span>Línea ${res.linea}</span><code>${esc(res.texto ?? "")}</code></div>` : "";
    return `<div class="r-err"><b>${esc(res.titulo)}</b>${linea}<p>${esc(res.detalle)}</p></div>${logs}`;
  }
  const ok = res.casos.filter((c) => c.ok).length;
  const filas = res.casos
    .map(
      (c) => `<tr class="${c.ok ? "ok" : "ko"}"><td>${c.ok ? "BIEN" : "FALLA"}</td><td><code>${esc(c.llamada)}</code></td><td>${
        c.ok ? `<code>${esc(c.obtenido)}</code>` : `esperaba <code>${esc(c.esperado)}</code>, devolvió <code>${esc(c.obtenido)}</code>`
      }</td></tr>`,
    )
    .join("");
  const head =
    res.tipo === "ok"
      ? `<p class="r-ok">Resuelto. Pasa las ${res.casos.length} pruebas.</p>`
      : `<p class="r-ko">Pasa ${ok} de ${res.casos.length} pruebas.</p>${res.consejo ? `<p class="r-tip">${esc(res.consejo)}</p>` : ""}`;
  return `${head}<table class="r-cases"><tbody>${filas}</tbody></table>${logs}`;
}

// ------------------------------------------------------------------ rutas

function render(): void {
  const id = location.hash.replace(/^#\/?/, "");
  const r = RETOS.find((x) => x.id === id);
  if (r) reto(r);
  else {
    editor?.destroy();
    editor = null;
    lista();
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
render();
void conectar().then((ok) => {
  if (ok && !location.hash.replace(/^#\/?/, "")) render();
});
