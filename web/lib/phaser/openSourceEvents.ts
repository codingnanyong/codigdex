import type Phaser from "phaser";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { activeSourceCareer, emptyEncounterHistory, planSourceEncounter, type SourceEncounter, type SourceEncounterHistory, type SourceReturnTarget } from "@codigdex/game-content/domain/openSourceEncounters";

import { parseEncounterHistory, sourceEventStorageKey, type EncounterStorage } from "./openSourceEventStorage";

export const SOURCE_EVENTS_CHANGED = "codigdex-source-events-changed";
export class SourceEventSession {
  private key?: string;
  private history = emptyEncounterHistory();
  constructor(private readonly storage?: EncounterStorage, private readonly notify: () => void = () => undefined) {}

  read(save: StoredGameStateV3): SourceEncounterHistory {
    const key = sourceEventStorageKey(save);
    if (key !== this.key) {
      this.key = key;
      try { this.history = parseEncounterHistory(key ? this.storage?.getItem(key) ?? null : null); }
      catch { this.history = emptyEncounterHistory(); }
    }
    return this.history;
  }

  private write(save: StoredGameStateV3, history: SourceEncounterHistory) {
    this.read(save);
    this.history = history;
    try { if (this.key) this.storage?.setItem(this.key, JSON.stringify(history)); } catch { /* Keep this session usable when storage is unavailable. */ }
    this.notify();
  }

  /** Query only: no storage writes or notifications. */
  pending(save: StoredGameStateV3): SourceEncounter | undefined {
    const pending = this.read(save).pending;
    if (!pending) return;
    if (activeSourceCareer(save) !== pending.careerId || !save.progress.captures.some(({ id, capturedAt }) => id === pending.triggerId && capturedAt === pending.triggerAt) || pending.id !== `${pending.careerId}:${pending.triggerId}:${pending.victoryId ?? pending.triggerAt}`) {
      return;
    }
    return pending;
  }

  /** Explicitly discard stale state when resuming or changing an encounter. */
  resolvePending(save: StoredGameStateV3) {
    const pending = this.pending(save);
    if (!pending && this.history.pending) this.write(save, { ...this.history, pending: undefined });
    return pending;
  }

  queue(before: StoredGameStateV3, after: StoredGameStateV3, triggerId: string, target: SourceReturnTarget, random = Math.random, victoryId?: string) {
    this.resolvePending(after);
    const history = this.read(after);
    const next = planSourceEncounter(before, after, triggerId, target, history, random, victoryId);
    if (next !== history) this.write(after, next);
    return this.pending(after);
  }

  accept(save: StoredGameStateV3, id: string) {
    const pending = this.resolvePending(save);
    if (!pending || pending.id !== id) return false;
    this.write(save, { ...this.history, pending: { ...pending, state: "active" } });
    return true;
  }

  finish(save: StoredGameStateV3, id: string) {
    const pending = this.resolvePending(save);
    if (!pending || pending.id !== id) return;
    this.write(save, { ...this.history, pending: undefined });
    return pending.returnTo;
  }

  canBattle(save: StoredGameStateV3, id: string | undefined, monsterId: string) {
    const pending = this.pending(save);
    return !!id && pending?.id === id && pending.state === "active" && monsterId === `open-source:${pending.toolId}`;
  }
}

const sessions = new WeakMap<Phaser.Data.DataManager, SourceEventSession>();
export function sourceEvents(registry: Phaser.Data.DataManager) {
  let session = sessions.get(registry);
  if (!session) {
    let storage: EncounterStorage | undefined;
    try { if (typeof window !== "undefined") storage = window.localStorage; } catch { /* Optional local event history. */ }
    session = new SourceEventSession(storage, () => { if (typeof window !== "undefined") window.dispatchEvent(new Event(SOURCE_EVENTS_CHANGED)); });
    sessions.set(registry, session);
  }
  return session;
}

export function discoveredSourceIds(registry: Phaser.Data.DataManager, save: StoredGameStateV3) {
  return new Set([...sourceEvents(registry).read(save).discoveries.map(({ toolId }) => toolId), ...save.progress.captures.filter(({ id }) => id.startsWith("open-source:")).map(({ id }) => id.slice("open-source:".length))]);
}
