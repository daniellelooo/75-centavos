// Progreso de la partida. Vive en localStorage; si no está disponible
// (modo privado), el juego funciona igual sin guardar.

export interface SaveData {
  version: 1;
  /** Cuántas misiones del acto se han superado. */
  done: number;
  /** El jugador ya escuchó el encargo de la misión actual. */
  briefed: boolean;
  /** Borradores de código por misión. */
  drafts: Record<string, string>;
  /** Pistas usadas por misión (para el resumen final). */
  hintsUsed: Record<string, number>;
  /** Veces que se pulsó EJECUTAR por misión. */
  attempts: Record<string, number>;
  introSeen: boolean;
  /** Último acto cuya presentación ya se vio. */
  actIntro: number;
  actComplete: boolean;
}

const KEY = "75centavos.save.v1";

export function freshSave(): SaveData {
  return { version: 1, done: 0, briefed: false, drafts: {}, hintsUsed: {}, attempts: {}, introSeen: false, actIntro: 0, actComplete: false };
}

export function loadSave(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SaveData;
    if (data.version !== 1) return null;
    const merged = { ...freshSave(), ...data };
    // partidas guardadas antes de que existieran varios actos
    if (merged.introSeen && !merged.actIntro) merged.actIntro = 1;
    return merged;
  } catch {
    return null;
  }
}

export function writeSave(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* sin guardado disponible */
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nada */
  }
}

/** Estado vivo compartido entre escenas y UI. */
export const save: SaveData = loadSave() ?? freshSave();

export function resetSave(): void {
  Object.assign(save, freshSave());
  writeSave(save);
}
