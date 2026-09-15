import { isChapterComplete, isCommonPathComplete } from "@codigdex/game-content/domain/chapters";
import { GIT_CHAPTER } from "@codigdex/game-content/domain/chapters/git";
import { LINUX_CHAPTER } from "@codigdex/game-content/domain/chapters/linux";
import { TUTORIAL_CHAPTER } from "@codigdex/game-content/domain/chapters/tutorial";
import type { AmbienceId, ChapterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { CAREER_PATHS } from "./careerPaths";
import type { JobId } from "@codigdex/game-content/domain/player/jobs";
import { text, type LocalizedText } from "@codigdex/game-core/i18n/locale";

export interface WorldBackdrop {
  textureKey: string;
  assetKey: string;
  title: LocalizedText;
  ambience?: AmbienceId;
}

const TUTORIAL_BACKDROP: WorldBackdrop = {
  textureKey: "world-tutorial",
  assetKey: "wallpapers/tutorial-loop-forest-v1.png",
  title: text("튜토리얼 · 반복문의 숲", "Tutorial · Loop Forest"),
  ambience: "loop-forest",
};

const GIT_BACKDROP: WorldBackdrop = {
  textureKey: "world-git",
  assetKey: "wallpapers/git-battle-arena-v1.png",
  title: text("CH.01 · Git 기록의 들판", "CH.01 · Git Field of Records"),
  ambience: "git-field",
};

const LINUX_BACKDROP: WorldBackdrop = {
  textureKey: "world-linux",
  assetKey: "wallpapers/linux-battle-arena-v1.png",
  title: text("CH.02 · Linux 셸 동굴", "CH.02 · Linux Shell Cave"),
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

/** True only for the capture that finishes CH.02 and unlocks the first promotion. */
export function didUnlockPrimaryJobSelection(
  before: ReadonlySet<string>,
  after: ReadonlySet<string>
): boolean {
  return !isCommonPathComplete(before) && isCommonPathComplete(after);
}

/** Recovers completed common-path saves that have not chosen a first job yet. */
export function shouldEnterPrimaryJobSelection(
  captured: ReadonlySet<string>,
  selectedJobId: string
): boolean {
  return selectedJobId === "junior" && isCommonPathComplete(captured);
}
