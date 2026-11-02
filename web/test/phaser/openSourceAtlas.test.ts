// @vitest-environment happy-dom
import type Phaser from "phaser";
import { EventEmitter } from "node:events";
import { expect, it, vi } from "vitest";
import { findOpenSource } from "@codigdex/game-content/domain/openSourceCatalog";
import { drawOpenSourceAtlas } from "@/lib/phaser/openSourceAtlas";
vi.mock("phaser", () => ({ default: { Scenes: { Events: { SHUTDOWN: "shutdown", DESTROY: "destroy" } } } }));
vi.mock("@/lib/phaser/ui", () => ({ fitTextInside: vi.fn(), createButton: vi.fn(), drawOrnateFrame: vi.fn() }));
vi.mock("@/lib/phaser/i18n", () => ({ sceneLocale: () => "en", lt: (_: unknown, text: { en: string }) => text.en }));
it("allows only the current ecosystem destination and removes its controls on destruction", () => {
  const events = new EventEmitter();
  const parent = document.createElement("div"), canvas = document.createElement("canvas");
  parent.append(canvas); document.body.append(parent);
  const display = () => {
    const object: Record<string, unknown> = {};
    for (const name of ["lineStyle", "lineBetween", "setOrigin", "setStrokeStyle", "setDisplaySize", "setAlpha", "setInteractive", "on"]) object[name] = () => object;
    return object;
  };
  const scene = { add: { graphics: display, text: display, image: display, rectangle: display }, cameras: { main: { setBackgroundColor: vi.fn() } }, events, game: { canvas } } as unknown as Phaser.Scene;
  const enter = vi.fn(), leave = vi.fn();
  try {
    drawOpenSourceAtlas(scene, findOpenSource("tanstack-query")!, enter, leave);
    const buttons = [...parent.querySelectorAll<HTMLButtonElement>("button[data-family]")];
    expect(buttons).toHaveLength(9);
    expect(buttons.filter((button) => !button.disabled).map((button) => button.dataset.family)).toEqual(["application"]);
    buttons.find((button) => button.disabled)!.click();
    expect(enter).not.toHaveBeenCalled();
    buttons.find((button) => !button.disabled)!.click();
    expect(enter).toHaveBeenCalledOnce();
    parent.querySelector<HTMLButtonElement>('[data-source-action="leave"]')!.click();
    expect(leave).toHaveBeenCalledOnce();
    events.emit("destroy");
    expect(parent.querySelector("nav")).toBeNull();
    expect(events.listenerCount("shutdown")).toBe(0);
  } finally { parent.remove(); }
});
