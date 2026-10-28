import { findStage, isCommonPathComplete } from "@codigdex/game-content/domain/chapters";
import { normalizeGameSave } from "@codigdex/game-content/domain/gameProgress";
import type { SourceReturnTarget } from "@codigdex/game-content/domain/openSourceEncounters";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";

export interface BattleContext { monster: MonsterDefinition; sourceEventId?: string; victoryId: string }
export interface BattleResult extends BattleContext { correct: number; total: number; passed: boolean; newCapture: boolean; beforeCapture: StoredGameStateV3 }
export type MobileRoute =
  | { name: "title" | "world" | "career" | "dex" | "settings" | "qa" | "encounter" }
  | { name: "battle"; battle: BattleContext }
  | { name: "result"; result: BattleResult }
  | { name: "detail"; monster: MonsterDefinition }
  | { name: "open-source"; ids?: readonly string[]; returnTo: "title" | "career" };

/** Preserve old tool cards while returning legacy expedition bookmarks to the career. */
export function normalizeMobileSave(save: StoredGameStateV3) {
  const normal = save.ui.checkpointId?.startsWith("open-source:")
    ? { ...save, ui: { ...save.ui, checkpointId: undefined } } : save;
  return normalizeGameSave(normal);
}

export function destinationFor(save: StoredGameStateV3, monsterId: string): SourceReturnTarget {
  const chapter = findStage(monsterId).chapter.id;
  if (chapter.startsWith("promotion:")) return { scene: "promotion-chapter", data: { careerId: chapter.slice(10) } };
  if (chapter.startsWith("career:")) return { scene: "career-region", data: { regionId: chapter.slice(7), careerId: save.player.primaryJobId } };
  const captured = new Set(save.progress.captures.map(({ id }) => id));
  return { scene: isCommonPathComplete(captured) && save.player.primaryJobId === "junior" ? "job-select" : "world-map" };
}

export function mobileDestination(target: SourceReturnTarget): { route: "world" | "career"; regionId?: string } {
  return target.scene === "world-map" ? { route: "world" }
    : { route: "career", ...(typeof target.data?.regionId === "string" ? { regionId: target.data.regionId } : {}) };
}
