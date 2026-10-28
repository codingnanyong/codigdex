import React, { type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { OPEN_SOURCE_CATALOG } from "@codigdex/game-content/domain/openSourceCatalog";
import { OpenSourceScreen } from "./OpenSourceScreen";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
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

describe("native open-source notes", () => {
  it("renders all creatures while blocking expedition battles before the common path", () => {
    native.controls = [];
    const html = renderToStaticMarkup(<OpenSourceScreen locale="ko" save={createEmptySave("ko")} onBattle={() => {}} onBack={() => {}} />);
    expect(html).toContain("오픈소스 탐험 노트");
    expect(html).toContain("9개 생태계의 이야기를 따라 38종을 포획");
    for (const entry of OPEN_SOURCE_CATALOG) expect(html).toContain(entry.name.replaceAll("&", "&amp;"));
    expect(html).toContain("블록 보관 코끼리");
    expect((html.match(/role="img"/g) ?? []).length).toBe(OPEN_SOURCE_CATALOG.length);
    const missions = native.controls.filter(({ testID }) => testID?.startsWith("source-battle-"));
    expect(missions).toHaveLength(38);
    expect(missions.every(({ disabled }) => disabled)).toBe(true);
  });
  it("opens only the related tools in English and routes official documentation to its fixed URL", async () => {
    native.controls = [];
    native.openURL.mockClear();
    const html = renderToStaticMarkup(<OpenSourceScreen locale="en" save={createEmptySave("en")} onBattle={() => {}} initialIds={["airflow", "kafka"]} onBack={() => {}} />);
    expect(html).toContain("Apache Airflow");
    expect(html).toContain("Apache Kafka");
    expect(html).not.toContain("Apache Hadoop");
    expect(html).toContain("Tools related to this mission");
    native.controls.find(({ accessibilityLabel }) => accessibilityLabel === "Apache Kafka · Official project documentation")!.onPress!();
    expect(native.openURL).toHaveBeenCalledWith("https://kafka.apache.org/intro/");
  });
  it("routes an available mission and keeps later missions locked until capture", () => {
    const save = createEmptySave("en");
    save.progress.captures = CHAPTERS.flatMap(({ stages }) => stages).map(({ id }) => ({ id, capturedAt: "2026-10-27T00:00:00Z" }));
    const battle = vi.fn();
    native.controls = [];
    renderToStaticMarkup(<OpenSourceScreen locale="en" save={save} onBattle={battle} initialIds={["hadoop", "hdfs"]} onBack={() => {}} />);
    expect(native.controls.find(({ testID }) => testID === "source-battle-hdfs")?.disabled).toBe(true);
    const first = native.controls.find(({ testID }) => testID === "source-battle-hadoop")!;
    expect(first.disabled).toBe(false);
    first.onPress!();
    expect(battle).toHaveBeenCalledWith("open-source:hadoop");
    save.progress.captures.push({ id: "open-source:hadoop", capturedAt: "2026-10-27T01:00:00Z" });
    native.controls = [];
    const html = renderToStaticMarkup(<OpenSourceScreen locale="en" save={save} onBattle={battle} initialIds={["hadoop", "hdfs"]} onBack={() => {}} />);
    expect(html).toContain("REGISTERED IN DEX");
    expect(native.controls.find(({ testID }) => testID === "source-battle-hdfs")?.disabled).toBe(false);
  });
});
