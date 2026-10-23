import { CHAPTERS, DEX_MONSTERS, findStage, isCommonPathComplete } from "@codigdex/game-content/domain/chapters";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { localize } from "@codigdex/game-core/i18n/locale";
import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { mobileAssetSource } from "@/assets";
import { useSave } from "@/state/SaveProvider";
import { PixelButton } from "@/ui/PixelButton";
import { Screen } from "@/ui/Screen";
import { colors, font, pixelPanel } from "@/ui/theme";
import { PixelScene, type PixelScenery } from "../ui/PixelScene";
import { battlePercent } from "./battle";
import { BattleScreen } from "./BattleScreen";
import { WorldMapScreen } from "./WorldMapScreen";
import { canEnterBattle, playableCheckpoints, nextPlayableCheckpoint, resumeCheckpoint } from "./progression";
import { CareerScreen } from "./CareerScreen";
import { QAScreen } from "../qa/QAScreen";
import { QA_ENABLED } from "../qa/runtime";
import { AccountPanel } from "../account/AccountPanel";

type Route = "title" | "world" | "career" | "battle" | "result" | "dex" | "detail" | "settings" | "qa";

interface BattleResult { correct: number; monster: MonsterDefinition; total: number; passed: boolean }

export function NativeGame() {
  const { capture, hydrated, locale, loadError, retryLoad, save, selectCheckpoint } = useSave();
  const [route, setRoute] = useState<Route>("title");
  const [monster, setMonster] = useState<MonsterDefinition>(() => CHAPTERS[0].stages[0]);
  const [result, setResult] = useState<BattleResult>();
  const [qaChecks, setQaChecks] = useState<string[]>([]);
  const [worldStageId, setWorldStageId] = useState<string>();

  if (!hydrated) {
    if (loadError) return <Screen><View style={styles.loading}><Text accessibilityRole="alert" style={styles.wrong}>저장 데이터를 읽지 못했습니다. / Could not read save data.</Text><PixelButton onPress={retryLoad}>다시 불러오기 / RETRY</PixelButton></View></Screen>;
    return <Screen><View style={styles.loading}><ActivityIndicator color={colors.cyan} /><Text style={styles.muted}>SAVE DATA LOADING</Text></View></Screen>;
  }

  const captured = new Set(save.progress.captures.map(({ id }) => id));
  const startBattle = (next: MonsterDefinition) => {
    if (!canEnterBattle(save, next.id)) return;
    selectCheckpoint(next.id); setWorldStageId(next.id); setMonster(next); setRoute("battle");
  };
  if (QA_ENABLED && route === "qa") return <QAScreen checked={qaChecks} onToggleCheck={(check) => setQaChecks((items) => items.includes(check) ? items.filter((item) => item !== check) : [...items, check])} onBack={() => setRoute("title")} onBattle={(next) => { setWorldStageId(next.id); setMonster(next); setRoute("battle"); }} onWorld={() => { setWorldStageId(resumeCheckpoint(save).monster.id); setRoute("world"); }} onDex={() => setRoute("dex")} />;
  const destinationRoute = (id: string): "world" | "career" => findStage(id).chapter.id.startsWith("career:") || (isCommonPathComplete(captured) && save.player.primaryJobId === "junior") ? "career" : "world";
  const mapRoute = destinationRoute(monster.id);
  if (route === "title") return <TitleScreen onCareer={() => setRoute("career")} onQA={() => setRoute("qa")} onDex={() => setRoute("dex")} onPlay={() => { const next = resumeCheckpoint(save); setWorldStageId(next.monster.id); setRoute(destinationRoute(next.monster.id)); }} onSettings={() => setRoute("settings")} />;
  if (route === "career") return <CareerScreen onBack={() => setRoute("title")} onBattle={(id) => startBattle(findStage(id).monster)} />;
  if (route === "world") return <WorldMapScreen selectedId={worldStageId} onSelect={(id) => { setWorldStageId(id); selectCheckpoint(id); }} onBack={() => setRoute("title")} onBattle={(id) => startBattle(findStage(id).monster)} onDex={() => setRoute("dex")} />;
  if (route === "dex") return <DexScreen onCareer={() => setRoute("career")} onBack={() => setRoute(QA_ENABLED ? "qa" : "title")} onSelect={(next) => { setMonster(next); setRoute("detail"); }} />;
  if (route === "detail") return <MonsterDetail monster={monster} onBack={() => setRoute("dex")} onBattle={() => startBattle(monster)} />;
  if (route === "settings") return <SettingsScreen onBack={() => setRoute("title")} />;
  if (route === "battle") {
    return <BattleScreen monster={monster} monsterImage={mobileAssetSource(monster.assetKey)} locale={locale} onExit={() => setRoute(mapRoute)} onFinish={(battle) => {
      const passed = battle.status === "passed";
      if (passed) capture(monster.id, battle);
      setResult({ correct: battle.correctCount, monster, passed, total: battle.questions.length });
      setRoute("result");
    }} />;
  }
  return <ResultScreen result={result!} onRetry={() => { selectCheckpoint(monster.id); setRoute("battle"); }} onContinue={() => { const next = nextPlayableCheckpoint(save); selectCheckpoint(next.monster.id); setWorldStageId(next.monster.id); setRoute(destinationRoute(next.monster.id)); }} onQA={() => setRoute("qa")} onDex={() => setRoute("dex")} onWorld={() => setRoute(mapRoute)} />;
}

