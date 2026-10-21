import { describe, expect, it } from "vitest";
import { checkpoints, resumeCheckpoint } from "../game/progression";
import { createQaProgress } from "./progress";

describe("QA-only progression presets", () => {
  it("cannot create fixture progress outside a QA session", () => {
    expect(createQaProgress(false, "complete", "ko")).toBeUndefined();
  });
  it.each(["tutorial", "git", "complete"] as const)("loads %s progress with the matching resume destination", (scenario) => {
    const save = createQaProgress(true, scenario, "en")!;
    expect(save.ui.locale).toBe("en");
    expect(save.progress.captures).toHaveLength(scenario === "tutorial" ? 1 : scenario === "git" ? 6 : 11);
    expect(resumeCheckpoint(save).chapter.id).toBe(scenario === "tutorial" ? "git" : "linux");
    if (scenario === "complete") expect(checkpoints(new Set(save.progress.captures.map(({ id }) => id))).every(({ status }) => status === "cleared")).toBe(true);
  });
});
