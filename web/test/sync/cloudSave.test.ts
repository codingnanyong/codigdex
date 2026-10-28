import { describe, expect, it } from "vitest";
import { createEmptySave, parseSave, type StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { mergeSaves } from "@codigdex/game-core/save/merge";
import { createSaveSync, SYNC_METADATA_KEY, type CloudSave, type CloudSaveRemote } from "@codigdex/game-core/save/sync";
import { normalizeGameSave } from "@codigdex/game-content/domain/gameProgress";

const at = "2026-10-23T00:00:00.000Z";
function saved(...ids: string[]): StoredGameStateV3 {
  const result = createEmptySave("ko");
  result.progress.captures = ids.map((id) => ({ id, capturedAt: at }));
  return result;
}
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function backend() {
  const rows = new Map<string, CloudSave>();
  const remote: CloudSaveRemote = {
    async read(userId) { return clone(rows.get(userId) ?? null); },
    async compareAndSet(userId, revision, payload) {
      const current = rows.get(userId);
      if ((current?.revision ?? null) !== revision) return null;
      const result = { revision: (current?.revision ?? 0) + 1, payload: clone(payload) };
      rows.set(userId, result);
      return clone(result);
    },
  };
  return { rows, remote };
}
function device(remote: CloudSaveRemote, initial = saved(), normalize = (save: StoredGameStateV3) => clone(save)) {
  let local = initial;
  const entries = new Map<string, string>();
  let writes = 0;
  const sync = createSaveSync({ remote, storage: { async getItem(key) { return entries.get(key) ?? null; }, async setItem(key, value) { entries.set(key, value); } }, readLocal: () => local, async writeLocal(save) { writes += 1; local = save; }, normalize });
  return { sync, entries, get save() { return local; }, set save(value) { local = value; }, get writes() { return writes; } };
}

describe("cross-device saves", () => {
  it("preserves records from other content versions through a normalized cloud write", async () => {
    const { remote, rows } = backend();
    const cloud = saved("future-cloud-monster");
    const career = { id: "future-cloud-career", unlockedAt: at, masteredAt: at };
    cloud.progress.careers.push(career);
    rows.set("user", { revision: 1, payload: cloud });
    const client = device(remote, saved("local-legacy-monster"), normalizeGameSave);
    expect(await client.sync.sync("user", true)).toBe("synced");
    expect(client.save.progress.captures.map(({ id }) => id)).toEqual(["future-cloud-monster", "local-legacy-monster"]);
    expect(client.save.progress.careers).toContainEqual(career);
    client.save.progress.captures.push({ id: "another-content-version", capturedAt: at });
    expect(await client.sync.sync("user")).toBe("synced");
    expect(rows.get("user")!.payload.progress.captures).toEqual(expect.arrayContaining(client.save.progress.captures));
    expect(rows.get("user")!.payload.progress.captures).toHaveLength(client.save.progress.captures.length);
    expect(rows.get("user")!.payload.progress.careers).toContainEqual(career);
  });
  it("requires attribution and restores both devices' offline captures", async () => {
    const { remote, rows } = backend();
    const web = device(remote, saved("web-first"));
    const mobile = device(remote, saved("mobile-first"));
    expect(await web.sync.sync("user")).toBe("attribution");
    expect(rows.size).toBe(0);
    expect(await web.sync.sync("user", true)).toBe("synced");
    expect(await mobile.sync.sync("user", true)).toBe("synced");
    expect(await web.sync.sync("user")).toBe("synced");
    expect(web.save).toEqual(mobile.save);
    expect(web.save.progress.captures.map(({ id }) => id)).toEqual(["mobile-first", "web-first"]);
    web.save = { ...web.save, progress: { ...web.save.progress, captures: [...web.save.progress.captures, ...saved("web-offline").progress.captures] } };
    mobile.save = { ...mobile.save, progress: { ...mobile.save.progress, captures: [...mobile.save.progress.captures, ...saved("mobile-offline").progress.captures] } };
    await Promise.all([web.sync.sync("user"), mobile.sync.sync("user")]);
    await web.sync.sync("user");
    await mobile.sync.sync("user");
    expect(web.save).toEqual(mobile.save);
    expect(web.save.progress.captures).toHaveLength(4);
    const previousWrites = web.writes;
    await web.sync.sync("user");
    expect(web.writes).toBe(previousWrites);
  });

  it("retries a stale revision and includes input made while the request was in flight", async () => {
    const server = backend();
    let raced = false;
    const web = device({ ...server.remote, async compareAndSet(userId, revision, payload) {
      if (!raced) {
        raced = true;
        web.save = saved("during-request", "web");
        await server.remote.compareAndSet(userId, revision, saved("other-device"));
        return null;
      }
      return server.remote.compareAndSet(userId, revision, payload);
    } }, saved("web"));
    expect(await web.sync.sync("user", true)).toBe("synced");
    expect(web.save.progress.captures.map(({ id }) => id)).toEqual(["during-request", "other-device", "web"]);
  });

  it("backs up account A and never merges it into account B, including after sign-out", async () => {
    const { remote, rows } = backend();
    rows.set("B", { revision: 1, payload: saved("B-only") });
    const client = device(remote, saved("A-only"));
    await client.sync.sync("A", true);
    client.sync.cancel();
    client.save = saved("A-only", "A-offline");
    await client.sync.sync("B");
    expect(client.save.progress.captures.map(({ id }) => id)).toEqual(["B-only"]);
    expect(parseSave(client.entries.get("codigdex:account-backup:A")!)!.progress.captures).toHaveLength(2);
    await client.sync.sync("A");
    expect(client.save.progress.captures.map(({ id }) => id)).toEqual(["A-offline", "A-only"]);
    expect(rows.get("B")!.payload.progress.captures.map(({ id }) => id)).toEqual(["B-only"]);
  });

  it("does not apply an in-flight result after sign-out", async () => {
    let release!: (value: CloudSave | null) => void;
    const client = device({ async read() { return new Promise((resolve) => { release = resolve; }); }, async compareAndSet() { throw new Error("must not write"); } }, saved("local"));
    const pending = client.sync.sync("A", true);
    for (let i = 0; i < 10 && !release; i++) await Promise.resolve();
    client.sync.cancel();
    release({ revision: 1, payload: saved("cloud") });
    expect(await pending).toBe("cancelled");
    expect(client.save.progress.captures.map(({ id }) => id)).toEqual(["local"]);
  });

  it("retains device progress when offline or metadata cannot be read", async () => {
    const client = device({ async read() { throw new Error("offline"); }, async compareAndSet() { return null; } }, saved("offline"));
    await expect(client.sync.sync("A", true)).rejects.toThrow("offline");
    expect(client.save.progress.captures).toEqual(saved("offline").progress.captures);
    client.entries.set(SYNC_METADATA_KEY, "corrupt");
    await expect(client.sync.sync("A")).rejects.toThrow();
    expect(client.save.progress.captures).toEqual(saved("offline").progress.captures);
  });
});

describe("sync request queue without a live database", () => {
  it("keeps guest consent submitted while an automatic sync is pending", async () => {
    const { remote, rows } = backend();
    const client = device(remote, saved("guest-progress"));
    const automatic = client.sync.sync("A");
    const consent = client.sync.sync("A", true);
    expect(await automatic).toBe("attribution");
    expect(await consent).toBe("synced");
    expect(rows.get("A")!.payload.progress.captures).toEqual(saved("guest-progress").progress.captures);
  });

  it("queues a conflict decision and coalesces automatic requests behind it", async () => {
    const server = backend();
    const local = saved("local"), remote = saved("remote");
    local.player.primaryJobId = "frontend";
    remote.player.primaryJobId = "backend";
    server.rows.set("A", { revision: 1, payload: remote });
    const client = device(server.remote, local);
    const initial = client.sync.sync("A", true);
    const decision = client.sync.sync("A", false, "local");
    expect(client.sync.sync("A")).toBe(decision);
    expect(await initial).toBe("conflict");
    expect(await decision).toBe("synced");
    expect(client.save.player.primaryJobId).toBe("frontend");
    expect(server.rows.get("A")!.payload.progress.captures.map(({ id }) => id)).toEqual(["local", "remote"]);
  });

  it("preserves each explicit request in order while sharing automatic requests", async () => {
    const server = backend();
    const entered = deferred<void>(), release = deferred<void>();
    let reads = 0;
    const client = device({ ...server.remote, async read(userId) {
      reads += 1;
      if (reads === 1) { entered.resolve(); await release.promise; }
      return server.remote.read(userId);
    } }, saved("local"));
    const initial = client.sync.sync("A", true);
    await entered.promise;
    expect(client.sync.sync("A")).toBe(initial);
    const consent = client.sync.sync("A", true);
    const decision = client.sync.sync("A", false, "remote");
    expect(consent).not.toBe(initial);
    expect(decision).not.toBe(consent);
    expect(client.sync.sync("A")).toBe(decision);
    expect(reads).toBe(1);
    release.resolve();
    expect(await Promise.all([initial, consent, decision])).toEqual(["synced", "synced", "synced"]);
    expect(reads).toBe(3);
    expect(server.rows.get("A")!.revision).toBe(1);
  });

  it("cancels queued consent and decisions without applying an in-flight response", async () => {
    const entered = deferred<void>(), response = deferred<CloudSave | null>();
    let reads = 0;
    const client = device({ async read() { reads += 1; entered.resolve(); return response.promise; }, async compareAndSet() { throw new Error("cancelled requests must not write"); } }, saved("local"));
    const initial = client.sync.sync("A", true);
    await entered.promise;
    const consent = client.sync.sync("A", true);
    const decision = client.sync.sync("A", false, "remote");
    client.sync.cancel();
    response.resolve({ revision: 1, payload: saved("remote") });
    expect(await Promise.all([initial, consent, decision])).toEqual(["cancelled", "cancelled", "cancelled"]);
    expect(reads).toBe(1);
    expect(client.save.progress.captures).toEqual(saved("local").progress.captures);
    expect(client.writes).toBe(0);
  });

  it("does not revive old queued requests when returning to the same user", async () => {
    const server = backend();
    const entered = deferred<void>(), release = deferred<void>();
    const readers: string[] = [];
    const client = device({ ...server.remote, async read(userId) {
      readers.push(userId);
      if (readers.length === 1) { entered.resolve(); await release.promise; }
      return server.remote.read(userId);
    } }, saved("A-only"));
    const initial = client.sync.sync("A", true);
    await entered.promise;
    const staleA = client.sync.sync("A", true);
    const staleB = client.sync.sync("B", true);
    const currentA = client.sync.sync("A", true);
    release.resolve();
    expect(await Promise.all([initial, staleA, staleB, currentA])).toEqual(["cancelled", "cancelled", "cancelled", "synced"]);
    expect(readers).toEqual(["A", "A"]);
    expect(server.rows.has("B")).toBe(false);
    expect(client.save.progress.captures).toEqual(saved("A-only").progress.captures);
  });

  it("runs an explicit retry after an offline request fails, preserving new local progress", async () => {
    const server = backend();
    const entered = deferred<void>(), response = deferred<CloudSave | null>();
    let reads = 0;
    const client = device({ ...server.remote, async read(userId) {
      reads += 1;
      if (reads === 1) { entered.resolve(); return response.promise; }
      return server.remote.read(userId);
    } }, saved("before-offline"));
    const initial = client.sync.sync("A", true);
    const failed = expect(initial).rejects.toThrow("offline");
    await entered.promise;
    client.save = saved("before-offline", "during-offline");
    const retry = client.sync.sync("A", true);
    response.reject(new Error("offline"));
    await failed;
    expect(await retry).toBe("synced");
    expect(server.rows.get("A")!.payload.progress.captures.map(({ id }) => id)).toEqual(["before-offline", "during-offline"]);
  });

  it("cancels a request before it starts without attributing or changing guest progress", async () => {
    const { remote, rows } = backend();
    const client = device(remote, saved("guest"));
    const pending = client.sync.sync("A", true);
    client.sync.cancel();
    expect(await pending).toBe("cancelled");
    expect(client.entries.size).toBe(0);
    expect(rows.size).toBe(0);
    expect(client.writes).toBe(0);
    expect(client.save.progress.captures).toEqual(saved("guest").progress.captures);
  });

  it("reports cancellation during the final metadata write instead of a stale success", async () => {
    const { remote, rows } = backend();
    const local = saved("local");
    rows.set("A", { revision: 1, payload: local });
    const entered = deferred<void>(), release = deferred<void>();
    const sync = createSaveSync({
      remote,
      storage: {
        async getItem() { return JSON.stringify({ ownerId: "A", base: local, revision: 1 }); },
        async setItem() { entered.resolve(); await release.promise; },
      },
      readLocal: () => local,
      async writeLocal() { throw new Error("unchanged save must not be rewritten"); },
      normalize: clone,
    });
    const pending = sync.sync("A");
    await entered.promise;
    sync.cancel();
    release.resolve();
    expect(await pending).toBe("cancelled");
  });
});

describe("shared merge policy", () => {
  it("requires a decision on divergent careers while preserving captures", () => {
    const local = saved("local"), remote = saved("remote");
    local.player.primaryJobId = "frontend";
    remote.player.primaryJobId = "backend";
    expect(mergeSaves(local, remote).conflicts).toEqual(["primaryJobId"]);
    expect(mergeSaves(local, remote, undefined, "local").save.player.primaryJobId).toBe("frontend");
    const selected = mergeSaves(local, remote, undefined, "remote").save;
    expect(selected.player.primaryJobId).toBe("backend");
    expect(selected.progress.captures).toHaveLength(2);
  });
  it("merges collections commutatively and idempotently, keeping earliest valid times", () => {
    const a = saved("same"), b = saved("same", "new");
    b.progress.captures[0].capturedAt = "2026-10-22T00:00:00.000Z";
    const ab = mergeSaves(a, b).save;
    expect(ab.progress).toEqual(mergeSaves(b, a).save.progress);
    expect(mergeSaves(ab, ab).save).toEqual(ab);
    expect(ab.progress.captures.find(({ id }) => id === "same")!.capturedAt).toBe(b.progress.captures[0].capturedAt);
  });
  it("preserves unknown records and career milestones for either conflict choice", () => {
    const local = saved("legacy-local"), remote = saved("future-remote");
    local.player.primaryJobId = "frontend";
    remote.player.primaryJobId = "backend";
    local.progress.careers = [{ id: "future-career", unlockedAt: at, selectedAt: at }];
    const earlier = "2026-10-22T00:00:00.000Z";
    remote.progress.careers = [{ id: "future-career", unlockedAt: earlier, masteredAt: at }];
    for (const choice of ["local", "remote"] as const) {
      const merged = mergeSaves(local, remote, undefined, choice).save;
      expect(merged.player.primaryJobId).toBe(choice === "local" ? "frontend" : "backend");
      expect(merged.progress.captures.map(({ id }) => id)).toEqual(["future-remote", "legacy-local"]);
      expect(merged.progress.careers).toEqual([{ id: "future-career", unlockedAt: earlier, selectedAt: at, masteredAt: at }]);
      expect(mergeSaves(merged, merged).save).toEqual(merged);
    }
  });
  it("restores the remote bookmark and locale when the local device has not changed them", () => {
    const base = saved(), remote = saved();
    remote.ui.locale = "en"; remote.ui.checkpointId = "git-2";
    expect(mergeSaves(base, remote, base).save.ui).toMatchObject({ locale: "en", checkpointId: "git-2" });
  });
});
