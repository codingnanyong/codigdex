import { DEX_CATALOG } from "@codigdex/game-content/domain/dex/catalog";
import { describe, expect, it } from "vitest";
import { buildMobileDexEntries, findReleasedDexEntry } from "./catalog";

describe("mobile dex catalog", () => {
  const firstReleased = DEX_CATALOG.find((slot) => slot.kind === "released");

  it("marks only saved monsters as captured", () => {
    expect(firstReleased).toBeDefined();
    if (!firstReleased || firstReleased.kind !== "released") return;
    const entries = buildMobileDexEntries(new Set([firstReleased.monster.id]));
    expect(entries.find((entry) => entry.id === firstReleased.monster.id)?.captured).toBe(true);
    expect(entries.filter((entry) => entry.captured)).toHaveLength(1);
  });

  it("does not open unknown or planned slots as released details", () => {
    const planned = DEX_CATALOG.find((slot) => slot.kind === "planned");
    const nonReleasedId = planned?.kind === "planned" ? planned.technologyId : "not-in-released-catalog";
    expect(findReleasedDexEntry(nonReleasedId, new Set())).toBeUndefined();
  });

  it("ignores stale capture ids that are no longer in the catalog", () => {
    expect(buildMobileDexEntries(new Set(["removed-monster"])).some((entry) => entry.captured)).toBe(false);
  });
});
