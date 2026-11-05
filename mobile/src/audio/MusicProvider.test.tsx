// @vitest-environment happy-dom
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MusicProvider } from "./MusicProvider";
import { useMusic, useRegionMusic, type MusicControls } from "./MusicContext";

const mocks = vi.hoisted(() => ({
  player: { pause: vi.fn(), play: vi.fn(), replace: vi.fn(), volume: 0, loop: false },
  get: vi.fn(async () => '{"enabled":false,"volume":0.5}'), set: vi.fn(async () => {}),
  listener: undefined as undefined | ((state: string) => void), remove: vi.fn(), mode: vi.fn(async () => {}),
}));
vi.mock("react-native", () => ({ AppState: { currentState: "active", addEventListener: (_: string, callback: (state: string) => void) => { mocks.listener = callback; return { remove: mocks.remove }; } } }));
vi.mock("@react-native-async-storage/async-storage", () => ({ default: { getItem: mocks.get, setItem: mocks.set } }));
vi.mock("expo-audio", () => ({ useAudioPlayer: () => mocks.player, useAudioPlayerStatus: () => ({ isLoaded: true }), setAudioModeAsync: mocks.mode }));
vi.mock("../audio.generated", () => ({ AUDIO_ASSETS: new Proxy({}, { get: (_, key) => () => key }) }));
let controls: MusicControls;
let root: Root;
function Harness({ region = "hub:title", nested }: { region?: string; nested?: string }) {
  controls = useMusic(); useRegionMusic(region);
  return nested ? <Region region={nested} /> : null;
}
function Region({ region }: { region: string }) { useRegionMusic(region, 10); return null; }
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  root = createRoot(document.createElement("div"));
  vi.clearAllMocks();
});
afterEach(async () => { await act(async () => root.unmount()); vi.unstubAllGlobals(); });
const render = (region?: string, nested?: string) => act(async () => { root.render(<MusicProvider><Harness region={region} nested={nested} /></MusicProvider>); });
it("restores muted settings, uses one player and pauses while backgrounded", async () => {
  await render();
  expect(controls.preferences).toEqual({ enabled: false, volume: .5 });
  expect(mocks.player.play).not.toHaveBeenCalled(); expect(mocks.player.loop).toBe(true);
  await act(async () => controls.setPreferences({ enabled: true, volume: .25 }));
  expect(mocks.player.volume).toBe(.25); expect(mocks.player.play).toHaveBeenCalled();
  expect(mocks.set).toHaveBeenLastCalledWith("codigdex:music:v1", '{"enabled":true,"volume":0.25}');
  await act(async () => mocks.listener?.("background")); expect(mocks.player.pause).toHaveBeenCalled();
  mocks.player.play.mockClear();
  await act(async () => mocks.listener?.("active")); expect(mocks.player.play).toHaveBeenCalledOnce();
  expect(mocks.mode).toHaveBeenCalledWith(expect.objectContaining({ shouldPlayInBackground: false, allowsRecording: false, playsInSilentMode: false }));
});
it("lets the entered region override the hub and keeps the same track through rerenders", async () => {
  await render("hub:career", "career:devops:network");
  expect(controls.title).toBe("패킷 바람의 다리");
  const replaced = mocks.player.replace.mock.calls.length;
  await render("hub:career", "career:devops:network"); expect(mocks.player.replace).toHaveBeenCalledTimes(replaced);
  await render("hub:career", "career:backend:network"); expect(controls.title).toBe("지하 케이블의 맥박");
  await render("hub:career"); expect(controls.title).toBe("길드의 오후");
});

it.each([
  { saved: { enabled: true, volume: .8 }, chosen: { enabled: false, volume: .2 } },
  { saved: { enabled: false, volume: .2 }, chosen: { enabled: true, volume: .8 } },
])("preserves an early user choice $chosen when the saved settings arrive late", async ({ saved, chosen }) => {
  let finishRead!: (raw: string) => void;
  mocks.get.mockImplementationOnce(() => new Promise<string>(resolve => { finishRead = resolve; }));
  await render();
  await act(async () => controls.setPreferences(chosen));
  expect(controls.preferences).toEqual(chosen);
  mocks.player.play.mockClear();

  await act(async () => finishRead(JSON.stringify(saved)));

  expect(controls.preferences).toEqual(chosen);
  expect(mocks.player.volume).toBe(chosen.volume);
  expect(mocks.set).toHaveBeenLastCalledWith("codigdex:music:v1", JSON.stringify(chosen));
  if (chosen.enabled) expect(mocks.player.play).toHaveBeenCalled();
  else expect(mocks.player.play).not.toHaveBeenCalled();
});

it.each([
  { saved: { enabled: false, volume: .2 }, chosen: { volume: .75 }, expected: { enabled: false, volume: .75 } },
  { saved: { enabled: true, volume: .8 }, chosen: { enabled: false }, expected: { enabled: false, volume: .8 } },
])("preserves untouched saved fields when the early change is $chosen", async ({ saved, chosen, expected }) => {
  let finishRead!: (raw: string) => void;
  mocks.get.mockImplementationOnce(() => new Promise<string>(resolve => { finishRead = resolve; }));
  await render();
  await act(async () => controls.setPreferences(chosen));
  mocks.player.play.mockClear();
  await act(async () => finishRead(JSON.stringify(saved)));
  expect(controls.preferences).toEqual(expected);
  expect(mocks.player.volume).toBe(expected.volume);
  expect(mocks.player.play).not.toHaveBeenCalled();
  expect(mocks.set).toHaveBeenLastCalledWith("codigdex:music:v1", JSON.stringify(expected));
});

it("keeps consecutive early changes when the saved-settings read fails", async () => {
  let failRead!: (error: Error) => void;
  mocks.get.mockImplementationOnce(() => new Promise<string>((_, reject) => { failRead = reject; }));
  await render();
  await act(async () => {
    controls.setPreferences({ enabled: false });
    controls.setPreferences({ volume: .75 });
  });
  await act(async () => failRead(new Error("Storage unavailable")));
  expect(controls.preferences).toEqual({ enabled: false, volume: .75 });
  expect(mocks.set).toHaveBeenLastCalledWith("codigdex:music:v1", '{"enabled":false,"volume":0.75}');
  expect(mocks.player.play).not.toHaveBeenCalled();
});
