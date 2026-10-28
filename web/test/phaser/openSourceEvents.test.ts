import { describe, expect, it } from "vitest";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { CAREER_PATHS } from "@codigdex/game-content/domain/careerPaths";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { SourceEventSession, parseEncounterHistory, sourceEventStorageKey } from "@/lib/phaser/openSourceEvents";

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

describe("local encounter session", () => {
  it("restores offers and active requests after reload without modifying the game's save", () => {
    const { before, after, trigger, io, values } = fixture();
    const session = new SourceEventSession(io);
    const target = { scene: "career-region" as const, data: { careerId: "frontend", regionId: "html-css" } };
    const pending = session.queue(before, after, trigger, target)!;
    expect(new SourceEventSession(io).pending(after)).toEqual(pending);
    expect(session.canBattle(after, pending.id, "open-source:tanstack-query")).toBe(false);
    expect(session.accept(after, pending.id)).toBe(true);
    const reloaded = new SourceEventSession(io);
    expect(reloaded.canBattle(after, pending.id, "open-source:tanstack-query")).toBe(true);
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
    expect(session.pending(changed)).toBeUndefined();
    expect(session.read(after).discoveries).toHaveLength(1);
    const fresh = structuredClone(after);
    fresh.progress.captures[0].capturedAt = "2026-10-29T00:00:00.000Z";
    expect(sourceEventStorageKey(fresh)).not.toBe(sourceEventStorageKey(after));
    expect(session.read(fresh).discoveries).toEqual([]);
  });

  it("stays playable with damaged/unavailable optional history storage", () => {
    const { before, after, trigger } = fixture();
    for (const raw of [null, "{", "null", JSON.stringify({ pending: { careerId: "frontend", toolId: "postgresql", returnTo: { scene: "code-battle" } } })]) expect(parseEncounterHistory(raw).pending).toBeUndefined();
    const session = new SourceEventSession({ getItem() { throw new Error("unavailable"); }, setItem() { throw new Error("quota"); } });
    const pending = session.queue(before, after, trigger, { scene: "world-map" })!;
    expect(pending).toBeDefined();
    expect(session.accept(after, pending.id)).toBe(true);
    expect(session.finish(after, pending.id)).toEqual({ scene: "world-map" });
  });
});
