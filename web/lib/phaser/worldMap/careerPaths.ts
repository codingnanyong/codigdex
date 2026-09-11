import type { JobId } from "@/lib/domain/player/jobs";

export interface CareerRegion {
  id: string;
  label: string;
  /** Center and click radius of the painted entry disc. */
  x: number;
  y: number;
  radius: number;
  /** The illustrated destination connected to the disc is an entry too. */
  landmark: { x: number; y: number; width: number; height: number };
}

export interface CareerPathDefinition {
  jobId: JobId;
  textureKey: string;
  assetPath: string;
  title: string;
  regions: readonly CareerRegion[];
}

type Point = readonly [x: number, y: number];
type Bounds = readonly [x: number, y: number, width: number, height: number];

const region = (id: string, label: string, [x, y]: Point, [lx, ly, width, height]: Bounds): CareerRegion => ({
  id,
  label,
  x,
  y,
  radius: 25,
  landmark: { x: lx, y: ly, width, height },
});

export const CAREER_PATHS: Record<JobId, CareerPathDefinition> = {
  frontend: {
    jobId: "frontend",
    textureKey: "world-career-frontend",
    assetPath: "/assets/wallpapers/career-paths/frontend-path-map-v1.png",
    title: "웹 프론트엔드 개발자 경로",
    regions: [
      region("html-css", "HTML/CSS", [164, 384], [160, 365, 126, 108]),
      region("javascript", "JavaScript", [339, 265], [390, 202, 118, 100]),
      region("http-api", "브라우저 · HTTP", [487, 384], [488, 361, 142, 106]),
      region("react", "React", [691, 305], [692, 257, 142, 116]),
      region("frontend-testing", "프론트엔드 테스트", [839, 119], [876, 79, 138, 116]),
    ],
  },
  backend: {
    jobId: "backend",
    textureKey: "world-career-backend",
    assetPath: "/assets/wallpapers/career-paths/backend-path-map-v1.png",
    title: "백엔드 개발자 경로",
    regions: [
      region("http-api", "HTTP/API", [109, 416], [111, 393, 122, 104]),
      region("server-framework", "서버 프레임워크", [262, 195], [151, 197, 180, 154]),
      region("sql", "데이터베이스 · SQL", [447, 205], [448, 174, 126, 116]),
      region("security-auth", "인증 · 보안", [605, 145], [606, 111, 132, 112]),
      region("network", "네트워크", [750, 230], [750, 198, 148, 122]),
      region("docker", "Docker", [810, 353], [849, 360, 170, 118]),
    ],
  },
  devops: {
    jobId: "devops",
    textureKey: "world-career-devops",
    assetPath: "/assets/wallpapers/career-paths/devops-path-map-v1.png",
    title: "DevOps 엔지니어 경로",
    regions: [
      region("network", "네트워크", [80, 435], [79, 405, 132, 126]),
      region("docker", "Docker", [220, 379], [211, 346, 158, 108]),
      region("cicd", "CI/CD", [395, 315], [382, 278, 168, 126]),
      region("kubernetes", "Kubernetes", [520, 225], [521, 181, 148, 126]),
      region("cloud-iac", "Cloud · IaC", [646, 369], [646, 333, 170, 122]),
      region("monitoring", "모니터링", [740, 205], [741, 163, 136, 124]),
    ],
  },
  "data-engineer": {
    jobId: "data-engineer",
    textureKey: "world-career-data-engineer",
    assetPath: "/assets/wallpapers/career-paths/data-engineer-path-map-v1.png",
    title: "데이터 엔지니어 경로",
    regions: [
      region("python", "Python", [114, 400], [113, 369, 132, 122]),
      region("sql", "SQL · 데이터 모델링", [229, 203], [252, 169, 176, 126]),
      region("data-pipeline", "데이터 파이프라인", [455, 369], [506, 341, 184, 128]),
      region("docker", "Docker", [709, 157], [709, 125, 142, 124]),
      region("orchestration", "오케스트레이션", [785, 284], [791, 246, 160, 118]),
      region("monitoring", "모니터링", [858, 74], [861, 52, 140, 96]),
    ],
  },
  "data-analyst": {
    jobId: "data-analyst",
    textureKey: "world-career-data-analyst",
    assetPath: "/assets/wallpapers/career-paths/data-analyst-path-map-v1.png",
    title: "데이터 분석가 경로",
    regions: [
      region("sql", "SQL", [272, 412], [122, 376, 104, 106]),
      region("statistics", "기초 통계", [431, 326], [363, 313, 166, 118]),
      region("visualization", "데이터 시각화", [580, 241], [550, 184, 142, 110]),
      region("bi-tools", "BI 도구", [747, 183], [830, 98, 174, 140]),
      region("python", "분석용 Python", [811, 282], [852, 300, 156, 96]),
    ],
  },
};

export function careerPathFor(jobId: JobId): CareerPathDefinition {
  return CAREER_PATHS[jobId];
}
