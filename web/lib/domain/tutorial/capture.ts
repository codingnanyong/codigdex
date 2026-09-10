import { TUTORIAL_MONSTER, CapturedCard, CardGrade } from "./content";

export interface DexState {
  cards: CapturedCard[];
}

export const EMPTY_DEX_STATE: DexState = {
  cards: [],
};

export function gradeFromScore(correct: number, total: number): CardGrade {
  if (total > 0 && correct >= total) return "gold";
  if (correct > 0) return "silver";
  return "bronze";
}

export function gradeRank(grade: CardGrade): number {
  return grade === "gold" ? 2 : grade === "silver" ? 1 : 0;
}

export function applyCapture(
  state: DexState,
  grade: CardGrade,
  now: () => string = () => new Date().toISOString()
): DexState {
  const cards = [...state.cards];
  const existingIndex = cards.findIndex((card) => card.id === TUTORIAL_MONSTER.id);

  if (existingIndex === -1) {
    cards.push({
      id: TUTORIAL_MONSTER.id,
      dexNumber: TUTORIAL_MONSTER.dexNumber,
      name: TUTORIAL_MONSTER.name,
      grade,
      classification: TUTORIAL_MONSTER.classification,
      trait: TUTORIAL_MONSTER.trait,
      description: TUTORIAL_MONSTER.description,
      snippet: TUTORIAL_MONSTER.snippet,
      capturedAt: now(),
    });
  } else if (gradeRank(grade) > gradeRank(cards[existingIndex].grade)) {
    cards[existingIndex] = { ...cards[existingIndex], grade };
  }

  return { cards };
}
