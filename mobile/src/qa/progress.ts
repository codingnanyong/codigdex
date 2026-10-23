import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import type { Locale } from "@codigdex/game-core/i18n/locale";
import { createEmptySave, type StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { nextCheckpoint } from "../game/progression";

export type QaProgress = "tutorial" | "git" | "complete";

/** Replaces only the isolated QA save, and is inert in normal/release sessions. */
export function createQaProgress(enabled: boolean, scenario: QaProgress, locale: Locale): StoredGameStateV3 | undefined {
  if (!enabled) return undefined;
  const save = createEmptySave(locale);
  const chapterCount = scenario === "tutorial" ? 1 : scenario === "git" ? 2 : 3;
  const capturedAt = new Date().toISOString();
  save.progress.captures = CHAPTERS.slice(0, chapterCount).flatMap(({ stages }) => stages.map(({ id }) => ({ id, capturedAt })));
  save.ui.checkpointId = nextCheckpoint(new Set(save.progress.captures.map(({ id }) => id))).monster.id;
  return save;
}
