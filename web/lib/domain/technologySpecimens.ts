export interface TechnologySpecimen {
  id: string;
  name: string;
  textureKey: string;
  assetPath: string;
  role: "common" | "future";
}

export const TECHNOLOGY_SPECIMENS = {
  git: {
    id: "git",
    name: "Git",
    textureKey: "tech-git",
    assetPath: "/assets/technologies/git-specimen.png",
    role: "common",
  },
  linux: {
    id: "linux",
    name: "Linux",
    textureKey: "tech-linux",
    assetPath: "/assets/technologies/linux-specimen.png",
    role: "common",
  },
  docker: {
    id: "docker",
    name: "Docker",
    textureKey: "tech-docker",
    assetPath: "/assets/technologies/docker-specimen.png",
    role: "future",
  },
  cicd: {
    id: "cicd",
    name: "CI/CD",
    textureKey: "tech-cicd",
    assetPath: "/assets/technologies/cicd-specimen.png",
    role: "future",
  },
  kubernetes: {
    id: "kubernetes",
    name: "Kubernetes",
    textureKey: "tech-kubernetes",
    assetPath: "/assets/technologies/kubernetes-specimen.png",
    role: "future",
  },
} satisfies Record<string, TechnologySpecimen>;

export const FUTURE_TECHNOLOGY_SPECIMENS = Object.values(TECHNOLOGY_SPECIMENS).filter(
  (specimen) => specimen.role === "future"
);
