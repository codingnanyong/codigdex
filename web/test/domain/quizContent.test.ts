import { describe, expect, it } from "vitest";
import { DEX_MONSTERS } from "@codigdex/game-content/domain/chapters";
import { loadQuizPack } from "@codigdex/quiz-content/loader";
import { QUIZ_PACK_MANIFEST } from "@codigdex/quiz-content/manifest";
import { validateQuizPack } from "@codigdex/quiz-content/validation";

describe("quiz content packages", () => {
  it("registers one versioned pack for every released monster", () => {
    expect(Object.keys(QUIZ_PACK_MANIFEST)).toHaveLength(DEX_MONSTERS.length);
    expect(new Set(DEX_MONSTERS.map((monster) => monster.quizPackId)).size).toBe(DEX_MONSTERS.length);
    DEX_MONSTERS.forEach((monster) => {
      expect(QUIZ_PACK_MANIFEST[monster.quizPackId]?.stageId).toBe(monster.id);
      expect(monster.quizPackId).toMatch(/\.v1$/);
    });
  });

  it("loads and validates every pack", async () => {
    const packs = await Promise.all(Object.keys(QUIZ_PACK_MANIFEST).map(loadQuizPack));
    expect(packs.flatMap(validateQuizPack)).toEqual([]);
    expect(new Set(packs.flatMap((pack) => pack.questions.map((question) => question.id))).size)
      .toBe(packs.reduce((total, pack) => total + pack.questions.length, 0));
  });

  it("keeps ten-question pools for all 100 released primary stages", async () => {
    const descriptors = Object.values(QUIZ_PACK_MANIFEST).filter(({ chapterId }) => chapterId.startsWith("career:"));
    expect(descriptors).toHaveLength(100);
    const packs = await Promise.all(descriptors.map(({ id }) => loadQuizPack(id)));
    expect(packs.every(({ questions }) => questions.length === 10)).toBe(true);
  });

  it("keeps the platform release answer correct after varying its choice position", async () => {
    const descriptor = Object.values(QUIZ_PACK_MANIFEST).find(({ stageId }) => stageId === "platform-release-ferry")!;
    const pack = await loadQuizPack(descriptor.id);
    const item = pack.questions[1];
    if (item.type === "freeText") throw new Error("Release scenario must remain multiple choice");
    expect(item.answerIndex).toBe(1);
    expect(item.choices[item.answerIndex].en).toBe("Promote the same tested immutable artifact");
    expect(new Set(pack.questions.filter((question) => question.type !== "freeText").map(({ answerIndex }) => answerIndex)).size).toBe(4);
  });
});
