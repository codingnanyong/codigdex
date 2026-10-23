import { loadQuizPack } from "./loader";
import { createQuizPack } from "./pack";
import { validateQuizPack } from "./validation";
import type { QuizPack } from "./types";

const cache = new Map<string, Promise<QuizPack>>();

/** An opt-in, separately identified variant. Existing clients continue to receive the original choice packs. */
export function loadMixedQuizPack(id: string): Promise<QuizPack> {
  const existing = cache.get(id);
  if (existing) return existing;
  const pending = (async () => {
    const base = await loadQuizPack(id);
    const { MIXED_REPLACEMENTS } = await import("./sources/mixed");
    const replacements = MIXED_REPLACEMENTS[base.descriptor.stageId];
    if (!replacements) return base;
    const pack = createQuizPack({ ...base.descriptor, id: base.descriptor.id.replace(/\.v(\d+)$/, ".mixed.v$1") },
      base.questions.map((question, index) => replacements[index] ?? question));
    const issues = validateQuizPack(pack);
    if (issues.length) throw new Error(`Invalid mixed quiz pack: ${issues.join("; ")}`);
    return pack;
  })();
  cache.set(id, pending);
  void pending.catch(() => cache.delete(id));
  return pending;
}
