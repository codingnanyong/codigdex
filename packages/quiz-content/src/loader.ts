import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { quizPackDescriptor } from "./manifest";
import { createQuizPack } from "./pack";
import type { QuizPack, QuizPackDescriptor } from "./types";

const cache = new Map<string, Promise<QuizPack>>();

async function loadSource(descriptor: QuizPackDescriptor): Promise<readonly QuizQuestion[]> {
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
