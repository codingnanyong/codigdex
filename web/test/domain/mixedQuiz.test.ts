import { describe, expect, it } from "vitest";
import type { FreeTextQuestion, MultipleChoiceQuestion, QuizQuestion } from "@codigdex/game-core/domain/chapters/types";
import { answerDamage, createBattleState, revealBattleHint, submitBattleAnswer } from "@codigdex/game-core/domain/dex/battle";
import { checkQuizAnswer, drawQuizQuestions, normalizeQuizAnswer } from "@codigdex/game-core/domain/dex/quiz";
import { same, text } from "@codigdex/game-core/i18n/locale";
import { createEmptySave, parseSave } from "@codigdex/game-core/save/schema";
import { applyBattleCapture } from "@codigdex/game-core/save/battleCapture";
import { createQuizPack } from "../../../packages/quiz-content/src/pack";
import { validateQuizPack } from "@codigdex/quiz-content/validation";
import { freeTextQuestion } from "../../../packages/quiz-content/src/sources/question";

const command = freeTextQuestion({
  prompt: ["작업 트리의 변경 상태를 확인하는 Git 명령어는?", "Which Git command shows working-tree changes?"],
  acceptedAnswers: ["git status", "git status --short"],
  hints: [
    ["현재 작업 트리를 살펴보는 명령입니다.", "Inspect the current working tree."],
    ["git 다음에 상태를 뜻하는 하위 명령을 적으세요.", "After git, use the subcommand named for the state."],
  ],
  explanation: ["git status는 작업 트리와 인덱스의 상태를 보여줍니다.", "git status reports the state of the working tree and index."],
});
const choice: MultipleChoiceQuestion = { prompt: same("2 + 2?"), choices: [same("1"), same("4"), same("3"), same("5")], answerIndex: 1 };

describe("offline mixed-question grading", () => {
  it("normalizes whitespace and case, preserving command punctuation and order", () => {
    expect(normalizeQuizAnswer("  GIT\t STATUS  --short \n")).toBe("git status --short");
    expect(checkQuizAnswer(command, " GIT   STATUS ")).toBe("correct");
    expect(checkQuizAnswer(command, "git status --short")).toBe("correct");
    expect(checkQuizAnswer(command, "status git")).toBe("incorrect");
    expect(checkQuizAnswer(command, "git status; rm")).toBe("incorrect");
    const punctuation = { ...command, acceptedAnswers: ["git log --oneline"] };
    expect(checkQuizAnswer(punctuation, "git log -oneline")).toBe("incorrect");
    expect(checkQuizAnswer(punctuation, "git log —oneline")).toBe("incorrect");
  });

  it("rejects blank text, wrong input kinds and out-of-range choice indices", () => {
    expect(checkQuizAnswer(command, " \t\n")).toBe("invalid");
    expect(checkQuizAnswer(command, 0)).toBe("invalid");
    for (const invalid of [-1, 4, 1.5, NaN, Infinity, "1"]) expect(checkQuizAnswer(choice, invalid)).toBe("invalid");
    expect(checkQuizAnswer(choice, 1)).toBe("correct");
    expect(checkQuizAnswer(choice, 0)).toBe("incorrect");
  });

  it("draws both types without losing text alternatives or changing the source", () => {
    const original = JSON.stringify([choice, command]);
    const drawn = drawQuizQuestions([choice, command], 2, () => 0);
    expect(drawn).toHaveLength(2);
    const free = drawn.find((question): question is FreeTextQuestion => question.type === "freeText")!;
    expect(checkQuizAnswer(free, "git status")).toBe("correct");
    const multiple = drawn.find((question): question is MultipleChoiceQuestion => question.type !== "freeText")!;
    expect(multiple.choices[multiple.answerIndex]).toEqual(same("4"));
    expect(JSON.stringify([choice, command])).toBe(original);
  });
});

