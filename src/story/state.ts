// Partida de una historia nueva: en este navegador y, con sesión, en la cuenta
// (una partida por historia, con su id como nombre de juego).
import { api, getClerk } from "../shared/auth";

export interface StorySave {
  version: 1;
  /** Misiones resueltas. */
  done: number;
  /** Ya se escuchó el encargo de la misión actual. */
  briefed: boolean;
  introSeen: boolean;
  /** Último acto cuya presentación ya se vio. */
  actIntro: number;
  finished: boolean;
  drafts: Record<string, string>;
  hintsUsed: Record<string, number>;
  attempts: Record<string, number>;
  playMs: number;
}

export const freshStory = (): StorySave => ({
  version: 1, done: 0, briefed: false, introSeen: false, actIntro: 0, finished: false, drafts: {}, hintsUsed: {}, attempts: {}, playMs: 0,
});

export class StoryState {
  readonly data: StorySave;
  private key: string;
  private cloud = false;
  private pending: ReturnType<typeof setTimeout> | null = null;
  private sessionStart = performance.now();
  private savedMs = 0;
  /** Datos para la fila de la cuenta: misiones, terminado y rango. */
  meta: () => { rango: string } = () => ({ rango: "" });

  constructor(readonly id: string) {
    this.key = `eternal.${id}.v1`;
    this.data = this.load() ?? freshStory();
    this.savedMs = this.data.playMs;
  }

  private load(): StorySave | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const d = JSON.parse(raw) as StorySave;
      return d.version === 1 ? { ...freshStory(), ...d } : null;
    } catch {
      return null;
    }
  }

  get sessionMs(): number {
    return performance.now() - this.sessionStart;
  }

  get totalMs(): number {
    return this.savedMs + this.sessionMs;
  }

  write(): void {
    this.data.playMs = Math.round(this.totalMs);
    try {
      localStorage.setItem(this.key, JSON.stringify(this.data));
    } catch {
      /* sin almacenamiento: se juega igual */
    }
    if (!this.cloud) return;
    if (this.pending) clearTimeout(this.pending);
    this.pending = setTimeout(() => void this.upload(), 2500);
  }

  reset(): void {
    Object.assign(this.data, freshStory(), { playMs: this.data.playMs });
    this.write();
  }

  private async upload(): Promise<void> {
    await api("/api/partida", {
      method: "PUT",
      body: JSON.stringify({
        juego: this.id,
        datos: this.data,
        misiones: this.data.done,
        terminado: this.data.finished,
        rango: this.meta().rango,
        tiempo_ms: this.data.playMs,
      }),
    }).catch(() => {});
  }

  /** Con sesión: si la partida de la cuenta va más avanzada, se usa esa. */
  async connect(): Promise<boolean> {
    const clerk = await getClerk();
    if (!clerk?.isSignedIn) return false;
    try {
      const r = await api<{ datos: StorySave } | null>(`/api/partida?juego=${encodeURIComponent(this.id)}`);
      const nube = r?.datos;
      if (nube && nube.version === 1 && (nube.done > this.data.done || (nube.finished && !this.data.finished))) {
        Object.assign(this.data, freshStory(), nube);
        this.savedMs = this.data.playMs;
        this.sessionStart = performance.now();
      }
      this.cloud = true;
      this.write();
      return true;
    } catch {
      return false;
    }
  }
}
