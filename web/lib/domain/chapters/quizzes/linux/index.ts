import shellScoutQuiz from "./shell-scout";
import pathFileForagerQuiz from "./path-file-forager";
import permissionGuardQuiz from "./permission-guard";
import pipeProcessEngineerQuiz from "./pipe-process-engineer";
import kernelGuardianQuiz from "./kernel-guardian";

export const LINUX_STAGE_QUIZZES = {
  shellScoutQuiz,
  pathFileForagerQuiz,
  permissionGuardQuiz,
  pipeProcessEngineerQuiz,
  kernelGuardianQuiz,
} as const;