function TitleScreen({ onDex, onPlay, onSettings, onQA, onCareer }: { onDex(): void; onPlay(): void; onSettings(): void; onQA(): void; onCareer(): void }) {
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
          <Text accessibilityRole="header" style={styles.logo}>CODIGDEX</Text>
          <Text style={styles.subtitle}>{ko ? "코드로 버그를 잡고 지식을 수집하세요" : "Catch bugs with code and collect knowledge"}</Text>
          <Text style={styles.muted}>{ko ? `나의 필드 가이드 · 포획 ${save.progress.captures.length}마리` : `MY FIELD GUIDE · ${save.progress.captures.length} CAPTURED`}</Text>
        </View>
        <View style={styles.titleActions}>
          <PixelButton onPress={onPlay}>{continuing ? (ko ? "이어하기" : "CONTINUE") : (ko ? "게임 시작" : "PLAY")}</PixelButton>
          <Text style={styles.hint}>{localize(resume.chapter.name, locale)} · Lv.{resume.monster.level}{"\n"}{localize(resume.monster.name, locale)}</Text>
          {saveError ? <><Text accessibilityRole="alert" style={styles.wrong}>{ko ? "저장 실패 · 종료 전 다시 저장하세요." : "Save failed. Retry before closing."}</Text><PixelButton onPress={retrySave}>{ko ? "다시 저장" : "RETRY SAVE"}</PixelButton></> : null}
          <PixelButton onPress={onDex} variant="secondary">{ko ? "코디덱스" : "CODIGDEX"}</PixelButton>
          <PixelButton onPress={onCareer} variant="secondary">{ko ? "전직 · 직업 경로" : "CAREERS · PATHS"}</PixelButton>
          <PixelButton compact onPress={onSettings} variant="quiet">{ko ? "설정" : "SETTINGS"}</PixelButton>
          {QA_ENABLED ? <PixelButton onPress={onQA} variant="secondary">QA · 기기 테스트</PixelButton> : null}
        </View>
      </View>
    </Screen>
  );
}

