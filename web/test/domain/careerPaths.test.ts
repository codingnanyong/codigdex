import { describe, expect, it } from "vitest";
import { CAREER_PATHS, careerPathFor } from "@/lib/phaser/worldMap/careerPaths";
import { JOB_OPTIONS, SECONDARY_JOB_OPTIONS, secondaryJobsFor, type JobId } from "@/lib/domain/player/jobs";

describe("career paths", () => {
  it("gives every primary job a detailed map with several dex destinations", () => {
    const primaryIds = JOB_OPTIONS.map((job) => job.id) as JobId[];
    expect(Object.keys(CAREER_PATHS).sort()).toEqual([...primaryIds].sort());

    primaryIds.forEach((jobId) => {
      const path = careerPathFor(jobId);
      expect(path.regions.length).toBeGreaterThanOrEqual(5);
      expect(path.regions.every(({ x, y }) => x > 0 && x < 960 && y > 50 && y < 540)).toBe(true);
      expect(path.regions.every(({ landmark }) => landmark !== undefined)).toBe(true);
      expect(
        path.regions.every(({ landmark }) =>
          landmark
            ? landmark.x - landmark.width / 2 >= 0 &&
              landmark.x + landmark.width / 2 <= 960 &&
              landmark.y - landmark.height / 2 >= 0 &&
              landmark.y + landmark.height / 2 <= 540
            : true
        )
      ).toBe(true);
    });
  });

  it("keeps future tier-two identities modeled while the UI can render them as mysteries", () => {
    expect(SECONDARY_JOB_OPTIONS.map((job) => job.id)).toContain("fullstack-engineer");
    expect(SECONDARY_JOB_OPTIONS.map((job) => job.id)).toContain("ml-developer");
    expect(secondaryJobsFor("backend").length).toBeGreaterThan(1);
  });
});
