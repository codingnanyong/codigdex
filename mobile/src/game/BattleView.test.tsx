/// <reference types="node" />
import React, { type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBattleState, revealBattleHint, submitBattleAnswer } from "@codigdex/game-core/domain/dex/battle";
import type { FreeTextQuestion, MultipleChoiceQuestion } from "@codigdex/game-core/domain/chapters/types";
import { TUTORIAL_MONSTER } from "@codigdex/game-content/domain/chapters/tutorial";
import { loadMixedQuizPack, loadQuizPack, validateQuizPack } from "@codigdex/quiz-content";
import { BattleView, type BattleViewProps } from "./BattleView";
import { battleQuestions } from "./battle";
import { battleMeters, compactBattle, keyboardAnswer } from "./battlePresentation";

interface NativeProps {
  children?: ReactNode;
  style?: unknown;
  contentContainerStyle?: unknown;
  accessibilityLabel?: string;
  accessibilityRole?: string;
  accessibilityValue?: { min: number; max: number; now: number; text?: string };
  onPress?(): void;
  onSubmitEditing?(event: { nativeEvent: { text: string; isComposing?: boolean } }): void;
  disabled?: boolean;
  value?: string;
  source?: { uri?: string };
  [key: string]: unknown;
}

const native = vi.hoisted(() => ({ controls: [] as { kind: string; props: NativeProps }[] }));

// Render the actual native view through lightweight hosts, retaining callbacks and accessibility props.
// This verifies UI states and produces layout previews; it does not simulate the native IME/runtime.
vi.mock("react-native", async () => {
  const R = await import("react");
  function css(value: unknown): Record<string, unknown> {
    if (typeof value === "function") return css(value({ pressed: false }));
    const flat: Record<string, unknown> = Array.isArray(value)
      ? Object.assign({}, ...value.map(css)) : { ...(value as object ?? {}) };
    for (const [key, first, second] of [["paddingHorizontal", "paddingLeft", "paddingRight"], ["paddingVertical", "paddingTop", "paddingBottom"], ["marginHorizontal", "marginLeft", "marginRight"], ["marginVertical", "marginTop", "marginBottom"]]) {
      if (key in flat) { flat[first] = flat[key]; flat[second] = flat[key]; delete flat[key]; }
    }
    if (typeof flat.lineHeight === "number") flat.lineHeight = `${flat.lineHeight}px`;
    return flat;
  }
  function host(kind: string, tag = "div") {
    return function Host(props: NativeProps) {
      native.controls.push({ kind, props });
      const style = { display: "flex", flexDirection: "column", flexShrink: 0, minWidth: 0, minHeight: 0, boxSizing: "border-box", ...css(props.style) };
      const attrs = { style, role: props.accessibilityRole, "aria-label": props.accessibilityLabel,
        "aria-valuenow": props.accessibilityValue?.now, "aria-valuetext": props.accessibilityValue?.text,
        "aria-disabled": props.disabled || undefined };
      if (kind === "TextInput") return R.createElement("input", { ...attrs, value: props.value, readOnly: true, disabled: props.disabled });
      if (kind === "Image") return R.createElement("img", { ...attrs, src: props.source?.uri, alt: props.accessibilityLabel });
      if (kind === "ScrollView") return R.createElement("div", { ...attrs, style: { ...style, overflow: "auto" } }, R.createElement("div", { style: { display: "flex", flexDirection: "column", ...css(props.contentContainerStyle) } }, props.children));
      return R.createElement(tag, attrs, props.children);
    };
  }
  return { StyleSheet: { create: (styles: unknown) => styles }, View: host("View"), Text: host("Text", "span"),
    Image: host("Image"), ScrollView: host("ScrollView"), TextInput: host("TextInput"), Pressable: host("Pressable", "button") };
});

const base = await loadQuizPack(TUTORIAL_MONSTER.quizPackId);
const mixed = await loadMixedQuizPack(TUTORIAL_MONSTER.quizPackId);
const git = await loadMixedQuizPack("git.git-sprout.v1");
const free = git.questions.find((q): q is typeof q & FreeTextQuestion => q.type === "freeText")!;
const choice = base.questions.find((q): q is typeof q & MultipleChoiceQuestion => q.type !== "freeText")!;
const image = { uri: "data:image/png;base64," + readFileSync(new URL("../../../packages/game-assets/files/monsters/ch00.tutorial/loop-bug-v2.png", import.meta.url)).toString("base64") };

