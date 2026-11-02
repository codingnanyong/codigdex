import { CHAPTERS, DEX_MONSTERS, findStage, isCommonPathComplete, type ChapterStatus } from "./chapters";
import type { ChapterDefinition, MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import type { BattleState } from "@codigdex/game-core/domain/dex/battle";
import { applyBattleCapture } from "@codigdex/game-core/save/battleCapture";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { careerPathFor, completedCareerPathIds } from "./careerPaths";
import { careerRegionProgression } from "./careerRegionProgression";
import { monstersForCareerRegion } from "./careerRegionMonsters";
import { CAREER_CATALOG, isCareerId, normalizeCareerDexState, reconcileCareerDex, selectCareer, type CareerDexRecord } from "./careerDex";
import { canSelectPrimaryJob, canSelectSecondaryJob, completedSecondaryJobIds, findJob, findSecondaryJob, findTertiaryJob, TERTIARY_JOB_OPTIONS, isSecondaryJobUnlocked, type JobId, type SecondaryJobId, type TertiaryJobId } from "./player/jobs";
import { promotionChapterFor } from "./promotionChapters";
import { OPEN_SOURCE_CHAPTERS } from "./openSourceChapters";
import { masterChapterFor, finalProjectId } from "./masterChapters";
import { workshopTaskId } from "./promotionWorkshops";
import { secondaryRegionsFor, secondaryRegionForStage, type SecondaryRegion } from "./secondaryExploration";
import { evolutionIdentity } from "./secondaryEvolutionIds";
import { openSourceIdentity, openSourceEvolutionId } from "./openSourceEvolutionIds";

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
  save = recoverEvolutionPractice(save);
  save = settleFinalProject(save);
  const captured = captureIds(save);
  const secondary = findSecondaryJob(save.player.secondaryJobId);
  const secondaryJobId = isCommonPathComplete(captured) && secondary && canSelectSecondaryJob(secondary, completedCareerPathIds(captured)) ? secondary.id : null;
  const tertiary = findTertiaryJob(save.player.tertiaryJobId);
  const tertiaryJobId = tertiary && secondaryJobId === tertiary.requires && isFinalProjectComplete(save, tertiary.id) ? tertiary.id : null;
  return { ...save, player: { ...save.player, secondaryJobId, tertiaryJobId } };
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
  return [...common, ...secondaryExplorationCheckpoints(save), ...masterCheckpoints(save), ...(job.id === "junior" ? [] : careerCheckpoints(save, job.id)), ...openSourceCheckpoints(save)];
}

/** Optional expeditions share the common-path gate but never add career MASTER requirements. */
export function openSourceCheckpoints(save: StoredGameStateV3): Checkpoint[] {
  const captured = captureIds(save);
  const open = isCommonPathComplete(captured);
  return OPEN_SOURCE_CHAPTERS.flatMap((chapter) => chapter.stages.map((monster): Checkpoint => {
    const identity = openSourceIdentity(monster.id)!;
    const previous = Array.from({ length: identity.level - 1 }, (_, index) => openSourceEvolutionId(identity.toolId, index + 1));
    return { chapter, monster, status: !open ? "locked" : captured.has(monster.id) ? "cleared" : previous.every((id) => captured.has(id)) ? "available" : "locked" };
  }));
}

export function nextOpenSourceCheckpoint(save: StoredGameStateV3, family: string): Checkpoint | undefined {
  const path = openSourceCheckpoints(save).filter(({ chapter }) => chapter.id === `open-source:${family}`);
  return path.find(({ status }) => status === "available") ?? path.at(-1);
}

/** A released integration chapter opens only for an equipped, earned secondary job. */
export function promotionCheckpoints(save: StoredGameStateV3): Checkpoint[] {
  return secondaryExplorationCheckpoints(save).filter(({ monster }) => evolutionIdentity(monster.id)?.level === 5);
}

export interface SecondaryRegionProgress { region: SecondaryRegion; status: "locked" | "available" | "completed"; captured: number }
export function secondaryRegionProgression(save: StoredGameStateV3): SecondaryRegionProgress[] {
  const job = findSecondaryJob(save.player.secondaryJobId);
  if (!job) return [];
  const captured = captureIds(save);
  const open = isCommonPathComplete(captured) && canSelectSecondaryJob(job, completedCareerPathIds(captured));
  let previousGuardian = true;
  return secondaryRegionsFor(job.id).map((region) => {
    const count = region.chapter.stages.filter(({ id }) => captured.has(id)).length;
    const status = !open || !previousGuardian ? "locked" : count === 5 ? "completed" : "available";
    // Legacy guardians retain their earned access; new players must traverse
    // four earlier forms before they can capture each guardian.
    previousGuardian = previousGuardian && captured.has(region.core.id);
    return { region, status, captured: count };
  });
}

