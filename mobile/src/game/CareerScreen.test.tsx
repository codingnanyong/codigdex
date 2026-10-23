/// <reference types="node" />
import React, { type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { createEmptySave, type StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { selectGameCareer } from "@codigdex/game-content/domain/gameProgress";
import { CareerScreen } from "./CareerScreen";

interface Props { children?: ReactNode; disabled?: boolean; onPress?(): void; style?: unknown }
const state = vi.hoisted(() => ({ save: undefined as unknown as StoredGameStateV3, controls: [] as Props[], selected: [] as string[] }));
vi.mock("../state/SaveProvider", () => ({ useSave: () => ({ save: state.save, locale: state.save.ui.locale ?? "en", selectJob: (id: string) => state.selected.push(id) }) }));
vi.mock("../ui/Screen", () => ({ Screen: ({ children }: Props) => <main>{children}</main> }));
vi.mock("react-native", () => ({
  StyleSheet: { create: (styles: unknown) => styles },
  View: ({ children }: Props) => <div>{children}</div>,
  Text: ({ children }: Props) => <p>{children}</p>,
  Pressable: (props: Props) => { state.controls.push(props); return <button disabled={props.disabled}>{props.children}</button>; },
}));
beforeEach(() => { state.save = createEmptySave("en"); state.controls = []; state.selected = []; });
const render = () => renderToStaticMarkup(<CareerScreen onBack={() => {}} onBattle={() => {}} />);

describe("native career route", () => {
  it("keeps primary careers locked until common-path completion", () => {
    expect(render()).toContain("Complete Tutorial");
    expect(state.controls.filter(({ disabled }) => disabled)).toHaveLength(5);
  });
  it("renders all checkpoints in the selected released region and preserves path binding", () => {
    state.save.progress.captures = CHAPTERS.flatMap(({ stages }) => stages.map(({ id }) => ({ id, capturedAt: "2026-10-23T00:00:00.000Z" })));
    state.save = selectGameCareer(state.save, "frontend");
    const html = render();
    expect(html).toContain("HTML/CSS");
    expect(html).toContain("Lv.1");
    expect(html).toContain("Lv.5");
    expect(html).toContain("Finish the current path");
    expect(html).not.toContain("Fullstack Engineer");
  });
});

it("exports the native career component for inspection when requested", () => {
  const directory = process.env.CODIGDEX_CAREER_PREVIEW_DIR;
  if (!directory) return;
  mkdirSync(directory, { recursive: true });
  for (const locale of ["ko", "en"] as const) {
    state.save = createEmptySave(locale);
    state.save.progress.captures = CHAPTERS.flatMap(({ stages }) => stages.map(({ id }) => ({ id, capturedAt: "2026-10-23T00:00:00.000Z" })));
    state.save = selectGameCareer(state.save, "frontend");
    writeFileSync(join(directory, `career-${locale}.html`), `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;padding:16px;background:#f1e4cb;color:#2a1d14;font:16px/1.5 monospace}main{max-width:700px;margin:auto}button{font:inherit;background:#49301c;color:#f1e4cb;border:2px solid #c9a876;min-height:48px;padding:8px;display:block;width:100%;margin:8px 0}button:disabled{opacity:.5}</style>${render()}`);
  }
});
