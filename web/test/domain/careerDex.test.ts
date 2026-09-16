import { describe, expect, it } from "vitest";
import {
  CAREER_CATALOG,
  CAREER_EMBLEMS,
  EMPTY_CAREER_DEX_STATE,
  careerRecord,
  careerStatus,
  masteredPrimaryJobIds,
  reconcileCareerDex,
  selectCareer,
} from "@codigdex/game-content/domain/careerDex";
import type { JobId, SecondaryJobId } from "@codigdex/game-content/domain/player/jobs";
import { LOCALES } from "@codigdex/game-core/i18n/locale";

const fixedNow = () => "2026-09-14T00:00:00.000Z";

const progress = (
  completedPrimaryJobs: ReadonlySet<JobId> = new Set(),
  completedSecondaryJobs: ReadonlySet<SecondaryJobId> = new Set()
) => ({
  commonPathComplete: true,
  completedPrimaryJobs,
  completedSecondaryJobs,
  activePrimaryJob: "junior" as const,
});

describe("career catalog", () => {
  it("registers the junior and five jobs at every promotion tier", () => {
    expect(CAREER_CATALOG).toHaveLength(16);
    expect([0, 1, 2, 3].map((tier) => CAREER_CATALOG.filter((job) => job.tier === tier).length)).toEqual([
      1, 5, 5, 5,
    ]);
  });

  it("gives every playable career path a distinct named guide", () => {
    for (const locale of LOCALES) {
      const guideNames = CAREER_CATALOG.map((career) => career.guideName?.[locale]);

      expect(guideNames.every(Boolean)).toBe(true);
      expect(new Set(guideNames).size).toBe(16);
    }
  });

  it("gives every career a distinct collectible emblem", () => {
    const emblems = CAREER_CATALOG.map((career) => career.emblemAssetKey);

    expect(Object.keys(CAREER_EMBLEMS)).toHaveLength(CAREER_CATALOG.length);
    expect(emblems.every(Boolean)).toBe(true);
    expect(new Set(emblems).size).toBe(CAREER_CATALOG.length);
  });
});

describe("career dex progression", () => {
  it("unlocks primary jobs after the common path without mastering them", () => {
    const state = reconcileCareerDex(EMPTY_CAREER_DEX_STATE, progress(), fixedNow);

    expect(careerRecord(state, "junior")?.masteredAt).toBe(fixedNow());
    expect(careerStatus(state, "frontend")).toBe("unlocked");
    expect(careerStatus(state, "fullstack-engineer")).toBe("locked");
  });

  it("records a first selection separately from mastery", () => {
    const unlocked = reconcileCareerDex(EMPTY_CAREER_DEX_STATE, progress(), fixedNow);
    const selected = selectCareer(unlocked, "frontend", fixedNow);

    expect(careerRecord(selected, "frontend")).toMatchObject({
      unlockedAt: fixedNow(),
      selectedAt: fixedNow(),
    });
    expect(careerRecord(selected, "frontend")?.masteredAt).toBeUndefined();
    expect(careerStatus(selected, "frontend", new Set(["frontend"]))).toBe("active");
  });

  it("unlocks tier two and tier three from mastered career records", () => {
    const primaryMastered = reconcileCareerDex(
      EMPTY_CAREER_DEX_STATE,
      progress(new Set(["frontend", "backend"])),
      fixedNow
    );
    expect(masteredPrimaryJobIds(primaryMastered)).toEqual(new Set(["frontend", "backend"]));
    expect(careerStatus(primaryMastered, "fullstack-engineer")).toBe("unlocked");
    expect(careerStatus(primaryMastered, "platform-engineer")).toBe("locked");

    const secondaryMastered = reconcileCareerDex(
      primaryMastered,
      progress(new Set(["frontend", "backend"]), new Set(["fullstack-engineer"])),
      fixedNow
    );
    expect(careerRecord(secondaryMastered, "fullstack-engineer")?.masteredAt).toBe(fixedNow());
    expect(careerStatus(secondaryMastered, "software-architect")).toBe("unlocked");
  });

  it("keeps earned milestones when a later reconciliation has fewer inputs", () => {
    const mastered = reconcileCareerDex(
      EMPTY_CAREER_DEX_STATE,
      progress(new Set(["frontend", "backend"])),
      fixedNow
    );
    const reconciled = reconcileCareerDex(mastered, progress(), fixedNow);

    expect(careerRecord(reconciled, "frontend")?.masteredAt).toBe(fixedNow());
    expect(careerStatus(reconciled, "fullstack-engineer")).toBe("unlocked");
  });
});
