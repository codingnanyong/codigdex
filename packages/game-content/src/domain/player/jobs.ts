import { joinText, text, type LocalizedText } from "@codigdex/game-core/i18n/locale";

export type JobId = "frontend" | "backend" | "devops" | "data-engineer" | "data-analyst";
export type SecondaryJobId =
  | "fullstack-engineer"
  | "platform-engineer"
  | "ml-developer"
  | "mlops-engineer"
  | "analytics-engineer";
export type TertiaryJobId =
  | "software-architect"
  | "cloud-platform-architect"
  | "ai-product-engineer"
  | "ai-platform-architect"
  | "data-architect";

export interface JobOption {
  id: JobId | "junior";
  name: LocalizedText;
  tagline: LocalizedText;
  textureKey?: string;
  assetPath?: string;
  overworldTextureKey: string;
  overworldAssetPath: string;
  guideTitle: LocalizedText;
  guideName: LocalizedText;
  guideTextureKey?: string;
  guideAssetPath?: string;
}

export interface PrimaryJobOption extends JobOption {
  id: JobId;
  textureKey: string;
  assetPath: string;
  guideTextureKey: string;
  guideAssetPath: string;
}

export interface SecondaryJobOption {
  id: SecondaryJobId;
  /** Kept out of the UI until the unlock condition is met. */
  name: LocalizedText;
  guideTitle: LocalizedText;
  guideName: LocalizedText;
  requires: readonly [JobId, JobId];
  /** Final mastery captures required before this path can promote to tier three. */
  masteryCaptureIds: readonly string[];
}

export interface TertiaryJobOption {
  id: TertiaryJobId;
  name: LocalizedText;
  guideTitle: LocalizedText;
  guideName: LocalizedText;
  requires: SecondaryJobId;
}

const careerCharacterArt = (careerId: JobId | "junior", role: "player" | "guide") =>
  `/assets/characters/career-path/${careerId}/${role}-v${role === "player" ? 2 : 1}.png`;

const careerOverworldArt = (careerId: JobId) =>
  `/assets/characters/player/overworld-player-${careerId}-v1.png`;

export const CAREER_CHARACTER_GUIDE_ASSET_PATH =
  "/assets/characters/career-path/career-character-guide-v2.png";
export const OVERWORLD_PLAYER_TEXTURE_KEY = "player-overworld";
export const OVERWORLD_PLAYER_ASSET_PATH =
  "/assets/characters/player/overworld-player-v1.png";

// Every player starts here. A primary job is selected after the common path.
export const DEFAULT_JOB: JobOption = {
  id: "junior",
  name: text("주니어 개발자", "Junior Developer"),
  tagline: text("이제 막 첫 모험을 떠난 개발자", "A developer setting out on their first adventure"),
  textureKey: "career-junior",
  assetPath: careerCharacterArt("junior", "player"),
  overworldTextureKey: OVERWORLD_PLAYER_TEXTURE_KEY,
  overworldAssetPath: OVERWORLD_PLAYER_ASSET_PATH,
  guideTitle: text("버그 연구원", "Bug Researcher"),
  guideName: text("루피", "Lupi"),
  guideTextureKey: "npc-lupi-guide",
  guideAssetPath: careerCharacterArt("junior", "guide"),
};

export const JOB_OPTIONS: readonly PrimaryJobOption[] = [
  {
    id: "frontend",
    name: text("웹 프론트엔드 개발자", "Web Frontend Developer"),
    tagline: text("화면을 그리는 마법사", "A wizard who paints the screen"),
    textureKey: "career-frontend",
    assetPath: careerCharacterArt("frontend", "player"),
    overworldTextureKey: "player-overworld-frontend",
    overworldAssetPath: careerOverworldArt("frontend"),
    guideTitle: text("UI 연금술사", "UI Alchemist"),
    guideName: text("미나", "Mina"),
    guideTextureKey: "npc-frontend-senior",
    guideAssetPath: careerCharacterArt("frontend", "guide"),
  },
  {
    id: "backend",
    name: text("백엔드 개발자", "Backend Developer"),
    tagline: text("데이터를 지키는 수호자", "A guardian who protects the data"),
    textureKey: "career-backend",
    assetPath: careerCharacterArt("backend", "player"),
    overworldTextureKey: "player-overworld-backend",
    overworldAssetPath: careerOverworldArt("backend"),
    guideTitle: text("서버 수호자", "Server Guardian"),
    guideName: text("태오", "Taeo"),
    guideTextureKey: "npc-backend-senior",
    guideAssetPath: careerCharacterArt("backend", "guide"),
  },
  {
    id: "devops",
    name: text("DevOps 엔지니어", "DevOps Engineer"),
    tagline: text("배포 흐름을 지키는 자동화 장인", "An automation artisan who keeps releases flowing"),
    textureKey: "career-devops",
    assetPath: careerCharacterArt("devops", "player"),
    overworldTextureKey: "player-overworld-devops",
    overworldAssetPath: careerOverworldArt("devops"),
    guideTitle: text("자동화 장인", "Automation Artisan"),
    guideName: text("도윤", "Doyun"),
    guideTextureKey: "npc-devops-senior",
    guideAssetPath: careerCharacterArt("devops", "guide"),
  },
  {
    id: "data-engineer",
    name: text("데이터 엔지니어", "Data Engineer"),
    tagline: text("데이터의 길을 만드는 설계자", "An architect who builds roads for data"),
    textureKey: "career-data-engineer",
    assetPath: careerCharacterArt("data-engineer", "player"),
    overworldTextureKey: "player-overworld-data-engineer",
    overworldAssetPath: careerOverworldArt("data-engineer"),
    guideTitle: text("파이프라인 설계자", "Pipeline Architect"),
    guideName: text("하나", "Hana"),
    guideTextureKey: "npc-data-engineer-senior",
    guideAssetPath: careerCharacterArt("data-engineer", "guide"),
  },
  {
    id: "data-analyst",
    name: text("데이터 분석가", "Data Analyst"),
    tagline: text("패턴을 읽는 관찰자", "An observer who reads patterns"),
    textureKey: "career-data-analyst",
    assetPath: careerCharacterArt("data-analyst", "player"),
    overworldTextureKey: "player-overworld-data-analyst",
    overworldAssetPath: careerOverworldArt("data-analyst"),
    guideTitle: text("인사이트 탐정", "Insight Detective"),
    guideName: text("이안", "Ian"),
    guideTextureKey: "npc-data-analyst-senior",
    guideAssetPath: careerCharacterArt("data-analyst", "guide"),
  },
];

