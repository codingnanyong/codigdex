import { describe, expect, it } from "vitest";
import { detailPanelScale } from "@/lib/phaser/dex/detailLayout";

describe("detailPanelScale", () => {
  it("keeps ordinary dex cards at their intended size", () => {
    expect(detailPanelScale(600, 420, 960, 540)).toBe(1);
  });

  it("shrinks tall cards enough to preserve top and bottom margins", () => {
    expect(detailPanelScale(600, 600, 960, 540)).toBeCloseTo(508 / 600);
  });

  it("also respects narrow viewports", () => {
    expect(detailPanelScale(600, 360, 500, 540)).toBeCloseTo(468 / 600);
  });
});
