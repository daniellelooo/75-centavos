// Progreso de los retos: siempre en este navegador y, con sesión iniciada, también
// en la cuenta (como una partida más, juego "retos"). Al entrar se juntan los dos.
import { api, getClerk } from "../shared/auth";
import { NIVELES, RETOS } from "./data";

const KEY = "eternal.retos.v1";

export interface Progreso {
  /** id del reto -> cuándo se resolvió por primera vez (ms). */
  resueltos: Record<string, number>;
  /** Lo último que escribiste en cada reto. */
  codigo: Record<string, string>;
}

function leer(): Progreso {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (p && typeof p === "object") return { resueltos: p.resueltos ?? {}, codigo: p.codigo ?? {} };
  } catch {
    /* navegador sin almacenamiento: se juega igual, sin guardar */
  }
  return { resueltos: {}, codigo: {} };
}

export const progreso: Progreso = leer();

function escribir(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(progreso));
  } catch {
    /* sin almacenamiento */
  }
}

let conectado = false;
export const enLaNube = () => conectado;

/** Nivel alcanzado: el más alto con todos sus retos resueltos. */
export function nivelAlcanzado(): number {
  let n = 0;
  for (const nv of NIVELES) {
    if (RETOS.filter((r) => r.nivel === nv.n).every((r) => progreso.resueltos[r.id])) n = nv.n;
    else break;
  }
  return n;
}

async function subir(): Promise<void> {
  if (!conectado) return;
  const hechos = Object.keys(progreso.resueltos).length;
  await api("/api/partida", {
    method: "PUT",
    body: JSON.stringify({
      juego: "retos",
      datos: progreso,
      misiones: hechos,
      terminado: hechos >= RETOS.length,
      rango: nivelAlcanzado() ? `Nivel ${nivelAlcanzado()} completado` : "Empezando",
      tiempo_ms: 0,
    }),
  }).catch(() => {});
}

let pendiente: ReturnType<typeof setTimeout> | null = null;
export function guardarCodigo(id: string, code: string): void {
  progreso.codigo[id] = code;
  escribir();
  if (pendiente) clearTimeout(pendiente);
  pendiente = setTimeout(() => void subir(), 4000);
}

export function marcarResuelto(id: string): boolean {
  const nuevo = !progreso.resueltos[id];
  if (nuevo) progreso.resueltos[id] = Date.now();
  escribir();
  void subir();
  return nuevo;
}

/** Con sesión: trae lo guardado en la cuenta y lo junta con lo de este navegador. */
export async function conectar(): Promise<boolean> {
  const clerk = await getClerk();
  if (!clerk?.isSignedIn) return false;
  try {
    const r = await api<{ datos: Partial<Progreso> } | null>("/api/partida?juego=retos");
    const nube = r?.datos ?? {};
    for (const [id, t] of Object.entries(nube.resueltos ?? {})) {
      const mio = progreso.resueltos[id];
      progreso.resueltos[id] = mio ? Math.min(mio, t) : t;
    }
    for (const [id, c] of Object.entries(nube.codigo ?? {})) if (!(id in progreso.codigo)) progreso.codigo[id] = c;
    escribir();
    conectado = true;
    await subir();
    return true;
  } catch {
    return false;
  }
}
