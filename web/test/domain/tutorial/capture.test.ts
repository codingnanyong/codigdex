import { describe, expect, it } from "vitest";
import { TUTORIAL_MASTER_BADGE_ID, TUTORIAL_MONSTER } from "@/lib/domain/tutorial/content";
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

  it("registers a brand-new card and grants rewards", () => {
    const { state, earnedBadge } = applyCapture(EMPTY_DEX_STATE, "bronze", fixedNow);

    expect(state.cards).toHaveLength(1);
    expect(state.cards[0]).toMatchObject({
      id: TUTORIAL_MONSTER.id,
      grade: "bronze",
      capturedAt: fixedNow(),
    });
    expect(state.exp).toBe(TUTORIAL_MONSTER.rewards.exp);
    expect(state.coins).toBe(TUTORIAL_MONSTER.rewards.coins);
    expect(earnedBadge).toBe(false);
  });

  it("awards the tutorial-master badge the first time every card reaches gold", () => {
    const { state, earnedBadge } = applyCapture(EMPTY_DEX_STATE, "gold", fixedNow);

    expect(state.cards[0].grade).toBe("gold");
    expect(state.badges).toContain(TUTORIAL_MASTER_BADGE_ID);
    expect(earnedBadge).toBe(true);
  });

  it("upgrades an existing card when the new grade is better", () => {
    const afterBronze = applyCapture(EMPTY_DEX_STATE, "bronze", fixedNow).state;
    const { state, earnedBadge } = applyCapture(afterBronze, "gold", fixedNow);

    expect(state.cards).toHaveLength(1);
    expect(state.cards[0].grade).toBe("gold");
    expect(earnedBadge).toBe(true);
  });

  it("never downgrades an already-captured card", () => {
    const afterGold = applyCapture(EMPTY_DEX_STATE, "gold", fixedNow).state;
    const { state } = applyCapture(afterGold, "bronze", fixedNow);

    expect(state.cards).toHaveLength(1);
    expect(state.cards[0].grade).toBe("gold");
  });

  it("still grants EXP and coins on a repeat attempt that doesn't improve the grade", () => {
    const afterGold = applyCapture(EMPTY_DEX_STATE, "gold", fixedNow).state;
    const { state } = applyCapture(afterGold, "bronze", fixedNow);

    expect(state.exp).toBe(TUTORIAL_MONSTER.rewards.exp * 2);
    expect(state.coins).toBe(TUTORIAL_MONSTER.rewards.coins * 2);
  });

  it("only awards the tutorial-master badge once", () => {
    const afterFirstGold = applyCapture(EMPTY_DEX_STATE, "gold", fixedNow).state;
    const { earnedBadge, state } = applyCapture(afterFirstGold, "gold", fixedNow);

    expect(state.badges.filter((badge) => badge === TUTORIAL_MASTER_BADGE_ID)).toHaveLength(1);
    expect(earnedBadge).toBe(false);
  });
});
