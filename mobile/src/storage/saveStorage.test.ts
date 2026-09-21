import { createEmptySave, createSave } from "@codigdex/game-core/save/schema";
import { SAVE_STORAGE_KEYS } from "@codigdex/game-core/save/storage";
import { describe, expect, it } from "vitest";
import { createAsyncSaveStorage, type AsyncStringStorage } from "./saveStorage";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  const removed: string[] = [];
  const storage: AsyncStringStorage = {
    async getItem(key) {
      return values.get(key) ?? null;
    },
    async setItem(key, value) {
      values.set(key, value);
    },
    async removeItem(key) {
      removed.push(key);
      values.delete(key);
    },
  };
  return { values, removed, storage };
}

describe("createAsyncSaveStorage", () => {
  it("returns a playable v3 default when no save exists", async () => {
    const { storage } = memoryStorage();

    await expect(createAsyncSaveStorage(storage).load()).resolves.toEqual(createEmptySave());
  });

  it("loads the current v3 save without rewriting it", async () => {
    const expected = createSave({
      captures: [{ id: "loop", capturedAt: "2026-09-21T00:00:00.000Z" }],
      careers: [],
      primaryJobId: "junior",
      secondaryJobId: null,
      tertiaryJobId: null,
      tutorialOnboardingSeen: true,
      locale: "en",
    });
    const { storage, values } = memoryStorage({
      [SAVE_STORAGE_KEYS.current]: JSON.stringify(expected),
    });

    await expect(createAsyncSaveStorage(storage).load()).resolves.toEqual(expected);
    expect(values.size).toBe(1);
  });

  it("falls back to v1, migrates it, and caches the v3 result", async () => {
    const legacy = {
      version: 1,
      captures: [{ id: "loop", capturedAt: "2026-09-21T00:00:00.000Z" }],
      selectedJob: "frontend",
      tutorialOnboardingSeen: true,
    };
    const { storage, values } = memoryStorage({
      [SAVE_STORAGE_KEYS.current]: "{broken json",
      [SAVE_STORAGE_KEYS.legacy]: JSON.stringify(legacy),
    });

    const loaded = await createAsyncSaveStorage(storage).load();

    expect(loaded).toMatchObject({
      version: 3,
      player: { primaryJobId: "frontend" },
      ui: { tutorialOnboardingSeen: true },
    });
    expect(JSON.parse(values.get(SAVE_STORAGE_KEYS.current)!)).toEqual(loaded);
  });

  it("migrates a v2 save before returning it", async () => {
    const previous = {
      version: 2,
      progress: { captures: [] },
      player: { primaryJobId: "backend", secondaryJobId: null, tertiaryJobId: null },
      ui: { tutorialOnboardingSeen: false },
    };
    const { storage } = memoryStorage({
      [SAVE_STORAGE_KEYS.previous]: JSON.stringify(previous),
    });

    const loaded = await createAsyncSaveStorage(storage).load();

    expect(loaded.version).toBe(3);
    expect(loaded.player.primaryJobId).toBe("backend");
    expect(loaded.progress.careers.map(({ id }) => id)).toEqual(["junior", "backend"]);
  });

  it("falls back to an empty save for corrupt data or read failures", async () => {
    const corrupt = memoryStorage({
      [SAVE_STORAGE_KEYS.current]: "null",
      [SAVE_STORAGE_KEYS.previous]: "[]",
      [SAVE_STORAGE_KEYS.legacy]: "{}",
    });
    const failing: AsyncStringStorage = {
      async getItem() {
        throw new Error("storage unavailable");
      },
      async setItem() {},
      async removeItem() {},
    };

    await expect(createAsyncSaveStorage(corrupt.storage).load()).resolves.toEqual(createEmptySave());
    await expect(createAsyncSaveStorage(failing).load()).resolves.toEqual(createEmptySave());
  });

  it("writes v3 and clears every compatible key", async () => {
    const { storage, values, removed } = memoryStorage({
      [SAVE_STORAGE_KEYS.previous]: "old",
      [SAVE_STORAGE_KEYS.legacy]: "older",
    });
    const repository = createAsyncSaveStorage(storage);
    const save = createEmptySave("ko");

    await repository.save(save);
    expect(JSON.parse(values.get(SAVE_STORAGE_KEYS.current)!)).toEqual(save);

    await repository.clear();
    expect(values.size).toBe(0);
    expect(removed).toEqual([
      SAVE_STORAGE_KEYS.current,
      SAVE_STORAGE_KEYS.previous,
      SAVE_STORAGE_KEYS.legacy,
    ]);
  });
});
