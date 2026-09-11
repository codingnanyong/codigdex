import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { applyPixelFontToScene, createButton, drawOrnateFrame } from "../ui";

export interface OnboardingOptions {
  speaker: string;
  lines: readonly string[];
  onFinish: () => void;
}

/**
 * The guide's paged introduction, pinned to the bottom of the map. It
 * advances with its button, ENTER or SPACE, and can be skipped from the corner.
 */
export class OnboardingDialog {
  private readonly scene: Phaser.Scene;
  private readonly options: OnboardingOptions;
  private readonly group: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Text;
  private readonly pageText: Phaser.GameObjects.Text;
  private readonly nextButton: Phaser.GameObjects.Container;
  private readonly onKey = () => this.advance();
  private page = 0;
  private finished = false;

  constructor(scene: Phaser.Scene, options: OnboardingOptions) {
    this.scene = scene;
    this.options = options;
    const { width, height } = scene.scale;

    const shade = scene.add
      .rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 0.42)
      .setInteractive();
    const frame = drawOrnateFrame(scene, width / 2, height - 104, 720, 174, { radius: 14 });
    const speakerFrame = drawOrnateFrame(scene, 190, height - 181, 150, 34, {
      radius: 8,
      fill: PALETTE.sand,
    });
    const speaker = scene.add
      .text(190, height - 181, options.speaker, { ...pixelText("body"), color: PALETTE_HEX.maroon })
      .setOrigin(0.5);

    this.body = scene.add
      .text(140, height - 153, options.lines[0], {
        ...pixelText("body"),
        color: PALETTE_HEX.ink,
        wordWrap: { width: 610 },
        lineSpacing: 5,
      })
      .setOrigin(0, 0);
    this.pageText = scene.add
      .text(width / 2, height - 30, `1 / ${options.lines.length}`, {
        ...pixelText("caption"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5);

    this.nextButton = createButton(scene, width - 186, height - 52, 120, 34, "다음  ▶", () => this.advance());
    const skipButton = createButton(scene, width - 72, 28, 112, 30, "건너뛰기", () => this.finish());

    this.group = scene.add
      .container(0, 12, [shade, frame, speakerFrame, speaker, this.body, this.pageText, this.nextButton, skipButton])
      .setDepth(20)
      .setAlpha(0);
    scene.tweens.add({ targets: this.group, alpha: 1, y: 0, duration: 260, ease: "Quad.Out" });

    scene.input.keyboard?.on("keydown-ENTER", this.onKey);
    scene.input.keyboard?.on("keydown-SPACE", this.onKey);
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.unbindKeys());
    applyPixelFontToScene(scene);
  }

  private advance() {
    if (this.finished) return;
    const { lines } = this.options;
    if (this.page >= lines.length - 1) {
      this.finish();
      return;
    }

    this.page += 1;
    this.body.setText(lines[this.page]);
    this.pageText.setText(`${this.page + 1} / ${lines.length}`);
    if (this.page === lines.length - 1) {
      (this.nextButton.list[1] as Phaser.GameObjects.Text).setText("의뢰 확인");
    }
  }

  private finish() {
    if (this.finished) return;
    this.finished = true;
    this.unbindKeys();

    const group = this.group;
    this.scene.tweens.add({
      targets: group,
      alpha: 0,
      y: 8,
      duration: 180,
      onComplete: () => group.destroy(true),
    });
    this.options.onFinish();
  }

  private unbindKeys() {
    this.scene.input.keyboard?.off("keydown-ENTER", this.onKey);
    this.scene.input.keyboard?.off("keydown-SPACE", this.onKey);
  }
}
