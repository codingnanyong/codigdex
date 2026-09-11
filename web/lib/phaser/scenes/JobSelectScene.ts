import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { applyPixelFontToScene, createButton, drawOrnateFrame } from "../ui";
import { pixelText } from "../pixelFont";
import { JOB_OPTIONS, JOB_REGISTRY_KEY } from "@/lib/domain/player/jobs";
import { isCommonPathComplete } from "@/lib/domain/chapters";
import { capturedIds } from "@/lib/domain/dex/capture";
import { readDexState } from "../registryAdapter";

const INK = PALETTE_HEX.ink;
const CARD_WIDTH = 174;
const CARD_HEIGHT = 166;

export class JobSelectScene extends Phaser.Scene {
  constructor() {
    super("job-select");
  }

  preload() {
    JOB_OPTIONS.forEach((job) => this.load.image(job.textureKey!, job.assetPath!));
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, PALETTE.cream, 1);

    this.add
        .text(width / 2, 42, "어떤 개발자로 성장할까요?", {
        ...pixelText("subtitle"),
        color: INK,
      })
      .setOrigin(0.5);

    JOB_OPTIONS.forEach((job, index) => {
      const topRow = index < 3;
      const rowIndex = topRow ? index : index - 3;
      const cx = topRow ? 300 + rowIndex * 180 : 390 + rowIndex * 180;
      const cy = topRow ? 178 : 360;
      const frame = drawOrnateFrame(this, cx, cy, CARD_WIDTH, CARD_HEIGHT, { radius: 14 });

      this.add.image(cx, cy - 36, job.textureKey!).setDisplaySize(74, 74);

      this.add
        .text(cx, cy + 25, job.name, {
          ...pixelText("body"),
          color: INK,
          align: "center",
          wordWrap: { width: CARD_WIDTH - 20 },
        })
        .setOrigin(0.5);

      this.add
        .text(cx, cy + 58, job.tagline, {
          ...pixelText("caption"),
          color: PALETTE_HEX.mutedBrown,
          align: "center",
          wordWrap: { width: CARD_WIDTH - 18 },
        })
        .setOrigin(0.5);

      const hitArea = this.add
        .rectangle(cx, cy, CARD_WIDTH, CARD_HEIGHT, 0xffffff, 0)
        .setInteractive({ useHandCursor: true });

      hitArea.on("pointerover", () => frame.setAlpha(0.82));
      hitArea.on("pointerout", () => frame.setAlpha(1));
      hitArea.on("pointerup", () => this.selectJob(job.id));
    });

    createButton(this, width / 2, height - 28, 140, 32, "돌아가기", () => this.scene.start("world-map"));

    applyPixelFontToScene(this);
  }

  private selectJob(jobId: string) {
    const commonPathComplete = isCommonPathComplete(capturedIds(readDexState(this.registry)));
    // Before Git and Linux are cleared, choosing a card only previews its path.
    // The actual job title changes when the player returns here for promotion.
    if (commonPathComplete) this.registry.set(JOB_REGISTRY_KEY, jobId);
    this.scene.start("path-map", { careerId: jobId });
  }
}
