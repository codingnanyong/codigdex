import type Phaser from "phaser";
import { describe, expect, it, vi } from "vitest";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { OPEN_SOURCE_EXPEDITIONS } from "@codigdex/game-content/domain/openSourceChapters";
import { resumeCheckpoint } from "@codigdex/game-content/domain/gameProgress";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { hydrateRegistry, persistRegistry, SAVE_STORAGE_KEY, snapshotRegistry } from "@/lib/phaser/registryAdapter";
import { JobSelectScene } from "@/lib/phaser/scenes/JobSelectScene";

vi.mock("phaser", () => ({ default: { Scene: class {} } }));

function registry() {
  const data = new Map<string, unknown>();
  return { get: (key: string) => data.get(key), set: (key: string, value: unknown) => { data.set(key, value); } } as unknown as Phaser.Data.DataManager;
}

describe("primary career selection after an expedition", () => {
  it("resumes the chosen career after selection and reload without losing expedition progress", () => {
    const save = createEmptySave("en");
    const expedition = OPEN_SOURCE_EXPEDITIONS.find(({ chapter }) => chapter.id === "open-source:orchestration")!;
    save.progress.captures = [...CHAPTERS.flatMap(({ stages }) => stages), OPEN_SOURCE_EXPEDITIONS[0].chapter.stages[0]].map(({ id }) => ({ id, capturedAt: "2026-10-28T00:00:00.000Z" }));
    save.ui.checkpointId = expedition.chapter.stages[0].id;
    save.ui.tutorialOnboardingSeen = true;
    const values = new Map<string, string>([[SAVE_STORAGE_KEY, JSON.stringify(save)]]);
    const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } } as Storage;
    const state = registry();
    hydrateRegistry(state, storage);
    expect(resumeCheckpoint(snapshotRegistry(state)).chapter.id).toBe(expedition.chapter.id);

    const scene = { registry: state, scene: { start: vi.fn() } };
    Reflect.get(JobSelectScene.prototype, "activatePrimaryJob").call(scene, "backend");
    persistRegistry(state, storage);

    const restored = registry();
    hydrateRegistry(restored, storage);
    const after = snapshotRegistry(restored);
    expect(after.player.primaryJobId).toBe("backend");
    expect(after.player.secondaryJobId).toBeNull();
    expect(after.progress.captures).toHaveLength(save.progress.captures.length);
    expect(after.progress.captures).toEqual(expect.arrayContaining(save.progress.captures));
    expect(resumeCheckpoint(after).chapter.id).toMatch(/^career:/);
    expect(scene.scene.start).toHaveBeenCalledWith("world-map");
  });
});
