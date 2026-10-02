import Phaser from "phaser";
import "./style.css";
import { VIEW_H, VIEW_W } from "./config";
import { BootScene } from "./scenes/BootScene";
import { LabScene } from "./scenes/LabScene";
import { initCloud } from "./game/cloud";
import { NetScene } from "./scenes/NetScene";
import { ViewScene } from "./scenes/ViewScene";
import { TravelScene } from "./scenes/TravelScene";
import { HouseScene } from "./scenes/HouseScene";
import { mountHud } from "./ui/hud";
import { applyCrt } from "./game/settings";

/**
 * Escala del juego. Busca la mayor escala en la que cada píxel de arte ocupe un
 * número entero de píxeles FÍSICOS (en Retina, x2.5 = 5 píxeles: nítido). Si eso
 * deja demasiado borde (pantallas sin Retina), acepta una escala fraccionaria.
 */
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
  scene: [BootScene, LabScene, NetScene, ViewScene, TravelScene, HouseScene],
});
// solo en desarrollo: acceso al juego desde la consola para las pruebas
if (import.meta.env.DEV) (window as unknown as { __game: Phaser.Game }).__game = game;

const onResize = () => {
  const z = fitZoom();
  if (Math.abs(z - zoom) < 0.001) return;
  zoom = z;
  document.documentElement.style.setProperty("--z", String(zoom));
  game.scale.setZoom(zoom);
};
window.addEventListener("resize", onResize);
// cambiar de pantalla (Retina / externa) cambia la densidad de píxeles
matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`).addEventListener?.("change", onResize);

// Para pruebas en navegador real (Playwright).
(window as unknown as { __game: Phaser.Game }).__game = game;

// cuenta y guardado en la nube (si hay sesión); el juego no espera por ello
void initCloud(() => document.dispatchEvent(new Event("cuenta")));
