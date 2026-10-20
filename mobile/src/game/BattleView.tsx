import React, { type Ref } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ImageSourcePropType } from "react-native";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import type { BattleAttempt, BattleState } from "@codigdex/game-core/domain/dex/battle";
import { normalizeQuizAnswer, type QuizAnswer } from "@codigdex/game-core/domain/dex/quiz";
import { localize, type Locale } from "@codigdex/game-core/i18n/locale";
import { PixelButton } from "../ui/PixelButton";
import { colors, font } from "../ui/theme";
import { battleMeters, expectedAnswer, keyboardAnswer, quizCopy } from "./battlePresentation";

export interface BattleFeedback { nextBattle: BattleState; attempt: BattleAttempt }

export interface BattleViewProps {
  battle: BattleState;
  monster: MonsterDefinition;
  monsterImage: ImageSourcePropType;
  locale: Locale;
  compact: boolean;
  keyboardVisible?: boolean;
  onKeyboardDismiss?(): void;
  draft: string;
  feedback?: BattleFeedback;
  scrollRef?: Ref<ScrollView>;
  onAnswer(questionIndex: number, answer: QuizAnswer): void;
  onDraftChange(questionIndex: number, value: string): void;
  onHint(questionIndex: number): void;
  onInputFocus(): void;
  onContentSizeChange(): void;
  onNext(): void;
  onExit(): void;
}

