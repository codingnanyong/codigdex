import Phaser from "phaser";
import { playAmbience } from "../ambience";
import { breathe } from "../ambience/effects";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { applyPixelFontToScene } from "../ui";
import { hasSavedProgress } from "../registryAdapter";

/** Title screen: the archive painting, the wordmark, and PRESS START. */
export class IntroScene extends Phaser.Scene {
  private leaving = false;

  constructor() {
    super("intro");
  }

  preload() {
    this.load.image("codigdex-title-archive", "/assets/wallpapers/codigdex-title-archive-v1.png");
  }

  create() {
    const { width, height } = this.scale;
    const background = this.add
      .image(width / 2, height / 2, "codigdex-title-archive")
      .setDisplaySize(width, height);
    breathe(this, background);
    playAmbience(this, "title-archive");

    this.drawTitle();
    this.createStartPrompt(hasSavedProgress(this.registry));

    this.input.once("pointerdown", () => this.finishIntro());
    this.input.keyboard?.once("keydown-ENTER", () => this.finishIntro());
    this.input.keyboard?.once("keydown-SPACE", () => this.finishIntro());
    applyPixelFontToScene(this);
  }

  private drawTitle() {
    const { width } = this.scale;

    this.add
      .text(width / 2, 82, "CODIGDEX", {
        ...pixelText("display"),
        color: PALETTE_HEX.cream,
        stroke: PALETTE_HEX.ink,
        strokeThickness: 8,
        letterSpacing: 8,
        shadow: {
          offsetX: 5,
          offsetY: 6,
          color: PALETTE_HEX.amber,
          blur: 0,
          stroke: true,
          fill: true,
        },
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.add
      .text(width / 2, 135, "CODE ARCHIVE ADVENTURE", {
        ...pixelText("body"),
        color: PALETTE_HEX.sand,
        letterSpacing: 3,
      })
      .setOrigin(0.5)
      .setDepth(5);
  }

  private createStartPrompt(hasProgress: boolean) {
    const { width } = this.scale;
    const panel = this.add
      .rectangle(width / 2, 197, 270, 66, PALETTE.nightBrown, 0.86)
      .setStrokeStyle(2, PALETTE.amber, 0.9)
      .setDepth(4);

    const prompt = this.add
      .text(width / 2, 188, hasProgress ? "이어하기" : "PRESS START", {
        ...pixelText("subtitle"),
        color: PALETTE_HEX.cream,
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.add
      .text(width / 2, 216, "클릭하거나 ENTER를 누르세요", {
        ...pixelText("caption"),
        color: PALETTE_HEX.sand,
      })
      .setOrigin(0.5)
      .setDepth(5);

    this.tweens.add({
      targets: [panel, prompt],
      alpha: { from: 1, to: 0.42 },
      duration: 760,
      delay: 1_000,
      ease: "Sine.InOut",
      yoyo: true,
      repeat: -1,
    });
  }

  private finishIntro() {
    if (this.leaving) return;
    this.leaving = true;

    this.cameras.main.fadeOut(450, 24, 15, 8);
    this.time.delayedCall(450, () => this.scene.start("world-map"));
  }
}