export function secondaryExplorationCheckpoints(save: StoredGameStateV3): Checkpoint[] {
  const captured = captureIds(save);
  return secondaryRegionProgression(save).flatMap(({ region, status }) => {
    let previous = true;
    return region.chapter.stages.map((monster): Checkpoint => {
      const cleared = captured.has(monster.id);
      const stageStatus: ChapterStatus = status === "locked" ? "locked" : cleared ? "cleared" : previous ? "available" : "locked";
      previous = previous && cleared;
      return { chapter: region.chapter, monster, status: stageStatus };
    });
  });
}

export function canEnterBattle(save: StoredGameStateV3, id: string): boolean {
  const promotion = promotionCheckpoints(save).find(({ monster }) => monster.id === id);
  if (promotion && promotion.status !== "cleared" && nextWorkshopPhase(save, id) < 4) return false;
  return playableCheckpoints(save).some(({ monster, status }) => monster.id === id && status !== "locked");
}

/** A region's four independent practice results survive reloads, failure and replay. */
export function nextWorkshopPhase(save: StoredGameStateV3, stageId: string): number {
  const done = new Set((save.progress.projects ?? []).map(({ id }) => id));
  for (let phase = 0; phase < 4; phase++) if (!done.has(workshopTaskId(stageId, phase))) return phase;
  return 4;
}

export function completeWorkshopPractice(save: StoredGameStateV3, stageId: string, phase: number, battle: BattleState, now = () => new Date().toISOString()): StoredGameStateV3 {
  const region = secondaryRegionForStage(stageId);
  const checkpoint = secondaryRegionProgression(save).find(({ region: candidate }) => candidate.id === region?.id);
  if (!checkpoint || checkpoint.status === "locked" || !Number.isInteger(phase) || phase < 0 || phase > 3 ||
    nextWorkshopPhase(save, stageId) !== phase || battle.questions.length !== 5 || battle.status !== "passed") return save;
  return { ...save, progress: { ...save.progress, projects: [...(save.progress.projects ?? []), { id: workshopTaskId(stageId, phase), completedAt: now() }] } };
}

export function isSecondaryStudyComplete(save: StoredGameStateV3, jobId: SecondaryJobId): boolean {
  const chapter = promotionChapterFor(jobId);
  const captured = captureIds(save);
  return !!chapter && chapter.stages.every(({ id }) => nextWorkshopPhase(save, id) === 4) &&
    secondaryRegionsFor(jobId).every(({ chapter }) => chapter.stages.every(({ id }) => captured.has(id)));
}

export function canStartMasterProject(save: StoredGameStateV3, jobId: TertiaryJobId): boolean {
  const job = findTertiaryJob(jobId);
  const captured = captureIds(save);
  return !!job && save.player.secondaryJobId === job.requires && isCommonPathComplete(captured) &&
    canSelectSecondaryJob(findSecondaryJob(job.requires)!, completedCareerPathIds(captured)) &&
    completedSecondaryJobIds(captured).has(job.requires) && (isSecondaryStudyComplete(save, job.requires) ||
      // Preserve a genuinely completed pre-expansion master project; adding
      // exploration must not revoke an already earned tier-three identity.
      (!!masterChapterFor(jobId)?.stages.every(({ id }) => captured.has(id)) &&
        promotionChapterFor(job.requires)!.stages.every(({ id }) => nextWorkshopPhase(save, id) === 4)));
}

export function isFinalProjectComplete(save: StoredGameStateV3, jobId: TertiaryJobId): boolean {
  return canStartMasterProject(save, jobId) &&
    !!save.progress.projects?.some(({ id }) => id === finalProjectId(jobId)) &&
    !!masterChapterFor(jobId)?.stages.every(({ id }) => captureIds(save).has(id));
}

