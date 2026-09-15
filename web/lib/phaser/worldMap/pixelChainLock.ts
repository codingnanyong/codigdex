import type Phaser from "phaser";
import { PALETTE } from "../palette";

/** Draws two chunky pixel chains crossing behind a central padlock. */
export function drawPixelChainLock(
  scene: Phaser.Scene,
  x: number,
  y: number
): Phaser.GameObjects.Container {
  const graphics = scene.add.graphics();

  // A chain is built from axis-aligned blocks rather than rotated sprites, so
  // its stair-step diagonals stay crisp at the game's native resolution.
  for (let step = -6; step <= 6; step += 1) {
    const offsetX = step * 9;
    const offsetY = step * 6;
    drawLink(graphics, offsetX, offsetY);
    drawLink(graphics, offsetX, -offsetY);
  }

  // Padlock shackle: dark pixel outline with a warm metal inner edge.
  graphics.fillStyle(PALETTE.ink, 1);
  graphics.fillRect(-19, -30, 8, 27);
  graphics.fillRect(11, -30, 8, 27);
  graphics.fillRect(-12, -36, 24, 7);
  graphics.fillRect(-16, -33, 7, 8);
  graphics.fillRect(9, -33, 7, 8);

  graphics.fillStyle(PALETTE.amber, 1);
  graphics.fillRect(-14, -27, 5, 23);
  graphics.fillRect(9, -27, 5, 23);
  graphics.fillRect(-9, -31, 18, 5);

  // Padlock body and one-pixel-style highlight/shadow bands.
  graphics.fillStyle(PALETTE.ink, 1);
  graphics.fillRect(-25, -7, 50, 40);
  graphics.fillStyle(PALETTE.wood, 1);
  graphics.fillRect(-20, -2, 40, 30);
  graphics.fillStyle(PALETTE.amber, 1);
  graphics.fillRect(-16, 2, 32, 5);
  graphics.fillRect(-16, 7, 5, 15);
  graphics.fillStyle(PALETTE.mutedBrown, 1);
  graphics.fillRect(-16, 23, 32, 5);
  graphics.fillRect(11, 7, 5, 16);

  // Pixel keyhole.
  graphics.fillStyle(PALETTE.ink, 1);
  graphics.fillRect(-4, 8, 8, 9);
  graphics.fillRect(-2, 16, 4, 7);

  return scene.add.container(Math.round(x), Math.round(y), [graphics]).setDepth(6);
}

function drawLink(graphics: Phaser.GameObjects.Graphics, x: number, y: number) {
  graphics.fillStyle(PALETTE.ink, 0.96);
  graphics.fillRect(x - 6, y - 4, 12, 8);
  graphics.fillStyle(PALETTE.mutedBrown, 1);
  graphics.fillRect(x - 3, y - 2, 6, 4);
  graphics.fillStyle(PALETTE.sand, 0.9);
  graphics.fillRect(x - 3, y - 2, 4, 2);
}
