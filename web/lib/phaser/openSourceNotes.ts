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
