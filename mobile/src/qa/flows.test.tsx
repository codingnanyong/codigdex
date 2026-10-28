// @vitest-environment happy-dom
/// <reference types="node" />
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseAllDocuments } from "yaml";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Alert } from "react-native";
import { NativeGame } from "../game/NativeGame";
import { SaveProvider, useSave } from "../state/SaveProvider";
import { careerQAPresets } from "@codigdex/game-content/domain/careerQAPresets";
import { SOURCE_CAREERS } from "@codigdex/game-content/domain/openSourceEncounters";
import { findStage } from "@codigdex/game-content/domain/chapters";
import { findOpenSource } from "@codigdex/game-content/domain/openSourceCatalog";
import { loadMixedQuizPack } from "@codigdex/quiz-content";
import { quizCopy } from "../game/battlePresentation";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { qaFaults } from "./runtime";
import { sourceEventStorageKey } from "@codigdex/game-content/domain/openSourceEncounterStorage";

const storage = vi.hoisted(() => new Map<string, string>());
const sourceFaults = vi.hoisted(() => ({ read: false, blockKey: undefined as string | undefined, blockRead: undefined as Promise<void> | undefined }));
vi.mock("@react-native-async-storage/async-storage", () => ({ default: {
  async getItem(key: string) { if (sourceFaults.read && key.includes("source-events:")) { sourceFaults.read = false; throw Error("history read failed"); } if (key === sourceFaults.blockKey) await sourceFaults.blockRead; return storage.get(key) ?? null; },
  async setItem(key: string, value: string) { storage.set(key, value); },
  async removeItem(key: string) { storage.delete(key); },
} }));
vi.mock("./runtime", async (original) => {
  const runtime = await original<typeof import("./runtime")>();
  return { ...runtime, QA_ENABLED: true, E2E_ENABLED: true, E2E_REVISION: "host-check", qaFaults: runtime.createQaFaults(true) };
});
vi.mock("@/account/AccountPanel", () => ({ AccountPanel: () => null }));
vi.mock("@/assets", () => ({ mobileAssetSource: () => ({ uri: "test-image" }) }));
vi.mock("../ui/PixelScene", () => ({ PixelScene: ({ scene }: { scene: string }) => <div data-pixel-scene={scene} /> }));
vi.mock("../ui/Screen", () => ({ Screen: ({ children }: { children: React.ReactNode }) => <main>{children}</main> }));
vi.mock("react-native-safe-area-context", () => ({ useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }) }));
vi.mock("react-native", async () => {
  const R = await import("react");
  type Props = { children?: React.ReactNode; testID?: string; accessibilityLabel?: string; disabled?: boolean; value?: string;
    onPress?(): void; onChangeText?(value: string): void; onFocus?(): void; renderItem?(item: { item: unknown }): React.ReactNode; data?: unknown[] };
  const View = ({ children, testID }: Props) => <div data-testid={testID}>{children}</div>;
  const Text = ({ children, testID }: Props) => <span data-testid={testID}>{children}</span>;
  const Pressable = ({ children, testID, accessibilityLabel, disabled, onPress }: Props) => <button data-testid={testID} aria-label={accessibilityLabel} disabled={disabled} onClick={onPress}>{children}</button>;
  const TextInput = ({ testID, value, onChangeText, onFocus }: Props) => <input data-testid={testID} value={value} onInput={(event) => onChangeText?.(event.currentTarget.value)} onFocus={onFocus} />;
  const ScrollView = R.forwardRef(function Scroll(props: Props, ref) {
    R.useImperativeHandle(ref, () => ({ scrollTo() {}, scrollToEnd() {} }));
    return <View {...props} />;
  });
  return { View, Text, Pressable, TextInput, ScrollView, KeyboardAvoidingView: View,
    Image: () => <img alt="specimen" />, ActivityIndicator: () => <span>loading</span>,
    FlatList: ({ data = [], renderItem }: Props) => <div>{data.map((item, index) => <div key={index}>{renderItem?.({ item })}</div>)}</div>,
    Platform: { OS: "android", Version: 35 }, StyleSheet: { create: (styles: unknown) => styles },
    useWindowDimensions: () => ({ width: 390, height: 844 }), Share: { share: async () => ({}) }, Alert: { alert() {} },
    Keyboard: { dismiss() {}, addListener: () => ({ remove() {} }) }, BackHandler: { addEventListener: () => ({ remove() {} }) },
  };
});

