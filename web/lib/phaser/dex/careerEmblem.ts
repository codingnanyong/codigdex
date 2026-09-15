import Phaser from "phaser";
import {
  careerEmblemTextureKey,
  type CareerCatalogEntry,
  type CareerStatus,
} from "@codigdex/game-content/domain/careerDex";
import { PALETTE, PALETTE_HEX } from "../palette";
import { pixelText } from "../pixelFont";

/** Displays the finished emblem art; locked jobs retain only a sealed silhouette. */
export function createCareerEmblem(
  scene: Phaser.Scene,
  entry: CareerCatalogEntry,
  status: CareerStatus,
  x: number,
  y: number,
  size: number
): Phaser.GameObjects.Container {
  const locked = status === "locked";
  const image = scene.add
    .image(0, 0, careerEmblemTextureKey(entry.id))
    .setDisplaySize(size, size)
    .setAlpha(locked ? 0.16 : 1);
  if (locked) image.setTint(PALETTE.mutedBrown);

  const items: Phaser.GameObjects.GameObject[] = [image];
  if (locked) {
    items.push(
      scene.add
        .text(0, 0, "?", {
          ...pixelText(size >= 130 ? "hero" : "subtitle"),
          color: PALETTE_HEX.mutedBrown,
        })
        .setOrigin(0.5)
    );
  }

  return scene.add.container(x, y, items);
}
