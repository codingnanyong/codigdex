import { describe, expect, it } from "vitest";
import { createEmptySave, parseSave } from "@codigdex/game-core/save/schema";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { CAREER_PATHS } from "@codigdex/game-content/domain/careerPaths";
import { SECONDARY_JOB_OPTIONS, completedSecondaryJobIds } from "@codigdex/game-content/domain/player/jobs";
import { promotionChapterFor } from "@codigdex/game-content/domain/promotionChapters";
import { gameQAPresets } from "@codigdex/game-content/domain/qaPresets";
import { canStudyPrimaryCareer, canSelectSecondaryCareer, captureIds, hasUnfinishedSecondaryCareer, isSecondaryStudyComplete, normalizeGameSave, selectGameCareer, selectSecondaryCareer } from "@codigdex/game-content/domain/gameProgress";
const at = "2026-11-02T00:00:00.000Z";

describe.each(SECONDARY_JOB_OPTIONS)("$id career commitment", (job) => {
  it("does not mistake five guardians or historical MASTER flags for all regional study", () => {
    const seed = createEmptySave();
    seed.player.primaryJobId = job.requires[0];
    seed.progress.captures = [...new Set([...CHAPTERS.flatMap(c => c.stages.map(s => s.id)), ...Object.values(CAREER_PATHS).flatMap(p => p.completionCaptureIds)])].map(id => ({ id, capturedAt: at }));
    let save = selectSecondaryCareer(seed, job.id);
    save.progress.captures.push(...promotionChapterFor(job.id)!.stages.map(({ id }) => ({ id, capturedAt: at })));
    save.progress.careers.push({ id: job.id, unlockedAt: at, masteredAt: at });
    save = normalizeGameSave(parseSave(JSON.stringify(save))!);
    expect(completedSecondaryJobIds(captureIds(save)).has(job.id)).toBe(true);
    expect(isSecondaryStudyComplete(save, job.id)).toBe(false);
    expect(hasUnfinishedSecondaryCareer(save)).toBe(true);
    for (const target of SECONDARY_JOB_OPTIONS.filter(other => other.id !== job.id)) {
      expect(canSelectSecondaryCareer(save, target.id)).toBe(false);
      expect(selectSecondaryCareer(save, target.id)).toBe(save);
    }
    const unfinished = Object.keys(CAREER_PATHS).find(id => !job.requires.includes(id as typeof job.requires[number])) as keyof typeof CAREER_PATHS;
    save.progress.captures = save.progress.captures.filter(({ id }) => id !== CAREER_PATHS[unfinished].completionCaptureIds.at(-1));
    expect(canStudyPrimaryCareer(save, unfinished)).toBe(false);
    expect(selectGameCareer(save, unfinished)).toBe(save);
    expect(canStudyPrimaryCareer(save, job.requires[0])).toBe(true);
    expect(selectGameCareer(save, job.requires[0]).player.secondaryJobId).toBe(job.id);
  });

  it("unlocks another career only after the current regional study is really complete", () => {
    let save = gameQAPresets("en", at).find(({ id }) => id === `promotion:${job.id}`)!.save;
    save.progress.captures.push(...promotionChapterFor(job.id)!.stages.map(({ id }) => ({ id, capturedAt: at })));
    save = normalizeGameSave(save);
    expect(isSecondaryStudyComplete(save, job.id)).toBe(true);
    expect(hasUnfinishedSecondaryCareer(save)).toBe(false);
    const target = Object.keys(CAREER_PATHS).find(id => !job.requires.includes(id as typeof job.requires[number])) as keyof typeof CAREER_PATHS;
    expect(canStudyPrimaryCareer(save, target)).toBe(true);
  });
});
