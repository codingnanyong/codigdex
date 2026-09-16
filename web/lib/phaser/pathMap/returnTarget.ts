import type { JobId } from "@codigdex/game-content/domain/player/jobs";

export type PathMapReturnTarget =
  | { scene: "world-map" }
  | {
      scene: "career-region";
      data: { careerId: JobId; regionId: string };
    };

/** Path maps opened from a detailed region return there instead of losing context. */
export function pathMapReturnTarget(
  requested?: PathMapReturnTarget
): PathMapReturnTarget {
  return requested ?? { scene: "world-map" };
}