function ResultScreen({ onDex, onWorld, onRetry, onQA, onContinue, result }: { onDex(): void; onWorld(): void; onRetry(): void; onQA(): void; onContinue(): void; result: BattleResult }) {
  const { locale, saveError, retrySave, save } = useSave();
  const captured = new Set(save.progress.captures.map(({ id }) => id));
  const path = playableCheckpoints(save);
  const chapter = path.find(({ monster }) => monster.id === result.monster.id)?.chapter;
  const chapterComplete = result.passed && chapter?.stages.every(({ id }) => captured.has(id));
  const allComplete = path.every(({ status }) => status === "cleared");
  const commonComplete = CHAPTERS.every(({ stages }) => stages.every(({ id }) => captured.has(id)));
  const next = nextPlayableCheckpoint(save);
  const { width, height } = useWindowDimensions();
  const narrow = width < 680 || height > width;
  const ko = locale === "ko";
  return (
    <Screen scroll>
      <View style={[styles.resultLayout, narrow && styles.verticalLayout]}>
        <View style={styles.resultStage}><PixelScene backdrop scene={(chapter?.id ?? "field") as PixelScenery} /><Image resizeMode="contain" source={mobileAssetSource(result.monster.assetKey)} style={styles.resultMonster} /></View>
        <View style={styles.resultCopy}>
          <Text style={[styles.resultGrade, result.passed ? styles.correct : styles.wrong]}>{result.passed ? (ko ? "포획 성공" : "CAPTURED") : (ko ? "재도전" : "TRY AGAIN")}</Text>
          <Text style={styles.logo}>{battlePercent(result.correct, result.total)}%</Text>
          <Text style={styles.body}>{result.correct}/{result.total} · {localize(result.monster.name, locale)}</Text>
          <Text style={styles.muted}>{result.passed ? (ko ? "코디덱스에 새 카드가 등록되었습니다." : "A new card was registered.") : (ko ? "60% 이상 맞히면 포획할 수 있습니다." : "Score at least 60% to capture it.")}</Text>
          {chapterComplete ? <Text accessibilityLiveRegion="polite" style={styles.hint}>{commonComplete && save.player.primaryJobId === "junior" ? (ko ? "공통 경로 완료! 1차 직업을 선택하세요." : "Common path complete! Choose a primary career.") : `${localize(chapter!.name, locale)} ${ko ? "지역 완료!" : "complete!"}`}</Text> : null}
        </View>
        <View style={styles.titleActions}>
          {saveError ? <>
            <Text accessibilityRole="alert" style={styles.wrong}>{ko ? "기기에 저장하지 못했습니다. 앱을 닫기 전에 다시 저장하세요." : "Could not save to this device. Retry before closing the app."}</Text>
            <PixelButton onPress={retrySave}>{ko ? "다시 저장" : "RETRY SAVE"}</PixelButton>
          </> : null}
          {result.passed && !allComplete ? <PixelButton onPress={onContinue}>{ko ? "다음 체크포인트" : "NEXT CHECKPOINT"}{"\n"}{localize(next.chapter.name, locale)} · Lv.{next.monster.level}</PixelButton> : null}
          <PixelButton onPress={onWorld}>{ko ? "월드맵으로" : "WORLD MAP"}</PixelButton>
          <PixelButton onPress={onRetry} variant="secondary">{ko ? "다시 도전" : "RETRY BATTLE"}</PixelButton>
          <PixelButton onPress={onDex} variant="secondary">{ko ? "도감 보기" : "OPEN DEX"}</PixelButton>
          {QA_ENABLED ? <PixelButton onPress={onQA} variant="quiet">QA · 기기 테스트</PixelButton> : null}
        </View>
      </View>
    </Screen>
  );
}

