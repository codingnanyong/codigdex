import type Phaser from "phaser";
import { PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";

/** The guide's line across the top of the battle, on a translucent strip over the arena. */
export function drawNpcBanner(scene: Phaser.Scene, line: string) {
  const { width } = scene.scale;
  return scene.add
    .text(width / 2, 12, line, {
      ...pixelText("body"),
      color: PALETTE_HEX.ink,
      backgroundColor: "#f1e4cbcc",
      padding: { x: 10, y: 5 },
      wordWrap: { width: width - 80 },
      align: "center",
    })
    .setOrigin(0.5, 0);
}
