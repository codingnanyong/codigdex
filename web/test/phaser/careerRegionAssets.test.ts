import { describe, expect, it } from "vitest";
import { careerRegionAssets } from "@/lib/phaser/worldMap/careerRegionAssets";

describe("career region asset bundle", () => {
  it("loads only the active monster for a new region", () => {
    const assets = careerRegionAssets("frontend", "html-css", new Set());
    const monsterAssets = assets.filter(({ key }) => key.startsWith("career-region-monster-"));

    expect(assets.some(({ key }) => key.endsWith("-chapter-wallpaper"))).toBe(true);
    expect(monsterAssets).toHaveLength(1);
    expect(monsterAssets[0]?.key).toContain("structure-sprout");
  });

  it("keeps captured monsters visible and preloads the next checkpoint", () => {
    const assets = careerRegionAssets(
      "frontend",
      "html-css",
      new Set(["structure-sprout", "style-shell"])
    );
    const monsterKeys = assets
      .map(({ key }) => key)
      .filter((key) => key.startsWith("career-region-monster-"));

    expect(monsterKeys).toHaveLength(3);
    expect(monsterKeys.some((key) => key.includes("cascade-weaver"))).toBe(true);
  });
});
