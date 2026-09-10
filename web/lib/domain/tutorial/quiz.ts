import { QuizQuestion } from "./content";

type Rng = () => number;

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
export function drawQuizQuestions(
  pool: readonly QuizQuestion[],
  count: number,
  rng: Rng = Math.random
): QuizQuestion[] {
  return shuffle(pool, rng)
    .slice(0, Math.max(0, Math.min(count, pool.length)))
    .map((question) => {
      const answer = question.choices[question.answerIndex];
      const choices = shuffle(question.choices, rng);
      return { ...question, choices, answerIndex: choices.indexOf(answer) };
    });
}