function props(overrides: Partial<BattleViewProps> = {}): BattleViewProps {
  return { battle: createBattleState([free, choice, free]), monster: TUTORIAL_MONSTER, monsterImage: image,
    locale: "ko", compact: true, draft: "", onAnswer: vi.fn(), onDraftChange: vi.fn(), onHint: vi.fn(),
    onInputFocus: vi.fn(), onContentSizeChange: vi.fn(), onNext: vi.fn(), onExit: vi.fn(), ...overrides };
}

function control(label: string): NativeProps {
  return native.controls.find(({ props }) => props.accessibilityLabel === label)!.props;
}
function render(viewProps: BattleViewProps) { native.controls.length = 0; return renderToStaticMarkup(<BattleView {...viewProps} />); }
beforeEach(() => { native.controls.length = 0; });

describe("playable mixed content", () => {
  it("provides valid 25% text variants without changing the original packs or question identities", async () => {
    for (const pack of [mixed, git]) {
      expect(pack.questions).toHaveLength(20);
      expect(pack.questions.filter((q) => q.type === "freeText")).toHaveLength(5);
      expect(validateQuizPack(pack)).toEqual([]);
      expect(pack.descriptor.id).toContain(".mixed.v1");
    }
    expect(base.questions.every((q) => q.type !== "freeText")).toBe(true);
    expect(new Set([...base.questions, ...mixed.questions].map((q) => q.id)).size).toBe(40);
    expect(await loadMixedQuizPack(TUTORIAL_MONSTER.quizPackId)).toBe(mixed);
  });

  it.each([1, 2, 3, 4, 5])("draws level %i's count and presents both input types before early capture", (level) => {
    for (const rng of [() => 0, () => 0.99]) {
      const questions = battleQuestions({ ...TUTORIAL_MONSTER, level }, mixed.questions, rng);
      expect(questions).toHaveLength(level + 2);
      expect(questions[0].type).not.toBe("freeText");
      expect(questions[1].type).toBe("freeText");
      expect(new Set(questions.map((q) => q.prompt.en)).size).toBe(questions.length);
    }
  });
});

describe("battle UI states", () => {
  it("renders the capture line, accessible HP and four actionable choices", () => {
    const view = props({ battle: createBattleState([choice, free, choice]), compact: false });
    const html = render(view);
    expect(html).toContain("포획 기준 60%");
    expect(html).toContain('aria-label="몬스터 HP"');
    expect(html).toContain('aria-label="플레이어 HP"');
    expect(native.controls.filter((c) => c.kind === "Pressable" && /^[A-D]\. /.test(c.props.accessibilityLabel ?? ""))).toHaveLength(4);
    control(`A. ${choice.choices[0].ko}`).onPress!();
    expect(view.onAnswer).toHaveBeenCalledWith(0, 0);
  });

  it("disables blank submissions and uses committed keyboard text, ignoring composition", () => {
    const view = props();
    render(view);
    expect(control("답안 제출").disabled).toBe(true);
    const input = control("단답 답안");
    input.onSubmitEditing!({ nativeEvent: { text: "git init", isComposing: true } });
    expect(view.onAnswer).not.toHaveBeenCalled();
    input.onSubmitEditing!({ nativeEvent: { text: " GIT INIT " } });
    expect(view.onAnswer).toHaveBeenCalledWith(0, " GIT INIT ");
    expect(input.autoCorrect).toBe(false);
    expect(input.autoCapitalize).toBe("none");
    render({ ...view, draft: "git init" });
    expect(control("답안 제출").disabled).toBe(false);
    control("답안 제출").onPress!();
    expect(view.onAnswer).toHaveBeenLastCalledWith(0, "git init");
  });

  it("reveals only the requested hints and exhausts the hint button after two", () => {
    const view = props();
    expect(render(view)).not.toContain(free.hints[0].ko);
    const once = revealBattleHint(view.battle, 0);
    const html = render({ ...view, battle: once });
    expect(html).toContain(free.hints[0].ko);
    expect(html).not.toContain(free.hints[1].ko);
    expect(html).not.toContain(free.acceptedAnswers[0]);
    const twice = revealBattleHint(once, 0);
    expect(render({ ...view, battle: twice })).toContain(free.hints[1].ko);
    expect(control("다음 힌트, 2/2 사용").disabled).toBe(true);
  });

  it("shows answer and explanation after a miss, with input and hints locked until Next", () => {
    const view = props();
    const next = submitBattleAnswer(view.battle, 0, "wrong command");
    const html = render({ ...view, feedback: { nextBattle: next, attempt: next.attempts[0] } });
    expect(html).toContain("wrong command");
    expect(html).toContain(free.acceptedAnswers[0]);
    expect(html).toContain(free.explanation.ko);
    expect(native.controls.some((c) => c.kind === "TextInput")).toBe(false);
    expect(native.controls.some((c) => c.props.accessibilityLabel?.startsWith("다음 힌트"))).toBe(false);
    expect(view.onNext).not.toHaveBeenCalled();
    control("다음 문제").onPress!();
    expect(view.onNext).toHaveBeenCalledOnce();
    expect(battleMeters(next).playerHealth).toBe(0.5);
  });

  it("keeps hinted correct answers on the same HP/pass line and ends at capture readiness", () => {
    const first = submitBattleAnswer(createBattleState([choice, free, choice]), 0, choice.answerIndex);
    const hinted = revealBattleHint(revealBattleHint(first, 1), 1);
    const passed = submitBattleAnswer(hinted, 1, free.acceptedAnswers[0]);
    const html = render(props({ battle: hinted, locale: "en", feedback: { nextBattle: passed, attempt: passed.attempts[1] } }));
    expect(html).toContain("Ready to capture!");
    expect(html).toContain("attack strength 50%");
    expect(html).toContain('aria-label="View battle result"');
    expect(battleMeters(passed).monsterHealth).toBe(0);
  });
});

