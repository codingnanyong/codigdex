import { Text, View, useWindowDimensions } from "react-native";
import { localize } from "@codigdex/game-core/i18n/locale";
import { resumeCheckpoint } from "./progression";
import { PixelScene } from "../ui/PixelScene";
import { QA_ENABLED } from "../qa/runtime";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { useSave } from "../state/SaveProvider";
import { styles } from "./gameScreenStyles";

export function TitleScreen({ onDex, onPlay, onSettings, onQA, onCareer, onOpenSources }: { onDex(): void; onPlay(): void; onSettings(): void; onQA(): void; onCareer(): void; onOpenSources(): void }) {
  const { locale, save, saveError, retrySave } = useSave();
  const resume = resumeCheckpoint(save);
  const continuing = save.progress.captures.length > 0 || !!save.ui.checkpointId;
  const { width, height } = useWindowDimensions();
  const narrow = width < 680 || height > width;
  const ko = locale === "ko";
  return (
    <Screen scroll>
      <View style={[styles.titleLayout, narrow && styles.verticalLayout]}>
        <View style={styles.titleArt}><PixelScene scene="field" height={180} /><View style={styles.artLabel}><Text style={styles.kicker}>FIELD GUIDE · 01</Text></View></View>
        <View style={styles.titleCopy}>
          <Text style={styles.kicker}>A PIXEL CODING ADVENTURE</Text>
          <Text testID="home-title" accessibilityRole="header" style={styles.logo}>CODIGDEX</Text>
          <Text style={styles.subtitle}>{ko ? "코드로 버그를 잡고 지식을 수집하세요" : "Catch bugs with code and collect knowledge"}</Text>
          <Text style={styles.muted}>{ko ? `나의 필드 가이드 · 포획 ${save.progress.captures.length}마리` : `MY FIELD GUIDE · ${save.progress.captures.length} CAPTURED`}</Text>
        </View>
        <View style={styles.titleActions}>
          <PixelButton testID="home-play" onPress={onPlay}>{continuing ? (ko ? "이어하기" : "CONTINUE") : (ko ? "게임 시작" : "PLAY")}</PixelButton>
          <Text testID="home-checkpoint" style={styles.hint}>{localize(resume.chapter.name, locale)} · Lv.{resume.monster.level}{"\n"}{localize(resume.monster.name, locale)}</Text>
          {saveError ? <><Text accessibilityRole="alert" style={styles.wrong}>{ko ? "저장 실패 · 종료 전 다시 저장하세요." : "Save failed. Retry before closing."}</Text><PixelButton onPress={retrySave}>{ko ? "다시 저장" : "RETRY SAVE"}</PixelButton></> : null}
          <PixelButton onPress={onDex} variant="secondary">{ko ? "코디덱스" : "CODIGDEX"}</PixelButton>
          <PixelButton testID="home-careers" onPress={onCareer} variant="secondary">{ko ? "전직 · 직업 경로" : "CAREERS · PATHS"}</PixelButton>
          <PixelButton testID="home-open-source" onPress={onOpenSources} variant="secondary">{ko ? "오픈소스 노트" : "OPEN-SOURCE NOTES"}</PixelButton>
          <PixelButton compact onPress={onSettings} variant="quiet">{ko ? "설정" : "SETTINGS"}</PixelButton>
          {QA_ENABLED ? <PixelButton testID="home-qa" onPress={onQA} variant="secondary">QA · 기기 테스트</PixelButton> : null}
        </View>
      </View>
    </Screen>
  );
}
