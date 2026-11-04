import { expect, it } from "vitest";
import { AudioBufferCache } from "@/lib/audioBufferCache";
const buffer = (samples: number, channels = 1) => ({ length: samples, numberOfChannels: channels }) as AudioBuffer;
it("bounds decoded PCM by bytes, evicts least-recently-used music and skips oversized buffers", () => {
  const cache = new AudioBufferCache(24);
  const a = buffer(2), b = buffer(2), c = buffer(2, 2);
  cache.set("a", a); cache.set("b", b); expect(cache.get("a")).toBe(a);
  cache.set("c", c); expect(cache.get("b")).toBeUndefined(); expect(cache.get("a")).toBe(a);
  cache.set("oversized", buffer(20)); expect(cache.get("oversized")).toBeUndefined(); expect(cache.get("c")).toBe(c);
  cache.clear(); cache.set("new", buffer(6)); expect(cache.get("new")).toBeDefined(); expect(cache.get("a")).toBeUndefined();
});
