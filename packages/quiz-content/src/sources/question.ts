import { same, text } from "@codigdex/game-core/i18n/locale";
import type { FreeTextQuestion, MultipleChoiceQuestion } from "@codigdex/game-core/domain/chapters/types";

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
): MultipleChoiceQuestion {
  return {
    type: "multipleChoice",
    prompt: text(...prompt),
    choices: choices.map((choice) => (typeof choice === "string" ? same(choice) : text(...choice))),
    answerIndex,
  };
}

/** Explicit alternatives are graded locally; no fuzzy or network-based interpretation. */
export function freeTextQuestion(options: {
  prompt: readonly [ko: string, en: string];
  acceptedAnswers: readonly string[];
  hints?: readonly (readonly [ko: string, en: string])[];
  explanation: readonly [ko: string, en: string];
}): FreeTextQuestion {
  return {
    type: "freeText",
    prompt: text(...options.prompt),
    acceptedAnswers: options.acceptedAnswers,
    normalization: "trim-collapse-case",
    hints: (options.hints ?? []).map((hint) => text(...hint)),
    explanation: text(...options.explanation),
  };
}
