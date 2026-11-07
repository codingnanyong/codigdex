import { expect, it } from "vitest";
import { secondaryRegionsFor, SECONDARY_REGIONS } from "@codigdex/game-content/domain/secondaryExploration";
import { terrainChainLockLayout, terrainChainLockLayoutForOutline } from "@/lib/phaser/worldMap/pixelChainLock";

it("anchors the platform map lock to its painted island, not the old route centre", () => {
  const region = secondaryRegionsFor("platform-engineer")[2];
  expect(region.center).toEqual([814, 170]);
  expect(terrainChainLockLayoutForOutline(region.outline)).toEqual({ x: 800, y: 165, scale: 0.82, labelY: 228 });
});

it("uses the primary atlas scale limits and keeps labels below the entire chain on every secondary island", () => {
  expect(terrainChainLockLayout({ x: 10, y: 20, width: 100, height: 80 }).scale).toBe(0.62);
  expect(terrainChainLockLayout({ x: 10, y: 20, width: 500, height: 400 }).scale).toBe(0.82);
  for (const region of SECONDARY_REGIONS) {
    const placement = terrainChainLockLayoutForOutline(region.outline);
    expect(placement.scale).toBeGreaterThanOrEqual(0.62);
    expect(placement.scale).toBeLessThanOrEqual(0.82);
    // Labels may be 43px tall; their top must clear even the lowest chain link.
    expect(placement.labelY - 43 / 2).toBeGreaterThan(placement.y + 40 * placement.scale);
  }
});
