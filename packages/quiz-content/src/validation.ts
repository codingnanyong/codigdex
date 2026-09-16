import { quizCountForLevel } from "@codigdex/game-core/domain/dex/quiz";
import type { Locale } from "@codigdex/game-core/i18n/locale";
import type { QuizPack } from "./types";

const LOCALES: readonly Locale[] = ["ko", "en"];
const HANGUL = /[ㄱ-ㆎ가-힣]/;

/** A battle draws quizCountForLevel questions; the pool needs headroom so retries differ. */
const DRAW_HEADROOM = 3;

export function validateQuizPack(pack: QuizPack): string[] {
  const issues: string[] = [];
  const { descriptor, questions } = pack;
  const minimum = quizCountForLevel(descriptor.difficulty) + DRAW_HEADROOM;
  if (questions.length !== descriptor.questionCount) {
    issues.push(`${descriptor.id}: manifest says ${descriptor.questionCount}, loaded ${questions.length}`);
  }
  if (questions.length < minimum || questions.length > 100) {
    issues.push(`${descriptor.id}: expected ${minimum}..100 questions, loaded ${questions.length}`);
  }
  if (new Set(questions.map((question) => question.id)).size !== questions.length) {
    issues.push(`${descriptor.id}: duplicate question ids`);
  }
  for (const locale of LOCALES) {
    const prompts = questions.map((question) => question.prompt[locale].trim());
    if (prompts.some((prompt) => prompt.length === 0)) issues.push(`${descriptor.id}: blank ${locale} prompt`);
    if (new Set(prompts).size !== prompts.length) issues.push(`${descriptor.id}: duplicate ${locale} prompts`);
  }
  for (const question of questions) {
    if (question.choices.length !== 4) issues.push(`${question.id}: expected four choices`);
    if (question.answerIndex < 0 || question.answerIndex >= question.choices.length) {
      issues.push(`${question.id}: answer index is outside the choices`);
    }
    for (const choice of question.choices) {
      // A choice authored as one locale-neutral string shows the same text to
      // every player, so Korean in it would leak into the English quiz.
      if (choice.ko === choice.en && HANGUL.test(choice.en)) {
        issues.push(`${question.id}: untranslated choice "${choice.en}"`);
      }
    }
    if (question.prompt.ko === question.prompt.en && HANGUL.test(question.prompt.en)) {
      issues.push(`${question.id}: untranslated prompt`);
    }
    for (const locale of LOCALES) {
      const choices = question.choices.map((choice) => choice[locale].trim());
      if (choices.some((choice) => choice.length === 0)) issues.push(`${question.id}: blank ${locale} choice`);
      if (new Set(choices).size !== choices.length) issues.push(`${question.id}: duplicate ${locale} choices`);
    }
  }
  return issues;
}
