import type Phaser from "phaser";
import { PALETTE } from "./palette";

const PLAY_SCENES = [
  "job-select",
  "path-map",
  "world-map",
  "career-region",
  "code-battle",
  "capture-quiz",
  "codigdex",
] as const;

/** Returns to the title without clearing saved progress or leaving paused scenes behind. */
export function goHome(scene: Phaser.Scene) {
  PLAY_SCENES.forEach((key) => {
    if (key !== scene.scene.key) scene.scene.stop(key);
  });
  scene.scene.start("intro");
}

export function createHomeButton(
  scene: Phaser.Scene,
  x = 26,
  y = 26
): Phaser.GameObjects.Container {
  const background = scene.add
    .rectangle(0, 0, 36, 36, PALETTE.wood, 0.94)
    .setStrokeStyle(2, PALETTE.ink)
    .setInteractive({ useHandCursor: true });
  const icon = scene.add.graphics();
  // A code-drawn pixel house stays crisp at every Phaser display scale.
  icon.fillStyle(PALETTE.cream, 1);
  icon.fillRect(-3, -12, 6, 3);
  icon.fillRect(-7, -9, 14, 3);
  icon.fillRect(-11, -6, 22, 4);
  icon.fillRect(-8, -2, 16, 13);
  icon.fillStyle(PALETTE.ink, 1);
  icon.fillRect(-2, 4, 4, 7);

  background.on("pointerover", () => background.setFillStyle(PALETTE.maroon, 1));
  background.on("pointerout", () => background.setFillStyle(PALETTE.wood, 0.94));
  background.on("pointerdown", () => background.setFillStyle(PALETTE.amber, 1));
  background.on("pointerup", () => goHome(scene));

  return scene.add.container(x, y, [background, icon]).setName("HOME");
}
