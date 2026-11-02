import type Phaser from "phaser";
import { registerGameControl } from "./gameControls";

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
  registerGameControl(scene, "home", () => goHome(scene));
  // Keep the scene's container contract without a second scaled hit target.
  return scene.add.container(x, y).setName("HOME").setVisible(false);
}
