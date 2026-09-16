import { describe, expect, it } from "vitest";
import { pathMapReturnTarget } from "@/lib/phaser/pathMap/returnTarget";

describe("path map return target", () => {
  it("returns to the world map when opened normally", () => {
    expect(pathMapReturnTarget()).toEqual({ scene: "world-map" });
  });

  it("preserves the detailed career region that opened the path map", () => {
    const region = {
      scene: "career-region" as const,
      data: { careerId: "backend" as const, regionId: "network" },
    };

    expect(pathMapReturnTarget(region)).toEqual(region);
  });
});
