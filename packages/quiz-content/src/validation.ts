import { normalizeQuizAnswer, quizCountForLevel } from "@codigdex/game-core/domain/dex/quiz";
import type { Locale } from "@codigdex/game-core/i18n/locale";
import type { QuizPack } from "./types";

const LOCALES: readonly Locale[] = ["ko", "en"];
const HANGUL = /[ㄱ-ㆎ가-힣]/;

/** A battle draws quizCountForLevel questions; the pool needs headroom so retries differ. */
const DRAW_HEADROOM = 3;

function containsAnswer(hint: string, answer: string): boolean {
  const normalized = normalizeQuizAnswer(answer);
  if (!normalized) return false;
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // Avoid reporting 'for' inside 'before', but catch quoted commands and punctuation.
  return new RegExp(`(?<![a-z0-9_])${escaped}(?![a-z0-9_])`, "u")
    .test(normalizeQuizAnswer(hint));
}

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
    const questionId = question.id;
    if (question.prompt.ko === question.prompt.en && HANGUL.test(question.prompt.en)) {
      issues.push(`${question.id}: untranslated prompt`);
    }
    const needsExplanation = question.type === "freeText" || question.hints !== undefined;
    const hints = question.hints ?? [];
    if (!Array.isArray(hints) || hints.length > 2) issues.push(`${question.id}: expected zero to two hints`);
    const accepted = question.type === "freeText"
      ? question.acceptedAnswers
      : [question.choices[question.answerIndex]?.ko ?? "", question.choices[question.answerIndex]?.en ?? ""];
    if (question.type !== undefined && question.type !== "multipleChoice" && question.type !== "freeText") {
      issues.push(`${question.id}: unsupported question type`);
    }
    for (const locale of LOCALES) {
      if (needsExplanation && !question.explanation?.[locale]?.trim()) {
        issues.push(`${question.id}: missing ${locale} explanation`);
      }
      if (Array.isArray(hints)) {
        for (const [index, hint] of hints.entries()) {
          if (!hint?.[locale]?.trim()) issues.push(`${question.id}: blank ${locale} hint ${index + 1}`);
          else if (accepted.some((answer) => containsAnswer(hint[locale], answer))) {
            issues.push(`${question.id}: ${locale} hint ${index + 1} reveals an accepted answer`);
          }
          if (hint?.ko === hint?.en && HANGUL.test(hint?.en ?? "")) {
            issues.push(`${question.id}: untranslated hint ${index + 1}`);
          }
        }
      }
    }
    if (needsExplanation && question.explanation?.ko === question.explanation?.en && HANGUL.test(question.explanation?.en ?? "")) {
      issues.push(`${question.id}: untranslated explanation`);
    }
    if (question.type === "freeText") {
      if (question.normalization !== "trim-collapse-case") issues.push(`${questionId}: unsupported normalization policy`);
      if (!Array.isArray(question.hints)) issues.push(`${question.id}: free text requires a hints array`);
      const answers = question.acceptedAnswers.map(normalizeQuizAnswer);
      if (answers.length === 0 || answers.some((answer) => !answer)) issues.push(`${question.id}: blank accepted answers`);
      if (new Set(answers).size !== answers.length) issues.push(`${question.id}: duplicate normalized answers`);
      if (question.choices !== undefined || question.answerIndex !== undefined) issues.push(`${questionId}: free text cannot define choices`);
      continue;
    }
    if (question.choices.length !== 4) issues.push(`${question.id}: expected four choices`);
    if (!Number.isInteger(question.answerIndex) || question.answerIndex < 0 || question.answerIndex >= question.choices.length) {
      issues.push(`${question.id}: answer index is outside the choices`);
    }
    if (question.acceptedAnswers !== undefined || question.normalization !== undefined) issues.push(`${questionId}: choice question cannot define text answers`);
    for (const choice of question.choices) {
      // A choice authored as one locale-neutral string shows the same text to
      // every player, so Korean in it would leak into the English quiz.
      if (choice.ko === choice.en && HANGUL.test(choice.en)) {
        issues.push(`${question.id}: untranslated choice "${choice.en}"`);
      }
    }
    for (const locale of LOCALES) {
      const choices = question.choices.map((choice) => choice[locale].trim());
      if (choices.some((choice) => choice.length === 0)) issues.push(`${question.id}: blank ${locale} choice`);
      if (new Set(choices).size !== choices.length) issues.push(`${question.id}: duplicate ${locale} choices`);
    }
  }
  return issues;
}
