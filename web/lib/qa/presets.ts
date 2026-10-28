import { createEmptySave, parseSave } from "@codigdex/game-core/save/schema";
import type { Locale } from "@codigdex/game-core/i18n/locale";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { gameQAPresets, type GameQAPreset } from "@codigdex/game-content/domain/qaPresets";
import { SOURCE_CAREERS, sourceCareerName } from "@codigdex/game-content/domain/openSourceEncounters";
import { findOpenSource } from "@codigdex/game-content/domain/openSourceCatalog";
import { resumeCheckpoint } from "@codigdex/game-content/domain/gameProgress";
import { JOB_OPTIONS } from "@codigdex/game-content/domain/player/jobs";

export interface WebQAPreset extends Omit<GameQAPreset, "group"> {
  group: GameQAPreset["group"] | "직무 돌발 의뢰";
}

/** Start in an actual career; its first new victory offers the role's first encounter. */
export function webQAPresets(locale: Locale, now = new Date().toISOString()): WebQAPreset[] {
  const base = gameQAPresets(locale, now);
  const encounters = SOURCE_CAREERS.map((career): WebQAPreset => {
    const promotion = base.find(({ id }) => id === `promotion:${career.id}`);
    const save = promotion ? parseSave(JSON.stringify(promotion.save))! : createEmptySave(locale);
    if (!promotion) {
      save.progress.captures = CHAPTERS.flatMap(({ stages }) => stages).map(({ id }) => ({ id, capturedAt: now }));
      save.ui.tutorialOnboardingSeen = true;
      save.player.primaryJobId = JOB_OPTIONS.find(({ id }) => id === career.id)!.id;
      save.ui.checkpointId = resumeCheckpoint(save).monster.id;
    }
    return { id: `encounter:${career.id}`, group: "직무 돌발 의뢰", title: `${sourceCareerName(career.id).ko} · ${findOpenSource(career.firstTool)!.name}`, description: "직무의 첫 전투를 완료하고 결과를 확인하면 돌발 의뢰가 등장합니다. 참여·나중에·저장 복원을 확인하세요.", save };
  });
  return [base.find(({ id }) => id === "fresh")!, ...encounters, ...base.filter(({ group }) => group === "2차 전직"), base.find(({ id }) => id === "dex")!];
}
