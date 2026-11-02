import { describe, expect, it } from "vitest";
import { createEmptySave, parseSave } from "@codigdex/game-core/save/schema";
import { mergeSaves } from "@codigdex/game-core/save/merge";
import { createBattleState, submitBattleAnswer, type BattleState } from "@codigdex/game-core/domain/dex/battle";
import { drawMixedQuizQuestions, quizCountForLevel } from "@codigdex/game-core/domain/dex/quiz";
import { gameQAPresets } from "@codigdex/game-content/domain/qaPresets";
import { promotionChapterFor } from "@codigdex/game-content/domain/promotionChapters";
import { masterChapterFor, finalProjectId } from "@codigdex/game-content/domain/masterChapters";
import { TERTIARY_JOB_OPTIONS, type SecondaryJobId } from "@codigdex/game-content/domain/player/jobs";
import { completeWorkshopPractice, nextWorkshopPhase, captureCheckpoint, normalizeGameSave, normalizePromotionSelection, canEnterBattle, canStartMasterProject, isFinalProjectComplete, masterCheckpoints, selectTertiaryCareer, selectGameCareer, selectSecondaryCareer } from "@codigdex/game-content/domain/gameProgress";
import { loadQuizPack } from "@codigdex/quiz-content/loader";
import { validateQuizPack } from "@codigdex/quiz-content/validation";
import { applySaveToRegistry, snapshotRegistry, resetGameProgress } from "@/lib/phaser/registryAdapter";
import type Phaser from "phaser";

const at = "2026-11-02T00:00:00.000Z";
function secondMaster(job: SecondaryJobId) {
  const save = gameQAPresets("en", at).find(({ id }) => id === `promotion:${job}`)!.save;
  save.progress.captures.push(...promotionChapterFor(job)!.stages.map(({ id }) => ({ id, capturedAt: at })));
  return normalizeGameSave(save);
}
function pass(battle: BattleState): BattleState {
  while (battle.status === "active") {
    const question = battle.questions[battle.questionIndex];
    if (question.type === "freeText") throw new Error("Expected project choice");
    battle = submitBattleAnswer(battle, battle.questionIndex, question.answerIndex);
  }
  return battle;
}

describe.each(TERTIARY_JOB_OPTIONS)("$id final project", (job) => {
  it("requires earned secondary mastery, every practice checkpoint and the matching career", () => {
    const save = secondMaster(job.requires);
    expect(canStartMasterProject(save, job.id)).toBe(true);
    expect(selectTertiaryCareer(save, job.id)).toBe(save);
    const missing = parseSave(JSON.stringify(save))!;
    missing.progress.projects!.pop();
    missing.progress.projects!.push({ id: finalProjectId(job.id), completedAt: at });
    expect(canStartMasterProject(missing, job.id)).toBe(false);
    expect(selectTertiaryCareer(missing, job.id)).toBe(missing);
    expect(masterCheckpoints(missing).every(({ status }) => status === "locked")).toBe(true);
    const forged = { ...save, player: { ...save.player, tertiaryJobId: job.id } };
    expect(normalizeGameSave(forged).player.tertiaryJobId).toBeNull();
    expect(normalizeGameSave(forged).progress.careers.find(({ id }) => id === job.id)?.selectedAt).toBeUndefined();
  });

  it("plays all five design milestones, restores progress and awards tier three explicitly", async () => {
    let save = secondMaster(job.requires);
    const before = save.progress.captures.length;
    const chapter = masterChapterFor(job.id)!;
    expect(masterCheckpoints(save).map(({ status }) => status)).toEqual(["available", "locked", "locked", "locked", "locked"]);
    for (const monster of chapter.stages) {
      expect(canEnterBattle(save, monster.id)).toBe(true);
      const pack = await loadQuizPack(monster.quizPackId);
      expect(validateQuizPack(pack)).toEqual([]);
      for (let seed = 0; seed < 10; seed++) {
        const deck = drawMixedQuizQuestions(pack.questions, quizCountForLevel(monster.level), () => seed / 10);
        expect(deck.filter(({ required }) => required)).toHaveLength(3);
      }
      const battle = pass(createBattleState(drawMixedQuizQuestions(pack.questions, quizCountForLevel(monster.level), () => 0.5)));
      save = captureCheckpoint(save, monster.id, battle);
      expect(captureCheckpoint(save, monster.id, battle)).toBe(save);
      save = normalizeGameSave(parseSave(JSON.stringify(save))!);
    }
    expect(save.progress.captures).toHaveLength(before + 5);
    expect(isFinalProjectComplete(save, job.id)).toBe(true);
    // A Web write interrupted between card registration and project settlement
    // must recover on both adapters, even though every guardian is already captured.
    const interrupted = parseSave(JSON.stringify(save))!;
    interrupted.progress.projects = interrupted.progress.projects!.filter(({ id }) => id !== finalProjectId(job.id));
    const completedAt = "2026-11-02T00:00:05.000Z";
    interrupted.progress.captures = interrupted.progress.captures.map((record) => record.id.startsWith(`mastery:${job.id}:`) ? { ...record, capturedAt: completedAt } : record);
    for (const normalize of [normalizeGameSave, normalizePromotionSelection]) {
      const repaired = normalize(interrupted);
      expect(isFinalProjectComplete(repaired, job.id)).toBe(true);
      expect(repaired.player.tertiaryJobId).toBeNull();
      expect(repaired.progress.projects!.find(({ id }) => id === finalProjectId(job.id))?.completedAt).toBe(completedAt);
      expect(normalize(repaired).progress.projects).toEqual(repaired.progress.projects);
      const missingPractice = parseSave(JSON.stringify(interrupted))!;
      missingPractice.progress.projects!.pop();
      expect(isFinalProjectComplete(normalize(missingPractice), job.id)).toBe(false);
      const missingCapture = parseSave(JSON.stringify(interrupted))!;
      missingCapture.progress.captures.pop();
      expect(isFinalProjectComplete(normalize(missingCapture), job.id)).toBe(false);
    }
    const entries = new Map<string, unknown>();
    const registry = { get: (key: string) => entries.get(key), set: (key: string, value: unknown) => entries.set(key, value) } as unknown as Phaser.Data.DataManager;
    applySaveToRegistry(registry, interrupted);
    expect(isFinalProjectComplete(snapshotRegistry(registry), job.id)).toBe(true);
    expect(save.player.tertiaryJobId).toBeNull();
    const confirmedAt = "2026-11-04T12:00:00.000Z";
    const awarded = selectTertiaryCareer(save, job.id, () => confirmedAt);
    expect(awarded.player.tertiaryJobId).toBe(job.id);
    expect(awarded.progress.careers.find(({ id }) => id === job.id)?.selectedAt).toBe(confirmedAt);
    expect(selectTertiaryCareer(awarded, job.id, () => "2026-11-05T00:00:00.000Z").progress.careers.find(({ id }) => id === job.id)?.selectedAt).toBe(confirmedAt);
    expect(awarded.progress.careers.find(({ id }) => id === job.id)?.masteredAt).toBeTruthy();
    expect(normalizeGameSave(parseSave(JSON.stringify(awarded))!).player.tertiaryJobId).toBe(job.id);
    expect(selectSecondaryCareer(awarded, job.requires).player.tertiaryJobId).toBe(job.id);
    expect(selectGameCareer(awarded, "frontend").player.tertiaryJobId).toBe(job.id);
  });

  it("fails a required design decision even after reaching the normal capture score", async () => {
    const save = secondMaster(job.requires);
    const monster = masterChapterFor(job.id)!.stages[4];
    const pack = await loadQuizPack(monster.quizPackId);
    const ordinary = pack.questions.filter(({ required }) => !required).slice(0, 3);
    const required = pack.questions.filter(({ required }) => required).slice(0, 1);
    let battle: BattleState = createBattleState([...ordinary, ...required]);
    for (let i = 0; i < 3; i++) {
      const q = battle.questions[battle.questionIndex];
      if (q.type === "freeText") throw new Error("Expected choice");
      battle = submitBattleAnswer(battle, battle.questionIndex, q.answerIndex);
    }
    expect(battle.status).toBe("active");
    const q = battle.questions[3];
    if (q.type === "freeText") throw new Error("Expected choice");
    battle = submitBattleAnswer(battle, 3, (q.answerIndex + 1) % 4);
    expect(battle.correctCount).toBe(3);
    expect(battle.status).toBe("failed");
    expect(captureCheckpoint(save, monster.id, battle)).toBe(save);
  });
});

