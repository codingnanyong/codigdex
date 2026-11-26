import type Phaser from "phaser";
import { pixelText } from "../pixelFont";
import { PALETTE_HEX } from "../palette";

/** Both career atlases use the same unscaled 21px bitmap label and terrain anchor. */
export function createAtlasRegionLabel(scene: Phaser.Scene, labelCenter: { x: number; y: number }, copy: string, lockScale?: number) {
  const label = scene.add
    .text(
      labelCenter.x,
      labelCenter.y + 6,
      copy,
      {
      ...pixelText("subtitle"),
      color: PALETTE_HEX.cream,
      backgroundColor: "#2a1d14eb",
      stroke: PALETTE_HEX.ink,
      strokeThickness: 3,
      padding: { x: 10, y: 6 },
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: PALETTE_HEX.maroon,
        blur: 0,
        stroke: true,
        fill: true,
      },
      }
    )
    .setOrigin(0.5)
    .setAlpha(0)
    .setScale(0.96)
    .setDepth(5);
  if (lockScale !== undefined) {
    // Attach the name immediately below the lock body, sharing its exact x anchor.
    label.setY(labelCenter.y + Math.ceil(33 * lockScale) + Math.ceil(label.height / 2) + 6);
  }
  return label;
}
