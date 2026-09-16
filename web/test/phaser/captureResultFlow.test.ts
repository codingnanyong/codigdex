import { describe, expect, it } from "vitest";
import { CAREER_REGION_MONSTERS } from "@codigdex/game-content/domain/careerRegionMonsters";
import { resolveCaptureSuccessFlow } from "@/lib/phaser/capture/resultFlow";

describe("capture result flow", () => {
  const fallback = {
    scene: "career-region" as const,
    data: { careerId: "frontend", regionId: "html-css" },
  };
  const region = CAREER_REGION_MONSTERS["html-css"];

  it("returns to the career region after an intermediate checkpoint", () => {
    expect(resolveCaptureSuccessFlow(region[3].id, true, fallback)).toEqual({
      regionCleared: false,
      careerCleared: false,
      target: fallback,
    });
  });

  it("shows completion and returns to the map after the new level-five capture", () => {
    expect(resolveCaptureSuccessFlow(region[4].id, true, fallback)).toEqual({
      regionCleared: true,
      careerCleared: false,
      target: { scene: "world-map" },
    });
  });

  it("keeps a level-five replay in the region", () => {
    expect(resolveCaptureSuccessFlow(region[4].id, false, fallback)).toEqual({
      regionCleared: false,
      careerCleared: false,
      target: fallback,
    });
  });

  it("shows a career clear and opens career selection after the final path capture", () => {
    expect(resolveCaptureSuccessFlow(region[4].id, true, fallback, true)).toEqual({
      regionCleared: true,
      careerCleared: true,
      target: { scene: "job-select" },
    });
  });
});
