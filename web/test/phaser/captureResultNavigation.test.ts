import { describe, expect, it } from "vitest";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { CAREER_REGION_MONSTERS } from "@codigdex/game-content/domain/careerRegionMonsters";
import { SourceEventSession } from "@/lib/phaser/openSourceEvents";
import { confirmCaptureTarget, retryCaptureTarget } from "@/lib/phaser/capture/resultNavigation";

function victory() {
  const beforeCapture = createEmptySave("en");
  beforeCapture.player.primaryJobId = "frontend";
  beforeCapture.progress.captures = CHAPTERS.flatMap(({ stages }) => stages.map(({ id }) => ({ id, capturedAt: "2026-10-28T00:00:00.000Z" })));
  const monsterId = CAREER_REGION_MONSTERS["html-css"][0].id;
  const save = structuredClone(beforeCapture);
  save.progress.captures.push({ id: monsterId, capturedAt: "2026-10-28T01:00:00.000Z" });
  save.ui.checkpointId = CAREER_REGION_MONSTERS["html-css"][1].id;
  const fallback = { scene: "career-region" as const, data: { careerId: "frontend", regionId: "html-css" } };
  return { beforeCapture, save, monsterId, fallback, victoryId: "victory-1" };
}

describe("capture navigation with the real encounter session", () => {
  it("does not reroll or count a victory twice when confirmation follows settlement", () => {
    const context = victory();
    const events = new SourceEventSession();
    const pending = events.queue(context.beforeCapture, context.save, context.monsterId, context.fallback, () => 0, context.victoryId)!;
    const history = JSON.stringify(events.read(context.save));
    expect(confirmCaptureTarget(context, events)).toEqual({ scene: "open-source-event" });
    expect(events.pending(context.save)?.id).toBe(pending.id);
    expect(JSON.stringify(events.read(context.save))).toBe(history);
  });
  it("offers a career request on confirm without modifying cards or the normal checkpoint", () => {
    const context = victory();
    const snapshot = JSON.stringify(context.save);
    const events = new SourceEventSession();
    expect(confirmCaptureTarget(context, events)).toEqual({ scene: "open-source-event" });
    expect(events.pending(context.save)).toMatchObject({ toolId: "tanstack-query", returnTo: context.fallback });
    expect(JSON.stringify(context.save)).toBe(snapshot);
  });

  it("finishes the accepted request at its stored career target, and retry keeps it active", () => {
    const context = victory();
    const events = new SourceEventSession();
    confirmCaptureTarget(context, events);
    const pending = events.pending(context.save)!;
    events.accept(context.save, pending.id);
    expect(retryCaptureTarget(pending.id, { scene: "world-map" })).toEqual({ scene: "open-source-event" });
    expect(events.pending(context.save)?.state).toBe("active");
    const completed = structuredClone(context.save);
    completed.progress.captures.push({ id: "open-source:tanstack-query", capturedAt: "2026-10-28T02:00:00.000Z" });
    expect(confirmCaptureTarget({ ...context, save: completed, monsterId: "open-source:tanstack-query", sourceEventId: pending.id, fallback: { scene: "world-map" } }, events)).toEqual(context.fallback);
    expect(events.pending(completed)).toBeUndefined();
    expect(completed.ui.checkpointId).toBe(context.save.ui.checkpointId);
    expect(events.read(completed).processed).toHaveLength(1);
  });

  it("returns normally during cooldown and preserves normal failed-battle destinations", () => {
    const context = victory();
    const events = new SourceEventSession();
    confirmCaptureTarget(context, events);
    events.finish(context.save, events.pending(context.save)!.id);
    expect(confirmCaptureTarget({ ...context, beforeCapture: context.save, victoryId: "practice-2" }, events)).toEqual(context.fallback);
    for (const fallback of [context.fallback, { scene: "promotion-chapter" as const, data: { careerId: "platform-engineer" } }]) {
      expect(retryCaptureTarget(undefined, fallback)).toEqual(fallback);
    }
  });

  it("uses the supplied fallback for missing capture context or expired encounters", () => {
    const context = victory();
    const events = new SourceEventSession();
    expect(confirmCaptureTarget({ ...context, beforeCapture: undefined }, events)).toEqual(context.fallback);
    expect(confirmCaptureTarget({ ...context, sourceEventId: "expired" }, events)).toEqual(context.fallback);
    expect(events.read(context.save).processed).toEqual([]);
  });
});
