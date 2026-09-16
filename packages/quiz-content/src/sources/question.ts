import { same, text } from "@codigdex/game-core/i18n/locale";
import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";

/** A choice is either code that reads the same in every language, or a [Korean, English] pair. */
export type ChoiceCopy = string | readonly [ko: string, en: string];

/**
 * Authors one bilingual packaged-content question compactly. Pools put the right answer first,
 * so `answerIndex` defaults to 0; drawQuizQuestions shuffles choices per draw.
 */
export function question(
  prompt: readonly [ko: string, en: string],
  choices: readonly ChoiceCopy[],
  answerIndex = 0
): QuizQuestion {
  return {
    prompt: text(...prompt),
    choices: choices.map((choice) => (typeof choice === "string" ? same(choice) : text(...choice))),
    answerIndex,
  };
}
