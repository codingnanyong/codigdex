import { findStage } from "@codigdex/game-content/domain/chapters";
import { buildCareerMonsterQuiz } from "@codigdex/game-content/quiz-sources/career";
import { hasCareerQuizSource, loadCareerLevelPools } from "../sources/career";
import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";

export async function careerQuizSource(stageId: string): Promise<readonly QuizQuestion[]> {
  const { chapter, monster, index } = findStage(stageId);
  if (!chapter.id.startsWith("career:")) {
    throw new Error(`Not a career quiz source: ${stageId}`);
  }
  const technologyId = chapter.id.slice("career:".length);
  // Technologies without a hand-authored file fall back to the generated pool.
  if (!hasCareerQuizSource(technologyId)) {
    return buildCareerMonsterQuiz(technologyId, index, monster.name.en);
  }
  const pools = await loadCareerLevelPools(technologyId);
  const pool = pools[index];
  if (!pool) throw new Error(`No quiz pool for ${technologyId} stage ${index + 1}`);
  return pool;
}
