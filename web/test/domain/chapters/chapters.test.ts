import { describe, expect, it } from "vitest";
import {
  CHAPTERS,
  DEX_MONSTERS,
  chapterStatus,
  chapterTitle,
  currentStageIndex,
  findStage,
  getChapter,
  isChapterComplete,
  isCommonPathComplete,
  stageStatus,
  unlockAfter,
} from "@/lib/domain/chapters";
import { GIT_CHAPTER } from "@/lib/domain/chapters/git";
import { LINUX_CHAPTER } from "@/lib/domain/chapters/linux";
import { TUTORIAL_CHAPTER, TUTORIAL_MONSTER } from "@/lib/domain/chapters/tutorial";
import type { ChapterId, MonsterDefinition } from "@/lib/domain/chapters/types";
import { quizCountForLevel } from "@/lib/domain/dex/quiz";

const GIT = GIT_CHAPTER.stages;
const LINUX = LINUX_CHAPTER.stages;
const capturedOf = (...monsters: readonly MonsterDefinition[]) =>
  new Set(monsters.map((monster) => monster.id));

describe("stageStatus", () => {
  it("opens only the tutorial on a fresh dex", () => {
    const none = capturedOf();
    expect(stageStatus(TUTORIAL_CHAPTER, 0, none)).toBe("available");
    expect(stageStatus(GIT_CHAPTER, 0, none)).toBe("locked");
    expect(stageStatus(LINUX_CHAPTER, 0, none)).toBe("locked");
  });

  it("opens Git's first stage, and only that one, once the tutorial is captured", () => {
    const captured = capturedOf(TUTORIAL_MONSTER);
    expect(stageStatus(GIT_CHAPTER, 0, captured)).toBe("available");
    expect(stageStatus(GIT_CHAPTER, 1, captured)).toBe("locked");
  });

  it("opens each Git stage only after the one before it", () => {
    const captured = capturedOf(TUTORIAL_MONSTER, GIT[0], GIT[1]);
    expect(GIT.map((_, index) => stageStatus(GIT_CHAPTER, index, captured))).toEqual([
      "cleared",
      "cleared",
      "available",
      "locked",
      "locked",
    ]);
  });

  it("keeps Linux locked until every Git stage is captured", () => {
    expect(stageStatus(LINUX_CHAPTER, 0, capturedOf(TUTORIAL_MONSTER, ...GIT.slice(0, -1)))).toBe("locked");
    expect(stageStatus(LINUX_CHAPTER, 0, capturedOf(TUTORIAL_MONSTER, ...GIT))).toBe("available");
  });
});

describe("chapterStatus", () => {
  it("reads locked, then available part-way, then cleared", () => {
    expect(chapterStatus(GIT_CHAPTER, capturedOf())).toBe("locked");
    expect(chapterStatus(GIT_CHAPTER, capturedOf(TUTORIAL_MONSTER, GIT[0]))).toBe("available");
    expect(chapterStatus(GIT_CHAPTER, capturedOf(TUTORIAL_MONSTER, ...GIT))).toBe("cleared");
  });

  it("counts a chapter complete only when all of its stages are captured", () => {
    expect(isChapterComplete(GIT_CHAPTER, capturedOf(...GIT.slice(1)))).toBe(false);
    expect(isChapterComplete(GIT_CHAPTER, capturedOf(...GIT))).toBe(true);
  });
});

describe("currentStageIndex", () => {
  it("points at the first stage not yet captured", () => {
    expect(currentStageIndex(GIT_CHAPTER, capturedOf(TUTORIAL_MONSTER))).toBe(0);
    expect(currentStageIndex(GIT_CHAPTER, capturedOf(TUTORIAL_MONSTER, GIT[0], GIT[1]))).toBe(2);
  });

  it("rests on the last stage once every stage is captured", () => {
    expect(currentStageIndex(GIT_CHAPTER, capturedOf(...GIT))).toBe(GIT.length - 1);
  });
});

