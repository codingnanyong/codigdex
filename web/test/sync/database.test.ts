import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { createEmptySave } from "@codigdex/game-core/save/schema";

const a = "11111111-1111-4111-8111-111111111111";
const b = "22222222-2222-4222-8222-222222222222";
let db: PGlite;
const payload = createEmptySave("ko");
async function asUser(id: string | null) {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id ?? ""]);
  await db.exec("set role authenticated");
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`create role anon; create role authenticated; create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;
    insert into auth.users values ('${a}'), ('${b}');`);
  await db.exec(await readFile(new URL("../../../supabase/migrations/202610230001_game_saves.sql", import.meta.url), "utf8"));
}, 30_000);
afterAll(async () => { await db?.close(); });

describe("actual PostgreSQL save migration", () => {
  it("uses atomic compare-and-set revisions, rejecting duplicate and stale writes", async () => {
    await asUser(a);
    const insert = await db.query<{ value: { revision: number } }>("select public.write_game_save($1, null, $2::jsonb) as value", [a, JSON.stringify(payload)]);
    expect(insert.rows[0].value.revision).toBe(1);
    expect((await db.query<{ value: null }>("select public.write_game_save($1, null, $2::jsonb) as value", [a, JSON.stringify(payload)])).rows[0].value).toBeNull();
    const next = await db.query<{ value: { revision: number } }>("select public.write_game_save($1, 1, $2::jsonb) as value", [a, JSON.stringify(payload)]);
    expect(next.rows[0].value.revision).toBe(2);
    expect((await db.query<{ value: null }>("select public.write_game_save($1, 1, $2::jsonb) as value", [a, JSON.stringify(payload)])).rows[0].value).toBeNull();
  });
  it("enforces RLS and checks account identity inside both RPCs", async () => {
    await asUser(b);
    expect((await db.query("select * from public.game_saves")).rows).toHaveLength(0);
    await expect(db.query("select public.read_game_save($1)", [a])).rejects.toThrow("Not authorized");
    await expect(db.query("select public.write_game_save($1, 2, $2::jsonb)", [a, JSON.stringify(payload)])).rejects.toThrow("Not authorized");
    await expect(db.query("update public.game_saves set revision = 99")).rejects.toThrow(/permission denied/);
    await asUser(a);
    const own = await db.query<{ value: { revision: number } }>("select public.read_game_save($1) as value", [a]);
    expect(own.rows[0].value.revision).toBe(2);
  });
  it("rejects absent identities, anonymous roles and malformed payloads", async () => {
    await asUser(null);
    await expect(db.query("select public.read_game_save($1)", [a])).rejects.toThrow("Not authorized");
    await asUser(a);
    await expect(db.query("select public.write_game_save($1, 2, '{}'::jsonb)", [a])).rejects.toThrow("Invalid save");
    await db.exec("set role anon");
    await expect(db.query("select public.read_game_save($1)", [a])).rejects.toThrow(/permission denied/);
  });
});
