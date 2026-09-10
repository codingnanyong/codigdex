import Phaser from "phaser";
import { DexState, EMPTY_DEX_STATE } from "@/lib/domain/tutorial/capture";
import { REGISTRY_KEYS } from "@/lib/domain/tutorial/content";

export function ensureDexDefaults(registry: Phaser.Data.DataManager) {
  if (registry.get(REGISTRY_KEYS.cards) === undefined) {
    registry.set(REGISTRY_KEYS.cards, EMPTY_DEX_STATE.cards);
  }
}

export function readDexState(registry: Phaser.Data.DataManager): DexState {
  return {
    cards: (registry.get(REGISTRY_KEYS.cards) as DexState["cards"]) ?? EMPTY_DEX_STATE.cards,
  };
}

export function writeDexState(registry: Phaser.Data.DataManager, state: DexState) {
  registry.set(REGISTRY_KEYS.cards, state.cards);
}
