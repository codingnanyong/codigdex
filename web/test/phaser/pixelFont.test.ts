import { describe, expect, it, vi } from "vitest";
import { getPixelFontFamily, whenPixelFontReady } from "@/lib/phaser/pixelFont";

describe("getPixelFontFamily", () => {
  it("falls back to monospace when there is no document (e.g. server-side)", () => {
    expect(getPixelFontFamily()).toBe("monospace");
  });
});

describe("whenPixelFontReady", () => {
  it("invokes the callback immediately when there is no document", () => {
    const callback = vi.fn();
    whenPixelFontReady(callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});
