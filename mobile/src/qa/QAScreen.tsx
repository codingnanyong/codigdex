import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform, Share, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSave } from "../state/SaveProvider";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { colors, font } from "../ui/theme";
import { E2E_ENABLED, E2E_REVISION, QA_ENABLED, qaFaults } from "./runtime";
import { createEmptySave } from "@codigdex/game-core/save/schema";
import { gameQAPresets, type GameQAPreset } from "@codigdex/game-content/domain/qaPresets";

const checks = [
  "객관식 → 단답 · 빈 답안/연속 제출 차단",
  "한글/영문 IME · 키보드/뒤로가기 · 화면 회전",
  "힌트 1/2 · 오답 정답/해설 · 작은 화면",
  "Lv.1/Lv.5 · 60% 성공/실패 · 재도전",
  "포획 즉시 도감 · 중복 포획",
  "저장 실패/재시도 · 앱 종료/재시작 복원",
  "문제 로딩 실패/재시도 · 접근성 포커스",
  "월드맵 · 지역 잠금 · Lv.1~5 선택 · 전투 후 지도 복귀",
  "튜토리얼 → Git → Linux · 챕터 완료 · 다음 체크포인트",
  "체크포인트 선택 → 앱 종료 → 이어하기 · 초기화 확인",
  "오픈소스 9개 탐험 · 38종 · 전투/포획/재접속",
  "2차 전직 5개 경로 · 다섯 의뢰 · MASTER",
] as const;

