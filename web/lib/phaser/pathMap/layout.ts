import { GIT_CHAPTER } from "@/lib/domain/chapters/git";
import { LINUX_CHAPTER } from "@/lib/domain/chapters/linux";
import type { ChapterId } from "@/lib/domain/chapters/types";
import { TECHNOLOGY_SPECIMENS } from "@/lib/domain/technologySpecimens";

export type PathNodeKind = "common" | "promotion" | "career";

export interface PathNode {
  id: string;
  x: number;
  y: number;
  label: string;
  eyebrow: string;
  spriteKey?: string;
  kind: PathNodeKind;
  /** Set on chapter nodes, whose lock state comes from what the dex holds. */
  chapterId?: ChapterId;
}

export const COMMON_NODES: readonly PathNode[] = [
  { id: "git", chapterId: GIT_CHAPTER.id, x: 115, y: 272, label: "Git", eyebrow: GIT_CHAPTER.label, spriteKey: TECHNOLOGY_SPECIMENS.git.textureKey, kind: "common" },
  { id: "terminal", chapterId: LINUX_CHAPTER.id, x: 300, y: 272, label: "터미널\nLinux", eyebrow: LINUX_CHAPTER.label, spriteKey: TECHNOLOGY_SPECIMENS.linux.textureKey, kind: "common" },
];

export const PROMOTION_NODE: PathNode = {
  id: "promotion",
  x: 490,
  y: 272,
  label: "전직",
  eyebrow: "PATH SELECT",
  kind: "promotion",
};

export const CAREER_NODES: readonly PathNode[] = [
  { id: "frontend", x: 790, y: 132, label: "웹 프론트엔드 개발자", eyebrow: "WEB", spriteKey: "career-frontend", kind: "career" },
  { id: "backend", x: 790, y: 202, label: "백엔드 개발자", eyebrow: "SERVER", spriteKey: "career-backend", kind: "career" },
  { id: "devops", x: 790, y: 272, label: "DevOps 엔지니어", eyebrow: "INFRA", spriteKey: "career-devops", kind: "career" },
  { id: "data-engineer", x: 790, y: 342, label: "데이터 엔지니어", eyebrow: "DATA", spriteKey: "career-data-engineer", kind: "career" },
  { id: "data-analyst", x: 790, y: 412, label: "데이터 분석가", eyebrow: "ANALYTICS", spriteKey: "career-data-analyst", kind: "career" },
];

export const ALL_NODES: readonly PathNode[] = [...COMMON_NODES, PROMOTION_NODE, ...CAREER_NODES];

export const CAREER_PORTRAITS = [
  { textureKey: "career-frontend", assetPath: "/assets/careers/frontend-developer.png" },
  { textureKey: "career-backend", assetPath: "/assets/careers/backend-developer.png" },
  { textureKey: "career-devops", assetPath: "/assets/careers/devops-engineer.png" },
  { textureKey: "career-data-engineer", assetPath: "/assets/careers/data-engineer.png" },
  { textureKey: "career-data-analyst", assetPath: "/assets/careers/data-analyst.png" },
] as const;

export const COMMON_WIDTH = 164;
export const COMMON_HEIGHT = 86;
export const CAREER_WIDTH = 244;
export const CAREER_HEIGHT = 54;
export const PROMOTION_SIZE = 92;
/** Where the promotion line splits into one line per career. */
export const BRANCH_X = 620;

/**
 * Sprite box and text column inside a node. A specimen is not guaranteed to
 * be transparent out to its own edges, so the text column has to clear the
 * full sprite box — not just the medallion circle drawn behind it.
 */
export const SPRITE_BOX = { common: 46, career: 44 } as const;
export const SPRITE_GAP = 8;
