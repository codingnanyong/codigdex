import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { isCommonPathComplete } from "@codigdex/game-content/domain/chapters";
import { CAREER_CATALOG, careerStatus, isCareerId } from "@codigdex/game-content/domain/careerDex";
import { JOB_OPTIONS, canSelectPrimaryJob, canSelectSecondaryJob, findSecondaryJob, findJob, type JobId, type SecondaryJobId } from "@codigdex/game-content/domain/player/jobs";
import { careerPathFor, completedCareerPathIds } from "@codigdex/game-content/domain/careerPaths";
import { careerRegionProgression } from "@codigdex/game-content/domain/careerRegionProgression";
import { careerCheckpoints, captureIds, normalizeGameSave } from "@codigdex/game-content/domain/gameProgress";
import { localize } from "@codigdex/game-core/i18n/locale";
import { useSave } from "../state/SaveProvider";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { colors, font, pixelPanel } from "../ui/theme";
import { promotionMissionFor, promotionChapterFor } from "@codigdex/game-content/domain/promotionChapters";
import { promotionCheckpoints } from "@codigdex/game-content/domain/gameProgress";
import { mobileAssetSource } from "../assets";
import { PixelScene } from "../ui/PixelScene";
import { openSourcesForRegion } from "@codigdex/game-content/domain/openSourceCatalog";
import { openSourcesForMonster } from "@codigdex/game-content/domain/openSourceLinks";

export function CareerScreen({ onBack, onBattle, onOpenSources, selectedRegionId, onRegionChange }: { onBack(): void; onBattle(id: string): void; onOpenSources?(ids: readonly string[]): void; selectedRegionId?: string; onRegionChange?(id: string | undefined): void }) {
  const { save, locale, selectJob, selectSecondaryJob } = useSave();
  const [localRegionId, setLocalRegionId] = useState<string>();
  const regionId = selectedRegionId ?? localRegionId;
  const setRegionId = (id: string | undefined) => { setLocalRegionId(id); onRegionChange?.(id); };
  const [confirmSecondary, setConfirmSecondary] = useState<SecondaryJobId>();
  const ko = locale === "ko";
  const captured = captureIds(save);
  const current = findJob(save.player.primaryJobId);
  const complete = completedCareerPathIds(captured);
  const commonComplete = isCommonPathComplete(captured);
  const normalized = normalizeGameSave(save);
  const careerDex = { careers: normalized.progress.careers.flatMap((record) => isCareerId(record.id) ? [{ ...record, id: record.id }] : []) };
  return <Screen scroll>
    <PixelButton testID="career-menu" onPress={onBack} variant="quiet">← {ko ? "메뉴" : "MENU"}</PixelButton>
    <Text testID="career-title" accessibilityRole="header" style={styles.heading}>{ko ? "전직 계보 · 직업 경로" : "CAREER LINEAGE · PATHS"}</Text>
    <Text style={styles.body}>{localize(current.name, locale)} · {ko ? "완성한 경로" : "Mastered paths"} {complete.size}/{JOB_OPTIONS.length}</Text>
    {!commonComplete ? <Text style={styles.hint}>{ko ? "튜토리얼 · Git · Linux 공통 경로를 완료하면 1차 전직이 열립니다." : "Complete Tutorial · Git · Linux to unlock primary careers."}</Text> : null}
    <View style={styles.panel}>
      {JOB_OPTIONS.map((job) => {
        const selectable = commonComplete && canSelectPrimaryJob(current.id, job.id, current.id !== "junior" && complete.has(current.id));
        return <View key={job.id} style={styles.item}>
          <Text style={styles.title}>{complete.has(job.id) ? "★ " : ""}{localize(job.name, locale)}{current.id === job.id ? (ko ? " · 현재" : " · ACTIVE") : ""}</Text>
          <Text style={styles.body}>{localize(job.tagline, locale)}</Text>
          <PixelButton testID={`career-select-${job.id}`} disabled={!selectable} onPress={() => { selectJob(job.id); setRegionId(undefined); }} variant={current.id === job.id ? "primary" : "secondary"}>{current.id === job.id ? (ko ? "현재 직업" : "CURRENT CAREER") : (ko ? "이 직업 선택" : "SELECT CAREER")}</PixelButton>
        </View>;
      })}
      {commonComplete && current.id !== "junior" && !complete.has(current.id) ? <Text style={styles.hint}>{ko ? "현재 경로를 모두 완료하면 다른 1차 직업을 선택할 수 있습니다." : "Finish the current path before choosing another primary career."}</Text> : null}
    </View>
    {confirmSecondary ? <View style={styles.panel}>
      <Text accessibilityRole="header" style={styles.title}>{localize(findSecondaryJob(confirmSecondary)!.name, locale)}</Text>
      <Image accessibilityLabel={localize(promotionChapterFor(confirmSecondary)!.npcName, locale)} source={mobileAssetSource(promotionMissionFor(confirmSecondary)!.guideAssetKey)} style={styles.guide} resizeMode="contain" />
      <Text style={styles.body}>{localize(promotionMissionFor(confirmSecondary)!.story.intro, locale)}</Text>
      <Text style={styles.hint}>{localize(promotionChapterFor(confirmSecondary)!.npcName, locale)}</Text>
      <PixelButton testID="promotion-confirm" onPress={() => { selectSecondaryJob(confirmSecondary); setConfirmSecondary(undefined); }}>{ko ? "전직하고 의뢰 시작" : "CONFIRM · START MISSION"}</PixelButton>
      <PixelButton onPress={() => setConfirmSecondary(undefined)} variant="quiet">{ko ? "나중에" : "LATER"}</PixelButton>
    </View> : null}
    {save.player.secondaryJobId && promotionChapterFor(save.player.secondaryJobId) ? <PromotionMission onBattle={onBattle} onOpenSources={onOpenSources} /> : current.id !== "junior" ? <CareerRegions jobId={current.id} regionId={regionId} onRegion={setRegionId} onBattle={onBattle} onOpenSources={onOpenSources} /> : null}
    <Text style={styles.heading}>{ko ? "상위 직업 도감" : "HIGHER CAREER DEX"}</Text>
    {CAREER_CATALOG.filter(({ tier }) => tier >= 2).map((entry) => {
      const status = careerStatus(careerDex, entry.id);
      return <View key={entry.id} style={styles.item}>
        <Text style={styles.title}>{entry.tier} · {status === "locked" ? "???" : localize(entry.name, locale)}</Text>
        <Text style={styles.hint}>{status === "locked" ? (ko ? "선행 직업 경로를 완성하면 공개됩니다." : "Revealed after mastering the required careers.") : promotionChapterFor(entry.id) ? `${localize(promotionChapterFor(entry.id)!.name, locale)} · ${ko ? "다섯 의뢰를 이어 가세요." : "Follow five linked missions."}` : (ko ? "공개 완료 · 상위 직업의 플레이 콘텐츠는 준비 중입니다." : "Revealed · playable higher-career content is being prepared.")}</Text>
        {entry.tier === 2 && commonComplete && canSelectSecondaryJob(findSecondaryJob(entry.id)!, complete) ? <PixelButton testID={`promotion-select-${entry.id}`} onPress={() => setConfirmSecondary(entry.id as SecondaryJobId)}>{save.player.secondaryJobId === entry.id ? (ko ? "전직 의뢰 다시 보기" : "REVIEW PROMOTION MISSION") : (ko ? "전직 의뢰 보기" : "VIEW PROMOTION MISSION")}</PixelButton> : null}
      </View>;
    })}
  </Screen>;
}

