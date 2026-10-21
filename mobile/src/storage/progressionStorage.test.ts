import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { createBattleState, submitBattleAnswer } from "@codigdex/game-core/domain/dex/battle";
import { same } from "@codigdex/game-core/i18n/locale";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { SAVE_STORAGE_KEYS } from "@codigdex/game-core/save/storage";
import { describe, expect, it } from "vitest";
import { captureCheckpoint, rememberCheckpoint, resumeCheckpoint } from "../game/progression";
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
const passed = submitBattleAnswer(createBattleState([{ prompt: same("Correct?"), choices: [same("yes"), same("no")], answerIndex: 0 }]), 0, 0);

describe("resume after a device storage restart", () => {
  it.each([1, 2, 3])("migrates v%i and completes Git/Linux with a reload after every capture", async (version) => {
    const { values, storage } = memoryStorage();
    const capture = { id: CHAPTERS[0].stages[0].id, capturedAt: "2026-09-27" };
    const current = createEmptySave("en");
    current.progress.captures = [capture];
    values.set(version === 1 ? SAVE_STORAGE_KEYS.legacy : version === 2 ? SAVE_STORAGE_KEYS.previous : SAVE_STORAGE_KEYS.current,
      JSON.stringify(version === 1 ? { version, captures: [capture] } : version === 2 ? { version, progress: { captures: [capture] }, player: { primaryJobId: "junior" }, ui: { locale: "en" } } : current));
    let reloaded = await createAsyncSaveStorage(storage).load();
    for (const monster of CHAPTERS.slice(1).flatMap(({ stages }) => stages)) {
      expect(resumeCheckpoint(reloaded).monster.id).toBe(monster.id);
      await createAsyncSaveStorage(storage).save(captureCheckpoint(reloaded, monster.id, passed));
      reloaded = await createAsyncSaveStorage(storage).load();
    }
    expect(reloaded.progress.captures).toHaveLength(11);
    expect(reloaded.progress.captures[0]).toEqual(capture);
    if (version !== 1) expect(reloaded.ui.locale).toBe("en");
    expect(resumeCheckpoint(reloaded).monster.id).toBe(CHAPTERS[2].stages.at(-1)!.id);
  });

  it("retries the entire capture/checkpoint snapshot after a failed write, then resets both", async () => {
    const { values, storage } = memoryStorage();
    let fail = true;
    const adapter = createAsyncSaveStorage({ ...storage, async setItem(key, value) {
      if (fail) { fail = false; throw new Error("device full"); }
      await storage.setItem(key, value);
    } });
    const writer = createSaveWriter(adapter);
    const captured = captureCheckpoint(createEmptySave("en"), CHAPTERS[0].stages[0].id, passed);
    await expect(writer.save(captured)).rejects.toThrow("device full");
    expect(values.size).toBe(0);
    await writer.save(captured);
    const restored = await adapter.load();
    expect(restored).toEqual(captured);
    expect(resumeCheckpoint(restored).chapter.id).toBe("git");
    await writer.save(createEmptySave(restored.ui.locale));
    expect((await adapter.load()).ui).toEqual({ locale: "en", tutorialOnboardingSeen: false });
    expect(resumeCheckpoint(await adapter.load()).chapter.id).toBe("tutorial");
  });

  it("keeps QA checkpoints separate from normal saves", async () => {
    const { storage } = memoryStorage();
    const normal = createAsyncSaveStorage(storage);
    const qa = createAsyncSaveStorage(storage, "qa-sprint04");
    await normal.save(rememberCheckpoint(createEmptySave("en"), CHAPTERS[0].stages[0].id));
    await qa.save(captureCheckpoint(createEmptySave("ko"), CHAPTERS[0].stages[0].id, passed));
    expect(resumeCheckpoint(await normal.load()).chapter.id).toBe("tutorial");
    expect(resumeCheckpoint(await qa.load()).chapter.id).toBe("git");
    await qa.clear();
    expect((await normal.load()).ui.locale).toBe("en");
  });
});
