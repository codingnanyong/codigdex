import { Image, StyleSheet, Text, View } from "react-native";
import type { Locale } from "@codigdex/game-core/i18n/locale";
import { localize } from "@codigdex/game-core/i18n/locale";
import { findOpenSource } from "@codigdex/game-content/domain/openSourceCatalog";
import { sourceCareer, sourceCareerName, type SourceEncounter } from "@codigdex/game-content/domain/openSourceEncounters";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { mobileAssetSource } from "../assets";
import { colors, font, pixelPanel } from "../ui/theme";

export function OpenSourceEventScreen({ encounter, captured, locale, onAccept, onLater, saveError, onRetrySave }: { encounter: SourceEncounter; captured: boolean; locale: Locale; onAccept(): void; onLater(): void; saveError: boolean; onRetrySave(): void }) {
  const entry = findOpenSource(encounter.toolId)!;
  const ko = locale === "ko";
  return <Screen scroll><View style={styles.content}>
    <Text testID="source-event-title" accessibilityRole="header" style={styles.heading}>{ko ? "돌발 의뢰 · 오픈소스와의 만남" : "SURPRISE REQUEST · OPEN SOURCE"}</Text>
    <Text testID="source-event-career" style={styles.body}>{localize(sourceCareerName(encounter.careerId), locale)}</Text>
    <Image accessibilityLabel={localize(entry.character.name, locale)} source={mobileAssetSource(entry.character.assetKey!)} resizeMode="contain" style={styles.portrait} />
    <Text testID="source-event-tool" style={styles.heading}>{entry.name}</Text>
    <Text style={styles.body}>{localize(sourceCareer(encounter.careerId)!.workplace, locale)}</Text>
    <Text style={styles.body}>{localize(entry.role, locale)}</Text>
    <Text style={styles.clue}>{localize(entry.learning, locale)}</Text>
    {saveError ? <><Text accessibilityRole="alert" style={styles.body}>{ko ? "의뢰 기록을 저장하지 못했습니다. 종료 전에 다시 저장하세요." : "Could not save this request. Retry before closing the app."}</Text><PixelButton testID="source-event-retry-save" onPress={onRetrySave}>{ko ? "다시 저장" : "RETRY SAVE"}</PixelButton></> : null}
    <PixelButton testID="source-event-accept" onPress={onAccept}>{captured ? (ko ? "직무 모험 계속" : "CONTINUE MY CAREER") : encounter.state === "active" ? (ko ? "의뢰 다시 도전" : "RETRY THIS REQUEST") : (ko ? "참여 · 도구와 문제 해결" : "HELP · SOLVE THE REQUEST")}</PixelButton>
    <PixelButton testID="source-event-later" variant="secondary" onPress={onLater}>{ko ? "나중에 · 원래 경로로" : "LATER · RETURN TO MY PATH"}</PixelButton>
  </View></Screen>;
}

const styles = StyleSheet.create({
  content: { ...pixelPanel, width: "100%", maxWidth: 720, alignSelf: "center", padding: 18, gap: 16 },
  heading: { fontFamily: font, fontSize: 23, lineHeight: 32, color: colors.amber },
  body: { fontFamily: font, fontSize: 16, lineHeight: 25, color: colors.text },
  clue: { fontFamily: font, fontSize: 16, lineHeight: 25, color: colors.cyan },
  portrait: { width: 192, height: 192, alignSelf: "center" },
});
