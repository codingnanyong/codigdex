import { beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ values: new Map<string, string>(), fail: false }));
vi.mock("expo-secure-store", () => ({
  async getItemAsync(key: string) { return state.values.get(key) ?? null; },
  async setItemAsync(key: string, value: string) { if (state.fail) throw new Error("locked"); state.values.set(key, value); },
  async deleteItemAsync(key: string) { state.values.delete(key); },
}));
import { secureSessionStorage } from "./secureStorage";

beforeEach(() => { state.values.clear(); state.fail = false; });
describe("native secure session storage", () => {
  it("stores a long session in secure chunks, replaces it and removes all chunks on logout", async () => {
    const token = "session".repeat(1000);
    await secureSessionStorage.setItem("session", token);
    expect([...state.values.values()].every((value) => value.length <= 1500)).toBe(true);
    expect(await secureSessionStorage.getItem("session")).toBe(token);
    await secureSessionStorage.setItem("session", "replacement");
    expect(state.values.size).toBe(2);
    expect(await secureSessionStorage.getItem("session")).toBe("replacement");
    await secureSessionStorage.removeItem("session");
    expect(state.values.size).toBe(0);
  });
  it("keeps the prior session when a new secure write fails", async () => {
    await secureSessionStorage.setItem("session", "previous");
    state.fail = true;
    await expect(secureSessionStorage.setItem("session", "next")).rejects.toThrow("locked");
    expect(await secureSessionStorage.getItem("session")).toBe("previous");
  });
});