/** Web card registration and native capture use the same project settlement. */
export function settleFinalProject(save: StoredGameStateV3, now = () => new Date().toISOString()): StoredGameStateV3 {
  const job = TERTIARY_JOB_OPTIONS.find(({ requires }) => requires === save.player.secondaryJobId);
  if (!job || !canStartMasterProject(save, job.id) ||
    !masterChapterFor(job.id)!.stages.every(({ id }) => captureIds(save).has(id)) ||
    save.progress.projects?.some(({ id }) => id === finalProjectId(job.id))) return save;
  const stages = new Set(masterChapterFor(job.id)!.stages.map(({ id }) => id));
  const times = save.progress.captures.filter(({ id, capturedAt }) => stages.has(id) && Number.isFinite(Date.parse(capturedAt)))
    .map(({ capturedAt }) => capturedAt).sort((a, b) => Date.parse(a) - Date.parse(b));
  return { ...save, progress: { ...save.progress, projects: [...(save.progress.projects ?? []), { id: finalProjectId(job.id), completedAt: times.at(-1) ?? now() }] } };
}

export function masterCheckpoints(save: StoredGameStateV3): Checkpoint[] {
  const job = TERTIARY_JOB_OPTIONS.find(({ requires }) => requires === save.player.secondaryJobId);
  const chapter = masterChapterFor(job?.id);
  if (!job || !chapter) return [];
  const open = canStartMasterProject(save, job.id);
  const captured = captureIds(save);
  let previous = true;
  return chapter.stages.map((monster) => {
    const cleared = captured.has(monster.id);
    const status: ChapterStatus = !open ? "locked" : cleared ? "cleared" : previous ? "available" : "locked";
    previous = previous && cleared;
    return { chapter, monster, status };
  });
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
  const master = masterCheckpoints(save);
  if (master.some(({ status }) => status !== "locked")) return master.find(({ status }) => status === "available") ?? master.at(-1)!;
  const promotion = secondaryExplorationCheckpoints(save);
  if (promotion.some(({ status }) => status !== "locked")) return promotion.find(({ status }) => status === "available") ?? promotion.at(-1)!;
  const path = playableCheckpoints(save).filter(({ chapter }) => !chapter.id.startsWith("open-source:"));
  return path.find(({ status }) => status === "available") ?? path.at(-1)!;
}

export function resumeCheckpoint(save: StoredGameStateV3): Checkpoint {
  return playableCheckpoints(save).find(({ monster, status }) => monster.id === save.ui.checkpointId && status !== "locked") ?? nextPlayableCheckpoint(save);
}

export function rememberCheckpoint(save: StoredGameStateV3, id: string): StoredGameStateV3 {
  // A learning checkpoint can be resumed before its guardian battle is unlocked.
  if (save.ui.checkpointId === id || !playableCheckpoints(save).some(({ monster, status }) => monster.id === id && status !== "locked")) return save;
  return { ...save, ui: { ...save.ui, checkpointId: id } };
}

