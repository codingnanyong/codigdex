import { describe, expect, it, vi } from "vitest";
import { careerQAPresets } from "@codigdex/game-content/domain/careerQAPresets";
import { sourceEventStorageKey } from "@codigdex/game-content/domain/openSourceEncounterStorage";
import { MobileSourceEventStore } from "./sourceEventStore";

function fixture() {
  const before = careerQAPresets("en", "2026-10-28T00:00:00.000Z").find(({ id }) => id === "encounter:frontend")!.save;
  const after = structuredClone(before);
  after.progress.captures.push({ id: before.ui.checkpointId!, capturedAt: "2026-10-28T01:00:00.000Z" });
  const values = new Map<string, string>([["codigdex:save:v3", "normal-sentinel"]]);
  const io = { async getItem(key: string) { return values.get(key) ?? null; }, async setItem(key: string, value: string) { values.set(key, value); } };
  return { before, after, values, io, target: { scene: "career-region" as const, data: { careerId: "frontend", regionId: "html-css" } } };
}

describe("mobile encounter persistence", () => {
  it("restores an active request in the QA namespace and leaves normal saves untouched", async () => {
    const { before, after, io, values, target } = fixture();
    const store = new MobileSourceEventStore(io, () => {}, "qa");
    await store.load(after); store.activate(after);
    const pending = store.session.queue(before, after, before.ui.checkpointId!, target)!;
    store.session.accept(after, pending.id);
    await store.retry(after);
    const reloaded = new MobileSourceEventStore(io, () => {}, "qa");
    await reloaded.load(after); reloaded.activate(after);
    expect(reloaded.session.canBattle(after, pending.id, "open-source:tanstack-query")).toBe(true);
    expect(reloaded.session.finish(after, pending.id)).toEqual(target);
    await reloaded.retry(after);
    expect(JSON.parse(values.get(`qa:${sourceEventStorageKey(after)}`)!).pending).toBeUndefined();
    expect(values.get("codigdex:save:v3")).toBe("normal-sentinel");
    const normal = new MobileSourceEventStore(io);
    await normal.load(after); normal.activate(after);
    expect(normal.session.read(after).discoveries).toEqual([]);
  });

  it("serializes writes and keeps a failed offer retryable", async () => {
    const { before, after, io, target } = fixture();
    const writes: string[] = [];
    let fail = true;
    const store = new MobileSourceEventStore({ ...io, async setItem(key, raw) { writes.push(raw); if (fail) throw Error("quota"); await io.setItem(key, raw); } });
    await store.load(after); store.activate(after);
    const pending = store.session.queue(before, after, before.ui.checkpointId!, target)!;
    await vi.waitFor(() => expect(store.saving).toBe(false));
    expect(store.error).toBe(true);
    expect(store.session.pending(after)?.id).toBe(pending.id);
    fail = false;
    store.session.accept(after, pending.id);
    store.session.finish(after, pending.id);
    await store.retry(after);
    expect(writes.map((raw) => JSON.parse(raw).pending?.state)).toEqual(["offered", "active", undefined, undefined]);
    expect(store.error).toBe(false);
    expect(store.saving).toBe(false);
  });

  it("keeps history loading retryable after a read failure", async () => {
    const { after, io } = fixture();
    const store = new MobileSourceEventStore({ ...io, getItem: vi.fn().mockRejectedValueOnce(Error("read failed")).mockResolvedValue(null) });
    await expect(store.load(after)).rejects.toThrow("read failed");
    await expect(store.load(after)).resolves.toBeUndefined();
    store.activate(after);
    expect(store.session.pending(after)).toBeUndefined();
  });
});