/** Future tier-two jobs are present in the model before their content ships. */
export const SECONDARY_JOB_OPTIONS: readonly SecondaryJobOption[] = [
  {
    id: "fullstack-engineer",
    name: text("풀스택 엔지니어", "Fullstack Engineer"),
    guideTitle: text("경계의 설계자", "Boundary Architect"),
    guideName: text("아라", "Ara"),
    requires: ["frontend", "backend"],
    masteryCaptureIds: [],
  },
  {
    id: "platform-engineer",
    name: text("플랫폼 엔지니어 / SRE", "Platform Engineer / SRE"),
    guideTitle: text("플랫폼 항해사", "Platform Navigator"),
    guideName: text("준", "Jun"),
    requires: ["backend", "devops"],
    masteryCaptureIds: [],
  },
  {
    id: "ml-developer",
    name: text("ML Developer", "ML Developer"),
    guideTitle: text("모델 조련사", "Model Tamer"),
    guideName: text("유진", "Yujin"),
    requires: ["backend", "data-engineer"],
    masteryCaptureIds: [],
  },
  {
    id: "mlops-engineer",
    name: text("MLOps 엔지니어", "MLOps Engineer"),
    guideTitle: text("모델 운영관", "Model Operator"),
    guideName: text("시우", "Siwoo"),
    requires: ["devops", "data-engineer"],
    masteryCaptureIds: [],
  },
  {
    id: "analytics-engineer",
    name: text("분석 엔지니어", "Analytics Engineer"),
    guideTitle: text("지표 번역가", "Metrics Translator"),
    guideName: text("소라", "Sora"),
    requires: ["data-engineer", "data-analyst"],
    masteryCaptureIds: [],
  },
];

/** Tier-three mastery jobs; their playable capstone chapters ship later. */
export const TERTIARY_JOB_OPTIONS: readonly TertiaryJobOption[] = [
  {
    id: "software-architect",
    name: text("소프트웨어 아키텍트", "Software Architect"),
    guideTitle: text("시스템 대현자", "System Sage"),
    guideName: text("로한", "Rohan"),
    requires: "fullstack-engineer",
  },
  {
    id: "cloud-platform-architect",
    name: text("클라우드 플랫폼 아키텍트", "Cloud Platform Architect"),
    guideTitle: text("구름 성채 설계자", "Cloud Citadel Architect"),
    guideName: text("하늘", "Haneul"),
    requires: "platform-engineer",
  },
  {
    id: "ai-product-engineer",
    name: text("AI 프로덕트 엔지니어", "AI Product Engineer"),
    guideTitle: text("AI 공방장", "AI Workshop Master"),
    guideName: text("지안", "Jian"),
    requires: "ml-developer",
  },
  {
    id: "ai-platform-architect",
    name: text("AI 플랫폼 아키텍트", "AI Platform Architect"),
    guideTitle: text("지능 기반 설계자", "Intelligence Foundation Architect"),
    guideName: text("레온", "Leon"),
    requires: "mlops-engineer",
  },
  {
    id: "data-architect",
    name: text("데이터 아키텍트", "Data Architect"),
    guideTitle: text("데이터 기록관", "Data Archivist"),
    guideName: text("서윤", "Seoyun"),
    requires: "analytics-engineer",
  },
];

export function guideDisplayName(job: Pick<JobOption, "guideTitle" | "guideName">): LocalizedText {
  return joinText([job.guideTitle, job.guideName]);
}

export const JOB_REGISTRY_KEY = "selectedJob";
export const SECONDARY_JOB_REGISTRY_KEY = "selectedSecondaryJob";
export const TERTIARY_JOB_REGISTRY_KEY = "selectedTertiaryJob";

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

export function completedSecondaryJobIds(
  captured: ReadonlySet<string>,
  jobs: readonly SecondaryJobOption[] = SECONDARY_JOB_OPTIONS
): ReadonlySet<SecondaryJobId> {
  return new Set(
    jobs.filter(
      (job) =>
        job.masteryCaptureIds.length > 0 &&
        job.masteryCaptureIds.every((captureId) => captured.has(captureId))
    ).map((job) => job.id)
  );
}

export function tertiaryJobsFor(jobId: SecondaryJobId): readonly TertiaryJobOption[] {
  return TERTIARY_JOB_OPTIONS.filter((job) => job.requires === jobId);
}

export function isTertiaryJobUnlocked(
  job: TertiaryJobOption,
  completedSecondaryJobs: ReadonlySet<SecondaryJobId>
): boolean {
  return completedSecondaryJobs.has(job.requires);
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

export function findTertiaryJob(id: string | null | undefined): TertiaryJobOption | undefined {
  return TERTIARY_JOB_OPTIONS.find((job) => job.id === id);
}
