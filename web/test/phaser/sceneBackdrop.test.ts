import type Phaser from "phaser";
import { EventEmitter } from "node:events";
import { expect, it } from "vitest";
import { trackSceneImageURLs } from "@/lib/phaser/sceneBackdrop";

it("records original arena URLs after loader shutdown and scene restarts without duplicate listeners", () => {
  const load = new EventEmitter(), events = new EventEmitter();
  const sources = new Map<string, string>();
  const stop = trackSceneImageURLs({ load, events } as unknown as Pick<Phaser.Scene, "load" | "events">, sources, { fileLoad: "load", start: "start", destroy: "destroy" });
  load.emit("load", { type: "image", key: "first", url: "/assets/first.png" });
  expect(sources.get("first")).toBe("/assets/first.png");
  // Phaser's LoaderPlugin.shutdown removes its external listeners.
  load.removeAllListeners();
  events.emit("start");
  events.emit("start");
  expect(load.listenerCount("load")).toBe(1);
  load.emit("load", { type: "image", key: "next", url: "/assets/next.png" });
  load.emit("load", { type: "json", key: "ignored", url: "/pack.json" });
  expect(sources.get("next")).toBe("/assets/next.png");
  expect(sources.has("ignored")).toBe(false);
  events.emit("destroy");
  stop();
  expect(load.listenerCount("load")).toBe(0);
  expect(events.listenerCount("start")).toBe(0);
  expect(events.listenerCount("destroy")).toBe(0);
});
