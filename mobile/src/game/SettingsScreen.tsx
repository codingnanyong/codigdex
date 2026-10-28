import { Alert, Text, View } from "react-native";
import { AccountPanel } from "../account/AccountPanel";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { useSave } from "../state/SaveProvider";
import { styles } from "./gameScreenStyles";

export function SettingsScreen({ onBack }: { onBack(): void }) {
  const { clearProgress, locale, setLocale, saveError, retrySave } = useSave();
  const ko = locale === "ko";
  return (
    <Screen scroll>
      <View style={styles.topbar}><PixelButton compact onPress={onBack} variant="quiet">← {ko ? "메뉴" : "MENU"}</PixelButton><Text style={styles.topbarTitle}>{ko ? "설정" : "SETTINGS"}</Text><View style={styles.topbarGap} /></View>
      <View style={styles.settingsPanel}>
        <AccountPanel />
        <Text style={styles.hudTitle}>{ko ? "언어" : "LANGUAGE"}</Text>
        <View style={styles.settingsRow}>
          <PixelButton onPress={() => setLocale("ko")} variant={locale === "ko" ? "primary" : "secondary"}>한국어</PixelButton>
          <PixelButton onPress={() => setLocale("en")} variant={locale === "en" ? "primary" : "secondary"}>English</PixelButton>
        </View>
        <Text style={styles.hudTitle}>{ko ? "저장 데이터" : "SAVE DATA"}</Text>
        <PixelButton onPress={() => Alert.alert(ko ? "처음부터 시작할까요?" : "Start over?", ko ? "이 기기의 포획 기록과 체크포인트가 초기화됩니다." : "Captures and checkpoints on this device will be reset.", [{ text: ko ? "취소" : "Cancel", style: "cancel" }, { text: ko ? "초기화" : "Reset", style: "destructive", onPress: clearProgress }])} variant="danger">{ko ? "진행도 초기화" : "RESET PROGRESS"}</PixelButton>
        <Text style={styles.hint}>{ko ? "게임 진행도는 기기에 자동 저장됩니다." : "Progress is saved automatically on this device."}</Text>
        {saveError ? <>
          <Text accessibilityRole="alert" style={styles.wrong}>{ko ? "저장 실패 · 진행 기록은 앱에 남아 있습니다." : "Save failed. Progress is still in memory."}</Text>
          <PixelButton onPress={retrySave}>{ko ? "다시 저장" : "RETRY SAVE"}</PixelButton>
        </> : null}
      </View>
    </Screen>
  );
}
