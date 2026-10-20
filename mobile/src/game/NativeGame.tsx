import { CHAPTERS, DEX_MONSTERS, findStage, stageStatus } from "@codigdex/game-content/domain/chapters";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { localize } from "@codigdex/game-core/i18n/locale";
import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { mobileAssetSource } from "@/assets";
import { useSave } from "@/state/SaveProvider";
import { PixelButton } from "@/ui/PixelButton";
import { Screen } from "@/ui/Screen";
import { colors, font } from "@/ui/theme";
import { battlePercent } from "./battle";
import { BattleScreen } from "./BattleScreen";
import { DPad } from "./DPad";
import { WorldCanvas, type WorldPosition } from "./WorldCanvas";

type Route = "title" | "world" | "battle" | "result" | "dex" | "detail" | "settings";

interface BattleResult { correct: number; monster: MonsterDefinition; total: number; passed: boolean }

export function NativeGame() {
  const { capture, hydrated, locale } = useSave();
  const [route, setRoute] = useState<Route>("title");
  const [monster, setMonster] = useState<MonsterDefinition>(() => CHAPTERS[0].stages[0]);
  const [result, setResult] = useState<BattleResult>();

  if (!hydrated) {
    return <Screen><View style={styles.loading}><ActivityIndicator color={colors.cyan} /><Text style={styles.muted}>SAVE DATA LOADING</Text></View></Screen>;
  }

  const startBattle = (next: MonsterDefinition) => { setMonster(next); setRoute("battle"); };
  if (route === "title") return <TitleScreen onDex={() => setRoute("dex")} onPlay={() => setRoute("world")} onSettings={() => setRoute("settings")} />;
  if (route === "dex") return <DexScreen onBack={() => setRoute("title")} onSelect={(next) => { setMonster(next); setRoute("detail"); }} />;
  if (route === "world") return <WorldScreen onBack={() => setRoute("title")} onBattle={(next) => { setMonster(next); setRoute("battle"); }} onDex={() => setRoute("dex")} />;
  if (route === "detail") return <MonsterDetail monster={monster} onBack={() => setRoute("dex")} onBattle={() => startBattle(monster)} />;
  if (route === "settings") return <SettingsScreen onBack={() => setRoute("title")} />;
  if (route === "battle") {
    return <BattleScreen monster={monster} monsterImage={mobileAssetSource(monster.assetKey)} locale={locale} onExit={() => setRoute("world")} onFinish={(battle) => {
      const passed = battle.status === "passed";
      if (passed) capture(monster.id, battle);
      setResult({ correct: battle.correctCount, monster, passed, total: battle.questions.length });
      setRoute("result");
    }} />;
  }
  return <ResultScreen result={result!} onRetry={() => setRoute("battle")} onDex={() => setRoute("dex")} onWorld={() => setRoute("world")} />;
}

function TitleScreen({ onDex, onPlay, onSettings }: { onDex(): void; onPlay(): void; onSettings(): void }) {
  const { locale, save } = useSave();
  const { width, height } = useWindowDimensions();
  const narrow = width < 680 || height > width;
  const ko = locale === "ko";
  return (
    <Screen scroll>
      <View style={[styles.titleLayout, narrow && styles.verticalLayout]}>
        <View style={styles.titleMark}><Text style={styles.titleMarkText}>{"{ }"}</Text></View>
        <View style={styles.titleCopy}>
          <Text style={styles.kicker}>NATIVE CODING ADVENTURE</Text>
          <Text accessibilityRole="header" style={styles.logo}>CODIGDEX</Text>
          <Text style={styles.subtitle}>{ko ? "코드로 버그를 잡고 지식을 수집하세요" : "Catch bugs with code and collect knowledge"}</Text>
          <Text style={styles.muted}>{ko ? `포획 ${save.progress.captures.length}마리 · React Native + Skia` : `${save.progress.captures.length} captured · React Native + Skia`}</Text>
        </View>
        <View style={styles.titleActions}>
          <PixelButton onPress={onPlay}>{ko ? "게임 시작" : "PLAY"}</PixelButton>
          <PixelButton onPress={onDex} variant="secondary">{ko ? "코디덱스" : "CODIGDEX"}</PixelButton>
          <PixelButton compact onPress={onSettings} variant="quiet">{ko ? "설정" : "SETTINGS"}</PixelButton>
        </View>
      </View>
    </Screen>
  );
}

