import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import type { QuizPack, QuizPackDescriptor } from "./types";

export function createQuizPack(
  descriptor: QuizPackDescriptor,
  source: readonly QuizQuestion[]
): QuizPack {
  const questionNumberWidth = Math.max(2, String(source.length).length);
  return {
    descriptor,
    questions: source.map((question, index) => ({
      ...question,
      id: `${descriptor.id}.q${String(index + 1).padStart(questionNumberWidth, "0")}`,
      difficulty: descriptor.difficulty,
      tags: [descriptor.chapterId, descriptor.stageId],
    })),
  };
}
