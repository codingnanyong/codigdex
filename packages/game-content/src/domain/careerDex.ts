import { text, type LocalizedText } from "@codigdex/game-core/i18n/locale";
import {
  DEFAULT_JOB,
  guideDisplayName,
  JOB_OPTIONS,
  SECONDARY_JOB_OPTIONS,
  SECONDARY_JOB_SELECTION_ENABLED,
  TERTIARY_JOB_OPTIONS,
  type JobId,
  type SecondaryJobId,
  type TertiaryJobId,
} from "./player/jobs";

export type CareerId = "junior" | JobId | SecondaryJobId | TertiaryJobId;
export type CareerTier = 0 | 1 | 2 | 3;
export type CareerStatus = "locked" | "unlocked" | "active" | "mastered";

export interface CareerCatalogEntry {
  id: CareerId;
  tier: CareerTier;
  name: LocalizedText;
  tagline: LocalizedText;
  emblemAssetKey: string;
  guideName?: LocalizedText;
  requires: readonly CareerId[];
}

export interface CareerDexRecord {
  id: CareerId;
  unlockedAt: string;
  selectedAt?: string;
  masteredAt?: string;
}

export interface CareerDexState {
  careers: CareerDexRecord[];
}

export const EMPTY_CAREER_DEX_STATE: CareerDexState = { careers: [] };

export const CAREER_EMBLEMS: Readonly<Record<CareerId, string>> = {
  junior: "career-emblems/junior-v1.png",
  frontend: "career-emblems/frontend-v1.png",
  backend: "career-emblems/backend-v1.png",
  devops: "career-emblems/devops-v1.png",
  "data-engineer": "career-emblems/data-engineer-v1.png",
  "data-analyst": "career-emblems/data-analyst-v1.png",
  "fullstack-engineer": "career-emblems/fullstack-engineer-v1.png",
  "platform-engineer": "career-emblems/platform-engineer-v1.png",
  "ml-developer": "career-emblems/ml-developer-v1.png",
  "mlops-engineer": "career-emblems/mlops-engineer-v1.png",
  "analytics-engineer": "career-emblems/analytics-engineer-v1.png",
  "software-architect": "career-emblems/software-architect-v1.png",
  "cloud-platform-architect": "career-emblems/cloud-platform-architect-v1.png",
  "ai-product-engineer": "career-emblems/ai-product-engineer-v1.png",
  "ai-platform-architect": "career-emblems/ai-platform-architect-v1.png",
  "data-architect": "career-emblems/data-architect-v1.png",
};

export const careerEmblemTextureKey = (id: CareerId) => `career-emblem-${id}`;

export const CAREER_CATALOG: readonly CareerCatalogEntry[] = [
  {
    id: "junior",
    tier: 0,
    name: DEFAULT_JOB.name,
    tagline: DEFAULT_JOB.tagline,
    emblemAssetKey: CAREER_EMBLEMS.junior,
    guideName: guideDisplayName(DEFAULT_JOB),
    requires: [],
  },
  ...JOB_OPTIONS.map((job) => ({
    id: job.id,
    tier: 1 as const,
    name: job.name,
    tagline: job.tagline,
    emblemAssetKey: CAREER_EMBLEMS[job.id],
    guideName: guideDisplayName(job),
    requires: ["junior"] as const,
  })),
  ...SECONDARY_JOB_OPTIONS.map((job) => ({
    id: job.id,
    tier: 2 as const,
    name: job.name,
    tagline: text("두 전문 경로를 잇는 상위 직업", "A higher career that bridges two specialist paths"),
    emblemAssetKey: CAREER_EMBLEMS[job.id],
    guideName: guideDisplayName(job),
    requires: job.requires,
  })),
  ...TERTIARY_JOB_OPTIONS.map((job) => ({
    id: job.id,
    tier: 3 as const,
    name: job.name,
    tagline: text("2차 직업을 완성한 마스터 직업", "A master career earned by completing a tier 2 career"),
    emblemAssetKey: CAREER_EMBLEMS[job.id],
    guideName: guideDisplayName(job),
    requires: [job.requires],
  })),
];

const CAREER_IDS = new Set(CAREER_CATALOG.map(({ id }) => id));

export function isCareerId(value: string): value is CareerId {
  return CAREER_IDS.has(value as CareerId);
}

export function normalizeCareerDexState(state: CareerDexState): CareerDexState {
  const byId = new Map<CareerId, CareerDexRecord>();
  state.careers.forEach((record) => {
    if (!isCareerId(record.id) || byId.has(record.id)) return;
    const tier = CAREER_CATALOG.find(({ id }) => id === record.id)?.tier;
    const normalized =
      !SECONDARY_JOB_SELECTION_ENABLED && tier !== undefined && tier >= 2
        ? { ...record, selectedAt: undefined }
        : { ...record };
    byId.set(record.id, normalized);
  });
  return { careers: CAREER_CATALOG.flatMap(({ id }) => (byId.has(id) ? [byId.get(id)!] : [])) };
}

