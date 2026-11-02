import { PLATFORM_STAGE_IDS, FULLSTACK_STAGE_IDS, ML_STAGE_IDS, MLOPS_STAGE_IDS, ANALYTICS_STAGE_IDS } from "./promotionIds";

/** Save IDs stay stable; displayed dex numbers follow the complete evolution order. */
export const SECONDARY_FAMILIES = {
  "platform-engineer": PLATFORM_STAGE_IDS,
  "fullstack-engineer": FULLSTACK_STAGE_IDS,
  "ml-developer": ML_STAGE_IDS,
  "mlops-engineer": MLOPS_STAGE_IDS,
  "analytics-engineer": ANALYTICS_STAGE_IDS,
} as const;
export type SecondaryEvolutionCareer = keyof typeof SECONDARY_FAMILIES;
export const SECONDARY_CAREER_ORDER = Object.keys(SECONDARY_FAMILIES) as SecondaryEvolutionCareer[];
export const evolutionStageId = (coreId: string, level: number) => level === 5 ? coreId : `evolution:${coreId}:${level}`;
export function secondaryDexNumber(jobId: SecondaryEvolutionCareer, regionIndex: number, level: number) {
  return String(111 + SECONDARY_CAREER_ORDER.indexOf(jobId) * 25 + regionIndex * 5 + level - 1).padStart(3, "0");
}
export function evolutionIdentity(id: string) {
  const match = /^evolution:(.+):([1-4])$/.exec(id);
  const coreId = match?.[1] ?? id;
  for (const jobId of SECONDARY_CAREER_ORDER) {
    const regionIndex = (SECONDARY_FAMILIES[jobId] as readonly string[]).indexOf(coreId);
    if (regionIndex >= 0) return { jobId, regionIndex, coreId, level: match ? Number(match[2]) : 5 };
  }
}
