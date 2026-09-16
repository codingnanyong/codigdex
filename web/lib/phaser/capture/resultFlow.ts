import { unlockAfter } from "@codigdex/game-content/domain/chapters";

export type CaptureReturnTarget = {
  scene: "world-map" | "job-select" | "career-region";
  data?: Record<string, unknown>;
};

export interface CaptureSuccessFlow {
  regionCleared: boolean;
  careerCleared: boolean;
  target: CaptureReturnTarget;
}

/** Career completion takes priority; otherwise a cleared region exits to its atlas. */
export function resolveCaptureSuccessFlow(
  monsterId: string,
  isNewEntry: boolean,
  fallback: CaptureReturnTarget,
  careerCleared = false
): CaptureSuccessFlow {
  const regionCleared = isNewEntry && unlockAfter(monsterId).kind === "career-region-complete";
  return {
    regionCleared,
    careerCleared,
    target: careerCleared
      ? { scene: "job-select" }
      : regionCleared
        ? { scene: "world-map" }
        : fallback,
  };
}
