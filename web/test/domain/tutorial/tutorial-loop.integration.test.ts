import { describe, expect, it } from "vitest";
import {
  TUTORIAL_MASTER_BADGE_ID,
  TUTORIAL_MONSTER,
  TOTAL_TUTORIAL_MONSTERS,
} from "@/lib/domain/tutorial/content";
import { EMPTY_DEX_STATE, applyCapture, gradeFromScore } from "@/lib/domain/tutorial/capture";

function scoreQuiz(answers: number[]): number {
  return answers.reduce(
    (correct, answerIndex, questionIndex) =>
      answerIndex === TUTORIAL_MONSTER.quiz[questionIndex].answerIndex ? correct + 1 : correct,
    0
  );
}

describe("Tutorial quest -> quiz -> capture -> dex loop", () => {
  it("grades a perfect run gold, registers the card, and unlocks the tutorial badge", () => {
    const correctAnswers = TUTORIAL_MONSTER.quiz.map((question) => question.answerIndex);
    const correctCount = scoreQuiz(correctAnswers);
    const grade = gradeFromScore(correctCount, TUTORIAL_MONSTER.quiz.length);

    const { state, earnedBadge } = applyCapture(EMPTY_DEX_STATE, grade);

    expect(grade).toBe("gold");
    expect(state.cards).toEqual([
      expect.objectContaining({ id: TUTORIAL_MONSTER.id, grade: "gold" }),
    ]);
    expect(earnedBadge).toBe(true);
    expect(state.badges).toContain(TUTORIAL_MASTER_BADGE_ID);
    expect(state.cards.length).toBe(TOTAL_TUTORIAL_MONSTERS);
  });

  it("lets a player retry a botched attempt and climb from bronze to gold", () => {
    const wrongAnswers = TUTORIAL_MONSTER.quiz.map((question) => (question.answerIndex + 1) % question.choices.length);
    const firstGrade = gradeFromScore(scoreQuiz(wrongAnswers), TUTORIAL_MONSTER.quiz.length);
    const afterFirstTry = applyCapture(EMPTY_DEX_STATE, firstGrade);

    expect(firstGrade).toBe("bronze");
    expect(afterFirstTry.state.cards[0].grade).toBe("bronze");
    expect(afterFirstTry.earnedBadge).toBe(false);

    const correctAnswers = TUTORIAL_MONSTER.quiz.map((question) => question.answerIndex);
    const secondGrade = gradeFromScore(scoreQuiz(correctAnswers), TUTORIAL_MONSTER.quiz.length);
    const afterRetry = applyCapture(afterFirstTry.state, secondGrade);

    expect(afterRetry.state.cards).toHaveLength(1);
    expect(afterRetry.state.cards[0].grade).toBe("gold");
    expect(afterRetry.earnedBadge).toBe(true);
    expect(afterRetry.state.exp).toBe(TUTORIAL_MONSTER.rewards.exp * 2);
  });
});
