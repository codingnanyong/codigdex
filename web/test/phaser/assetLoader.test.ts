import { describe, expect, it, vi } from "vitest";
import type Phaser from "phaser";

vi.mock("phaser", () => ({
  default: {
    Loader: { Events: { COMPLETE: "complete", PROGRESS: "progress" } },
    Math: { Clamp: (value: number, min: number, max: number) => Math.min(max, Math.max(min, value)) },
    Scenes: { Events: { SHUTDOWN: "shutdown" } },
  },
}));

import { queueImage, queueImages } from "@/lib/phaser/assetLoader";

function sceneWithCachedKeys(cachedKeys: readonly string[]) {
  const cached = new Set(cachedKeys);
  const image = vi.fn();
  const scene = {
    textures: { exists: (key: string) => cached.has(key) },
    load: { image },
  } as unknown as Phaser.Scene;
  return { scene, image };
}

describe("asset loader", () => {
  it("does not queue a texture that is already cached", () => {
    const { scene, image } = sceneWithCachedKeys(["cached"]);

    expect(queueImage(scene, { key: "cached", url: "/cached.png" })).toBe(false);
    expect(image).not.toHaveBeenCalled();
  });

  it("queues an uncached texture", () => {
    const { scene, image } = sceneWithCachedKeys([]);

    expect(queueImage(scene, { key: "new", url: "/new.png" })).toBe(true);
    expect(image).toHaveBeenCalledWith("new", "/new.png");
  });

  it("counts only uncached textures in a mixed bundle", () => {
    const { scene, image } = sceneWithCachedKeys(["cached"]);

    expect(
      queueImages(scene, [
        { key: "cached", url: "/cached.png" },
        { key: "first", url: "/first.png" },
        { key: "second", url: "/second.png" },
      ])
    ).toBe(2);
    expect(image).toHaveBeenCalledTimes(2);
  });
});
