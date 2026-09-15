import { describe, expect, it } from "vitest";
import { CAREER_PATHS } from "@/lib/phaser/worldMap/careerPaths";
import { careerCheckpointLayout } from "@/lib/phaser/worldMap/careerCheckpointLayout";

describe("career checkpoint layouts", () => {
  const maps = Object.values(CAREER_PATHS).flatMap((career) =>
    career.regions.map((region) => ({ careerId: career.jobId, regionId: region.id }))
  );

  it("keeps five checkpoints inside every map's open arena", () => {
    maps.forEach(({ careerId, regionId }) => {
      const points = careerCheckpointLayout(careerId, regionId);
      expect(points, `${careerId}/${regionId}`).toHaveLength(5);
      points.forEach(({ x, y }) => {
        expect(x).toBeGreaterThanOrEqual(130);
        expect(x).toBeLessThanOrEqual(830);
        expect(y).toBeGreaterThanOrEqual(180);
        expect(y).toBeLessThanOrEqual(330);
      });
    });
  });

  it("uses varied silhouettes instead of one repeated zigzag", () => {
    const signatures = maps.map(({ careerId, regionId }) =>
      careerCheckpointLayout(careerId, regionId)
        .map(({ x, y }) => `${x},${y}`)
        .join("|")
    );

    expect(new Set(signatures).size).toBeGreaterThanOrEqual(15);
  });
});