type Selector = { id?: string; text?: string; enabled?: boolean };
type Command = string | Record<string, unknown>;
const qaRoot = path.resolve(import.meta.dirname, "../../../");
const cases = JSON.parse(readFileSync(path.join(qaRoot, "qa/home/cases.json"), "utf8")) as { nativeFlows: { file: string }[] };
let root: Root | undefined;
let container: HTMLDivElement;
let controls: ReturnType<typeof useSave> | undefined;
function SaveWitness() { controls = useSave(); return null; }

async function tick() { await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); }); }
async function launch() {
  if (root) await act(async () => root?.unmount());
  root = createRoot(container);
  await act(async () => root!.render(<SaveProvider><SaveWitness /><NativeGame /></SaveProvider>));
  await tick();
}

function match(selector: Selector): HTMLElement | undefined {
  const element = selector.id ? container.querySelector<HTMLElement>(`[data-testid="${selector.id}"]`) : undefined;
  if (!element) return undefined;
  if (selector.text && !new RegExp(`^(?:${selector.text.replace("${QA_BUILD}", "host-check")})$`).test(element.textContent ?? "")) return undefined;
  if (selector.enabled !== undefined && (!(element instanceof HTMLButtonElement) || !element.disabled !== selector.enabled)) return undefined;
  return element;
}

async function element(selector: Selector) {
  for (let i = 0; i < 100; i++) {
    const found = match(selector);
    if (found) return found;
    await tick();
  }
  throw new Error(`Missing UI selector ${JSON.stringify(selector)}. Actual text: ${container.textContent}`);
}

async function flow(file: string, observe?: (name: string, value: unknown) => void) {
  const documents = parseAllDocuments(readFileSync(path.join(qaRoot, file), "utf8"));
  const commands = documents[1].toJSON() as Command[];
  for (const command of commands) {
    const name = typeof command === "string" ? command : Object.keys(command)[0];
    const value = typeof command === "string" ? undefined : command[name];
    if (name === "launchApp") await launch();
    else if (name === "stopApp") { await act(async () => root?.unmount()); root = undefined; }
    else if (name === "runFlow") {
      const subflow = path.resolve(qaRoot, path.dirname(file), String(value));
      await flow(path.relative(qaRoot, subflow), observe);
    } else if (name === "assertVisible") await element(value as Selector);
    else if (name === "extendedWaitUntil") await element((value as { visible: Selector }).visible);
    else if (name === "scrollUntilVisible") await element((value as { element: Selector }).element);
    else if (name === "tapOn") {
      const target = await element(value as Selector);
      await act(async () => { target.focus(); target.click(); });
      await tick();
    } else if (name === "inputText") {
      const input = document.activeElement as HTMLInputElement;
      expect(input.tagName).toBe("INPUT");
      await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, input.value + String(value));
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    } else if (name !== "takeScreenshot") throw new Error(`Unhandled flow command ${name}`);
    observe?.(name, value);
  }
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  storage.clear();
  sourceFaults.read = false; sourceFaults.blockKey = undefined; sourceFaults.blockRead = undefined;
  qaFaults.reset();
  storage.set("codigdex:save:v3", "normal-progress-sentinel");
});
afterEach(async () => {
  if (root) await act(async () => root?.unmount());
  root = undefined;
  container.remove();
  vi.unstubAllGlobals();
});

// Executes the generated flow's selectors, callbacks, reducers, queued writes and restarts
// against real screens with DOM hosts. Native visibility/scrolling, IME and drivers still need devices.
for (const { file } of cases.nativeFlows) {
  it(`replays native flow contract: ${file}`, async () => {
    await flow(file);
    expect(storage.get("codigdex:save:v3")).toBe("normal-progress-sentinel");
  }, 20000);
}

