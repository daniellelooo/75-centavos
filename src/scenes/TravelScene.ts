// El trayecto en bici entre el laboratorio y la casa de Margarita: el paisaje
// de la ventana al fondo, la calle pasando deprisa y Sam pedaleando.
import Phaser from "phaser";
import { VIEW_H, VIEW_W } from "../config";
import { MISSIONS, ACTS } from "../game/missions";
import { save } from "../game/state";
import { fadeIn, fadeOut } from "../ui/fade";
import { hudVisible } from "../ui/hud";
import { sfx } from "../audio/sfx";

const GROUND = 206;

export class TravelScene extends Phaser.Scene {
  private to: "house" | "lab" = "house";
  private set = "";
  private act = 1;
  private far!: Phaser.GameObjects.TileSprite;
  private street!: Phaser.GameObjects.Graphics;
  private things: { o: Phaser.GameObjects.Image; v: number; w: number }[] = [];
  private dist = 0;
  private sam!: Phaser.GameObjects.Sprite;
  private leaving = false;

  constructor() {
    super("travel");
  }

  init(data: { to: "house" | "lab"; set: string }): void {
    this.to = data.to;
    this.set = data.set;
    this.act = Math.min(MISSIONS[save.done]?.act ?? 1, ACTS.length);
    this.things = [];
    this.dist = 0;
    this.leaving = false;
  }

  preload(): void {
    const key = `view_${this.act}_d`;
    if (!this.textures.exists(key)) this.load.image(key, `/assets/view/${key}.png`);
  }

  create(): void {
    hudVisible(false);
    // el paisaje lejano se desplaza despacio (repetido sin costuras visibles: espejo)
    const key = `view_${this.act}_d`;
    this.far = this.add.tileSprite(0, -40, VIEW_W, VIEW_H, key).setOrigin(0, 0);
    // calle
    this.street = this.add.graphics().setDepth(5);
    // casas, farolas y árboles que pasan
    const spawn = (x: number) => {
      // casas, farolas y árboles en pixel art con contorno (tools/art/street.py)
      const kind = Math.random();
      const tree = this.act === 4 ? 6 : this.act === 3 ? 5 : 4;
      const frame = kind < 0.45 ? Math.floor(Math.random() * 3) : kind < 0.65 ? 3 : tree;
      const o = this.add.image(x, GROUND + 1, "street", frame).setOrigin(0, 1).setDepth(frame === 3 ? 4 : 3);
      this.things.push({ o, v: 90, w: 64 });
    };
    for (let x = -20; x < VIEW_W + 40; x += 64 + Math.random() * 30) spawn(x);

    // Sam en bici: hacia la derecha a casa de Margarita, a la izquierda de vuelta
    this.add.image(VIEW_W / 2, GROUND + 18, "shadow").setDepth(9).setScale(3, 1);
    this.sam = this.add.sprite(VIEW_W / 2, GROUND + 19, "sam_bike", 0).setOrigin(0.5, 1).setDepth(11).setFlipX(this.to === "lab");
    this.sam.play("sam-bike");

    const text = this.to === "house" ? "Rumbo a casa de Margarita" : "De vuelta al laboratorio";
    const cap = document.createElement("div");
    cap.className = "view-cap travel-cap pixel-frame";
    cap.innerHTML = `<span>${text}</span><span class="key">E</span>`;
    document.getElementById("ui")!.append(cap);
    this.events.once("shutdown", () => cap.remove());

    const skip = (ev: KeyboardEvent) => {
      if (["KeyE", "Space", "Enter"].includes(ev.code)) void this.finish();
    };
    window.addEventListener("keydown", skip);
    this.events.once("shutdown", () => {
      window.removeEventListener("keydown", skip);
    });
    void fadeIn();
    sfx("click");
    this.time.delayedCall(4200, () => void this.finish());
  }

  private async finish(): Promise<void> {
    if (this.leaving) return;
    this.leaving = true;
    await fadeOut();
    if (this.to === "house") this.scene.start("house", { set: this.set });
    else this.scene.start("lab", { mode: "play", back: this.set });
  }

  update(time: number, dtMs: number): void {
    const dt = Math.min(dtMs, 50) / 1000;
    const sgn = this.to === "house" ? 1 : -1;
    this.dist += dt * 100 * sgn;
    this.far.tilePositionX += dt * 8 * sgn;

    const s = this.street.clear();
    s.fillStyle(0x6a8a4a, 1).fillRect(0, GROUND - 2, VIEW_W, 4);
    s.fillStyle(0xb8ab94, 1).fillRect(0, GROUND + 2, VIEW_W, 10);
    s.fillStyle(0x968a74, 1);
    for (let x = -((this.dist % 24) + 24) % 24; x < VIEW_W; x += 24) s.fillRect(x, GROUND + 2, 1, 10);
    s.fillStyle(0x4a4a55, 1).fillRect(0, GROUND + 12, VIEW_W, VIEW_H - GROUND - 12);
    s.fillStyle(0x3c3c46, 1).fillRect(0, GROUND + 12, VIEW_W, 2);
    s.fillStyle(0xfed018, 1);
    for (let x = -((this.dist * 1.4) % 40 + 40) % 40; x < VIEW_W; x += 40) s.fillRect(x, GROUND + 38, 18, 2);

    for (const t of this.things) {
      t.o.x -= t.v * dt * sgn;
      if (sgn > 0 && t.o.x < -t.w - 10) t.o.x = VIEW_W + 20 + Math.random() * 60;
      if (sgn < 0 && t.o.x > VIEW_W + 20) t.o.x = -t.w - 20 - Math.random() * 60;
    }
  }
}
