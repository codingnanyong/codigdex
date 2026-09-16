import { TUTORIAL_MONSTER } from "@codigdex/game-content/domain/chapters/tutorial";
import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";

export function tutorialQuizSource(stageId: string): readonly QuizQuestion[] {
  if (stageId !== TUTORIAL_MONSTER.id || !TUTORIAL_MONSTER.quizPool) {
    throw new Error(`Unknown tutorial quiz source: ${stageId}`);
  }
  return TUTORIAL_MONSTER.quizPool;
}
