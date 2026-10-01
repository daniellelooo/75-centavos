// Preferencias del jugador (audio y pantalla). Separadas de la partida para
// que "Nueva partida" no las borre.

export interface Settings {
  music: boolean;
  musicVol: number;
  sfxVol: number;
  track: number;
}

const KEY = "75centavos.settings.v1";
const DEFAULTS: Settings = { music: false, musicVol: 0.6, sfxVol: 0.8, track: 0 };

function load(): Settings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Settings>) } : { ...DEFAULTS };
  } catch {
    return { ...DEFAULTS };
  }
}

export const settings: Settings = load();

export function saveSettings(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    /* sin almacenamiento */
  }
}