export function careerRecord(state: CareerDexState, id: CareerId): CareerDexRecord | undefined {
  return state.careers.find((record) => record.id === id);
}

export function unlockCareer(
  state: CareerDexState,
  id: CareerId,
  now: () => string = () => new Date().toISOString()
): CareerDexState {
  if (careerRecord(state, id)) return state;
  return normalizeCareerDexState({ careers: [...state.careers, { id, unlockedAt: now() }] });
}

export function selectCareer(
  state: CareerDexState,
  id: CareerId,
  now: () => string = () => new Date().toISOString()
): CareerDexState {
  const unlocked = unlockCareer(state, id, now);
  const tier = CAREER_CATALOG.find((career) => career.id === id)?.tier;
  if (!SECONDARY_JOB_SELECTION_ENABLED && tier !== undefined && tier >= 2) {
    return unlocked;
  }
  const existing = careerRecord(unlocked, id)!;
  if (existing.selectedAt) return unlocked;
  return {
    careers: unlocked.careers.map((record) =>
      record.id === id ? { ...record, selectedAt: now() } : record
    ),
  };
}

export function masterCareer(
  state: CareerDexState,
  id: CareerId,
  now: () => string = () => new Date().toISOString()
): CareerDexState {
  const unlocked = unlockCareer(state, id, now);
  const existing = careerRecord(unlocked, id)!;
  if (existing.masteredAt) return unlocked;
  return {
    careers: unlocked.careers.map((record) =>
      record.id === id ? { ...record, masteredAt: now() } : record
    ),
  };
}

export interface CareerDexProgress {
  commonPathComplete: boolean;
  completedPrimaryJobs: ReadonlySet<JobId>;
  completedSecondaryJobs: ReadonlySet<SecondaryJobId>;
  activePrimaryJob: JobId | "junior";
  activeSecondaryJob?: SecondaryJobId;
  activeTertiaryJob?: TertiaryJobId;
}

/** Applies newly earned unlock, selection, and mastery milestones without erasing history. */
export function reconcileCareerDex(
  state: CareerDexState,
  progress: CareerDexProgress,
  now: () => string = () => new Date().toISOString()
): CareerDexState {
  let next = unlockCareer(normalizeCareerDexState(state), "junior", now);
  if (progress.commonPathComplete) {
    next = masterCareer(next, "junior", now);
    JOB_OPTIONS.forEach((job) => {
      next = unlockCareer(next, job.id, now);
    });
  }

  next = selectCareer(next, progress.activePrimaryJob, now);
  progress.completedPrimaryJobs.forEach((id) => {
    next = masterCareer(next, id, now);
  });

  SECONDARY_JOB_OPTIONS.forEach((job) => {
    if (job.requires.every((id) => Boolean(careerRecord(next, id)?.masteredAt))) {
      next = unlockCareer(next, job.id, now);
    }
  });
  if (progress.activeSecondaryJob && careerRecord(next, progress.activeSecondaryJob)) {
    next = selectCareer(next, progress.activeSecondaryJob, now);
  }
  progress.completedSecondaryJobs.forEach((id) => {
    next = masterCareer(next, id, now);
  });

  TERTIARY_JOB_OPTIONS.forEach((job) => {
    if (careerRecord(next, job.requires)?.masteredAt) next = unlockCareer(next, job.id, now);
  });
  if (progress.activeTertiaryJob && careerRecord(next, progress.activeTertiaryJob)) {
    next = selectCareer(next, progress.activeTertiaryJob, now);
  }
  return next;
}

export function careerStatus(
  state: CareerDexState,
  id: CareerId,
  activeCareerIds: ReadonlySet<CareerId> = new Set()
): CareerStatus {
  const record = careerRecord(state, id);
  if (!record) return "locked";
  if (activeCareerIds.has(id)) return "active";
  if (record.masteredAt) return "mastered";
  return "unlocked";
}

export function masteredPrimaryJobIds(state: CareerDexState): ReadonlySet<JobId> {
  return new Set(
    JOB_OPTIONS.filter((job) => Boolean(careerRecord(state, job.id)?.masteredAt)).map(({ id }) => id)
  );
}

export function masteredSecondaryJobIds(state: CareerDexState): ReadonlySet<SecondaryJobId> {
  return new Set(
    SECONDARY_JOB_OPTIONS.filter((job) => Boolean(careerRecord(state, job.id)?.masteredAt)).map(
      ({ id }) => id
    )
  );
}
