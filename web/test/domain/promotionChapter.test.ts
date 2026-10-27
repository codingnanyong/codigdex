import { describe, expect, it } from "vitest";
import { createEmptySave, parseSave } from "@codigdex/game-core/save/schema";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { CAREER_PATHS } from "@codigdex/game-content/domain/careerPaths";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { promotionChapterFor } from "@codigdex/game-content/domain/promotionChapters";
import { canEnterBattle, captureCheckpoint, normalizeGameSave, promotionCheckpoints, resumeCheckpoint, selectSecondaryCareer, selectGameCareer } from "@codigdex/game-content/domain/gameProgress";
import { createBattleState, submitBattleAnswer } from "@codigdex/game-core/domain/dex/battle";
import { quizCountForLevel } from "@codigdex/game-core/domain/dex/quiz";
import { loadMixedQuizPack, validateQuizPack } from "@codigdex/quiz-content";
import { SECONDARY_JOB_OPTIONS, TERTIARY_JOB_OPTIONS, TERTIARY_JOB_SELECTION_ENABLED, type SecondaryJobId } from "@codigdex/game-content/domain/player/jobs";
import { resolveCaptureSuccessFlow } from "@/lib/phaser/capture/resultFlow";

const at = "2026-10-27T00:00:00.000Z";
function eligibleSave(jobId: SecondaryJobId) {
  const save = createEmptySave("en");
  const job = SECONDARY_JOB_OPTIONS.find(({ id }) => id === jobId)!;
  const monsters = [...CHAPTERS.flatMap(({ stages }) => stages), ...job.requires.map((id) => CAREER_PATHS[id]).flatMap(({ regions }) => regions.flatMap(({ id }) => monstersForCareerRegion(id)))];
  save.progress.captures = [...new Set(monsters.map(({ id }) => id))].map((id) => ({ id, capturedAt: at }));
  save.player.primaryJobId = job.requires[0];
  return normalizeGameSave(save);
}

