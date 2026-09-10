import { describe, expect, it } from "vitest";
import { TUTORIAL_MONSTER } from "@/lib/domain/tutorial/content";
import {
  EMPTY_DEX_STATE,
  applyCapture,
  gradeFromScore,
  gradeRank,
} from "@/lib/domain/tutorial/capture";

describe("gradeFromScore", () => {
  it("returns gold when all questions are correct", () => {
    expect(gradeFromScore(2, 2)).toBe("gold");
  });

  it("returns silver when at least one question is correct but not all", () => {
    expect(gradeFromScore(1, 2)).toBe("silver");
  });

  it("returns bronze when nothing is correct", () => {
    expect(gradeFromScore(0, 2)).toBe("bronze");
  });

  it("returns bronze for a degenerate zero-question quiz", () => {
    expect(gradeFromScore(0, 0)).toBe("bronze");
  });
});

describe("gradeRank", () => {
  it("orders gold above silver above bronze", () => {
    expect(gradeRank("gold")).toBeGreaterThan(gradeRank("silver"));
    expect(gradeRank("silver")).toBeGreaterThan(gradeRank("bronze"));
  });
});

describe("applyCapture", () => {
  const fixedNow = () => "2026-01-01T00:00:00.000Z";

  it("registers a brand-new card", () => {
    const state = applyCapture(EMPTY_DEX_STATE, "bronze", fixedNow);

    expect(state.cards).toHaveLength(1);
    expect(state.cards[0]).toMatchObject({
      id: TUTORIAL_MONSTER.id,
      dexNumber: TUTORIAL_MONSTER.dexNumber,
      classification: TUTORIAL_MONSTER.classification,
      trait: TUTORIAL_MONSTER.trait,
      grade: "bronze",
      capturedAt: fixedNow(),
    });
  });

  it("upgrades an existing card when the new grade is better", () => {
    const afterBronze = applyCapture(EMPTY_DEX_STATE, "bronze", fixedNow);
    const state = applyCapture(afterBronze, "gold", fixedNow);

    expect(state.cards).toHaveLength(1);
    expect(state.cards[0].grade).toBe("gold");
  });

  it("never downgrades an already-captured card", () => {
    const afterGold = applyCapture(EMPTY_DEX_STATE, "gold", fixedNow);
    const state = applyCapture(afterGold, "bronze", fixedNow);

    expect(state.cards).toHaveLength(1);
    expect(state.cards[0].grade).toBe("gold");
  });
});