export function QAScreen({ onBack, onBattle, onDex, onWorld, checked, onToggleCheck }: { onBack(): void; onBattle(monster: MonsterDefinition): void; onDex(): void; onWorld(): void; checked: readonly string[]; onToggleCheck(check: string): void }) {
  const { locale, setLocale, save, saveError, saving, retrySave, clearProgress, loadQAProgress, replaceSave } = useSave();
  const dimensions = useWindowDimensions();
  const [frames, setFrames] = useState(0);
  const [notice, setNotice] = useState("");
  const applyingPreset = useRef(false);
  const presets = useMemo(() => QA_ENABLED ? gameQAPresets(locale) : [], [locale]);
  const applyPreset = async (preset: GameQAPreset) => {
    if (!QA_ENABLED || applyingPreset.current) return;
    applyingPreset.current = true;
    try {
      await replaceSave(preset.save);
      if (preset.id === "dex") onDex(); else onBack();
    } catch { setNotice("테스트 시작점을 저장하지 못했습니다. 다시 저장한 뒤 시도하세요."); }
    finally { applyingPreset.current = false; }
  };
  useEffect(() => {
    if (!QA_ENABLED) return;
    let count = 0;
    let start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      count++;
      if (now - start >= 1000) { setFrames(Math.round(count * 1000 / (now - start))); count = 0; start = now; }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  if (!QA_ENABLED) return null;
  const tutorial = CHAPTERS[0].stages[0];
  return <Screen scroll><View style={styles.content}>
    <PixelButton testID="qa-menu" onPress={onBack} variant="quiet">메뉴</PixelButton>
    {E2E_ENABLED ? <>
      <Text testID="qa-automation" style={styles.info}>{E2E_REVISION}</Text>
      <PixelButton testID="qa-reset" onPress={() => { qaFaults.reset(); void replaceSave(createEmptySave("en")).catch(() => setNotice("QA reset could not be saved.")); }}>자동 테스트 초기화 · English</PixelButton>
    </> : null}
    <Text testID="qa-save-status" style={styles.info}>{saving ? "SAVING" : saveError ? "SAVE_FAILED" : "SAVED"}</Text>
    <Text testID="qa-captures" style={styles.info}>{save.progress.captures.length}</Text>
    <Text testID="qa-checkpoint" style={styles.info}>{save.ui.checkpointId ?? "none"}</Text>
    <Text testID="qa-locale" style={styles.info}>{locale}</Text>
    <Text testID="qa-career" style={styles.info}>{save.player.primaryJobId}</Text>
    <Text accessibilityRole="header" style={styles.title}>CODIGDEX · 모바일 QA</Text>
    <Text style={styles.body}>테스트 전용 저장 공간입니다. 일반 진행도와 분리됩니다. 체크 항목은 직접 확인한 뒤 선택하세요.</Text>
    <Text style={styles.info}>{Platform.OS} {String(Platform.Version)} · {Math.round(dimensions.width)}×{Math.round(dimensions.height)} · {locale} · 포획 {save.progress.captures.length}</Text>
    <Text style={styles.info}>이 화면의 JS 프레임 콜백: {frames}/s (기기 GPU FPS 측정값이 아님)</Text>
    <PixelButton testID="qa-tutorial" onPress={() => onBattle(tutorial)}>튜토리얼 Lv.1 · 혼합 전투</PixelButton>
    <PixelButton testID="qa-level5" onPress={() => onBattle({ ...tutorial, level: 5 })}>튜토리얼 Lv.5 · 7문항 전투</PixelButton>
    <PixelButton testID="qa-git" onPress={() => onBattle(CHAPTERS[1].stages[0])}>Git · 명령어 단답 전투</PixelButton>
    <PixelButton testID="qa-world" variant="secondary" onPress={onWorld}>월드맵 · 지역/체크포인트 테스트</PixelButton>
    <Text style={styles.body}>아래 프리셋은 테스트 진행도와 체크포인트를 교체합니다. 적용 후 월드맵을 열거나 앱을 재시작해 이어하기를 확인하세요.</Text>
    <PixelButton testID="qa-preset-tutorial" variant="quiet" onPress={() => { loadQAProgress("tutorial"); setNotice("튜토리얼 완료 · Git Lv.1에서 이어하기를 확인하세요."); }}>QA 진행도 · 튜토리얼 완료</PixelButton>
    <PixelButton testID="qa-preset-git" variant="quiet" onPress={() => { loadQAProgress("git"); setNotice("Git 완료 · Linux Lv.1에서 이어하기를 확인하세요."); }}>QA 진행도 · Git 완료</PixelButton>
    <PixelButton testID="qa-preset-complete" variant="quiet" onPress={() => { loadQAProgress("complete"); setNotice("공통 경로 완료 · 11개 체크포인트 재도전을 확인하세요."); }}>QA 진행도 · 공통 경로 완료</PixelButton>
    <Text accessibilityRole="header" style={styles.title}>챕터 바로 테스트</Text>
    <Text style={styles.body}>시작점을 고르면 QA 진행도가 바뀝니다. 메뉴에서 이어하기를 누르면 선택한 챕터가 열립니다. 먼저 바람새의 시간표(Airflow)를 확인해 보세요.</Text>
    {presets.map((preset) => <PixelButton key={preset.id} testID={`qa-start-${preset.id}`} disabled={saving} variant="secondary" onPress={() => { void applyPreset(preset); }}>{preset.group} · {preset.title}</PixelButton>)}
    <PixelButton variant="secondary" onPress={onDex}>도감 · 포획/재시작 복원 확인</PixelButton>
    <PixelButton testID="qa-language" variant="secondary" onPress={() => setLocale(locale === "ko" ? "en" : "ko")}>언어 전환 · {locale === "ko" ? "English" : "한국어"}</PixelButton>
    <PixelButton testID="qa-fail-quiz" variant="secondary" onPress={() => { qaFaults.failNextQuiz(); setNotice("다음 전투에서 로딩 실패 후 다시 시도를 확인하세요."); }}>다음 문제 로딩 1회 실패</PixelButton>
    <PixelButton testID="qa-fail-save" variant="secondary" onPress={() => { qaFaults.failNextSave(); setLocale(locale === "ko" ? "en" : "ko"); setNotice("언어 저장 실패를 발생시켰습니다. 다시 저장한 뒤 재시작해 확인하세요."); }}>저장 실패 1회 발생</PixelButton>
    {notice ? <Text accessibilityLiveRegion="polite" style={styles.body}>{notice}</Text> : null}
    {saveError ? <><Text accessibilityRole="alert" style={styles.error}>저장 실패 · 메모리 진행도 유지 중</Text><PixelButton testID="qa-retry-save" onPress={retrySave}>다시 저장</PixelButton></> : null}
    {checks.map((check) => <PixelButton key={check} accessibilityLabel={`${checked.includes(check) ? "확인 완료" : "미확인"}: ${check}`} variant={checked.includes(check) ? "primary" : "quiet"}
      onPress={() => onToggleCheck(check)}>{checked.includes(check) ? "✓ " : "□ "}{check}</PixelButton>)}
    <PixelButton variant="secondary" onPress={() => { void Share.share({ message: JSON.stringify({ sprint: "04/05", at: new Date().toISOString(), platform: Platform.OS, version: Platform.Version, dimensions, locale, captures: save.progress.captures, checkpointId: save.ui.checkpointId, saveError, checked, remaining: checks.filter((check) => !checked.includes(check)) }, null, 2) }).catch(() => setNotice("공유를 완료하지 못했습니다. 체크 상태를 화면에서 확인하세요.")); }}>테스트 결과 복사/공유</PixelButton>
    <PixelButton variant="danger" onPress={() => Alert.alert("테스트 진행도를 초기화할까요?", "QA 저장 공간의 포획 기록과 체크포인트가 초기화됩니다.", [{ text: "취소", style: "cancel" }, { text: "초기화", style: "destructive", onPress: () => { clearProgress(); setNotice("테스트 진행도를 초기화했습니다. 메뉴에서 게임 시작 상태를 확인하세요."); } }])}>테스트 진행도만 초기화</PixelButton>
  </View></Screen>;
}

const styles = StyleSheet.create({
  content: { gap: 12, maxWidth: 720, width: "100%", alignSelf: "center", paddingBottom: 24 },
  title: { color: colors.cyan, fontFamily: font, fontSize: 30 },
  body: { color: colors.text, fontFamily: font, fontSize: 15, lineHeight: 22 },
  info: { color: colors.muted, fontFamily: font, fontSize: 15, lineHeight: 22 },
  error: { color: colors.danger, fontFamily: font, fontSize: 15 },
});