function PromotionMission({ onBattle, onOpenSources }: { onBattle(id: string): void; onOpenSources?(ids: readonly string[]): void }) {
  const { save, locale } = useSave();
  const chapter = promotionChapterFor(save.player.secondaryJobId)!;
  const mission = promotionMissionFor(save.player.secondaryJobId)!;
  const path = promotionCheckpoints(save);
  const complete = path.length > 0 && path.every(({ status }) => status === "cleared");
  const active = path.find(({ status }) => status === "available");
  const ko = locale === "ko";
  return <View style={styles.panel}>
    <Text testID="promotion-chapter-title" accessibilityRole="header" style={styles.heading}>{chapter.label} · {localize(chapter.name, locale)}</Text>
    <PixelScene scene={mission.scenery} height={160} />
    <Image accessibilityLabel={localize(chapter.npcName, locale)} source={mobileAssetSource(mission.guideAssetKey)} style={styles.guide} resizeMode="contain" />
    <Text style={styles.title}>{localize(chapter.npcName, locale)}</Text>
    <Text testID="promotion-story" style={styles.body}>{localize(complete ? mission.story.ending : active?.monster.briefing ?? mission.story.intro, locale)}</Text>
    <Text style={styles.hint}>{complete ? (ko ? "★ 경로 MASTER · 3차 챕터는 준비 중입니다." : "★ PATH MASTER · Tier-three chapter coming later.") : `${path.filter(({ status }) => status === "cleared").length}/5`}</Text>
    {path.map(({ monster, status }) => <View key={monster.id} style={styles.item}>
      {status !== "locked" ? <Image accessibilityLabel={localize(monster.name, locale)} source={mobileAssetSource(monster.assetKey)} style={styles.creature} resizeMode="contain" /> : null}
      <Text style={styles.title}>Lv.{monster.level} · {status === "locked" ? "???" : localize(monster.name, locale)}{status === "cleared" ? " ✓" : ""}</Text>
      {status !== "locked" ? <Text style={styles.body}>{localize(monster.classification, locale)}</Text> : null}
      {status !== "locked" && onOpenSources ? <PixelButton compact variant="quiet" onPress={() => onOpenSources(openSourcesForMonster(monster.id).map(({ id }) => id))}>{ko ? "연관 도구" : "RELATED TOOLS"} · {openSourcesForMonster(monster.id).map(({ name }) => name).join(" · ")}</PixelButton> : null}
      <PixelButton testID={`promotion-checkpoint-${monster.id}`} disabled={status === "locked"} onPress={() => onBattle(monster.id)} variant={status === "cleared" ? "secondary" : "primary"}>{status === "cleared" ? (ko ? "다시 도전" : "REPLAY") : status === "locked" ? (ko ? "이전 의뢰 완료 후 해금" : "FINISH THE PREVIOUS MISSION") : (ko ? "배틀 시작" : "START BATTLE")}</PixelButton>
    </View>)}
  </View>;
}

