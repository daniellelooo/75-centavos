// Cuenta de Eternal Games con Clerk: Google o correo. Jugar sin cuenta sigue
// siendo posible; la cuenta sirve para guardar en la nube y tener perfil.
import { Clerk } from "@clerk/clerk-js";
import { esES } from "@clerk/localizations";

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
