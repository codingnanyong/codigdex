import { describe, expect, it } from "vitest";
import { TUTORIAL_MONSTER } from "@/lib/domain/chapters/tutorial";
import { drawQuizQuestions, quizCountForLevel } from "@/lib/domain/dex/quiz";

const POOL = TUTORIAL_MONSTER.quizPool;
const BATTLE_COUNT = quizCountForLevel(TUTORIAL_MONSTER.level);

/** Deterministic stand-in for Math.random, cycling through fixed values. */
function seededRng(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("quizCountForLevel", () => {
  it("asks three questions at level 1", () => {
    expect(quizCountForLevel(1)).toBe(3);
  });

  it("adds a question per level", () => {
    expect(quizCountForLevel(2)).toBe(4);
    expect(quizCountForLevel(5)).toBe(7);
  });

  it("never drops below one question", () => {
    expect(quizCountForLevel(0)).toBe(2);
    expect(quizCountForLevel(-10)).toBe(1);
  });
});

describe("drawQuizQuestions", () => {
  it("draws the requested number of questions", () => {
    expect(drawQuizQuestions(POOL, BATTLE_COUNT)).toHaveLength(BATTLE_COUNT);
  });

  it("never repeats a question within one battle", () => {
    const prompts = drawQuizQuestions(POOL, BATTLE_COUNT).map((q) => q.prompt);
    expect(new Set(prompts).size).toBe(prompts.length);
  });

  it("keeps answerIndex pointing at the right choice after shuffling", () => {
    const original = new Map(POOL.map((q) => [q.prompt, q.choices[q.answerIndex]]));

    for (const question of drawQuizQuestions(POOL, POOL.length)) {
      expect(question.choices[question.answerIndex]).toBe(original.get(question.prompt));
      expect([...question.choices].sort()).toEqual(
        [...POOL.find((q) => q.prompt === question.prompt)!.choices].sort()
      );
    }
  });

  it("keeps every choice, duplicates included, and still lands on the answer", () => {
    const pool = [{ prompt: "같은 보기가 두 번 나오면?", choices: ["1", "1", "2", "3"], answerIndex: 3 }];

    for (let attempt = 0; attempt < 20; attempt++) {
      const [question] = drawQuizQuestions(pool, 1);
      expect(question.choices[question.answerIndex]).toBe("3");
      expect([...question.choices].sort()).toEqual(["1", "1", "2", "3"]);
    }
  });

  it("caps the draw at the pool size", () => {
    expect(drawQuizQuestions(POOL, POOL.length + 5)).toHaveLength(POOL.length);
  });

  it("returns nothing for a non-positive count", () => {
    expect(drawQuizQuestions(POOL, 0)).toEqual([]);
    expect(drawQuizQuestions(POOL, -3)).toEqual([]);
  });

  it("varies the draw with the random source", () => {
    const low = drawQuizQuestions(POOL, BATTLE_COUNT, seededRng([0])).map((q) => q.prompt);
    const high = drawQuizQuestions(POOL, BATTLE_COUNT, seededRng([0.99])).map((q) => q.prompt);

    expect(low).not.toEqual(high);
  });
});
