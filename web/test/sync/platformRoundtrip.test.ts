import { describe, expect, it } from "vitest";
import type Phaser from "phaser";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { SAVE_STORAGE_KEYS } from "@codigdex/game-core/save/storage";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { careerPathFor } from "@codigdex/game-content/domain/careerPaths";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { resumeCheckpoint, selectGameCareer } from "@codigdex/game-content/domain/gameProgress";
import { hydrateRegistry, persistRegistry } from "@/lib/phaser/registryAdapter";
import { createAsyncSaveStorage } from "../../../mobile/src/storage/saveStorage";

describe("Web registry ↔ native storage roundtrip", () => {
  it("retains career, captures, language and resume point through both adapters", async () => {
    const values = new Map<string, string>();
    const initial = createEmptySave("en");
    initial.progress.captures = CHAPTERS.flatMap(({ stages }) => stages.map(({ id }) => ({ id, capturedAt: "2026-10-23T00:00:00.000Z" })));
    const mobileSave = selectGameCareer(initial, "frontend");
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
    expect(resumeCheckpoint(nativeRestored).monster.id).toBe(expectedMonster.id);
    expect(values.has(SAVE_STORAGE_KEYS.current)).toBe(true);
  });
});
