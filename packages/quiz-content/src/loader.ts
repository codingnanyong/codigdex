import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { quizPackDescriptor } from "./manifest";
import { createQuizPack } from "./pack";
import type { QuizPack, QuizPackDescriptor } from "./types";
import { evolutionIdentity } from "@codigdex/game-content/domain/secondaryEvolutionIds";

const cache = new Map<string, Promise<QuizPack>>();

async function loadSource(descriptor: QuizPackDescriptor): Promise<readonly QuizQuestion[]> {
  if (descriptor.chapterId.startsWith("mastery:")) {
    const { masterQuizSource } = await import("./sources/master");
    return masterQuizSource(descriptor.stageId);
  }
  if (descriptor.chapterId.startsWith("open-source:")) {
    return (await import("./sources/openSource")).openSourceQuizSource(descriptor.stageId);
  }
  const identity = evolutionIdentity(descriptor.stageId);
  if (identity) {
    const { jobId, regionIndex, level } = identity;
    const pools = jobId === "platform-engineer" ? (await import("./sources/platform")).PLATFORM_QUIZZES
      : jobId === "fullstack-engineer" ? (await import("./sources/fullstack")).FULLSTACK_QUIZZES
      : jobId === "ml-developer" ? (await import("./sources/ml")).ML_QUIZZES
      : jobId === "mlops-engineer" ? (await import("./sources/mlops")).MLOPS_QUIZZES
      : (await import("./sources/analytics")).ANALYTICS_QUIZZES;
    const pool = pools[regionIndex];
    return level === 5 ? pool : pool.slice(0, [8, 10, 12, 16][level - 1]);
  }
  if (descriptor.chapterId === "tutorial") {
    const { tutorialQuizSource } = await import("./packs/tutorial");
    return tutorialQuizSource(descriptor.stageId);
  }
  if (descriptor.chapterId === "git") {
    const { gitQuizSource } = await import("./packs/git");
    return gitQuizSource(descriptor.stageId);
  }
  if (descriptor.chapterId === "linux") {
    const { linuxQuizSource } = await import("./packs/linux");
    return linuxQuizSource(descriptor.stageId);
  }
  if (descriptor.chapterId.startsWith("career:")) {
    const { careerQuizSource } = await import("./packs/career");
    return careerQuizSource(descriptor.stageId);
  }
  throw new Error(`No quiz-pack loader for chapter: ${descriptor.chapterId}`);
}

export function loadQuizPack(id: string): Promise<QuizPack> {
  const existing = cache.get(id);
  if (existing) return existing;
  const pending = (async () => {
    const descriptor = quizPackDescriptor(id);
    return createQuizPack(descriptor, await loadSource(descriptor));
  })();
  cache.set(id, pending);
  pending.catch(() => cache.delete(id));
  return pending;
}
