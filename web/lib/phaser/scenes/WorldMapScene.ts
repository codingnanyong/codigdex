import Phaser from "phaser";

const INK = "#2a1d14";

export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super("world-map");
  }

  preload() {
    this.load.image(
      "field-guide",
      "/assets/wallpapers/codigdex-field-guide-wallpaper-v3.png"
    );
  }

  create() {
    const { width, height } = this.scale;

    const bg = this.add.image(width / 2, height / 2, "field-guide");
    bg.setDisplaySize(width, height);

    this.add
      .text(width / 2, height - 32, "world-map.scene — CH.01 반복문의 숲 준비 중", {
        fontFamily: "monospace",
        fontSize: "13px",
        color: INK,
        backgroundColor: "#f1e4cbcc",
        padding: { x: 8, y: 4 },
      })
      .setOrigin(0.5);
  }
}
