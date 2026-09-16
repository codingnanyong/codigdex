import type Phaser from "phaser";
import { assetUrl } from "../assets";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { queueImage } from "./assetLoader";

export function preloadMonsterArt(scene: Phaser.Scene, monsters: readonly MonsterDefinition[]) {
  return monsters.reduce(
    (queued, { textureKey, assetKey }) =>
      queued + Number(queueImage(scene, { key: textureKey, url: assetUrl(assetKey) })),
    0
  );
}

/**
 * Fits a loaded texture inside a box without distorting it. Monster art isn't
 * one shape — the loop bug is 3:2 and every specimen is square — so a fixed
 * setDisplaySize() would stretch one kind or the other.
 *
 * A texture that failed to load (a moved or renamed asset) has no frame. Fit
 * the box as-is then, so Phaser draws its missing-texture placeholder instead
 * of the whole scene dying on `frame.width`.
 */
export function fitTexture(
  scene: Phaser.Scene,
  textureKey: string,
  maxWidth: number,
  maxHeight: number
): { scale: number; width: number; height: number } {
  const frame = scene.textures.getFrame(textureKey) ?? { width: maxWidth, height: maxHeight };
  const scale = Math.min(maxWidth / frame.width, maxHeight / frame.height);
  return { scale, width: frame.width * scale, height: frame.height * scale };
}
