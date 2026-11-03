import { afterEach, describe, expect, it, vi } from "vitest";
import type Phaser from "phaser";
import { createEmptySave, parseSave } from "@codigdex/game-core/save/schema";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { CAREER_PATHS } from "@codigdex/game-content/domain/careerPaths";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { SourceEventSession, sourceEvents } from "@/lib/phaser/openSourceEvents";
import { applySaveToRegistry, hydrateRegistry, SAVE_STORAGE_KEY, snapshotRegistry } from "@/lib/phaser/registryAdapter";
import { openSourceEvolutionFor } from "@codigdex/game-content/domain/openSourceChapters";
import { parseEncounterHistory, sourceEventStorageKey } from "@/lib/phaser/openSourceEventStorage";

function fixture() {
  const before = createEmptySave("ko");
  before.player.primaryJobId = "frontend";
  before.progress.captures = CHAPTERS.flatMap(({ stages }) => stages).map(({ id }) => ({ id, capturedAt: "2026-10-28T00:00:00.000Z" }));
  before.ui.checkpointId = "keep-normal-checkpoint";
  const trigger = monstersForCareerRegion(CAREER_PATHS.frontend.regions[0].id)[0].id;
  const after = { ...before, progress: { ...before.progress, captures: [...before.progress.captures, { id: trigger, capturedAt: "2026-10-28T01:00:00.000Z" }] } };
  const values = new Map<string, string>([["codigdex:save:v3", JSON.stringify(after)]]);
  const io = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  return { before, after, trigger, io, values };
}

afterEach(() => vi.unstubAllGlobals());

for (const exit of ["complete", "leave"]) it(`preserves the final request on reload when browser capture storage fails before ${exit}`, () => {
  const { before, after, trigger, io, values } = fixture();
  let failCapture = false;
  const storage = { ...io, setItem(key: string, raw: string) {
    if (failCapture && key === SAVE_STORAGE_KEY) throw Error("save quota");
    io.setItem(key, raw);
  } } as Storage;
  vi.stubGlobal("window", { localStorage: storage, dispatchEvent: vi.fn() });
  const entries = new Map<string, unknown>();
  const registry = { get: (key: string) => entries.get(key), set: (key: string, value: unknown) => entries.set(key, value) } as unknown as Phaser.Data.DataManager;
  hydrateRegistry(registry, storage);
  const session = sourceEvents(registry);
  const pending = session.queue(before, snapshotRegistry(registry), trigger, { scene: "world-map" })!;
  session.accept(after, pending.id);
  const forms = openSourceEvolutionFor("tanstack-query");
  for (const form of forms.slice(0, 4)) {
    const save = snapshotRegistry(registry);
    save.progress.captures.push({ id: form.id, capturedAt: "2026-11-02T00:00:00.000Z" });
    applySaveToRegistry(registry, save);
    session.completeStage(snapshotRegistry(registry), pending.id, form.id);
  }
  failCapture = true;
  const final = snapshotRegistry(registry);
  final.progress.captures.push({ id: forms[4].id, capturedAt: "2026-11-02T00:00:00.000Z" });
  applySaveToRegistry(registry, final);
  if (exit === "complete") session.completeStage(snapshotRegistry(registry), pending.id, forms[4].id);
  else session.leave(snapshotRegistry(registry), pending.id);
  const restored = parseSave(values.get(SAVE_STORAGE_KEY)!)!;
  expect(restored.progress.captures.some(({ id }) => id === forms[4].id)).toBe(false);
  expect(new SourceEventSession(io).resolvePending(restored)).toMatchObject({ id: pending.id, stageId: forms[4].id });
});

