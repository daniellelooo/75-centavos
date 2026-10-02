// Menú de pausa: música, efectos, pantalla completa, controles y salida.
import { formatTime, sessionTime, totalTime } from "../game/playtime";
import { accountAction, accountName, isConnected } from "../game/cloud";
import { hasAccounts } from "../shared/auth";
import { settings, saveSettings, applyCrt } from "../game/settings";
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
  /** Abre el cuaderno de repaso (solo dentro del laboratorio). */
  notebook?: () => void;
  /** Se llama al cambiar la música (la radio del laboratorio se anima). */
  onMusic?: () => void;
}

let hooks: PauseHooks | null = null;
let blocked: () => boolean = () => false;

export function setPauseHooks(h: PauseHooks, isBlocked: () => boolean): void {
  hooks = h;
  blocked = isBlocked;
}

/** La tecla se está escribiendo en un campo (el correo al entrar, por ejemplo). */
const typing = (e: KeyboardEvent) => {
  const t = e.target as HTMLElement | null;
  return !!t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || !!t.closest("[class*='cl-']"));
};

window.addEventListener("keydown", (e) => {
  if (typing(e)) return;
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
    <div class="p-progress">${m ? `Misión ${save.done + 1} de ${MISSIONS.length}: <b>${m.title}</b>` : "Historia completada"}</div>
    <div class="p-time">Esta sesión: <b>${formatTime(sessionTime())}</b> · En total: <b>${formatTime(totalTime())}</b></div>
    <div class="p-row" data-k="resume"><span>REANUDAR</span><span class="hint">ESC</span></div>
    ${hasAccounts() ? `<div class="p-row" data-k="account"><span>CUENTA</span><span>${isConnected() ? `${accountName() ?? ""} · EN LA NUBE` : "ENTRAR PARA GUARDAR EN LA NUBE"}</span></div>` : ""}
    ${hooks?.notebook ? `<div class="p-row" data-k="notebook"><span>CUADERNO DE SAM</span><span class="hint">C</span></div>` : ""}
    <div class="p-sep">RADIO</div>
    <div class="p-row" data-k="music"><span>MUSICA</span><span>${isMusicOn() ? "ENCENDIDA" : "APAGADA"}</span></div>
    <div class="p-row" data-k="track"><span>EMISORA</span><span>&lt; ${TRACKS[settings.track % TRACKS.length].name} &gt;</span></div>
    <div class="p-row" data-k="mvol"><span>VOLUMEN MUSICA</span>${bar(settings.musicVol)}</div>
    <div class="p-sep">SONIDO</div>
    <div class="p-row" data-k="svol"><span>EFECTOS</span>${bar(settings.sfxVol)}</div>
    <div class="p-sep">PANTALLA</div>
    <div class="p-row" data-k="full"><span>PANTALLA COMPLETA</span><span>${document.fullscreenElement ? "SI" : "NO"}</span></div>
    <div class="p-row" data-k="crt"><span>FILTRO CRT</span><span>${settings.crt ? "SI" : "NO"}</span></div>
    <div class="p-row" data-k="help"><span>CONTROLES</span><span></span></div>
    <div class="p-help hidden">
      <div><span class="key">WASD</span> o flechas: caminar</div>
      <div><span class="key">E</span> o espacio: interactuar / pasar diálogo</div>
      <div><span class="key">Ctrl+Enter</span> ejecutar código · <span class="key">Tab</span> autocompletar</div>
      <div><span class="key">C</span> cuaderno de repaso · <span class="key">ESC</span> pausa</div>
      <div>Tu progreso se guarda solo.</div>
    </div>
    <div class="p-row danger" data-k="title"><span>MENU PRINCIPAL</span><span class="hint">se guarda</span></div>
  `;
  root.querySelectorAll<HTMLDivElement>(".p-row").forEach((row, i) => {
    row.tabIndex = 0;
    row.classList.toggle("sel", i === sel);
    row.onmouseenter = () => {
      // solo si el ratón se movió de verdad: si el panel se abre bajo el cursor,
      // no debe robarle la selección al teclado
      if (!mouseMoved) return;
      sel = i;
      highlight();
    };
    row.onclick = (ev) => act(row.dataset.k!, (ev as MouseEvent).offsetX > row.clientWidth / 2 ? 1 : -1, true);
  });
}

let sel = 0;
let mouseMoved = false;
function rows() {
  return [...(root?.querySelectorAll<HTMLDivElement>(".p-row") ?? [])];
}
function highlight() {
  rows().forEach((r, i) => r.classList.toggle("sel", i === sel));
}

function act(k: string, dir: number, click = false): void {
  try {
    doAct(k, dir, click);
  } catch (e) {
    console.error(e);
    render();
  }
}

function doAct(k: string, dir: number, click = false): void {
  const step = 0.1 * dir;
  switch (k) {
    case "account":
      void accountAction();
      return;
    case "resume":
      if (dir === 0 || click) closePause();
      return;
    case "music":
      if (isMusicOn()) stopMusic();
      else startMusic();
      hooks?.onMusic?.();
      break;
    case "track":
      // cambiar de emisora no enciende la radio: solo elige qué sonará
      setTrack((settings.track + (dir || 1) + TRACKS.length) % TRACKS.length);
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
    case "notebook":
      closePause();
      hooks?.notebook?.();
      return;
    case "crt":
      settings.crt = !settings.crt;
      saveSettings();
      applyCrt();
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
  if (typing(e)) return;
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
  mouseMoved = false;
  root.addEventListener("mousemove", () => (mouseMoved = true), { once: true });
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

// al entrar o salir de la cuenta, la fila CUENTA se actualiza si el menú está abierto
document.addEventListener("cuenta", () => render());