it("persists four practice checkpoints in order without unlocking on failure", async () => {
  let save = gameQAPresets("en", at).find(({ id }) => id === "promotion:platform-engineer")!.save;
  save.progress.projects = [];
  const stage = promotionChapterFor("platform-engineer")!.stages[0];
  const pool = (await loadQuizPack(stage.quizPackId)).questions;
  expect(canEnterBattle(save, stage.id)).toBe(false);
  const passed = pass(createBattleState(pool.slice(0, 5)));
  expect(completeWorkshopPractice(save, stage.id, 1, passed)).toBe(save);
  const failed = { ...passed, status: "failed" as const };
  expect(completeWorkshopPractice(save, stage.id, 0, failed)).toBe(save);
  for (let phase = 0; phase < 4; phase++) {
    save = completeWorkshopPractice(save, stage.id, phase, pass(createBattleState(pool.slice(phase * 5, phase * 5 + 5))), () => at);
    save = parseSave(JSON.stringify(save))!;
    expect(nextWorkshopPhase(save, stage.id)).toBe(phase + 1);
  }
  expect(canEnterBattle(save, stage.id)).toBe(true);
  expect(completeWorkshopPractice(save, stage.id, 3, passed)).toBe(save);
});

it("preserves new, old and unknown project progress through merge and Web registry, and clears it on reset", () => {
  const local = secondMaster("platform-engineer");
  local.progress.projects!.push({ id: "future-project:v9", completedAt: at });
  const remote = parseSave(JSON.stringify(local))!;
  remote.progress.projects!.push({ id: "another-project:v1", completedAt: at });
  const merged = mergeSaves(local, remote).save;
  expect(merged.progress.projects).toHaveLength(local.progress.projects!.length + 1);
  const values = new Map<string, unknown>();
  const registry = { get: (key: string) => values.get(key), set: (key: string, value: unknown) => values.set(key, value) } as unknown as Phaser.Data.DataManager;
  applySaveToRegistry(registry, merged);
  expect(snapshotRegistry(registry).progress.projects).toEqual(merged.progress.projects);
  const legacy = createEmptySave();
  delete legacy.progress.projects;
  expect(parseSave(JSON.stringify(legacy))).toEqual(legacy);
  resetGameProgress(registry);
  expect(snapshotRegistry(registry).progress.projects ?? []).toEqual([]);
});
