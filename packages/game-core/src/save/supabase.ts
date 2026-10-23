import { parseSave } from "./schema";
import type { CloudSave, CloudSaveRemote } from "./sync";

interface RpcClient { rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: unknown }> }

function cloudSave(value: unknown): CloudSave | null {
  if (value === null) return null;
  if (!value || typeof value !== "object") throw new Error("Invalid cloud save");
  const row = value as Record<string, unknown>;
  const revision = Number(row.revision);
  const payload = parseSave(JSON.stringify(row.payload));
  if (!Number.isSafeInteger(revision) || revision < 1 || !payload) throw new Error("Invalid cloud save");
  return { revision, payload };
}

/** The RPC also checks the expected user against auth.uid(), including during account switches. */
export function createSupabaseRemote(client: RpcClient): CloudSaveRemote {
  return {
    async read(userId) {
      const { data, error } = await client.rpc("read_game_save", { p_user_id: userId });
      if (error) throw new Error("Could not read cloud save");
      return cloudSave(data);
    },
    async compareAndSet(userId, expectedRevision, payload) {
      const { data, error } = await client.rpc("write_game_save", { p_user_id: userId, p_expected_revision: expectedRevision, p_payload: payload });
      if (error) throw new Error("Could not write cloud save");
      return cloudSave(data);
    },
  };
}
