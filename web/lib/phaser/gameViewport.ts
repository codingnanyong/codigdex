import type Phaser from "phaser";

/** Authored gameplay coordinates; the renderer itself covers the browser. */
export const GAME_SIZE = { width: 960, height: 540 } as const;

export function gameViewport(width: number, height: number) {
  const zoom = Math.min(width / GAME_SIZE.width, height / GAME_SIZE.height);
  return { zoom, x: (width - GAME_SIZE.width * zoom) / 2, y: (height - GAME_SIZE.height * zoom) / 2 };
}

/** Keep terrain, UI and hit targets in the same authored frame at every aspect ratio. */
export function fitGameScene(scene: Phaser.Scene) {
  const { width, height } = scene.scale;
  if (!width || !height || !scene.cameras?.main) return;
  const { zoom, x, y } = gameViewport(width, height);
  scene.cameras.main
    .setViewport(x, y, GAME_SIZE.width * zoom, GAME_SIZE.height * zoom)
    .setZoom(zoom)
    .centerOn(GAME_SIZE.width / 2, GAME_SIZE.height / 2);
}
