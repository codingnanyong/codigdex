import { LINUX_STAGE_QUIZZES } from "../sources/linux";
import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";

const SOURCES: Readonly<Record<string, readonly QuizQuestion[]>> = {
  "linux-shell-scout": LINUX_STAGE_QUIZZES.shellScoutQuiz,
  "linux-path-file-forager": LINUX_STAGE_QUIZZES.pathFileForagerQuiz,
  "linux-permission-guard": LINUX_STAGE_QUIZZES.permissionGuardQuiz,
  "linux-pipe-process-engineer": LINUX_STAGE_QUIZZES.pipeProcessEngineerQuiz,
  "linux-kernel-guardian": LINUX_STAGE_QUIZZES.kernelGuardianQuiz,
};

export function linuxQuizSource(stageId: string): readonly QuizQuestion[] {
  const source = SOURCES[stageId];
  if (!source) throw new Error(`Unknown Linux quiz source: ${stageId}`);
  return source;
}
