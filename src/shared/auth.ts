// Cuenta de Eternal Games con Clerk: Google o correo. Jugar sin cuenta sigue
// siendo posible; la cuenta sirve para guardar en la nube y tener perfil.
import { Clerk } from "@clerk/clerk-js";
import { esES } from "@clerk/localizations";
import { AVISO_CUPO } from "./cupo";

const KEY = import.meta.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY as string | undefined;
let loading: Promise<Clerk | null> | null = null;

/** Hay cuentas configuradas en este despliegue. */
export const hasAccounts = () => !!KEY;

/** Estilo de las ventanas de Clerk: el mismo azul noche y ámbar del juego. */
const appearance = {
  variables: {
    colorPrimary: "#fed018",
    colorPrimaryForeground: "#1c1830",
    colorBackground: "#141b33",
    colorForeground: "#fff4c9",
    colorMutedForeground: "#c9d3ea",
    colorMuted: "#1b2440",
    colorInput: "#0b0f1e",
    colorInputForeground: "#fff4c9",
    colorNeutral: "#c9d3ea",
    colorBorder: "#3a3f52",
    colorModalBackdrop: "rgba(5, 4, 10, 0.75)",
    borderRadius: "0px",
    fontFamily: '"Pixelify Sans", system-ui, sans-serif',
    fontFamilyButtons: '"Pixelify Sans", system-ui, sans-serif',
  },
};

/** Textos propios: el nombre de la colección en vez del nombre técnico del recurso. */
const localization = {
  ...esES,
  signIn: {
    ...esES.signIn,
    start: { ...esES.signIn?.start, title: "Entrar a Eternal Games", subtitle: "Guarda tu partida en la nube y sigue desde cualquier ordenador." },
  },
  signUp: {
    ...esES.signUp,
    start: { ...esES.signUp?.start, title: "Crear tu cuenta", subtitle: "Gratis. Tu partida queda guardada en la nube." },
  },
};

/** Carga Clerk una sola vez (con su interfaz). Sin clave configurada, no hay cuentas. */
export function getClerk(): Promise<Clerk | null> {
  if (!KEY) return Promise.resolve(null);
  loading ??= (async () => {
    const domain = atob(KEY.split("_")[2]).slice(0, -1);
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://${domain}/npm/@clerk/ui@1/dist/ui.browser.js`;
      s.async = true;
      s.crossOrigin = "anonymous";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("no cargó la interfaz de Clerk"));
      document.head.appendChild(s);
    });
    const clerk = new Clerk(KEY);
    await clerk.load({
      ui: { ClerkUI: (window as unknown as { __internal_ClerkUICtor: unknown }).__internal_ClerkUICtor },
      localization,
      appearance,
      telemetry: false,
    } as Parameters<Clerk["load"]>[0]);
    return clerk;
  })().catch((e) => {
    console.warn(e);
    loading = null;
    return null;
  });
  return loading;
}

/** ¿Se pueden crear cuentas nuevas? Ante cualquier fallo, se asume que sí. */
async function cupoLlenoAhora(): Promise<boolean> {
  try {
    const r = await fetch("/api/cupo");
    if (!r.ok) return false;
    return (await r.json()).lleno === true;
  } catch {
    return false;
  }
}

/**
 * Abre la ventana para entrar. Si ya no caben cuentas nuevas, antes avisa que se
 * puede jugar sin sesión (el progreso queda en el navegador) y deja entrar a quien
 * ya tiene cuenta.
 */
export async function entrar(opts: Record<string, unknown> = {}): Promise<void> {
  const clerk = await getClerk();
  if (!clerk) return;
  if (!(await cupoLlenoAhora())) {
    clerk.openSignIn(opts as never);
    return;
  }
  if (await avisoCupo()) clerk.openSignIn(opts as never);
}

/** Aviso con el estilo del juego. Resuelve true si la persona ya tiene cuenta. */
function avisoCupo(): Promise<boolean> {
  return new Promise((resolve) => {
    const d = document.createElement("dialog");
    d.className = "aviso-cupo";
    d.innerHTML = `
      <style>
        .aviso-cupo { max-width: 440px; padding: 28px 30px; border: 3px solid #fed018; border-radius: 0;
          background: #141b33; color: #fff4c9; font-family: "Pixelify Sans", system-ui, sans-serif; }
        .aviso-cupo::backdrop { background: rgba(5, 4, 10, 0.75); }
        .aviso-cupo h2 { margin: 0 0 12px; font-size: 24px; color: #fed018; }
        .aviso-cupo p { margin: 0 0 22px; font-size: 17px; line-height: 1.45; color: #c9d3ea; }
        .aviso-cupo .botones { display: flex; gap: 12px; flex-wrap: wrap; }
        .aviso-cupo button { font: inherit; font-size: 16px; padding: 10px 16px; cursor: pointer; border-radius: 0; }
        .aviso-cupo .seguir { background: #fed018; color: #1c1830; border: 2px solid #fed018; }
        .aviso-cupo .entrar { background: transparent; color: #fff4c9; border: 2px solid #3a3f52; }
      </style>
      <h2></h2><p></p>
      <div class="botones"><button class="seguir" type="button"></button><button class="entrar" type="button"></button></div>`;
    (d.querySelector("h2") as HTMLElement).textContent = AVISO_CUPO.titulo;
    (d.querySelector("p") as HTMLElement).textContent = AVISO_CUPO.texto;
    const seguir = d.querySelector(".seguir") as HTMLButtonElement;
    const yaTengo = d.querySelector(".entrar") as HTMLButtonElement;
    seguir.textContent = AVISO_CUPO.seguir;
    yaTengo.textContent = AVISO_CUPO.entrar;
    let respuesta = false;
    seguir.onclick = () => d.close();
    yaTengo.onclick = () => { respuesta = true; d.close(); };
    d.addEventListener("close", () => { d.remove(); resolve(respuesta); });
    document.body.appendChild(d);
    d.showModal();
  });
}

/** Token de sesión para las funciones del servidor (o null sin sesión). */
export async function token(): Promise<string | null> {
  const clerk = await getClerk();
  return (await clerk?.session?.getToken()) ?? null;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const t = await token();
  const r = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(t ? { Authorization: `Bearer ${t}` } : {}), ...(init.headers ?? {}) },
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error(body.error ?? `error ${r.status}`), { status: r.status });
  return body as T;
}

export interface Perfil {
  alias: string;
  nombre: string;
  publico: boolean;
}