describe("shared battle rules", () => {
  it("reveals two hints in order and reduces damage without reducing correctness", () => {
    let battle = createBattleState([command, command, command]);
    battle = revealBattleHint(battle, 0);
    expect(battle.hintsUsed).toBe(1);
    battle = revealBattleHint(battle, 0);
    expect(battle.hintsUsed).toBe(2);
    expect(revealBattleHint(battle, 0)).toBe(battle);
    battle = submitBattleAnswer(battle, 0, "git status");
    expect(battle).toMatchObject({ correctCount: 1, hintsUsed: 0, damage: 50, status: "active" });
    expect(battle.attempts[0]).toMatchObject({ hintsUsed: 2, damage: 50, correct: true });
    battle = revealBattleHint(battle, 1);
    battle = submitBattleAnswer(battle, 1, "git status");
    expect(battle).toMatchObject({ correctCount: 2, damage: 125, status: "passed" });
    expect([0, 1, 2].map((count) => answerDamage(true, count))).toEqual([100, 75, 50]);
    expect([0, 1, 2].map((count) => answerDamage(false, count))).toEqual([0, 0, 0]);
    expect(() => answerDamage(true, 3)).toThrow(RangeError);
  });

  it("does not consume empty answers, repeated submissions, stale hints or finished battles", () => {
    const initial = createBattleState([command, choice, command]);
    expect(submitBattleAnswer(initial, 0, " ")).toBe(initial);
    const next = submitBattleAnswer(initial, 0, "git status");
    expect(submitBattleAnswer(next, 0, "git status")).toBe(next);
    expect(revealBattleHint(next, 0)).toBe(next);
    expect(revealBattleHint(next, 1)).toBe(next); // This choice has no hints.
    const passed = submitBattleAnswer(next, 1, 1);
    expect(passed.status).toBe("passed");
    expect(submitBattleAnswer(passed, 2, "wrong")).toBe(passed);
    expect(revealBattleHint(passed, 2)).toBe(passed);
  });

  it("settles exactly at 60% and stops when success becomes impossible", () => {
    let success = createBattleState(Array.from({ length: 5 }, () => choice));
    for (const index of [0, 1, 2]) success = submitBattleAnswer(success, index, 1);
    expect(success).toMatchObject({ status: "passed", correctCount: 3, questionIndex: 3 });
    let failure = createBattleState(Array.from({ length: 5 }, () => choice));
    for (const index of [0, 1, 2]) failure = submitBattleAnswer(failure, index, 0);
    expect(failure).toMatchObject({ status: "failed", correctCount: 0, questionIndex: 3 });
    expect(createBattleState([choice]).status).toBe("active");
    expect(() => createBattleState([])).toThrow("at least one");
  });

  it("preserves captures, settings and first capture time across retries and save restoration", () => {
    const initial = createEmptySave("en");
    const active = createBattleState([command]);
    const failed = submitBattleAnswer(active, 0, "wrong");
    const passed = submitBattleAnswer(active, 0, "git status");
    expect(applyBattleCapture(initial, "test-bug", active)).toBe(initial);
    expect(applyBattleCapture(initial, "test-bug", failed)).toBe(initial);
    const captured = applyBattleCapture(initial, "test-bug", passed, () => "2026-10-20T01:00:00.000Z");
    expect(captured.progress.captures).toEqual([{ id: "test-bug", capturedAt: "2026-10-20T01:00:00.000Z" }]);
    expect(captured.player).toBe(initial.player);
    expect(captured.ui).toBe(initial.ui);
    expect(applyBattleCapture(captured, "test-bug", passed)).toBe(captured);
    expect(parseSave(JSON.stringify(captured))).toEqual(captured);
    expect(initial.progress.captures).toEqual([]);
  });
});

function mixedPack(free: FreeTextQuestion = command) {
  const source: QuizQuestion[] = Array.from({ length: 10 }, (_, index) => ({
    ...(index < 2 ? free : choice), prompt: text(`문제 ${index}`, `Question ${index}`),
  }));
  return createQuizPack({ id: "mixed.v1", version: 1, chapterId: "git", stageId: "mixed", difficulty: 1, questionCount: 10 }, source);
}

describe("mixed content validation", () => {
  it("supports a 20% free-text pool with bilingual hints and explanations", () => {
    expect(validateQuizPack(mixedPack())).toEqual([]);
  });

  it("rejects absent/blank translations, too many hints, normalized duplicates and empty answers", () => {
    const variants: FreeTextQuestion[] = [
      { ...command, hints: [text("방향", "")] },
      { ...command, explanation: text("설명", "") },
      { ...command, hints: [same("a"), same("b"), same("c")] },
      { ...command, acceptedAnswers: [] },
      { ...command, acceptedAnswers: [" "] },
      { ...command, acceptedAnswers: ["git status", " GIT   STATUS "] },
    ];
    for (const variant of variants) expect(validateQuizPack(mixedPack(variant)).length).toBeGreaterThan(0);
  });

  it("detects accepted answers in either hint language, including case and keyboard whitespace", () => {
    const invalid = mixedPack({ ...command, hints: [text("GIT   STATUS를 입력하세요.", "Enter `Git Status`.")] });
    expect(validateQuizPack(invalid).some((issue) => issue.includes("reveals an accepted answer"))).toBe(true);
    // Keyword fragments inside other words are not a leaked answer.
    expect(validateQuizPack(mixedPack({ ...command, acceptedAnswers: ["for"], hints: [same("before submitting")] }))).toEqual([]);
  });
});
