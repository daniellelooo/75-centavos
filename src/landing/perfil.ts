// Página de perfil. Con ?u=alias: el perfil público de cualquiera. Sin nada: el tuyo,
// con lo que puedes cambiar (alias, nombre, si es público) y el enlace para compartirlo.
import { api, entrar, getClerk, type Perfil } from "../shared/auth";
import { RANKS, STORIES } from "../game/ranks-data";
import { RETOS } from "../retos/data";

interface Juego { juego: string; misiones: number; terminado: boolean; rango: string; tiempo_ms: number }
interface Publico { alias: string; nombre: string; desde: string; juegos: Juego[] }

const root = document.querySelector<HTMLElement>("#perfil")!;
const TOTAL: Record<string, { title: string; level: number; misiones: number }> = {
  "75-centavos": { title: "75 Centavos", level: 1, misiones: 30 },
  "diez-dias": { title: "Diez días", level: 2, misiones: 12 },
  "la-consulta": { title: "La consulta", level: 3, misiones: 12 },
  "codigo-cuervo": { title: "Código Cuervo", level: 4, misiones: 12 },
  medianoche: { title: "Medianoche", level: 5, misiones: 12 },
};
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const horas = (ms: number) => {
  const m = Math.floor(ms / 60000);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")} min`;
};

function card(p: Publico): string {
  const juegos = STORIES.map((s) => {
    const key = s.id;
    const j = p.juegos.find((x) => x.juego === key);
    const t = TOTAL[key];
    if (!t) return `<div class="pg locked"><div class="level">NIVEL ${s.level} · ${esc(s.place.split(" · ")[0])}</div><b>${esc(s.title)}</b><span>Próximamente</span></div>`;
    if (!j) return `<div class="pg"><div class="level">NIVEL ${t.level}</div><b>${esc(t.title)}</b><span><a href="/${key}/">Sin empezar</a></span></div>`;
    const pct = Math.round((Math.min(j.misiones, t.misiones) / t.misiones) * 100);
    return `<div class="pg ${j.terminado ? "done" : ""}">
      <div class="level">NIVEL ${t.level}${j.terminado ? " · COMPLETADO" : ""}</div>
      <b>${esc(t.title)}</b>
      <span class="rank">${esc(j.rango || RANKS[0])}</span>
      <div class="bar-prog"><i style="width:${pct}%"></i></div>
      <span>${Math.min(j.misiones, t.misiones)} de ${t.misiones} misiones · ${horas(Number(j.tiempo_ms))} jugadas</span>
    </div>`;
  }).join("");
  const r = p.juegos.find((x) => x.juego === "retos");
  const retos = r
    ? `<div class="pg ${r.terminado ? "done" : ""}">
      <div class="level">RETOS${r.terminado ? " · TODOS RESUELTOS" : ""}</div>
      <b>Retos de programación</b>
      <span class="rank">${esc(r.rango || "Empezando")}</span>
      <div class="bar-prog"><i style="width:${Math.round((Math.min(r.misiones, RETOS.length) / RETOS.length) * 100)}%"></i></div>
      <span>${Math.min(r.misiones, RETOS.length)} de ${RETOS.length} retos resueltos</span>
    </div>`
    : `<div class="pg"><div class="level">RETOS</div><b>Retos de programación</b><span><a href="/retos/">Sin empezar</a></span></div>`;
  const desde = new Date(p.desde).toLocaleDateString("es", { month: "long", year: "numeric" });
  return `
    <div class="pc-head">
      <h1>${esc(p.nombre || p.alias)}</h1>
      <span>@${esc(p.alias)} · jugando desde ${esc(desde)}</span>
    </div>
    <div class="pc-games">${juegos}${retos}</div>`;
}

async function showPublic(alias: string): Promise<void> {
  const r = await fetch(`/api/publico?alias=${encodeURIComponent(alias)}`);
  if (!r.ok) {
    root.innerHTML = `<h1>Perfil no encontrado</h1><p class="muted">Puede que no exista o que su dueño lo tenga en privado.</p><a class="play" href="/">Ir a Eternal Games</a>`;
    return;
  }
  const p = (await r.json()) as Publico;
  document.title = `${p.nombre || p.alias} — Eternal Games`;
  root.innerHTML = card(p);
}

async function showMine(): Promise<void> {
  const clerk = await getClerk();
  if (!clerk) {
    root.innerHTML = `<h1>Cuentas no disponibles</h1><p class="muted">Este despliegue no tiene cuentas configuradas.</p>`;
    return;
  }
  if (!clerk.isSignedIn) {
    root.innerHTML = `<h1>Tu perfil</h1><p>Entra con Google o con tu correo para guardar tu partida en la nube, seguir desde cualquier ordenador y tener un perfil que puedes compartir.</p><button class="play" id="entrar">Entrar</button><p class="muted">Jugar sin cuenta sigue siendo posible.</p>`;
    (root.querySelector("#entrar") as HTMLButtonElement).onclick = () => void entrar();
    return;
  }
  const yo = await api<Perfil & { desde: string; juegos: Juego[] }>("/api/perfil");
  const pub: Publico = { alias: yo.alias, nombre: yo.nombre, desde: yo.desde, juegos: yo.juegos };
  const link = `${location.origin}/perfil/?u=${yo.alias}`;
  root.innerHTML = `${card(pub)}
    <form class="pc-edit" autocomplete="off">
      <h2>Tu perfil</h2>
      <label>Nombre visible<input name="nombre" maxlength="40" value="${esc(yo.nombre)}" /></label>
      <label>Alias (tu enlace)<input name="alias" maxlength="24" value="${esc(yo.alias)}" pattern="[a-z0-9-]{3,24}" /></label>
      <label class="check"><input type="checkbox" name="publico" ${yo.publico ? "checked" : ""} /> Perfil público (cualquiera con el enlace puede verlo)</label>
      <div class="pc-actions"><button class="play" type="submit">Guardar</button><span class="msg"></span></div>
      <div class="pc-share"><span>Tu enlace</span><code>${esc(link)}</code><button type="button" class="copy">Copiar</button></div>
    </form>`;
  const form = root.querySelector("form")!;
  const msg = form.querySelector(".msg") as HTMLElement;
  (form.querySelector(".copy") as HTMLButtonElement).onclick = async () => {
    await navigator.clipboard.writeText(link).catch(() => {});
    msg.textContent = "Enlace copiado.";
  };
  form.onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    try {
      await api("/api/perfil", {
        method: "PUT",
        body: JSON.stringify({ nombre: fd.get("nombre"), alias: String(fd.get("alias") ?? "").toLowerCase(), publico: fd.get("publico") === "on" }),
      });
      msg.textContent = "Guardado.";
      void showMine();
    } catch (err) {
      msg.textContent = (err as Error).message;
    }
  };
}

const u = new URLSearchParams(location.search).get("u");
void (u ? showPublic(u) : showMine()).catch(() => {
  root.innerHTML = `<h1>No se pudo cargar</h1><p class="muted">Prueba de nuevo en un momento.</p>`;
});
