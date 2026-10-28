import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { SourceEventSession } from "@codigdex/game-content/domain/openSourceEncounterSession";
import { sourceEventStorageKey } from "@codigdex/game-content/domain/openSourceEncounterStorage";
import type { AsyncStringStorage } from "./saveStorage";

/** Adapt the shared synchronous rules to hydrated, namespaced AsyncStorage and FIFO writes. */
export class MobileSourceEventStore {
  readonly session: SourceEventSession;
  private cache = new Map<string, string | null>();
  private activeKey?: string;
  private failed = new Set<string>();
  private pending = 0;
  private writes = Promise.resolve();

  constructor(private readonly storage: Pick<AsyncStringStorage, "getItem" | "setItem">, private readonly changed: () => void = () => {}, private readonly namespace?: string) {
    this.session = new SourceEventSession({
      getItem: (key) => this.cache.get(key) ?? null,
      setItem: (key, raw) => { this.cache.set(key, raw); void this.persist(key, raw).catch(() => undefined); },
    }, changed);
  }

  get saving() { return this.pending > 0; }
  get error() { return !!this.activeKey && this.failed.has(this.activeKey); }
  private storageKey(key: string) { return this.namespace ? `${this.namespace}:${key}` : key; }

  /** Read before displaying or importing a save. A failed read must remain retryable. */
  async load(save: StoredGameStateV3) {
    const key = sourceEventStorageKey(save);
    if (key && !this.cache.has(key)) {
      const raw = await this.storage.getItem(this.storageKey(key));
      if (!this.cache.has(key)) this.cache.set(key, raw);
    }
  }

  activate(save: StoredGameStateV3) {
    this.activeKey = sourceEventStorageKey(save);
    this.session.resolvePending(save);
  }

  /** Only a new tutorial capture or reset creates a key during ordinary local updates. */
  prepareNewAdventure(before: StoredGameStateV3, after: StoredGameStateV3) {
    const key = sourceEventStorageKey(after);
    if (key && !sourceEventStorageKey(before) && !this.cache.has(key)) this.cache.set(key, null);
    this.activate(after);
  }

  private persist(key: string, raw: string) {
    this.pending++;
    this.changed();
    const write = this.writes.then(() => this.storage.setItem(this.storageKey(key), raw));
    const settled = write.then(() => this.failed.delete(key), () => { this.failed.add(key); });
    this.writes = settled.then(() => undefined);
    return write.finally(() => { this.pending--; this.changed(); });
  }

  async retry(save: StoredGameStateV3) {
    const key = sourceEventStorageKey(save);
    const raw = key ? this.cache.get(key) : null;
    if (key && raw != null) await this.persist(key, raw);
  }
}
