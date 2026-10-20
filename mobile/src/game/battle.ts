import { drawQuizQuestions, isMultipleChoiceQuestion, quizCountForLevel } from "@codigdex/game-core/domain/dex/quiz";
import { CAPTURE_PASS_PERCENT, isSuccessfulCapture } from "@codigdex/game-core/domain/dex/capture";
import type { MonsterDefinition, QuizQuestion } from "@codigdex/game-core/domain/chapters/types";

export const CAPTURE_PASS_RATE = CAPTURE_PASS_PERCENT / 100;

export function battleQuestions(monster: MonsterDefinition, pool: readonly QuizQuestion[], rng: () => number = Math.random) {
  return drawQuizQuestions(pool.filter(isMultipleChoiceQuestion), quizCountForLevel(monster.level), rng);
}

export function didPassBattle(correct: number, total: number): boolean {
  return isSuccessfulCapture(correct, total);
}

export function battlePercent(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}
