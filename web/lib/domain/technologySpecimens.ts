export interface TechnologySpecimen {
  id: string;
  name: string;
  textureKey: string;
  assetPath: string;
  role: "common" | "future";
  paths: Array<"common" | "frontend" | "backend" | "devops" | "data-engineer" | "data-analyst">;
}

export const TECHNOLOGY_SPECIMENS = {
  git: {
    id: "git",
    name: "Git",
    textureKey: "tech-git",
    assetPath: "/assets/technologies/git-specimen.png",
    role: "common",
    paths: ["common"],
  },
  linux: {
    id: "linux",
    name: "Linux",
    textureKey: "tech-linux",
    assetPath: "/assets/technologies/linux-specimen.png",
    role: "common",
    paths: ["common"],
  },
  docker: {
    id: "docker",
    name: "Docker",
    textureKey: "tech-docker",
    assetPath: "/assets/technologies/docker-specimen.png",
    role: "future",
    paths: ["backend", "devops", "data-engineer"],
  },
  cicd: {
    id: "cicd",
    name: "CI/CD",
    textureKey: "tech-cicd",
    assetPath: "/assets/technologies/cicd-specimen.png",
    role: "future",
    paths: ["frontend", "backend", "devops"],
  },
  kubernetes: {
    id: "kubernetes",
    name: "Kubernetes",
    textureKey: "tech-kubernetes",
    assetPath: "/assets/technologies/kubernetes-specimen.png",
    role: "future",
    paths: ["backend", "devops", "data-engineer"],
  },
  htmlCss: {
    id: "html-css",
    name: "HTML/CSS",
    textureKey: "tech-html-css",
    assetPath: "/assets/technologies/html-css-specimen.png",
    role: "future",
    paths: ["frontend"],
  },
  javascript: {
    id: "javascript",
    name: "JavaScript",
    textureKey: "tech-javascript",
    assetPath: "/assets/technologies/javascript-specimen.png",
    role: "future",
    paths: ["frontend"],
  },
  httpApi: {
    id: "http-api",
    name: "HTTP/API",
    textureKey: "tech-http-api",
    assetPath: "/assets/technologies/http-api-specimen.png",
    role: "future",
    paths: ["frontend", "backend"],
  },
  sql: {
    id: "sql",
    name: "SQL",
    textureKey: "tech-sql",
    assetPath: "/assets/technologies/sql-specimen.png",
    role: "future",
    paths: ["backend", "data-engineer", "data-analyst"],
  },
  python: {
    id: "python",
    name: "Python",
    textureKey: "tech-python",
    assetPath: "/assets/technologies/python-specimen.png",
    role: "future",
    paths: ["backend", "data-engineer", "data-analyst"],
  },
  network: {
    id: "network",
    name: "네트워크",
    textureKey: "tech-network",
    assetPath: "/assets/technologies/network-specimen.png",
    role: "future",
    paths: ["backend", "devops"],
  },
  testing: {
    id: "testing",
    name: "테스트",
    textureKey: "tech-testing",
    assetPath: "/assets/technologies/testing-specimen.png",
    role: "future",
    paths: ["frontend", "backend", "devops"],
  },
  securityAuth: {
    id: "security-auth",
    name: "보안/인증",
    textureKey: "tech-security-auth",
    assetPath: "/assets/technologies/security-auth-specimen.png",
    role: "future",
    paths: ["backend", "devops"],
  },
  cloudIac: {
    id: "cloud-iac",
    name: "Cloud/IaC",
    textureKey: "tech-cloud-iac",
    assetPath: "/assets/technologies/cloud-iac-specimen.png",
    role: "future",
    paths: ["backend", "devops", "data-engineer"],
  },
  monitoring: {
    id: "monitoring",
    name: "모니터링",
    textureKey: "tech-monitoring",
    assetPath: "/assets/technologies/monitoring-specimen.png",
    role: "future",
    paths: ["backend", "devops", "data-engineer"],
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
