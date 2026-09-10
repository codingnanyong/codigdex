export interface JobOption {
  id: string;
  name: string;
  tagline: string;
}

// Every player starts here. Real job selection only makes sense once the
// common path (Git, Docker, ...) actually exists to walk through first —
// until then everyone is just this.
export const DEFAULT_JOB: JobOption = {
  id: "junior",
  name: "주니어 개발자",
  tagline: "이제 막 첫걸음을 뗀 개발자",
};

export const JOB_OPTIONS: JobOption[] = [
  { id: "frontend", name: "프론트엔드 개발자", tagline: "화면을 그리는 마법사" },
  { id: "backend", name: "백엔드 개발자", tagline: "데이터를 지키는 수호자" },
  { id: "data", name: "데이터 분석가", tagline: "패턴을 읽는 관찰자" },
];

export const JOB_REGISTRY_KEY = "selectedJob";

export function findJob(id: string | undefined): JobOption {
  if (!id) return DEFAULT_JOB;
  return JOB_OPTIONS.find((job) => job.id === id) ?? DEFAULT_JOB;
}
