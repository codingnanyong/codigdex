import { CH01_MASTER_BADGE_ID, CH01_MONSTER, CapturedCard, CardGrade } from "./content";

export interface DexState {
  cards: CapturedCard[];
  exp: number;
  coins: number;
  badges: string[];
}

export const EMPTY_DEX_STATE: DexState = {
  cards: [],
  exp: 0,
  coins: 0,
  badges: [],
};

export interface CaptureResult {
  state: DexState;
  earnedBadge: boolean;
}

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
): CaptureResult {
  const cards = [...state.cards];
  const existingIndex = cards.findIndex((card) => card.id === CH01_MONSTER.id);

  if (existingIndex === -1) {
    cards.push({
      id: CH01_MONSTER.id,
      name: CH01_MONSTER.name,
      grade,
      description: CH01_MONSTER.description,
      snippet: CH01_MONSTER.snippet,
      capturedAt: now(),
    });
  } else if (gradeRank(grade) > gradeRank(cards[existingIndex].grade)) {
    cards[existingIndex] = { ...cards[existingIndex], grade };
  }

  const exp = state.exp + CH01_MONSTER.rewards.exp;
  const coins = state.coins + CH01_MONSTER.rewards.coins;

  const allGold = cards.length > 0 && cards.every((card) => card.grade === "gold");
  const badges = [...state.badges];
  let earnedBadge = false;
  if (allGold && !badges.includes(CH01_MASTER_BADGE_ID)) {
    badges.push(CH01_MASTER_BADGE_ID);
    earnedBadge = true;
  }

  return { state: { cards, exp, coins, badges }, earnedBadge };
}
