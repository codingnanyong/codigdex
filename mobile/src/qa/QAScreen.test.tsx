import React, { type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { QAScreen } from "./QAScreen";

interface Props { children?: ReactNode; testID?: string; disabled?: boolean; onPress?(): void }
const state = vi.hoisted(() => ({ enabled: true, controls: [] as Props[], replace: vi.fn(async (_value: unknown) => {}), saving: false }));
vi.mock("./runtime", () => ({ get QA_ENABLED() { return state.enabled; }, E2E_ENABLED: false, E2E_REVISION: "disabled", qaFaults: { failNextQuiz: vi.fn(), failNextSave: vi.fn(), failNextSourceSave: vi.fn() } }));
vi.mock("../state/SaveProvider", () => ({ useSave: () => ({ save: createEmptySave("ko"), locale: "ko", saving: state.saving, replaceSave: state.replace }) }));
vi.mock("../ui/Screen", () => ({ Screen: ({ children }: Props) => <main>{children}</main> }));
vi.mock("react-native", () => ({
  StyleSheet: { create: (styles: unknown) => styles }, Platform: { OS: "android", Version: 36 }, Share: { share: vi.fn() }, Alert: { alert: vi.fn() },
  useWindowDimensions: () => ({ width: 390, height: 844 }),
  View: ({ children }: Props) => <div>{children}</div>, Text: ({ children }: Props) => <p>{children}</p>,
  Pressable: (props: Props) => { state.controls.push(props); return <button disabled={props.disabled}>{props.children}</button>; },
}));
beforeEach(() => { state.enabled = true; state.controls = []; state.saving = false; state.replace.mockReset(); state.replace.mockResolvedValue(undefined); });
function render(onBack = vi.fn(), onDex = vi.fn()) {
  const html = renderToStaticMarkup(<QAScreen onBack={onBack} onDex={onDex} onWorld={() => {}} onBattle={() => {}} checked={[]} onToggleCheck={() => {}} />);
  return { html, onBack, onDex };
}
describe("mobile manual QA starting states", () => {
  it("is absent without QA and shows all seventeen starting states when enabled", () => {
    state.enabled = false;
    expect(render().html).toBe("");
    state.enabled = true;
    expect(render().html).toContain("돌발 의뢰");
    expect(state.controls.filter(({ testID }) => testID?.startsWith("qa-start-"))).toHaveLength(17);
  });
  it("saves an earned promotion before returning to the title to continue", async () => {
    const { onBack } = render();
    state.controls.find(({ testID }) => testID === "qa-start-promotion:platform-engineer")!.onPress!();
    await vi.waitFor(() => expect(onBack).toHaveBeenCalledOnce());
    const save = state.replace.mock.calls[0][0] as ReturnType<typeof createEmptySave>;
    expect(save.player.secondaryJobId).toBe("platform-engineer");
    expect(save.ui.checkpointId).toBeDefined();
  });
  it("opens the full dex only after save succeeds and stays on QA if save fails", async () => {
    const first = render();
    state.controls.find(({ testID }) => testID === "qa-start-dex")!.onPress!();
    await vi.waitFor(() => expect(first.onDex).toHaveBeenCalledOnce());
    expect(first.onBack).not.toHaveBeenCalled();
    state.controls = [];
    state.replace.mockRejectedValueOnce(new Error("disk full"));
    const second = render();
    state.controls.find(({ testID }) => testID === "qa-start-fresh")!.onPress!();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(second.onBack).not.toHaveBeenCalled();
    expect(second.onDex).not.toHaveBeenCalled();
  });
});
