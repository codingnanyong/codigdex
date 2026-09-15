import { describe, expect, it } from "vitest";
import { DEX_MONSTERS } from "@/lib/domain/chapters";
import { DEX_CATALOG, PLANNED_DEX_SLOTS } from "@/lib/domain/dex/catalog";
import { buildDexEntries } from "@/lib/phaser/dex/entry";

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
});
