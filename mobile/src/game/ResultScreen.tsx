import { Image, Text, View, useWindowDimensions } from "react-native";
import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import { promotionMissionFor } from "@codigdex/game-content/domain/promotionChapters";
import { localize } from "@codigdex/game-core/i18n/locale";
import { mobileAssetSource } from "../assets";
import { PixelScene, type PixelScenery } from "../ui/PixelScene";
import { battlePercent } from "./battle";
import { playableCheckpoints, nextPlayableCheckpoint } from "./progression";
import { QA_ENABLED } from "../qa/runtime";
import type { BattleResult } from "./navigation";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { useSave } from "../state/SaveProvider";
import { styles } from "./gameScreenStyles";

export function ResultScreen({ onDex, onWorld, onRetry, onQA, onContinue, result }: { onDex(): void; onWorld(): void; onRetry(): void; onQA(): void; onContinue(): void; result: BattleResult }) {
  const { locale, saveError, retrySave, save } = useSave();
  const captured = new Set(save.progress.captures.map(({ id }) => id));
  const path = playableCheckpoints(save);
  const chapter = path.find(({ monster }) => monster.id === result.monster.id)?.chapter;
  const chapterComplete = !result.sourceEventId && result.newCapture && chapter?.stages.every(({ id }) => captured.has(id));
  const event = !!result.sourceEventId;
  const expedition = !event && chapter?.id.startsWith("open-source:");
  const allComplete = expedition && chapter ? chapter.stages.every(({ id }) => captured.has(id)) : path.filter(({ chapter }) => !chapter.id.startsWith("open-source:")).every(({ status }) => status === "cleared");
  const commonComplete = CHAPTERS.every(({ stages }) => stages.every(({ id }) => captured.has(id)));
  const next = nextPlayableCheckpoint(save);
  const { width, height } = useWindowDimensions();
  const narrow = width < 680 || height > width;
  const ko = locale === "ko";
  return (
    <Screen scroll>
      <View style={[styles.resultLayout, narrow && styles.verticalLayout]}>
        <View style={styles.resultStage}><PixelScene backdrop scene={event ? "field" : (promotionMissionFor(chapter?.id.replace(/^promotion:/, ""))?.scenery ?? (chapter?.id.startsWith("career:") ? "field" : chapter?.id ?? "field")) as PixelScenery} /><Image resizeMode="contain" source={mobileAssetSource(result.monster.assetKey)} style={styles.resultMonster} /></View>
        <View style={styles.resultCopy}>
          <Text testID="result-title" style={[styles.resultGrade, result.passed ? styles.correct : styles.wrong]}>{result.passed ? (ko ? "포획 성공" : "CAPTURED") : (ko ? "재도전" : "TRY AGAIN")}</Text>
          <Text style={styles.logo}>{battlePercent(result.correct, result.total)}%</Text>
          <Text style={styles.body}>{result.correct}/{result.total} · {localize(result.monster.name, locale)}</Text>
          <Text style={styles.muted}>{result.passed ? (result.newCapture ? (ko ? "코디덱스에 새 카드가 등록되었습니다." : "A new card was registered.") : (ko ? "이미 코디덱스에 등록된 카드입니다." : "This card is already in your Codigdex.")) : (ko ? "60% 이상 맞히면 포획할 수 있습니다." : "Score at least 60% to capture it.")}</Text>
          {chapterComplete ? <Text accessibilityLiveRegion="polite" style={styles.hint}>{!expedition && commonComplete && save.player.primaryJobId === "junior" ? (ko ? "공통 경로 완료! 1차 직업을 선택하세요." : "Common path complete! Choose a primary career.") : `${localize(chapter!.name, locale)} ${ko ? "지역 완료!" : "complete!"}`}</Text> : null}
        </View>
        <View style={styles.titleActions}>
          {saveError ? <>
            <Text accessibilityRole="alert" style={styles.wrong}>{ko ? "기기에 저장하지 못했습니다. 앱을 닫기 전에 다시 저장하세요." : "Could not save to this device. Retry before closing the app."}</Text>
            <PixelButton onPress={retrySave}>{ko ? "다시 저장" : "RETRY SAVE"}</PixelButton>
          </> : null}
          {result.passed && (event || !allComplete) ? <PixelButton testID="result-continue" onPress={onContinue}>{event ? (ko ? "직무 모험 계속" : "CONTINUE MY CAREER") : <>{ko ? "다음 체크포인트" : "NEXT CHECKPOINT"}{"\n"}{localize(next.chapter.name, locale)} · Lv.{next.monster.level}</>}</PixelButton> : null}
          <PixelButton testID="result-world" onPress={onWorld}>{event ? (ko ? "의뢰 확인 · 원래 직무로" : "REQUEST · RETURN TO MY CAREER") : (ko ? "월드맵으로" : "WORLD MAP")}</PixelButton>
          {!event || !result.passed ? <PixelButton testID="result-retry" onPress={onRetry} variant="secondary">{ko ? "다시 도전" : "RETRY BATTLE"}</PixelButton> : null}
          <PixelButton onPress={onDex} variant="secondary">{ko ? "도감 보기" : "OPEN DEX"}</PixelButton>
          {QA_ENABLED ? <PixelButton testID="result-qa" onPress={onQA} variant="quiet">QA · 기기 테스트</PixelButton> : null}
        </View>
      </View>
    </Screen>
  );
}
