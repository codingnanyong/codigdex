import { describe, expect, it } from "vitest";
import { devicePixelsPerGamePixel, imageRenderingFor } from "@/lib/phaser/displayScale";

const renderingAt = (cssWidth: number, devicePixelRatio: number) =>
  imageRenderingFor(devicePixelsPerGamePixel(cssWidth, devicePixelRatio, 960));

describe("imageRenderingFor", () => {
  it("keeps pixel art crisp at whole-number scales", () => {
    expect(renderingAt(960, 1)).toBe("pixelated");
    expect(renderingAt(960, 2)).toBe("pixelated");
    expect(renderingAt(768, 1.25)).toBe("pixelated");
    expect(renderingAt(1920, 1)).toBe("pixelated");
  });

  it("smooths fractional scales so strokes stay even", () => {
    expect(renderingAt(960, 1.25)).toBe("auto");
    expect(renderingAt(960, 1.5)).toBe("auto");
    expect(renderingAt(693, 3)).toBe("auto");
  });

  it("smooths a shrunken canvas and a canvas with no size yet", () => {
    expect(renderingAt(480, 1)).toBe("auto");
    expect(imageRenderingFor(devicePixelsPerGamePixel(0, 1, 960))).toBe("auto");
    expect(devicePixelsPerGamePixel(960, 1, 0)).toBe(0);
  });
});
