import type Phaser from "phaser";
import { PALETTE } from "../palette";
import type { Box } from "./layout";

/**
 * Authentic Game Boy battle-screen boxes are crisp rectangles with a thin
 * flat border — no rounded corners, no rivets. That's a deliberately
 * different frame language from the parchment `drawOrnateFrame` used on
 * the overworld/dex screens; battle stays true to the GBC reference.
 */
export function drawGbcBox(scene: Phaser.Scene, { x, y, width, height }: Box, fill: number) {
  const left = x - width / 2;
  const top = y - height / 2;

  const g = scene.add.graphics();
  g.fillStyle(PALETTE.nightBrown, 0.3);
  g.fillRect(left + 3, top + 4, width, height);
  g.fillStyle(fill, 1);
  g.fillRect(left, top, width, height);
  g.lineStyle(2, PALETTE.ink, 1);
  g.strokeRect(left, top, width, height);
  return g;
}
