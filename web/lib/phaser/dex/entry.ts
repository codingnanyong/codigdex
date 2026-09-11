import { DEX_MONSTERS } from "@/lib/domain/chapters";
import type { CapturedCard, MonsterDefinition } from "@/lib/domain/chapters/types";

/** One dex row: the monster, and its card if the player has captured it. */
export interface DexEntry {
  monster: MonsterDefinition;
  card?: CapturedCard;
}

export function buildDexEntries(cards: readonly CapturedCard[]): DexEntry[] {
  return DEX_MONSTERS.map((monster) => ({
    monster,
    card: cards.find((card) => card.id === monster.id),
  }));
}
