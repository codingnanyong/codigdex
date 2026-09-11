export type JobId = "frontend" | "backend" | "devops" | "data-engineer" | "data-analyst";

export interface JobOption {
  id: JobId | "junior";
  name: string;
  tagline: string;
  textureKey?: string;
  assetPath?: string;
}

// Every player starts here. Real job selection only makes sense once the
// common path (Git, terminal/Linux, ...) actually exists to walk through first —
// until then everyone is just this.
export const DEFAULT_JOB: JobOption = {
  id: "junior",
  name: "주니어 개발자",
  tagline: "이제 막 첫걸음을 뗀 개발자",
};

export const JOB_OPTIONS: JobOption[] = [
  {
    id: "frontend",
    name: "웹 프론트엔드 개발자",
    tagline: "화면을 그리는 마법사",
    textureKey: "career-frontend",
    assetPath: "/assets/careers/frontend-developer.png",
  },
  {
    id: "backend",
    name: "백엔드 개발자",
    tagline: "데이터를 지키는 수호자",
    textureKey: "career-backend",
    assetPath: "/assets/careers/backend-developer.png",
  },
  {
    id: "devops",
    name: "DevOps 엔지니어",
    tagline: "배포 흐름을 지키는 자동화 장인",
    textureKey: "career-devops",
    assetPath: "/assets/careers/devops-engineer.png",
  },
  {
    id: "data-engineer",
    name: "데이터 엔지니어",
    tagline: "데이터의 길을 만드는 설계자",
    textureKey: "career-data-engineer",
    assetPath: "/assets/careers/data-engineer.png",
  },
  {
    id: "data-analyst",
    name: "데이터 분석가",
    tagline: "패턴을 읽는 관찰자",
    textureKey: "career-data-analyst",
    assetPath: "/assets/careers/data-analyst.png",
  },
];

export const JOB_REGISTRY_KEY = "selectedJob";

export function findJob(id: string | undefined): JobOption {
  if (!id) return DEFAULT_JOB;
  // Preserve job selections written by the early prototype.
  if (id === "data") return JOB_OPTIONS.find((job) => job.id === "data-analyst")!;
  return JOB_OPTIONS.find((job) => job.id === id) ?? DEFAULT_JOB;
}
