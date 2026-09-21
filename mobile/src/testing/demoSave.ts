import { DEX_MONSTERS } from "@codigdex/game-content/domain/chapters";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";

const DEMO_CAPTURED_AT = "2026-01-01T00:00:00.000Z";
const DEMO_CAPTURE_COUNT = 3;

export function createDemoSave(current: StoredGameStateV3): StoredGameStateV3 {
  const existing = new Map(current.progress.captures.map((capture) => [capture.id, capture]));
  for (const monster of DEX_MONSTERS.slice(0, DEMO_CAPTURE_COUNT)) {
    if (!existing.has(monster.id)) {
      existing.set(monster.id, { id: monster.id, capturedAt: DEMO_CAPTURED_AT });
    }
  }

  return {
    ...current,
    progress: {
      ...current.progress,
      captures: [...existing.values()],
    },
  };
}

export function clearCapturedMonsters(current: StoredGameStateV3): StoredGameStateV3 {
  return {
    ...current,
    progress: {
      ...current.progress,
      captures: [],
    },
  };
}
