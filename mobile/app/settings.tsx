import { LOCALES, LOCALE_NAMES } from "@codigdex/game-core/i18n/locale";
import { translate } from "@codigdex/game-i18n/messages";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSave } from "@/state/SaveProvider";
import { PixelButton } from "@/ui/PixelButton";
import { Screen } from "@/ui/Screen";
import { colors, font } from "@/ui/theme";

export default function SettingsScreen() {
  const { locale, setLocale } = useSave();
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
      <View style={styles.spacer} />
      <PixelButton accessibilityLabel={translate(locale, "common.back")} onPress={() => router.back()} variant="secondary">{translate(locale, "common.back")}</PixelButton>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 22, paddingTop: 10 },
  eyebrow: { color: colors.cyan, fontFamily: font, fontSize: 10, letterSpacing: 2 },
  title: { color: colors.text, fontFamily: font, fontSize: 30, marginTop: 7 },
  panel: { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 16, borderWidth: 1, padding: 18 },
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
