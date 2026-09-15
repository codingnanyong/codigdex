import type Phaser from "phaser";
import { assetUrl } from "../assets";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";

export function preloadMonsterArt(scene: Phaser.Scene, monsters: readonly MonsterDefinition[]) {
  monsters.forEach(({ textureKey, assetKey }) => scene.load.image(textureKey, assetUrl(assetKey)));
}

export interface TextureFit {
  scale: number;
  width: number;
  height: number;
}

/**
 * Calculates a contain fit with an optional inset on every side. The inset is
 * useful for framed portraits: several early 256px specimens use almost their
 * entire source canvas, so fitting them flush to the nominal box makes their
 * outer pixels look clipped against the frame after browser scaling.
 */
export function fitTextureSize(
  textureWidth: number,
  textureHeight: number,
  maxWidth: number,
  maxHeight: number,
  inset = 0
): TextureFit {
  const safeInset = Math.max(0, Math.min(inset, maxWidth / 2, maxHeight / 2));
  const availableWidth = Math.max(1, maxWidth - safeInset * 2);
  const availableHeight = Math.max(1, maxHeight - safeInset * 2);
  const safeTextureWidth = Math.max(1, textureWidth);
  const safeTextureHeight = Math.max(1, textureHeight);
  const scale = Math.min(availableWidth / safeTextureWidth, availableHeight / safeTextureHeight);
  return { scale, width: safeTextureWidth * scale, height: safeTextureHeight * scale };
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
  maxHeight: number,
  inset = 0
): TextureFit {
  const frame = scene.textures.getFrame(textureKey) ?? { width: maxWidth, height: maxHeight };
  return fitTextureSize(frame.width, frame.height, maxWidth, maxHeight, inset);
}