/** Presentational view: the shared reducer owns grading, hint order and the pass line. */
export function BattleView(props: BattleViewProps) {
  const { battle, compact, draft, feedback, locale, monster, monsterImage, keyboardVisible = false } = props;
  const ko = locale === "ko";
  const index = battle.questionIndex;
  const question = battle.questions[index];
  const settled = feedback?.nextBattle ?? battle;
  const meters = battleMeters(settled);
  const hints = question.hints ?? [];
  const hintCount = Math.min(2, hints.length);
  const locked = Boolean(feedback);
  const playerAnswer = feedback && (typeof feedback.attempt.answer === "number" && question.type !== "freeText"
    ? localize(question.choices[feedback.attempt.answer], locale) : String(feedback.attempt.answer));
  const finished = settled.status !== "active";

  return <View style={[styles.root, keyboardVisible && styles.typingRoot]}>
    <View style={styles.header}>
      <PixelButton accessibilityLabel={ko ? "배틀 나가기" : "Exit battle"} onPress={props.onExit} variant="quiet">×</PixelButton>
      <View style={styles.headerCopy}>
        <Text style={styles.kicker}>{ko ? "코드 배틀" : "CODE BATTLE"} · {index + 1}/{battle.questions.length}</Text>
        {!keyboardVisible ? <Text accessibilityRole="header" style={styles.monsterName}>{localize(monster.name, locale)}</Text> : null}
      </View>
      {keyboardVisible ? <PixelButton accessibilityLabel={ko ? "키보드 닫기" : "Hide keyboard"} variant="quiet" onPress={props.onKeyboardDismiss}>{ko ? "키보드 닫기" : "HIDE KEYBOARD"}</PixelButton> : <Text style={styles.passLine}>{ko ? "포획 기준 60%" : "CAPTURE AT 60%"}{"\n"}{ko ? `정답 ${settled.correctCount}/${meters.required}` : `${settled.correctCount}/${meters.required} correct`}</Text>}
    </View>

    {!keyboardVisible ? <View style={styles.meters}>
      <HealthMeter label={ko ? "몬스터 HP" : "Monster HP"} value={meters.monsterHealth}
        detail={meters.remainingCorrect === 0 ? (ko ? "포획 준비 완료" : "Ready to capture") : (ko ? `정답 ${meters.remainingCorrect}개 더 필요` : `${meters.remainingCorrect} more correct`)} />
      <HealthMeter label={ko ? "플레이어 HP" : "Player HP"} value={meters.playerHealth}
        detail={ko ? `남은 기회 ${meters.remainingLives}/${meters.maxLives}` : `${meters.remainingLives}/${meters.maxLives} lives left`} player />
    </View> : null}

    <View style={styles.layout}>
      {!compact ? <View style={styles.specimen}>
        <Image accessibilityLabel={localize(monster.name, locale)} resizeMode="contain" source={monsterImage} style={styles.monsterImage} />
        <Text style={styles.specimenTitle}>LV.{monster.level}</Text>
        <Text style={styles.caption}>{localize(monster.classification, locale)}</Text>
      </View> : null}
      <ScrollView ref={props.scrollRef} style={styles.conversation} contentContainerStyle={[styles.conversationContent, keyboardVisible && styles.typingContent]}
        keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" onContentSizeChange={props.onContentSizeChange}>
        <View style={[styles.bubble, styles.guideBubble]}>
          <Text style={styles.kicker}>{question.type === "freeText" ? (ko ? "단답형" : "TYPE AN ANSWER") : (ko ? "객관식" : "CHOOSE AN ANSWER")}</Text>
          <Text style={styles.prompt}>{quizCopy(localize(question.prompt, locale))}</Text>
        </View>

        {hints.slice(0, battle.hintsUsed).map((hint, hintIndex) => <View key={`${index}-hint-${hintIndex}`} style={[styles.bubble, styles.hintBubble]}>
          <Text style={styles.hintLabel}>{ko ? "힌트" : "HINT"} {hintIndex + 1}/{hintCount}</Text>
          <Text accessibilityLiveRegion="polite" style={styles.body}>{quizCopy(localize(hint, locale))}</Text>
        </View>)}

        {!locked && question.type !== "freeText" ? <View style={styles.choices}>
          {question.choices.map((choice, choiceIndex) => <Pressable key={`${index}-${choiceIndex}`} accessibilityRole="button"
            accessibilityLabel={`${String.fromCharCode(65 + choiceIndex)}. ${localize(choice, locale)}`}
            onPress={() => props.onAnswer(index, choiceIndex)}
            style={({ pressed }) => [styles.choice, compact && styles.fullChoice, pressed && styles.pressed]}>
            <Text style={styles.choiceKey}>{String.fromCharCode(65 + choiceIndex)}</Text>
            <Text style={styles.choiceText}>{quizCopy(localize(choice, locale))}</Text>
          </Pressable>)}
        </View> : null}

        {!locked && question.type === "freeText" ? <View style={[styles.answerForm, keyboardVisible && styles.typingForm]}>
          {!keyboardVisible ? <Text style={styles.inputLabel}>{ko ? "나의 답변" : "YOUR ANSWER"}</Text> : null}
          <TextInput key={index} accessibilityLabel={ko ? "단답 답안" : "Short answer"} value={draft}
            onChangeText={(value) => props.onDraftChange(index, value)} onFocus={props.onInputFocus}
            onSubmitEditing={(event) => { const answer = keyboardAnswer(event); if (answer !== undefined) props.onAnswer(index, answer); }}
            autoCorrect={false} autoCapitalize="none" spellCheck={false} returnKeyType="send" submitBehavior="submit"
            placeholder={ko ? "명령어 또는 키워드를 입력하세요" : "Enter a command or keyword"}
            placeholderTextColor={colors.muted} style={[styles.input, keyboardVisible && styles.typingInput]} />
          <PixelButton accessibilityLabel={ko ? "답안 제출" : "Submit answer"} disabled={!normalizeQuizAnswer(draft)} onPress={() => props.onAnswer(index, draft)}>
            {keyboardVisible ? (ko ? "보내기" : "SEND") : (ko ? "답변 보내기" : "SEND ANSWER")}
          </PixelButton>
        </View> : null}

        {!locked && !keyboardVisible && hintCount > 0 ? <View style={styles.hintActions}>
          <PixelButton variant="secondary" accessibilityLabel={ko ? `다음 힌트, ${battle.hintsUsed}/${hintCount} 사용` : `Next hint, ${battle.hintsUsed}/${hintCount} used`}
            disabled={battle.hintsUsed >= hintCount} onPress={() => props.onHint(index)}>
            {ko ? `힌트 보기 ${battle.hintsUsed}/${hintCount}` : `HINT ${battle.hintsUsed}/${hintCount}`}
          </PixelButton>
          <Text style={styles.caption}>{ko ? "힌트를 써도 포획 정답으로 인정돼요." : "Answers with hints still count toward capture."}</Text>
        </View> : null}

        {feedback ? <>
          <View style={[styles.bubble, styles.playerBubble]}><Text style={styles.playerLabel}>{ko ? "나의 답변" : "YOUR ANSWER"}</Text><Text style={styles.body}>{playerAnswer}</Text></View>
          <View accessibilityLiveRegion="polite" style={[styles.bubble, styles.feedbackBubble, !feedback.attempt.correct && styles.missedBubble]}>
            <Text style={[styles.feedbackTitle, !feedback.attempt.correct && styles.missedText]}>{feedback.attempt.correct ? (ko ? "정답이에요!" : "CORRECT!") : (ko ? "다시 살펴봐요" : "LET’S REVIEW")}</Text>
            <Text selectable style={styles.body}>{ko ? "정답: " : "Answer: "}{expectedAnswer(question, locale)}</Text>
            {question.explanation ? <Text style={styles.body}>{quizCopy(localize(question.explanation, locale))}</Text> : null}
            {feedback.attempt.correct && hintCount > 0 ? <Text style={styles.caption}>{ko ? `힌트 ${feedback.attempt.hintsUsed}회 · 공격 위력 ${feedback.attempt.damage}%` : `${feedback.attempt.hintsUsed} hints · attack strength ${feedback.attempt.damage}%`}</Text> : null}
            {settled.status === "passed" ? <Text style={styles.ready}>{ko ? "포획 준비 완료! 결과를 확인하세요." : "Ready to capture! Check your result."}</Text> : null}
          </View>
          <PixelButton accessibilityLabel={finished ? (ko ? "배틀 결과 확인" : "View battle result") : (ko ? "다음 문제" : "Next question")} onPress={props.onNext}>
            {finished ? (ko ? "결과 확인" : "VIEW RESULT") : (ko ? "다음 문제" : "NEXT QUESTION")}
          </PixelButton>
        </> : null}
      </ScrollView>
    </View>
  </View>;
}

