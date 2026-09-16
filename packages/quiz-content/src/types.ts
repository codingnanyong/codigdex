import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import type { ChapterId } from "@codigdex/game-core/domain/chapters/types";

export type QuizDifficulty = 1 | 2 | 3 | 4 | 5;

export interface QuizPackDescriptor {
  id: string;
  version: number;
  chapterId: ChapterId;
  stageId: string;
  difficulty: QuizDifficulty;
  questionCount: number;
}

export interface PackagedQuizQuestion extends QuizQuestion {
  /** Stable within a versioned pack. */
  id: string;
  difficulty: QuizDifficulty;
  tags: readonly string[];
}

export interface QuizPack {
  descriptor: QuizPackDescriptor;
  questions: readonly PackagedQuizQuestion[];
}
