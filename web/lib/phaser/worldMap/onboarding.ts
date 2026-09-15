import Phaser from "phaser";
import { t } from "../i18n";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { applyPixelFontToScene, createButton } from "../ui";
import { createDialogPortrait } from "./dialogPortrait";

export interface OnboardingOptions {
  speaker: string;
  lines: readonly string[];
  portraitTextureKey?: string;
  onFinish: () => void;
}

/** A paged, cinematic introduction fixed to the bottom of the map. */
export class OnboardingDialog {
  private readonly scene: Phaser.Scene;
  private readonly options: OnboardingOptions;
  private readonly group: Phaser.GameObjects.Container;
  private readonly body: Phaser.GameObjects.Text;
  private readonly pageText: Phaser.GameObjects.Text;
  private readonly nextButton: Phaser.GameObjects.Text;
  private readonly onKey = () => this.advance();
  private page = 0;
  private finished = false;

  constructor(scene: Phaser.Scene, options: OnboardingOptions) {
    this.scene = scene;
    this.options = options;
    const { width, height } = scene.scale;
    const dialogHeight = 150;
    const dialogTop = height - dialogHeight;

    const shade = scene.add
      .rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 0.42)
      .setInteractive();
    const frameShadow = scene.add.rectangle(
      width / 2,
      height - dialogHeight / 2 - 5,
      width,
      dialogHeight + 10,
      PALETTE.ink,
      0.5
    );
    const frame = scene.add
      .rectangle(width / 2, height - dialogHeight / 2, width, dialogHeight, PALETTE.nightBrown, 0.95)
      .setStrokeStyle(3, PALETTE.ink);
    const topLine = scene.add.rectangle(width / 2, dialogTop + 2, width, 3, PALETTE.amber, 0.9);
    const portrait = options.portraitTextureKey
      ? createDialogPortrait(scene, options.portraitTextureKey, 130, height - 116, 204, 216)
      : [];
    const speakerFrame = scene.add
      .rectangle(144, height - 28, 190, 34, PALETTE.maroon, 0.98)
      .setStrokeStyle(2, PALETTE.amber, 0.9);
    const speaker = scene.add
      .text(144, height - 28, options.speaker, {
        ...pixelText("body"),
        color: PALETTE_HEX.cream,
      })
      .setOrigin(0.5);

    this.body = scene.add
      .text(270, dialogTop + 26, options.lines[0], {
        ...pixelText("body"),
        color: PALETTE_HEX.cream,
        wordWrap: { width: width - 304 },
        lineSpacing: 5,
      })
      .setOrigin(0, 0);
    this.pageText = scene.add
      .text(width / 2, height - 24, `1 / ${options.lines.length}`, {
        ...pixelText("micro"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5);

    this.nextButton = scene.add
      .text(width - 28, height - 26, "SPACE  ▶", {
        ...pixelText("body"),
        color: PALETTE_HEX.amber,
      })
      .setOrigin(1, 0.5)
      .setInteractive({ useHandCursor: true })
      .on("pointerup", () => this.advance());
    const skipButton = createButton(scene, width - 72, 28, 112, 30, t(scene, "world.onboardingSkip"), () => this.finish());

    this.group = scene.add
      .container(0, 12, [
        shade,
        frameShadow,
        frame,
        topLine,
        ...portrait,
        speakerFrame,
        speaker,
        this.body,
        this.pageText,
        this.nextButton,
        skipButton,
      ])
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
    if (this.page === lines.length - 1) this.nextButton.setText(t(this.scene, "world.onboardingDone"));
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
