import { CHAPTERS, DEX_MONSTERS, findStage, isCommonPathComplete, type ChapterStatus } from "./chapters";
import type { ChapterDefinition, MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import type { BattleState } from "@codigdex/game-core/domain/dex/battle";
import { applyBattleCapture } from "@codigdex/game-core/save/battleCapture";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { careerPathFor, completedCareerPathIds } from "./careerPaths";
import { careerRegionProgression } from "./careerRegionProgression";
import { monstersForCareerRegion } from "./careerRegionMonsters";
import { isCareerId, normalizeCareerDexState, reconcileCareerDex, selectCareer, type CareerDexRecord } from "./careerDex";
import { canSelectPrimaryJob, completedSecondaryJobIds, findJob, SECONDARY_JOB_SELECTION_ENABLED, type JobId } from "./player/jobs";

export interface Checkpoint { chapter: ChapterDefinition; monster: MonsterDefinition; status: ChapterStatus }

export function checkpoints(captured: ReadonlySet<string>): Checkpoint[] {
  let precedingComplete = true;
  return CHAPTERS.flatMap((chapter) => chapter.stages.map((monster) => {
    const cleared = captured.has(monster.id);
    const status: ChapterStatus = cleared ? "cleared" : precedingComplete ? "available" : "locked";
    precedingComplete = precedingComplete && cleared;
    return { chapter, monster, status };
  }));
}

export function nextCheckpoint(captured: ReadonlySet<string>): Checkpoint {
  const path = checkpoints(captured);
  return path.find(({ status }) => status === "available") ?? path.at(-1)!;
}

export function selectedCheckpoint(captured: ReadonlySet<string>, id?: string): Checkpoint {
  return checkpoints(captured).find(({ monster }) => monster.id === id) ?? nextCheckpoint(captured);
}

export function canEnterCheckpoint(captured: ReadonlySet<string>, id: string): boolean {
  return checkpoints(captured).some(({ monster, status }) => monster.id === id && status !== "locked");
}

export function captureIds(save: StoredGameStateV3): Set<string> {
  return new Set(save.progress.captures.map(({ id }) => id));
}

/** Both clients use the same authored path, region order and replay gates. */
export function careerCheckpoints(save: StoredGameStateV3, jobId: JobId): Checkpoint[] {
  const captured = captureIds(save);
  const pathOpen = isCommonPathComplete(captured) && findJob(save.player.primaryJobId).id === jobId;
  return careerRegionProgression(careerPathFor(jobId), captured).flatMap(({ region, status: regionStatus }) => {
    let precedingComplete = true;
    return monstersForCareerRegion(region.id).map((monster): Checkpoint => {
      const cleared = captured.has(monster.id);
      const available = pathOpen && regionStatus !== "locked" && precedingComplete;
      precedingComplete = precedingComplete && cleared;
      return { chapter: findStage(monster.id).chapter, monster, status: cleared && pathOpen ? "cleared" : available ? "available" : "locked" };
    });
  });
}

export function playableCheckpoints(save: StoredGameStateV3): Checkpoint[] {
  const common = checkpoints(captureIds(save));
  const job = findJob(save.player.primaryJobId);
  return job.id === "junior" ? common : [...common, ...careerCheckpoints(save, job.id)];
}

export function canEnterBattle(save: StoredGameStateV3, id: string): boolean {
  return playableCheckpoints(save).some(({ monster, status }) => monster.id === id && status !== "locked");
}

export function nextPlayableCheckpoint(save: StoredGameStateV3): Checkpoint {
  const path = playableCheckpoints(save);
  return path.find(({ status }) => status === "available") ?? path.at(-1)!;
}

export function resumeCheckpoint(save: StoredGameStateV3): Checkpoint {
  return playableCheckpoints(save).find(({ monster, status }) => monster.id === save.ui.checkpointId && status !== "locked") ?? nextPlayableCheckpoint(save);
}

export function rememberCheckpoint(save: StoredGameStateV3, id: string): StoredGameStateV3 {
  if (save.ui.checkpointId === id || !canEnterBattle(save, id)) return save;
  return { ...save, ui: { ...save.ui, checkpointId: id } };
}

/** Derive mastery from released captures instead of trusting uploaded mastery flags. */
export function normalizeGameSave(save: StoredGameStateV3): StoredGameStateV3 {
  const monsters = new Set(DEX_MONSTERS.map(({ id }) => id));
  // Content versions may differ between clients. Preserve unknown records in
  // storage, but only released content may contribute to current progression.
  const captures = save.progress.captures;
  const releasedCaptures = captures.filter(({ id }) => monsters.has(id));
  const captured = new Set(releasedCaptures.map(({ id }) => id));
  const primaryJobId = isCommonPathComplete(captured) ? findJob(save.player.primaryJobId).id : "junior";
  const records = normalizeCareerDexState({ careers: save.progress.careers.flatMap((entry): CareerDexRecord[] => isCareerId(entry.id) ? [{ ...entry, id: entry.id, masteredAt: undefined }] : []) });
  const times = releasedCaptures.map(({ capturedAt }) => capturedAt).filter((value) => Number.isFinite(Date.parse(value))).sort();
  const careers = reconcileCareerDex(records, {
    commonPathComplete: isCommonPathComplete(captured), completedPrimaryJobs: completedCareerPathIds(captured),
    completedSecondaryJobs: completedSecondaryJobIds(captured), activePrimaryJob: primaryJobId,
  }, () => times.at(-1) ?? "1970-01-01T00:00:00.000Z").careers.map((record) => {
    const previous = save.progress.careers.find(({ id }) => id === record.id)?.masteredAt;
    return record.masteredAt && previous && Number.isFinite(Date.parse(previous)) && Date.parse(previous) < Date.parse(record.masteredAt)
      ? { ...record, masteredAt: previous } : record;
  });
  return { ...save, progress: { captures, careers: [...careers, ...save.progress.careers.filter(({ id }) => !isCareerId(id))] }, player: { ...save.player, primaryJobId, ...(!SECONDARY_JOB_SELECTION_ENABLED ? { secondaryJobId: null, tertiaryJobId: null } : {}) } };
}

export function selectGameCareer(save: StoredGameStateV3, jobId: JobId, now = () => new Date().toISOString()): StoredGameStateV3 {
  const captured = captureIds(save);
  const current = findJob(save.player.primaryJobId).id;
  if (!isCommonPathComplete(captured) || !canSelectPrimaryJob(current, jobId, current !== "junior" && completedCareerPathIds(captured).has(current))) return save;
  const records = save.progress.careers.flatMap((entry): CareerDexRecord[] => isCareerId(entry.id) ? [{ ...entry, id: entry.id }] : []);
  const careers = [...selectCareer({ careers: records }, jobId, now).careers, ...save.progress.careers.filter(({ id }) => !isCareerId(id))];
  const selected = { ...save, player: { ...save.player, primaryJobId: jobId }, progress: { ...save.progress, careers } };
  return { ...selected, ui: { ...selected.ui, checkpointId: nextPlayableCheckpoint(selected).monster.id } };
}

export function captureCheckpoint(save: StoredGameStateV3, id: string, battle: BattleState): StoredGameStateV3 {
  const captured = applyBattleCapture(save, id, battle);
  if (captured === save) return save;
  const next = normalizeGameSave(captured);
  return rememberCheckpoint(next, nextPlayableCheckpoint(next).monster.id);
}
