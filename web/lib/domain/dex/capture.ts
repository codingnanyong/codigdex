import type { CapturedCard, MonsterDefinition } from "../chapters/types";

export interface DexState {
  cards: CapturedCard[];
}

export const EMPTY_DEX_STATE: DexState = {
  cards: [],
};

export function isSuccessfulCapture(correct: number, total: number): boolean {
  return total > 0 && correct >= total;
}

export function capturedIds(state: DexState): Set<string> {
  return new Set(state.cards.map((card) => card.id));
}

/**
 * Registers `monster` in the dex. Capturing a monster that is already there
 * returns the same state object, so callers can tell a first capture from a
 * replay by identity.
 */
export function applyCapture(
  state: DexState,
  monster: MonsterDefinition,
  now: () => string = () => new Date().toISOString()
): DexState {
  if (state.cards.some((card) => card.id === monster.id)) {
    return state;
  }

  return {
    cards: [
      ...state.cards,
      {
        id: monster.id,
        dexNumber: monster.dexNumber,
        name: monster.name,
        classification: monster.classification,
        trait: monster.trait,
        description: monster.description,
        snippet: monster.snippet,
        capturedAt: now(),
      },
    ],
  };
}