describe("small-screen and keyboard contract", () => {
  it("keeps typing controls compact and provides keyboard dismissal", () => {
    const view = props({ keyboardVisible: true, draft: "git init", onKeyboardDismiss: vi.fn() });
    const html = render(view);
    expect(html).not.toContain('role="progressbar"');
    expect(control("단답 답안")).toBeDefined();
    expect(control("답안 제출").disabled).toBe(false);
    control("키보드 닫기").onPress!();
    expect(view.onKeyboardDismiss).toHaveBeenCalledOnce();
  });
  it("uses compact content for portrait, short landscape and visible keyboards", () => {
    expect(compactBattle(390, 844, false)).toBe(true);
    expect(compactBattle(740, 360, false)).toBe(true);
    expect(compactBattle(960, 540, true)).toBe(true);
    expect(compactBattle(960, 540, false)).toBe(false);
    expect(keyboardAnswer({ nativeEvent: { text: "확정", isComposing: true } })).toBeUndefined();
    expect(keyboardAnswer({ nativeEvent: { text: "확정" } })).toBe("확정");
  });

  it("enables portrait consistently in Expo and both committed native projects", () => {
    expect(JSON.parse(readFileSync(new URL("../../app.json", import.meta.url), "utf8")).expo.orientation).toBe("default");
    expect(readFileSync(new URL("../../android/app/src/main/AndroidManifest.xml", import.meta.url), "utf8")).toContain('android:screenOrientation="unspecified"');
    const plist = readFileSync(new URL("../../ios/Codigdex/Info.plist", import.meta.url), "utf8");
    expect(plist).toContain("UIInterfaceOrientationPortrait</string>");
    expect(plist).toContain("UIInterfaceOrientationLandscapeLeft</string>");
  });
});

it("exports previews of the actual view when a preview destination is supplied", () => {
  const folder = process.env.CODIGDEX_BATTLE_PREVIEW_DIR;
  if (!folder) return;
  mkdirSync(folder, { recursive: true });
  const view = props();
  const hinted = revealBattleHint(revealBattleHint(view.battle, 0), 0);
  const missed = submitBattleAnswer(hinted, 0, "git wrong");
  const scenarios = {
    "choice-wide": props({ battle: createBattleState([choice, free, choice]), compact: false }),
    "text-portrait": view,
    "keyboard-small": { ...view, keyboardVisible: true, draft: "git init" },
    "hints-portrait": { ...view, battle: hinted, draft: "git init" },
    "feedback-small": { ...view, battle: hinted, feedback: { nextBattle: missed, attempt: missed.attempts[0] } },
  };
  for (const [name, scenario] of Object.entries(scenarios)) {
    writeFileSync(join(folder, `${name}.html`), `<!doctype html><html lang="ko"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}html,body{margin:0;background:#06131e;font-family:monospace}button{font:inherit}span{white-space:pre-wrap;overflow-wrap:anywhere}input{min-width:0}</style><body><main style="display:flex;flex-direction:column;height:100vh;padding:12px 18px">${render(scenario)}</main></body></html>`);
  }
});
