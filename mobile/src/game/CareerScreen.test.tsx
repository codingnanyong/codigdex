/// <reference types="node" />
import React, { type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { createEmptySave, type StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { normalizeGameSave, selectGameCareer, selectSecondaryCareer } from "@codigdex/game-content/domain/gameProgress";
import { CAREER_PATHS } from "@codigdex/game-content/domain/careerPaths";
import { monstersForCareerRegion } from "@codigdex/game-content/domain/careerRegionMonsters";
import { PROMOTION_MISSIONS } from "@codigdex/game-content/domain/promotionChapters";
import { SECONDARY_JOB_OPTIONS, type SecondaryJobId } from "@codigdex/game-content/domain/player/jobs";
import { CareerScreen } from "./CareerScreen";

interface Props { children?: ReactNode; disabled?: boolean; onPress?(): void; style?: unknown; testID?: string }
const state = vi.hoisted(() => ({ save: undefined as unknown as StoredGameStateV3, controls: [] as Props[], selected: [] as string[] }));
vi.mock("../state/SaveProvider", () => ({ useSave: () => ({ save: state.save, locale: state.save.ui.locale ?? "en", selectJob: (id: string) => state.selected.push(id) }) }));
vi.mock("../ui/Screen", () => ({ Screen: ({ children }: Props) => <main>{children}</main> }));
vi.mock("../ui/PixelScene", () => ({ PixelScene: () => <div /> }));
vi.mock("../assets", () => ({ mobileAssetSource: (key: string) => key }));
vi.mock("react-native", () => ({
  Image: () => <span />,
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

  it("restores the region chosen before opening notes and passes only its relevant tools", () => {
    state.save = platformSave("platform-engineer");
    state.save.progress.captures.push({ id: "open-source:postgresql", capturedAt: "2026-10-28T00:00:00.000Z" });
    const opened: string[][] = [];
    renderToStaticMarkup(<CareerScreen selectedRegionId="sql" onOpenSources={(ids) => opened.push([...ids])} onBack={() => {}} onBattle={() => {}} />);
    expect(state.controls.some(({ testID }) => testID === "career-checkpoint-query-mole")).toBe(true);
    state.controls.find(({ testID }) => testID === "career-region-open-source")!.onPress!();
    expect(opened[0]).toContain("postgresql");
    expect(opened[0]).not.toContain("airflow");
  });

  it.each(SECONDARY_JOB_OPTIONS)("offers $id after both required primary paths are mastered", (job) => {
    state.save = platformSave(job.id);
    expect(render()).toContain("VIEW PROMOTION MISSION");
    expect(state.controls.some(({ testID }) => testID === `promotion-select-${job.id}`)).toBe(true);
  });

  it.each(SECONDARY_JOB_OPTIONS)("shows $id story, five ordered checkpoints and mastery ending", (job) => {
    state.save = selectSecondaryCareer(platformSave(job.id), job.id);
    const mission = PROMOTION_MISSIONS[job.id];
    const html = render();
    expect(html).toContain(mission.chapter.name.en);
    expect(html).toContain(mission.chapter.npcName.en);
    expect(state.controls.filter(({ testID }) => testID?.startsWith("promotion-checkpoint-")).map(({ disabled }) => disabled)).toEqual([false, true, true, true, true]);
    state.save.progress.captures.push(...mission.chapter.stages.map(({ id }) => ({ id, capturedAt: "2026-10-27T00:00:00.000Z" })));
    state.save = normalizeGameSave(state.save);
    expect(render()).toContain("PATH MASTER");
    expect(render()).toContain(mission.story.ending.en.split(".")[0]);
  });
});

function platformSave(jobId: SecondaryJobId) {
  const save = createEmptySave("en");
  const job = SECONDARY_JOB_OPTIONS.find(({ id }) => id === jobId)!;
  const stages = [...CHAPTERS.flatMap(({ stages }) => stages), ...job.requires.map((id) => CAREER_PATHS[id]).flatMap(({ regions }) => regions.flatMap(({ id }) => monstersForCareerRegion(id)))];
  save.progress.captures = [...new Set(stages.map(({ id }) => id))].map((id) => ({ id, capturedAt: "2026-10-27T00:00:00.000Z" }));
  save.player.primaryJobId = job.requires[0];
  return normalizeGameSave(save);
}

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
