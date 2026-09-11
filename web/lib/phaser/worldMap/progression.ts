import { isChapterComplete } from "@/lib/domain/chapters";
import { GIT_CHAPTER } from "@/lib/domain/chapters/git";
import { LINUX_CHAPTER } from "@/lib/domain/chapters/linux";
import { TUTORIAL_CHAPTER } from "@/lib/domain/chapters/tutorial";
import type { AmbienceId, ChapterDefinition } from "@/lib/domain/chapters/types";
import { CAREER_PATHS } from "./careerPaths";
import type { JobId } from "@/lib/domain/player/jobs";

export interface WorldBackdrop {
  textureKey: string;
  assetPath: string;
  title: string;
  ambience?: AmbienceId;
}

const TUTORIAL_BACKDROP: WorldBackdrop = {
  textureKey: "world-tutorial",
  assetPath: "/assets/wallpapers/tutorial-loop-forest-v1.png",
  title: "튜토리얼 · 반복문의 숲",
  ambience: "loop-forest",
};

const GIT_BACKDROP: WorldBackdrop = {
  textureKey: "world-git",
  assetPath: "/assets/wallpapers/git-battle-arena-v1.png",
  title: "CH.01 · Git 기록의 들판",
  ambience: "git-field",
};

const LINUX_BACKDROP: WorldBackdrop = {
  textureKey: "world-linux",
  assetPath: "/assets/wallpapers/linux-battle-arena-v1.png",
  title: "CH.02 · Linux 셸 동굴",
  ambience: "linux-cave",
};

const CAREER_BACKDROPS: Record<JobId, WorldBackdrop> = CAREER_PATHS;

export const WORLD_BACKDROPS = [TUTORIAL_BACKDROP, GIT_BACKDROP, LINUX_BACKDROP, ...Object.values(CAREER_BACKDROPS)];

/** Chooses the waiting-screen painting from the player's actual progression. */
export function selectWorldBackdrop(captured: ReadonlySet<string>, careerId?: JobId): WorldBackdrop {
  if (!isChapterComplete(TUTORIAL_CHAPTER, captured)) return TUTORIAL_BACKDROP;
  if (!isChapterComplete(GIT_CHAPTER, captured)) return GIT_BACKDROP;
  if (!isChapterComplete(LINUX_CHAPTER, captured)) return LINUX_BACKDROP;
  return (careerId && CAREER_BACKDROPS[careerId]) || LINUX_BACKDROP;
}

/** The chapter whose next uncaptured monster should appear as the map quest. */
export function selectActiveChapter(captured: ReadonlySet<string>): ChapterDefinition | undefined {
  if (!isChapterComplete(TUTORIAL_CHAPTER, captured)) return TUTORIAL_CHAPTER;
  if (!isChapterComplete(GIT_CHAPTER, captured)) return GIT_CHAPTER;
  if (!isChapterComplete(LINUX_CHAPTER, captured)) return LINUX_CHAPTER;
  return undefined;
}
