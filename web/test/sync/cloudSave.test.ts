import { describe, expect, it } from "vitest";
import { createEmptySave, parseSave, type StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { mergeSaves } from "@codigdex/game-core/save/merge";
import { createSaveSync, SYNC_METADATA_KEY, type CloudSave, type CloudSaveRemote } from "@codigdex/game-core/save/sync";

const at = "2026-10-23T00:00:00.000Z";
function saved(...ids: string[]): StoredGameStateV3 {
  const result = createEmptySave("ko");
  result.progress.captures = ids.map((id) => ({ id, capturedAt: at }));
  return result;
}
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
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
function device(remote: CloudSaveRemote, initial = saved()) {
  let local = initial;
  const entries = new Map<string, string>();
  let writes = 0;
  const sync = createSaveSync({ remote, storage: { async getItem(key) { return entries.get(key) ?? null; }, async setItem(key, value) { entries.set(key, value); } }, readLocal: () => local, async writeLocal(save) { writes += 1; local = save; }, normalize: (save) => clone(save) });
  return { sync, entries, get save() { return local; }, set save(value) { local = value; }, get writes() { return writes; } };
}

describe("cross-device saves", () => {
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
  it("restores the remote bookmark and locale when the local device has not changed them", () => {
    const base = saved(), remote = saved();
    remote.ui.locale = "en"; remote.ui.checkpointId = "git-2";
    expect(mergeSaves(base, remote, base).save.ui).toMatchObject({ locale: "en", checkpointId: "git-2" });
  });
});
