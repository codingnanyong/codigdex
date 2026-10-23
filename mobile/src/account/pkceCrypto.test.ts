/// <reference types="node" />
import { createHash, randomFillSync } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
vi.mock("expo-crypto", () => ({
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
  getRandomValues: (array: Uint32Array) => randomFillSync(array),
  randomUUID: () => "00000000-0000-4000-8000-000000000000",
  async digest(_algorithm: string, bytes: ArrayBufferView) { return Uint8Array.from(createHash("sha256").update(new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength)).digest()).buffer; },
}));
afterEach(() => { vi.unstubAllGlobals(); });

describe("native OAuth PKCE", () => {
  it("creates an S256 challenge using Expo primitives when Hermes has no WebCrypto", async () => {
    vi.stubGlobal("crypto", undefined);
    await import("./pkceCrypto");
    const client = createClient("https://example.supabase.co", "public-test-key", { auth: { flowType: "pkce", persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    const result = await client.auth.signInWithOAuth({ provider: "github", options: { redirectTo: "codigdex://auth/callback", skipBrowserRedirect: true } });
    expect(result.error).toBeNull();
    const url = new URL(result.data.url!);
    expect(url.searchParams.get("code_challenge_method")).toBe("s256");
    expect(url.searchParams.get("code_challenge")).toHaveLength(43);
  });
});
