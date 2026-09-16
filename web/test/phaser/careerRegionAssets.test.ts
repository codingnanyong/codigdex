import { describe, expect, it } from "vitest";
import { careerRegionAssets } from "@/lib/phaser/worldMap/careerRegionAssets";

describe("career region asset bundle", () => {
  it("caches every checkpoint monster on the first region visit", () => {
    const assets = careerRegionAssets("frontend", "html-css");
    const monsterAssets = assets.filter(({ key }) => key.startsWith("career-region-monster-"));

    expect(assets.some(({ key }) => key.endsWith("-chapter-wallpaper"))).toBe(true);
    expect(monsterAssets).toHaveLength(5);
    expect(monsterAssets[0]?.key).toContain("structure-sprout");
    expect(monsterAssets[4]?.key).toContain("responsive-layout-paladin");
  });

  it("returns the same cached bundle after intermediate captures", () => {
    const initialKeys = careerRegionAssets("frontend", "html-css").map(({ key }) => key);
    const assets = careerRegionAssets("frontend", "html-css");
    const monsterKeys = assets
      .map(({ key }) => key)
      .filter((key) => key.startsWith("career-region-monster-"));

    expect(assets.map(({ key }) => key)).toEqual(initialKeys);
    expect(monsterKeys).toHaveLength(5);
    expect(monsterKeys.some((key) => key.includes("cascade-weaver"))).toBe(true);
  });
});
