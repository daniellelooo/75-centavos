import Phaser from "phaser";
import { CHAR, type CharName } from "../config";

const A = "/assets/";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload(): void {
    const sheet = (key: string, file: string, w: number, h: number) =>
      this.load.spritesheet(key, A + file, { frameWidth: w, frameHeight: h });

    this.load.spritesheet("kenney", A + "vendor/kenney_indoor.png", { frameWidth: 16, frameHeight: 16, spacing: 1 });
    sheet("chars", "characters.png", 16, 24);
    sheet("floor", "floor.png", 16, 16);
    sheet("window", "window.png", 32, 26);
    sheet("terminal", "terminal.png", 18, 20);
    sheet("vax_tape", "vax_tape.png", 16, 34);
    sheet("vax_panel", "vax_panel.png", 16, 34);
    sheet("printer", "printer.png", 20, 18);
    sheet("corkboard", "corkboard.png", 36, 24);
    sheet("coffee", "coffee.png", 14, 18);
    sheet("door", "door.png", 18, 34);
    sheet("marker", "marker.png", 7, 8);
    sheet("net_icons", "net_icons.png", 11, 11);
    sheet("lamp", "lamp.png", 10, 14);
    sheet("cat", "cat.png", 26, 16);
    sheet("tapebox", "tapebox.png", 18, 17);
    sheet("satellite", "satellite.png", 21, 13);
    sheet("cooler", "cooler.png", 12, 26);
    sheet("radio", "radio.png", 16, 10);
    sheet("emotes", "emotes.png", 11, 11);
    sheet("sam_bike", "sam_bike.png", 40, 38);
    sheet("radio_rig", "radio_rig.png", 34, 24);
    sheet("server_rack", "server_rack.png", 22, 42);
    sheet("posters", "posters.png", 18, 24);
    for (const f of [
      "wall", "wall_cap_v", "wall_cap_h", "chalkboard", "clock", "mug", "filing", "poster",
      "calendar", "phone", "papers", "trash", "desk", "chair", "table", "rug", "telescope", "coatrack", "bicycle", "postit", "fridge", "paper_item", "folder_item", "pegboard", "workbench", "qsl_cards", "tire_stack", "pizza_boxes", "beanbag", "soda_cans", "bed", "book_piles",
    ]) {
      this.load.image(f, A + f + ".png");
    }
  }

  create(): void {
    const dirs = ["down", "left", "up", "right"] as const;
    for (const name of Object.keys(CHAR) as CharName[]) {
      dirs.forEach((dir, d) => {
        const base = (CHAR[name] * 4 + d) * 4;
        this.anims.create({
          key: `${name}-walk-${dir}`,
          frames: this.anims.generateFrameNumbers("chars", { frames: [base + 1, base + 2, base + 3, base] }),
          frameRate: 8,
          repeat: -1,
        });
      });
    }
    this.anims.create({ key: "vax-tape", frames: this.anims.generateFrameNumbers("vax_tape", {}), frameRate: 6, repeat: -1 });
    this.anims.create({ key: "vax-panel", frames: this.anims.generateFrameNumbers("vax_panel", {}), frameRate: 3, repeat: -1 });
    this.anims.create({ key: "term-on", frames: this.anims.generateFrameNumbers("terminal", { frames: [0, 1] }), frameRate: 2, repeat: -1 });
    this.anims.create({ key: "term-alert", frames: this.anims.generateFrameNumbers("terminal", { frames: [3, 4] }), frameRate: 3, repeat: -1 });
    this.anims.create({ key: "printer-run", frames: this.anims.generateFrameNumbers("printer", {}), frameRate: 4, repeat: -1 });
    this.anims.create({ key: "marker-bob", frames: this.anims.generateFrameNumbers("marker", {}), frameRate: 3, repeat: -1 });
    this.anims.create({ key: "cat-sleep", frames: this.anims.generateFrameNumbers("cat", {}), frameRate: 1.2, repeat: -1 });
    this.anims.create({ key: "cooler-bubble", frames: this.anims.generateFrameNumbers("cooler", {}), frameRate: 6, repeat: 3 });
    this.anims.create({ key: "radio-play", frames: this.anims.generateFrameNumbers("radio", {}), frameRate: 3.5, repeat: -1 });
    this.anims.create({ key: "rack-blink", frames: this.anims.generateFrameNumbers("server_rack", {}), frameRate: 1.5, repeat: -1 });
    this.anims.create({ key: "radio-rx", frames: this.anims.generateFrameNumbers("radio_rig", {}), frameRate: 2, repeat: -1 });
    this.anims.create({ key: "sam-bike", frames: this.anims.generateFrameNumbers("sam_bike", {}), frameRate: 9, repeat: -1 });
    this.anims.create({ key: "sat-blink", frames: this.anims.generateFrameNumbers("satellite", {}), frameRate: 2, repeat: -1 });
    // sombra suave bajo personajes: elipse pixelada
    const g = this.add.graphics();
    g.fillStyle(0x1c1830, 0.32);
    g.fillRect(2, 0, 8, 1);
    g.fillRect(1, 1, 10, 2);
    g.fillRect(2, 3, 8, 1);
    g.generateTexture("shadow", 12, 4);
    g.destroy();
    this.scene.start("lab", { mode: "title" });
  }
}