function DexScreen({ onBack, onSelect, onCareer }: { onBack(): void; onSelect(monster: MonsterDefinition): void; onCareer(): void }) {
  const { locale, save } = useSave();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const columns = Math.max(2, Math.floor((width - insets.left - insets.right - 36 + 10) / 138));
  const captured = useMemo(() => new Set(save.progress.captures.map(({ id }) => id)), [save.progress.captures]);
  const ko = locale === "ko";
  return (
    <Screen>
      <View style={styles.topbar}><PixelButton compact onPress={onBack} variant="quiet">← {ko ? "메뉴" : "MENU"}</PixelButton><Text style={styles.topbarTitle}>CODIGDEX · {captured.size}/{DEX_MONSTERS.length}</Text><View style={styles.topbarGap} /></View>
      <PixelButton compact onPress={onCareer} variant="secondary">{ko ? "직업 도감 · 전직 계보" : "CAREER DEX · LINEAGE"}</PixelButton>
      <FlatList key={columns} data={DEX_MONSTERS} numColumns={columns} keyExtractor={(entry) => entry.id}
        initialNumToRender={12} maxToRenderPerBatch={12} windowSize={3} columnWrapperStyle={styles.dexRow}
        contentContainerStyle={styles.dexGrid} renderItem={({ item: entry }) => {
          const unlocked = captured.has(entry.id);
          return (
            <Pressable accessibilityRole="button" accessibilityLabel={`NO.${entry.dexNumber} ${localize(entry.name, locale)}`} onPress={() => onSelect(entry)} style={[styles.dexCard, unlocked && styles.dexCardCaptured]}>
              <Text style={styles.number}>NO.{entry.dexNumber}</Text>
              {unlocked ? <Image resizeMode="contain" source={mobileAssetSource(entry.assetKey)} style={styles.dexMonster} /> : <View style={styles.dexUnknown}><Text style={styles.dexQuestion}>?</Text></View>}
              <Text numberOfLines={1} style={styles.dexName}>{unlocked ? localize(entry.name, locale) : "???"}</Text>
            </Pressable>
          );
        }} />
    </Screen>
  );
}

function MonsterDetail({ monster, onBack, onBattle }: { monster: MonsterDefinition; onBack(): void; onBattle(): void }) {
  const { locale, save } = useSave();
  const ko = locale === "ko";
  const captured = new Set(save.progress.captures.map(({ id }) => id));
  const available = canEnterBattle(save, monster.id);
  return <Screen scroll><View style={styles.detail}>
    <PixelButton onPress={onBack} variant="quiet">{ko ? "도감으로" : "BACK TO DEX"}</PixelButton>
    <Text style={styles.kicker}>NO.{monster.dexNumber} · LV.{monster.level}</Text>
    <Text accessibilityRole="header" style={styles.hudTitle}>{localize(monster.name, locale)}</Text>
    <View style={styles.resultStage}><PixelScene backdrop scene="field" /><Image accessibilityLabel={localize(monster.name, locale)} source={mobileAssetSource(monster.assetKey)} resizeMode="contain" style={styles.resultMonster} /></View>
    <Text style={styles.body}>{localize(monster.briefing, locale)}</Text>
    {captured.has(monster.id) ? <><Text style={styles.body}>{localize(monster.classification, locale)} · {localize(monster.trait, locale)}</Text><Text style={styles.body}>{localize(monster.description, locale)}</Text><Text selectable style={styles.hint}>{localize(monster.snippet, locale)}</Text></> : null}
    <Text style={styles.hint}>{available ? (ko ? "정답 60% 이상이면 포획할 수 있어요. 힌트를 사용해도 정답으로 인정해요." : "Get at least 60% correct to capture. Answers with hints count too.") : (ko ? "선행 체크포인트를 완료하고 해당 직업 경로를 선택하세요." : "Complete preceding checkpoints and select this career path.")}</Text>
    <PixelButton disabled={!available} onPress={onBattle}>{captured.has(monster.id) ? (ko ? "다시 도전" : "BATTLE AGAIN") : (ko ? "배틀 시작" : "START BATTLE")}</PixelButton>
  </View></Screen>;
}

