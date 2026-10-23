// @vitest-environment happy-dom
/// <reference types="node" />
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseAllDocuments } from "yaml";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { NativeGame } from "../game/NativeGame";
import { SaveProvider } from "../state/SaveProvider";

const storage = vi.hoisted(() => new Map<string, string>());
vi.mock("@react-native-async-storage/async-storage", () => ({ default: {
  async getItem(key: string) { return storage.get(key) ?? null; },
  async setItem(key: string, value: string) { storage.set(key, value); },
  async removeItem(key: string) { storage.delete(key); },
} }));
vi.mock("./runtime", async (original) => {
  const runtime = await original<typeof import("./runtime")>();
  return { ...runtime, QA_ENABLED: true, E2E_ENABLED: true, E2E_REVISION: "host-check", qaFaults: runtime.createQaFaults(true) };
});
vi.mock("@/account/AccountPanel", () => ({ AccountPanel: () => null }));
vi.mock("@/assets", () => ({ mobileAssetSource: () => ({ uri: "test-image" }) }));
vi.mock("../ui/PixelScene", () => ({ PixelScene: () => null }));
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

async function tick() { await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); }); }
async function launch() {
  if (root) await act(async () => root?.unmount());
  root = createRoot(container);
  await act(async () => root!.render(<SaveProvider><NativeGame /></SaveProvider>));
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

async function flow(file: string) {
  const documents = parseAllDocuments(readFileSync(path.join(qaRoot, file), "utf8"));
  const commands = documents[1].toJSON() as Command[];
  for (const command of commands) {
    const name = typeof command === "string" ? command : Object.keys(command)[0];
    const value = typeof command === "string" ? undefined : command[name];
    if (name === "launchApp") await launch();
    else if (name === "stopApp") { await act(async () => root?.unmount()); root = undefined; }
    else if (name === "runFlow") {
      const subflow = path.resolve(qaRoot, path.dirname(file), String(value));
      await flow(path.relative(qaRoot, subflow));
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
  }
}

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  container = document.createElement("div");
  document.body.append(container);
  storage.clear();
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
