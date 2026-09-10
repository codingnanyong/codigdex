import { describe, expect, it } from "vitest";
import { TUTORIAL_MONSTER } from "@/lib/domain/tutorial/content";
import { EMPTY_DEX_STATE, applyCapture, isSuccessfulCapture } from "@/lib/domain/tutorial/capture";

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

  it("registers a brand-new card", () => {
    const state = applyCapture(EMPTY_DEX_STATE, fixedNow);

    expect(state.cards).toHaveLength(1);
    expect(state.cards[0]).toMatchObject({
      id: TUTORIAL_MONSTER.id,
      dexNumber: TUTORIAL_MONSTER.dexNumber,
      classification: TUTORIAL_MONSTER.classification,
      trait: TUTORIAL_MONSTER.trait,
      capturedAt: fixedNow(),
    });
  });

  it("is idempotent for an already-captured monster", () => {
    const firstCapture = applyCapture(EMPTY_DEX_STATE, fixedNow);
    const state = applyCapture(firstCapture, () => "2026-01-02T00:00:00.000Z");

    expect(state.cards).toHaveLength(1);
    expect(state.cards[0].capturedAt).toBe(fixedNow());
  });
});
