import type Phaser from "phaser";
import type { AmbienceId } from "@codigdex/game-core/domain/chapters/types";
import { AMBIENCE_PRESETS } from "./presets";

/**
 * Layers the named ambient animation over a painted background. Call it right
 * after drawing the backdrop, so the scene's panels still draw on top.
 */
export function playAmbience(scene: Phaser.Scene, id: AmbienceId) {
  AMBIENCE_PRESETS[id](scene);
}
