import { describe, expect, it } from "vitest";
import { TUTORIAL_MONSTER, TOTAL_TUTORIAL_MONSTERS } from "@/lib/domain/tutorial/content";
import { EMPTY_DEX_STATE, applyCapture, isSuccessfulCapture } from "@/lib/domain/tutorial/capture";
import { drawQuizQuestions, quizCountForLevel } from "@/lib/domain/tutorial/quiz";

describe("Tutorial quest -> quiz -> capture -> dex loop", () => {
  const battleQuestions = () => drawQuizQuestions(TUTORIAL_MONSTER.quizPool, quizCountForLevel(TUTORIAL_MONSTER.level));

  it("registers the card only after a perfect run", () => {
    const questions = battleQuestions();
    const correctCount = questions.length;
    const succeeded = isSuccessfulCapture(correctCount, questions.length);

    expect(succeeded).toBe(true);
    const state = applyCapture(EMPTY_DEX_STATE);

    expect(state.cards).toEqual([expect.objectContaining({ id: TUTORIAL_MONSTER.id })]);
    expect(state.cards.length).toBe(TOTAL_TUTORIAL_MONSTERS);
  });

  it("flags a botched attempt as unsuccessful, and lets the player retry into a capture", () => {
    const questions = battleQuestions();

    // CaptureQuizScene only calls applyCapture when isSuccessfulCapture is
    // true, so a false result here is what keeps a botched attempt from
    // ever reaching the dex.
    expect(isSuccessfulCapture(questions.length - 1, questions.length)).toBe(false);

    const retry = battleQuestions();
    expect(isSuccessfulCapture(retry.length, retry.length)).toBe(true);

    const state = applyCapture(EMPTY_DEX_STATE);
    expect(state.cards).toHaveLength(1);
    expect(state.cards[0].id).toBe(TUTORIAL_MONSTER.id);
  });
});
