import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import type { SourceEventSession } from "../openSourceEvents";
import type { CaptureReturnTarget } from "./resultFlow";

type CaptureSceneTarget = CaptureReturnTarget | { scene: "open-source-event"; data?: undefined };
interface ConfirmCaptureContext {
  save: StoredGameStateV3;
  beforeCapture?: StoredGameStateV3;
  monsterId: string;
  fallback: CaptureReturnTarget;
  sourceEventId?: string;
  victoryId?: string;
}

/** Commit the encounter transition once, then let the scene perform only navigation. */
export function confirmCaptureTarget(context: ConfirmCaptureContext, events: Pick<SourceEventSession, "finish" | "queue">): CaptureSceneTarget {
  const { save, beforeCapture, monsterId, fallback, sourceEventId, victoryId } = context;
  if (sourceEventId) return events.finish(save, sourceEventId) ?? fallback;
  if (beforeCapture && events.queue(beforeCapture, save, monsterId, fallback, Math.random, victoryId)) {
    return { scene: "open-source-event" };
  }
  return fallback;
}

export function retryCaptureTarget(sourceEventId: string | undefined, fallback: CaptureReturnTarget): CaptureSceneTarget {
  return sourceEventId ? { scene: "open-source-event" } : fallback;
}
