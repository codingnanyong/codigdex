import React, { type Ref } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, type ImageSourcePropType } from "react-native";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import type { BattleAttempt, BattleState } from "@codigdex/game-core/domain/dex/battle";
import { normalizeQuizAnswer, type QuizAnswer } from "@codigdex/game-core/domain/dex/quiz";
import { localize, type Locale } from "@codigdex/game-core/i18n/locale";
import { PixelButton } from "../ui/PixelButton";
import { colors, font } from "../ui/theme";
import { battleMeters, expectedAnswer, keyboardAnswer, quizCopy } from "./battlePresentation";
import { PixelScene, type PixelScenery } from "../ui/PixelScene";

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
        <PixelScene backdrop scene={monster.quizPackId.startsWith("linux.") ? "linux" : monster.quizPackId.startsWith("git.") ? "git" : "tutorial"} />
        <Image accessibilityLabel={localize(monster.name, locale)} resizeMode="contain" source={monsterImage} style={styles.monsterImage} />
        <Text style={styles.specimenTitle}>LV.{monster.level}</Text>
        <Text style={[styles.caption, styles.specimenCaption]}>{localize(monster.classification, locale)}</Text>
      </View> : null}
      <ScrollView ref={props.scrollRef} style={styles.conversation} contentContainerStyle={[styles.conversationContent, keyboardVisible && styles.typingContent]}
        keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" onContentSizeChange={props.onContentSizeChange}>
        {compact && !keyboardVisible ? <View style={styles.compactStage}>
          <PixelScene backdrop scene={(monster.quizPackId.split(".")[0] === "linux" ? "linux" : monster.quizPackId.split(".")[0] === "git" ? "git" : "tutorial") as PixelScenery} />
          <Image accessibilityLabel={localize(monster.name, locale)} resizeMode="contain" source={monsterImage} style={styles.compactMonster} />
          <Text style={styles.stageLabel}>LV.{monster.level}</Text>
        </View> : null}
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
  kicker: { color: colors.cyan, fontFamily: font, fontSize: 15 },
  monsterName: { color: colors.text, fontFamily: font, fontSize: 15 },
  passLine: { color: colors.amber, fontFamily: font, fontSize: 15, lineHeight: 22, textAlign: "right", maxWidth: 130 },
  meters: { flexDirection: "row", gap: 12 },
  meter: { flex: 1, minWidth: 0, gap: 7, padding: 10, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 0 },
  meterCopy: { gap: 3 },
  meterLabel: { color: colors.text, fontFamily: font, fontSize: 15 },
  meterDetail: { color: colors.muted, fontFamily: font, fontSize: 15, lineHeight: 22 },
  meterTrack: { height: 7, overflow: "hidden", borderRadius: 0, backgroundColor: colors.background },
  meterFill: { height: "100%", backgroundColor: colors.amber },
  playerFill: { backgroundColor: colors.cyan },
  layout: { flex: 1, flexDirection: "row", gap: 14, minHeight: 0 },
  specimen: { width: 200, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 0, alignItems: "center", justifyContent: "center", gap: 10, padding: 14 },
  compactStage: { height: 112, borderWidth: 2, borderColor: colors.shadow, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  compactMonster: { width: 104, height: 104 },
  stageLabel: { position: "absolute", left: 6, bottom: 6, padding: 4, backgroundColor: colors.panel, color: colors.text, fontFamily: font, fontSize: 15 },
  monsterImage: { width: 148, height: 148 },
  specimenTitle: { color: colors.cyan, fontFamily: font, fontSize: 15, backgroundColor: colors.panel, padding: 6 },
  specimenCaption: { backgroundColor: colors.panel, padding: 6 },
  caption: { color: colors.muted, fontFamily: font, fontSize: 15, lineHeight: 22 },
  conversation: { flex: 1, minWidth: 0, backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: 0 },
  conversationContent: { padding: 14, gap: 12, paddingBottom: 24 },
  bubble: { padding: 14, borderWidth: 1, borderColor: colors.border, borderRadius: 0, gap: 8, maxWidth: "100%" },
  guideBubble: { alignSelf: "stretch", backgroundColor: colors.panelRaised, borderRadius: 0 },
  prompt: { color: colors.text, fontFamily: font, fontSize: 15, lineHeight: 24 },
  hintBubble: { backgroundColor: colors.background, borderColor: colors.amber, borderRadius: 0 },
  hintLabel: { color: colors.amber, fontFamily: font, fontSize: 15 },
  body: { color: colors.text, fontFamily: font, fontSize: 15, lineHeight: 22 },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  choice: { flexGrow: 1, flexBasis: "46%", minHeight: 54, backgroundColor: colors.panelRaised, borderWidth: 1, borderColor: colors.border, borderRadius: 0, flexDirection: "row", alignItems: "center", padding: 12, gap: 10 },
  fullChoice: { flexBasis: "100%" },
  pressed: { borderColor: colors.cyan, opacity: 0.8 },
  choiceKey: { color: colors.cyan, fontFamily: font, fontSize: 15 },
  choiceText: { flex: 1, color: colors.text, fontFamily: font, fontSize: 15, lineHeight: 22 },
  answerForm: { gap: 10 },
  inputLabel: { color: colors.muted, fontFamily: font, fontSize: 15 },
  input: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.cyan, borderRadius: 0, minHeight: 52, paddingHorizontal: 12, paddingVertical: 10, color: colors.text, fontFamily: font, fontSize: 15 },
  hintActions: { gap: 6 },
  playerBubble: { alignSelf: "flex-end", backgroundColor: colors.panelRaised, borderColor: colors.cyan, borderRadius: 0 },
  playerLabel: { color: colors.cyan, fontFamily: font, fontSize: 15 },
  feedbackBubble: { borderColor: colors.cyan, backgroundColor: colors.background, borderRadius: 0 },
  missedBubble: { borderColor: colors.danger },
  feedbackTitle: { color: colors.cyan, fontFamily: font, fontSize: 15 },
  missedText: { color: colors.danger },
  ready: { color: colors.amber, fontFamily: font, fontSize: 15, lineHeight: 22 },
});
