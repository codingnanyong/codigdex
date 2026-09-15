import { describe, expect, it } from "vitest";
import { panelScaleToViewport } from "@/lib/phaser/dex/detailLayout";

describe("panelScaleToViewport", () => {
  it("keeps ordinary dex cards at their intended size", () => {
    expect(panelScaleToViewport(600, 420, 960, 540)).toBe(1);
  });

  it("shrinks tall cards enough to preserve top and bottom margins", () => {
    expect(panelScaleToViewport(600, 600, 960, 540)).toBeCloseTo(508 / 600);
  });

  it("also respects narrow viewports", () => {
    expect(panelScaleToViewport(600, 360, 500, 540)).toBeCloseTo(468 / 600);
  });
});
