import { CHAPTERS, type ChapterStatus } from "@codigdex/game-content/domain/chapters";
import type { ChapterDefinition, MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";

export interface Checkpoint {
  chapter: ChapterDefinition;
  monster: MonsterDefinition;
  status: ChapterStatus;
}

/** Only the common path is playable in this mobile release. Never infer access from a route alone. */
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
