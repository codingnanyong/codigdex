import { createEmptySave, parseSave, type StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { SAVE_STORAGE_KEYS, type SaveStorage } from "@codigdex/game-core/save/storage";

export interface AsyncStringStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function createAsyncSaveStorage(storage: AsyncStringStorage, namespace?: string): SaveStorage {
  const readableKeys = [SAVE_STORAGE_KEYS.current, SAVE_STORAGE_KEYS.previous, SAVE_STORAGE_KEYS.legacy]
    .map((key) => namespace ? `${namespace}:${key}` : key);
  const currentKey = readableKeys[0];
  return {
    async load() {
      for (const key of readableKeys) {
        let raw: string | null;
        // A read failure is not an empty save. Let the app retry before allowing new writes.
        raw = await storage.getItem(key);
        const save = raw ? parseSave(raw) : undefined;
        if (!save) continue;
        if (key !== currentKey) {
          await storage.setItem(currentKey, JSON.stringify(save)).catch(() => undefined);
        }
        return save;
      }
      return createEmptySave();
    },
    async save(value: StoredGameStateV3) {
      await storage.setItem(currentKey, JSON.stringify(value));
    },
    async clear() {
      await Promise.all(readableKeys.map((key) => storage.removeItem(key)));
    },
  };
}
