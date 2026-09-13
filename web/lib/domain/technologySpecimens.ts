export interface TechnologySpecimen {
  id: string;
  name: string;
  textureKey: string;
  assetPath: string;
  role: "common" | "future";
  paths: Array<"common" | "frontend" | "backend" | "devops" | "data-engineer" | "data-analyst">;
}

/** Each specimen lives in its chapter's art folder, e.g. monsters/ch02.linux/. */
const art = (chapterFolder: string, file: string) => `/assets/monsters/${chapterFolder}/${file}`;

export const TECHNOLOGY_SPECIMENS = {
  git: {
    id: "git",
    name: "Git",
    textureKey: "tech-git",
    assetPath: art("ch01.git", "git-specimen.png"),
    role: "common",
    paths: ["common"],
  },
  linux: {
    id: "linux",
    name: "Linux",
    textureKey: "tech-linux",
    assetPath: art("ch02.linux", "linux-specimen.png"),
    role: "common",
    paths: ["common"],
  },
  htmlCss: {
    id: "html-css",
    name: "HTML/CSS",
    textureKey: "tech-html-css",
    assetPath: art("ch03.html-css", "html-css-specimen.png"),
    role: "future",
    paths: ["frontend"],
  },
  javascript: {
    id: "javascript",
    name: "JavaScript",
    textureKey: "tech-javascript",
    assetPath: art("ch04.javascript", "javascript-specimen.png"),
    role: "future",
    paths: ["frontend"],
  },
  httpApi: {
    id: "http-api",
    name: "HTTP/API",
    textureKey: "tech-http-api",
    assetPath: art("ch05.http-api", "http-api-specimen.png"),
    role: "future",
    paths: ["frontend", "backend"],
  },
  python: {
    id: "python",
    name: "Python",
    textureKey: "tech-python",
    assetPath: art("ch06.python", "python-specimen.png"),
    role: "future",
    paths: ["backend", "data-engineer", "data-analyst"],
  },
  sql: {
    id: "sql",
    name: "SQL",
    textureKey: "tech-sql",
    assetPath: art("ch07.sql", "sql-specimen.png"),
    role: "future",
    paths: ["backend", "data-engineer", "data-analyst"],
  },
  network: {
    id: "network",
    name: "네트워크",
    textureKey: "tech-network",
    assetPath: art("ch08.network", "network-specimen.png"),
    role: "future",
    paths: ["backend", "devops"],
  },
  testing: {
    id: "testing",
    name: "테스트",
    textureKey: "tech-testing",
    assetPath: art("ch09.testing", "testing-specimen.png"),
    role: "future",
    paths: ["frontend", "backend", "devops"],
  },
  securityAuth: {
    id: "security-auth",
    name: "보안/인증",
    textureKey: "tech-security-auth",
    assetPath: art("ch10.security-auth", "security-auth-specimen.png"),
    role: "future",
    paths: ["backend", "devops"],
  },
  docker: {
    id: "docker",
    name: "Docker",
    textureKey: "tech-docker",
    assetPath: art("ch11.docker", "docker-specimen.png"),
    role: "future",
    paths: ["backend", "devops", "data-engineer"],
  },
  cicd: {
    id: "cicd",
    name: "CI/CD",
    textureKey: "tech-cicd",
    assetPath: art("ch12.cicd", "cicd-specimen.png"),
    role: "future",
    paths: ["frontend", "backend", "devops"],
  },
  kubernetes: {
    id: "kubernetes",
    name: "Kubernetes",
    textureKey: "tech-kubernetes",
    assetPath: art("ch13.kubernetes", "kubernetes-specimen.png"),
    role: "future",
    paths: ["backend", "devops", "data-engineer"],
  },
  cloudIac: {
    id: "cloud-iac",
    name: "Cloud/IaC",
    textureKey: "tech-cloud-iac",
    assetPath: art("ch14.cloud-iac", "cloud-iac-specimen.png"),
    role: "future",
    paths: ["backend", "devops", "data-engineer"],
  },
  monitoring: {
    id: "monitoring",
    name: "모니터링",
    textureKey: "tech-monitoring",
    assetPath: art("ch15.monitoring", "monitoring-specimen-v2.png"),
    role: "future",
    paths: ["backend", "devops", "data-engineer"],
  },
  react: {
    id: "react",
    name: "React",
    textureKey: "tech-react",
    assetPath: art("ch16.react", "react-specimen.png"),
    role: "future",
    paths: ["frontend"],
  },
  serverFramework: {
    id: "server-framework",
    name: "서버 프레임워크",
    textureKey: "tech-server-framework",
    assetPath: art("ch17.server-framework", "server-framework-specimen.png"),
    role: "future",
    paths: ["backend"],
  },
  dataPipeline: {
    id: "data-pipeline",
    name: "데이터 파이프라인",
    textureKey: "tech-data-pipeline",
    assetPath: art("ch18.data-pipeline", "data-pipeline-specimen.png"),
    role: "future",
    paths: ["data-engineer"],
  },
  orchestration: {
    id: "orchestration",
    name: "워크플로 오케스트레이션",
    textureKey: "tech-orchestration",
    assetPath: art("ch19.orchestration", "workflow-orchestration-specimen.png"),
    role: "future",
    paths: ["data-engineer"],
  },
  statistics: {
    id: "statistics",
    name: "기초 통계",
    textureKey: "tech-statistics",
    assetPath: art("ch20.statistics", "statistics-specimen.png"),
    role: "future",
    paths: ["data-analyst"],
  },
  visualization: {
    id: "visualization",
    name: "데이터 시각화",
    textureKey: "tech-visualization",
    assetPath: art("ch21.visualization", "visualization-specimen.png"),
    role: "future",
    paths: ["data-analyst"],
  },
  biTools: {
    id: "bi-tools",
    name: "BI 도구",
    textureKey: "tech-bi-tools",
    assetPath: art("ch22.bi-tools", "bi-tools-specimen.png"),
    role: "future",
    paths: ["data-analyst"],
  },
} satisfies Record<string, TechnologySpecimen>;

/**
 * Only the specimens whose chapters exist appear on the path map. The
 * `future` ones stay registered here — the art is drawn and the names are
 * settled — but nothing renders them until their chapters are written.
 */
export const COMMON_TECHNOLOGY_SPECIMENS = Object.values(TECHNOLOGY_SPECIMENS).filter(
  (specimen) => specimen.role === "common"
);
