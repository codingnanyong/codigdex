import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { findStage } from "@codigdex/game-content/domain/chapters";
import { openSourceStageFor } from "@codigdex/game-content/domain/openSourceChapters";
import type { SourceReturnTarget } from "@codigdex/game-content/domain/openSourceEncounters";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { mobileAssetSource } from "../assets";
import { useSave } from "../state/SaveProvider";
import { PixelButton } from "../ui/PixelButton";
import { Screen } from "../ui/Screen";
import { colors } from "../ui/theme";
import { QA_ENABLED } from "../qa/runtime";
import { QAScreen } from "../qa/QAScreen";
import { BattleScreen } from "./BattleScreen";
import { CareerScreen } from "./CareerScreen";
import { WorldMapScreen } from "./WorldMapScreen";
import { OpenSourceScreen } from "./OpenSourceScreen";
import { OpenSourceEventScreen } from "./OpenSourceEventScreen";
import { TitleScreen } from "./TitleScreen";
import { ResultScreen } from "./ResultScreen";
import { DexScreen } from "./DexScreen";
import { MonsterDetail } from "./MonsterDetail";
import { SettingsScreen } from "./SettingsScreen";
import { styles } from "./gameScreenStyles";
import { canEnterBattle, nextPlayableCheckpoint, resumeCheckpoint } from "./progression";
import { destinationFor, mobileDestination, type BattleResult, type MobileRoute } from "./navigation";

