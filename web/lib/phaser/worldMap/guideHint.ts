import type Phaser from "phaser";
import { PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";
import { applyPixelFontToScene } from "../ui";

/** A bobbing arrow pointing at the quest pin, plus an instruction along the bottom. */
export function showGuideHint(
  scene: Phaser.Scene,
  message = "빛나는 의뢰 표식을 눌러 보세요",
  target?: { x: number; y: number }
): Phaser.GameObjects.Container {
  const { width, height } = scene.scale;
  const targetX = target?.x ?? width / 2;
  const targetY = target?.y ?? height / 2 + 12;
  const placeOnRight = targetX < width * 0.72;
  const direction = placeOnRight ? -1 : 1;
  const arrowX = targetX + (placeOnRight ? 76 : -76);

  const arrow = scene.add
    .text(arrowX, targetY, placeOnRight ? "◀" : "▶", {
      ...pixelText("subtitle"),
      color: PALETTE_HEX.maroon,
      stroke: PALETTE_HEX.cream,
      strokeThickness: 3,
    })
    .setOrigin(0.5);
  const instruction = scene.add
    .text(width / 2, height - 28, message, {
      ...pixelText("body"),
      color: PALETTE_HEX.cream,
      backgroundColor: "#2a1d14e6",
      padding: { x: 12, y: 7 },
    })
    .setOrigin(0.5);

  scene.tweens.add({
    targets: arrow,
    x: arrow.x + direction * 8,
    duration: 520,
    ease: "Sine.InOut",
    yoyo: true,
    repeat: -1,
  });

  const hint = scene.add.container(0, 0, [arrow, instruction]).setDepth(8);
  applyPixelFontToScene(scene);
  return hint;
}
