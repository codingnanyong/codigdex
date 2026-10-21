import { CHAPTERS, type ChapterStatus } from "@codigdex/game-content/domain/chapters";
import type { ChapterDefinition, MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import type { BattleState } from "@codigdex/game-core/domain/dex/battle";
import { applyBattleCapture } from "@codigdex/game-core/save/battleCapture";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";

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

/** Old/malformed bookmarks cannot skip prerequisites; old saves resume from their captures. */
export function resumeCheckpoint(save: StoredGameStateV3): Checkpoint {
  const captured = new Set(save.progress.captures.map(({ id }) => id));
  const id = save.ui.checkpointId;
  return id && canEnterCheckpoint(captured, id) ? selectedCheckpoint(captured, id) : nextCheckpoint(captured);
}

export function rememberCheckpoint(save: StoredGameStateV3, id: string): StoredGameStateV3 {
  if (save.ui.checkpointId === id || !canEnterCheckpoint(new Set(save.progress.captures.map((capture) => capture.id)), id)) return save;
  return { ...save, ui: { ...save.ui, checkpointId: id } };
}

/** Capture and the next resume point share one atomic, ordered save snapshot. */
export function captureCheckpoint(save: StoredGameStateV3, id: string, battle: BattleState): StoredGameStateV3 {
  const captured = applyBattleCapture(save, id, battle);
  if (captured === save) return save;
  const next = nextCheckpoint(new Set(captured.progress.captures.map((capture) => capture.id)));
  return rememberCheckpoint(captured, next.monster.id);
}