/** Derive mastery from released captures instead of trusting uploaded mastery flags. */
export function normalizeGameSave(save: StoredGameStateV3): StoredGameStateV3 {
  save = recoverEvolutionPractice(save);
  save = settleFinalProject(save);
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
  const tertiary = findTertiaryJob(save.player.tertiaryJobId);
  const tertiaryJobId = tertiary && secondaryJobId === tertiary.requires && isFinalProjectComplete(save, tertiary.id) ? tertiary.id : null;
  const completedTertiaryJobs = new Set(TERTIARY_JOB_OPTIONS.filter((job) => isFinalProjectComplete({ ...save, player: { ...save.player, secondaryJobId: job.requires } }, job.id)).map(({ id }) => id));
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
        ? [{ ...entry, id: entry.id, masteredAt: undefined,
          ...(findTertiaryJob(entry.id) && !completedTertiaryJobs.has(entry.id as TertiaryJobId) ? { selectedAt: undefined } : {}) }] : []
    ),
  });
  const times = releasedCaptures.map(({ capturedAt }) => capturedAt).filter((value) => Number.isFinite(Date.parse(value))).sort();
  const careers = reconcileCareerDex(records, {
    commonPathComplete: isCommonPathComplete(captured), completedPrimaryJobs,
    completedSecondaryJobs, completedTertiaryJobs, activePrimaryJob: primaryJobId, activeSecondaryJob: secondaryJobId ?? undefined, activeTertiaryJob: tertiaryJobId ?? undefined,
  }, () => times.at(-1) ?? "1970-01-01T00:00:00.000Z").careers.map((record) => {
    const previous = save.progress.careers.find(({ id }) => id === record.id)?.masteredAt;
    return record.masteredAt && previous && Number.isFinite(Date.parse(previous)) && Date.parse(previous) < Date.parse(record.masteredAt)
      ? { ...record, masteredAt: previous } : record;
  });
  return { ...save, progress: { ...save.progress, captures, careers: [...careers, ...save.progress.careers.filter(({ id }) => !isCareerId(id))] }, player: { ...save.player, primaryJobId, secondaryJobId, tertiaryJobId } };
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
  const selected = { ...save, player: { ...save.player, primaryJobId: jobId, secondaryJobId: hasEarnedSecondaryCareer(save) ? save.player.secondaryJobId : null, tertiaryJobId: normalizePromotionSelection(save).player.tertiaryJobId }, progress: { ...save.progress, careers }, ui: { ...save.ui, checkpointId: undefined } };
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
  const selected = { ...normalized, progress: { ...normalized.progress, careers }, player: { ...normalized.player, secondaryJobId: jobId,
    tertiaryJobId: normalized.player.secondaryJobId === jobId ? normalized.player.tertiaryJobId : null } };
  const path = secondaryExplorationCheckpoints(selected);
  const next = path.find(({ status }) => status === "available") ?? path.at(-1)!;
  return { ...selected, ui: { ...selected.ui, checkpointId: next.monster.id } };
}

export function captureCheckpoint(save: StoredGameStateV3, id: string, battle: BattleState): StoredGameStateV3 {
  if (!canEnterBattle(save, id)) return save;
  let captured = applyBattleCapture(save, id, battle);
  if (captured === save) return save;
  captured = settleEvolutionPractice(captured, id);
  captured = settleFinalProject(captured);
  const next = normalizeGameSave(id.startsWith("open-source:") ? rememberCheckpoint(captured, id) : captured);
  return rememberCheckpoint(next, nextPlayableCheckpoint(next).monster.id);
}

/** The first four evolution battles ARE the regional practice checkpoints. */
export function settleEvolutionPractice(save: StoredGameStateV3, id: string): StoredGameStateV3 {
  const identity = evolutionIdentity(id);
  if (!identity || identity.level === 5 || !captureIds(save).has(id)) return save;
  const key = workshopTaskId(identity.coreId, identity.level - 1);
  if (save.progress.projects?.some(({ id }) => id === key)) return save;
  const completedAt = save.progress.captures.find((record) => record.id === id)!.capturedAt;
  return { ...save, progress: { ...save.progress, projects: [...(save.progress.projects ?? []), { id: key, completedAt }] } };
}

export function recoverEvolutionPractice(save: StoredGameStateV3): StoredGameStateV3 {
  const done = new Set((save.progress.projects ?? []).map(({ id }) => id));
  const added = save.progress.captures.flatMap(({ id, capturedAt }) => {
    const identity = evolutionIdentity(id);
    if (!identity || identity.level === 5) return [];
    const key = workshopTaskId(identity.coreId, identity.level - 1);
    if (done.has(key)) return [];
    done.add(key);
    return [{ id: key, completedAt: Number.isFinite(Date.parse(capturedAt)) ? capturedAt : "1970-01-01T00:00:00.000Z" }];
  });
  return added.length ? { ...save, progress: { ...save.progress, projects: [...(save.progress.projects ?? []), ...added] } } : save;
}

export function selectTertiaryCareer(save: StoredGameStateV3, jobId: TertiaryJobId, now = () => new Date().toISOString()): StoredGameStateV3 {
  if (!isFinalProjectComplete(save, jobId)) return save;
  const previousSelection = save.progress.careers.find(({ id }) => id === jobId)?.selectedAt;
  const selectedAt = previousSelection && Number.isFinite(Date.parse(previousSelection)) ? previousSelection : now();
  const normalized = normalizeGameSave({ ...save, player: { ...save.player, tertiaryJobId: jobId } });
  const careers = normalized.progress.careers.map((record) => record.id === jobId ? { ...record, selectedAt } : record);
  return { ...normalized, progress: { ...normalized.progress, careers }, ui: { ...normalized.ui, checkpointId: masterChapterFor(jobId)!.stages.at(-1)!.id } };
}
