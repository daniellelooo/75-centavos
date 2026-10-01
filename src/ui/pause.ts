// Menú de pausa: música, efectos, pantalla completa, controles y salida.
import { settings, saveSettings } from "../game/settings";
import { MISSIONS } from "../game/missions";
import { save } from "../game/state";
import { TRACKS, isMusicOn, setMusicVolume, setTrack, startMusic, stopMusic } from "../audio/music";
import { applySfxVolume, sfx } from "../audio/sfx";
import { el, ui } from "./dom";
import { isDialogOpen } from "./dialog";

let open = false;
export const isPauseOpen = () => open;

interface PauseHooks {
  /** Pausa/reanuda el mundo (escenas de Phaser). */
  freeze: (v: boolean) => void;
  /** Vuelve a la pantalla de título. */
  toTitle: () => void;
  /** Se llama al cambiar la música (la radio del laboratorio se anima). */
  onMusic?: () => void;
}

let hooks: PauseHooks | null = null;
let blocked: () => boolean = () => false;

export function setPauseHooks(h: PauseHooks, isBlocked: () => boolean): void {
  hooks = h;
  blocked = isBlocked;
}

window.addEventListener("keydown", (e) => {
  if (e.code !== "Escape" && e.code !== "KeyP") return;
  if (open) {
    e.preventDefault();
    closePause();
    return;
  }
  if (!hooks || blocked() || isDialogOpen() || document.querySelector(".term, .board, .title")) return;
  e.preventDefault();
  openPause();
});

let root: HTMLDivElement | null = null;

const bar = (v: number) => {
  const filled = Math.round(v * 10);
  return `<span class="vol">${"<i class=on></i>".repeat(filled)}${"<i></i>".repeat(10 - filled)}</span>`;
};

function render(): void {
  if (!root) return;
  const m = MISSIONS[save.done];
  root.querySelector(".p-body")!.innerHTML = `
    <div class="p-progress">${m ? `Misión ${save.done + 1} de ${MISSIONS.length}: <b>${m.title}</b>` : "Acto 1 completado"}</div>
    <div class="p-row" data-k="resume"><span>REANUDAR</span><span class="hint">ESC</span></div>
    <div class="p-sep">RADIO</div>
    <div class="p-row" data-k="music"><span>MUSICA</span><span>${isMusicOn() ? "ENCENDIDA" : "APAGADA"}</span></div>
    <div class="p-row" data-k="track"><span>EMISORA</span><span>&lt; ${TRACKS[settings.track % TRACKS.length].name} &gt;</span></div>
    <div class="p-row" data-k="mvol"><span>VOLUMEN MUSICA</span>${bar(settings.musicVol)}</div>
    <div class="p-sep">SONIDO</div>
    <div class="p-row" data-k="svol"><span>EFECTOS</span>${bar(settings.sfxVol)}</div>
    <div class="p-sep">PANTALLA</div>
    <div class="p-row" data-k="full"><span>PANTALLA COMPLETA</span><span>${document.fullscreenElement ? "SI" : "NO"}</span></div>
    <div class="p-row" data-k="help"><span>CONTROLES</span><span></span></div>
    <div class="p-help hidden">
      <div><span class="key">WASD</span> o flechas: caminar</div>
      <div><span class="key">E</span> o espacio: interactuar / pasar diálogo</div>
      <div><span class="key">Ctrl+Enter</span> ejecutar código · <span class="key">Tab</span> autocompletar</div>
      <div><span class="key">ESC</span> pausa · tu progreso se guarda solo</div>
    </div>
    <div class="p-row danger" data-k="title"><span>MENU PRINCIPAL</span><span class="hint">se guarda</span></div>
  `;
  root.querySelectorAll<HTMLDivElement>(".p-row").forEach((row, i) => {
    row.tabIndex = 0;
    row.classList.toggle("sel", i === sel);
    row.onmouseenter = () => {
      sel = i;
      highlight();
    };
    row.onclick = (ev) => act(row.dataset.k!, (ev as MouseEvent).offsetX > row.clientWidth / 2 ? 1 : -1, true);
  });
}

let sel = 0;
function rows() {
  return [...(root?.querySelectorAll<HTMLDivElement>(".p-row") ?? [])];
}
function highlight() {
  rows().forEach((r, i) => r.classList.toggle("sel", i === sel));
}

function act(k: string, dir: number, click = false): void {
  const step = 0.1 * dir;
  switch (k) {
    case "resume":
      if (dir === 0 || click) closePause();
      return;
    case "music":
      if (isMusicOn()) stopMusic();
      else startMusic();
      hooks?.onMusic?.();
      break;
    case "track":
      setTrack((settings.track + (dir || 1) + TRACKS.length) % TRACKS.length);
      if (!isMusicOn()) startMusic();
      hooks?.onMusic?.();
      break;
    case "mvol":
      setMusicVolume(Math.min(1, Math.max(0, Math.round((settings.musicVol + (dir === 0 ? 0.1 : step)) * 10) / 10)));
      break;
    case "svol":
      settings.sfxVol = Math.min(1, Math.max(0, Math.round((settings.sfxVol + (dir === 0 ? 0.1 : step)) * 10) / 10));
      saveSettings();
      applySfxVolume();
      break;
    case "full":
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen?.();
      setTimeout(render, 200);
      break;
    case "help":
      root?.querySelector(".p-help")?.classList.toggle("hidden");
      sfx("select");
      return;
    case "title":
      closePause(false);
      hooks?.toTitle();
      return;
  }
  sfx("tick");
  render();
}

function onKey(e: KeyboardEvent) {
  if (!open) return;
  const r = rows();
  const k = r[sel]?.dataset.k ?? "";
  if (["ArrowDown", "KeyS"].includes(e.code)) sel = (sel + 1) % r.length;
  else if (["ArrowUp", "KeyW"].includes(e.code)) sel = (sel - 1 + r.length) % r.length;
  else if (["ArrowLeft", "KeyA"].includes(e.code)) act(k, -1);
  else if (["ArrowRight", "KeyD"].includes(e.code)) act(k, 1);
  else if (["Enter", "Space", "KeyE"].includes(e.code)) act(k, 0);
  else return;
  e.preventDefault();
  e.stopPropagation();
  sfx("blip");
  highlight();
}

export function openPause(): void {
  if (open) return;
  open = true;
  sel = 0;
  hooks?.freeze(true);
  sfx("open");
  root = el("div", "pause");
  root.innerHTML = `<div class="p-panel pixel-frame"><h2>PAUSA</h2><div class="p-body"></div></div>`;
  ui.append(root);
  render();
  window.addEventListener("keydown", onKey, true);
}

export function closePause(resume = true): void {
  if (!open) return;
  open = false;
  window.removeEventListener("keydown", onKey, true);
  root?.remove();
  root = null;
  sfx("close");
  if (resume) hooks?.freeze(false);
}
