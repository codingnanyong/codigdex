import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { localize, type Locale } from "@codigdex/game-core/i18n/locale";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PixelButton } from "../ui/PixelButton";
import { colors, font, pixelPanel } from "../ui/theme";
import { PixelScene, type PixelScenery } from "../ui/PixelScene";
import { checkpoints, nextCheckpoint, selectedCheckpoint } from "./progression";

export interface WorldMapViewProps {
  captured: ReadonlySet<string>;
  locale: Locale;
  selectedId?: string;
  onSelect(id: string): void;
  onBattle(id: string): void;
  onBack(): void;
  onDex(): void;
}

export function WorldMapView({ captured, locale, selectedId, onSelect, onBattle, onBack, onDex }: WorldMapViewProps) {
  const ko = locale === "ko";
  const path = checkpoints(captured);
  const selected = selectedCheckpoint(captured, selectedId);
  const next = nextCheckpoint(captured);
  const region = path.filter(({ chapter }) => chapter.id === selected.chapter.id);
  const completed = region.filter(({ status }) => status === "cleared").length;
  const allComplete = path.every(({ status }) => status === "cleared");
  const stateLabel = (status: string) => status === "cleared" ? (ko ? "완료" : "CLEARED") : status === "available" ? (ko ? "현재" : "CURRENT") : (ko ? "잠금" : "LOCKED");
  return <>
    <View style={styles.topbar}>
      <PixelButton compact variant="quiet" onPress={onBack}>{ko ? "메뉴" : "MENU"}</PixelButton>
      <Text accessibilityRole="header" style={styles.kicker}>WORLD MAP</Text>
      <PixelButton compact variant="secondary" onPress={onDex}>{ko ? "도감" : "DEX"}</PixelButton>
    </View>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.heading}>
        <Text style={styles.title}>{ko ? "코드의 세계를 탐험하세요" : "EXPLORE THE WORLD OF CODE"}</Text>
        <Text style={styles.body}>{ko ? "튜토리얼 → Git → Linux · 체크포인트를 터치해 이동하세요." : "Tutorial → Git → Linux · Tap a checkpoint to travel."}</Text>
        <Text style={styles.summary}>{path.filter(({ status }) => status === "cleared").length}/{path.length} {ko ? "체크포인트 완료" : "CHECKPOINTS CLEARED"}</Text>
      </View>
      <View style={styles.landscape}><PixelScene scene={selected.chapter.id as PixelScenery} height={152} /><View style={styles.landscapeLabel}><Text style={styles.kicker}>{selected.chapter.label} · {localize(selected.chapter.place, locale)}</Text></View></View>
      <View style={styles.regions}>
        {CHAPTERS.map((chapter, index) => {
          const stages = path.filter((point) => point.chapter.id === chapter.id);
          const count = stages.filter(({ status }) => status === "cleared").length;
          const status = count === stages.length ? "cleared" : stages.some((stage) => stage.status === "available") ? "available" : "locked";
          const active = chapter.id === selected.chapter.id;
          return <Pressable key={chapter.id} accessibilityRole="button" accessibilityLabel={`${localize(chapter.name, locale)}, ${stateLabel(status)}, ${count}/${stages.length}`}
            accessibilityState={{ selected: active }} onPress={() => onSelect((stages.find((stage) => stage.status !== "cleared") ?? stages.at(-1)!).monster.id)}
            style={[styles.region, active && styles.regionActive]}>
            <Text style={styles.regionNumber}>0{index + 1} · {stateLabel(status)}</Text>
            <Text style={styles.regionName}>{localize(chapter.name, locale)}</Text>
            <Text style={styles.body}>{localize(chapter.place, locale)}</Text>
            <Text style={styles.summary}>{count}/{stages.length} {ko ? "완료" : "CLEARED"}</Text>
          </Pressable>;
        })}
      </View>
      <View style={styles.map}>
        <Text style={styles.kicker}>{selected.chapter.label} · {localize(selected.chapter.place, locale)}</Text>
        <Text accessibilityRole="header" style={styles.regionName}>{ko ? "지역 체크포인트" : "REGION CHECKPOINTS"}</Text>
        <Text style={styles.body}>{completed}/{region.length} · {ko ? "✓ 완료 / ◆ 현재 / × 잠금" : "✓ CLEARED / ◆ CURRENT / × LOCKED"}</Text>
        <View style={styles.trail}>
          {region.map(({ monster, status }, index) => {
            const active = monster.id === selected.monster.id;
            return <View key={monster.id} style={styles.trailRow}>
              <View accessible={false} style={styles.connectorColumn}>
                <View style={[styles.node, status === "cleared" && styles.nodeCleared, active && styles.nodeActive]}><Text style={styles.nodeText}>{status === "cleared" ? "✓" : status === "locked" ? "×" : "◆"}</Text></View>
                {index < region.length - 1 ? <View style={styles.connector} /> : null}
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Lv.${monster.level} ${localize(monster.name, locale)}, ${stateLabel(status)}`}
                accessibilityState={{ selected: active, disabled: status === "locked" }} disabled={status === "locked"}
                onPress={() => onSelect(monster.id)} style={[styles.checkpoint, active && styles.checkpointActive, status === "locked" && styles.locked]}>
                <Text style={styles.regionNumber}>LV.{monster.level} · {stateLabel(status)}</Text>
                <Text style={styles.checkpointName}>{localize(monster.name, locale)}</Text>
              </Pressable>
            </View>;
          })}
        </View>
        {selected.status === "locked" ? <Text accessibilityRole="alert" style={styles.notice}>{ko ? "앞선 지역과 체크포인트를 완료하면 열립니다." : "Complete the preceding regions and checkpoints to unlock this stage."}</Text> : <>
          <Text accessibilityLiveRegion="polite" style={styles.regionName}>{localize(selected.monster.name, locale)}</Text>
          <Text style={styles.body}>{localize(selected.monster.briefing, locale)}</Text>
        </>}
        <PixelButton accessibilityLabel={ko ? "선택한 체크포인트 전투" : "Battle selected checkpoint"} disabled={selected.status === "locked"} onPress={() => { if (selected.status !== "locked") onBattle(selected.monster.id); }}>
          {selected.status === "cleared" ? (ko ? "완료한 체크포인트 재도전" : "REPLAY CHECKPOINT") : (ko ? "체크포인트 전투 시작" : "START CHECKPOINT BATTLE")}
        </PixelButton>
        {!allComplete && selected.monster.id !== next.monster.id ? <PixelButton accessibilityLabel={ko ? "다음 미션으로 이동" : "Go to next mission"} variant="secondary" onPress={() => onSelect(next.monster.id)}>{ko ? "다음 미션으로 이동" : "GO TO NEXT MISSION"}</PixelButton> : null}
        {allComplete ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{ko ? "공통 경로 완료! 모든 체크포인트를 다시 도전할 수 있습니다." : "Common path complete! Replay any checkpoint."}</Text> : null}
      </View>
    </ScrollView>
  </>;
}

const styles = StyleSheet.create({
  topbar: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 8, paddingBottom: 12 },
  scroll: { flex: 1, minHeight: 0 },
  content: { gap: 18, maxWidth: 980, width: "100%", alignSelf: "center", paddingBottom: 24 },
  heading: { gap: 8 },
  landscape: { ...pixelPanel, overflow: "hidden" },
  landscapeLabel: { padding: 12, backgroundColor: colors.panel, borderTopWidth: 2, borderColor: colors.shadow },
  kicker: { color: colors.cyan, fontFamily: font, fontSize: 15, flexShrink: 1 },
  title: { color: colors.text, fontFamily: font, fontSize: 30, lineHeight: 32 },
  body: { color: colors.muted, fontFamily: font, fontSize: 15, lineHeight: 22 },
  summary: { color: colors.cyan, fontFamily: font, fontSize: 15, lineHeight: 22 },
  regions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  region: { backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 2, borderRadius: 0, padding: 8, flexGrow: 1, flexBasis: "28%", minWidth: 0, minHeight: 120, gap: 6 },
  regionActive: { borderColor: colors.cyan, backgroundColor: colors.panelRaised },
  regionNumber: { color: colors.blue, fontFamily: font, fontSize: 15, lineHeight: 22 },
  regionName: { color: colors.text, fontFamily: font, fontSize: 15, lineHeight: 25 },
  map: { ...pixelPanel, padding: 16, gap: 12 },
  trail: { paddingVertical: 8 },
  trailRow: { flexDirection: "row", gap: 14, minHeight: 88 },
  connectorColumn: { width: 38, alignItems: "center" },
  node: { width: 38, height: 38, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", borderRadius: 0, marginTop: 12 },
  nodeActive: { borderColor: colors.amber },
  nodeCleared: { borderColor: colors.cyan, backgroundColor: colors.grass },
  nodeText: { color: colors.text, fontFamily: font, fontSize: 30 },
  connector: { width: 4, flex: 1, backgroundColor: colors.border, minHeight: 30 },
  checkpoint: { flex: 1, minHeight: 64, padding: 12, gap: 4, backgroundColor: colors.panelRaised, borderWidth: 2, borderColor: colors.border, borderRadius: 0, marginBottom: 12 },
  checkpointActive: { borderColor: colors.amber },
  checkpointName: { color: colors.text, fontFamily: font, fontSize: 15, lineHeight: 22 },
  locked: { opacity: 0.55 },
  notice: { color: colors.amber, fontFamily: font, fontSize: 15, lineHeight: 22 },
});
