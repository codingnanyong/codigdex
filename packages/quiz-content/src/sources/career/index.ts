import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";

/** One career technology's pools, indexed by stage level (LV.1 first). */
export type CareerLevelPools = readonly (readonly QuizQuestion[])[];

/**
 * Every career pool is hand-authored, so each file is loaded on its own rather
 * than pulled in as one bundle. Keys match the technology ids in
 * CAREER_REGION_MONSTERS; CAREER_POOL_SIZE below is what each level holds.
 */
const LOADERS: Readonly<Record<string, () => Promise<{ default: CareerLevelPools }>>> = {
  "html-css": () => import("./html-css"),
  javascript: () => import("./javascript"),
  "http-api": () => import("./http-api"),
  python: () => import("./python"),
  sql: () => import("./sql"),
  network: () => import("./network"),
  testing: () => import("./testing"),
  "security-auth": () => import("./security-auth"),
  docker: () => import("./docker"),
  cicd: () => import("./cicd"),
  kubernetes: () => import("./kubernetes"),
  "cloud-iac": () => import("./cloud-iac"),
  monitoring: () => import("./monitoring"),
  react: () => import("./react"),
  "server-framework": () => import("./server-framework"),
  "data-pipeline": () => import("./data-pipeline"),
  orchestration: () => import("./orchestration"),
  statistics: () => import("./statistics"),
  visualization: () => import("./visualization"),
  "bi-tools": () => import("./bi-tools"),
};

/** Questions authored per career stage. Every level pool holds exactly this many. */
export const CAREER_POOL_SIZE = 10;

export const CAREER_TECHNOLOGY_IDS: readonly string[] = Object.keys(LOADERS);

export function hasCareerQuizSource(technologyId: string): boolean {
  return technologyId in LOADERS;
}

export async function loadCareerLevelPools(technologyId: string): Promise<CareerLevelPools> {
  const load = LOADERS[technologyId];
  if (!load) throw new Error(`No career quiz source for technology: ${technologyId}`);
  return (await load()).default;
}
