import type Phaser from "phaser";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { SourceEventSession } from "@codigdex/game-content/domain/openSourceEncounterSession";
import type { EncounterStorage } from "@codigdex/game-content/domain/openSourceEncounterStorage";
import { discoveredSourceIds as discoveredIds } from "@codigdex/game-content/domain/openSourceEncounters";
import { persistRegistry } from "./registryAdapter";
export { SourceEventSession };
export const SOURCE_EVENTS_CHANGED = "codigdex-source-events-changed";

const sessions = new WeakMap<Phaser.Data.DataManager, SourceEventSession>();
export function sourceEvents(registry: Phaser.Data.DataManager) {
  let session = sessions.get(registry);
  if (!session) {
    let storage: EncounterStorage | undefined;
    try {
      if (typeof window !== "undefined") {
        const browser = window.localStorage;
        storage = {
          getItem: (key) => browser.getItem(key),
          setItem: (key, raw) => {
            // A shorter history write can succeed even when the capture save
            // exceeds quota. Keep the durable request until its progress lands.
            if (!persistRegistry(registry, browser)) throw new Error("Progress was not saved.");
            browser.setItem(key, raw);
          },
        };
      }
    } catch { /* Optional local event history. */ }
    session = new SourceEventSession(storage, () => { if (typeof window !== "undefined") window.dispatchEvent(new Event(SOURCE_EVENTS_CHANGED)); });
    sessions.set(registry, session);
  }
  return session;
}

export function discoveredSourceIds(registry: Phaser.Data.DataManager, save: StoredGameStateV3) {
  return discoveredIds(save, sourceEvents(registry).read(save));
}
