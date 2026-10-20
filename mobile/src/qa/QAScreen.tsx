import { CHAPTERS } from "@codigdex/game-content/domain/chapters";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { useEffect, useState } from "react";
import { Platform, Share, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSave } from "../state/SaveProvider";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { colors, font } from "../ui/theme";
import { QA_ENABLED, qaFaults } from "./runtime";

const checks = [
  "객관식 → 단답 · 빈 답안/연속 제출 차단",
  "한글/영문 IME · 키보드/뒤로가기 · 화면 회전",
  "힌트 1/2 · 오답 정답/해설 · 작은 화면",
  "Lv.1/Lv.5 · 60% 성공/실패 · 재도전",
  "포획 즉시 도감 · 중복 포획",
  "저장 실패/재시도 · 앱 종료/재시작 복원",
  "문제 로딩 실패/재시도 · 접근성 포커스",
] as const;

export function QAScreen({ onBack, onBattle, onDex, checked, onToggleCheck }: { onBack(): void; onBattle(monster: MonsterDefinition): void; onDex(): void; checked: readonly string[]; onToggleCheck(check: string): void }) {
  const { locale, setLocale, save, saveError, retrySave, clearProgress } = useSave();
  const dimensions = useWindowDimensions();
  const [frames, setFrames] = useState(0);
  const [notice, setNotice] = useState("");
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
    <PixelButton onPress={onBack} variant="quiet">메뉴</PixelButton>
    <Text accessibilityRole="header" style={styles.title}>SPRINT 04 · 기기 테스트</Text>
    <Text style={styles.body}>테스트 전용 저장 공간입니다. 일반 진행도와 분리됩니다. 체크 항목은 직접 확인한 뒤 선택하세요.</Text>
    <Text style={styles.info}>{Platform.OS} {String(Platform.Version)} · {Math.round(dimensions.width)}×{Math.round(dimensions.height)} · {locale} · 포획 {save.progress.captures.length}</Text>
    <Text style={styles.info}>이 화면의 JS 프레임 콜백: {frames}/s (기기 GPU FPS 측정값이 아님)</Text>
    <PixelButton onPress={() => onBattle(tutorial)}>튜토리얼 Lv.1 · 혼합 전투</PixelButton>
    <PixelButton onPress={() => onBattle({ ...tutorial, level: 5 })}>튜토리얼 Lv.5 · 7문항 전투</PixelButton>
    <PixelButton onPress={() => onBattle(CHAPTERS[1].stages[0])}>Git · 명령어 단답 전투</PixelButton>
    <PixelButton variant="secondary" onPress={onDex}>도감 · 포획/재시작 복원 확인</PixelButton>
    <PixelButton variant="secondary" onPress={() => setLocale(locale === "ko" ? "en" : "ko")}>언어 전환 · {locale === "ko" ? "English" : "한국어"}</PixelButton>
    <PixelButton variant="secondary" onPress={() => { qaFaults.failNextQuiz(); setNotice("다음 전투에서 로딩 실패 후 다시 시도를 확인하세요."); }}>다음 문제 로딩 1회 실패</PixelButton>
    <PixelButton variant="secondary" onPress={() => { qaFaults.failNextSave(); setLocale(locale === "ko" ? "en" : "ko"); setNotice("언어 저장 실패를 발생시켰습니다. 다시 저장한 뒤 재시작해 확인하세요."); }}>저장 실패 1회 발생</PixelButton>
    {notice ? <Text accessibilityLiveRegion="polite" style={styles.body}>{notice}</Text> : null}
    {saveError ? <><Text accessibilityRole="alert" style={styles.error}>저장 실패 · 메모리 진행도 유지 중</Text><PixelButton onPress={retrySave}>다시 저장</PixelButton></> : null}
    {checks.map((check) => <PixelButton key={check} accessibilityLabel={`${checked.includes(check) ? "확인 완료" : "미확인"}: ${check}`} variant={checked.includes(check) ? "primary" : "quiet"}
      onPress={() => onToggleCheck(check)}>{checked.includes(check) ? "✓ " : "□ "}{check}</PixelButton>)}
    <PixelButton variant="secondary" onPress={() => { void Share.share({ message: JSON.stringify({ sprint: "04", at: new Date().toISOString(), platform: Platform.OS, version: Platform.Version, dimensions, locale, captures: save.progress.captures, saveError, checked, remaining: checks.filter((check) => !checked.includes(check)) }, null, 2) }).catch(() => setNotice("공유를 완료하지 못했습니다. 체크 상태를 화면에서 확인하세요.")); }}>테스트 결과 복사/공유</PixelButton>
    <PixelButton variant="danger" onPress={clearProgress}>테스트 진행도만 초기화</PixelButton>
  </View></Screen>;
}

const styles = StyleSheet.create({
  content: { gap: 12, maxWidth: 720, width: "100%", alignSelf: "center", paddingBottom: 24 },
  title: { color: colors.cyan, fontFamily: font, fontSize: 20, fontWeight: "800" },
  body: { color: colors.text, fontFamily: font, fontSize: 13, lineHeight: 21 },
  info: { color: colors.muted, fontFamily: font, fontSize: 12, lineHeight: 18 },
  error: { color: colors.danger, fontFamily: font, fontSize: 13 },
});
