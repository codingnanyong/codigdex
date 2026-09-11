import { describe, expect, it } from "vitest";
import { GIT_CHAPTER } from "@/lib/domain/chapters/git";
import { LINUX_CHAPTER } from "@/lib/domain/chapters/linux";
import { TUTORIAL_MONSTER } from "@/lib/domain/chapters/tutorial";
import { selectActiveChapter, selectWorldBackdrop } from "@/lib/phaser/worldMap/progression";

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
    expect(selectWorldBackdrop(captured, "devops").textureKey).toBe("world-career-devops");
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