function HealthMeter({ label, value, detail, player = false }: { label: string; value: number; detail: string; player?: boolean }) {
  return <View style={styles.meter}>
    <View style={styles.meterCopy}><Text style={styles.meterLabel}>{label}</Text><Text style={styles.meterDetail}>{detail}</Text></View>
    <View accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100), text: detail }} style={styles.meterTrack}>
      <View style={[styles.meterFill, player && styles.playerFill, { width: `${value * 100}%` }]} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, gap: 12, minWidth: 0 },
  typingRoot: { gap: 6 },
  typingContent: { padding: 6, paddingBottom: 6 },
  typingForm: { flexDirection: "row", alignItems: "center" },
  typingInput: { flex: 1, minWidth: 0 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 48 },
  headerCopy: { flex: 1, gap: 3, minWidth: 0 },
  kicker: { color: colors.cyan, fontFamily: font, fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  monsterName: { color: colors.text, fontFamily: font, fontSize: 15, fontWeight: "800" },
  passLine: { color: colors.amber, fontFamily: font, fontSize: 10, lineHeight: 16, textAlign: "right", maxWidth: 130 },
  meters: { flexDirection: "row", gap: 12 },
  meter: { flex: 1, minWidth: 0, gap: 7, padding: 10, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 8 },
  meterCopy: { gap: 3 },
  meterLabel: { color: colors.text, fontFamily: font, fontSize: 11, fontWeight: "700" },
  meterDetail: { color: colors.muted, fontFamily: font, fontSize: 10, lineHeight: 14 },
  meterTrack: { height: 7, overflow: "hidden", borderRadius: 2, backgroundColor: colors.background },
  meterFill: { height: "100%", backgroundColor: colors.amber },
  playerFill: { backgroundColor: colors.cyan },
  layout: { flex: 1, flexDirection: "row", gap: 14, minHeight: 0 },
  specimen: { width: 200, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 10, padding: 14 },
  monsterImage: { width: 148, height: 148 },
  specimenTitle: { color: colors.cyan, fontFamily: font, fontSize: 16, fontWeight: "800" },
  caption: { color: colors.muted, fontFamily: font, fontSize: 11, lineHeight: 17 },
  conversation: { flex: 1, minWidth: 0, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  conversationContent: { padding: 14, gap: 12, paddingBottom: 24 },
  bubble: { padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 10, gap: 8, maxWidth: "100%" },
  guideBubble: { alignSelf: "stretch", backgroundColor: colors.panelRaised, borderTopLeftRadius: 2 },
  prompt: { color: colors.text, fontFamily: font, fontSize: 16, lineHeight: 24, fontWeight: "700" },
  hintBubble: { backgroundColor: colors.background, borderColor: colors.amber, borderTopLeftRadius: 2 },
  hintLabel: { color: colors.amber, fontFamily: font, fontSize: 11, fontWeight: "700" },
  body: { color: colors.text, fontFamily: font, fontSize: 14, lineHeight: 22 },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  choice: { flexGrow: 1, flexBasis: "46%", minHeight: 54, backgroundColor: colors.panelRaised, borderWidth: 1, borderColor: colors.border, borderRadius: 8, flexDirection: "row", alignItems: "center", padding: 12, gap: 10 },
  fullChoice: { flexBasis: "100%" },
  pressed: { borderColor: colors.cyan, opacity: 0.8 },
  choiceKey: { color: colors.cyan, fontFamily: font, fontSize: 14, fontWeight: "800" },
  choiceText: { flex: 1, color: colors.text, fontFamily: font, fontSize: 14, lineHeight: 21 },
  answerForm: { gap: 10 },
  inputLabel: { color: colors.muted, fontFamily: font, fontSize: 11, fontWeight: "700" },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.cyan, borderRadius: 8, minHeight: 52, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, fontFamily: font, fontSize: 16 },
  hintActions: { gap: 6 },
  playerBubble: { alignSelf: "flex-end", backgroundColor: colors.panelRaised, borderColor: colors.cyan, borderTopRightRadius: 2 },
  playerLabel: { color: colors.cyan, fontFamily: font, fontSize: 10, fontWeight: "700" },
  feedbackBubble: { borderColor: colors.cyan, backgroundColor: colors.background, borderTopLeftRadius: 2 },
  missedBubble: { borderColor: colors.danger },
  feedbackTitle: { color: colors.cyan, fontFamily: font, fontSize: 15, fontWeight: "800" },
  missedText: { color: colors.danger },
  ready: { color: colors.amber, fontFamily: font, fontSize: 14, lineHeight: 21, fontWeight: "700" },
});
