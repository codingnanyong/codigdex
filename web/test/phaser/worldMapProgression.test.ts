import { describe, expect, it } from "vitest";
import { GIT_CHAPTER } from "@codigdex/game-content/domain/chapters/git";
import { LINUX_CHAPTER } from "@codigdex/game-content/domain/chapters/linux";
import { TUTORIAL_MONSTER } from "@codigdex/game-content/domain/chapters/tutorial";
import {
  didUnlockPrimaryJobSelection,
  selectActiveChapter,
  selectWorldBackdrop,
  shouldEnterPrimaryJobSelection,
} from "@/lib/phaser/worldMap/progression";

const ids = (...groups: Array<{ id: string } | readonly { id: string }[]>) =>
  new Set(groups.flatMap((group) => (Array.isArray(group) ? group : [group])).map((item) => item.id));

describe("selectWorldBackdrop", () => {
  it("starts in the tutorial forest", () => {
    expect(selectWorldBackdrop(new Set()).textureKey).toBe("world-tutorial");
  });

  it("moves from Git to Linux as the common chapters are cleared", () => {
    expect(selectWorldBackdrop(ids(TUTORIAL_MONSTER)).textureKey).toBe("world-git");
    expect(selectWorldBackdrop(ids(TUTORIAL_MONSTER, GIT_CHAPTER.stages)).textureKey).toBe("world-linux");
  });

  it("uses the chosen career map after the common path", () => {
    const captured = ids(TUTORIAL_MONSTER, GIT_CHAPTER.stages, LINUX_CHAPTER.stages);
    expect(selectWorldBackdrop(captured, "devops").textureKey).toBe("world-career-devops-v3");
  });
});

describe("selectActiveChapter", () => {
  it("keeps a playable quest on the map until the common path is complete", () => {
    expect(selectActiveChapter(new Set())?.id).toBe("tutorial");
    expect(selectActiveChapter(ids(TUTORIAL_MONSTER))?.id).toBe("git");
    expect(selectActiveChapter(ids(TUTORIAL_MONSTER, GIT_CHAPTER.stages))?.id).toBe("linux");
    expect(selectActiveChapter(ids(TUTORIAL_MONSTER, GIT_CHAPTER.stages, LINUX_CHAPTER.stages))).toBeUndefined();
  });
});

describe("primary job selection transition", () => {
  const beforeCh02Clear = ids(
    TUTORIAL_MONSTER,
    GIT_CHAPTER.stages,
    LINUX_CHAPTER.stages.slice(0, -1)
  );
  const afterCh02Clear = ids(TUTORIAL_MONSTER, GIT_CHAPTER.stages, LINUX_CHAPTER.stages);

  it("opens the promotion screen when the last CH.02 capture completes the common path", () => {
    expect(didUnlockPrimaryJobSelection(beforeCh02Clear, afterCh02Clear)).toBe(true);
  });

  it("does not reopen the promotion screen when replaying an already completed capture", () => {
    expect(didUnlockPrimaryJobSelection(afterCh02Clear, afterCh02Clear)).toBe(false);
  });

  it("recovers a completed save that still has the junior job", () => {
    expect(shouldEnterPrimaryJobSelection(afterCh02Clear, "junior")).toBe(true);
    expect(shouldEnterPrimaryJobSelection(afterCh02Clear, "frontend")).toBe(false);
  });
});
