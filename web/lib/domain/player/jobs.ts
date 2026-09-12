export type JobId = "frontend" | "backend" | "devops" | "data-engineer" | "data-analyst";
export type SecondaryJobId =
  | "fullstack-engineer"
  | "platform-engineer"
  | "ml-developer"
  | "mlops-engineer"
  | "analytics-engineer";

export interface JobOption {
  id: JobId | "junior";
  name: string;
  tagline: string;
  textureKey?: string;
  assetPath?: string;
  guideName: string;
}

export interface PrimaryJobOption extends JobOption {
  id: JobId;
  textureKey: string;
  assetPath: string;
}

export interface SecondaryJobOption {
  id: SecondaryJobId;
  /** Kept out of the UI until the unlock condition is met. */
  name: string;
  requires: readonly [JobId, JobId];
}

// Every player starts here. A primary job is selected after the common path.
export const DEFAULT_JOB: JobOption = {
  id: "junior",
  name: "주니어 개발자",
  tagline: "이제 막 첫 모험을 떠난 개발자",
  guideName: "버그 연구원 루피",
};

export const JOB_OPTIONS: readonly PrimaryJobOption[] = [
  {
    id: "frontend",
    name: "웹 프론트엔드 개발자",
    tagline: "화면을 그리는 마법사",
    textureKey: "career-frontend",
    assetPath: "/assets/careers/frontend-developer.png",
    guideName: "프론트엔드 선배",
  },
  {
    id: "backend",
    name: "백엔드 개발자",
    tagline: "데이터를 지키는 수호자",
    textureKey: "career-backend",
    assetPath: "/assets/careers/backend-developer.png",
    guideName: "백엔드 선배",
  },
  {
    id: "devops",
    name: "DevOps 엔지니어",
    tagline: "배포 흐름을 지키는 자동화 장인",
    textureKey: "career-devops",
    assetPath: "/assets/careers/devops-engineer.png",
    guideName: "DevOps 선배",
  },
  {
    id: "data-engineer",
    name: "데이터 엔지니어",
    tagline: "데이터의 길을 만드는 설계자",
    textureKey: "career-data-engineer",
    assetPath: "/assets/careers/data-engineer.png",
    guideName: "데이터 엔지니어 선배",
  },
  {
    id: "data-analyst",
    name: "데이터 분석가",
    tagline: "패턴을 읽는 관찰자",
    textureKey: "career-data-analyst",
    assetPath: "/assets/careers/data-analyst.png",
    guideName: "데이터 분석가 선배",
  },
];

/** Future tier-two jobs are present in the model before their content ships. */
export const SECONDARY_JOB_OPTIONS: readonly SecondaryJobOption[] = [
  { id: "fullstack-engineer", name: "풀스택 엔지니어", requires: ["frontend", "backend"] },
  { id: "platform-engineer", name: "플랫폼 엔지니어 / SRE", requires: ["backend", "devops"] },
  { id: "ml-developer", name: "ML Developer", requires: ["backend", "data-engineer"] },
  { id: "mlops-engineer", name: "MLOps 엔지니어", requires: ["devops", "data-engineer"] },
  { id: "analytics-engineer", name: "분석 엔지니어", requires: ["data-engineer", "data-analyst"] },
];

export const JOB_REGISTRY_KEY = "selectedJob";
export const SECONDARY_JOB_REGISTRY_KEY = "selectedSecondaryJob";

export function findJob(id: string | undefined): JobOption {
  if (!id) return DEFAULT_JOB;
  // Preserve job selections written by the early prototype.
  if (id === "data") return JOB_OPTIONS.find((job) => job.id === "data-analyst")!;
  return JOB_OPTIONS.find((job) => job.id === id) ?? DEFAULT_JOB;
}

export function secondaryJobsFor(jobId: JobId): readonly SecondaryJobOption[] {
  return SECONDARY_JOB_OPTIONS.filter((job) => job.requires.includes(jobId));
}

/** Tier two opens only after both of its required primary paths are complete. */
export function isSecondaryJobUnlocked(
  job: SecondaryJobOption,
  completedPrimaryJobs: ReadonlySet<JobId>
): boolean {
  return job.requires.every((jobId) => completedPrimaryJobs.has(jobId));
}

/** A player may keep their current job, or change only after finishing its path. */
export function canSelectPrimaryJob(
  currentJobId: JobId | "junior",
  requestedJobId: JobId,
  currentPathComplete: boolean
): boolean {
  return currentJobId === "junior" || currentJobId === requestedJobId || currentPathComplete;
}

export function findSecondaryJob(id: string | null | undefined): SecondaryJobOption | undefined {
  return SECONDARY_JOB_OPTIONS.find((job) => job.id === id);
}
