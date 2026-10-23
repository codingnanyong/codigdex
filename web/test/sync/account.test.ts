// @vitest-environment happy-dom
import { act, createElement, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { afterEach, describe, expect, it } from "vitest";
import { useAccount } from "@codigdex/game-account";
import { createEmptySave, type StoredGameStateV3 } from "@codigdex/game-core/save/schema";

let root: Root;
let account: ReturnType<typeof useAccount>;
afterEach(async () => { await act(async () => { root?.unmount(); }); });

describe("shared account lifecycle", () => {
  it("waits for attribution, syncs without a render loop and survives sign-out", async () => {
    let row: { revision: number; payload: StoredGameStateV3 } | null = null;
    let callback: (event: string, session: unknown) => void = () => {};
    let writes = 0;
    const client = { auth: {
      async getSession() { return { data: { session: { user: { id: "A" } } }, error: null }; },
      onAuthStateChange(fn: typeof callback) { callback = fn; return { data: { subscription: { unsubscribe() {} } } }; },
      async signOut() { callback("SIGNED_OUT", null); return { error: null }; },
    }, async rpc(name: string, params: Record<string, unknown>) {
      if (name === "read_game_save") return { data: row, error: null };
      writes += 1;
      row = { revision: (row?.revision ?? 0) + 1, payload: params.p_payload as StoredGameStateV3 };
      return { data: row, error: null };
    } } as unknown as SupabaseClient;
    const values = new Map<string, string>();
    function Host() {
      const [save, setSave] = useState(createEmptySave("ko"));
      account = useAccount({ client, save, storage: { async getItem(key) { return values.get(key) ?? null; }, async setItem(key, value) { values.set(key, value); } }, async writeSave(next) { setSave(next); }, async openAuth() {} });
      return null;
    }
    root = createRoot(document.createElement("div"));
    await act(async () => { root.render(createElement(Host)); });
    await act(async () => { await account.sync(); });
    expect(account.status).toBe("attribution");
    expect(row).toBeNull();
    await act(async () => { await account.sync(true); });
    expect(account.status).toBe("synced");
    const priorWrites = writes;
    await act(async () => { await account.sync(); });
    expect(account.status).toBe("synced");
    expect(writes).toBe(priorWrites);
    await act(async () => { await account.signOut(); });
    expect(account.session).toBeNull();
    expect(account.status).toBe("signed-out");
  });
});