it("distinguishes repeat captures and keeps undiscovered names private", async () => {
  let results = 0;
  await flow("qa/home/maestro/flows/cod-234-capture-replay.yaml", (name, value) => {
    if (name !== "assertVisible" || (value as Selector)?.id !== "result-title") return;
    results += 1;
    expect(container.textContent).toContain(results === 1 ? "A new card was registered." : "This card is already in your Codigdex.");
    if (results === 2) expect(container.textContent).not.toContain("complete!");
  });
  expect(results).toBe(2);
  const dex = [...container.querySelectorAll("button")].find((button) => button.textContent?.includes("도감 · 포획/재시작 복원 확인"));
  expect(dex).toBeDefined();
  await act(async () => dex!.click());
  const labels = [...container.querySelectorAll("button[aria-label]")].map((button) => button.getAttribute("aria-label"));
  expect(labels.some((label) => label?.includes("Undiscovered"))).toBe(true);
});

it("keeps QA progress until reset is explicitly confirmed", async () => {
  await flow("qa/home/maestro/flows/cod-234-capture-replay.yaml");
  const alert = vi.spyOn(Alert, "alert");
  const reset = [...container.querySelectorAll("button")].find((button) => button.textContent === "테스트 진행도만 초기화");
  expect(reset).toBeDefined();
  await act(async () => reset!.click());
  expect(container.querySelector('[data-testid="qa-captures"]')?.textContent).toBe("1");
  const buttons = alert.mock.calls[0][2]!;
  expect(buttons.find((button) => button.style === "cancel")).toBeDefined();
  await act(async () => buttons.find((button) => button.style === "destructive")!.onPress!());
  await tick();
  expect(container.querySelector('[data-testid="qa-captures"]')?.textContent).toBe("0");
  expect(storage.get("codigdex:save:v3")).toBe("normal-progress-sentinel");
  alert.mockRestore();
});

const qaSaveKey = "qa-home-e2e:codigdex:save:v3";
const saved = (): StoredGameStateV3 => JSON.parse(storage.get(qaSaveKey)!);
async function tap(id: string) {
  const target = await element({ id });
  await act(async () => target.click());
  await tick();
}
async function playBattle(monsterId: string, pass = true) {
  const pack = await loadMixedQuizPack(findStage(monsterId).monster.quizPackId);
  for (let i = 0; i < 10; i++) {
    if (match({ id: "result-title" })) return;
    const prompt = (await element({ id: "battle-prompt" })).textContent;
    const question = pack.questions.find(({ prompt: copy }) => quizCopy(copy.en) === prompt || quizCopy(copy.ko) === prompt);
    if (!question) throw Error(`Unexpected question: ${prompt}`);
    if (question.type === "freeText") {
      const input = await element({ id: "battle-answer" }) as HTMLInputElement;
      await act(async () => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, pass ? question.acceptedAnswers[0] : "definitely-wrong");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      });
      await tap("battle-submit");
    } else {
      const index = pass ? question.answerIndex : (question.answerIndex + 1) % question.choices.length;
      const answer = question.choices[index][quizCopy(question.prompt.en) === prompt ? "en" : "ko"];
      const choice = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-testid^="battle-choice-"]'))
        .find((button) => button.getAttribute("aria-label")?.endsWith(answer));
      if (!choice) throw Error(`Missing shuffled choice: ${answer}`);
      await act(async () => choice.click());
      await tick();
    }
    await tap("battle-next");
  }
  throw Error("Battle did not finish");
}
async function startCareer(id: string, locale: "ko" | "en" = "en") {
  const seed = careerQAPresets(locale).find((preset) => preset.id === `encounter:${id}`)!.save;
  storage.set(qaSaveKey, JSON.stringify(seed));
  await launch();
  await tap("home-play");
  await tap(`${seed.player.secondaryJobId ? "promotion" : "career"}-checkpoint-${seed.ui.checkpointId}`);
  await playBattle(seed.ui.checkpointId!);
  expect((await element({ id: "result-title" })).textContent).toBe(locale === "ko" ? "포획 성공" : "CAPTURED");
  expect(saved().progress.captures.some(({ id }) => id === seed.ui.checkpointId)).toBe(true);
  const checkpoint = saved().ui.checkpointId;
  await tap("result-world");
  return { seed, checkpoint };
}

