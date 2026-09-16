import Phaser from "phaser";
import { PALETTE, PALETTE_HEX } from "./palette";
import { pixelText } from "./pixelFont";

export interface ImageAsset {
  key: string;
  url: string;
}

/** Queue only textures that are not already shared by Phaser's global texture cache. */
export function queueImage(scene: Phaser.Scene, asset: ImageAsset): boolean {
  if (scene.textures.exists(asset.key)) return false;
  scene.load.image(asset.key, asset.url);
  return true;
}

export function queueImages(scene: Phaser.Scene, assets: readonly ImageAsset[]): number {
  return assets.reduce((queued, asset) => queued + Number(queueImage(scene, asset)), 0);
}

/**
 * Draws immediately during preload so a scene transition never leaves a frozen
 * or blank canvas while its first large wallpaper is decoded.
 */
export function showLoadingScreen(
  scene: Phaser.Scene,
  queuedAssets: number,
  label: string
): void {
  if (queuedAssets === 0) return;

  const { width, height } = scene.scale;
  const depth = 10_000;
  const backdrop = scene.add
    .rectangle(width / 2, height / 2, width, height, PALETTE.nightBrown, 1)
    .setDepth(depth);
  const title = scene.add
    .text(width / 2, height / 2 - 38, label, {
      ...pixelText("subtitle"),
      color: PALETTE_HEX.cream,
    })
    .setOrigin(0.5)
    .setDepth(depth + 1);
  const track = scene.add
    .rectangle(width / 2, height / 2 + 8, 326, 18, PALETTE.ink, 1)
    .setStrokeStyle(2, PALETTE.cream, 0.8)
    .setDepth(depth + 1);
  const fill = scene.add
    .rectangle(width / 2 - 158, height / 2 + 8, 0, 10, PALETTE.amber, 1)
    .setOrigin(0, 0.5)
    .setDepth(depth + 2);
  const percent = scene.add
    .text(width / 2, height / 2 + 38, "0%", {
      ...pixelText("caption"),
      color: PALETTE_HEX.sand,
    })
    .setOrigin(0.5)
    .setDepth(depth + 2);

  const update = (progress: number) => {
    const normalized = Phaser.Math.Clamp(progress, 0, 1);
    fill.width = Math.round(316 * normalized);
    percent.setText(`${Math.round(normalized * 100)}%`);
  };
  const cleanup = () => {
    scene.load.off(Phaser.Loader.Events.PROGRESS, update);
    backdrop.destroy();
    title.destroy();
    track.destroy();
    fill.destroy();
    percent.destroy();
  };

  scene.load.on(Phaser.Loader.Events.PROGRESS, update);
  scene.load.once(Phaser.Loader.Events.COMPLETE, cleanup);
  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.load.off(Phaser.Loader.Events.PROGRESS, update);
  });
}
