import { describe, expect, it } from "vitest";
import { careerQAPresets } from "@codigdex/game-content/domain/careerQAPresets";
import { resumeCheckpoint } from "./progression";
import { destinationFor, mobileDestination, normalizeMobileSave } from "./navigation";

describe("mobile career routing", () => {
  it.each(careerQAPresets("en").filter(({ id }) => id.startsWith("encounter:")))("resumes $id inside the correct career", ({ save }) => {
    const target = destinationFor(save, save.ui.checkpointId!);
    expect(target.scene).toBe(save.player.secondaryJobId ? "promotion-chapter" : "career-region");
    expect(mobileDestination(target).route).toBe("career");
  });

  it("migrates an old expedition bookmark while preserving cards and active career", () => {
    const save = careerQAPresets("en").find(({ id }) => id === "encounter:backend")!.save;
    save.progress.captures.push({ id: "open-source:postgresql", capturedAt: "2026-10-28T00:00:00.000Z" });
    save.ui.checkpointId = "open-source:postgresql";
    const normalized = normalizeMobileSave(save);
    expect(normalized.progress.captures).toEqual(save.progress.captures);
    expect(normalized.player.primaryJobId).toBe("backend");
    expect(resumeCheckpoint(normalized).monster.id).not.toMatch(/^open-source:/);
  });
});
