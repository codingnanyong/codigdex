import { createEmptySave, parseSave, type StoredGameStateV3 } from "./schema";
import { mergeSaves } from "./merge";

export interface CloudSave { revision: number; payload: StoredGameStateV3 }
export interface CloudSaveRemote {
  read(userId: string): Promise<CloudSave | null>;
  compareAndSet(userId: string, expectedRevision: number | null, payload: StoredGameStateV3): Promise<CloudSave | null>;
}
export interface SyncMetadata { ownerId: string; base: StoredGameStateV3 | null; revision: number | null }
export interface SyncStorage { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> }
export type SyncResult = "synced" | "attribution" | "conflict" | "cancelled";
export const SYNC_METADATA_KEY = "codigdex:cloud:v1";

/** One queue per client; database revisions guard concurrent clients. Local play stays independent. */
export function createSaveSync(options: {
  storage: SyncStorage; remote: CloudSaveRemote;
  readLocal(): StoredGameStateV3; writeLocal(save: StoredGameStateV3): Promise<void>;
  normalize(save: StoredGameStateV3): StoredGameStateV3;
}) {
  let generation = 0;
  let running: Promise<SyncResult> | undefined;
  let activeUser: string | undefined;
  let tail: Promise<unknown> = Promise.resolve();
  // Registries render in catalog order; merge results use ID order. Those
  // representations contain the same progress and must not trigger retries.
  const byId = <T extends { id: string }>(records: readonly T[]) => [...records].sort((a, b) => a.id.localeCompare(b.id));
  const stable = (save: StoredGameStateV3) => JSON.stringify({ ...save, progress: {
    captures: byId(save.progress.captures), careers: byId(save.progress.careers),
  } });
  async function run(userId: string, importGuest: boolean, resolve?: "local" | "remote"): Promise<SyncResult> {
    const turn = generation;
    const alive = () => turn === generation && activeUser === userId;
    const raw = await options.storage.getItem(SYNC_METADATA_KEY);
    let meta: SyncMetadata | undefined;
    if (raw) {
      const value = JSON.parse(raw) as SyncMetadata;
      if (!value || typeof value.ownerId !== "string" || !(value.revision === null || (Number.isSafeInteger(value.revision) && value.revision > 0))) throw new Error("Invalid sync metadata");
      meta = { ...value, base: value.base ? parseSave(JSON.stringify(value.base)) ?? null : null };
    }
    if (!alive()) return "cancelled";
    if (!meta && !importGuest) return "attribution";
    if (meta?.ownerId !== userId) {
      // Account switching never attributes another account's offline progress to the new user.
      if (meta) {
        await options.storage.setItem(`codigdex:account-backup:${meta.ownerId}`, stable(options.readLocal()));
        if (!alive()) return "cancelled";
        const backup = await options.storage.getItem(`codigdex:account-backup:${userId}`);
        if (!alive()) return "cancelled";
        await options.writeLocal(backup ? parseSave(backup) ?? createEmptySave() : createEmptySave());
        if (!alive()) return "cancelled";
      }
      meta = { ownerId: userId, base: null, revision: null };
      await options.storage.setItem(SYNC_METADATA_KEY, JSON.stringify(meta));
    }
    if (!alive()) return "cancelled";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const remote = await options.remote.read(userId);
      if (!alive()) return "cancelled";
      const local = options.readLocal();
      const merged = remote ? mergeSaves(local, remote.payload, meta.base ?? createEmptySave(), resolve) : { save: local, conflicts: [] };
      if (merged.conflicts.length && !resolve) return "conflict";
      const payload = options.normalize(merged.save);
      const confirmed = remote && stable(payload) === stable(options.normalize(remote.payload)) ? remote : await options.remote.compareAndSet(userId, remote?.revision ?? null, payload);
      if (!alive()) return "cancelled";
      if (!confirmed) continue;
      // Input can continue while a request is in flight. Merge those new captures before applying.
      const current = options.readLocal();
      const changed = stable(current) !== stable(local);
      const latest = changed ? mergeSaves(current, payload, local) : { save: payload, conflicts: [] };
      if (latest.conflicts.length) return "conflict";
      const applied = options.normalize(latest.save);
      if (stable(applied) !== stable(current)) await options.writeLocal(applied);
      if (!alive()) return "cancelled";
      meta = { ownerId: userId, base: payload, revision: confirmed.revision };
      await options.storage.setItem(SYNC_METADATA_KEY, JSON.stringify(meta));
      if (stable(options.readLocal()) !== stable(applied)) continue;
      if (changed && stable(applied) !== stable(payload)) continue;
      return "synced";
    }
    throw new Error("Cloud save changed repeatedly; retry later");
  }
  return {
    cancel() { generation += 1; activeUser = undefined; running = undefined; },
    sync(userId: string, importGuest = false, resolve?: "local" | "remote"): Promise<SyncResult> {
      if (activeUser !== userId) { generation += 1; activeUser = userId; running = undefined; }
      if (running) return running;
      const pending = tail.catch(() => undefined).then(() => run(userId, importGuest, resolve));
      tail = pending;
      running = pending;
      void pending.finally(() => { if (running === pending) running = undefined; }).catch(() => undefined);
      return pending;
    },
  };
}
