import { describe, expect, it } from "vitest";
import { CH01_MASTER_BADGE_ID, CH01_MONSTER, TOTAL_CH01_MONSTERS } from "./content";
import { EMPTY_DEX_STATE, applyCapture, gradeFromScore } from "./capture";

function scoreQuiz(answers: number[]): number {
  return answers.reduce(
    (correct, answerIndex, questionIndex) =>
      answerIndex === CH01_MONSTER.quiz[questionIndex].answerIndex ? correct + 1 : correct,
    0
  );
}

describe("CH.01 quest -> quiz -> capture -> dex loop", () => {
  it("grades a perfect run gold, registers the card, and unlocks the chapter badge", () => {
    const correctAnswers = CH01_MONSTER.quiz.map((question) => question.answerIndex);
    const correctCount = scoreQuiz(correctAnswers);
    const grade = gradeFromScore(correctCount, CH01_MONSTER.quiz.length);

    const { state, earnedBadge } = applyCapture(EMPTY_DEX_STATE, grade);

    expect(grade).toBe("gold");
    expect(state.cards).toEqual([
      expect.objectContaining({ id: CH01_MONSTER.id, grade: "gold" }),
    ]);
    expect(earnedBadge).toBe(true);
    expect(state.badges).toContain(CH01_MASTER_BADGE_ID);
    expect(state.cards.length).toBe(TOTAL_CH01_MONSTERS);
  });

  it("lets a player retry a botched attempt and climb from bronze to gold", () => {
    const wrongAnswers = CH01_MONSTER.quiz.map((question) => (question.answerIndex + 1) % question.choices.length);
    const firstGrade = gradeFromScore(scoreQuiz(wrongAnswers), CH01_MONSTER.quiz.length);
    const afterFirstTry = applyCapture(EMPTY_DEX_STATE, firstGrade);

    expect(firstGrade).toBe("bronze");
    expect(afterFirstTry.state.cards[0].grade).toBe("bronze");
    expect(afterFirstTry.earnedBadge).toBe(false);

    const correctAnswers = CH01_MONSTER.quiz.map((question) => question.answerIndex);
    const secondGrade = gradeFromScore(scoreQuiz(correctAnswers), CH01_MONSTER.quiz.length);
    const afterRetry = applyCapture(afterFirstTry.state, secondGrade);

    expect(afterRetry.state.cards).toHaveLength(1);
    expect(afterRetry.state.cards[0].grade).toBe("gold");
    expect(afterRetry.earnedBadge).toBe(true);
    expect(afterRetry.state.exp).toBe(CH01_MONSTER.rewards.exp * 2);
  });
});
