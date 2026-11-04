import { expect, it, vi } from "vitest";
import { PackCache } from "../../../packages/quiz-content/src/packCache";
import type { QuizPack } from "@codigdex/quiz-content";
const pack = {} as QuizPack;
it("shares concurrent loads and retains only recently used normalized packs", async () => {
  const cache = new PackCache(2), load = vi.fn(async () => pack);
  const first = cache.load("a", load); expect(cache.load("a", load)).toBe(first); await first;
  await cache.load("b", load); cache.load("a", load); await cache.load("c", load);
  expect(cache.load("a", load)).toBe(first);
  await cache.load("b", load); expect(load).toHaveBeenCalledTimes(4);
});
it("retries a failed load without letting an older failure erase its replacement", async () => {
  const cache = new PackCache(1);
  let reject!: (reason: Error) => void;
  const failed = cache.load("a", () => new Promise((_, fail) => { reject = fail; }));
  await Promise.resolve(); await cache.load("b", async () => pack);
  const replacement = cache.load("a", async () => pack);
  reject(new Error("offline")); await expect(failed).rejects.toThrow("offline"); await replacement;
  expect(cache.load("a", async () => pack)).toBe(replacement);
});
