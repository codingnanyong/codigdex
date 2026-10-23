import type { QuizQuestion } from "../chapters/types";
import { isSuccessfulCapture, shouldContinueBattle } from "./capture";
import { checkQuizAnswer, type QuizAnswer } from "./quiz";

export interface BattleAttempt {
  questionIndex: number;
  answer: QuizAnswer;
  correct: boolean;
  hintsUsed: number;
  damage: number;
}

export interface BattleState<Q extends QuizQuestion = QuizQuestion> {
  questions: readonly Q[];
  questionIndex: number;
  correctCount: number;
  hintsUsed: number;
  damage: number;
  attempts: readonly BattleAttempt[];
  status: "active" | "passed" | "failed";
}

/** Hints reduce attack strength, never the number of correct answers used by the 60% pass line. */
export function answerDamage(correct: boolean, hintsUsed: number): number {
  if (!Number.isInteger(hintsUsed) || hintsUsed < 0 || hintsUsed > 2) {
    throw new RangeError("A question allows zero, one or two hints");
  }
  return correct ? [100, 75, 50][hintsUsed] : 0;
}

export function createBattleState<Q extends QuizQuestion>(questions: readonly Q[]): BattleState<Q> {
  if (questions.length === 0) throw new Error("A battle needs at least one question");
  return {
    questions: [...questions],
    questionIndex: 0,
    correctCount: 0,
    hintsUsed: 0,
    damage: 0,
    attempts: [],
    status: "active",
  };
}

/** Passing the displayed index rejects a stale tap or a repeated keyboard submission. */
export function revealBattleHint<Q extends QuizQuestion>(state: BattleState<Q>, questionIndex: number): BattleState<Q> {
  if (state.status !== "active" || questionIndex !== state.questionIndex) return state;
  const available = Math.min(2, state.questions[questionIndex].hints?.length ?? 0);
  return state.hintsUsed < available ? { ...state, hintsUsed: state.hintsUsed + 1 } : state;
}

export function submitBattleAnswer<Q extends QuizQuestion>(
  state: BattleState<Q>,
  questionIndex: number,
  answer: QuizAnswer
): BattleState<Q> {
  if (state.status !== "active" || questionIndex !== state.questionIndex) return state;
  const result = checkQuizAnswer(state.questions[questionIndex], answer);
  if (result === "invalid") return state;
  const correct = result === "correct";
  const correctCount = state.correctCount + Number(correct);
  const nextIndex = questionIndex + 1;
  const damage = answerDamage(correct, state.hintsUsed);
  const total = state.questions.length;
  return {
    ...state,
    correctCount,
    questionIndex: nextIndex,
    hintsUsed: 0,
    damage: state.damage + damage,
    attempts: [...state.attempts, { questionIndex, answer, correct, hintsUsed: state.hintsUsed, damage }],
    status: shouldContinueBattle(correctCount, nextIndex, total)
      ? "active"
      : isSuccessfulCapture(correctCount, total) ? "passed" : "failed",
  };
}
