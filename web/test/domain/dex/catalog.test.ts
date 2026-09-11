import { describe, expect, it } from "vitest";
import { DEX_MONSTERS } from "@/lib/domain/chapters";
import { DEX_CATALOG, PLANNED_DEX_SLOTS } from "@/lib/domain/dex/catalog";
import { buildDexEntries } from "@/lib/phaser/dex/entry";

describe("dex catalog roadmap", () => {
  it("appends numbered ??? slots after released monsters", () => {
    expect(PLANNED_DEX_SLOTS.length).toBeGreaterThan(0);
    expect(DEX_CATALOG.slice(0, DEX_MONSTERS.length).every((slot) => slot.kind === "released")).toBe(true);
    expect(PLANNED_DEX_SLOTS[0].dexNumber).toBe("012");
  });

  it("keeps planned slots separate from capturable monster definitions", () => {
    const entries = buildDexEntries([]);
    const planned = entries.filter((entry) => entry.planned);
    expect(planned).toHaveLength(PLANNED_DEX_SLOTS.length);
    expect(planned.every((entry) => !entry.monster && !entry.card)).toBe(true);
    expect(DEX_MONSTERS).toHaveLength(11);
  });
});
