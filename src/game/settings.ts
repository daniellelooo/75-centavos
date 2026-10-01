// Preferencias del jugador (audio y pantalla). Separadas de la partida para
// que "Nueva partida" no las borre.

export interface Settings {
  music: boolean;
  musicVol: number;
  sfxVol: number;
  track: number;
  /** Filtro de monitor antiguo (líneas de barrido y viñeta). */
  crt: boolean;
}

const KEY = "75centavos.settings.v1";
const DEFAULTS: Settings = { music: false, musicVol: 0.6, sfxVol: 0.8, track: 0, crt: false };

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export const settings: Settings = load();

export function applyCrt(): void {
  document.getElementById("game")?.classList.toggle("crt", settings.crt);
}

export function saveSettings(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* sin almacenamiento */
  }
}
