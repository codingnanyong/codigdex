import Phaser from "phaser";
import { playAmbience } from "../ambience";
import { breathe } from "../ambience/effects";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { addShade, applyPixelFontToScene, createButton, drawOrnateFrame } from "../ui";
import { hasSavedProgress, resetGameProgress } from "../registryAdapter";

/** Title screen: the archive painting, the wordmark, and PRESS START. */
export class IntroScene extends Phaser.Scene {
  private leaving = false;
  private confirmingReset = false;
  private resetDialog?: Phaser.GameObjects.Container;

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
      .setInteractive({ useHandCursor: true })
      .setDepth(4);
    panel.on("pointerup", () => this.finishIntro());

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

    if (hasProgress) {
      createButton(this, width / 2, 264, 132, 34, "새 게임", () => this.showResetConfirmation()).setDepth(5);
    }
  }

  private showResetConfirmation() {
    if (this.resetDialog || this.leaving) return;
    this.confirmingReset = true;
    const { width, height } = this.scale;
    const shade = addShade(this, 0.58, 20);
    const frame = drawOrnateFrame(this, width / 2, height / 2, 480, 190, { radius: 14 });
    const title = this.add
      .text(width / 2, height / 2 - 48, "새 게임을 시작할까요?", {
        ...pixelText("subtitle"),
        color: PALETTE_HEX.ink,
      })
      .setOrigin(0.5);
    const body = this.add
      .text(width / 2, height / 2 - 6, "도감과 챕터 진행 기록이 모두 초기화됩니다.", {
        ...pixelText("body"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5);
    const cancel = createButton(this, width / 2 - 82, height / 2 + 55, 120, 34, "취소", () => {
      this.resetDialog?.destroy(true);
      this.resetDialog = undefined;
      this.confirmingReset = false;
    });
    const confirm = createButton(this, width / 2 + 82, height / 2 + 55, 120, 34, "초기화", () => {
      resetGameProgress(this.registry);
      this.leaving = true;
      this.scene.start("world-map");
    });

    this.resetDialog = this.add
      .container(0, 0, [shade, frame, title, body, cancel, confirm])
      .setDepth(20)
      .setAlpha(0);
    this.tweens.add({ targets: this.resetDialog, alpha: 1, duration: 180, ease: "Quad.Out" });
    applyPixelFontToScene(this);
  }

  private finishIntro() {
    if (this.leaving || this.confirmingReset) return;
    this.leaving = true;

    this.cameras.main.fadeOut(450, 24, 15, 8);
    this.time.delayedCall(450, () => this.scene.start("world-map"));
  }
}
