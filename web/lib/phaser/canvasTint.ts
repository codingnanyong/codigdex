import type Phaser from "phaser";

let generation = 0;
const caches = new WeakMap<Phaser.Scene, { prefix: string; keys: Map<string, string> }>();

/** Canvas-compatible multiplicative tint, cached only for the lifetime of its scene. */
export function tintImage(scene: Phaser.Scene, image: Phaser.GameObjects.Image, color: number) {
  let cache = caches.get(scene);
  if (!cache) {
    cache = { prefix: `scene-tint-${++generation}`, keys: new Map() };
    caches.set(scene, cache);
    const owned = cache;
    scene.events.once("shutdown", () => {
      for (const key of owned.keys.values()) scene.textures.remove(key);
      caches.delete(scene);
    });
  }
  const frame = image.frame;
  const sourceKey = `${image.texture.key}:${frame.name}:${color}`;
  let key = cache.keys.get(sourceKey);
  if (!key) {
    key = `${cache.prefix}-${cache.keys.size}`;
    const texture = scene.textures.createCanvas(key, frame.cutWidth, frame.cutHeight);
    if (!texture) throw new Error(`Cannot create tinted texture: ${key}`);
    const context = texture.getContext();
    const draw = () => context.drawImage(frame.source.image as CanvasImageSource,
      frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, 0, 0, frame.cutWidth, frame.cutHeight);
    draw();
    context.globalCompositeOperation = "multiply";
    context.fillStyle = `#${color.toString(16).padStart(6, "0")}`;
    context.fillRect(0, 0, frame.cutWidth, frame.cutHeight);
    // Multiplication fills transparent pixels too; restore the original alpha mask.
    context.globalCompositeOperation = "destination-in";
    draw();
    context.globalCompositeOperation = "source-over";
    texture.refresh();
    cache.keys.set(sourceKey, key);
  }
  return image.setTexture(key);
}
