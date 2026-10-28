import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { CHAPTERS } from "./chapters";
import { OPEN_SOURCE_CATALOG } from "./openSourceCatalog";
import { SOURCE_CAREERS, MAX_PROCESSED_SOURCE_VICTORIES, emptyEncounterHistory, encounterTools, sourceCareer, type SourceCareerId, type SourceEncounter, type SourceEncounterHistory, type SourceReturnTarget } from "./openSourceEncounters";

export interface EncounterStorage { getItem(key: string): string | null; setItem(key: string, value: string): void }

const STORAGE_PREFIX = "codigdex:source-events:v1:";
const LIMITS = {
  raw: 128000,
  stamp: 400,
  id: 128,
  timestamp: 64,
  discoveries: OPEN_SOURCE_CATALOG.length * SOURCE_CAREERS.length,
};
const RETURN_SCENES: readonly SourceReturnTarget["scene"][] = ["world-map", "job-select", "career-region", "promotion-chapter"];
const RETURN_DATA_KEYS = new Set(["careerId", "regionId", "jobId", "monsterId", "focusChapterId"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isBoundedString(value: unknown, limit: number): value is string {
  return typeof value === "string" && value.length <= limit;
}

function isCareer(value: unknown): value is SourceCareerId {
  return typeof value === "string" && !!sourceCareer(value);
}

function isDiscovery(value: unknown): value is Record<string, unknown> & SourceEncounterHistory["discoveries"][number] {
  return isRecord(value) && typeof value.toolId === "string" && isCareer(value.careerId)
    && encounterTools(value.careerId).some(({ id }) => id === value.toolId);
}

function parseReturnTarget(value: unknown): SourceReturnTarget | undefined {
  if (!isRecord(value) || !RETURN_SCENES.some((scene) => scene === value.scene)) return;
  const data = isRecord(value.data) ? Object.fromEntries(Object.entries(value.data)
    .filter(([key, item]) => RETURN_DATA_KEYS.has(key) && isBoundedString(item, LIMITS.id))) : undefined;
  return { scene: value.scene as SourceReturnTarget["scene"], ...(data ? { data } : {}) };
}

function parsePending(value: unknown): SourceEncounter | undefined {
  if (!isRecord(value) || !isDiscovery(value)) return;
  const returnTo = parseReturnTarget(value.returnTo);
  if (!returnTo || !isBoundedString(value.id, LIMITS.stamp)
    || !isBoundedString(value.triggerId, LIMITS.id) || !isBoundedString(value.triggerAt, LIMITS.timestamp)
    || (value.state !== "offered" && value.state !== "active")) return;
  return {
    id: value.id, careerId: value.careerId, toolId: value.toolId,
    triggerId: value.triggerId, triggerAt: value.triggerAt, state: value.state, returnTo,
    ...(isBoundedString(value.victoryId, LIMITS.id) ? { victoryId: value.victoryId } : {}),
  };
}

/** Keep the existing adventure-local key and save-v3 card format. */
export function sourceEventStorageKey(save: StoredGameStateV3) {
  const first = save.progress.captures.find(({ id }) => id === CHAPTERS[0].stages[0].id);
  return first && first.capturedAt.length <= LIMITS.timestamp ? STORAGE_PREFIX + first.capturedAt : undefined;
}

export function parseEncounterHistory(raw: string | null): SourceEncounterHistory {
  const result = emptyEncounterHistory();
  if (!raw || raw.length > LIMITS.raw) return result;
  try {
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value)) return result;
    result.processed = Array.isArray(value.processed)
      ? value.processed.filter((id): id is string => isBoundedString(id, LIMITS.stamp)).slice(-MAX_PROCESSED_SOURCE_VICTORIES) : [];
    result.offeredCareers = Array.isArray(value.offeredCareers) ? [...new Set(value.offeredCareers.filter(isCareer))] : [];
    result.sinceOffer = typeof value.sinceOffer === "number" && Number.isSafeInteger(value.sinceOffer) && value.sinceOffer >= 0
      ? Math.min(MAX_PROCESSED_SOURCE_VICTORIES, value.sinceOffer) : 0;
    result.discoveries = Array.isArray(value.discoveries) ? value.discoveries.filter(isDiscovery).slice(-LIMITS.discoveries) : [];
    result.pending = parsePending(value.pending);
  } catch { /* Broken preference storage must not break the adventure. */ }
  return result;
}