function SettingsScreen({ onBack }: { onBack(): void }) {
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

const styles = StyleSheet.create({
  loading: { alignItems: "center", flex: 1, gap: 16, justifyContent: "center" },
  muted: { color: colors.muted, fontFamily: font, fontSize: 15, lineHeight: 22, textAlign: "center" },
  titleLayout: { alignItems: "center", flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 20, justifyContent: "center", maxWidth: 1000, width: "100%", alignSelf: "center" },
  verticalLayout: { flexDirection: "column", gap: 18, paddingVertical: 12 },
  titleArt: { ...pixelPanel, width: "100%", overflow: "hidden" },
  artLabel: { padding: 10, backgroundColor: colors.panel, borderTopWidth: 2, borderColor: colors.shadow },
  titleCopy: { maxWidth: 390, width: "100%", paddingVertical: 8 },
  titleActions: { gap: 10, minWidth: 180, width: "100%", maxWidth: 390 },
  kicker: { color: colors.cyan, fontFamily: font, fontSize: 15 },
  logo: { color: colors.text, fontFamily: font, fontSize: 30, marginVertical: 8 },
  subtitle: { color: colors.blue, fontFamily: font, fontSize: 15, lineHeight: 22, marginBottom: 13 },
  topbar: { alignItems: "center", flexDirection: "row", minHeight: 52, justifyContent: "space-between", gap: 8 },
  topbarTitle: { color: colors.text, flex: 1, textAlign: "center", fontFamily: font, fontSize: 15 },
  topbarGap: { width: 0 },
  worldLayout: { flex: 1, flexDirection: "row", gap: 14 },
  worldColumn: { flexDirection: "column" },
  worldHud: { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 0, borderWidth: 1, flex: 1, minWidth: 0 },
  worldHudContent: { padding: 14, flexGrow: 1 },
  hudTitle: { color: colors.text, fontFamily: font, fontSize: 15, marginVertical: 7 },
  body: { color: colors.text, fontFamily: font, fontSize: 15, lineHeight: 22 },
  hudSpacer: { flex: 1 },
  hint: { color: colors.amber, fontFamily: font, fontSize: 15, lineHeight: 22, marginVertical: 8, textAlign: "center" },
  battleLayout: { flex: 1, flexDirection: "row", gap: 16 },
  monsterPanel: { alignItems: "center", backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 0, borderWidth: 1, justifyContent: "center", width: "34%" },
  battleMonster: { height: 190, width: 190 },
  quizPanel: { backgroundColor: colors.panel, borderColor: colors.cyan, borderRadius: 0, borderWidth: 1, flex: 1, padding: 18 },
  question: { color: colors.text, fontFamily: font, fontSize: 15, lineHeight: 23, marginBottom: 14, marginTop: 9 },
  answers: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  answer: { alignItems: "center", backgroundColor: colors.panelRaised, borderColor: colors.border, borderRadius: 0, borderWidth: 1, flexDirection: "row", minHeight: 54, padding: 10, width: "48%" },
  answerPressed: { borderColor: colors.cyan, transform: [{ translateY: 2 }] },
  answerLocked: { opacity: 0.6 },
  answerKey: { color: colors.cyan, fontFamily: font, fontSize: 15, marginRight: 10 },
  answerText: { color: colors.text, flex: 1, fontFamily: font, fontSize: 15, lineHeight: 22 },
  feedback: { fontFamily: font, fontSize: 15, textAlign: "right" },
  correct: { color: colors.cyan },
  wrong: { color: colors.danger, fontFamily: font },
  score: { color: colors.amber, fontFamily: font, fontSize: 15 },
  resultLayout: { alignItems: "center", flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 24, justifyContent: "center" },
  resultStage: { ...pixelPanel, width: "100%", maxWidth: 390, height: 200, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  resultMonster: { height: 220, width: 220 },
  resultCopy: { maxWidth: 330 },
  resultGrade: { fontFamily: font, fontSize: 30 },
  dexGrid: { gap: 10, paddingBottom: 24 },
  dexRow: { gap: 10, justifyContent: "center" },
  detail: { alignItems: "center", gap: 14, maxWidth: 600, width: "100%", alignSelf: "center", paddingBottom: 24 },
  dexCard: { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 0, borderWidth: 1, padding: 8, width: 128 },
  dexCardCaptured: { borderColor: colors.cyan },
  number: { color: colors.blue, fontFamily: font, fontSize: 15 },
  dexMonster: { height: 84, width: "100%" },
  dexUnknown: { alignItems: "center", height: 84, justifyContent: "center" },
  dexQuestion: { color: colors.border, fontFamily: font, fontSize: 45 },
  dexName: { color: colors.text, fontFamily: font, fontSize: 15, textAlign: "center" },
  settingsPanel: { ...pixelPanel, alignSelf: "center", gap: 14, marginTop: 24, maxWidth: 520, padding: 16, width: "100%" },
  settingsRow: { flexDirection: "row", gap: 12 },
});
