import { DEX_CATALOG } from "@codigdex/game-content/domain/dex/catalog";
import type { CapturedCard, MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";

/** One dex row: the monster, and its card if the player has captured it. */
export interface DexEntry {
  dexNumber: string;
  monster?: MonsterDefinition;
  card?: CapturedCard;
  planned: boolean;
}

/**
 * Lets local development inspect every released card without mutating save
 * data or unlocking gameplay progression.
 */
export function cardsForDexDisplay(
  cards: readonly CapturedCard[],
  revealAll: boolean,
  now: () => string = () => new Date().toISOString()
): readonly CapturedCard[] {
  if (!revealAll) return cards;

  const savedById = new Map(cards.map((card) => [card.id, card]));
  const inspectedAt = now();
  return DEX_CATALOG.flatMap((slot) => {
    if (slot.kind !== "released") return [];
    const monster = slot.monster;
    return [
      savedById.get(monster.id) ?? {
        id: monster.id,
        dexNumber: monster.dexNumber,
        name: monster.name,
        classification: monster.classification,
        trait: monster.trait,
        description: monster.description,
        snippet: monster.snippet,
        capturedAt: inspectedAt,
      },
    ];
  });
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
