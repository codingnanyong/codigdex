import { GIT_CHAPTER } from "@codigdex/game-content/domain/chapters/git";
import { LINUX_CHAPTER } from "@codigdex/game-content/domain/chapters/linux";
import type { ChapterId } from "@codigdex/game-core/domain/chapters/types";
import { TECHNOLOGY_SPECIMENS } from "@codigdex/game-content/domain/technologySpecimens";
import { JOB_OPTIONS } from "@codigdex/game-content/domain/player/jobs";
import { same, text, type LocalizedText } from "@codigdex/game-core/i18n/locale";

export type PathNodeKind = "common" | "promotion" | "career";

export interface PathNode {
  id: string;
  x: number;
  y: number;
  label: LocalizedText;
  eyebrow: string;
  spriteKey?: string;
  kind: PathNodeKind;
  /** Set on chapter nodes, whose lock state comes from what the dex holds. */
  chapterId?: ChapterId;
}

export const COMMON_NODES: readonly PathNode[] = [
  { id: "git", chapterId: GIT_CHAPTER.id, x: 115, y: 272, label: same("Git"), eyebrow: GIT_CHAPTER.label, spriteKey: TECHNOLOGY_SPECIMENS.git.textureKey, kind: "common" },
  { id: "terminal", chapterId: LINUX_CHAPTER.id, x: 300, y: 272, label: text("터미널\nLinux", "Terminal\nLinux"), eyebrow: LINUX_CHAPTER.label, spriteKey: TECHNOLOGY_SPECIMENS.linux.textureKey, kind: "common" },
];

export const PROMOTION_NODE: PathNode = {
  id: "promotion",
  x: 490,
  y: 272,
  label: text("전직", "Promote"),
  eyebrow: "PATH SELECT",
  kind: "promotion",
};

export const CAREER_NODES: readonly PathNode[] = [
  { id: "frontend", x: 790, y: 132, label: text("웹 프론트엔드 개발자", "Web Frontend Developer"), eyebrow: "WEB", spriteKey: "career-frontend", kind: "career" },
  { id: "backend", x: 790, y: 202, label: text("백엔드 개발자", "Backend Developer"), eyebrow: "SERVER", spriteKey: "career-backend", kind: "career" },
  { id: "devops", x: 790, y: 272, label: text("DevOps 엔지니어", "DevOps Engineer"), eyebrow: "INFRA", spriteKey: "career-devops", kind: "career" },
  { id: "data-engineer", x: 790, y: 342, label: text("데이터 엔지니어", "Data Engineer"), eyebrow: "DATA", spriteKey: "career-data-engineer", kind: "career" },
  { id: "data-analyst", x: 790, y: 412, label: text("데이터 분석가", "Data Analyst"), eyebrow: "ANALYTICS", spriteKey: "career-data-analyst", kind: "career" },
];

export const ALL_NODES: readonly PathNode[] = [...COMMON_NODES, PROMOTION_NODE, ...CAREER_NODES];

export const CAREER_PORTRAITS = JOB_OPTIONS.map(({ textureKey, assetKey }) => ({
  textureKey,
  assetKey,
}));

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
