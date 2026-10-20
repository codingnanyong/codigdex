import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, useWindowDimensions, type ImageSourcePropType } from "react-native";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { createBattleState, revealBattleHint, submitBattleAnswer, type BattleState } from "@codigdex/game-core/domain/dex/battle";
import type { QuizAnswer } from "@codigdex/game-core/domain/dex/quiz";
import type { Locale } from "@codigdex/game-core/i18n/locale";
import { loadMixedQuizPack } from "@codigdex/quiz-content";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PixelButton } from "../ui/PixelButton";
import { Screen } from "../ui/Screen";
import { colors, font } from "../ui/theme";
import { battleQuestions } from "./battle";
import { compactBattle } from "./battlePresentation";
import { BattleView, type BattleFeedback } from "./BattleView";

interface Props {
  monster: MonsterDefinition;
  monsterImage: ImageSourcePropType;
  locale: Locale;
  onExit(): void;
  onFinish(battle: BattleState): void;
}

export function BattleScreen({ monster, monsterImage, locale, onExit, onFinish }: Props) {
  const [battle, setBattle] = useState<BattleState>();
  const [feedback, setFeedback] = useState<BattleFeedback>();
  const [draft, setDraft] = useState("");
  const [loadFailed, setLoadFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const current = useRef<BattleState | undefined>(undefined);
  const submitted = useRef<BattleFeedback | undefined>(undefined);
  const closed = useRef(false);
  const keyboardOpen = useRef(false);
  const scroll = useRef<ScrollView>(null);
  const scrollFrame = useRef<number | undefined>(undefined);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const ko = locale === "ko";

  function scrollToAnswer() {
    if (scrollFrame.current !== undefined) cancelAnimationFrame(scrollFrame.current);
    scrollFrame.current = requestAnimationFrame(() => { scroll.current?.scrollToEnd({ animated: true }); });
  }

  function exit() {
    if (closed.current) return;
    closed.current = true;
    Keyboard.dismiss();
    onExit();
  }

  useEffect(() => {
    let active = true;
    closed.current = false;
    void loadMixedQuizPack(monster.quizPackId).then((pack) => {
      if (!active || closed.current) return;
      const next = createBattleState(battleQuestions(monster, pack.questions));
      current.current = next;
      setBattle(next);
    }).catch(() => { if (active && !closed.current) setLoadFailed(true); });
    return () => { active = false; closed.current = true; };
  }, [monster.quizPackId, monster.level, retry]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => {
      keyboardOpen.current = true;
      setKeyboardVisible(true);
      scrollToAnswer();
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      keyboardOpen.current = false;
      setKeyboardVisible(false);
    });
    const back = BackHandler.addEventListener("hardwareBackPress", () => {
      if (keyboardOpen.current) Keyboard.dismiss();
      else exit();
      return true;
    });
    return () => {
      show.remove(); hide.remove(); back.remove();
      if (scrollFrame.current !== undefined) cancelAnimationFrame(scrollFrame.current);
    };
  }, [onExit]);

  function answer(questionIndex: number, value: QuizAnswer) {
    if (closed.current || submitted.current || !current.current) return;
    const next = submitBattleAnswer(current.current, questionIndex, value);
    if (next === current.current) return;
    const result = { nextBattle: next, attempt: next.attempts.at(-1)! };
    submitted.current = result;
    setFeedback(result);
    Keyboard.dismiss();
    scrollToAnswer();
  }

  function nextQuestion() {
    if (closed.current || !submitted.current) return;
    const next = submitted.current.nextBattle;
    submitted.current = undefined;
    if (next.status !== "active") {
      closed.current = true;
      onFinish(next);
      return;
    }
    current.current = next;
    setBattle(next);
    setFeedback(undefined);
    setDraft("");
    scroll.current?.scrollTo({ y: 0, animated: false });
  }

  if (loadFailed || !battle) return <Screen><View style={styles.loading}>
    {loadFailed ? <>
      <Text accessibilityRole="alert" style={styles.error}>{ko ? "문제를 불러오지 못했습니다." : "Could not load the quiz."}</Text>
      <PixelButton onPress={() => { setLoadFailed(false); setRetry((value) => value + 1); }}>{ko ? "다시 시도" : "RETRY"}</PixelButton>
      <PixelButton onPress={exit} variant="quiet">{ko ? "월드로" : "WORLD"}</PixelButton>
    </> : <><ActivityIndicator color={colors.cyan} /><Text style={styles.caption}>{ko ? "문제 불러오는 중" : "LOADING QUIZ"}</Text></>}
  </View></Screen>;

  return <Screen><KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={insets.top + 12}>
    <BattleView battle={battle} monster={monster} monsterImage={monsterImage} locale={locale}
      compact={compactBattle(width, height, keyboardVisible)} draft={draft} feedback={feedback} scrollRef={scroll}
      keyboardVisible={keyboardVisible} onKeyboardDismiss={() => Keyboard.dismiss()}
      onAnswer={answer} onNext={nextQuestion} onExit={exit} onInputFocus={scrollToAnswer}
      onContentSizeChange={() => { if (keyboardOpen.current || submitted.current) scrollToAnswer(); }}
      onDraftChange={(index, value) => { if (!closed.current && !submitted.current && index === current.current?.questionIndex) setDraft(value); }}
      onHint={(index) => {
        if (closed.current || submitted.current || !current.current) return;
        const next = revealBattleHint(current.current, index);
        current.current = next;
        setBattle(next);
      }} />
  </KeyboardAvoidingView></Screen>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: { alignItems: "center", justifyContent: "center", flex: 1, gap: 16 },
  error: { color: colors.danger, fontFamily: font, fontSize: 14, textAlign: "center" },
  caption: { color: colors.muted, fontFamily: font, fontSize: 12 },
});
