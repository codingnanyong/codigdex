import type Phaser from "phaser";

/** Loader listeners are cleared on scene shutdown; reattach before each preload. */
export function trackSceneImageURLs(
  scene: Pick<Phaser.Scene, "events" | "load">,
  sources: Map<string, string>,
  events: { fileLoad: string; start: string; destroy: string }
): () => void {
  const record = (file: { type: string; key: string; url: unknown }) => {
    if (file.type === "image" && typeof file.url === "string") sources.set(file.key, file.url);
  };
  const bind = () => {
    scene.load.off(events.fileLoad, record);
    scene.load.on(events.fileLoad, record);
  };
  const dispose = () => {
    scene.load.off(events.fileLoad, record);
    scene.events.off(events.start, bind);
    scene.events.off(events.destroy, dispose);
  };
  bind();
  scene.events.on(events.start, bind);
  scene.events.once(events.destroy, dispose);
  return dispose;
}
