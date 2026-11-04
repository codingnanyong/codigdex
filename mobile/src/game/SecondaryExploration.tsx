import { useState } from "react";
import { useRegionMusic } from "../audio/MusicContext";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { secondaryRegionProgression, secondaryExplorationCheckpoints } from "@codigdex/game-content/domain/gameProgress";
import { EVOLUTION_LESSON_PHASES } from "@codigdex/game-content/domain/secondaryExploration";
import { promotionMissionFor } from "@codigdex/game-content/domain/promotionChapters";
import { openSourcesForMonster } from "@codigdex/game-content/domain/openSourceLinks";
import { discoveredSourceIds } from "@codigdex/game-content/domain/openSourceEncounters";
import { useSave } from "../state/SaveProvider";
import { mobileAssetSource } from "../assets";
import { PixelButton } from "../ui/PixelButton";
import { colors, font, pixelPanel } from "../ui/theme";

export function SecondaryExploration({ regionId, onRegion, onPractice, onOpenSources }: { regionId?: string; onRegion(id: string | undefined): void; onPractice(id: string): void; onOpenSources?(ids: readonly string[]): void }) {
  const { save, locale, sourceHistory } = useSave();
  const progression = secondaryRegionProgression(save);
  const [focusedId, setFocusedId] = useState<string>();
  const selected = progression.find(({ region, status }) => region.id === regionId && status !== "locked");
  useRegionMusic(selected ? `secondary:${selected.region.jobId}:${selected.region.id}` : "hub:career", 15);
  const focused = progression.find(({ region, status }) => region.id === focusedId && status !== "locked") ?? progression.find(({ status }) => status === "available") ?? progression[0];
  const ko = locale === "ko";
  if (!focused) return null;
  const mission = promotionMissionFor(save.player.secondaryJobId)!;
  const complete = progression.every(({ captured }) => captured === 5);
  const path = secondaryExplorationCheckpoints(save).filter(({ chapter }) => chapter.id === selected?.region.chapter.id);
  const discovered = discoveredSourceIds(save, sourceHistory);
  const tools = selected ? openSourcesForMonster(selected.region.id).filter(({ id }) => discovered.has(id)) : [];
  return <View style={styles.panel}>
    <Text testID="promotion-chapter-title" accessibilityRole="header" style={styles.title}>{ko ? "2차 전직 · 진화의 지도" : "SECONDARY CAREER · EVOLUTION ATLAS"} · {progression.reduce((n, item) => n + item.captured, 0)}/25</Text>
    <Text style={styles.title}>{mission.chapter.name[locale]} · {mission.chapter.npcName[locale]}</Text>
    <Text testID="promotion-story" style={styles.body}>{(complete ? mission.story.ending : mission.story.intro)[locale]}</Text>
    {complete ? <Text testID="secondary-master" style={styles.title}>{ko ? "★ 경로 MASTER · 최종 프로젝트가 열렸습니다." : "★ PATH MASTER · Final project unlocked."}</Text> : null}
    {!selected ? <>
      <View testID="secondary-atlas" style={styles.map}>
        <Image source={mobileAssetSource(focused.region.atlasAssetKey)} style={StyleSheet.absoluteFill} resizeMode="stretch" />
        <Image accessible={false} source={mobileAssetSource(focused.region.terrainAssetKey)} style={[StyleSheet.absoluteFill, { tintColor: "#231c20", opacity: 0.4, transform: [{ translateY: 6 }] }]} resizeMode="stretch" />
        <Image accessible={false} source={mobileAssetSource(focused.region.terrainAssetKey)} style={[StyleSheet.absoluteFill, { transform: [{ translateY: -8 }] }]} resizeMode="stretch" />
        {progression.map(({ region, status, captured }, index) => <Pressable key={region.id} testID={`secondary-region-${region.id}`} accessibilityRole="button" accessibilityLabel={`${region.label[locale]}, ${captured}/5`} accessibilityState={{ disabled: status === "locked", selected: focused.region.id === region.id }} disabled={status === "locked"} onPress={() => setFocusedId(region.id)} style={[styles.mapTarget, { left: `${region.center[0] / 960 * 100 - 11}%`, top: `${region.center[1] / 540 * 100 - 5}%` }]}>
          <Text style={styles.mapLabel}>{status === "locked" ? "🔒" : status === "completed" ? "✓" : index + 1} {region.label[locale]} {captured}/5</Text>
        </Pressable>)}
      </View>
      <Text style={styles.body}>{ko ? "지역을 누르면 지형이 떠오릅니다. 앞 지역의 Lv.5 수호자를 포획하면 다음 지역이 열립니다." : "Tap to lift a region. Capture its Lv.5 guardian to open the next region."}</Text>
      <PixelButton testID="secondary-enter-region" disabled={focused.status === "locked"} onPress={() => onRegion(focused.region.id)}>{focused.region.label[locale]} · {ko ? "탐험 시작" : "EXPLORE"}</PixelButton>
    </> : <>
      <PixelButton variant="quiet" onPress={() => onRegion(undefined)}>← {ko ? "전체 지역 지도" : "REGION ATLAS"}</PixelButton>
      <Text accessibilityRole="header" style={styles.title}>{selected.region.label[locale]} · {selected.captured}/5</Text>
      <Image accessibilityLabel={selected.region.label[locale]} source={mobileAssetSource(selected.region.chapter.arena!.assetKey)} style={styles.regionArt} resizeMode="cover" />
      <Text style={styles.body}>{ko ? "한 종의 성장과 함께 원리 → 구현 → 진단 → 검증 → 통합을 배웁니다." : "Follow one species through discovery, implementation, diagnosis, verification and integration."}</Text>
      {path.map(({ monster, status }, index) => <View key={monster.id} style={styles.stage}>
        {status !== "locked" ? <Image accessibilityLabel={monster.name[locale]} source={mobileAssetSource(monster.assetKey)} style={styles.creature} resizeMode="contain" /> : <Text style={styles.title}>?</Text>}
        <Text style={styles.title}>No.{monster.dexNumber} · Lv.{monster.level} · {status === "locked" ? "???" : monster.name[locale]}{status === "cleared" ? " ✓" : ""}</Text>
        <Text style={styles.body}>{EVOLUTION_LESSON_PHASES[index][locale]}</Text>
        <PixelButton testID={`promotion-checkpoint-${monster.id}`} disabled={status === "locked"} onPress={() => onPractice(monster.id)}>{status === "cleared" ? (ko ? "학습 · 다시 도전" : "LEARN · REPLAY") : (ko ? "학습 자료 · 진화 배틀" : "LEARNING BRIEF · EVOLUTION BATTLE")}</PixelButton>
      </View>)}
      {onOpenSources && tools.length ? <PixelButton variant="quiet" onPress={() => onOpenSources(tools.map(({ id }) => id))}>{ko ? "연관 도구" : "RELATED TOOLS"} · {tools.map(({ name }) => name).join(" · ")}</PixelButton> : null}
    </>}
  </View>;
}
const styles = StyleSheet.create({
  panel: { ...pixelPanel, padding: 14, gap: 12, marginVertical: 8 },
  title: { color: colors.text, fontFamily: font, fontSize: 17, lineHeight: 25 },
  body: { color: colors.text, fontFamily: font, fontSize: 15, lineHeight: 23 },
  map: { width: "100%", aspectRatio: 16 / 9, overflow: "hidden", borderRadius: 8 },
  mapTarget: { position: "absolute", width: "22%", height: "24%", justifyContent: "center", alignItems: "center" },
  mapLabel: { backgroundColor: "#231c20df", color: "#fff2d5", fontFamily: font, fontSize: 10, textAlign: "center", padding: 4 },
  regionArt: { width: "100%", aspectRatio: 16 / 9 },
  stage: { gap: 8, paddingVertical: 10 }, creature: { width: 144, height: 144, alignSelf: "center" },
});
