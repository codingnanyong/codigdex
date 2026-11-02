import { expect, it, vi } from "vitest";
import type Phaser from "phaser";
import { fitGameScene, gameViewport } from "@/lib/phaser/gameViewport";

it.each([[1440, 900], [1920, 1080], [390, 844], [844, 390]])("preserves uniform game scale in a full %ix%i canvas", (width, height) => {
  const { zoom, x, y } = gameViewport(width, height);
  expect(x).toBeGreaterThanOrEqual(0);
  expect(y).toBeGreaterThanOrEqual(0);
  expect(960 * zoom + x * 2).toBeCloseTo(width);
  expect(540 * zoom + y * 2).toBeCloseTo(height);
  const camera = { setSize: vi.fn().mockReturnThis(), setZoom: vi.fn().mockReturnThis(), centerOn: vi.fn() };
  const painting = { visible: true, displayWidth: 960, displayHeight: 540, x: 480, y: 270, setDisplaySize: vi.fn() };
  const scene = { scale: { width, height }, cameras: { main: camera }, children: { list: [painting] }, tweens: { killTweensOf: vi.fn() } };
  fitGameScene(scene as unknown as Phaser.Scene);
  expect(camera.setSize).toHaveBeenCalledWith(width, height);
  expect(camera.setZoom).toHaveBeenCalledWith(zoom);
  const [artWidth, artHeight] = painting.setDisplaySize.mock.calls[0];
  expect(artWidth / artHeight).toBeCloseTo(16 / 9);
  expect(artWidth * zoom).toBeGreaterThanOrEqual(width - .001);
  expect(artHeight * zoom).toBeGreaterThanOrEqual(height - .001);
});

it("keeps atlas island artwork aligned with its authored hit polygons", () => {
  const camera = { setSize: vi.fn().mockReturnThis(), setZoom: vi.fn().mockReturnThis(), centerOn: vi.fn(), setBackgroundColor: vi.fn() };
  const painting = { visible: true, displayWidth: 960, displayHeight: 540, x: 480, y: 270, setDisplaySize: vi.fn() };
  const scene = { sys: { settings: { key: "secondary-atlas" } }, scale: { width: 390, height: 844 }, cameras: { main: camera }, children: { list: [painting] }, tweens: { killTweensOf: vi.fn() } };
  fitGameScene(scene as unknown as Phaser.Scene);
  expect(painting.setDisplaySize).not.toHaveBeenCalled();
  expect(camera.setZoom).toHaveBeenCalledWith(390 / 960);
});
