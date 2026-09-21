import { describe, expect, it } from "vitest";
import { dexGridMetrics } from "./layout";

describe("mobile dex grid metrics", () => {
  it("uses one column without overflowing a narrow viewport", () => {
    const metrics = dexGridMetrics(280);

    expect(metrics.columns).toBe(1);
    expect(metrics.cardWidth).toBeLessThanOrEqual(240);
    expect(metrics.imageSize).toBeLessThanOrEqual(metrics.cardWidth - 24);
  });

  it("uses two columns on a common phone width", () => {
    expect(dexGridMetrics(320)).toEqual({ cardWidth: 134, columns: 2, imageSize: 108 });
  });

  it("caps cards and art on large screens", () => {
    expect(dexGridMetrics(1024)).toEqual({ cardWidth: 190, columns: 2, imageSize: 108 });
  });

  it("never returns negative sizes for invalid measurements", () => {
    expect(dexGridMetrics(-1)).toEqual({ cardWidth: 0, columns: 1, imageSize: 0 });
  });
});
