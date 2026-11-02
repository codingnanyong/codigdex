import type Phaser from "phaser";

/** Authored gameplay coordinates; the renderer itself covers the browser. */
export const GAME_SIZE = { width: 960, height: 540 } as const;

export function gameViewport(width: number, height: number) {
  const zoom = Math.min(width / GAME_SIZE.width, height / GAME_SIZE.height);
  return { zoom, x: (width - GAME_SIZE.width * zoom) / 2, y: (height - GAME_SIZE.height * zoom) / 2 };
}

/** Expand only the scene painting. UI, sprites and hit targets keep one scale. */
export function fitGameScene(scene: Phaser.Scene) {
  const { width, height } = scene.scale;
  if (!width || !height || !scene.cameras?.main) return;
  const { zoom } = gameViewport(width, height);
  scene.cameras.main.setSize(width, height).setZoom(zoom).centerOn(480, 270);
  const painting = scene.children.list.find(child => {
    const object = child as Phaser.GameObjects.Image;
    return object.visible && object.displayWidth >= 900 && object.displayHeight >= 500 && object.x === 480 && object.y === 270;
  }) as Phaser.GameObjects.Image | undefined;
  // Atlas paintings encode terrain positions. Enlarging those would separate
  // the islands from their labels, overlays and polygon hit targets. Their
  // surrounding canvas is the same dark map surface instead.
  const isMap = ["world-map", "secondary-atlas"].includes(scene.sys?.settings.key ?? "");
  if (isMap) scene.cameras.main.setBackgroundColor("#180f08");
  if (painting && !isMap) {
    // Background-only breathing tweens retain their old scale after resize.
    scene.tweens.killTweensOf(painting);
    const cover = Math.max(width / zoom / 960, height / zoom / 540);
    painting.setDisplaySize(960 * cover, 540 * cover);
  }
}
