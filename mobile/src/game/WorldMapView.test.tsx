/// <reference types="node" />
import React, { type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { WorldMapView, type WorldMapViewProps } from "./WorldMapView";

interface NativeProps {
  children?: ReactNode;
  style?: unknown;
  contentContainerStyle?: unknown;
  accessibilityLabel?: string;
  accessibilityRole?: string;
  accessibilityState?: { selected?: boolean; disabled?: boolean };
  disabled?: boolean;
  onPress?(): void;
}
const native = vi.hoisted(() => ({ controls: [] as NativeProps[] }));
vi.mock("../ui/PixelScene", () => ({ PixelScene: () => null }));
vi.mock("react-native", async () => {
  const R = await import("react");
  function css(value: unknown): Record<string, unknown> {
    if (typeof value === "function") return css(value({ pressed: false }));
    const flat: Record<string, unknown> = Array.isArray(value) ? Object.assign({}, ...value.map(css)) : { ...(value as object ?? {}) };
    for (const [key, first, second] of [["paddingHorizontal", "paddingLeft", "paddingRight"], ["paddingVertical", "paddingTop", "paddingBottom"], ["marginVertical", "marginTop", "marginBottom"]]) {
      if (key in flat) { flat[first] = flat[key]; flat[second] = flat[key]; delete flat[key]; }
    }
    if (typeof flat.lineHeight === "number") flat.lineHeight = `${flat.lineHeight}px`;
    return flat;
  }
  function host(tag: string, scroll = false) {
    return function Host(props: NativeProps) {
      if (tag === "button") native.controls.push(props);
      const style = { display: "flex", flexDirection: "column", flexShrink: 0, minWidth: 0, minHeight: 0, ...css(props.style) };
      return R.createElement(tag, { style: scroll ? { ...style, overflow: "auto" } : style,
        "aria-label": props.accessibilityLabel, "aria-disabled": props.disabled, "aria-selected": props.accessibilityState?.selected,
        disabled: tag === "button" ? props.disabled : undefined }, scroll ? R.createElement("div", { style: { display: "flex", flexDirection: "column", ...css(props.contentContainerStyle) } }, props.children) : props.children);
    };
  }
  return { StyleSheet: { create: (styles: unknown) => styles }, View: host("div"), Text: host("span"), Pressable: host("button"), ScrollView: host("div", true) };
});

function props(overrides: Partial<WorldMapViewProps> = {}): WorldMapViewProps {
  return { captured: new Set(), locale: "ko", onSelect: vi.fn(), onBattle: vi.fn(), onBack: vi.fn(), onDex: vi.fn(), ...overrides };
}
function render(view: WorldMapViewProps) { native.controls.length = 0; return renderToStaticMarkup(<WorldMapView {...view} />); }
beforeEach(() => { native.controls.length = 0; });

describe("touch world map", () => {
  it("opens a locked region for inspection while blocking its checkpoint and battle actions", () => {
    const view = props({ selectedId: CHAPTERS[2].stages[0].id });
    const html = render(view);
    expect(html).toContain("앞선 지역과 체크포인트를 완료하면 열립니다.");
    expect(native.controls.filter(({ accessibilityLabel }) => accessibilityLabel?.startsWith("Lv.")).every(({ disabled }) => disabled)).toBe(true);
    const battle = native.controls.find(({ accessibilityLabel }) => accessibilityLabel === "선택한 체크포인트 전투")!;
    battle.onPress!(); // Programmatic/stale callbacks must also respect the lock.
    expect(view.onBattle).not.toHaveBeenCalled();
  });

  it("shows five Git checkpoints, selects unlocked touch targets, and starts the selected battle", () => {
    const view = props({ captured: new Set([CHAPTERS[0].stages[0].id]), selectedId: CHAPTERS[1].stages[0].id });
    render(view);
    const nodes = native.controls.filter(({ accessibilityLabel }) => accessibilityLabel?.startsWith("Lv."));
    expect(nodes).toHaveLength(5);
    expect(nodes.map(({ disabled }) => disabled)).toEqual([false, true, true, true, true]);
    nodes[0].onPress!();
    expect(view.onSelect).toHaveBeenCalledWith(CHAPTERS[1].stages[0].id);
    native.controls.find(({ accessibilityLabel }) => accessibilityLabel === "선택한 체크포인트 전투")!.onPress!();
    expect(view.onBattle).toHaveBeenCalledWith(CHAPTERS[1].stages[0].id);
  });

  it("reflects a just-cleared checkpoint after returning and offers the next region without losing replays", () => {
    const view = props({ captured: new Set(CHAPTERS[0].stages.map(({ id }) => id)), selectedId: CHAPTERS[0].stages[0].id });
    expect(render(view)).toContain("완료한 체크포인트 재도전");
    native.controls.find(({ accessibilityLabel }) => accessibilityLabel === "다음 미션으로 이동")!.onPress!();
    expect(view.onSelect).toHaveBeenCalledWith(CHAPTERS[1].stages[0].id);
    const complete = props({ locale: "en", captured: new Set(CHAPTERS.flatMap(({ stages }) => stages.map(({ id }) => id))) });
    expect(render(complete)).toContain("Common path complete!");
    expect(render(complete)).toContain("REPLAY CHECKPOINT");
  });
});

it("exports the actual native map view for visual inspection when requested", () => {
  const folder = process.env.CODIGDEX_WORLD_PREVIEW_DIR;
  if (!folder) return;
  mkdirSync(folder, { recursive: true });
  for (const locale of ["ko", "en"] as const) {
    for (const scenario of ["initial", "git", "locked", "complete"] as const) {
      const captured = new Set(scenario === "complete" ? CHAPTERS.flatMap(({ stages }) => stages.map(({ id }) => id)) : scenario === "git" ? [CHAPTERS[0].stages[0].id] : []);
      const selectedId = scenario === "git" ? CHAPTERS[1].stages[0].id : scenario === "locked" ? CHAPTERS[2].stages[0].id : undefined;
      writeFileSync(join(folder, `${scenario}-${locale}.html`), `<!doctype html><html lang="${locale}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}html,body{margin:0;background:#06131e;font-family:monospace}button{font:inherit}span{white-space:pre-wrap;overflow-wrap:anywhere}</style><body><main style="display:flex;flex-direction:column;height:100vh;padding:12px 18px">${render(props({ locale, captured, selectedId }))}</main></body></html>`);
    }
  }
});