describe("local encounter session", () => {
  it("keeps queries read-only and persists stale cleanup only when explicitly resolved", () => {
    const { before, after, trigger, io } = fixture();
    const notify = vi.fn();
    const storage = { ...io, setItem: vi.fn(io.setItem) };
    const session = new SourceEventSession(storage, notify);
    session.queue(before, after, trigger, { scene: "world-map" });
    storage.setItem.mockClear();
    notify.mockClear();
    const changed = { ...after, player: { ...after.player, primaryJobId: "backend" } };
    expect(session.pending(changed)).toBeUndefined();
    expect(session.canBattle(changed, "old-id", "open-source:tanstack-query:lv1")).toBe(false);
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(notify).not.toHaveBeenCalled();
    expect(session.resolvePending(changed)).toBeUndefined();
    expect(storage.setItem).toHaveBeenCalledOnce();
    expect(notify).toHaveBeenCalledOnce();
    expect(new SourceEventSession(io).pending(after)).toBeUndefined();
    session.resolvePending(changed);
    expect(notify).toHaveBeenCalledOnce();
  });
  it("restores offers and active requests after reload without modifying the game's save", () => {
    const { before, after, trigger, io, values } = fixture();
    const session = new SourceEventSession(io);
    const target = { scene: "career-region" as const, data: { careerId: "frontend", regionId: "html-css" } };
    const pending = session.queue(before, after, trigger, target)!;
    expect(new SourceEventSession(io).pending(after)).toEqual(pending);
    expect(session.canBattle(after, pending.id, "open-source:tanstack-query:lv1")).toBe(false);
    expect(session.accept(after, pending.id)).toBe(true);
    const reloaded = new SourceEventSession(io);
    expect(reloaded.canBattle(after, pending.id, "open-source:tanstack-query:lv1")).toBe(true);
    expect(reloaded.canBattle(after, pending.id, "open-source:hadoop")).toBe(false);
    expect(reloaded.finish(after, pending.id)).toEqual(target);
    expect(new SourceEventSession(io).pending(after)).toBeUndefined();
    expect(values.get("codigdex:save:v3")).toBe(JSON.stringify(after));
    expect(after.ui.checkpointId).toBe("keep-normal-checkpoint");
  });

  it("isolates new adventures and discards stale requests after a career change", () => {
    const { before, after, trigger, io } = fixture();
    const session = new SourceEventSession(io);
    session.queue(before, after, trigger, { scene: "world-map" });
    const changed = { ...after, player: { ...after.player, primaryJobId: "backend" } };
    expect(session.resolvePending(changed)).toBeUndefined();
    expect(session.read(after).discoveries).toHaveLength(1);
    const fresh = structuredClone(after);
    fresh.progress.captures[0].capturedAt = "2026-10-29T00:00:00.000Z";
    expect(sourceEventStorageKey(fresh)).not.toBe(sourceEventStorageKey(after));
    expect(session.read(fresh).discoveries).toEqual([]);
  });

  it("stays playable with damaged/unavailable optional history storage", () => {
    const { before, after, trigger } = fixture();
    for (const raw of [null, "{", "null", JSON.stringify({ pending: { careerId: "frontend", toolId: "postgresql", returnTo: { scene: "code-battle" } } })]) expect(parseEncounterHistory(raw).pending).toBeUndefined();
    for (const raw of ["{", "x".repeat(128001)]) {
      const damaged = new SourceEventSession({ getItem: () => raw, setItem() {} });
      expect(damaged.pending(after)).toBeUndefined();
      expect(damaged.read(after).discoveries).toEqual([]);
    }
    const session = new SourceEventSession({ getItem() { throw new Error("unavailable"); }, setItem() { throw new Error("quota"); } });
    const pending = session.queue(before, after, trigger, { scene: "world-map" })!;
    expect(pending).toBeDefined();
    expect(session.accept(after, pending.id)).toBe(true);
    expect(session.finish(after, pending.id)).toEqual({ scene: "world-map" });
  });

  it("clears missing-trigger requests and preserves ordinary cards when local history is cleared", () => {
    const { before, after, trigger, io, values } = fixture();
    const pending = new SourceEventSession(io).queue(before, after, trigger, { scene: "world-map" })!;
    expect(new SourceEventSession(io).resolvePending(before)).toBeUndefined();
    expect(new SourceEventSession(io).read(after).discoveries).toHaveLength(1);
    after.progress.captures.push({ id: "open-source:tanstack-query:lv1", capturedAt: "2026-10-28T02:00:00.000Z" });
    const savedCards = JSON.stringify(after.progress.captures);
    values.delete(sourceEventStorageKey(after)!);
    const cleared = new SourceEventSession(io);
    expect(cleared.read(after).discoveries).toEqual([]);
    expect(cleared.pending(after)).toBeUndefined();
    expect(cleared.accept(after, pending.id)).toBe(false);
    expect(JSON.stringify(after.progress.captures)).toBe(savedCards);
  });
});


describe("request return and notebook recovery", () => {
  it("preserves an unaccepted offer when returning to a career, including reload", () => {
    const { before, after, trigger, io } = fixture();
    const session = new SourceEventSession(io);
    const offered = session.queue(before, after, trigger, { scene: "world-map" })!;
    expect(session.pause(after, offered.id)).toEqual({ scene: "world-map" });
    const restored = new SourceEventSession(io);
    expect(restored.pending(after)).toMatchObject({ id: offered.id, state: "paused", stageId: "open-source:tanstack-query:lv1" });
    expect(restored.canBattle(after, offered.id, "open-source:tanstack-query:lv1")).toBe(false);
    expect(restored.accept(after, offered.id)).toBe(true);
    expect(restored.canBattle(after, offered.id, "open-source:tanstack-query:lv1")).toBe(true);
  });
  it("recovers a previously closed discovery at its first missing form without changing career progress", () => {
    const { before, after, trigger, io } = fixture();
    const session = new SourceEventSession(io);
    const offered = session.queue(before, after, trigger, { scene: "world-map" })!;
    session.finish(after, offered.id);
    after.progress.captures.push({ id: "open-source:tanstack-query:lv1", capturedAt: "2026-11-03T00:00:00Z" });
    const original = structuredClone(after);
    const restored = new SourceEventSession(io);
    const resumed = restored.resumeDiscovered(after, "tanstack-query")!;
    expect(resumed).toMatchObject({ state: "paused", toolId: "tanstack-query", stageId: "open-source:tanstack-query:lv2", returnTo: { scene: "career-region", data: { careerId: "frontend", regionId: "html-css" } } });
    expect(after).toEqual(original);
    expect(restored.accept(after, resumed.id)).toBe(true);
    expect(restored.canBattle(after, resumed.id, "open-source:tanstack-query:lv2")).toBe(true);
  });
  it("does not reopen unknown tools, another career's discoveries, or replace a different request", () => {
    const { before, after, trigger, io } = fixture();
    const session = new SourceEventSession(io);
    const offered = session.queue(before, after, trigger, { scene: "world-map" })!;
    expect(session.resumeDiscovered(after, "postgresql")).toBeUndefined();
    expect(session.pending(after)?.id).toBe(offered.id);
    session.finish(after, offered.id);
    expect(session.resumeDiscovered(after, "postgresql")).toBeUndefined();
    const changed = structuredClone(after); changed.player.primaryJobId = "backend";
    expect(session.resumeDiscovered(changed, "tanstack-query")).toBeUndefined();
  });
});
