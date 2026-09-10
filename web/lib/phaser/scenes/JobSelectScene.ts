import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "../palette";
import { drawOrnateFrame, applyPixelFontToScene } from "../ui";
import { getPixelFontFamily } from "../pixelFont";
import { JOB_OPTIONS, JOB_REGISTRY_KEY } from "@/lib/domain/player/jobs";

const INK = PALETTE_HEX.ink;
const CARD_WIDTH = 220;
const CARD_HEIGHT = 260;

export class JobSelectScene extends Phaser.Scene {
  constructor() {
    super("job-select");
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, PALETTE.cream, 1);

    this.add
      .text(width / 2, 60, "당신의 직업을 선택하세요", {
        fontFamily: getPixelFontFamily(),
        fontSize: "18px",
        color: INK,
      })
      .setOrigin(0.5);

    const gap = 30;
    const totalWidth = JOB_OPTIONS.length * CARD_WIDTH + (JOB_OPTIONS.length - 1) * gap;
    const startX = width / 2 - totalWidth / 2 + CARD_WIDTH / 2;
    const cardY = height / 2 + 20;

    JOB_OPTIONS.forEach((job, index) => {
      const cx = startX + index * (CARD_WIDTH + gap);
      const frame = drawOrnateFrame(this, cx, cardY, CARD_WIDTH, CARD_HEIGHT, { radius: 14 });

      this.add
        .text(cx, cardY - 30, job.name, {
          fontFamily: getPixelFontFamily(),
          fontSize: "14px",
          color: INK,
          align: "center",
          wordWrap: { width: CARD_WIDTH - 40 },
        })
        .setOrigin(0.5);

      this.add
        .text(cx, cardY + 30, job.tagline, {
          fontFamily: getPixelFontFamily(),
          fontSize: "11px",
          color: PALETTE_HEX.mutedBrown,
          align: "center",
          wordWrap: { width: CARD_WIDTH - 50 },
        })
        .setOrigin(0.5);

      const hitArea = this.add
        .rectangle(cx, cardY, CARD_WIDTH, CARD_HEIGHT, 0xffffff, 0)
        .setInteractive({ useHandCursor: true });

      hitArea.on("pointerover", () => frame.setScale(1.03));
      hitArea.on("pointerout", () => frame.setScale(1));
      hitArea.on("pointerup", () => this.selectJob(job.id));
    });

    applyPixelFontToScene(this);
  }

  private selectJob(jobId: string) {
    this.registry.set(JOB_REGISTRY_KEY, jobId);
    this.scene.start("world-map");
  }
}
