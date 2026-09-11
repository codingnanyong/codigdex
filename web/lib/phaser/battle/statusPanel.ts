import type Phaser from "phaser";
import type { MonsterDefinition } from "@/lib/domain/chapters/types";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { drawGbcBox } from "./gbcBox";
import { STATUS_BOX } from "./layout";

const HP_BAR_WIDTH = 150;
const HP_BAR_HEIGHT = 10;
const HP_GREEN = 0x4c8c4a;
const HP_YELLOW = 0xd9a441;
const HP_RED = 0xb23a2e;

function hpColorFor(ratio: number): number {
  if (ratio > 0.5) return HP_GREEN;
  if (ratio > 0.2) return HP_YELLOW;
  return HP_RED;
}

/** Name, level and one continuous HP bar that drains as answers land. */
export class StatusPanel {
  private readonly scene: Phaser.Scene;
  private readonly hpFill: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, monster: MonsterDefinition) {
    this.scene = scene;
    const left = STATUS_BOX.x - STATUS_BOX.width / 2;
    const top = STATUS_BOX.y - STATUS_BOX.height / 2;

    drawGbcBox(scene, STATUS_BOX, PALETTE.cream);

    scene.add
      .text(left + 16, top + 12, `${monster.name}  Lv.${monster.level}`, {
        ...pixelText("body"),
        color: PALETTE_HEX.ink,
      })
      .setOrigin(0, 0);

    scene.add
      .text(left + 16, top + 42, "HP", {
        ...pixelText("caption"),
        color: PALETTE_HEX.ink,
        fontStyle: "italic",
      })
      .setOrigin(0, 0.5);

    const barLeft = left + 44;
    scene.add
      .rectangle(barLeft, top + 42, HP_BAR_WIDTH, HP_BAR_HEIGHT, PALETTE.ink, 1)
      .setOrigin(0, 0.5);
    this.hpFill = scene.add
      .rectangle(barLeft + 1, top + 42, HP_BAR_WIDTH - 2, HP_BAR_HEIGHT - 2, hpColorFor(1), 1)
      .setOrigin(0, 0.5);
  }

  /** Slides the bar down to `ratio` of full health, recoloring as it gets low. */
  setHealth(ratio: number) {
    this.hpFill.setFillStyle(hpColorFor(ratio));
    this.scene.tweens.add({
      targets: this.hpFill,
      scaleX: ratio,
      duration: 260,
      ease: "Cubic.Out",
    });
  }
}