function CareerRegions({ jobId, regionId, onRegion, onBattle, onOpenSources }: { jobId: JobId; regionId?: string; onRegion(id: string): void; onBattle(id: string): void; onOpenSources?(ids: readonly string[]): void }) {
  const { save, locale } = useSave();
  const ko = locale === "ko";
  const path = careerPathFor(jobId);
  const progression = careerRegionProgression(path, captureIds(save));
  const bookmarked = careerCheckpoints(save, jobId).find(({ monster, status }) => monster.id === save.ui.checkpointId && status !== "locked");
  const selected = progression.find(({ region }) => region.id === regionId)
    ?? progression.find(({ region }) => bookmarked?.chapter.id === `career:${region.id}`)
    ?? progression.find(({ status }) => status === "available") ?? progression[0];
  return <>
    <Text style={styles.heading}>{localize(path.title, locale)}</Text>
    <View style={styles.panel}>
      {progression.map(({ region, status }) => <PixelButton testID={`career-region-${region.id}`} key={region.id} disabled={status === "locked"} onPress={() => onRegion(region.id)} variant={region.id === selected.region.id ? "primary" : "secondary"}>{status === "completed" ? "✓ " : status === "locked" ? "🔒 " : ""}{localize(region.label, locale)}</PixelButton>)}
    </View>
    <View style={styles.panel}>
      <Text style={styles.title}>{localize(selected.region.label, locale)}</Text>
      {onOpenSources && openSourcesForRegion(selected.region.id, jobId).length > 0 ? <PixelButton testID="career-region-open-source" compact variant="quiet" onPress={() => onOpenSources(openSourcesForRegion(selected.region.id, jobId).map(({ id }) => id))}>{ko ? "관련 오픈소스" : "RELATED OPEN SOURCE"} · {openSourcesForRegion(selected.region.id, jobId).length}</PixelButton> : null}
      {careerCheckpoints(save, jobId).filter(({ chapter }) => chapter.id === `career:${selected.region.id}`).map(({ monster, status }) => <PixelButton testID={`career-checkpoint-${monster.id}`} key={monster.id} disabled={status === "locked"} onPress={() => onBattle(monster.id)} variant={status === "cleared" ? "secondary" : "primary"}>Lv.{monster.level} · {status === "locked" ? "???" : localize(monster.name, locale)}{status === "cleared" ? " ✓" : ""}</PixelButton>)}
      <Text style={styles.hint}>{ko ? "포획 후 이 경로로 돌아옵니다. 완료한 체크포인트는 다시 도전할 수 있습니다." : "Return here after capture. Cleared checkpoints can be replayed."}</Text>
    </View>
  </>;
}

const styles = StyleSheet.create({
  guide: { width: 128, height: 128, alignSelf: "center" },
  creature: { width: 128, height: 128 },
  heading: { color: colors.text, fontFamily: font, fontSize: 22, marginVertical: 14 },
  title: { color: colors.text, fontFamily: font, fontSize: 17, lineHeight: 25 },
  body: { color: colors.text, fontFamily: font, fontSize: 15, lineHeight: 23 },
  hint: { color: colors.muted, fontFamily: font, fontSize: 15, lineHeight: 23 },
  panel: { ...pixelPanel, padding: 14, gap: 12, marginVertical: 8 },
  item: { gap: 8, paddingVertical: 10 },
});
