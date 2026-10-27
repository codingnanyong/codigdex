/// <reference types="node" />
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { DEX_MONSTERS } from "@codigdex/game-content/domain/chapters";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { SAVE_STORAGE_KEYS } from "@codigdex/game-core/save/storage";
import { createAsyncSaveStorage } from "../storage/saveStorage";
import { createQaFaults, isE2eEnabled, isQaEnabled } from "./runtime";
import { WALLPAPERS } from "@codigdex/game-assets/visuals";

describe("QA isolation and deliberate failures", () => {
  it("cannot enable automation in a release or ordinary QA session", () => {
    expect(isE2eEnabled(isQaEnabled(false, "1"), "1")).toBe(false);
    expect(isE2eEnabled(isQaEnabled(true, undefined), "1")).toBe(false);
    expect(isE2eEnabled(isQaEnabled(true, "1"), undefined)).toBe(false);
    expect(isE2eEnabled(isQaEnabled(true, "1"), "1")).toBe(true);
  });
  it("automation reset preserves both normal saves and manual QA progress", async () => {
    const normal = createEmptySave("ko");
    const values = new Map([[SAVE_STORAGE_KEYS.current as string, JSON.stringify(normal)]]);
    const io = { async getItem(key: string) { return values.get(key) ?? null; }, async setItem(key: string, value: string) { values.set(key, value); }, async removeItem(key: string) { values.delete(key); } };
    const manual = createAsyncSaveStorage(io, "qa-sprint04");
    const automation = createAsyncSaveStorage(io, "qa-home-e2e");
    const manualSave = createEmptySave("en");
    manualSave.ui.checkpointId = "infinite-loop-slime";
    await manual.save(manualSave);
    await automation.save(createEmptySave("en"));
    await automation.clear();
    expect(await manual.load()).toEqual(manualSave);
    expect(JSON.parse(values.get(SAVE_STORAGE_KEYS.current)!)).toEqual(normal);
    const faults = createQaFaults(true);
    faults.failNextSave(); faults.failNextQuiz(); faults.reset();
    expect(() => { faults.beforeSave(); faults.beforeQuiz(); }).not.toThrow();
  });
  it("requires both a development bundle and the explicit QA flag", () => {
    expect(isQaEnabled(true, "1")).toBe(true);
    for (const [dev, flag] of [[false, "1"], [true, undefined], [true, "0"]] as const) expect(isQaEnabled(dev, flag)).toBe(false);
  });
  it("simulates exactly one failure and cannot arm failures outside QA", () => {
    const qa = createQaFaults(true);
    qa.failNextSave(); qa.failNextQuiz();
    expect(() => qa.beforeSave()).toThrow();
    expect(() => qa.beforeSave()).not.toThrow();
    expect(() => qa.beforeQuiz()).toThrow();
    expect(() => qa.beforeQuiz()).not.toThrow();
    const normal = createQaFaults(false);
    normal.failNextSave(); normal.failNextQuiz();
    expect(() => { normal.beforeSave(); normal.beforeQuiz(); }).not.toThrow();
  });
  it("QA loading, saving and clearing cannot touch normal progress", async () => {
    const normal = createEmptySave("en");
    const values = new Map([[SAVE_STORAGE_KEYS.current as string, JSON.stringify(normal)]]);
    const adapter = createAsyncSaveStorage({ async getItem(key) { return values.get(key) ?? null; }, async setItem(key, value) { values.set(key, value); }, async removeItem(key) { values.delete(key); } }, "qa-sprint04");
    expect(await adapter.load()).toEqual(createEmptySave());
    await adapter.save(createEmptySave("ko"));
    expect(values.size).toBe(2);
    await adapter.clear();
    expect(values.size).toBe(1);
    expect(JSON.parse(values.get(SAVE_STORAGE_KEYS.current)!)).toEqual(normal);
  });
});

describe("mobile asset completeness", () => {
  it("bundles every released monster and the same common-path wallpapers as web", () => {
    const map = readFileSync(new URL("../assets.generated.ts", import.meta.url), "utf8");
    const keys = new Set([...map.matchAll(/^  "([^"]+)": require\(/gm)].map((match) => match[1]));
    for (const monster of DEX_MONSTERS) {
      expect(keys.has(monster.assetKey), monster.assetKey).toBe(true);
      expect(existsSync(fileURLToPath(new URL(`../../../packages/game-assets/files/${monster.assetKey}`, import.meta.url)))).toBe(true);
    }
    const wallpapers = new Set<string>(Object.values(WALLPAPERS));
    expect([...keys].every((key) => key.startsWith("monsters/") || key.startsWith("characters/promotion/") || key.startsWith("characters/open-source/") || wallpapers.has(key))).toBe(true);
    for (const key of wallpapers) expect(keys.has(key)).toBe(true);
    expect(map).not.toContain("evolution-sheet");
    expect(map).not.toContain("evolution-guide");
    expect(map).not.toContain("-specimen");
  });
});
