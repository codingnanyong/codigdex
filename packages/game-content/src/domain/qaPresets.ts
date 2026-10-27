import { createEmptySave, type StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { CHAPTERS, DEX_MONSTERS } from "./chapters";
import { CAREER_PATHS } from "./careerPaths";
import { monstersForCareerRegion } from "./careerRegionMonsters";
import { OPEN_SOURCE_EXPEDITIONS } from "./openSourceChapters";
import { SECONDARY_JOB_OPTIONS } from "./player/jobs";
import { normalizeGameSave, selectSecondaryCareer } from "./gameProgress";
import type { Locale } from "@codigdex/game-core/i18n/locale";

export interface GameQAPreset {
  id: string;
  title: string;
  description: string;
  group: "처음 플레이" | "오픈소스 탐험" | "2차 전직" | "도감";
  save: StoredGameStateV3;
}

/** Real progression fixtures. Never remove a gate or fabricate a MASTER flag. */
export function gameQAPresets(locale: Locale, now = new Date().toISOString()): GameQAPreset[] {
  const common = CHAPTERS.flatMap(({ stages }) => stages).map(({ id }) => id);
  const seeded = (ids: readonly string[]) => {
    const save = createEmptySave(locale);
    save.progress.captures = [...new Set(ids)].map((id) => ({ id, capturedAt: now }));
    save.ui.tutorialOnboardingSeen = true;
    return normalizeGameSave(save);
  };
  const fullDex = seeded(DEX_MONSTERS.map(({ id }) => id));
  fullDex.player.primaryJobId = "backend";
  return [
    { id: "fresh", title: "처음부터 시작", description: "튜토리얼 → Git → Linux → 직업 선택의 전체 흐름을 확인합니다.", group: "처음 플레이", save: createEmptySave(locale) },
    ...OPEN_SOURCE_EXPEDITIONS.map(({ chapter }): GameQAPreset => {
      const save = seeded(common);
      save.ui.checkpointId = chapter.stages[0].id;
      return { id: chapter.id, title: chapter.name.ko, description: `${chapter.stages.length}종 · 공통 경로만 완료한 상태로 시작합니다. 전투 → 포획 → 다음 의뢰 → 새로고침 복원을 확인하세요.`, group: "오픈소스 탐험", save };
    }),
    ...SECONDARY_JOB_OPTIONS.map((job): GameQAPreset => {
      const primary = job.requires.flatMap((id) => CAREER_PATHS[id].regions.flatMap(({ id }) => monstersForCareerRegion(id).map(({ id }) => id)));
      const save = seeded([...common, ...primary]);
      save.player.primaryJobId = job.requires[0];
      return { id: `promotion:${job.id}`, title: job.name.ko, description: "선행 1차 두 경로를 완료하고 전직한 상태입니다. 다섯 의뢰·포획·MASTER·이어하기를 확인하세요.", group: "2차 전직", save: selectSecondaryCareer(save, job.id, () => now) };
    }),
    { id: "dex", title: `전체 도감 ${DEX_MONSTERS.length}종`, description: "모든 카드를 포획한 상태입니다. 이어하기 후 하단 코디덱스 버튼에서 이미지·이름·설명을 확인하세요.", group: "도감", save: fullDex },
  ];
}
