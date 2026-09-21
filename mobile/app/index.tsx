import { translate } from "@codigdex/game-i18n/messages";
import { router, type Href } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSave } from "@/state/SaveProvider";
import { PixelButton } from "@/ui/PixelButton";
import { Screen } from "@/ui/Screen";
import { colors, font } from "@/ui/theme";

const copy = {
  ko: { archive: "코드 아카이브", body: "잡아낸 버그 몬스터와 배운 개발 지식을 한곳에서 확인하세요.", open: "도감 열기", settings: "설정", saved: "저장 데이터 연결됨", loading: "저장 데이터 확인 중" },
  en: { archive: "CODE ARCHIVE", body: "Review the bug monsters you captured and the coding knowledge you learned.", open: "OPEN CODEX", settings: "SETTINGS", saved: "SAVE DATA LINKED", loading: "CHECKING SAVE DATA" },
} as const;

export default function IntroScreen() {
  const { hydrated, locale } = useSave();
  const text = copy[locale];
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.kicker}>{translate(locale, "intro.subtitle")}</Text>
        <View accessibilityElementsHidden style={styles.emblem}><Text style={styles.emblemText}>{"{ }"}</Text></View>
        <Text style={styles.title}>CODIGDEX</Text>
        <Text style={styles.archive}>{text.archive}</Text>
        <Text style={styles.body}>{text.body}</Text>
      </View>
      <View style={styles.actions}>
        <PixelButton accessibilityLabel={text.open} onPress={() => router.push("/dex" as Href)}>{text.open}</PixelButton>
        <PixelButton accessibilityLabel={text.settings} onPress={() => router.push("/settings" as Href)} variant="secondary">{text.settings}</PixelButton>
      </View>
      <Text accessibilityLiveRegion="polite" style={styles.status}>{hydrated ? text.saved : text.loading}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", flex: 1, justifyContent: "center", minHeight: 390, paddingVertical: 30 },
  kicker: { color: colors.cyan, fontFamily: font, fontSize: 11, letterSpacing: 2.5 },
  emblem: { alignItems: "center", backgroundColor: colors.panelRaised, borderColor: colors.cyan, borderRadius: 24, borderWidth: 3, height: 132, justifyContent: "center", marginVertical: 26, transform: [{ rotate: "3deg" }], width: 132 },
  emblemText: { color: colors.cyan, fontFamily: font, fontSize: 36 },
  title: { color: colors.text, fontFamily: font, fontSize: 38, letterSpacing: 3, textAlign: "center" },
  archive: { color: colors.blue, fontFamily: font, fontSize: 15, marginTop: 7 },
  body: { color: colors.muted, fontFamily: font, fontSize: 13, lineHeight: 21, marginTop: 20, maxWidth: 340, textAlign: "center" },
  actions: { gap: 12 },
  status: { color: colors.muted, fontFamily: font, fontSize: 9, letterSpacing: 1.2, marginTop: 14, textAlign: "center" },
});
