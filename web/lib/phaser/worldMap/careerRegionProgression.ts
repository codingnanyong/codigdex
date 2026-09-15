import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import type { CareerPathDefinition, CareerRegion } from "./careerPaths";

export type CareerRegionStatus = "locked" | "available" | "completed";

export interface CareerRegionProgress {
  region: CareerRegion;
  status: CareerRegionStatus;
  requiredRegion?: CareerRegion;
}

export function isCareerRegionComplete(
  region: CareerRegion,
  captured: ReadonlySet<string>
): boolean {
  const monsters = monstersForCareerRegion(region.id);
  return monsters.length > 0 && monsters.every((monster) => captured.has(monster.id));
}

/** Unlocks career regions in their authored, recommended order. */
export function careerRegionProgression(
  path: CareerPathDefinition,
  captured: ReadonlySet<string>
): readonly CareerRegionProgress[] {
  let lastIncompleteRegion: CareerRegion | undefined;

  return path.regions.map((region) => {
    if (isCareerRegionComplete(region, captured)) return { region, status: "completed" };

    const requiredRegion = lastIncompleteRegion;
    lastIncompleteRegion = region;
    return requiredRegion
      ? { region, status: "locked", requiredRegion }
      : { region, status: "available" };
  });
}
