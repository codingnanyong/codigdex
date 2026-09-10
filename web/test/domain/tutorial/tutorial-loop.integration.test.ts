import { describe, expect, it } from "vitest";
import { TUTORIAL_MONSTER, TOTAL_TUTORIAL_MONSTERS } from "@/lib/domain/tutorial/content";
import { EMPTY_DEX_STATE, applyCapture, isSuccessfulCapture } from "@/lib/domain/tutorial/capture";

function scoreQuiz(answers: number[]): number {
  return answers.reduce(
    (correct, answerIndex, questionIndex) =>
      answerIndex === TUTORIAL_MONSTER.quiz[questionIndex].answerIndex ? correct + 1 : correct,
    0
  );
}

describe("Tutorial quest -> quiz -> capture -> dex loop", () => {
  it("registers the card only after a perfect run", () => {
    const correctAnswers = TUTORIAL_MONSTER.quiz.map((question) => question.answerIndex);
    const correctCount = scoreQuiz(correctAnswers);
    const succeeded = isSuccessfulCapture(correctCount, TUTORIAL_MONSTER.quiz.length);

    expect(succeeded).toBe(true);
    const state = applyCapture(EMPTY_DEX_STATE);

    expect(state.cards).toEqual([expect.objectContaining({ id: TUTORIAL_MONSTER.id })]);
    expect(state.cards.length).toBe(TOTAL_TUTORIAL_MONSTERS);
  });

  it("does not register anything for a botched attempt, and lets the player retry into a capture", () => {
    const wrongAnswers = TUTORIAL_MONSTER.quiz.map((question) => (question.answerIndex + 1) % question.choices.length);
    const firstSucceeded = isSuccessfulCapture(scoreQuiz(wrongAnswers), TUTORIAL_MONSTER.quiz.length);

    expect(firstSucceeded).toBe(false);
    // A failed attempt never calls applyCapture, so the dex stays empty.
    expect(EMPTY_DEX_STATE.cards).toHaveLength(0);

    const correctAnswers = TUTORIAL_MONSTER.quiz.map((question) => question.answerIndex);
    const secondSucceeded = isSuccessfulCapture(scoreQuiz(correctAnswers), TUTORIAL_MONSTER.quiz.length);
    expect(secondSucceeded).toBe(true);

    const state = applyCapture(EMPTY_DEX_STATE);
    expect(state.cards).toHaveLength(1);
    expect(state.cards[0].id).toBe(TUTORIAL_MONSTER.id);
  });
});
