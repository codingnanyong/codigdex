import { buildDexEntries } from "@/lib/phaser/dex/entry";
import { applyCapture } from "@codigdex/game-core/domain/dex/capture";
import { describe, expect, it } from "vitest";
import { findStage } from "@codigdex/game-content/domain/chapters";
import { evolutionStageId } from "@codigdex/game-content/domain/secondaryEvolutionIds";
import { loadMixedQuizPack, validateQuizPack } from "@codigdex/quiz-content";
import { quizCountForLevel } from "@codigdex/game-core/domain/dex/quiz";
import { RELEASE_HARBOR_LESSONS, webBattleQuizPack, webLearningMonster } from "@/lib/learning/releaseHarbor";

describe("Web Release Harbor learning pilot", () => {
  it("has distinct bilingual questions and learning goals at every level", async () => {
    const prompts = { ko: new Set<string>(), en: new Set<string>() };
    const goals = new Set<string>();
    for (let level = 1; level <= 5; level++) {
      const monster = findStage(evolutionStageId("platform-release-ferry", level)).monster;
      const base = await loadMixedQuizPack(monster.quizPackId);
      const snapshot = structuredClone(base);
      const pack = webBattleQuizPack(base);
      expect(validateQuizPack(pack)).toEqual([]);
      expect(pack.descriptor.id).toContain(".web-learning.v1");
      expect(pack.descriptor.stageId).toBe(monster.id);
      expect(pack.questions.length).toBeGreaterThanOrEqual(quizCountForLevel(level));
      expect(base).toEqual(snapshot);
      for (const question of pack.questions) for (const locale of ["ko", "en"] as const) {
        expect(prompts[locale].has(question.prompt[locale])).toBe(false);
        prompts[locale].add(question.prompt[locale]);
        expect(question.explanation?.[locale].length).toBeGreaterThan(10);
      }
      expect(new Set(pack.questions.map(q => q.type === "freeText" ? -1 : q.answerIndex)).size).toBe(4);
      const display = webLearningMonster(monster);
      expect(display.id).toBe(monster.id);
      expect(display.quizPackId).toBe(monster.quizPackId);
      expect(display.assetKey).toBe(monster.assetKey);
      const saved = applyCapture({ cards: [] }, monster).cards;
      const before = structuredClone(saved);
      const entry = buildDexEntries(saved).find(e => e.monster?.id === monster.id)!;
      expect(entry.card?.description).toEqual(display.description);
      expect(entry.card?.snippet).toEqual(display.snippet);
      expect(saved).toEqual(before);
      goals.add(display.briefing.en);
    }
    expect(prompts.ko.size).toBe(43);
    expect(prompts.en.size).toBe(43);
    expect(goals.size).toBe(5);
    expect(new Set(RELEASE_HARBOR_LESSONS.map(l => l.example)).size).toBe(5);
    expect(RELEASE_HARBOR_LESSONS.every(l => l.source.startsWith("https://sre.google/"))).toBe(true);
  });
  it("keeps every other stage on its existing shared pack", async () => {
    const monster = findStage("platform-signal-owl").monster;
    const base = await loadMixedQuizPack(monster.quizPackId);
    expect(webBattleQuizPack(base)).toBe(base);
    expect(webLearningMonster(monster)).toBe(monster);
  });
});
