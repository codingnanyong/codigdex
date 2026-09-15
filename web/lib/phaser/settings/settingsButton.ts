import type Phaser from "phaser";
import { PALETTE } from "../palette";
import type { SettingsData } from "../scenes/SettingsScene";

/** Opens settings over `scene`, which pauses until settings close. */
export function openSettings(scene: Phaser.Scene) {
  const data: SettingsData = { returnTo: scene.scene.key };
  scene.scene.launch("settings", data);
  scene.scene.pause();
}

/** A pixel gear that sits beside the Home button on screens where the language can change safely. */
export function createSettingsButton(
  scene: Phaser.Scene,
  x = 66,
  y = 26
): Phaser.GameObjects.Container {
  const background = scene.add
    .rectangle(0, 0, 36, 36, PALETTE.wood, 0.94)
    .setStrokeStyle(2, PALETTE.ink)
    .setInteractive({ useHandCursor: true });
  const icon = scene.add.graphics();
  // Drawn in code like the Home house so it stays crisp at every display scale.
  icon.fillStyle(PALETTE.cream, 1);
  icon.fillRect(-3, -12, 6, 24);
  icon.fillRect(-12, -3, 24, 6);
  [
    [-9, -9],
    [5, -9],
    [-9, 5],
    [5, 5],
  ].forEach(([toothX, toothY]) => icon.fillRect(toothX, toothY, 4, 4));
  icon.fillRect(-8, -8, 16, 16);
  icon.fillStyle(PALETTE.wood, 1);
  icon.fillRect(-3, -3, 6, 6);

  background.on("pointerover", () => background.setFillStyle(PALETTE.maroon, 1));
  background.on("pointerout", () => background.setFillStyle(PALETTE.wood, 0.94));
  background.on("pointerdown", () => background.setFillStyle(PALETTE.amber, 1));
  background.on("pointerup", () => openSettings(scene));

  return scene.add.container(x, y, [background, icon]).setName("SETTINGS");
}
