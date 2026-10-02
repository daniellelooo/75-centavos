// Guardado en la nube para quien tiene cuenta. Sin cuenta, el juego funciona
// igual que siempre (solo en este navegador).
import { api, getClerk, type Perfil } from "../shared/auth";
import { MISSIONS } from "./missions";
import { rankOf } from "./rank";
import { loadSave, onSaveWritten, save, type SaveData, writeSave } from "./state";

const JUEGO = "75-centavos";
let perfil: Perfil | null = null;
let timer = 0;
let ready = false;

/** Cuánto ha avanzado una partida: primero misiones, luego sesiones de práctica y tiempo. */
const progress = (d: Partial<SaveData> | null | undefined) =>
  !d ? -1 : (d.done ?? 0) * 1e12 + Object.values(d.training ?? {}).reduce((a, b) => a + b, 0) * 1e9 + (d.playMs ?? 0) / 1000;

export const accountName = () => perfil?.nombre || perfil?.alias || null;
export const isConnected = () => !!perfil;

async function upload(): Promise<void> {
  if (!perfil) return;
  const datos = loadSave() ?? save;
  await api("/api/partida", {
    method: "PUT",
    keepalive: true,
    body: JSON.stringify({
      juego: JUEGO,
      datos,
      misiones: datos.done,
      terminado: datos.done >= MISSIONS.length,
      rango: rankOf(datos.done),
      tiempo_ms: Math.round(datos.playMs ?? 0),
    }),
  }).catch((e) => console.warn("no se pudo guardar en la nube", e));
}

/** Al abrir el juego con sesión: trae la partida de la nube si va más adelantada. */
export async function initCloud(onChange?: () => void): Promise<void> {
  const clerk = await getClerk();
  if (!clerk) return;
  const sync = async () => {
    if (!clerk.isSignedIn) {
      perfil = null;
      onChange?.();
      return;
    }
    try {
      perfil = await api<Perfil>("/api/perfil");
      const remote = await api<{ datos: SaveData } | null>(`/api/partida?juego=${JUEGO}`);
      const local = loadSave();
      if (remote && progress(remote.datos) > progress(local)) {
        writeSave({ ...remote.datos });
        // la partida de la nube va más adelantada: recargar para empezar desde ella
        if (!sessionStorage.getItem("75c.cloud-reload")) {
          sessionStorage.setItem("75c.cloud-reload", "1");
          location.reload();
          return;
        }
      } else {
        await upload();
      }
      sessionStorage.removeItem("75c.cloud-reload");
      ready = true;
    } catch (e) {
      console.warn("nube no disponible", e);
    }
    onChange?.();
  };
  await sync();
  let wasSignedIn = clerk.isSignedIn;
  clerk.addListener(() => {
    if (clerk.isSignedIn !== wasSignedIn) {
      wasSignedIn = clerk.isSignedIn;
      void sync();
    }
  });
}

// cada guardado local se sube a la nube unos segundos después (no en cada paso)
onSaveWritten(() => {
  if (!perfil || !ready) return;
  clearTimeout(timer);
  timer = window.setTimeout(() => void upload(), 4000);
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && perfil && ready) void upload();
});

/** Entrar con Google o correo, o ir al perfil si ya hay sesión. */
export async function accountAction(): Promise<void> {
  const clerk = await getClerk();
  if (!clerk) return;
  if (!clerk.isSignedIn) clerk.openSignIn({});
  else window.open("/perfil/", "_blank");
}
