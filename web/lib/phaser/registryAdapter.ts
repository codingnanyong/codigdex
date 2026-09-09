import Phaser from "phaser";
import { DexState, EMPTY_DEX_STATE } from "@/lib/domain/tutorial/capture";
import { REGISTRY_KEYS } from "@/lib/domain/tutorial/content";

export function ensureDexDefaults(registry: Phaser.Data.DataManager) {
  if (registry.get(REGISTRY_KEYS.exp) === undefined) {
    registry.set(REGISTRY_KEYS.exp, EMPTY_DEX_STATE.exp);
  }
  if (registry.get(REGISTRY_KEYS.coins) === undefined) {
    registry.set(REGISTRY_KEYS.coins, EMPTY_DEX_STATE.coins);
  }
  if (registry.get(REGISTRY_KEYS.cards) === undefined) {
    registry.set(REGISTRY_KEYS.cards, EMPTY_DEX_STATE.cards);
  }
  if (registry.get(REGISTRY_KEYS.badges) === undefined) {
    registry.set(REGISTRY_KEYS.badges, EMPTY_DEX_STATE.badges);
  }
}

export function readDexState(registry: Phaser.Data.DataManager): DexState {
  return {
    exp: (registry.get(REGISTRY_KEYS.exp) as number) ?? EMPTY_DEX_STATE.exp,
    coins: (registry.get(REGISTRY_KEYS.coins) as number) ?? EMPTY_DEX_STATE.coins,
    cards: (registry.get(REGISTRY_KEYS.cards) as DexState["cards"]) ?? EMPTY_DEX_STATE.cards,
    badges: (registry.get(REGISTRY_KEYS.badges) as string[]) ?? EMPTY_DEX_STATE.badges,
  };
}

export function writeDexState(registry: Phaser.Data.DataManager, state: DexState) {
  registry.set(REGISTRY_KEYS.exp, state.exp);
  registry.set(REGISTRY_KEYS.coins, state.coins);
  registry.set(REGISTRY_KEYS.cards, state.cards);
  registry.set(REGISTRY_KEYS.badges, state.badges);
}
