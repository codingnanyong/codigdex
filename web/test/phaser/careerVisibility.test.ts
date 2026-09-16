import { describe, expect, it } from "vitest";
import {
  SECONDARY_JOB_OPTIONS,
  TERTIARY_JOB_OPTIONS,
} from "@codigdex/game-content/domain/player/jobs";
import { revealedTertiaryRequirement } from "@/lib/phaser/jobSelect/careerVisibility";

describe("career visibility", () => {
  const tertiary = TERTIARY_JOB_OPTIONS[0];
  const required = SECONDARY_JOB_OPTIONS.find((job) => job.id === tertiary.requires)!;

  it("keeps the required tier-2 name hidden while its card is ???", () => {
    expect(revealedTertiaryRequirement(tertiary, new Set())).toBeUndefined();
  });

  it("reveals the required tier-2 name after its prerequisite paths are complete", () => {
    expect(revealedTertiaryRequirement(tertiary, new Set(required.requires))).toBe(required);
  });
});
