import Phaser from "phaser";
import { isCommonPathComplete } from "@/lib/domain/chapters";
import { capturedIds } from "@/lib/domain/dex/capture";
import {
  findJob,
  JOB_OPTIONS,
  JOB_REGISTRY_KEY,
  SECONDARY_JOB_OPTIONS,
  type JobId,
  type JobOption,
} from "@/lib/domain/player/jobs";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { readDexState } from "../registryAdapter";
import { applyPixelFontToScene, createButton, drawOrnateFrame, showToast } from "../ui";

const PRIMARY_X = 238;
const SECONDARY_X = 730;
const PRIMARY_WIDTH = 286;
const SECONDARY_WIDTH = 222;
const ROW_Y = [106, 184, 262, 340, 418] as const;

/** Shows selectable primary jobs and the locked tier-two paths they can lead to. */
export class JobSelectScene extends Phaser.Scene {
  private toast?: Phaser.GameObjects.Text;

  constructor() {
    super("job-select");
  }

  preload() {
    JOB_OPTIONS.forEach((job) => this.load.image(job.textureKey!, job.assetPath!));
  }

  create() {
    const { width, height } = this.scale;
    this.toast = undefined;
    this.add.rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 1);

    this.add
      .text(width / 2, 28, "CAREER PATH · 전직 계보", {
        ...pixelText("subtitle"),
        color: PALETTE_HEX.cream,
      })
      .setOrigin(0.5);
    this.add
      .text(PRIMARY_X, 63, "1차 전직 · 선택 가능", {
        ...pixelText("body"),
        color: PALETTE_HEX.amber,
      })
      .setOrigin(0.5);
    this.add
      .text(SECONDARY_X, 63, "2차 전직 · PATH PREVIEW", {
        ...pixelText("body"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0.5);

    this.drawPromotionPaths();
    const selected = findJob(this.registry.get(JOB_REGISTRY_KEY) as string | undefined).id;
    JOB_OPTIONS.forEach((job, index) => this.drawPrimaryJob(job, ROW_Y[index], selected === job.id));
    SECONDARY_JOB_OPTIONS.forEach((_job, index) => this.drawSecondaryMystery(index, ROW_Y[index]));

    createButton(this, width / 2, height - 28, 140, 32, "돌아가기", () => this.scene.start("world-map"));
    applyPixelFontToScene(this);
  }

  private drawPromotionPaths() {
    const indexByPrimary = new Map(JOB_OPTIONS.map((job, index) => [job.id, index]));
    const lines = this.add.graphics();

    SECONDARY_JOB_OPTIONS.forEach((secondary, secondaryIndex) => {
      secondary.requires.forEach((primaryId, branchIndex) => {
        const primaryIndex = indexByPrimary.get(primaryId)!;
        const startY = ROW_Y[primaryIndex];
        const endY = ROW_Y[secondaryIndex];
        const elbowX = 470 + branchIndex * 28;
        const stroke = () => {
          lines.beginPath();
          lines.moveTo(PRIMARY_X + PRIMARY_WIDTH / 2, startY);
          lines.lineTo(elbowX, startY);
          lines.lineTo(elbowX, endY);
          lines.lineTo(SECONDARY_X - SECONDARY_WIDTH / 2, endY);
          lines.strokePath();
        };
        lines.lineStyle(5, PALETTE.ink, 1);
        stroke();
        lines.lineStyle(2, PALETTE.mutedBrown, 0.68);
        stroke();
      });
    });
  }

  private drawPrimaryJob(job: JobOption, y: number, selected: boolean) {
    const frame = drawOrnateFrame(this, PRIMARY_X, y, PRIMARY_WIDTH, 62, {
      fill: selected ? PALETTE.sand : PALETTE.cream,
      radius: 10,
    });
    this.add.image(PRIMARY_X - 108, y, job.textureKey!).setDisplaySize(54, 54);
    this.add
      .text(PRIMARY_X - 70, y - 11, job.name, {
        ...pixelText("body"),
        color: PALETTE_HEX.ink,
      })
      .setOrigin(0, 0.5);
    this.add
      .text(PRIMARY_X - 70, y + 12, job.tagline, {
        ...pixelText("caption"),
        color: PALETTE_HEX.mutedBrown,
      })
      .setOrigin(0, 0.5);
    if (selected) {
      this.add
        .text(PRIMARY_X + 111, y, "현재", {
          ...pixelText("caption"),
          color: PALETTE_HEX.maroon,
        })
        .setOrigin(0.5);
    }

    const hitArea = this.add
      .rectangle(PRIMARY_X, y, PRIMARY_WIDTH, 62, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    hitArea.on("pointerover", () => frame.setAlpha(0.82));
    hitArea.on("pointerout", () => frame.setAlpha(1));
    hitArea.on("pointerup", () => this.selectJob(job.id));
  }

  private drawSecondaryMystery(index: number, y: number) {
    const frame = drawOrnateFrame(this, SECONDARY_X, y, SECONDARY_WIDTH, 52, {
      fill: PALETTE.wood,
      fillAlpha: 0.94,
      radius: 9,
    });
    this.add
      .text(SECONDARY_X - 82, y, `Ⅱ-${index + 1}`, {
        ...pixelText("caption"),
        color: PALETTE_HEX.sand,
      })
      .setOrigin(0, 0.5);
    this.add
      .text(SECONDARY_X + 12, y, "◆  ???", {
        ...pixelText("subtitle"),
        color: PALETTE_HEX.cream,
      })
      .setOrigin(0.5);

    const hitArea = this.add
      .rectangle(SECONDARY_X, y, SECONDARY_WIDTH, 52, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });
    hitArea.on("pointerover", () => frame.setAlpha(0.78));
    hitArea.on("pointerout", () => frame.setAlpha(1));
    hitArea.on("pointerup", () => {
      this.toast = showToast(
        this,
        "??? · 연결된 두 1차 직업 도감을 완성하면 정체가 드러나요.",
        this.toast
      );
    });
  }

  private selectJob(jobId: string) {
    const commonPathComplete = isCommonPathComplete(capturedIds(readDexState(this.registry)));
    // Before Git and Linux are cleared, choosing a card only previews its path.
    if (commonPathComplete) this.registry.set(JOB_REGISTRY_KEY, jobId);
    this.scene.start("path-map", { careerId: jobId as JobId });
  }
}