for (const career of SOURCE_CAREERS) it(`meets and captures ${career.firstTool} in the ${career.id} mobile career, then resumes`, async () => {
  const { seed, checkpoint } = await startCareer(career.id);
  expect((await element({ id: "source-event-tool" })).textContent).toBe(findOpenSource(career.firstTool)!.name);
  if (career.id === "frontend") {
    await launch(); await tap("home-play");
    await element({ id: "source-event-title" });
  }
  await tap("source-event-accept");
  await playBattle(`open-source:${career.firstTool}`);
  expect(container.querySelector("[data-pixel-scene]")?.getAttribute("data-pixel-scene")).toBe("field");
  expect(saved().ui.checkpointId).toBe(checkpoint);
  expect(saved().progress.captures.filter(({ id }) => id === `open-source:${career.firstTool}`)).toHaveLength(1);
  expect(saved().player).toEqual(seed.player);
  expect(saved().progress.captures).toEqual(expect.arrayContaining(seed.progress.captures));
  if (career.id === "data-engineer") {
    await launch(); await tap("home-play"); await tap("source-event-accept");
  } else await tap("result-world");
  await element({ id: "career-title" });
  await launch(); await tap("home-play");
  await element({ id: "career-title" });
  expect(saved().ui.checkpointId).toBe(checkpoint);
  expect(storage.get("codigdex:save:v3")).toBe("normal-progress-sentinel");
}, 20000);

it("restores an accepted request after failure and retries without moving its career bookmark", async () => {
  const { checkpoint } = await startCareer("frontend", "ko");
  await tap("source-event-accept");
  await playBattle("open-source:tanstack-query", false);
  expect(saved().progress.captures.some(({ id }) => id === "open-source:tanstack-query")).toBe(false);
  await tap("result-retry");
  await launch(); await tap("home-play");
  expect((await element({ id: "source-event-accept" })).textContent).toContain("의뢰 다시 도전");
  await tap("source-event-accept");
  await playBattle("open-source:tanstack-query");
  await tap("result-continue");
  await element({ id: "career-title" });
  expect(saved().ui.checkpointId).toBe(checkpoint);
}, 20000);

it("defers a request and keeps its discovery note without a standalone battle entrance", async () => {
  await startCareer("frontend");
  await tap("source-event-later");
  await tap("career-menu");
  await tap("home-open-source");
  expect(container.textContent).toContain("TanStack Query");
  expect(container.textContent).not.toContain("START MISSION BATTLE");
  expect(container.querySelector('[data-testid^="source-battle-"]')).toBeNull();
  expect(saved().progress.captures.some(({ id }) => id.startsWith("open-source:"))).toBe(false);
}, 20000);

it("keeps an unsaved offer usable, retries its storage and restores it after restart", async () => {
  qaFaults.failNextSourceSave();
  await startCareer("frontend");
  await tap("source-event-retry-save");
  await vi.waitFor(() => expect(container.querySelector('[data-testid="source-event-retry-save"]')).toBeNull());
  await launch(); await tap("home-play");
  await element({ id: "source-event-title" });
  expect((await element({ id: "source-event-tool" })).textContent).toBe("TanStack Query");
}, 20000);

it("retries history reads before showing an adventure and migrates old expedition bookmarks", async () => {
  const seed = careerQAPresets("en").find(({ id }) => id === "encounter:backend")!.save;
  seed.progress.captures.push({ id: "open-source:postgresql", capturedAt: "2026-10-28T00:00:00.000Z" });
  seed.ui.checkpointId = "open-source:postgresql";
  storage.set(qaSaveKey, JSON.stringify(seed));
  sourceFaults.read = true;
  await launch();
  expect(container.textContent).toContain("Could not read save data");
  const retry = Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes("RETRY"))!;
  await act(async () => retry.click()); await tick();
  await tap("home-play");
  await element({ id: "career-title" });
  await tap("career-menu"); await tap("home-open-source");
  expect(container.textContent).toContain("PostgreSQL");
  expect(container.textContent).toContain("REGISTERED IN DEX");
  expect(storage.get("codigdex:save:v3")).toBe("normal-progress-sentinel");
}, 20000);