describe.each(SECONDARY_JOB_OPTIONS)("$id promotion mission", (job) => {
  const chapter = promotionChapterFor(job.id)!;
  const eligible = () => eligibleSave(job.id);
  it("requires common-path completion, two earned masters, and an explicit promotion", () => {
    const empty = createEmptySave();
    expect(selectSecondaryCareer(empty, job.id)).toBe(empty);
    expect(canEnterBattle(eligible(), chapter.stages[0].id)).toBe(false);
    const missing = eligible();
    missing.progress.captures = missing.progress.captures.filter(({ id }) => id !== CAREER_PATHS[job.requires[1]].completionCaptureIds.at(-1));
    missing.progress.careers.push({ id: job.requires[1], unlockedAt: at, masteredAt: at });
    expect(selectSecondaryCareer(missing, job.id)).toBe(missing);
    const selected = selectSecondaryCareer(eligible(), job.id, () => at);
    expect(selected.player.secondaryJobId).toBe(job.id);
    expect(promotionCheckpoints(selected).map(({ status }) => status)).toEqual(["available", "locked", "locked", "locked", "locked"]);
    const restored = eligible();
    restored.player.primaryJobId = "junior";
    expect(canEnterBattle(selectSecondaryCareer(restored, job.id), chapter.stages[0].id)).toBe(true);
  });

  it("loads twenty distinct bilingual questions per stage and validates each pack", async () => {
    for (const monster of chapter.stages) {
      const pack = await loadMixedQuizPack(monster.quizPackId);
      expect(pack.questions).toHaveLength(20);
      expect(validateQuizPack(pack)).toEqual([]);
      expect(pack.questions.every(({ prompt }) => prompt.ko !== prompt.en)).toBe(true);
    }
  });

  it("plays all five battles, restores checkpoints, preserves cards and records mastery", async () => {
    let save = selectSecondaryCareer(eligible(), job.id, () => at);
    const initialIds = save.progress.captures.map(({ id }) => id);
    for (const [index, monster] of chapter.stages.entries()) {
      expect(canEnterBattle(save, monster.id)).toBe(true);
      const pack = await loadMixedQuizPack(monster.quizPackId);
      let battle = createBattleState(pack.questions.slice(0, quizCountForLevel(monster.level)));
      while (battle.status === "active") {
        const question = battle.questions[battle.questionIndex];
        if (question.type === "freeText") throw new Error("This scenario uses choice questions");
        battle = submitBattleAnswer(battle, battle.questionIndex, question.answerIndex);
      }
      save = captureCheckpoint(save, monster.id, battle);
      expect(captureCheckpoint(save, monster.id, battle)).toBe(save);
      save = normalizeGameSave(parseSave(JSON.stringify(save))!);
      const next = chapter.stages[Math.min(index + 1, 4)];
      expect(resumeCheckpoint(save).monster.id).toBe(next.id);
    }
    expect(promotionCheckpoints(save).every(({ status }) => status === "cleared")).toBe(true);
    expect(save.progress.careers.find(({ id }) => id === job.id)?.masteredAt).toBeTruthy();
    expect(save.progress.careers.find(({ id }) => id === TERTIARY_JOB_OPTIONS.find(({ requires }) => requires === job.id)!.id)?.unlockedAt).toBeTruthy();
    expect(save.player.tertiaryJobId).toBeNull();
    expect(TERTIARY_JOB_SELECTION_ENABLED).toBe(false);
    expect(save.progress.captures.map(({ id }) => id)).toEqual(expect.arrayContaining(initialIds));
    const primary = selectGameCareer(save, job.requires[0]);
    expect(primary.player.secondaryJobId).toBeNull();
    expect(primary.progress.careers.find(({ id }) => id === job.id)?.masteredAt).toBeTruthy();
  });

  it("does not advance on failure and keeps the mission route after its final capture", () => {
    const save = selectSecondaryCareer(eligible(), job.id);
    const battle = createBattleState([{ prompt: { ko: "선택", en: "Choose" }, choices: [{ ko: "가", en: "A" }, { ko: "나", en: "B" }, { ko: "다", en: "C" }, { ko: "라", en: "D" }], answerIndex: 0 }]);
    const failed = submitBattleAnswer(battle, 0, 1);
    expect(captureCheckpoint(save, chapter.stages[0].id, failed)).toBe(save);
    const fallback = { scene: "promotion-chapter" as const, data: { jobId: job.id } };
    expect(resolveCaptureSuccessFlow(chapter.stages.at(-1)!.id, true, fallback).target).toEqual(fallback);
  });

  it("rejects ineligible careers and forged promotion selections without erasing captures", () => {
    const forged = createEmptySave();
    forged.player.secondaryJobId = job.id;
    forged.player.tertiaryJobId = "cloud-platform-architect";
    forged.progress.captures = chapter.stages.map(({ id }) => ({ id, capturedAt: at }));
    const normalized = normalizeGameSave(forged);
    expect(normalized.player.secondaryJobId).toBeNull();
    expect(normalized.player.tertiaryJobId).toBeNull();
    expect(normalized.progress.captures).toEqual(forged.progress.captures);
    expect(normalized.progress.careers.find(({ id }) => id === job.id)?.masteredAt).toBeUndefined();
    expect(canEnterBattle(normalized, chapter.stages[0].id)).toBe(false);
  });
});

it("keeps each promotion bookmark and captures when switching among all five paths", async () => {
  let save = eligibleSave("platform-engineer");
  const primary = Object.values(CAREER_PATHS).flatMap(({ regions }) => regions.flatMap(({ id }) => monstersForCareerRegion(id)));
  save.progress.captures = [...new Set([...save.progress.captures.map(({ id }) => id), ...primary.map(({ id }) => id)])].map((id) => ({ id, capturedAt: at }));
  for (const job of SECONDARY_JOB_OPTIONS) {
    save = selectSecondaryCareer(save, job.id);
    const monster = promotionChapterFor(job.id)!.stages[0];
    const pack = await loadMixedQuizPack(monster.quizPackId);
    let battle = createBattleState(pack.questions.slice(0, 3));
    while (battle.status === "active") {
      const q = battle.questions[battle.questionIndex];
      if (q.type === "freeText") throw new Error("Expected choices");
      battle = submitBattleAnswer(battle, battle.questionIndex, q.answerIndex);
    }
    save = captureCheckpoint(save, monster.id, battle);
  }
  for (const job of SECONDARY_JOB_OPTIONS) {
    save = normalizeGameSave(parseSave(JSON.stringify(selectSecondaryCareer(save, job.id)))!);
    expect(resumeCheckpoint(save).monster.id).toBe(promotionChapterFor(job.id)!.stages[1].id);
    expect(SECONDARY_JOB_OPTIONS.every(({ id }) => captureIdsForTest(save).has(promotionChapterFor(id)!.stages[0].id))).toBe(true);
    const other = SECONDARY_JOB_OPTIONS.find(({ id }) => id !== job.id)!;
    expect(canEnterBattle(save, promotionChapterFor(other.id)!.stages[0].id)).toBe(false);
  }
});

function captureIdsForTest(save: ReturnType<typeof createEmptySave>) {
  return new Set(save.progress.captures.map(({ id }) => id));
}
