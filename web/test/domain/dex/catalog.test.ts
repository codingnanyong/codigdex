import { describe, expect, it } from "vitest";
import { DEX_MONSTERS } from "@codigdex/game-content/domain/chapters";
import { DEX_CATALOG, PLANNED_DEX_SLOTS } from "@codigdex/game-content/domain/dex/catalog";
import {
  buildDexEntries,
  cardsForDexDisplay,
  initialDexMonsters,
} from "@/lib/phaser/dex/entry";

describe("dex catalog roadmap", () => {
  it("publishes career monsters as released numbered entries", () => {
    expect(PLANNED_DEX_SLOTS).toHaveLength(0);
    expect(DEX_CATALOG.every((slot) => slot.kind === "released")).toBe(true);
    expect(DEX_MONSTERS).toHaveLength(111);
    expect(DEX_MONSTERS.at(-1)?.dexNumber).toBe("110");
  });

  it("builds one visible dex entry for every capturable monster", () => {
    const entries = buildDexEntries([]);
    const planned = entries.filter((entry) => entry.planned);
    expect(planned).toHaveLength(0);
    expect(entries).toHaveLength(DEX_MONSTERS.length);
    expect(entries.every((entry) => entry.monster)).toBe(true);
  });

  it("preloads only the selected registered card and defers the rest", () => {
    const [first, second] = DEX_MONSTERS;
    const entries = buildDexEntries([
      {
        id: second.id,
        dexNumber: second.dexNumber,
        name: second.name,
        classification: second.classification,
        trait: second.trait,
        description: second.description,
        snippet: second.snippet,
        capturedAt: "2026-09-15T00:00:00.000Z",
      },
    ]);

    expect(initialDexMonsters(entries, 1)).toEqual([second]);
    expect(initialDexMonsters(entries, 0)).toEqual([]);
    expect(initialDexMonsters(entries, 1)).not.toContain(first);
  });

  it("reveals every released card for development without replacing saved cards", () => {
    const saved = {
      id: DEX_MONSTERS[0].id,
      dexNumber: DEX_MONSTERS[0].dexNumber,
      name: DEX_MONSTERS[0].name,
      classification: DEX_MONSTERS[0].classification,
      trait: DEX_MONSTERS[0].trait,
      description: DEX_MONSTERS[0].description,
      snippet: DEX_MONSTERS[0].snippet,
      capturedAt: "2026-09-16T00:00:00.000Z",
    };
    const cards = cardsForDexDisplay(
      [saved],
      true,
      () => "2026-09-16T01:00:00.000Z"
    );

    expect(cards).toHaveLength(DEX_MONSTERS.length);
    expect(cards[0]).toBe(saved);
    expect(cards[1].capturedAt).toBe("2026-09-16T01:00:00.000Z");
  });

  it("returns the untouched save cards when development reveal is disabled", () => {
    const cards = [] as const;
    expect(cardsForDexDisplay(cards, false)).toBe(cards);
  });
});
