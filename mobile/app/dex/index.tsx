import { DEX_CATALOG } from "@codigdex/game-content/domain/dex/catalog";
import { localize } from "@codigdex/game-core/i18n/locale";
import { translate } from "@codigdex/game-i18n/messages";
import { router, type Href } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { mobileAssetSource } from "@/assets";
import { buildMobileDexEntries, type MobileDexEntry } from "@/dex/catalog";
import { dexGridMetrics } from "@/dex/layout";
import { useSave } from "@/state/SaveProvider";
import { PixelButton } from "@/ui/PixelButton";
import { Screen } from "@/ui/Screen";
import { colors, font } from "@/ui/theme";

const copy = {
  ko: { registered: "등록", unknown: "미발견", settings: "설정 열기", card: "도감 카드", planned: "미발견 지역" },
  en: { registered: "REGISTERED", unknown: "UNOBSERVED", settings: "Open settings", card: "dex card", planned: "UNDISCOVERED REGION" },
} as const;

export default function DexListScreen() {
  const { locale, save } = useSave();
  const { width } = useWindowDimensions();
  const capturedIds = new Set(save.progress.captures.map(({ id }) => id));
  const entries = buildMobileDexEntries(capturedIds);
  const released = DEX_CATALOG.filter((slot) => slot.kind === "released").length;
  const captured = entries.filter((entry) => entry.captured).length;
  const planned = entries.length - released;
  const { cardWidth, imageSize } = dexGridMetrics(width);
  const text = copy[locale];

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>MOBILE ARCHIVE</Text>
          <Text accessibilityRole="header" style={styles.title}>{translate(locale, "dex.title")}</Text>
        </View>
        <Pressable accessibilityLabel={text.settings} accessibilityRole="button" onPress={() => router.push("/settings" as Href)} style={styles.settings}>
          <Text style={styles.settingsText}>⚙</Text>
        </Pressable>
      </View>
      <View style={styles.stats}>
        <Text style={styles.statsText}>{translate(locale, "dex.monsterStats", { captured, released, planned })}</Text>
      </View>
      <View style={styles.grid}>
        {entries.map((entry) => (
          <DexCard cardWidth={cardWidth} entry={entry} imageSize={imageSize} key={`${entry.kind}-${entry.id}`} locale={locale} />
        ))}
      </View>
      <View style={styles.footer}>
        <PixelButton accessibilityLabel={translate(locale, "common.back")} onPress={goBack} variant="quiet">{translate(locale, "common.back")}</PixelButton>
      </View>
    </Screen>
  );

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/" as Href);
  }
}

function DexCard({ cardWidth, entry, imageSize, locale }: { cardWidth: number; entry: MobileDexEntry; imageSize: number; locale: "ko" | "en" }) {
  const text = copy[locale];
  const capturedMonster = entry.kind === "released" && entry.captured ? entry.slot.monster : undefined;
  const label = capturedMonster
    ? `NO.${entry.dexNumber} ${localize(capturedMonster.name, locale)} ${text.card}`
    : `NO.${entry.dexNumber} ${entry.kind === "planned" ? text.planned : text.unknown}`;
  const canOpen = entry.kind === "released";

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole={canOpen ? "button" : "text"}
      disabled={!canOpen}
      onPress={() => canOpen && router.push(`/dex/${entry.id}` as Href)}
      style={({ pressed }) => [styles.card, { width: cardWidth }, capturedMonster && styles.cardCaptured, pressed && styles.cardPressed]}
    >
      <Text style={styles.number}>NO.{entry.dexNumber}</Text>
      <View style={styles.portrait}>
        {capturedMonster ? (
          <Image accessibilityIgnoresInvertColors resizeMode="contain" source={mobileAssetSource(capturedMonster.assetKey)} style={[styles.monster, { height: imageSize, width: imageSize }]} />
        ) : (
          <Text accessibilityElementsHidden style={styles.question}>?</Text>
        )}
      </View>
      <Text numberOfLines={1} style={[styles.name, !capturedMonster && styles.nameUnknown]}>
        {capturedMonster ? localize(capturedMonster.name, locale) : entry.kind === "planned" ? "???" : text.unknown}
      </Text>
      <Text style={[styles.badge, capturedMonster && styles.badgeCaptured]}>{capturedMonster ? text.registered : text.unknown}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", paddingBottom: 14 },
  headerCopy: { flex: 1 },
  eyebrow: { color: colors.cyan, fontFamily: font, fontSize: 9, letterSpacing: 2 },
  title: { color: colors.text, fontFamily: font, fontSize: 27, marginTop: 5 },
  settings: { alignItems: "center", backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 10, borderWidth: 1, height: 46, justifyContent: "center", width: 46 },
  settingsText: { color: colors.cyan, fontSize: 21 },
  stats: { backgroundColor: colors.panel, borderLeftColor: colors.cyan, borderLeftWidth: 3, borderRadius: 6, marginBottom: 16, paddingHorizontal: 12, paddingVertical: 10 },
  statsText: { color: colors.muted, fontFamily: font, fontSize: 10, lineHeight: 16 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "center" },
  card: { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 13, borderWidth: 1, minHeight: 220, padding: 12 },
  cardCaptured: { backgroundColor: colors.panelRaised, borderColor: colors.cyan },
  cardPressed: { opacity: 0.7, transform: [{ translateY: 2 }] },
  number: { color: colors.blue, fontFamily: font, fontSize: 9, letterSpacing: 1 },
  portrait: { alignItems: "center", flex: 1, justifyContent: "center", minHeight: 112 },
  monster: { height: 108, width: 108 },
  question: { color: colors.border, fontFamily: font, fontSize: 55 },
  name: { color: colors.text, fontFamily: font, fontSize: 13, textAlign: "center" },
  nameUnknown: { color: colors.muted },
  badge: { color: colors.muted, fontFamily: font, fontSize: 8, marginTop: 8, textAlign: "center" },
  badgeCaptured: { color: colors.cyan },
  footer: { marginTop: 22 },
});
