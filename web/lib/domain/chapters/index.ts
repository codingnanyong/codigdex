import { GIT_CHAPTER } from "./git";
import { LINUX_CHAPTER } from "./linux";
import { TUTORIAL_CHAPTER } from "./tutorial";
import type { ChapterDefinition, ChapterId, MonsterDefinition } from "./types";

export type ChapterStatus = "locked" | "available" | "cleared";

export type Unlock =
  | { kind: "stage"; chapter: ChapterDefinition; monster: MonsterDefinition }
  | { kind: "chapter"; chapter: ChapterDefinition }
  | { kind: "common-path-complete" };

/** Play order. Each chapter's `requires` points at the one before it. */
export const CHAPTERS: readonly ChapterDefinition[] = [TUTORIAL_CHAPTER, GIT_CHAPTER, LINUX_CHAPTER];

/** The junior common path a player clears before choosing a job. */
const COMMON_PATH: readonly ChapterId[] = ["git", "linux"];

/** Every dex entry, in dex-number order. */
export const DEX_MONSTERS: readonly MonsterDefinition[] = CHAPTERS.flatMap(
  (chapter) => chapter.stages
).sort((a, b) => a.dexNumber.localeCompare(b.dexNumber));

export function getChapter(id: ChapterId): ChapterDefinition {
  const chapter = CHAPTERS.find((candidate) => candidate.id === id);
  if (!chapter) throw new Error(`Unknown chapter: ${id}`);
  return chapter;
}

export function findStage(monsterId: string): {
  chapter: ChapterDefinition;
  monster: MonsterDefinition;
  index: number;
} {
  for (const chapter of CHAPTERS) {
    const index = chapter.stages.findIndex((stage) => stage.id === monsterId);
    if (index !== -1) return { chapter, monster: chapter.stages[index], index };
  }
  throw new Error(`Unknown monster: ${monsterId}`);
}

export function chapterTitle(chapter: ChapterDefinition): string {
  return `${chapter.name} · ${chapter.place}`;
}

export function isChapterComplete(chapter: ChapterDefinition, capturedIds: ReadonlySet<string>): boolean {
  return chapter.stages.every((stage) => capturedIds.has(stage.id));
}

/** A stage opens once the one before it is captured; a chapter's first stage, once its prerequisite chapter is complete. */
export function stageStatus(
  chapter: ChapterDefinition,
  index: number,
  capturedIds: ReadonlySet<string>
): ChapterStatus {
  if (capturedIds.has(chapter.stages[index].id)) return "cleared";
  const unlocked =
    index === 0
      ? !chapter.requires || isChapterComplete(getChapter(chapter.requires), capturedIds)
      : capturedIds.has(chapter.stages[index - 1].id);
  return unlocked ? "available" : "locked";
}

export function chapterStatus(chapter: ChapterDefinition, capturedIds: ReadonlySet<string>): ChapterStatus {
  if (isChapterComplete(chapter, capturedIds)) return "cleared";
  return stageStatus(chapter, 0, capturedIds) === "locked" ? "locked" : "available";
}

/** The first stage not yet captured — or the last one, for replay, once all are. */
export function currentStageIndex(chapter: ChapterDefinition, capturedIds: ReadonlySet<string>): number {
  const next = chapter.stages.findIndex((stage) => !capturedIds.has(stage.id));
  return next === -1 ? chapter.stages.length - 1 : next;
}

/** What capturing `monsterId` for the first time opens up. */
export function unlockAfter(monsterId: string): Unlock {
  const { chapter, index } = findStage(monsterId);
  const nextStage = chapter.stages[index + 1];
  if (nextStage) return { kind: "stage", chapter, monster: nextStage };

  const nextChapter = CHAPTERS[CHAPTERS.indexOf(chapter) + 1];
  return nextChapter ? { kind: "chapter", chapter: nextChapter } : { kind: "common-path-complete" };
}

export function isCommonPathComplete(capturedIds: ReadonlySet<string>): boolean {
  return COMMON_PATH.every((id) => isChapterComplete(getChapter(id), capturedIds));
}
