import { describe, expect, it } from "vitest";
import {
  CHAPTERS,
  DEX_MONSTERS,
  chapterStatus,
  isCommonPathComplete,
  stageStatus,
} from "@/lib/domain/chapters";
import { GIT_CHAPTER } from "@/lib/domain/chapters/git";
import { LINUX_CHAPTER } from "@/lib/domain/chapters/linux";
import { TUTORIAL_MONSTER } from "@/lib/domain/chapters/tutorial";
import type { MonsterDefinition } from "@/lib/domain/chapters/types";
import {
  EMPTY_DEX_STATE,
  applyCapture,
  capturedIds,
  isSuccessfulCapture,
} from "@/lib/domain/dex/capture";
import { drawQuizQuestions, quizCountForLevel } from "@/lib/domain/dex/quiz";

const drawBattle = (monster: MonsterDefinition) =>
  drawQuizQuestions(monster.quizPool, quizCountForLevel(monster.level));

describe("tutorial -> Git's five stages -> Linux", () => {
  it("walks every stage in order, each opening only once the last is captured", () => {
    let state = EMPTY_DEX_STATE;

    for (const chapter of CHAPTERS) {
      chapter.stages.forEach((monster, index) => {
        expect(stageStatus(chapter, index, capturedIds(state))).toBe("available");

        const questions = drawBattle(monster);
        expect(questions).toHaveLength(quizCountForLevel(monster.level));
        expect(isSuccessfulCapture(questions.length, questions.length)).toBe(true);
        state = applyCapture(state, monster);

        expect(stageStatus(chapter, index, capturedIds(state))).toBe("cleared");
      });
      expect(chapterStatus(chapter, capturedIds(state))).toBe("cleared");
    }

    expect(state.cards.map((card) => card.id)).toEqual(DEX_MONSTERS.map((monster) => monster.id));
    expect(isCommonPathComplete(capturedIds(state))).toBe(true);
  });

  it("holds the next Git stage, and Linux, locked after a botched battle", () => {
    const state = applyCapture(EMPTY_DEX_STATE, TUTORIAL_MONSTER);
    const questions = drawBattle(GIT_CHAPTER.stages[0]);

    // CaptureQuizScene only calls applyCapture when this is true, so a
    // single miss leaves the dex, and every lock downstream, untouched.
    expect(isSuccessfulCapture(questions.length - 1, questions.length)).toBe(false);
    expect(stageStatus(GIT_CHAPTER, 0, capturedIds(state))).toBe("available");
    expect(stageStatus(GIT_CHAPTER, 1, capturedIds(state))).toBe("locked");
    expect(chapterStatus(LINUX_CHAPTER, capturedIds(state))).toBe("locked");
  });
});