function WorldScreen({ onBack, onBattle, onDex }: { onBack(): void; onBattle(monster: MonsterDefinition): void; onDex(): void }) {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const narrow = width < 680 || height > width;
  const { locale, save } = useSave();
  const captured = useMemo(() => new Set(save.progress.captures.map(({ id }) => id)), [save.progress.captures]);
  const available = CHAPTERS.flatMap((chapter) => chapter.stages.map((stage, index) => ({ chapter, stage, status: stageStatus(chapter, index, captured) })))
    .find(({ status }) => status === "available") ?? { chapter: CHAPTERS.at(-1)!, stage: CHAPTERS.at(-1)!.stages.at(-1)!, status: "cleared" as const };
  const [position, setPosition] = useState<WorldPosition>({ x: 0.2, y: 0.5 });
  const availableWidth = Math.max(1, width - insets.left - insets.right - 36);
  const canvasWidth = narrow ? availableWidth : Math.max(1, availableWidth * 0.60);
  const canvasHeight = narrow ? Math.min(220, height * 0.28) : Math.max(120, height - insets.top - insets.bottom - 100);
  const nearQuest = Math.abs(position.x - 0.83) < 0.16 && Math.abs(position.y - 0.5) < 0.2;
  const ko = locale === "ko";
  return (
    <Screen>
      <View style={styles.topbar}>
        <PixelButton compact onPress={onBack} variant="quiet">← {ko ? "메뉴" : "MENU"}</PixelButton>
        <Text style={styles.topbarTitle}>{localize(available.chapter.place, locale)}</Text>
        <PixelButton compact onPress={onDex} variant="secondary">{ko ? "도감" : "DEX"}</PixelButton>
      </View>
      <View style={[styles.worldLayout, narrow && styles.worldColumn]}>
        <WorldCanvas height={canvasHeight} position={position} width={canvasWidth} />
        <ScrollView style={styles.worldHud} contentContainerStyle={styles.worldHudContent}>
          <Text style={styles.kicker}>{available.chapter.label}</Text>
          <Text style={styles.hudTitle}>{localize(available.stage.name, locale)}</Text>
          <Text style={styles.body}>{localize(available.stage.briefing, locale)}</Text>
          <View style={styles.hudSpacer} />
          <DPad onMove={(delta) => setPosition((current) => ({
            x: Math.min(0.94, Math.max(0.06, current.x + delta.x)),
            y: Math.min(0.88, Math.max(0.12, current.y + delta.y)),
          }))} />
          <Text style={styles.hint}>{nearQuest ? (ko ? "의뢰 지점에 도착했습니다!" : "Quest marker reached!") : (ko ? "방향키로 빛나는 표식까지 이동하세요" : "Move to the glowing marker")}</Text>
          <PixelButton disabled={!nearQuest} onPress={() => onBattle(available.stage)}>{ko ? "배틀 시작" : "START BATTLE"}</PixelButton>
        </ScrollView>
      </View>
    </Screen>
  );
}

function ResultScreen({ onDex, onWorld, onRetry, result }: { onDex(): void; onWorld(): void; onRetry(): void; result: BattleResult }) {
  const { locale, saveError, retrySave } = useSave();
  const { width, height } = useWindowDimensions();
  const narrow = width < 680 || height > width;
  const ko = locale === "ko";
  return (
    <Screen scroll>
      <View style={[styles.resultLayout, narrow && styles.verticalLayout]}>
        <Image resizeMode="contain" source={mobileAssetSource(result.monster.assetKey)} style={styles.resultMonster} />
        <View style={styles.resultCopy}>
          <Text style={[styles.resultGrade, result.passed ? styles.correct : styles.wrong]}>{result.passed ? (ko ? "포획 성공" : "CAPTURED") : (ko ? "재도전" : "TRY AGAIN")}</Text>
          <Text style={styles.logo}>{battlePercent(result.correct, result.total)}%</Text>
          <Text style={styles.body}>{result.correct}/{result.total} · {localize(result.monster.name, locale)}</Text>
          <Text style={styles.muted}>{result.passed ? (ko ? "코디덱스에 새 카드가 등록되었습니다." : "A new card was registered.") : (ko ? "60% 이상 맞히면 포획할 수 있습니다." : "Score at least 60% to capture it.")}</Text>
        </View>
        <View style={styles.titleActions}>
          {saveError ? <>
            <Text accessibilityRole="alert" style={styles.wrong}>{ko ? "기기에 저장하지 못했습니다. 앱을 닫기 전에 다시 저장하세요." : "Could not save to this device. Retry before closing the app."}</Text>
            <PixelButton onPress={retrySave}>{ko ? "다시 저장" : "RETRY SAVE"}</PixelButton>
          </> : null}
          <PixelButton onPress={onWorld}>{ko ? "월드로" : "WORLD"}</PixelButton>
          <PixelButton onPress={onRetry} variant="secondary">{ko ? "다시 도전" : "RETRY BATTLE"}</PixelButton>
          <PixelButton onPress={onDex} variant="secondary">{ko ? "도감 보기" : "OPEN DEX"}</PixelButton>
        </View>
      </View>
    </Screen>
  );
}

