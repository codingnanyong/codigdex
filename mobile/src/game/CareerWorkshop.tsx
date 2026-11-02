import { useEffect, useRef, useState } from "react";
import { Linking, StyleSheet, Text, View } from "react-native";
import { findStage } from "@codigdex/game-content/domain/chapters";
import { masterLessonFor } from "@codigdex/game-content/domain/masterChapters";
import { PROMOTION_WORKSHOPS, WORKSHOP_PHASES } from "@codigdex/game-content/domain/promotionWorkshops";
import { promotionChapterFor } from "@codigdex/game-content/domain/promotionChapters";
import { nextWorkshopPhase } from "@codigdex/game-content/domain/gameProgress";
import type { SecondaryJobId } from "@codigdex/game-content/domain/player/jobs";
import { createBattleState, submitBattleAnswer, type BattleState } from "@codigdex/game-core/domain/dex/battle";
import { loadQuizPack } from "@codigdex/quiz-content/loader";
import { useSave } from "../state/SaveProvider";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { colors, font, pixelPanel } from "../ui/theme";

export function CareerWorkshop({ jobId, stageId, onBack, onBattle }: { jobId: string; stageId: string; onBack(): void; onBattle(id: string): void }) {
  const { save, locale, saveError, retrySave, selectCheckpoint } = useSave();
  useEffect(() => { selectCheckpoint(stageId); }, [stageId, selectCheckpoint]);
  const master = masterLessonFor(stageId);
  const index = promotionChapterFor(jobId)?.stages.findIndex(({ id }) => id === stageId) ?? -1;
  const lesson = master ?? PROMOTION_WORKSHOPS[jobId as SecondaryJobId]?.[index];
  const monster = findStage(stageId).monster;
  const ko = locale === "ko";
  const phase = nextWorkshopPhase(save, stageId);
  if (!lesson) return null;
  return <Screen scroll>
    <PixelButton onPress={onBack} variant="quiet">← {ko ? "의뢰 지도로" : "MISSION MAP"}</PixelButton>
    <Text accessibilityRole="header" style={styles.title}>{monster.classification[locale]}</Text>
    <Text style={styles.body}>{monster.briefing[locale]}</Text>
    <Text selectable style={styles.example}>{lesson.example}</Text>
    <Text style={styles.body}>{"reasoning" in lesson ? lesson.reasoning[locale] : lesson.explanation[locale]}</Text>
    <PixelButton variant="quiet" onPress={() => { void Linking.openURL(lesson.source); }}>{ko ? "공식 참고 자료 ↗" : "OFFICIAL REFERENCE ↗"}</PixelButton>
    {saveError ? <><Text accessibilityRole="alert" style={styles.body}>{ko ? "저장하지 못했습니다. 종료 전에 다시 저장하세요." : "Could not save. Retry before closing."}</Text><PixelButton onPress={retrySave}>{ko ? "다시 저장" : "RETRY SAVE"}</PixelButton></> : null}
    {master || phase === 4 ? <PixelButton testID="workshop-start-battle" onPress={() => onBattle(stageId)}>{master ? (ko ? "설계 검증 배틀 시작" : "START DESIGN VERIFICATION") : (ko ? "수호 생물 배틀 시작" : "START GUARDIAN BATTLE")}</PixelButton>
      : <Practice key={`${stageId}:${phase}`} stageId={stageId} phase={phase} reasoning={"reasoning" in lesson ? lesson.reasoning[locale] : lesson.explanation[locale]} />}
  </Screen>;
}

function Practice({ stageId, phase, reasoning }: { stageId: string; phase: number; reasoning: string }) {
  const { locale, completePractice } = useSave();
  const [battle, setBattle] = useState<BattleState>();
  const [feedback, setFeedback] = useState<string>();
  const [pending, setPending] = useState<BattleState>();
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const locked = useRef(false);
  const ko = locale === "ko";
  useEffect(() => {
    let active = true;
    void loadQuizPack(findStage(stageId).monster.quizPackId).then((pack) => {
      if (active) setBattle(createBattleState(pack.questions.slice(phase * 5, phase * 5 + 5)));
    }, () => { if (active) setError(true); });
    return () => { active = false; };
  }, [stageId, phase, attempt]);
  if (error) return <><Text accessibilityRole="alert" style={styles.body}>{ko ? "실습을 불러오지 못했습니다." : "Could not load practice."}</Text><PixelButton onPress={() => { setError(false); setAttempt((n) => n + 1); }}>{ko ? "다시 시도" : "RETRY"}</PixelButton></>;
  if (!battle) return <Text style={styles.body}>{ko ? "학습 자료를 불러오는 중…" : "Loading learning material…"}</Text>;
  const question = battle.questions[battle.questionIndex];
  return <View style={styles.panel}>
    <Text style={styles.title}>{phase + 1}/4 · {WORKSHOP_PHASES[phase][locale]}</Text>
    <Text style={styles.body}>{ko ? "5문항 중 3문항을 맞히면 실습이 저장됩니다." : "Answer 3 of 5 correctly to save this checkpoint."}</Text>
    {battle.status === "active" && question.type !== "freeText" ? <>
      <Text accessibilityRole="header" style={styles.body}>{question.prompt[locale]}</Text>
      {question.choices.map((choice, answer) => <PixelButton key={answer} testID={`workshop-answer-${answer}`} disabled={!!feedback} onPress={() => {
        if (locked.current) return;
        locked.current = true;
        setPending(submitBattleAnswer(battle, battle.questionIndex, answer));
        setFeedback(`${answer === question.answerIndex ? (ko ? "정답" : "CORRECT") : (ko ? "다시 살펴보세요" : "REVIEW THIS")}: ${question.choices[question.answerIndex][locale]}\n${question.explanation?.[locale] ?? reasoning}`);
      }}>{choice[locale]}</PixelButton>)}
    </> : null}
    {feedback && pending ? <><Text accessibilityRole="alert" style={styles.body}>{feedback}</Text><PixelButton testID="workshop-next" onPress={() => {
      setBattle(pending); setPending(undefined); setFeedback(undefined); locked.current = false;
      if (pending.status === "passed") completePractice(stageId, phase, pending);
    }}>{ko ? "확인 · 다음" : "CONTINUE"}</PixelButton></> : null}
    {battle.status === "failed" ? <><Text style={styles.body}>{ko ? "예제를 다시 읽고 재도전하세요." : "Revisit the example and retry."}</Text><PixelButton onPress={() => { setBattle(createBattleState(battle.questions)); locked.current = false; }}>{ko ? "이 실습 다시 도전" : "RETRY PRACTICE"}</PixelButton></> : null}
  </View>;
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontFamily: font, fontSize: 20, marginVertical: 12 },
  body: { color: colors.text, fontFamily: font, fontSize: 15, lineHeight: 24, marginVertical: 8 },
  example: { ...pixelPanel, color: colors.text, fontFamily: font, fontSize: 14, lineHeight: 23, padding: 14 },
  panel: { ...pixelPanel, padding: 14, gap: 12, marginVertical: 12 },
});
