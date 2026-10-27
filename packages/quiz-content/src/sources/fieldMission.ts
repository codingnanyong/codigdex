import { text } from "@codigdex/game-core/i18n/locale";
import type { QuizQuestion } from "@codigdex/game-core/domain/chapters/types";

type Copy = readonly [ko: string, en: string];
type Scenario = readonly [ko: string, en: string, answer: number];
/** Authored situations share an action vocabulary; answer positions vary before battle shuffling. */
export function fieldMission(actions: readonly Copy[], scenarios: readonly Scenario[]): readonly QuizQuestion[] {
  return scenarios.map(([ko, en, answer], index) => {
    const alternatives = actions.filter((_, i) => i !== answer);
    const choices = [actions[answer], ...Array.from({ length: 3 }, (_, i) => alternatives[(index + i) % alternatives.length])];
    const answerIndex = index % 4;
    choices.unshift(...choices.splice(choices.length - answerIndex, answerIndex));
    return { prompt: text(ko, en), choices: choices.map(([a, b]) => text(a, b)), answerIndex };
  });
}
