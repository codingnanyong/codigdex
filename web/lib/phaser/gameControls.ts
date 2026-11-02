import type Phaser from "phaser";

export type GameControls = Readonly<Partial<Record<"home" | "settings", () => void>>>;
const emptyControls: GameControls = Object.freeze({});
const controls = new WeakMap<Phaser.Scene, GameControls>();

/** Scenes expose their existing actions to the fixed-size HTML utility rail. */
export function registerGameControl(scene: Phaser.Scene, name: keyof GameControls, action: () => void) {
  if (!controls.has(scene)) {
    const clear = () => {
      controls.delete(scene);
      scene.events.off("shutdown", clear);
      scene.events.off("destroy", clear);
    };
    scene.events.once("shutdown", clear);
    scene.events.once("destroy", clear);
  }
  controls.set(scene, { ...controls.get(scene), [name]: action });
}

export function gameControlsFor(scene?: Phaser.Scene): GameControls {
  return scene ? controls.get(scene) ?? emptyControls : emptyControls;
}
