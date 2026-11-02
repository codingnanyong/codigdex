import { MASTER_LESSONS, masterLessonFor } from "@codigdex/game-content/domain/masterChapters";
import { TERTIARY_JOB_OPTIONS } from "@codigdex/game-content/domain/player/jobs";
import { promotionChapterFor } from "@codigdex/game-content/domain/promotionChapters";
import { loadQuizPack } from "../loader";
import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";

/** Three new architecture decisions plus seven relevant foundation cases per milestone. */
export async function masterQuizSource(stageId: string): Promise<readonly QuizQuestion[]> {
  const lesson = masterLessonFor(stageId);
  const job = TERTIARY_JOB_OPTIONS.find(({ id }) => stageId.startsWith(`mastery:${id}:`));
  if (!lesson || !job) throw new Error(`Unknown master milestone: ${stageId}`);
  const index = Number(stageId.split(":").at(-1)) - 1;
  const neighbor = MASTER_LESSONS[job.id][(index + 1) % 5];
  const authored = lesson.questions.map((question, position): QuizQuestion => {
    if (question.type === "freeText") return question;
    const adjacent = neighbor.questions[position];
    if (adjacent.type === "freeText") throw new Error("Expected design choice");
    // Consumer tests can also include contract tests: exclude that second valid action.
    const fourth = job.id === "software-architect" && index === 0 && position === 2
      ? MASTER_LESSONS["software-architect"][3].questions[0] : adjacent;
    if (fourth.type === "freeText") throw new Error("Expected design choice");
    const choices = [...question.choices, fourth.choices[fourth.answerIndex]];
    const offset = (index + position) % 4;
    const rotated = [...choices.slice(offset), ...choices.slice(0, offset)];
    return { ...question, required: true, choices: rotated, answerIndex: (question.answerIndex - offset + 4) % 4 };
  });
  const foundation = await loadQuizPack(promotionChapterFor(job.requires)!.stages[index].quizPackId);
  return [...authored, ...foundation.questions.slice(0, 7)];
}
