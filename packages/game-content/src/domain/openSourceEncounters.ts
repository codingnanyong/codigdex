import { text, type LocalizedText } from "@codigdex/game-core/i18n/locale";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { findStage, isCommonPathComplete } from "./chapters";
import { completedCareerPathIds } from "./careerPaths";
import { OPEN_SOURCE_CATALOG, findOpenSource } from "./openSourceCatalog";
import { canSelectSecondaryJob, findJob, findSecondaryJob, type JobId, type SecondaryJobId } from "./player/jobs";

export type SourceCareerId = JobId | SecondaryJobId;
export interface SourceCareer {
  id: SourceCareerId;
  firstTool: string;
  workplace: LocalizedText;
  tools?: readonly string[];
}

/** Side encounters reuse tool cards; a role changes the workplace, never the identity of a tool. */
export const SOURCE_CAREERS: readonly SourceCareer[] = [
  { id: "frontend", firstTool: "tanstack-query", workplace: text("화면의 데이터 갱신과 입력 흐름을 점검해 달라는 요청이 왔어요.", "A request arrives to investigate screen updates and input flows.") },
  { id: "backend", firstTool: "postgresql", workplace: text("주문 API와 데이터 처리 사이의 약속을 점검해 달라는 요청이 왔어요.", "A request arrives to inspect the contract between an order API and its data processing.") },
  { id: "devops", firstTool: "argo-cd", workplace: text("배포 상태와 운영 신호를 함께 점검해 달라는 요청이 왔어요.", "A request arrives to inspect deployment state and operational signals.") },
  { id: "data-engineer", firstTool: "airflow", workplace: text("원천 데이터가 수집·처리·저장으로 이어지는 흐름을 복구해 달라는 요청이 왔어요.", "A request arrives to restore the path from source data through ingestion, processing and storage.") },
  { id: "data-analyst", firstTool: "superset", workplace: text("보고서의 수치와 분석 기준을 함께 확인해 달라는 요청이 왔어요.", "A request arrives to verify report numbers and their analytical definitions.") },
  { id: "fullstack-engineer", firstTool: "zod", tools: ["zod", "tanstack-query", "postgresql", "opentelemetry", "playwright"], workplace: text("화면부터 API·저장소까지 이어지는 사용자 흐름에 문제가 생겼어요.", "A user journey has a fault spanning the UI, API and storage.") },
  { id: "platform-engineer", firstTool: "opentelemetry", tools: ["opentelemetry", "prometheus", "grafana", "argo-cd", "opentofu"], workplace: text("플랫폼의 배포·관측·복구가 같은 약속을 따르는지 확인해야 해요.", "The platform's delivery, observability and recovery must follow the same operational contract.") },
  { id: "ml-developer", firstTool: "scikit-learn", tools: ["scikit-learn", "feast", "mlflow", "dvc"], workplace: text("학습 데이터와 모델 평가를 재현할 수 있게 점검해 달라는 요청이 왔어요.", "A request arrives to make training data and model evaluation reproducible.") },
  { id: "mlops-engineer", firstTool: "mlflow", tools: ["mlflow", "dvc", "airflow", "feast", "prometheus", "grafana", "opentelemetry", "scikit-learn"], workplace: text("데이터·모델 버전과 운영 신호를 연결해 배포된 모델을 점검해야 해요.", "A deployed model needs investigation across data versions, model versions and operational signals.") },
  { id: "analytics-engineer", firstTool: "dbt-core", tools: ["dbt-core", "great-expectations", "openlineage", "marquez", "trino", "superset", "postgresql"], workplace: text("분석 모델의 변환·품질·계보와 지표 정의를 연결해야 해요.", "Analytical transformations, quality, lineage and metric definitions must be connected.") },
];

export function sourceCareer(id: string | undefined): SourceCareer | undefined {
  return SOURCE_CAREERS.find((career) => career.id === id);
}

export function sourceCareerName(id: SourceCareerId) {
  return findSecondaryJob(id)?.name ?? findJob(id).name;
}

