import { createEmptySave, parseSave } from "@codigdex/game-core/save/schema";
import type { Locale } from "@codigdex/game-core/i18n/locale";
import { CHAPTERS } from "./chapters";
import { gameQAPresets, type GameQAPreset } from "./qaPresets";
import { SOURCE_CAREERS, sourceCareerName } from "./openSourceEncounters";
import { findOpenSource } from "./openSourceCatalog";
import { resumeCheckpoint } from "./gameProgress";
import { JOB_OPTIONS } from "./player/jobs";

export interface CareerQAPreset extends Omit<GameQAPreset, "group"> {
  group: GameQAPreset["group"] | "직무 돌발 의뢰";
}

/** Start in an actual career; its first new victory offers the role's first encounter. */
export function careerQAPresets(locale: Locale, now = new Date().toISOString()): CareerQAPreset[] {
  const base = gameQAPresets(locale, now);
  const encounters = SOURCE_CAREERS.map((career): CareerQAPreset => {
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
