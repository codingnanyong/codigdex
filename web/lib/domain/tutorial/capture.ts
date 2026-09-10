import { TUTORIAL_MONSTER, CapturedCard } from "./content";

export interface DexState {
  cards: CapturedCard[];
}

export const EMPTY_DEX_STATE: DexState = {
  cards: [],
};

export function isSuccessfulCapture(correct: number, total: number): boolean {
  return total > 0 && correct >= total;
}

export function applyCapture(
  state: DexState,
  now: () => string = () => new Date().toISOString()
): DexState {
  if (state.cards.some((card) => card.id === TUTORIAL_MONSTER.id)) {
    return state;
  }

  return {
    cards: [
      ...state.cards,
      {
        id: TUTORIAL_MONSTER.id,
        dexNumber: TUTORIAL_MONSTER.dexNumber,
        name: TUTORIAL_MONSTER.name,
        classification: TUTORIAL_MONSTER.classification,
        trait: TUTORIAL_MONSTER.trait,
        description: TUTORIAL_MONSTER.description,
        snippet: TUTORIAL_MONSTER.snippet,
        capturedAt: now(),
      },
    ],
  };
}
