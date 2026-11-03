import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import type { Locale } from "@codigdex/game-core/i18n/locale";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { localize } from "@codigdex/game-core/i18n/locale";
import { findOpenSource } from "@codigdex/game-content/domain/openSourceCatalog";
import { sourceCareer, sourceCareerName, type SourceEncounter } from "@codigdex/game-content/domain/openSourceEncounters";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { mobileAssetSource } from "../assets";
import { colors, font, pixelPanel } from "../ui/theme";
import { PixelScene } from "../ui/PixelScene";
import { openSourceArenaForStage, openSourceEvolutionFor } from "@codigdex/game-content/domain/openSourceChapters";

export function OpenSourceEventScreen({ encounter, stage, captured, capturedLevels = [], locale, onAccept, onLater, onAtlas, saveError, onRetrySave }: { encounter: SourceEncounter; stage: MonsterDefinition; captured: boolean; capturedLevels?: readonly number[]; locale: Locale; onAccept(): void; onLater(): void; onAtlas(): void; saveError: boolean; onRetrySave(): void }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const entry = findOpenSource(encounter.toolId)!;
  const ko = locale === "ko";
  return <Screen scroll><View style={styles.content}>
    <Text testID="source-event-title" accessibilityRole="header" style={styles.heading}>{ko ? "돌발 의뢰 · 오픈소스와의 만남" : "SURPRISE REQUEST · OPEN SOURCE"}</Text>
    <PixelButton testID="source-region-atlas" variant="quiet" onPress={onAtlas}>← {ko ? "오픈소스 지도" : "OPEN-SOURCE ATLAS"}</PixelButton>
    <Text testID="source-event-region" style={styles.heading}>{ko ? "의뢰 지역 · 단계별 탐험" : "REQUEST REGION · FIVE-STAGE EXPLORATION"}</Text>
    <Text testID="source-event-career" style={styles.body}>{localize(sourceCareerName(encounter.careerId), locale)}</Text>
    <View style={styles.arena}>
      <PixelScene backdrop assetKey={openSourceArenaForStage(stage.id)!.assetKey} />
      <Image accessibilityLabel={localize(stage.name, locale)} source={mobileAssetSource(stage.assetKey)} resizeMode="contain" style={styles.portrait} />
    </View>
    <Text style={styles.clue}>No.{stage.dexNumber} · Lv.{stage.level}/5</Text>
    <Text testID="source-event-tool" style={styles.heading}>{entry.name}</Text>
    <PixelButton testID="source-event-details" compact variant="quiet" onPress={() => setDetailsOpen(!detailsOpen)}>{detailsOpen ? (ko ? "설명 접기" : "HIDE DETAILS") : (ko ? "설명 보기" : "DETAILS")}</PixelButton>
    {detailsOpen ? <View style={{ gap: 12 }}>
    <Text style={styles.body}>{localize(sourceCareer(encounter.careerId)!.workplace, locale)}</Text>
    <Text style={styles.body}>{localize(entry.role, locale)}</Text>
    <Text style={styles.clue}>{localize(entry.learning, locale)}</Text>
    </View> : null}
    <Text testID="source-event-progress" style={styles.clue}>{ko ? "같은 의뢰에서 다섯 진화형을 이어서 만납니다." : "Follow all five forms in this request."} · {capturedLevels.length}/5</Text>
    <View style={styles.forms}>{openSourceEvolutionFor(entry.id).map((form) => <View key={form.id} style={[styles.form, form.id === stage.id && styles.current]}>
      <Image accessibilityLabel={localize(form.name, locale)} source={mobileAssetSource(form.assetKey)} resizeMode="contain" style={[styles.smallPortrait, { opacity: capturedLevels.includes(form.level) || form.id === stage.id ? 1 : 0.35 }]} />
      <Text style={styles.smallCopy}>Lv.{form.level}{capturedLevels.includes(form.level) ? " ✓" : ""}{"\n"}No.{form.dexNumber}</Text>
    </View>)}</View>
    {saveError ? <><Text accessibilityRole="alert" style={styles.body}>{ko ? "의뢰 기록을 저장하지 못했습니다. 종료 전에 다시 저장하세요." : "Could not save this request. Retry before closing the app."}</Text><PixelButton testID="source-event-retry-save" onPress={onRetrySave}>{ko ? "다시 저장" : "RETRY SAVE"}</PixelButton></> : null}
    <PixelButton testID="source-event-accept" onPress={onAccept}>{captured ? (ko ? "직무 모험 계속" : "CONTINUE MY CAREER") : encounter.state === "offered" ? (ko ? "참여 · 5단계 탐험" : "START FIVE-STAGE REQUEST") : `${ko ? "이어하기" : "CONTINUE"} · Lv.${stage.level}/5`}</PixelButton>
    <PixelButton testID="source-event-later" variant="secondary" onPress={onLater}>{encounter.state === "offered" ? (ko ? "나중에 · 원래 경로로" : "LATER · RETURN TO MY PATH") : (ko ? "잠시 멈춤 · 직무로" : "PAUSE · RETURN TO MY CAREER")}</PixelButton>
  </View></Screen>;
}

const styles = StyleSheet.create({
  content: { ...pixelPanel, width: "100%", maxWidth: 720, alignSelf: "center", padding: 18, gap: 16 },
  heading: { fontFamily: font, fontSize: 23, lineHeight: 32, color: colors.amber },
  body: { fontFamily: font, fontSize: 16, lineHeight: 25, color: colors.text },
  clue: { fontFamily: font, fontSize: 16, lineHeight: 25, color: colors.cyan },
  arena: { height: 220, overflow: "hidden", justifyContent: "center" },
  portrait: { width: 192, height: 192, alignSelf: "center" },
  forms: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  form: { padding: 4, borderWidth: 2, borderColor: colors.panelRaised, alignItems: "center" },
  current: { borderColor: colors.amber }, smallPortrait: { width: 48, height: 48 },
  smallCopy: { fontFamily: font, fontSize: 11, color: colors.text, textAlign: "center" },
});
