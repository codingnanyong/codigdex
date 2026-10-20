import type { MultipleChoiceQuestion, QuizQuestion } from "../chapters/types";

type Rng = () => number;

export function isMultipleChoiceQuestion<Q extends QuizQuestion>(
  question: Q
): question is Q & MultipleChoiceQuestion {
  return question.type !== "freeText";
}

/** Preserve punctuation, argument order and Unicode text while accepting keyboard whitespace/case. */
export function normalizeQuizAnswer(answer: string): string {
  return answer.normalize("NFC").trim().replace(/\s+/gu, " ").toLowerCase();
}

export type QuizAnswer = string | number;
export type QuizAnswerResult = "correct" | "incorrect" | "invalid";

/** Invalid input is not an attempt: in particular, blank text must never advance a battle. */
export function checkQuizAnswer(question: QuizQuestion, answer: QuizAnswer): QuizAnswerResult {
  if (question.type === "freeText") {
    if (typeof answer !== "string") return "invalid";
    const normalized = normalizeQuizAnswer(answer);
    if (!normalized) return "invalid";
    return question.acceptedAnswers.some((accepted) => normalizeQuizAnswer(accepted) === normalized)
      ? "correct"
      : "incorrect";
  }
  if (typeof answer !== "number" || !Number.isInteger(answer) || answer < 0 || answer >= question.choices.length) {
    return "invalid";
  }
  return answer === question.answerIndex ? "correct" : "incorrect";
}

export function quizExpectedAnswers(question: QuizQuestion): readonly string[] | MultipleChoiceQuestion["choices"] {
  return question.type === "freeText" ? question.acceptedAnswers : [question.choices[question.answerIndex]];
}

/** Stable convention shared by monster metadata and the quiz-content manifest. */
export function quizPackIdFor(chapterId: string, monsterId: string, version = 1): string {
  return `${chapterId}.${monsterId}.v${version}`;
}

/** Lv.1 asks 3 questions and each level adds one more. */
export function quizCountForLevel(level: number): number {
  return Math.max(1, Math.floor(level) + 2);
}

function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Draws one battle's worth of questions: a random subset of the pool, each
 * with its choices shuffled, so a retry never replays the same quiz in the
 * same order. Asks for more than the pool holds and you just get the pool.
 */
export function drawQuizQuestions<Q extends {
  type?: "multipleChoice" | "freeText";
  choices?: readonly unknown[];
  answerIndex?: number;
}>(
  pool: readonly Q[],
  count: number,
  rng: Rng = Math.random
): Q[] {
  return shuffle(pool, rng)
    .slice(0, Math.max(0, Math.min(count, pool.length)))
    .map((question) => {
      if (question.type === "freeText") return { ...question };
      if (!question.choices || typeof question.answerIndex !== "number" || !Number.isInteger(question.answerIndex)) {
        throw new Error("A multiple-choice question needs choices and an answer index");
      }
      const choices = question.choices;
      // Shuffle positions rather than the choice strings, so the answer is
      // still tracked correctly even if a question ever repeats a choice.
      const order = shuffle(
        question.choices.map((_, index) => index),
        rng
      );
      return {
        ...question,
        choices: order.map((index) => choices[index]),
        answerIndex: order.indexOf(question.answerIndex),
      };
    });
}

/** Keep both input types in short battles, with a text prompt before an early capture can end the round. */
export function drawMixedQuizQuestions<Q extends QuizQuestion>(
  pool: readonly Q[], count: number, rng: Rng = Math.random
): Q[] {
  const size = Math.max(0, Math.min(Math.floor(count), pool.length));
  if (!size) return [];
  const textPool = pool.filter((question) => question.type === "freeText");
  const choicePool = pool.filter(isMultipleChoiceQuestion);
  if (!textPool.length || !choicePool.length) return drawQuizQuestions(pool, size, rng);
  const textCount = Math.min(textPool.length, Math.max(size - choicePool.length,
    Math.min(size > 1 ? size - 1 : 1, Math.max(1, Math.round(size * textPool.length / pool.length)))));
  const texts = drawQuizQuestions(textPool, textCount, rng);
  const choices: Q[] = drawQuizQuestions(choicePool, size - textCount, rng);
  const result: Q[] = [];
  while (choices.length || texts.length) {
    if (choices.length) result.push(choices.shift()!);
    if (texts.length) result.push(texts.shift()!);
    if (choices.length) result.push(choices.shift()!);
  }
  return result;
}
