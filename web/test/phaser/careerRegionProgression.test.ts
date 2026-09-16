import { describe, expect, it } from "vitest";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { CAREER_PATHS } from "@/lib/phaser/worldMap/careerPaths";
import { careerRegionProgression } from "@/lib/phaser/worldMap/careerRegionProgression";

describe("career region progression", () => {
  it("opens only the first recommended region on a fresh career map", () => {
    Object.values(CAREER_PATHS).forEach((path) => {
      expect(careerRegionProgression(path, new Set()).map(({ status }) => status)).toEqual([
        "available",
        ...path.regions.slice(1).map(() => "locked" as const),
      ]);
    });
  });

  it("opens the next region only after all five monsters in the previous one are captured", () => {
    const path = CAREER_PATHS.frontend;
    const firstMonsters = monstersForCareerRegion(path.regions[0].id);
    const partial = new Set(firstMonsters.slice(0, -1).map(({ id }) => id));
    const complete = new Set(firstMonsters.map(({ id }) => id));

    expect(careerRegionProgression(path, partial)[1].status).toBe("locked");
    expect(careerRegionProgression(path, complete).slice(0, 2).map(({ status }) => status)).toEqual([
      "completed",
      "available",
    ]);
  });

  it("records the immediately previous region required by each lock", () => {
    const path = CAREER_PATHS.devops;
    const progression = careerRegionProgression(path, new Set());
    progression.slice(1).forEach((entry, index) => {
      expect(entry.requiredRegion).toBe(path.regions[index]);
    });
  });

  it("does not skip an earlier incomplete region when shared technology was captured elsewhere", () => {
    const path = CAREER_PATHS.backend;
    const first = monstersForCareerRegion(path.regions[0].id);
    const third = monstersForCareerRegion(path.regions[2].id);
    const captured = new Set([...first, ...third].map(({ id }) => id));
    const progression = careerRegionProgression(path, captured);

    expect(progression[1].status).toBe("available");
    expect(progression[3].status).toBe("locked");
    expect(progression[3].requiredRegion).toBe(path.regions[1]);
  });
});
