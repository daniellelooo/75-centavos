// Arranque de las historias nuevas: la misma base que 75 Centavos (escala nítida,
// HUD, diálogos, terminal) con la escena común de historia. Cada página dice cuál
// cargar en <body data-story="...">.
import Phaser from "phaser";
import "../style.css";
import { VIEW_H, VIEW_W } from "../config";
import { BootScene } from "../scenes/BootScene";
import { StoryScene } from "./StoryScene";
import { mountHud } from "../ui/hud";
import { applyCrt } from "../game/settings";
import { getClerk } from "../shared/auth";

function fitZoom(): number {
  const fit = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
  const dpr = window.devicePixelRatio || 1;
  const crisp = Math.floor(fit * dpr) / dpr;
  const z = crisp / fit >= 0.9 ? crisp : fit;
  return Math.max(0.5, z);
}

let zoom = fitZoom();
document.documentElement.style.setProperty("--z", String(zoom));
mountHud();
applyCrt();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: VIEW_W,
  height: VIEW_H,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: "#07080f",
  scale: { mode: Phaser.Scale.NONE, zoom },
  scene: [BootScene, StoryScene],
});
(window as unknown as { __game: Phaser.Game }).__game = game;

const onResize = () => {
  const z = fitZoom();
  if (Math.abs(z - zoom) < 0.001) return;
  zoom = z;
  document.documentElement.style.setProperty("--z", String(zoom));
  game.scale.setZoom(zoom);
};
window.addEventListener("resize", onResize);
matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener?.("change", onResize);

// la cuenta se carga pronto para que la escena sepa si hay partida en la nube
void getClerk();
