import type Phaser from "phaser";

export function showOpenSourceNotes(ids?: readonly string[]) {
  if (!ids || ids.length) window.dispatchEvent(new CustomEvent("codigdex-open-source-notes", { detail: ids ? [...ids] : null }));
}

/** Own the imperative engine boundary while the native HTML dialog owns focus. */
export function pauseForOpenSourceNotes(game: Phaser.Game): () => void {
  const scenes = game.scene.getScenes(true);
  const inputEnabled = game.input.enabled;
  game.input.enabled = false;
  for (const scene of scenes) game.scene.pause(scene.sys.settings.key);
  let restored = false;
  return () => {
    if (restored) return;
    restored = true;
    if (game.input) game.input.enabled = inputEnabled;
    for (const scene of scenes) if (scene.sys?.isPaused()) game.scene.resume(scene.sys.settings.key);
  };
}

/** Manager operations are immediate. ScenePlugin operations queue until a later
 * frame, which can resume the old scene after starting the new expedition. */
export function startOpenSourceMission(game: Phaser.Game, data: { family: string; monsterId: string }) {
  for (const scene of game.scene.getScenes(false)) {
    if (scene.sys.isActive() || scene.sys.isPaused()) game.scene.stop(scene.sys.settings.key);
  }
  game.scene.start("open-source-chapter", data);
}
