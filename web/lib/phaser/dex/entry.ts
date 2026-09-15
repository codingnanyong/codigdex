import { DEX_CATALOG } from "@codigdex/game-content/domain/dex/catalog";
import type { CapturedCard, MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";

/** One dex row: the monster, and its card if the player has captured it. */
export interface DexEntry {
  dexNumber: string;
  monster?: MonsterDefinition;
  card?: CapturedCard;
  planned: boolean;
}

export function buildDexEntries(cards: readonly CapturedCard[]): DexEntry[] {
  return DEX_CATALOG.map((slot) =>
    slot.kind === "released"
      ? {
          dexNumber: slot.dexNumber,
          monster: slot.monster,
          card: cards.find((card) => card.id === slot.monster.id),
          planned: false,
        }
      : { dexNumber: slot.dexNumber, planned: true }
  );
}

/** Only the selected captured entry blocks the first dex paint; the rest load on demand. */
export function initialDexMonsters(
  entries: readonly DexEntry[],
  selectedIndex: number
): MonsterDefinition[] {
  const selected = entries[selectedIndex];
  return selected?.monster && selected.card ? [selected.monster] : [];
}
