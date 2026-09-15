import { text, type LocalizedText } from "@codigdex/game-core/i18n/locale";

export interface TechnologySpecimen {
  id: string;
  name: LocalizedText;
  textureKey: string;
  assetKey: string;
  role: "common" | "future";
  paths: Array<"common" | "frontend" | "backend" | "devops" | "data-engineer" | "data-analyst">;
}

/** Each specimen lives in its chapter's art folder, e.g. monsters/ch02.linux/. */
const art = (chapterFolder: string, file: string) => `monsters/${chapterFolder}/${file}`;

export const TECHNOLOGY_SPECIMENS = {
  git: {
    id: "git",
    name: text("Git", "Git"),
    textureKey: "tech-git",
    assetKey: art("ch01.git", "git-specimen.png"),
    role: "common",
    paths: ["common"],
  },
  linux: {
    id: "linux",
    name: text("Linux", "Linux"),
    textureKey: "tech-linux",
    assetKey: art("ch02.linux", "linux-specimen.png"),
    role: "common",
    paths: ["common"],
  },
  htmlCss: {
    id: "html-css",
    name: text("HTML/CSS", "HTML/CSS"),
    textureKey: "tech-html-css",
    assetKey: art("ch03.html-css", "html-css-specimen.png"),
    role: "future",
    paths: ["frontend"],
  },
  javascript: {
    id: "javascript",
    name: text("JavaScript", "JavaScript"),
    textureKey: "tech-javascript",
    assetKey: art("ch04.javascript", "javascript-specimen.png"),
    role: "future",
    paths: ["frontend"],
  },
  httpApi: {
    id: "http-api",
    name: text("HTTP/API", "HTTP/API"),
    textureKey: "tech-http-api",
    assetKey: art("ch05.http-api", "http-api-specimen.png"),
    role: "future",
    paths: ["frontend", "backend"],
  },
  python: {
    id: "python",
    name: text("Python", "Python"),
    textureKey: "tech-python",
    assetKey: art("ch06.python", "python-specimen.png"),
    role: "future",
    paths: ["backend", "data-engineer", "data-analyst"],
  },
  sql: {
    id: "sql",
    name: text("SQL", "SQL"),
    textureKey: "tech-sql",
    assetKey: art("ch07.sql", "sql-specimen.png"),
    role: "future",
    paths: ["backend", "data-engineer", "data-analyst"],
  },
  network: {
    id: "network",
    name: text("네트워크", "Networking"),
    textureKey: "tech-network",
    assetKey: art("ch08.network", "network-specimen.png"),
    role: "future",
    paths: ["backend", "devops"],
  },
  testing: {
    id: "testing",
    name: text("테스트", "Testing"),
    textureKey: "tech-testing",
    assetKey: art("ch09.testing", "testing-specimen.png"),
    role: "future",
    paths: ["frontend", "backend", "devops"],
  },
  securityAuth: {
    id: "security-auth",
    name: text("보안/인증", "Security/Auth"),
    textureKey: "tech-security-auth",
    assetKey: art("ch10.security-auth", "security-auth-specimen.png"),
    role: "future",
    paths: ["backend", "devops"],
  },
  docker: {
    id: "docker",
    name: text("Docker", "Docker"),
    textureKey: "tech-docker",
    assetKey: art("ch11.docker", "docker-specimen.png"),
    role: "future",
    paths: ["backend", "devops", "data-engineer"],
  },
  cicd: {
    id: "cicd",
    name: text("CI/CD", "CI/CD"),
    textureKey: "tech-cicd",
    assetKey: art("ch12.cicd", "cicd-specimen.png"),
    role: "future",
    paths: ["frontend", "backend", "devops"],
  },
  kubernetes: {
    id: "kubernetes",
    name: text("Kubernetes", "Kubernetes"),
    textureKey: "tech-kubernetes",
    assetKey: art("ch13.kubernetes", "kubernetes-specimen.png"),
    role: "future",
    paths: ["backend", "devops", "data-engineer"],
  },
  cloudIac: {
    id: "cloud-iac",
    name: text("Cloud/IaC", "Cloud/IaC"),
    textureKey: "tech-cloud-iac",
    assetKey: art("ch14.cloud-iac", "cloud-iac-specimen.png"),
    role: "future",
    paths: ["backend", "devops", "data-engineer"],
  },
  monitoring: {
    id: "monitoring",
    name: text("모니터링", "Monitoring"),
    textureKey: "tech-monitoring",
    assetKey: art("ch15.monitoring", "monitoring-specimen-v2.png"),
    role: "future",
    paths: ["backend", "devops", "data-engineer"],
  },
  react: {
    id: "react",
    name: text("React", "React"),
    textureKey: "tech-react",
    assetKey: art("ch16.react", "react-specimen.png"),
    role: "future",
    paths: ["frontend"],
  },
  serverFramework: {
    id: "server-framework",
    name: text("서버 프레임워크", "Server framework"),
    textureKey: "tech-server-framework",
    assetKey: art("ch17.server-framework", "server-framework-specimen.png"),
    role: "future",
    paths: ["backend"],
  },
  dataPipeline: {
    id: "data-pipeline",
    name: text("데이터 파이프라인", "Data pipelines"),
    textureKey: "tech-data-pipeline",
    assetKey: art("ch18.data-pipeline", "data-pipeline-specimen.png"),
    role: "future",
    paths: ["data-engineer"],
  },
  orchestration: {
    id: "orchestration",
    name: text("워크플로 오케스트레이션", "Workflow orchestration"),
    textureKey: "tech-orchestration",
    assetKey: art("ch19.orchestration", "workflow-orchestration-specimen.png"),
    role: "future",
    paths: ["data-engineer"],
  },
  statistics: {
    id: "statistics",
    name: text("기초 통계", "Basic statistics"),
    textureKey: "tech-statistics",
    assetKey: art("ch20.statistics", "statistics-specimen.png"),
    role: "future",
    paths: ["data-analyst"],
  },
  visualization: {
    id: "visualization",
    name: text("데이터 시각화", "Data visualization"),
    textureKey: "tech-visualization",
    assetKey: art("ch21.visualization", "visualization-specimen.png"),
    role: "future",
    paths: ["data-analyst"],
  },
  biTools: {
    id: "bi-tools",
    name: text("BI 도구", "BI tools"),
    textureKey: "tech-bi-tools",
    assetKey: art("ch22.bi-tools", "bi-tools-specimen.png"),
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
