import { ALL_CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { CAREER_POOL_SIZE, hasCareerQuizSource } from "./sources/career";
import type { QuizDifficulty, QuizPackDescriptor } from "./types";

/** Pools that predate the package split all carry twenty questions. */
const LEGACY_POOL_SIZE = 20;

function questionCountFor(chapterId: string, inlinePoolSize: number | undefined): number {
  if (inlinePoolSize !== undefined) return inlinePoolSize;
  if (chapterId.startsWith("career:")) {
    // Hand-authored career pools are level-specific and smaller than the legacy
    // ones; the generated fallback still produces twenty.
    return hasCareerQuizSource(chapterId.slice("career:".length))
      ? CAREER_POOL_SIZE
      : LEGACY_POOL_SIZE;
  }
  return LEGACY_POOL_SIZE;
}

const descriptors = ALL_CHAPTERS.flatMap((chapter) =>
  chapter.stages.map(
    (monster): QuizPackDescriptor => ({
      id: monster.quizPackId,
      version: 1,
      chapterId: chapter.id,
      stageId: monster.id,
      difficulty: Math.min(5, Math.max(1, monster.level)) as QuizDifficulty,
      // Keeping the count in the lightweight manifest lets menus inspect
      // content without loading a single question.
      questionCount: questionCountFor(chapter.id, monster.quizPool?.length),
    })
  )
);

export const QUIZ_PACK_MANIFEST: Readonly<Record<string, QuizPackDescriptor>> =
  Object.freeze(Object.fromEntries(descriptors.map((descriptor) => [descriptor.id, descriptor])));

export function quizPackDescriptor(id: string): QuizPackDescriptor {
  const descriptor = QUIZ_PACK_MANIFEST[id];
  if (!descriptor) throw new Error(`Unknown quiz pack: ${id}`);
  return descriptor;
}