export function NativeGame() {
  const { capture, hydrated, locale, loadError, retryLoad, save, selectCheckpoint, sourceEvents, sourceHistory, saveError, retrySave } = useSave();
  const [route, setRoute] = useState<MobileRoute>({ name: "title" });
  const [qaChecks, setQaChecks] = useState<string[]>([]);
  const [worldStageId, setWorldStageId] = useState<string>();
  const [careerRegionId, setCareerRegionId] = useState<string>();

  if (!hydrated) {
    if (loadError) return <Screen><View style={styles.loading}><Text accessibilityRole="alert" style={styles.wrong}>저장 데이터를 읽지 못했습니다. / Could not read save data.</Text><PixelButton onPress={retryLoad}>다시 불러오기 / RETRY</PixelButton></View></Screen>;
    return <Screen><View style={styles.loading}><ActivityIndicator color={colors.cyan} /><Text style={styles.muted}>SAVE DATA LOADING</Text></View></Screen>;
  }

  const captured = new Set(save.progress.captures.map(({ id }) => id));
  const pending = sourceEvents.pending(save);
  const navigate = (target: SourceReturnTarget) => {
    const next = mobileDestination(target);
    setCareerRegionId(next.regionId);
    setRoute({ name: next.route });
  };
  const startBattle = (monster: MonsterDefinition, sourceEventId?: string, qa = false) => {
    if (sourceEventId ? !sourceEvents.canBattle(save, sourceEventId, monster.id) : monster.id.startsWith("open-source:") || (!(qa && QA_ENABLED) && !canEnterBattle(save, monster.id))) return;
    if (!sourceEventId) { selectCheckpoint(monster.id); setWorldStageId(monster.id); }
    setRoute({ name: "battle", battle: { monster, sourceEventId, victoryId: Date.now().toString(36) + ":" + Math.random().toString(36).slice(2) } });
  };
  const resume = () => {
    if (sourceEvents.resolvePending(save)) { setRoute({ name: "encounter" }); return; }
    const next = resumeCheckpoint(save);
    setWorldStageId(next.monster.id);
    navigate(destinationFor(save, next.monster.id));
  };
  const finishEncounter = () => {
    const target = pending && sourceEvents.finish(save, pending.id);
    navigate(target || { scene: "world-map" });
  };
  const leaveResult = (result: BattleResult, advance: boolean) => {
    if (result.sourceEventId) {
      if (!result.passed) { setRoute({ name: "encounter" }); return; }
      navigate(sourceEvents.finish(save, result.sourceEventId) ?? destinationFor(save, result.beforeCapture.ui.checkpointId ?? result.monster.id));
      return;
    }
    const next = advance ? nextPlayableCheckpoint(save) : findStage(result.monster.id);
    if (advance) { selectCheckpoint(next.monster.id); setWorldStageId(next.monster.id); }
    const target = destinationFor(save, next.monster.id);
    const offered = result.passed && sourceEvents.queue(result.beforeCapture, save, result.monster.id, target, Math.random, result.victoryId);
    if (offered) setRoute({ name: "encounter" }); else navigate(target);
  };
  const title = () => <TitleScreen onOpenSources={() => setRoute({ name: "open-source", returnTo: "title" })} onCareer={() => setRoute({ name: "career" })} onQA={() => setRoute({ name: "qa" })} onDex={() => setRoute({ name: "dex" })} onPlay={resume} onSettings={() => setRoute({ name: "settings" })} />;

  switch (route.name) {
    case "title": return title();
    case "qa": return QA_ENABLED ? <QAScreen checked={qaChecks} onToggleCheck={(check) => setQaChecks((items) => items.includes(check) ? items.filter((item) => item !== check) : [...items, check])} onBack={() => setRoute({ name: "title" })} onBattle={(monster) => startBattle(monster, undefined, true)} onWorld={() => { setWorldStageId(resumeCheckpoint(save).monster.id); setRoute({ name: "world" }); }} onDex={() => setRoute({ name: "dex" })} /> : title();
    case "encounter": return pending ? <OpenSourceEventScreen encounter={pending} captured={captured.has("open-source:" + pending.toolId)} locale={locale} saveError={saveError} onRetrySave={retrySave} onLater={finishEncounter} onAccept={() => {
      if (captured.has("open-source:" + pending.toolId)) { finishEncounter(); return; }
      if (sourceEvents.accept(save, pending.id)) startBattle(openSourceStageFor(pending.toolId)!, pending.id);
    }} /> : title();
    case "open-source": return <OpenSourceScreen locale={locale} save={save} history={sourceHistory} initialIds={route.ids} onBack={() => setRoute({ name: route.returnTo })} />;
    case "career": return <CareerScreen selectedRegionId={careerRegionId} onRegionChange={setCareerRegionId} onBack={() => setRoute({ name: "title" })} onBattle={(id) => startBattle(findStage(id).monster)} onOpenSources={(ids) => setRoute({ name: "open-source", ids, returnTo: "career" })} />;
    case "world": return <WorldMapScreen selectedId={worldStageId} onSelect={(id) => { setWorldStageId(id); selectCheckpoint(id); }} onBack={() => setRoute({ name: "title" })} onBattle={(id) => startBattle(findStage(id).monster)} onDex={() => setRoute({ name: "dex" })} />;
    case "dex": return <DexScreen onCareer={() => setRoute({ name: "career" })} onBack={() => setRoute({ name: QA_ENABLED ? "qa" : "title" })} onSelect={(monster) => setRoute({ name: "detail", monster })} />;
    case "detail": return <MonsterDetail monster={route.monster} onBack={() => setRoute({ name: "dex" })} onBattle={() => startBattle(route.monster)} />;
    case "settings": return <SettingsScreen onBack={() => setRoute({ name: "title" })} />;
    case "battle": {
      const context = route.battle;
      return <BattleScreen monster={context.monster} monsterImage={mobileAssetSource(context.monster.assetKey)} locale={locale} onExit={() => context.sourceEventId ? setRoute({ name: "encounter" }) : navigate(destinationFor(save, context.monster.id))} onFinish={(battle) => {
        const passed = battle.status === "passed";
        const newCapture = passed && !captured.has(context.monster.id);
        if (passed) capture(context.monster.id, battle, context.sourceEventId);
        setRoute({ name: "result", result: { ...context, beforeCapture: save, correct: battle.correctCount, passed, newCapture, total: battle.questions.length } });
      }} />;
    }
    case "result": return <ResultScreen result={route.result} onRetry={() => route.result.sourceEventId ? setRoute({ name: "encounter" }) : startBattle(route.result.monster)} onContinue={() => leaveResult(route.result, true)} onQA={() => setRoute({ name: "qa" })} onDex={() => setRoute({ name: "dex" })} onWorld={() => leaveResult(route.result, false)} />;
  }
}