it("retains encounter authorization when its quiz loading fails and is retried", async () => {
  const { checkpoint } = await startCareer("frontend");
  qaFaults.failNextQuiz();
  await tap("source-event-accept");
  await tap("battle-retry-load");
  await playBattle("open-source:tanstack-query");
  await tap("result-world");
  await element({ id: "career-title" });
  expect(saved().ui.checkpointId).toBe(checkpoint);
  expect(saved().progress.captures.filter(({ id }) => id === "open-source:tanstack-query")).toHaveLength(1);
}, 20000);

it("retries finishing-history writes from the career screen without repeating a captured request", async () => {
  await startCareer("frontend");
  await tap("source-event-accept");
  await playBattle("open-source:tanstack-query");
  qaFaults.failNextSourceSave();
  await tap("result-world");
  await tap("career-retry-save");
  await vi.waitFor(() => expect(container.querySelector('[data-testid="career-retry-save"]')).toBeNull());
  await launch(); await tap("home-play");
  await element({ id: "career-title" });
  expect(saved().progress.captures.filter(({ id }) => id === "open-source:tanstack-query")).toHaveLength(1);
}, 20000);

it("does not report a rejected encounter capture as successful", async () => {
  await startCareer("frontend");
  await tap("source-event-accept");
  await act(async () => {
    const current = controls!;
    current.sourceEvents.finish(current.save, current.sourceEvents.pending(current.save)!.id);
  });
  await playBattle("open-source:tanstack-query");
  expect((await element({ id: "result-title" })).textContent).toBe("TRY AGAIN");
  expect(saved().progress.captures.some(({ id }) => id === "open-source:tanstack-query")).toBe(false);
}, 20000);

it("keeps a newer imported save when initial history hydration finishes late", async () => {
  const old = careerQAPresets("en", "2026-10-26T00:00:00.000Z").find(({ id }) => id === "encounter:frontend")!.save;
  const newer = careerQAPresets("en", "2026-10-27T00:00:00.000Z").find(({ id }) => id === "encounter:backend")!.save;
  storage.set(qaSaveKey, JSON.stringify(old));
  let release!: () => void;
  sourceFaults.blockKey = `qa-home-e2e:${sourceEventStorageKey(old)}`;
  sourceFaults.blockRead = new Promise<void>((resolve) => { release = resolve; });
  try {
    await launch();
    expect(controls!.hydrated).toBe(false);
    await act(async () => controls!.setLocale("ko"));
    expect(saved().progress.captures).toEqual(old.progress.captures);
    await act(async () => controls!.replaceSave(newer));
    expect(controls!.hydrated).toBe(true);
    await act(async () => release()); await tick();
    expect(saved().player.primaryJobId).toBe("backend");
    expect(controls!.save.player.primaryJobId).toBe("backend");
    expect(controls!.save.progress.captures[0].capturedAt).toBe("2026-10-27T00:00:00.000Z");
  } finally { release(); sourceFaults.blockRead = undefined; }
}, 20000);

it("rejects an older import if progress changes during its history read", async () => {
  const original = careerQAPresets("en", "2026-10-25T00:00:00.000Z").find(({ id }) => id === "encounter:frontend")!.save;
  const imported = careerQAPresets("en", "2026-10-24T00:00:00.000Z").find(({ id }) => id === "encounter:backend")!.save;
  storage.set(qaSaveKey, JSON.stringify(original));
  await launch();
  let release!: () => void;
  sourceFaults.blockKey = `qa-home-e2e:${sourceEventStorageKey(imported)}`;
  sourceFaults.blockRead = new Promise<void>((resolve) => { release = resolve; });
  let replacement!: Promise<void>;
  try {
    await act(async () => { replacement = controls!.replaceSave(imported); });
    const rejected = expect(replacement).rejects.toThrow("Progress changed");
    await act(async () => controls!.setLocale("ko"));
    await act(async () => release());
    await rejected;
    expect(controls!.save.player.primaryJobId).toBe("frontend");
    expect(saved().ui.locale).toBe("ko");
    expect(saved().progress.captures[0].capturedAt).toBe("2026-10-25T00:00:00.000Z");
  } finally { release(); sourceFaults.blockRead = undefined; }
}, 20000);
