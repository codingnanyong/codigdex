import { describe, expect, it } from "vitest";
import { GIT_CHAPTER } from "@codigdex/game-content/domain/chapters/git";
import { LINUX_CHAPTER } from "@codigdex/game-content/domain/chapters/linux";
import { describeUnlock } from "@/lib/phaser/capture/unlockNotice";

describe("describeUnlock", () => {
  it("points at the next stage within a chapter", () => {
    const [first, second] = GIT_CHAPTER.stages;
    expect(describeUnlock(first.id, "ko")).toEqual({
      notice: `다음 단계 해금 · Lv.${second.level} ${second.name.ko}`,
      focusChapterId: "git",
    });
  });

  it("writes the notice in the player's language", () => {
    const [first, second] = GIT_CHAPTER.stages;
    expect(describeUnlock(first.id, "en").notice).toBe(`Next stage unlocked · Lv.${second.level} ${second.name.en}`);
    expect(describeUnlock(GIT_CHAPTER.stages.at(-1)!.id, "en").notice).toBe("Next chapter unlocked · CH.02 Linux");
  });

  it("points at the next chapter after a chapter's last stage", () => {
    expect(describeUnlock(GIT_CHAPTER.stages.at(-1)!.id, "ko").focusChapterId).toBe("linux");
  });

  it("sends the player to the job button once the common path is complete, since promotion is live", () => {
    const { notice, focusChapterId } = describeUnlock(LINUX_CHAPTER.stages.at(-1)!.id, "ko");
    expect(notice).toContain("직업 버튼에서 전직");
    expect(notice).not.toContain("업데이트");
    expect(focusChapterId).toBeUndefined();
  });
});
