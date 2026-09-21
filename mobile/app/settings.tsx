import { LOCALES, LOCALE_NAMES } from "@codigdex/game-core/i18n/locale";
import { translate } from "@codigdex/game-i18n/messages";
import { router, type Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSave } from "@/state/SaveProvider";
import { PixelButton } from "@/ui/PixelButton";
import { Screen } from "@/ui/Screen";
import { colors, font } from "@/ui/theme";

export default function SettingsScreen() {
  const { clearCaptures, loadDemoCaptures, locale, save, setLocale } = useSave();
  const text = copy[locale];
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SYSTEM / UI</Text>
        <Text accessibilityRole="header" style={styles.title}>{translate(locale, "settings.title")}</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.label}>{translate(locale, "settings.language")}</Text>
        <Text style={styles.hint}>{translate(locale, "settings.languageHint")}</Text>
        <View accessibilityRole="radiogroup" style={styles.options}>
          {LOCALES.map((option) => {
            const selected = option === locale;
            return (
              <Pressable
                accessibilityLabel={LOCALE_NAMES[option]}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                key={option}
                onPress={() => setLocale(option)}
                style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}
              >
                <View style={[styles.radio, selected && styles.radioSelected]} />
                <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{LOCALE_NAMES[option]}</Text>
                <Text style={styles.code}>{option.toUpperCase()}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {__DEV__ ? (
        <View style={styles.developerPanel}>
          <Text style={styles.developerEyebrow}>DEVELOPER TEST DATA</Text>
          <Text style={styles.developerTitle}>{text.testData}</Text>
          <Text style={styles.hint}>{text.testDataHint}</Text>
          <Text accessibilityLiveRegion="polite" style={styles.captureCount}>
            {text.captureCount}: {save.progress.captures.length}
          </Text>
          <View style={styles.developerActions}>
            <PixelButton accessibilityLabel={text.loadSample} onPress={loadDemoCaptures} variant="secondary">
              {text.loadSample}
            </PixelButton>
            <PixelButton accessibilityLabel={text.clearSample} onPress={clearCaptures} variant="quiet">
              {text.clearSample}
            </PixelButton>
          </View>
        </View>
      ) : null}
      <View style={styles.spacer} />
      <PixelButton accessibilityLabel={translate(locale, "common.back")} onPress={goBack} variant="secondary">{translate(locale, "common.back")}</PixelButton>
    </Screen>
  );

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace("/" as Href);
  }
}

const styles = StyleSheet.create({
  header: { paddingBottom: 22, paddingTop: 10 },
  eyebrow: { color: colors.cyan, fontFamily: font, fontSize: 10, letterSpacing: 2 },
  title: { color: colors.text, fontFamily: font, fontSize: 30, marginTop: 7 },
  panel: { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 16, borderWidth: 1, padding: 18 },
  developerPanel: { backgroundColor: colors.panel, borderColor: colors.amber, borderRadius: 16, borderStyle: "dashed", borderWidth: 1, marginTop: 16, padding: 18 },
  developerEyebrow: { color: colors.amber, fontFamily: font, fontSize: 9, letterSpacing: 1.3 },
  developerTitle: { color: colors.text, fontFamily: font, fontSize: 16, marginTop: 8 },
  captureCount: { color: colors.blue, fontFamily: font, fontSize: 11, marginTop: 14 },
  developerActions: { gap: 10, marginTop: 14 },
  label: { color: colors.text, fontFamily: font, fontSize: 17 },
  hint: { color: colors.muted, fontFamily: font, fontSize: 12, lineHeight: 19, marginTop: 8 },
  options: { gap: 10, marginTop: 22 },
  option: { alignItems: "center", backgroundColor: colors.background, borderColor: colors.border, borderRadius: 10, borderWidth: 1, flexDirection: "row", minHeight: 58, paddingHorizontal: 15 },
  optionSelected: { backgroundColor: colors.panelRaised, borderColor: colors.cyan },
  pressed: { opacity: 0.72 },
  radio: { borderColor: colors.muted, borderRadius: 8, borderWidth: 2, height: 16, marginRight: 12, width: 16 },
  radioSelected: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  optionText: { color: colors.muted, flex: 1, fontFamily: font, fontSize: 14 },
  optionTextSelected: { color: colors.text },
  code: { color: colors.blue, fontFamily: font, fontSize: 10 },
  spacer: { flex: 1, minHeight: 28 },
});

const copy = {
  ko: {
    captureCount: "현재 포획 수",
    clearSample: "포획 기록 비우기",
    loadSample: "샘플 포획 데이터 불러오기",
    testData: "홈 테스트 도구",
    testDataHint: "개발 빌드에서만 표시됩니다. 샘플 카드를 등록하거나 미발견 상태로 되돌릴 수 있습니다.",
  },
  en: {
    captureCount: "Captured",
    clearSample: "CLEAR CAPTURES",
    loadSample: "LOAD SAMPLE CAPTURES",
    testData: "Home test tools",
    testDataHint: "Only shown in development. Register sample cards or return the dex to its unobserved state.",
  },
} as const;
