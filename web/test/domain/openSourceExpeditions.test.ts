import { describe, expect, it } from "vitest";
import { createEmptySave, parseSave } from "@codigdex/game-core/save/schema";
import { createBattleState, submitBattleAnswer } from "@codigdex/game-core/domain/dex/battle";
import { quizCountForLevel } from "@codigdex/game-core/domain/dex/quiz";
import { CHAPTERS, DEX_MONSTERS, findStage } from "@codigdex/game-content/domain/chapters";
import { OPEN_SOURCE_CATALOG } from "@codigdex/game-content/domain/openSourceCatalog";
import { OPEN_SOURCE_EXPEDITIONS } from "@codigdex/game-content/domain/openSourceChapters";
import { canEnterBattle, captureCheckpoint, normalizeGameSave, openSourceCheckpoints, resumeCheckpoint, selectGameCareer } from "@codigdex/game-content/domain/gameProgress";
import { loadMixedQuizPack, validateQuizPack } from "@codigdex/quiz-content";
import { resolveCaptureSuccessFlow } from "@/lib/phaser/capture/resultFlow";

function eligible() {
  const save = createEmptySave("en");
  save.progress.captures = CHAPTERS.flatMap(({ stages }) => stages).map(({ id }) => ({ id, capturedAt: "2026-10-27T00:00:00.000Z" }));
  return normalizeGameSave(save);
}

describe("open-source expedition progression", () => {
  it("leaves an expedition resume point when the player explicitly selects a career", () => {
    const save = eligible();
    save.ui.checkpointId = "open-source:hadoop";
    save.progress.captures.push({ id: "open-source:hadoop", capturedAt: "2026-10-27T01:00:00.000Z" });
    const selected = selectGameCareer(save, "backend");
    expect(selected.player.primaryJobId).toBe("backend");
    expect(resumeCheckpoint(selected).chapter.id.startsWith("career:")).toBe(true);
    expect(selected.progress.captures).toContainEqual(save.progress.captures.at(-1));
  });
  it("adds 38 distinct numbered captures across 9 optional stories", () => {
    const stages = OPEN_SOURCE_EXPEDITIONS.flatMap(({ chapter }) => chapter.stages);
    expect(stages).toHaveLength(38);
    expect(OPEN_SOURCE_EXPEDITIONS).toHaveLength(9);
    expect(new Set(stages.map(({ id }) => id)).size).toBe(38);
    for (const entry of OPEN_SOURCE_CATALOG) {
      const { chapter, monster } = findStage(`open-source:${entry.id}`);
      expect(chapter.id).toBe(`open-source:${entry.family}`);
      expect(monster.assetKey).toBe(entry.character.assetKey);
      expect(DEX_MONSTERS).toContain(monster);
    }
    for (const { intro, ending } of OPEN_SOURCE_EXPEDITIONS) {
      expect(intro.ko).not.toBe(intro.en);
      expect(ending.ko).not.toBe(ending.en);
      expect(intro).not.toEqual(ending);
    }
  });
  it("keeps every mission locked before the common path and rejects forged captures", async () => {
    const save = createEmptySave();
    const monster = OPEN_SOURCE_EXPEDITIONS[0].chapter.stages[0];
    expect(openSourceCheckpoints(save).every(({ status }) => status === "locked")).toBe(true);
    const pack = await loadMixedQuizPack(monster.quizPackId);
    let battle = createBattleState(pack.questions.slice(0, 4));
    while (battle.status === "active") {
      const q = battle.questions[battle.questionIndex];
      if (q.type === "freeText") throw new Error("Expected a choice question");
      battle = submitBattleAnswer(battle, battle.questionIndex, q.answerIndex);
    }
    expect(captureCheckpoint(save, monster.id, battle)).toBe(save);
    const open = openSourceCheckpoints(eligible());
    expect(open.filter(({ status }) => status === "available")).toHaveLength(9);
    expect(open.filter(({ status }) => status === "locked")).toHaveLength(29);
  });
});

describe.each(OPEN_SOURCE_EXPEDITIONS)("$chapter.id expedition", ({ chapter }) => {
  it("loads seven validated bilingual questions per creature", async () => {
    for (const monster of chapter.stages) {
      const pack = await loadMixedQuizPack(monster.quizPackId);
      expect(pack.questions).toHaveLength(7);
      expect(validateQuizPack(pack)).toEqual([]);
      expect(pack.questions.filter(({ explanation }) => explanation?.ko && explanation.en)).toHaveLength(7);
      expect(new Set(pack.questions.map(({ prompt }) => prompt.en)).size).toBe(7);
    }
  });
  it("plays sequentially, preserves careers and restores captures and the next mission", async () => {
    let save = eligible();
    const careers = save.progress.careers;
    const player = save.player;
    for (const [index, monster] of chapter.stages.entries()) {
      expect(canEnterBattle(save, monster.id)).toBe(true);
      const pack = await loadMixedQuizPack(monster.quizPackId);
      let battle = createBattleState(pack.questions.slice(0, quizCountForLevel(monster.level)));
      while (battle.status === "active") {
        const q = battle.questions[battle.questionIndex];
        if (q.type === "freeText") throw new Error("Expected a choice question");
        battle = submitBattleAnswer(battle, battle.questionIndex, q.answerIndex);
      }
      save = captureCheckpoint(save, monster.id, battle);
      expect(captureCheckpoint(save, monster.id, battle)).toBe(save);
      save = normalizeGameSave(parseSave(JSON.stringify(save))!);
      expect(resumeCheckpoint(save).monster.id).toBe(chapter.stages[Math.min(index + 1, chapter.stages.length - 1)].id);
      expect(save.progress.careers).toEqual(careers);
      expect(save.player).toEqual(player);
      expect(save.progress.captures.some(({ id }) => id === monster.id)).toBe(true);
    }
    expect(openSourceCheckpoints(save).filter(({ chapter: current }) => current.id === chapter.id).every(({ status }) => status === "cleared")).toBe(true);
    const fallback = { scene: "world-map" as const };
    expect(resolveCaptureSuccessFlow(chapter.stages.at(-1)!.id, true, fallback).target).toEqual(fallback);
  });
  it("keeps failed battles replayable without advancing progress", async () => {
    const save = eligible();
    const monster = chapter.stages[0];
    const pack = await loadMixedQuizPack(monster.quizPackId);
    let battle = createBattleState(pack.questions.slice(0, 4));
    while (battle.status === "active") {
      const q = battle.questions[battle.questionIndex];
      if (q.type === "freeText") throw new Error("Expected a choice question");
      battle = submitBattleAnswer(battle, battle.questionIndex, (q.answerIndex + 1) % 4);
    }
    expect(captureCheckpoint(save, monster.id, battle)).toBe(save);
    expect(canEnterBattle(save, monster.id)).toBe(true);
    if (chapter.stages.length > 1) expect(canEnterBattle(save, chapter.stages[1].id)).toBe(false);
  });
});
