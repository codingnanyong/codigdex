// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MusicPlayer } from "@/lib/musicPlayer";
import { MUSIC_PREFERENCES_KEY } from "@codigdex/game-core/domain/musicPreferences";

function mockContext() {
  const sources: { start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn>; loop: boolean }[] = [];
  const context = {
    state: "suspended", currentTime: 10, destination: {},
    resume: vi.fn(async () => { context.state = "running"; }),
    suspend: vi.fn(async () => { context.state = "suspended"; }), close: vi.fn(async () => {}),
    decodeAudioData: vi.fn(async () => ({ duration: 50, length: 1200000, numberOfChannels: 1 })),
    createBufferSource: vi.fn(() => { const source = { start: vi.fn(), stop: vi.fn(), disconnect: vi.fn(), connect: vi.fn(), loop: false }; sources.push(source); return source; }),
    createGain: vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn(), gain: { value: .3, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), cancelScheduledValues: vi.fn(), setTargetAtTime: vi.fn() } })),
  };
  return { context, sources, create: () => context as unknown as AudioContext };
}
const settle = () => new Promise(resolve => setTimeout(resolve, 0));
let player: MusicPlayer;
beforeEach(() => { localStorage.clear(); Object.defineProperty(document, "hidden", { value: false, configurable: true }); vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(2) }))); });
afterEach(() => { player?.dispose(); vi.unstubAllGlobals(); });
describe("game-owned music playback", () => {
  it("waits for a gesture, loops and does not restart the same region", async () => {
    const mock = mockContext(); player = new MusicPlayer(mock.create); player.setRegion("hub:title");
    expect(mock.context.createBufferSource).not.toHaveBeenCalled();
    window.dispatchEvent(new Event("pointerdown")); await settle();
    expect(player.snapshot().playing).toBe(true); expect(mock.sources[0].loop).toBe(true);
    player.setRegion("hub:title"); window.dispatchEvent(new Event("keydown")); await settle();
    expect(mock.sources).toHaveLength(1);
    player.setRegion("hub:world"); await settle();
    expect(mock.sources).toHaveLength(2); expect(mock.sources[0].stop).toHaveBeenCalledWith(10.26);
  });
  it("persists mute and volume and pauses when hidden", async () => {
    const mock = mockContext(); player = new MusicPlayer(mock.create); player.setRegion("common:git");
    window.dispatchEvent(new Event("pointerdown")); await settle();
    player.setPreferences({ enabled: false, volume: .5 }); await settle();
    expect(player.snapshot().playing).toBe(false);
    expect(JSON.parse(localStorage.getItem(MUSIC_PREFERENCES_KEY)!)).toEqual({ enabled: false, volume: .5 });
    player.setPreferences({ enabled: true, volume: .5 }); await settle();
    expect(player.snapshot().playing).toBe(true);
    Object.defineProperty(document, "hidden", { value: true }); document.dispatchEvent(new Event("visibilitychange")); await settle();
    expect(player.snapshot().playing).toBe(false);
    Object.defineProperty(document, "hidden", { value: false }); document.dispatchEvent(new Event("visibilitychange")); await settle();
    expect(player.snapshot().playing).toBe(true); expect(mock.sources).toHaveLength(1);
  });
  it("discards late loads after rapid A → B → A navigation", async () => {
    const mock = mockContext(), resolvers: (() => void)[] = [];
    vi.stubGlobal("fetch", vi.fn(() => new Promise(resolve => resolvers.push(() => resolve({ ok: true, arrayBuffer: async () => new ArrayBuffer(1) })))));
    player = new MusicPlayer(mock.create); player.setRegion("hub:title"); window.dispatchEvent(new Event("pointerdown")); await settle();
    player.setRegion("hub:world"); player.setRegion("hub:title");
    expect(resolvers).toHaveLength(3);
    resolvers[1](); resolvers[0](); await settle(); expect(mock.sources).toHaveLength(0);
    resolvers[2](); await settle(); expect(mock.sources).toHaveLength(1); expect(player.snapshot().region).toBe("hub:title");
  });
  it("keeps gameplay available on fetch failure and retries after a gesture", async () => {
    const mock = mockContext(); vi.mocked(fetch).mockRejectedValueOnce(new Error("offline"));
    player = new MusicPlayer(mock.create); player.setRegion("hub:title"); window.dispatchEvent(new Event("pointerdown")); await settle();
    expect(player.snapshot().error).toBe(true);
    window.dispatchEvent(new Event("pointerdown")); await settle(); expect(player.snapshot().playing).toBe(true);
  });
  it("aborts stale transfers and serializes expensive decodes during rapid navigation", async () => {
    const mock = mockContext(); let finish!: () => void;
    mock.context.decodeAudioData.mockImplementationOnce(() => new Promise(resolve => { finish = () => resolve({ duration: 50, length: 1200000, numberOfChannels: 1 }); }));
    player = new MusicPlayer(mock.create); player.setRegion("hub:title"); window.dispatchEvent(new Event("pointerdown")); await settle();
    const firstSignal = vi.mocked(fetch).mock.calls[0][1]!.signal!;
    player.setRegion("hub:world"); await settle(); player.setRegion("hub:career"); await settle();
    expect(firstSignal.aborted).toBe(true);
    expect(mock.context.decodeAudioData).toHaveBeenCalledOnce();
    finish(); await settle(); await settle();
    expect(mock.context.decodeAudioData).toHaveBeenCalledTimes(2);
    expect(mock.sources).toHaveLength(1); expect(player.snapshot().region).toBe("hub:career");
  });
});
