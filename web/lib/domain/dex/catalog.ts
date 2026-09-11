import { DEX_MONSTERS } from "@/lib/domain/chapters";
import { TECHNOLOGY_SPECIMENS } from "@/lib/domain/technologySpecimens";
import type { MonsterDefinition } from "@/lib/domain/chapters/types";

export interface ReleasedDexSlot {
  kind: "released";
  dexNumber: string;
  monster: MonsterDefinition;
}

export interface PlannedDexSlot {
  kind: "planned";
  dexNumber: string;
  /** Internal routing id; the UI deliberately hides the technology and monster. */
  technologyId: string;
}

export type DexCatalogSlot = ReleasedDexSlot | PlannedDexSlot;

const firstPlannedNumber = DEX_MONSTERS.length + 1;

export const PLANNED_DEX_SLOTS: readonly PlannedDexSlot[] = Object.values(TECHNOLOGY_SPECIMENS)
  .filter((specimen) => specimen.role === "future")
  .map((specimen, index) => ({
    kind: "planned",
    dexNumber: String(firstPlannedNumber + index).padStart(3, "0"),
    technologyId: specimen.id,
  }));

/** Released entries count toward completion; planned ??? slots are preview-only. */
export const DEX_CATALOG: readonly DexCatalogSlot[] = [
  ...DEX_MONSTERS.map((monster) => ({
    kind: "released" as const,
    dexNumber: monster.dexNumber,
    monster,
  })),
  ...PLANNED_DEX_SLOTS,
];
