import { DEX_CATALOG, type DexCatalogSlot } from "@codigdex/game-content/domain/dex/catalog";

export type MobileDexEntry =
  | { kind: "released"; captured: boolean; dexNumber: string; id: string; slot: Extract<DexCatalogSlot, { kind: "released" }> }
  | { kind: "planned"; captured: false; dexNumber: string; id: string; slot: Extract<DexCatalogSlot, { kind: "planned" }> };

export function buildMobileDexEntries(capturedIds: ReadonlySet<string>): MobileDexEntry[] {
  return DEX_CATALOG.map((slot) => slot.kind === "released"
    ? { kind: "released", captured: capturedIds.has(slot.monster.id), dexNumber: slot.dexNumber, id: slot.monster.id, slot }
    : { kind: "planned", captured: false, dexNumber: slot.dexNumber, id: slot.technologyId, slot });
}

export function findReleasedDexEntry(id: string, capturedIds: ReadonlySet<string>): MobileDexEntry | undefined {
  return buildMobileDexEntries(capturedIds).find((entry) => entry.kind === "released" && entry.id === id);
}
