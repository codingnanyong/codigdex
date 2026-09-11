import { describe, expect, it } from "vitest";
import { GIT_CHAPTER } from "@/lib/domain/chapters/git";
import { TUTORIAL_MONSTER } from "@/lib/domain/chapters/tutorial";
import {
  EMPTY_DEX_STATE,
  applyCapture,
  capturedIds,
  isSuccessfulCapture,
} from "@/lib/domain/dex/capture";

describe("isSuccessfulCapture", () => {
  it("succeeds when every question is answered correctly", () => {
    expect(isSuccessfulCapture(2, 2)).toBe(true);
  });

  it("fails when at least one question is wrong", () => {
    expect(isSuccessfulCapture(1, 2)).toBe(false);
  });

  it("fails when nothing is correct", () => {
    expect(isSuccessfulCapture(0, 2)).toBe(false);
  });

  it("fails for a degenerate zero-question quiz", () => {
    expect(isSuccessfulCapture(0, 0)).toBe(false);
  });
});

describe("applyCapture", () => {
  const fixedNow = () => "2026-01-01T00:00:00.000Z";

  it("registers a brand-new card carrying the monster's own copy", () => {
    const state = applyCapture(EMPTY_DEX_STATE, TUTORIAL_MONSTER, fixedNow);

    expect(state.cards).toEqual([
      {
        id: TUTORIAL_MONSTER.id,
        dexNumber: TUTORIAL_MONSTER.dexNumber,
        name: TUTORIAL_MONSTER.name,
        classification: TUTORIAL_MONSTER.classification,
        trait: TUTORIAL_MONSTER.trait,
        description: TUTORIAL_MONSTER.description,
        snippet: TUTORIAL_MONSTER.snippet,
        capturedAt: fixedNow(),
      },
    ]);
  });

  it("returns the very same state for an already-captured monster", () => {
    const firstCapture = applyCapture(EMPTY_DEX_STATE, TUTORIAL_MONSTER, fixedNow);
    const replay = applyCapture(firstCapture, TUTORIAL_MONSTER, () => "2026-01-02T00:00:00.000Z");

    expect(replay).toBe(firstCapture);
    expect(replay.cards[0].capturedAt).toBe(fixedNow());
  });

  it("keeps earlier cards when another monster is captured", () => {
    const state = applyCapture(
      applyCapture(EMPTY_DEX_STATE, TUTORIAL_MONSTER, fixedNow),
      GIT_CHAPTER.stages[0],
      fixedNow
    );

    expect(state.cards.map((card) => card.id)).toEqual([TUTORIAL_MONSTER.id, GIT_CHAPTER.stages[0].id]);
  });
});

describe("capturedIds", () => {
  it("lists the id of every registered card", () => {
    expect(capturedIds(EMPTY_DEX_STATE).size).toBe(0);
    expect(capturedIds(applyCapture(EMPTY_DEX_STATE, GIT_CHAPTER.stages[0]))).toEqual(
      new Set([GIT_CHAPTER.stages[0].id])
    );
  });
});
