import { localize } from "@codigdex/game-core/i18n/locale";
import { translate } from "@codigdex/game-i18n/messages";
import { router, useLocalSearchParams, type Href } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { mobileAssetSource } from "@/assets";
import { findReleasedDexEntry } from "@/dex/catalog";
import { useSave } from "@/state/SaveProvider";
import { PixelButton } from "@/ui/PixelButton";
import { Screen } from "@/ui/Screen";
import { colors, font } from "@/ui/theme";

const copy = {
  ko: { captured: "등록 완료", trait: "특성", knowledge: "코드 메모", unavailable: "카드를 찾을 수 없습니다", hidden: "이 몬스터를 포획하면 상세 기록이 열립니다." },
  en: { captured: "REGISTERED", trait: "TRAIT", knowledge: "CODE NOTE", unavailable: "Card not found", hidden: "Capture this monster to unlock its full record." },
} as const;

export default function DexDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { locale, save } = useSave();
  const capturedIds = new Set(save.progress.captures.map((capture) => capture.id));
  const entry = findReleasedDexEntry(id, capturedIds);
  const text = copy[locale];

  if (!entry || entry.kind !== "released") {
    return (
      <Screen>
        <View style={styles.empty}><Text style={styles.emptyText}>{text.unavailable}</Text></View>
        <PixelButton onPress={goBack} variant="secondary">{translate(locale, "common.back")}</PixelButton>
      </Screen>
    );
  }

  const monster = entry.slot.monster;
  if (!entry.captured) {
    return (
      <Screen>
        <Text style={styles.number}>NO.{entry.dexNumber}</Text>
        <View style={styles.lockedCard}>
          <Text accessibilityElementsHidden style={styles.lockedQuestion}>?</Text>
          <Text accessibilityRole="header" style={styles.lockedTitle}>{translate(locale, "dex.unobserved")}</Text>
          <Text style={styles.lockedBody}>{text.hidden}</Text>
        </View>
        <PixelButton accessibilityLabel={translate(locale, "common.back")} onPress={goBack} variant="secondary">{translate(locale, "common.back")}</PixelButton>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.topline}>
        <Text style={styles.number}>NO.{entry.dexNumber}</Text>
        <Text style={styles.registered}>{text.captured}</Text>
      </View>
      <View style={styles.heroCard}>
        <Image accessibilityLabel={localize(monster.name, locale)} resizeMode="contain" source={mobileAssetSource(monster.assetKey)} style={styles.monster} />
        <Text accessibilityRole="header" style={styles.name}>{localize(monster.name, locale)}</Text>
        <Text style={styles.classification}>{localize(monster.classification, locale)}</Text>
      </View>
      <InfoBlock label={text.trait} value={localize(monster.trait, locale)} />
      <InfoBlock label={text.knowledge} value={localize(monster.description, locale)} />
      <View style={styles.codeBlock}><Text selectable style={styles.code}>{localize(monster.snippet, locale)}</Text></View>
      <View style={styles.footer}>
        <PixelButton accessibilityLabel={translate(locale, "common.back")} onPress={goBack} variant="secondary">{translate(locale, "common.back")}</PixelButton>
      </View>
    </Screen>
  );

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/dex" as Href);
  }
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return <View style={styles.info}><Text style={styles.infoLabel}>{label}</Text><Text style={styles.infoValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  topline: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  number: { color: colors.blue, fontFamily: font, fontSize: 11, letterSpacing: 1.5, marginBottom: 12 },
  registered: { color: colors.cyan, fontFamily: font, fontSize: 9 },
  heroCard: { alignItems: "center", backgroundColor: colors.panelRaised, borderColor: colors.cyan, borderRadius: 18, borderWidth: 1, padding: 22 },
  monster: { height: 190, width: 190 },
  name: { color: colors.text, fontFamily: font, fontSize: 24, marginTop: 10, textAlign: "center" },
  classification: { color: colors.muted, fontFamily: font, fontSize: 12, marginTop: 6, textAlign: "center" },
  info: { borderBottomColor: colors.border, borderBottomWidth: 1, paddingVertical: 18 },
  infoLabel: { color: colors.cyan, fontFamily: font, fontSize: 9, letterSpacing: 1.4 },
  infoValue: { color: colors.text, fontFamily: font, fontSize: 13, lineHeight: 21, marginTop: 8 },
  codeBlock: { backgroundColor: colors.shadow, borderColor: colors.border, borderRadius: 10, borderWidth: 1, marginTop: 18, padding: 15 },
  code: { color: colors.amber, fontFamily: font, fontSize: 11, lineHeight: 18 },
  footer: { marginTop: 20 },
  lockedCard: { alignItems: "center", backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 18, borderStyle: "dashed", borderWidth: 2, flex: 1, justifyContent: "center", marginBottom: 20, minHeight: 410, padding: 28 },
  lockedQuestion: { color: colors.border, fontFamily: font, fontSize: 92 },
  lockedTitle: { color: colors.text, fontFamily: font, fontSize: 20, marginTop: 18, textAlign: "center" },
  lockedBody: { color: colors.muted, fontFamily: font, fontSize: 12, lineHeight: 20, marginTop: 12, textAlign: "center" },
  empty: { alignItems: "center", flex: 1, justifyContent: "center", minHeight: 400 },
  emptyText: { color: colors.muted, fontFamily: font, fontSize: 14 },
});
