import type Phaser from "phaser";
import { EventEmitter } from "node:events";
import { expect, it, vi } from "vitest";
import { createHomeButton } from "@/lib/phaser/navigation";
import { createSettingsButton } from "@/lib/phaser/settings/settingsButton";
import { gameControlsFor } from "@/lib/phaser/gameControls";

function fixture() {
  const events = new EventEmitter();
  const object = { setName: vi.fn().mockReturnThis(), setVisible: vi.fn().mockReturnThis() };
  const navigation = { key: "world-map", stop: vi.fn(), start: vi.fn(), launch: vi.fn(), pause: vi.fn() };
  const scene = { events, add: { container: vi.fn(() => object) }, scene: navigation } as unknown as Phaser.Scene;
  return { scene, events, object, navigation };
}

it("delegates rail actions to the scene's original home and safe settings behavior", () => {
  const { scene, object, navigation } = fixture();
  expect(gameControlsFor(scene)).toEqual({});
  createHomeButton(scene); createSettingsButton(scene);
  expect(object.setVisible).toHaveBeenCalledWith(false);
  gameControlsFor(scene).settings!();
  expect(navigation.launch).toHaveBeenCalledWith("settings", { returnTo: "world-map" });
  expect(navigation.pause).toHaveBeenCalledOnce();
  gameControlsFor(scene).home!();
  expect(navigation.start).toHaveBeenCalledWith("intro");
  expect(navigation.stop).not.toHaveBeenCalledWith("world-map");
});

it.each(["shutdown", "destroy"])("removes stale rail actions on %s before a scene is reused", (event) => {
  const { scene, events } = fixture();
  createHomeButton(scene); createSettingsButton(scene);
  const previous = gameControlsFor(scene);
  events.emit(event);
  expect(gameControlsFor(scene)).toEqual({});
  expect(events.listenerCount("shutdown")).toBe(0);
  expect(events.listenerCount("destroy")).toBe(0);
  createHomeButton(scene);
  expect(gameControlsFor(scene).home).not.toBe(previous.home);
  expect(gameControlsFor(scene).settings).toBeUndefined();
});
