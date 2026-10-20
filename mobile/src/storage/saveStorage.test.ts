import { describe, expect, it } from "vitest";
import { createBattleState, submitBattleAnswer } from "@codigdex/game-core/domain/dex/battle";
import { same } from "@codigdex/game-core/i18n/locale";
import { applyBattleCapture } from "@codigdex/game-core/save/battleCapture";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { SAVE_STORAGE_KEYS } from "@codigdex/game-core/save/storage";
import { createAsyncSaveStorage, type AsyncStringStorage } from "./saveStorage";
import { createSaveWriter } from "./saveWriter";

function memoryStorage() {
  const values = new Map<string, string>();
  const storage: AsyncStringStorage = {
    async getItem(key) { return values.get(key) ?? null; },
    async setItem(key, value) { values.set(key, value); },
    async removeItem(key) { values.delete(key); },
  };
  return { values, storage };
}

describe("mobile capture persistence", () => {
  it("restores a successful mixed battle capture without duplicate records or failed captures", async () => {
    const { storage } = memoryStorage();
    const adapter = createAsyncSaveStorage(storage);
    const initial = createEmptySave("en");
    const battle = createBattleState([{
      type: "freeText", prompt: same("Name the command"), acceptedAnswers: ["git status"],
      normalization: "trim-collapse-case", hints: [], explanation: same("git status shows changes."),
    }]);
    const failed = submitBattleAnswer(battle, 0, "git log");
    await adapter.save(applyBattleCapture(initial, "test-monster", failed));
    expect((await adapter.load()).progress.captures).toEqual([]);
    const passed = submitBattleAnswer(battle, 0, " GIT  STATUS ");
    const captured = applyBattleCapture(initial, "test-monster", passed, () => "2026-10-20T01:00:00.000Z");
    await adapter.save(captured);
    const restored = await adapter.load();
    expect(restored).toEqual(captured);
    expect(applyBattleCapture(restored, "test-monster", passed)).toBe(restored);
    expect(restored.ui.locale).toBe("en");
  });

  it.each([1, 2])("migrates a v%i save and keeps it readable after restarting", async (version) => {
    const { storage, values } = memoryStorage();
    const capture = { id: "infinite-loop-slime", capturedAt: "2026-09-27T01:00:00.000Z" };
    values.set(version === 1 ? SAVE_STORAGE_KEYS.legacy : SAVE_STORAGE_KEYS.previous,
      JSON.stringify(version === 1 ? { version: 1, captures: [capture] } : {
        version: 2, progress: { captures: [capture] }, player: { primaryJobId: "junior" }, ui: { locale: "en" },
      }));
    const migrated = await createAsyncSaveStorage(storage).load();
    expect(migrated.version).toBe(3);
    expect(migrated.progress.captures).toEqual([capture]);
    expect(values.has(SAVE_STORAGE_KEYS.current)).toBe(true);
    expect(await createAsyncSaveStorage(storage).load()).toEqual(migrated);
  });
});

describe("snapshot write ordering and retry", () => {
  it("does not start the second snapshot until the first write finishes", async () => {
    const snapshots: string[] = [];
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const writer = createSaveWriter({ async save(value) {
      snapshots.push(value.ui.locale!);
      if (snapshots.length === 1) await gate;
    } });
    const first = writer.save(createEmptySave("ko"));
    const second = writer.save(createEmptySave("en"));
    await Promise.resolve();
    expect(snapshots).toEqual(["ko"]);
    release();
    await Promise.all([first, second]);
    expect(snapshots).toEqual(["ko", "en"]);
  });

  it("reports a failed write and still accepts the latest snapshot for retry", async () => {
    const { storage } = memoryStorage();
    const adapter = createAsyncSaveStorage(storage);
    let calls = 0;
    const writer = createSaveWriter({ async save(value) {
      if (calls++ === 0) throw new Error("device full");
      await adapter.save(value);
    } });
    await expect(writer.save(createEmptySave("ko"))).rejects.toThrow("device full");
    const latest = createEmptySave("en");
    await writer.save(latest);
    expect(await adapter.load()).toEqual(latest);
  });
});
