import React, { type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { OPEN_SOURCE_CATALOG } from "@codigdex/game-content/domain/openSourceCatalog";
import { OpenSourceScreen } from "./OpenSourceScreen";
import { emptyEncounterHistory } from "@codigdex/game-content/domain/openSourceEncounters";
import { createEmptySave } from "@codigdex/game-core/save/schema";

interface Props { children?: ReactNode; accessibilityLabel?: string; testID?: string; value?: string; placeholder?: string; disabled?: boolean; onPress?(): void }
const native = vi.hoisted(() => ({ controls: [] as Props[], openURL: vi.fn(async () => {}) }));
vi.mock("../ui/Screen", () => ({ Screen: ({ children }: Props) => <main>{children}</main> }));
vi.mock("../assets", () => ({ mobileAssetSource: (key: string) => key }));
vi.mock("react-native", () => ({
  Image: ({ accessibilityLabel }: Props) => <span role="img" aria-label={accessibilityLabel} />,
  StyleSheet: { create: (styles: unknown) => styles },
  View: ({ children }: Props) => <div>{children}</div>,
  ScrollView: ({ children }: Props) => <div>{children}</div>,
  Text: ({ children }: Props) => <p>{children}</p>,
  TextInput: ({ value, placeholder, accessibilityLabel }: Props) => <input value={value} placeholder={placeholder} aria-label={accessibilityLabel} readOnly />,
  Pressable: (props: Props) => { native.controls.push(props); return <button aria-label={props.accessibilityLabel}>{props.children}</button>; },
  Linking: { openURL: native.openURL }, Alert: { alert: vi.fn() },
}));

describe("native discovery notes", () => {
  it("starts empty without a separate expedition or battle entrance", () => {
    native.controls = [];
    const html = renderToStaticMarkup(<OpenSourceScreen locale="ko" save={createEmptySave("ko")} onBack={() => {}} />);
    expect(html).toContain("발견한 오픈소스 노트");
    expect(html).toContain("아직 만난 도구가 없습니다");
    expect(html).not.toContain('role="img"');
    expect(native.controls.some(({ testID }) => testID?.startsWith("source-battle-"))).toBe(false);
  });

  it("preserves all old captured cards without standalone battle buttons", () => {
    const save = createEmptySave("en");
    save.progress.captures = OPEN_SOURCE_CATALOG.map(({ id }) => ({ id: `open-source:${id}`, capturedAt: "2026-10-28T00:00:00.000Z" }));
    const html = renderToStaticMarkup(<OpenSourceScreen locale="en" save={save} onBack={() => {}} />);
    for (const entry of OPEN_SOURCE_CATALOG) expect(html).toContain(entry.name.replaceAll("&", "&amp;"));
    expect((html.match(/role="img"/g) ?? []).length).toBe(38);
    expect(html).toContain("REGISTERED IN DEX");
    expect(html).not.toContain("START MISSION BATTLE");
  });

  it("shows deferred discoveries, limits related notes and opens official documentation", async () => {
    native.controls = [];
    native.openURL.mockClear();
    const history = emptyEncounterHistory();
    history.discoveries = [{ toolId: "airflow", careerId: "data-engineer" }, { toolId: "kafka", careerId: "data-engineer" }];
    const html = renderToStaticMarkup(<OpenSourceScreen locale="en" save={createEmptySave("en")} history={history} initialIds={["airflow", "kafka", "hadoop"]} onBack={() => {}} />);
    expect(html).toContain("Apache Airflow");
    expect(html).toContain("Apache Kafka");
    expect(html).not.toContain("Apache Hadoop");
    expect(html).toContain("Discovered related tools");
    expect(html).toContain("Data Engineer");
    native.controls.find(({ accessibilityLabel }) => accessibilityLabel === "Apache Kafka · Official project documentation")!.onPress!();
    expect(native.openURL).toHaveBeenCalledWith("https://kafka.apache.org/intro/");
  });
});
