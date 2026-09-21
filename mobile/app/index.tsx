import { ASSET_KEYS } from "@codigdex/game-assets/manifest";
import { DEX_MONSTERS } from "@codigdex/game-content/domain/chapters";
import { localize, type Locale } from "@codigdex/game-core/i18n/locale";
import { translate } from "@codigdex/game-i18n/messages";
import { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type TextProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { mobileAssetSource } from "@/assets";

const copy = {
  ko: {
    eyebrow: "MOBILE LINK ONLINE",
    title: "공유 게임 코어 연결 완료",
    body: "웹과 같은 몬스터·번역·자산을 Expo에서 직접 읽고 있습니다.",
    released: "출시 몬스터",
    assets: "연결 자산",
    specimen: "첫 표본",
  },
  en: {
    eyebrow: "MOBILE LINK ONLINE",
    title: "Shared game core connected",
    body: "Expo is reading the same monsters, translations and assets as the web game.",
    released: "Released monsters",
    assets: "Linked assets",
    specimen: "First specimen",
  },
} as const;

export default function MobileFoundationScreen() {
  const [locale, setLocale] = useState<Locale>("ko");
  const firstMonster = DEX_MONSTERS[0];
  const text = copy[locale];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View>
            <Text style={textStyles.brand}>{translate(locale, "dex.title")}</Text>
            <Text style={textStyles.eyebrow}>{text.eyebrow}</Text>
          </View>
          <View accessibilityLabel={translate(locale, "settings.language")} style={styles.localeSwitch}>
            {(["ko", "en"] as const).map((value) => (
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ selected: locale === value }}
                key={value}
                onPress={() => setLocale(value)}
                style={[styles.localeButton, locale === value ? styles.localeButtonActive : undefined]}
              >
                <Text
                  style={[
                    textStyles.localeLabel,
                    locale === value ? textStyles.localeLabelActive : undefined,
                  ]}
                >
                  {value.toUpperCase()}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.signalRow}>
          <View style={styles.signalDot} />
          <Text style={textStyles.signalText}>{text.title}</Text>
        </View>
        <Text style={textStyles.body}>{text.body}</Text>

        <View style={styles.stats}>
          <Stat label={text.released} value={DEX_MONSTERS.length} />
          <View style={styles.divider} />
          <Stat label={text.assets} value={ASSET_KEYS.length} />
        </View>

        <View style={styles.specimenCard}>
          <View style={styles.scanLine} />
          <Text style={textStyles.cardLabel}>{text.specimen} · NO.{firstMonster.dexNumber}</Text>
          <Image
            accessibilityLabel={localize(firstMonster.name, locale)}
            resizeMode="contain"
            source={mobileAssetSource(firstMonster.assetKey)}
            style={styles.monster}
          />
          <Text style={textStyles.monsterName}>{localize(firstMonster.name, locale)}</Text>
          <Text style={textStyles.monsterClass}>{localize(firstMonster.classification, locale)}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={textStyles.statValue}>{value}</Text>
      <Text style={textStyles.statLabel}>{label}</Text>
    </View>
  );
}

const colors = {
  background: "#07121d",
  panel: "#0d2030",
  panelRaised: "#122d40",
  cyan: "#5cf2d6",
  blue: "#6ab7ff",
  text: "#eef8ff",
  muted: "#8ea9ba",
  border: "#23475d",
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  screen: { flex: 1, paddingHorizontal: 22, paddingBottom: 24 },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 22,
    paddingTop: 14,
  },
  localeSwitch: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: "row",
    padding: 3,
  },
  localeButton: { borderRadius: 7, paddingHorizontal: 9, paddingVertical: 7 },
  localeButtonActive: { backgroundColor: colors.cyan },
  signalRow: { alignItems: "center", flexDirection: "row", gap: 9 },
  signalDot: { backgroundColor: colors.cyan, borderRadius: 5, height: 10, width: 10 },
  stats: {
    backgroundColor: colors.panel,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 22,
    paddingVertical: 16,
  },
  stat: { alignItems: "center", flex: 1 },
  divider: { backgroundColor: colors.border, width: 1 },
  specimenCard: {
    alignItems: "center",
    backgroundColor: colors.panelRaised,
    borderColor: colors.border,
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 300,
    overflow: "hidden",
    padding: 24,
  },
  scanLine: { backgroundColor: colors.cyan, height: 2, left: 0, opacity: 0.6, position: "absolute", right: 0, top: 58 },
  monster: { height: 176, width: 176 },
});

type TextStyleProp = NonNullable<TextProps["style"]>;

const textStyles: Record<
  | "brand"
  | "eyebrow"
  | "localeLabel"
  | "localeLabelActive"
  | "signalText"
  | "body"
  | "statValue"
  | "statLabel"
  | "cardLabel"
  | "monsterName"
  | "monsterClass",
  TextStyleProp
> = {
  brand: { color: colors.text, fontFamily: "Galmuri14", fontSize: 24, letterSpacing: 2 },
  eyebrow: { color: colors.cyan, fontFamily: "Galmuri14", fontSize: 10, letterSpacing: 1.5, marginTop: 3 },
  localeLabel: { color: colors.muted, fontFamily: "Galmuri14", fontSize: 11 },
  localeLabelActive: { color: colors.background, fontFamily: "Galmuri14" },
  signalText: { color: colors.text, fontFamily: "Galmuri14", fontSize: 20 },
  body: { color: colors.muted, fontFamily: "Galmuri14", fontSize: 14, lineHeight: 21, marginTop: 8, maxWidth: 340 },
  statValue: { color: colors.blue, fontFamily: "Galmuri14", fontSize: 25 },
  statLabel: { color: colors.muted, fontFamily: "Galmuri14", fontSize: 11, marginTop: 3 },
  cardLabel: {
    color: colors.cyan,
    fontFamily: "Galmuri14",
    fontSize: 11,
    letterSpacing: 1.2,
    position: "absolute",
    top: 24,
  },
  monsterName: { color: colors.text, fontFamily: "Galmuri14", fontSize: 22, marginTop: 12, textAlign: "center" },
  monsterClass: { color: colors.muted, fontFamily: "Galmuri14", fontSize: 13, marginTop: 5, textAlign: "center" },
};
