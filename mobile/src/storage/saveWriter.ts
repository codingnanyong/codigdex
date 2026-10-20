import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import type { SaveStorage } from "@codigdex/game-core/save/storage";

/** Serialize snapshots so a slower earlier write cannot overwrite a newer capture or setting. */
export function createSaveWriter(storage: Pick<SaveStorage, "save">) {
  let pending = Promise.resolve();
  return {
    save(value: StoredGameStateV3): Promise<void> {
      const write = pending.then(() => storage.save(value));
      // Only recover the queue; the caller still receives this write's rejection and can retry.
      pending = write.catch(() => undefined);
      return write;
    },
  };
}
