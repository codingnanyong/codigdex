// @vitest-environment happy-dom
import type Phaser from "phaser";
import { EventEmitter } from "node:events";
import { expect, it, vi } from "vitest";
import { SECONDARY_REGIONS } from "@codigdex/game-content/domain/secondaryExploration";
import { drawFiveStageRoute } from "@/lib/phaser/fiveStageRoute";

vi.mock("phaser", () => ({ default: { Scenes: { Events: { SHUTDOWN: "shutdown", DESTROY: "destroy" } } } }));
vi.mock("@/lib/phaser/ui", () => ({ fitTextInside: (value: unknown) => value }));
vi.mock("@/lib/phaser/i18n", () => ({ sceneLocale: () => "en", lt: (_: unknown, text: { en: string }) => text.en }));

it("exposes a focused learning action and removes DOM/keyboard controls when destroyed without shutdown", () => {
  const events = new EventEmitter(), keyboard = new EventEmitter();
  const parent = document.createElement("div"), canvas = document.createElement("canvas");
  parent.append(canvas); document.body.append(parent);
  const display = () => {
    const object: Record<string, unknown> = {};
    for (const method of ["lineStyle", "lineBetween", "setOrigin", "setStrokeStyle", "setDisplaySize", "setInteractive", "on", "setText"]) object[method] = () => object;
    return object;
  };
  const scene = { add: { graphics: display, text: display, ellipse: display, image: display, rectangle: display }, events, input: { keyboard }, game: { canvas } } as unknown as Phaser.Scene;
  const stages = SECONDARY_REGIONS[0].chapter.stages;
  const start = vi.fn();
  try {
    drawFiveStageRoute(scene, stages.map((monster, i) => ({ monster, status: i ? "locked" : "available" })), stages[0].id, vi.fn(), { arena: "fixture", onEnter: start });
    const action = parent.querySelector<HTMLButtonElement>('[data-route-action="start"]')!;
    action.focus(); action.click();
    expect(document.activeElement).toBe(action);
    expect(start).toHaveBeenCalledOnce();
    expect(keyboard.listenerCount("keydown")).toBe(1);
    events.emit("destroy");
    expect(parent.querySelector("nav")).toBeNull();
    expect(keyboard.listenerCount("keydown")).toBe(0);
    expect(events.listenerCount("shutdown")).toBe(0);
    expect(events.listenerCount("destroy")).toBe(0);
  } finally { parent.remove(); }
});
