import sproutQuiz from "./sprout";
import branchMergeTwinsQuiz from "./branch-merge-twins";
import undoConflictQuiz from "./undo-conflict";
import remoteRebaseQuiz from "./remote-rebase";
import teamWorkflowGuardianQuiz from "./team-workflow-guardian";

export const GIT_STAGE_QUIZZES = {
  sproutQuiz,
  branchMergeTwinsQuiz,
  undoConflictQuiz,
  remoteRebaseQuiz,
  teamWorkflowGuardianQuiz,
} as const;
