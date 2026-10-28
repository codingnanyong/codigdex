import { describe, expect, it } from "vitest";
import { MAX_PROCESSED_SOURCE_VICTORIES, type SourceEncounter } from "@codigdex/game-content/domain/openSourceEncounters";
import { parseEncounterHistory } from "@/lib/phaser/openSourceEventStorage";

const pending: SourceEncounter = {
  id: "frontend:career:html-css:1:victory-1", careerId: "frontend", toolId: "tanstack-query",
  triggerId: "career:html-css:1", triggerAt: "2026-10-28T00:00:00.000Z", victoryId: "victory-1",
  state: "offered", returnTo: { scene: "career-region", data: { careerId: "frontend", regionId: "html-css" } },
};

describe("persisted encounter history compatibility", () => {
  it.each(["offered", "active"] as const)("restores an existing %s request with its original return target", (state) => {
    const history = {
      processed: [pending.id], offeredCareers: ["frontend"], sinceOffer: 2,
      discoveries: [{ toolId: pending.toolId, careerId: pending.careerId }], pending: { ...pending, state },
    };
    expect(parseEncounterHistory(JSON.stringify(history))).toEqual(history);
    const legacy = { ...pending, victoryId: undefined, id: `frontend:${pending.triggerId}:${pending.triggerAt}` };
    expect(parseEncounterHistory(JSON.stringify({ pending: legacy })).pending).toEqual(legacy);
  });

  it("preserves valid history while discarding unrelated roles, tools and unsafe return data", () => {
    const parsed = parseEncounterHistory(JSON.stringify({
      processed: [...Array.from({ length: MAX_PROCESSED_SOURCE_VICTORIES + 1 }, (_, i) => `win-${i}`), 5, "x".repeat(401)],
      offeredCareers: ["frontend", "frontend", "missing", null], sinceOffer: 300,
      discoveries: [{ toolId: "tanstack-query", careerId: "frontend" }, { toolId: "postgresql", careerId: "frontend" }, null],
      pending: { ...pending, returnTo: { scene: "career-region", data: { regionId: "html-css", sourceEventId: "forged", monsterId: "x".repeat(129), jobId: 1 } } },
    }));
    expect(parsed.processed).toHaveLength(MAX_PROCESSED_SOURCE_VICTORIES);
    expect(parsed.processed[0]).toBe("win-1");
    expect(parsed.sinceOffer).toBe(MAX_PROCESSED_SOURCE_VICTORIES);
    expect(parsed.offeredCareers).toEqual(["frontend"]);
    expect(parsed.discoveries).toEqual([{ toolId: "tanstack-query", careerId: "frontend" }]);
    expect(parsed.pending?.returnTo).toEqual({ scene: "career-region", data: { regionId: "html-css" } });
  });

  it.each([
    { careerId: "missing" }, { toolId: "postgresql" }, { state: "completed" },
    { id: "x".repeat(401) }, { triggerId: 3 }, { triggerAt: "x".repeat(65) },
    { returnTo: { scene: "code-battle" } }, { returnTo: null },
  ])("rejects a damaged request without losing collected discovery notes: %j", (invalid) => {
    const discoveries = [{ toolId: pending.toolId, careerId: pending.careerId }];
    const parsed = parseEncounterHistory(JSON.stringify({ discoveries, pending: { ...pending, ...invalid } }));
    expect(parsed.pending).toBeUndefined();
    expect(parsed.discoveries).toEqual(discoveries);
  });
});
