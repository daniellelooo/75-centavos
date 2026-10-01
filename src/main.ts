import Phaser from "phaser";
import "./style.css";
import { VIEW_H, VIEW_W } from "./config";
import { BootScene } from "./scenes/BootScene";
import { LabScene } from "./scenes/LabScene";
import { NetScene } from "./scenes/NetScene";
import { mountHud } from "./ui/hud";

/** Mayor factor entero que cabe en la ventana: píxeles nítidos y del mismo tamaño. */
function fitZoom(): number {
  const z = Math.floor(Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H));
  return Math.max(1, z);
}

let zoom = fitZoom();
document.documentElement.style.setProperty("--z", String(zoom));
mountHud();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: VIEW_W,
  height: VIEW_H,
  pixelArt: true,
  roundPixels: true,
  backgroundColor: "#07080f",
  scale: { mode: Phaser.Scale.NONE, zoom },
  scene: [BootScene, LabScene, NetScene],
});

window.addEventListener("resize", () => {
  const z = fitZoom();
  if (z === zoom) return;
  zoom = z;
  document.documentElement.style.setProperty("--z", String(zoom));
  game.scale.setZoom(zoom);
});

// Para pruebas en navegador real (Playwright).
(window as unknown as { __game: Phaser.Game }).__game = game;
