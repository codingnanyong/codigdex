import { useSave } from "../state/SaveProvider";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { Text } from "react-native";
import { colors } from "../ui/theme";
import { WorldMapView, type WorldMapViewProps } from "./WorldMapView";

export function WorldMapScreen(props: Omit<WorldMapViewProps, "captured" | "locale">) {
  const { locale, save, saveError, retrySave } = useSave();
  return <Screen>
    {saveError ? <><Text accessibilityRole="alert" style={{ color: colors.danger }}>{locale === "ko" ? "체크포인트 저장 실패 · 종료 전 다시 저장하세요." : "Checkpoint save failed. Retry before closing."}</Text><PixelButton compact onPress={retrySave}>{locale === "ko" ? "다시 저장" : "RETRY SAVE"}</PixelButton></> : null}
    <WorldMapView {...props} locale={locale} captured={new Set(save.progress.captures.map(({ id }) => id))} />
  </Screen>;
}