describe("unlockAfter", () => {
  it("opens the next stage inside a chapter", () => {
    expect(unlockAfter(GIT[0].id)).toEqual({ kind: "stage", chapter: GIT_CHAPTER, monster: GIT[1] });
  });

  it("opens the next chapter after a chapter's final stage", () => {
    expect(unlockAfter(TUTORIAL_MONSTER.id)).toEqual({ kind: "chapter", chapter: GIT_CHAPTER });
    expect(unlockAfter(GIT[GIT.length - 1].id)).toEqual({ kind: "chapter", chapter: LINUX_CHAPTER });
  });

  it("completes the common path after Linux's final stage", () => {
    expect(unlockAfter(LINUX[LINUX.length - 1].id)).toEqual({ kind: "common-path-complete" });
  });
});

describe("isCommonPathComplete", () => {
  it("needs every Git stage and every Linux stage", () => {
    expect(isCommonPathComplete(capturedOf(TUTORIAL_MONSTER, ...GIT))).toBe(false);
    expect(isCommonPathComplete(capturedOf(TUTORIAL_MONSTER, ...GIT, ...LINUX))).toBe(true);
  });
});

describe("lookup", () => {
  it("plays the tutorial, then Git, then Linux", () => {
    expect(CHAPTERS.map((chapter) => chapter.id)).toEqual(["tutorial", "git", "linux"]);
  });

  it("chains each chapter's requirement to the chapter before it", () => {
    CHAPTERS.forEach((chapter, index) => {
      expect(chapter.requires).toBe(index === 0 ? undefined : CHAPTERS[index - 1].id);
    });
  });

  it("finds a stage's chapter and position from its monster id", () => {
    expect(findStage(GIT[2].id)).toEqual({ chapter: GIT_CHAPTER, monster: GIT[2], index: 2 });
  });

  it("throws for ids it does not know", () => {
    expect(() => getChapter("docker" as ChapterId)).toThrow("Unknown chapter");
    expect(() => findStage("docker-whale")).toThrow("Unknown monster");
  });

  it("titles a chapter by name and place", () => {
    expect(chapterTitle(TUTORIAL_CHAPTER)).toBe("튜토리얼 · 반복문의 숲");
  });
});

describe("dex entries", () => {
  it("numbers every monster 001, 002, ... in play order", () => {
    expect(DEX_MONSTERS.map((monster) => monster.dexNumber)).toEqual(
      DEX_MONSTERS.map((_, index) => String(index + 1).padStart(3, "0"))
    );
    expect(DEX_MONSTERS).toEqual(CHAPTERS.flatMap((chapter) => chapter.stages));
    expect(new Set(DEX_MONSTERS.map((monster) => monster.id)).size).toBe(DEX_MONSTERS.length);
  });

  it("holds the tutorial plus five Git and five Linux stages", () => {
    expect(CHAPTERS.map((chapter) => chapter.stages.length)).toEqual([1, 5, 5]);
  });

  it("gives every stage its own battle sprite", () => {
    const sprites = DEX_MONSTERS.map((monster) => monster.assetPath);
    expect(new Set(sprites).size).toBe(sprites.length);
  });
});

describe.each(CHAPTERS.map((chapter) => [chapter.id, chapter] as const))("%s chapter", (_id, chapter) => {
  it("climbs one level per stage from Lv.1, asking one more question each time", () => {
    const levels = chapter.stages.map((monster) => monster.level);
    expect(levels).toEqual(levels.map((_, index) => index + 1));
    expect(chapter.stages.map((monster) => quizCountForLevel(monster.level))).toEqual(
      levels.map((_, index) => index + 3)
    );
  });

  it("never repeats a prompt across its stages", () => {
    const prompts = chapter.stages.flatMap((monster) => monster.quizPool.map((question) => question.prompt));
    expect(new Set(prompts).size).toBe(prompts.length);
  });
});

describe.each(
  CHAPTERS.flatMap((chapter) => chapter.stages.map((monster) => [`${chapter.id} / ${monster.name}`, monster] as const))
)("%s quiz pool", (_label, monster) => {
  const pool = monster.quizPool;

  it("holds about twenty questions, well beyond one battle's draw", () => {
    expect(pool.length).toBeGreaterThanOrEqual(20);
    expect(pool.length).toBeGreaterThan(quizCountForLevel(monster.level));
  });

  it("gives every question four distinct choices with the answer among them", () => {
    for (const question of pool) {
      expect(question.choices).toHaveLength(4);
      expect(new Set(question.choices).size).toBe(4);
      expect(question.choices[question.answerIndex]).toBeDefined();
    }
  });
});