export function activeSourceCareer(save: StoredGameStateV3): SourceCareerId | undefined {
  const captured = new Set(save.progress.captures.map(({ id }) => id));
  if (!isCommonPathComplete(captured)) return;
  const secondary = findSecondaryJob(save.player.secondaryJobId);
  if (secondary && canSelectSecondaryJob(secondary, completedCareerPathIds(captured))) return secondary.id;
  const primary = findJob(save.player.primaryJobId);
  return primary.id === "junior" ? undefined : primary.id;
}

export function encounterTools(id: SourceCareerId) {
  const career = sourceCareer(id);
  if (!career) return [];
  const tools = career.tools
    ? career.tools.flatMap((tool) => { const entry = findOpenSource(tool); return entry ? [entry] : []; })
    : OPEN_SOURCE_CATALOG.filter((entry) => entry.paths.includes(id as JobId));
  return [...tools].sort((a, b) => Number(b.id === career.firstTool) - Number(a.id === career.firstTool));
}

export type SourceReturnTarget = { scene: "world-map" | "job-select" | "career-region" | "promotion-chapter"; data?: Record<string, unknown> };
export interface SourceEncounter {
  id: string;
  careerId: SourceCareerId;
  toolId: string;
  triggerId: string;
  triggerAt: string;
  victoryId?: string;
  state: "offered" | "active";
  returnTo: SourceReturnTarget;
}
export interface SourceEncounterHistory {
  processed: string[];
  discoveries: { toolId: string; careerId: SourceCareerId }[];
  offeredCareers: SourceCareerId[];
  sinceOffer: number;
  pending?: SourceEncounter;
}
export function emptyEncounterHistory(): SourceEncounterHistory {
  return { processed: [], discoveries: [], offeredCareers: [], sinceOffer: 0 };
}

export const MAX_PROCESSED_SOURCE_VICTORIES = 256;
const MIN_BATTLE_GAP = 3;
const MAX_BATTLE_GAP = 6;
const ENCOUNTER_CHANCE = 0.25;

/** Each victory rolls once for timing; tool order is stable. An offer counts as discovery even if deferred. */
export function planSourceEncounter(before: StoredGameStateV3, after: StoredGameStateV3, triggerId: string, returnTo: SourceReturnTarget, history: SourceEncounterHistory, random = Math.random, victoryId?: string): SourceEncounterHistory {
  try {
    const chapter = findStage(triggerId).chapter.id;
    if (!chapter.startsWith("career:") && !chapter.startsWith("promotion:")) return history;
  } catch { return history; }
  const careerId = activeSourceCareer(after);
  const capture = after.progress.captures.find(({ id }) => id === triggerId);
  if (!careerId || !capture || triggerId.startsWith("open-source:") || (!victoryId && before.progress.captures.some(({ id }) => id === triggerId)) || history.pending) return history;
  const stamp = `${careerId}:${triggerId}:${victoryId ?? capture.capturedAt}`;
  if (history.processed.includes(stamp)) return history;
  const next = { ...history, processed: [...history.processed, stamp].slice(-MAX_PROCESSED_SOURCE_VICTORIES), sinceOffer: history.sinceOffer + 1 };
  const captured = new Set(after.progress.captures.map(({ id }) => id));
  const remaining = encounterTools(careerId).filter(({ id }) => !captured.has(`open-source:${id}`));
  if (!remaining.length) return next;
  const first = !history.offeredCareers.includes(careerId);
  if (!first && (next.sinceOffer < MIN_BATTLE_GAP || (next.sinceOffer < MAX_BATTLE_GAP && random() >= ENCOUNTER_CHANCE))) return next;
  const undiscovered = remaining.filter(({ id }) => !history.discoveries.some((item) => item.toolId === id && item.careerId === careerId));
  const tool = (undiscovered.length ? undiscovered : remaining)[0];
  return {
    ...next, sinceOffer: 0,
    discoveries: [...history.discoveries.filter((item) => item.toolId !== tool.id || item.careerId !== careerId), { toolId: tool.id, careerId }],
    offeredCareers: [...new Set([...history.offeredCareers, careerId])],
    pending: { id: stamp, careerId, toolId: tool.id, triggerId, triggerAt: capture.capturedAt, ...(victoryId ? { victoryId } : {}), state: "offered", returnTo },
  };
}