function DexScreen({ onBack, onSelect }: { onBack(): void; onSelect(monster: MonsterDefinition): void }) {
  const { locale, save } = useSave();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const columns = Math.max(2, Math.floor((width - insets.left - insets.right - 36 + 10) / 138));
  const captured = useMemo(() => new Set(save.progress.captures.map(({ id }) => id)), [save.progress.captures]);
  const ko = locale === "ko";
  return (
    <Screen>
      <View style={styles.topbar}><PixelButton compact onPress={onBack} variant="quiet">← {ko ? "메뉴" : "MENU"}</PixelButton><Text style={styles.topbarTitle}>CODIGDEX · {captured.size}/{DEX_MONSTERS.length}</Text><View style={styles.topbarGap} /></View>
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
  const { chapter, index } = findStage(monster.id);
  const available = CHAPTERS.includes(chapter) && stageStatus(chapter, index, captured) !== "locked";
  return <Screen scroll><View style={styles.detail}>
    <PixelButton onPress={onBack} variant="quiet">{ko ? "도감으로" : "BACK TO DEX"}</PixelButton>
    <Text style={styles.kicker}>NO.{monster.dexNumber} · LV.{monster.level}</Text>
    <Text accessibilityRole="header" style={styles.hudTitle}>{localize(monster.name, locale)}</Text>
    <Image accessibilityLabel={localize(monster.name, locale)} source={mobileAssetSource(monster.assetKey)} resizeMode="contain" style={styles.resultMonster} />
    <Text style={styles.body}>{localize(monster.briefing, locale)}</Text>
    <Text style={styles.hint}>{available ? (ko ? "정답 60% 이상이면 포획할 수 있어요. 힌트를 사용해도 정답으로 인정해요." : "Get at least 60% correct to capture. Answers with hints count too.") : (ko ? "공통 과정의 앞선 몬스터부터 완료하세요. 직업 지역 전투는 다음 단계에서 연결됩니다." : "Complete the earlier common stages first. Career battles are coming later.")}</Text>
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
        <Text style={styles.hudTitle}>{ko ? "언어" : "LANGUAGE"}</Text>
        <View style={styles.settingsRow}>
          <PixelButton onPress={() => setLocale("ko")} variant={locale === "ko" ? "primary" : "secondary"}>한국어</PixelButton>
          <PixelButton onPress={() => setLocale("en")} variant={locale === "en" ? "primary" : "secondary"}>English</PixelButton>
        </View>
        <Text style={styles.hudTitle}>{ko ? "저장 데이터" : "SAVE DATA"}</Text>
        <PixelButton onPress={clearProgress} variant="danger">{ko ? "진행도 초기화" : "RESET PROGRESS"}</PixelButton>
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
  muted: { color: colors.muted, fontFamily: font, fontSize: 11, lineHeight: 17, textAlign: "center" },
  titleLayout: { alignItems: "center", flex: 1, flexDirection: "row", gap: 34, justifyContent: "center" },
  verticalLayout: { flexDirection: "column", gap: 20, paddingVertical: 18 },
  titleMark: { alignItems: "center", backgroundColor: colors.panelRaised, borderColor: colors.cyan, borderRadius: 22, borderWidth: 3, height: 150, justifyContent: "center", transform: [{ rotate: "3deg" }], width: 150 },
  titleMarkText: { color: colors.cyan, fontFamily: font, fontSize: 38, fontWeight: "900" },
  titleCopy: { maxWidth: 390 },
  titleActions: { gap: 10, minWidth: 180 },
  kicker: { color: colors.cyan, fontFamily: font, fontSize: 10, fontWeight: "700", letterSpacing: 2 },
  logo: { color: colors.text, fontFamily: font, fontSize: 38, fontWeight: "900", letterSpacing: 3, marginVertical: 8 },
  subtitle: { color: colors.blue, fontFamily: font, fontSize: 15, lineHeight: 22, marginBottom: 13 },
  topbar: { alignItems: "center", flexDirection: "row", height: 52, justifyContent: "space-between" },
  topbarTitle: { color: colors.text, flex: 1, textAlign: "center", fontFamily: font, fontSize: 12, fontWeight: "800" },
  topbarGap: { width: 90 },
  worldLayout: { flex: 1, flexDirection: "row", gap: 14 },
  worldColumn: { flexDirection: "column" },
  worldHud: { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 12, borderWidth: 1, flex: 1, minWidth: 0 },
  worldHudContent: { padding: 14, flexGrow: 1 },
  hudTitle: { color: colors.text, fontFamily: font, fontSize: 17, fontWeight: "800", marginVertical: 7 },
  body: { color: colors.text, fontFamily: font, fontSize: 11, lineHeight: 17 },
  hudSpacer: { flex: 1 },
  hint: { color: colors.amber, fontFamily: font, fontSize: 9, lineHeight: 14, marginVertical: 8, textAlign: "center" },
  battleLayout: { flex: 1, flexDirection: "row", gap: 16 },
  monsterPanel: { alignItems: "center", backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 14, borderWidth: 1, justifyContent: "center", width: "34%" },
  battleMonster: { height: 190, width: 190 },
  quizPanel: { backgroundColor: colors.panel, borderColor: colors.cyan, borderRadius: 14, borderWidth: 1, flex: 1, padding: 18 },
  question: { color: colors.text, fontFamily: font, fontSize: 16, fontWeight: "700", lineHeight: 23, marginBottom: 14, marginTop: 9 },
  answers: { flex: 1, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  answer: { alignItems: "center", backgroundColor: colors.panelRaised, borderColor: colors.border, borderRadius: 9, borderWidth: 1, flexDirection: "row", minHeight: 54, padding: 10, width: "48%" },
  answerPressed: { borderColor: colors.cyan, transform: [{ translateY: 2 }] },
  answerLocked: { opacity: 0.6 },
  answerKey: { color: colors.cyan, fontFamily: font, fontSize: 15, fontWeight: "900", marginRight: 10 },
  answerText: { color: colors.text, flex: 1, fontFamily: font, fontSize: 11, lineHeight: 16 },
  feedback: { fontFamily: font, fontSize: 14, fontWeight: "900", textAlign: "right" },
  correct: { color: colors.cyan },
  wrong: { color: colors.danger },
  score: { color: colors.amber, fontFamily: font, fontSize: 12, fontWeight: "800" },
  resultLayout: { alignItems: "center", flex: 1, flexDirection: "row", gap: 32, justifyContent: "center" },
  resultMonster: { height: 220, width: 220 },
  resultCopy: { maxWidth: 330 },
  resultGrade: { fontFamily: font, fontSize: 18, fontWeight: "900", letterSpacing: 2 },
  dexGrid: { gap: 10, paddingBottom: 24 },
  dexRow: { gap: 10, justifyContent: "center" },
  detail: { alignItems: "center", gap: 14, maxWidth: 600, width: "100%", alignSelf: "center", paddingBottom: 24 },
  dexCard: { backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 10, borderWidth: 1, padding: 8, width: 128 },
  dexCardCaptured: { borderColor: colors.cyan },
  number: { color: colors.blue, fontFamily: font, fontSize: 8 },
  dexMonster: { height: 84, width: "100%" },
  dexUnknown: { alignItems: "center", height: 84, justifyContent: "center" },
  dexQuestion: { color: colors.border, fontFamily: font, fontSize: 38 },
  dexName: { color: colors.text, fontFamily: font, fontSize: 10, fontWeight: "700", textAlign: "center" },
  settingsPanel: { alignSelf: "center", backgroundColor: colors.panel, borderColor: colors.border, borderRadius: 14, borderWidth: 1, gap: 14, marginTop: 24, maxWidth: 520, padding: 22, width: "80%" },
  settingsRow: { flexDirection: "row", gap: 12 },
});
