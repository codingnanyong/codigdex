import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Locale } from "@codigdex/game-core/i18n/locale";
import { findOpenSource, OPEN_SOURCE_FAMILIES } from "@codigdex/game-content/domain/openSourceCatalog";
import { openSourceExpeditionFor } from "@codigdex/game-content/domain/openSourceChapters";
import type { SourceEncounter } from "@codigdex/game-content/domain/openSourceEncounters";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { mobileAssetSource } from "../assets";
import { colors, font, pixelPanel } from "../ui/theme";

export function OpenSourceAtlasScreen({ encounter, locale, onEnter, onLater, saveError, onRetrySave }: {
  encounter: SourceEncounter; locale: Locale; onEnter(): void; onLater(): void; saveError: boolean; onRetrySave(): void;
}) {
  const entry = findOpenSource(encounter.toolId)!;
  const ko = locale === "ko";
  return <Screen scroll><View testID="source-atlas" style={styles.content}>
    <Text testID="source-event-title" accessibilityRole="header" style={styles.heading}>{ko ? "오픈소스 · 생태계 지도" : "OPEN SOURCE · ECOSYSTEM ATLAS"}</Text>
    <Text testID="source-event-tool" style={styles.heading}>{entry.name}</Text>
    <Text style={styles.body}>{ko ? "의뢰가 있는 지역으로 이동해 다섯 성장 단계를 탐험하세요." : "Travel to your request's region and explore its five stages."}</Text>
    <View style={styles.grid}>{Object.entries(OPEN_SOURCE_FAMILIES).map(([family, label]) => {
      const active = family === entry.family;
      return <Pressable key={family} testID={`source-atlas-region-${family}`} accessibilityRole="button" accessibilityLabel={label[locale]} accessibilityState={{ disabled: !active, selected: active }} disabled={!active} onPress={onEnter} style={[styles.region, active && styles.active]}>
        <Image source={mobileAssetSource(openSourceExpeditionFor(family)!.chapter.arena!.assetKey)} style={[styles.art, { opacity: active ? 1 : 0.35 }]} resizeMode="cover" />
        <Text style={styles.label}>{label[locale]}</Text>
        <Text style={styles.body}>{active ? (ko ? "◆ 현재 의뢰 지역" : "◆ CURRENT DESTINATION") : (ko ? "진행 중 의뢰 없음" : "NO ACTIVE REQUEST")}</Text>
      </Pressable>;
    })}</View>
    {saveError ? <><Text accessibilityRole="alert" style={styles.body}>{ko ? "의뢰 기록을 저장하지 못했습니다." : "Could not save this request."}</Text><PixelButton testID="source-event-retry-save" onPress={onRetrySave}>{ko ? "다시 저장" : "RETRY SAVE"}</PixelButton></> : null}
    <PixelButton testID="source-atlas-enter" onPress={onEnter}>{ko ? "의뢰 지역으로 이동" : "TRAVEL TO REQUEST REGION"} · {OPEN_SOURCE_FAMILIES[entry.family][locale]}</PixelButton>
    <PixelButton testID="source-event-later" variant="secondary" onPress={onLater}>{ko ? "직무 경로로 돌아가기" : "RETURN TO MY CAREER"}</PixelButton>
  </View></Screen>;
}
const styles = StyleSheet.create({
  content: { ...pixelPanel, width: "100%", maxWidth: 900, alignSelf: "center", padding: 16, gap: 12 },
  heading: { fontFamily: font, fontSize: 22, lineHeight: 30, color: colors.amber },
  body: { fontFamily: font, fontSize: 14, lineHeight: 21, color: colors.text },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  region: { flexGrow: 1, flexBasis: "44%", minWidth: 130, padding: 8, gap: 6, borderWidth: 2, borderColor: colors.panelRaised },
  active: { borderColor: colors.amber }, art: { width: "100%", aspectRatio: 16 / 9 },
  label: { fontFamily: font, fontSize: 16, lineHeight: 24, color: colors.text },
});
