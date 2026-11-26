import type Phaser from "phaser";
import { expect, it, vi } from "vitest";
import { tintImage } from "@/lib/phaser/canvasTint";

it("reuses a scene's tinted texture and releases it without removing the original", () => {
  let shutdown = () => {};
  const context = { drawImage: vi.fn(), fillRect: vi.fn(), globalCompositeOperation: "source-over", fillStyle: "" };
  const texture = { getContext: () => context, refresh: vi.fn() };
  const scene = { events: { once: (_name: string, callback: () => void) => { shutdown = callback; } },
    textures: { createCanvas: vi.fn(() => texture), remove: vi.fn() } };
  const make = () => ({ texture: { key: "original" }, frame: { name: "__BASE", cutWidth: 20, cutHeight: 20, cutX: 0, cutY: 0, source: { image: {} } }, setTexture: vi.fn() });
  const first = make(), second = make();
  tintImage(scene as unknown as Phaser.Scene, first as unknown as Phaser.GameObjects.Image, 0x332211);
  tintImage(scene as unknown as Phaser.Scene, second as unknown as Phaser.GameObjects.Image, 0x332211);
  expect(scene.textures.createCanvas).toHaveBeenCalledOnce();
  expect(first.setTexture.mock.calls).toEqual(second.setTexture.mock.calls);
  expect(context.globalCompositeOperation).toBe("source-over");
  shutdown();
  expect(scene.textures.remove).toHaveBeenCalledWith(first.setTexture.mock.calls[0][0]);
  expect(scene.textures.remove).not.toHaveBeenCalledWith("original");
});
