import { text, type LocalizedText } from "@codigdex/game-core/i18n/locale";
import { quizPackIdFor } from "@codigdex/game-core/domain/dex/quiz";
import type { ChapterDefinition, MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { PROMOTION_MISSIONS } from "./promotionChapters";
import { SECONDARY_TERRAIN_OUTLINES } from "./secondaryTerrainGeometry";
import { SECONDARY_CAREER_ORDER, evolutionStageId, evolutionIdentity, secondaryDexNumber } from "./secondaryEvolutionIds";
import type { SecondaryJobId } from "./player/jobs";

export type MapPoint = readonly [number, number];
export interface SecondaryRegion {
  id: string; jobId: SecondaryJobId; index: number; label: LocalizedText;
  center: MapPoint; outline: readonly MapPoint[]; chapter: ChapterDefinition;
  core: MonsterDefinition; atlasAssetKey: string; terrainAssetKey: string;
}
export const EVOLUTION_LESSON_PHASES = [text("원리 발견", "DISCOVER"), text("구현 연습", "BUILD"), text("오류 진단", "DIAGNOSE"), text("결과 검증", "VERIFY"), text("통합 수호자", "INTEGRATE")] as const;
const regionLabels: Record<SecondaryJobId, readonly LocalizedText[]> = {
  "platform-engineer": [text("배포 항구", "Release Harbor"), text("관측 등대", "Signal Lighthouse"), text("약속의 연못", "Promise Sanctuary"), text("구조 습지", "Rescue Wetlands"), text("복구 성채", "Recovery Citadel")],
  "fullstack-engineer": [text("계약의 관문", "Contract Gate"), text("요청의 물길", "Request Waterways"), text("거래의 금고", "Transaction Vault"), text("추적의 전망대", "Trace Lookout"), text("연결의 성역", "Bridge Sanctuary")],
  "ml-developer": [text("표본의 들판", "Sample Fields"), text("특징의 온실", "Feature Greenhouse"), text("평가의 고개", "Evaluation Pass"), text("응답의 전초기지", "Serving Outpost"), text("모델의 대온실", "Model Conservatory")],
  "mlops-engineer": [text("계보의 기록관", "Lineage Archive"), text("흐름의 수로", "Pipeline Canals"), text("승격의 정원", "Registry Gardens"), text("변화의 관측림", "Drift Grove"), text("순환의 묘목장", "Renewal Nursery")],
  "analytics-engineer": [text("한 알의 곡창", "Grain Granary"), text("품질의 연못", "Quality Pond"), text("지표의 별탑", "Metrics Spire"), text("계보의 숲", "Lineage Grove"), text("통찰의 천문대", "Insight Observatory")],
};
const centers: readonly MapPoint[] = [[173,173],[482,170],[814,170],[701,369],[293,367]];
const prefixes = [text("아기", "Young"), text("견습", "Apprentice"), text("성장한", "Growing"), text("숙련된", "Seasoned")];
export const SECONDARY_REGIONS: readonly SecondaryRegion[] = SECONDARY_CAREER_ORDER.flatMap((jobId) => {
  const mission = PROMOTION_MISSIONS[jobId];
  return mission.chapter.stages.map((core, index): SecondaryRegion => {
    const id = core.id;
    const chapterId = `promotion:${jobId}:${id}` as const;
    const stages = Array.from({ length: 5 }, (_, phase): MonsterDefinition => {
      if (phase === 4) return { ...core, level: 5 };
      const level = phase + 1;
      const stageId = evolutionStageId(id, level);
      return { ...core, id: stageId, level, dexNumber: secondaryDexNumber(jobId, index, level),
        name: text(`${prefixes[phase].ko} ${core.name.ko}`, `${prefixes[phase].en} ${core.name.en}`),
        trait: EVOLUTION_LESSON_PHASES[phase],
        description: text(`${core.name.ko} 계열의 Lv.${level} 진화형. ${core.description.ko}`, `Level ${level} of the ${core.name.en} family. ${core.description.en}`),
        textureKey: `secondary-${jobId}-${index + 1}-lv${level}`,
        assetKey: `monsters/secondary-evolutions/${jobId}/${id}-lv${level}-v1.png`,
        quizPackId: quizPackIdFor(chapterId, stageId),
      };
    });
    return { id, jobId, index, core, label: regionLabels[jobId][index], center: centers[index], outline: SECONDARY_TERRAIN_OUTLINES[jobId][index],
      atlasAssetKey: `wallpapers/secondary-careers/${jobId}/atlas-v1.png`,
      terrainAssetKey: `wallpapers/secondary-careers/${jobId}/terrain-${index + 1}-v1.png`,
      chapter: { ...mission.chapter, id: chapterId, name: regionLabels[jobId][index],
        place: core.classification, stages,
        arena: { textureKey: `secondary-arena-${jobId}-${index + 1}`, assetKey: `wallpapers/secondary-careers/${jobId}/region-${index + 1}-v1.png` },
      },
    };
  });
});
export const SECONDARY_REGION_CHAPTERS = SECONDARY_REGIONS.map(({ chapter }) => chapter);
export const secondaryRegionsFor = (id: string) => SECONDARY_REGIONS.filter(({ jobId }) => jobId === id);
export const secondaryRegionForStage = (id: string) => {
  const identity = evolutionIdentity(id);
  return identity && SECONDARY_REGIONS.find((region) => region.id === identity.coreId);
};
