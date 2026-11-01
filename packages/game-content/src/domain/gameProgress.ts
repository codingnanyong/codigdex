import { CHAPTERS, DEX_MONSTERS, findStage, isCommonPathComplete, type ChapterStatus } from "./chapters";
import type { ChapterDefinition, MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import type { BattleState } from "@codigdex/game-core/domain/dex/battle";
import { applyBattleCapture } from "@codigdex/game-core/save/battleCapture";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { careerPathFor, completedCareerPathIds } from "./careerPaths";
import { careerRegionProgression } from "./careerRegionProgression";
import { monstersForCareerRegion } from "./careerRegionMonsters";
import { CAREER_CATALOG, isCareerId, normalizeCareerDexState, reconcileCareerDex, selectCareer, type CareerDexRecord } from "./careerDex";
import { canSelectPrimaryJob, canSelectSecondaryJob, completedSecondaryJobIds, findJob, findSecondaryJob, isSecondaryJobUnlocked, type JobId, type SecondaryJobId } from "./player/jobs";
import { promotionChapterFor } from "./promotionChapters";
import { OPEN_SOURCE_CHAPTERS } from "./openSourceChapters";
import { stageStatus } from "./chapters";

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

/** Sanitize only new promotion selections; keep legacy primary saves and history intact. */
export function normalizePromotionSelection(save: StoredGameStateV3): StoredGameStateV3 {
  const captured = captureIds(save);
  const secondary = findSecondaryJob(save.player.secondaryJobId);
  const secondaryJobId = isCommonPathComplete(captured) && secondary && canSelectSecondaryJob(secondary, completedCareerPathIds(captured)) ? secondary.id : null;
  return { ...save, player: { ...save.player, secondaryJobId, tertiaryJobId: null } };
}

/** Both clients use the same authored path, region order and replay gates. */
export function careerCheckpoints(save: StoredGameStateV3, jobId: JobId): Checkpoint[] {
  const captured = captureIds(save);
  const pathOpen = canStudyPrimaryCareer(save, jobId) && findJob(save.player.primaryJobId).id === jobId;
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
  return [...common, ...promotionCheckpoints(save), ...(job.id === "junior" ? [] : careerCheckpoints(save, job.id)), ...openSourceCheckpoints(save)];
}

/** Optional expeditions share the common-path gate but never add career MASTER requirements. */
export function openSourceCheckpoints(save: StoredGameStateV3): Checkpoint[] {
  const captured = captureIds(save);
  const open = isCommonPathComplete(captured);
  return OPEN_SOURCE_CHAPTERS.flatMap((chapter) => chapter.stages.map((monster, index) => ({ chapter, monster, status: open ? stageStatus(chapter, index, captured) : "locked" as const })));
}

export function nextOpenSourceCheckpoint(save: StoredGameStateV3, family: string): Checkpoint | undefined {
  const path = openSourceCheckpoints(save).filter(({ chapter }) => chapter.id === `open-source:${family}`);
  return path.find(({ status }) => status === "available") ?? path.at(-1);
}

/** A released integration chapter opens only for an equipped, earned secondary job. */
export function promotionCheckpoints(save: StoredGameStateV3): Checkpoint[] {
  const job = findSecondaryJob(save.player.secondaryJobId);
  const chapter = promotionChapterFor(job?.id);
  if (!job || !chapter) return [];
  const captured = captureIds(save);
  const open = isCommonPathComplete(captured) && canSelectSecondaryJob(job, completedCareerPathIds(captured));
  let precedingComplete = true;
  return chapter.stages.map((monster) => {
    const cleared = captured.has(monster.id);
    const status: ChapterStatus = !open ? "locked" : cleared ? "cleared" : precedingComplete ? "available" : "locked";
    precedingComplete = precedingComplete && cleared;
    return { chapter, monster, status };
  });
}

export function canEnterBattle(save: StoredGameStateV3, id: string): boolean {
  return playableCheckpoints(save).some(({ monster, status }) => monster.id === id && status !== "locked");
}

export function nextPlayableCheckpoint(save: StoredGameStateV3): Checkpoint {
  if (save.ui.checkpointId?.startsWith("open-source:")) {
    const current = openSourceCheckpoints(save).find(({ monster }) => monster.id === save.ui.checkpointId);
    if (current?.status !== "locked" && current) return nextOpenSourceCheckpoint(save, current.chapter.id.slice(12))!;
  }
  const primary = findJob(save.player.primaryJobId);
  if (primary.id !== "junior") {
    const career = careerCheckpoints(save, primary.id);
    if (career.some(({ monster, status }) => monster.id === save.ui.checkpointId && status !== "locked")) {
      return career.find(({ status }) => status === "available") ?? career.at(-1)!;
    }
  }
  const promotion = promotionCheckpoints(save);
  if (promotion.some(({ status }) => status !== "locked")) return promotion.find(({ status }) => status === "available") ?? promotion.at(-1)!;
  const path = playableCheckpoints(save).filter(({ chapter }) => !chapter.id.startsWith("open-source:"));
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
  const completedPrimaryJobs = completedCareerPathIds(captured);
  const secondary = findSecondaryJob(save.player.secondaryJobId);
  const secondaryJobId = isCommonPathComplete(captured) && secondary && canSelectSecondaryJob(secondary, completedPrimaryJobs) ? secondary.id : null;
  const completedSecondaryJobs = new Set([...completedSecondaryJobIds(captured)].filter((id) => isCommonPathComplete(captured) && isSecondaryJobUnlocked(findSecondaryJob(id)!, completedPrimaryJobs)));
  const earnedCareerIds = new Set(CAREER_CATALOG.filter((entry) => {
    if (entry.tier < 2) return true;
    if (!isCommonPathComplete(captured)) return false;
    return entry.tier === 2
      ? entry.requires.every((id) => completedPrimaryJobs.has(id as JobId))
      : entry.requires.every((id) => completedSecondaryJobs.has(id as SecondaryJobId));
  }).map(({ id }) => id));
  const records = normalizeCareerDexState({
    careers: save.progress.careers.flatMap((entry): CareerDexRecord[] =>
      isCareerId(entry.id) && earnedCareerIds.has(entry.id)
        ? [{ ...entry, id: entry.id, masteredAt: undefined }] : []
    ),
  });
  const times = releasedCaptures.map(({ capturedAt }) => capturedAt).filter((value) => Number.isFinite(Date.parse(value))).sort();
  const careers = reconcileCareerDex(records, {
    commonPathComplete: isCommonPathComplete(captured), completedPrimaryJobs,
    completedSecondaryJobs, activePrimaryJob: primaryJobId, activeSecondaryJob: secondaryJobId ?? undefined,
  }, () => times.at(-1) ?? "1970-01-01T00:00:00.000Z").careers.map((record) => {
    const previous = save.progress.careers.find(({ id }) => id === record.id)?.masteredAt;
    return record.masteredAt && previous && Number.isFinite(Date.parse(previous)) && Date.parse(previous) < Date.parse(record.masteredAt)
      ? { ...record, masteredAt: previous } : record;
  });
  return { ...save, progress: { captures, careers: [...careers, ...save.progress.careers.filter(({ id }) => !isCareerId(id))] }, player: { ...save.player, primaryJobId, secondaryJobId, tertiaryJobId: null } };
}

/** Earned secondary identity is independent of the primary path being studied. */
export function hasEarnedSecondaryCareer(save: StoredGameStateV3): boolean {
  const job = findSecondaryJob(save.player.secondaryJobId);
  return Boolean(job && isCommonPathComplete(captureIds(save)) &&
    canSelectSecondaryJob(job, completedCareerPathIds(captureIds(save))));
}

/** An unfinished secondary allows completed primary replays, not a new study path. */
export function canStudyPrimaryCareer(save: StoredGameStateV3, jobId: JobId): boolean {
  const captured = captureIds(save);
  if (!isCommonPathComplete(captured)) return false;
  const completed = completedCareerPathIds(captured);
  if (hasEarnedSecondaryCareer(save) && !completedSecondaryJobIds(captured).has(save.player.secondaryJobId as SecondaryJobId)) {
    return completed.has(jobId);
  }
  const current = findJob(save.player.primaryJobId).id;
  return canSelectPrimaryJob(current, jobId, current !== "junior" && completed.has(current));
}

export function selectGameCareer(save: StoredGameStateV3, jobId: JobId, now = () => new Date().toISOString()): StoredGameStateV3 {
  if (!canStudyPrimaryCareer(save, jobId)) return save;
  const records = save.progress.careers.flatMap((entry): CareerDexRecord[] => isCareerId(entry.id) ? [{ ...entry, id: entry.id }] : []);
  const careers = [...selectCareer({ careers: records }, jobId, now).careers, ...save.progress.careers.filter(({ id }) => !isCareerId(id))];
  const selected = { ...save, player: { ...save.player, primaryJobId: jobId, secondaryJobId: hasEarnedSecondaryCareer(save) ? save.player.secondaryJobId : null, tertiaryJobId: null }, progress: { ...save.progress, careers }, ui: { ...save.ui, checkpointId: undefined } };
  const checkpoints = careerCheckpoints(selected, jobId);
  const next = checkpoints.find(({ status }) => status === "available") ?? checkpoints.at(-1)!;
  return { ...selected, ui: { ...selected.ui, checkpointId: next.monster.id } };
}

export function selectSecondaryCareer(save: StoredGameStateV3, jobId: SecondaryJobId, now = () => new Date().toISOString()): StoredGameStateV3 {
  const job = findSecondaryJob(jobId);
  const chapter = promotionChapterFor(jobId);
  if (!job || !chapter || !isCommonPathComplete(captureIds(save)) || !canSelectSecondaryJob(job, completedCareerPathIds(captureIds(save)))) return save;
  const normalized = normalizeGameSave(save);
  const records = normalized.progress.careers.flatMap((entry): CareerDexRecord[] => isCareerId(entry.id) ? [{ ...entry, id: entry.id }] : []);
  const careers = [...selectCareer({ careers: records }, jobId, now).careers, ...normalized.progress.careers.filter(({ id }) => !isCareerId(id))];
  const selected = { ...normalized, progress: { ...normalized.progress, careers }, player: { ...normalized.player, secondaryJobId: jobId, tertiaryJobId: null } };
  const captured = captureIds(selected);
  const next = chapter.stages.find(({ id }) => !captured.has(id)) ?? chapter.stages.at(-1)!;
  return { ...selected, ui: { ...selected.ui, checkpointId: next.id } };
}

export function captureCheckpoint(save: StoredGameStateV3, id: string, battle: BattleState): StoredGameStateV3 {
  if (id.startsWith("open-source:") && !canEnterBattle(save, id)) return save;
  const captured = applyBattleCapture(save, id, battle);
  if (captured === save) return save;
  const next = normalizeGameSave(id.startsWith("open-source:") ? rememberCheckpoint(captured, id) : captured);
  return rememberCheckpoint(next, nextPlayableCheckpoint(next).monster.id);
}
