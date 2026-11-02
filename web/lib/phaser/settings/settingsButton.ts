import type Phaser from "phaser";
import { registerGameControl } from "../gameControls";
import type { SettingsData } from "../scenes/SettingsScene";

/** Opens settings over `scene`, which pauses until settings close. */
export function openSettings(scene: Phaser.Scene) {
  const data: SettingsData = { returnTo: scene.scene.key };
  scene.scene.launch("settings", data);
  scene.scene.pause();
}

/** Expose settings only on the scenes where changing language is safe. */
export function createSettingsButton(
  scene: Phaser.Scene,
  x = 66,
  y = 26
): Phaser.GameObjects.Container {
  registerGameControl(scene, "settings", () => openSettings(scene));
  return scene.add.container(x, y).setName("SETTINGS").setVisible(false);
}
