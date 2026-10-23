import { describe, expect, it } from "vitest";
import type Phaser from "phaser";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { SAVE_STORAGE_KEYS } from "@codigdex/game-core/save/storage";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { careerPathFor } from "@codigdex/game-content/domain/careerPaths";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { normalizeGameSave, resumeCheckpoint, selectGameCareer } from "@codigdex/game-content/domain/gameProgress";
import { createSaveSync, type CloudSave } from "@codigdex/game-core/save/sync";
import { hydrateRegistry, persistRegistry, readDexState, readCareerDexState, resetGameProgress, applySaveToRegistry, snapshotRegistry } from "@/lib/phaser/registryAdapter";
import { createAsyncSaveStorage } from "../../../mobile/src/storage/saveStorage";

describe("Web registry ↔ native storage roundtrip", () => {
  it("retains career, captures, language and resume point through both adapters", async () => {
    const values = new Map<string, string>();
    const initial = createEmptySave("en");
    initial.progress.captures = CHAPTERS.flatMap(({ stages }) => stages.map(({ id }) => ({ id, capturedAt: "2026-10-23T00:00:00.000Z" })));
    const unknownCapture = { id: "future-version-monster", capturedAt: "2026-10-23T00:00:00.000Z" };
    const unknownCareer = { id: "future-version-career", unlockedAt: "2026-10-23T00:00:00.000Z" };
    initial.progress.captures.push(unknownCapture);
    initial.progress.careers.push(unknownCareer);
    const mobileSave = selectGameCareer(initial, "frontend");
    expect(mobileSave.progress.careers).toContainEqual(unknownCareer);
    const expectedMonster = monstersForCareerRegion(careerPathFor("frontend").regions[0].id)[0];
    mobileSave.ui.checkpointId = expectedMonster.id;
    const storage = createAsyncSaveStorage({ async getItem(key) { return values.get(key) ?? null; }, async setItem(key, value) { values.set(key, value); }, async removeItem(key) { values.delete(key); } });
    await storage.save(mobileSave);
    const entries = new Map<string, unknown>();
    const registry = { get: (key: string) => entries.get(key), set: (key: string, value: unknown) => entries.set(key, value) } as unknown as Phaser.Data.DataManager;
    const browser: Storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: (key) => { values.delete(key); }, clear: () => values.clear(), key: (index) => [...values.keys()][index] ?? null, get length() { return values.size; } };
    hydrateRegistry(registry, browser);
    persistRegistry(registry, browser);
    const nativeRestored = await storage.load();
    expect(nativeRestored).toEqual(mobileSave);
    expect(nativeRestored.progress.captures).toContainEqual(unknownCapture);
    expect(nativeRestored.progress.careers).toContainEqual(unknownCareer);
    expect(readDexState(registry).cards.some(({ id }) => id === unknownCapture.id)).toBe(false);
    expect(readCareerDexState(registry).careers.some(({ id }) => String(id) === unknownCareer.id)).toBe(false);
    expect(resumeCheckpoint(nativeRestored).monster.id).toBe(expectedMonster.id);
    expect(values.has(SAVE_STORAGE_KEYS.current)).toBe(true);
    let cloud: CloudSave | null = null;
    const sync = createSaveSync({
      storage: { async getItem(key) { return values.get(key) ?? null; }, async setItem(key, value) { values.set(key, value); } },
      remote: {
        async read() { return structuredClone(cloud); },
        async compareAndSet(_user, revision, payload) {
          if ((cloud?.revision ?? null) !== revision) return null;
          cloud = { revision: (cloud?.revision ?? 0) + 1, payload: structuredClone(payload) };
          return structuredClone(cloud);
        },
      },
      readLocal: () => snapshotRegistry(registry),
      async writeLocal(save) { applySaveToRegistry(registry, save); },
      normalize: normalizeGameSave,
    });
    expect(await sync.sync("user", true)).toBe("synced");
    const revision = cloud!.revision;
    expect(await sync.sync("user")).toBe("synced");
    expect(cloud!.revision).toBe(revision);
    expect(cloud!.payload.progress.captures).toContainEqual(unknownCapture);
    expect(cloud!.payload.progress.careers).toContainEqual(unknownCareer);
    applySaveToRegistry(registry, createEmptySave("ko"));
    expect(snapshotRegistry(registry).progress.captures).toEqual([]);
    expect(snapshotRegistry(registry).progress.careers).toEqual([]);
    applySaveToRegistry(registry, mobileSave);
    expect(snapshotRegistry(registry).progress.captures).toContainEqual(unknownCapture);
    expect(snapshotRegistry(registry).progress.careers).toContainEqual(unknownCareer);
    resetGameProgress(registry, browser);
    const reset = await storage.load();
    expect(reset.progress.captures).toEqual([]);
    expect(reset.progress.careers).toEqual([]);
  });
});
