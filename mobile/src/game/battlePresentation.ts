import type { BattleState } from "@codigdex/game-core/domain/dex/battle";
import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { requiredCorrectAnswers } from "@codigdex/game-core/domain/dex/capture";
import type { Locale } from "@codigdex/game-core/i18n/locale";

/** HP is progress toward capture / remaining mistake allowance, not hint-adjusted attack strength. */
export function battleMeters(battle: BattleState) {
  const total = battle.questions.length;
  const required = requiredCorrectAnswers(total);
  const mistakes = battle.attempts.length - battle.correctCount;
  const lives = total - required + 1;
  return {
    required,
    remainingCorrect: Math.max(0, required - battle.correctCount),
    monsterHealth: required ? Math.max(0, required - battle.correctCount) / required : 0,
    playerHealth: lives ? Math.max(0, lives - mistakes) / lives : 0,
    remainingLives: Math.max(0, lives - mistakes),
    maxLives: lives,
  };
}

export function expectedAnswer(question: QuizQuestion, locale: Locale): string {
  return question.type === "freeText" ? question.acceptedAnswers[0] : question.choices[question.answerIndex][locale];
}

export function quizCopy(value: string): string { return value.replace(/`/g, ""); }

/** Native submit events carry the committed text; ignore composition events when the platform supplies that flag. */
export function keyboardAnswer(event: { nativeEvent: { text: string; isComposing?: boolean } }): string | undefined {
  return event.nativeEvent.isComposing ? undefined : event.nativeEvent.text;
}

export function compactBattle(width: number, height: number, keyboardVisible: boolean): boolean {
  return keyboardVisible || width < 680 || height < 400 || height > width;
}
