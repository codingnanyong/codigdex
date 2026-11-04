import { afterEach, expect, it, vi } from "vitest";
import { createMusicContext } from "@/lib/audioContext";
afterEach(() => vi.unstubAllGlobals());
it("requests the original chiptune rate to avoid storing upsampled PCM", () => {
  const seen: (AudioContextOptions | undefined)[] = [];
  vi.stubGlobal("AudioContext", class { constructor(options?: AudioContextOptions) { seen.push(options); } });
  createMusicContext(); expect(seen).toEqual([{ sampleRate: 24000 }]);
});
it("falls back to the output device rate when 24 kHz is unsupported", () => {
  const seen: (AudioContextOptions | undefined)[] = [];
  vi.stubGlobal("AudioContext", class { constructor(options?: AudioContextOptions) { seen.push(options); if (options) throw new Error("Unsupported sample rate"); } });
  createMusicContext(); expect(seen).toEqual([{ sampleRate: 24000 }, undefined]);
});
