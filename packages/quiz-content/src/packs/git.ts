import { GIT_STAGE_QUIZZES } from "../sources/git";
import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";

const SOURCES: Readonly<Record<string, readonly QuizQuestion[]>> = {
  "git-sprout": GIT_STAGE_QUIZZES.sproutQuiz,
  "git-branch-merge-twins": GIT_STAGE_QUIZZES.branchMergeTwinsQuiz,
  "git-undo-conflict": GIT_STAGE_QUIZZES.undoConflictQuiz,
  "git-remote-rebase": GIT_STAGE_QUIZZES.remoteRebaseQuiz,
  "git-team-workflow-guardian": GIT_STAGE_QUIZZES.teamWorkflowGuardianQuiz,
};

export function gitQuizSource(stageId: string): readonly QuizQuestion[] {
  const source = SOURCES[stageId];
  if (!source) throw new Error(`Unknown Git quiz source: ${stageId}`);
  return source;
}
