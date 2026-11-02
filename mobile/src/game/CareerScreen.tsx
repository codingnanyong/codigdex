import { useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { isCommonPathComplete } from "@codigdex/game-content/domain/chapters";
import { CAREER_CATALOG, careerStatus, isCareerId } from "@codigdex/game-content/domain/careerDex";
import { JOB_OPTIONS, canSelectSecondaryJob, findSecondaryJob, findJob, TERTIARY_JOB_OPTIONS, findTertiaryJob, type JobId, type SecondaryJobId } from "@codigdex/game-content/domain/player/jobs";
import { careerPathFor, completedCareerPathIds } from "@codigdex/game-content/domain/careerPaths";
import { careerRegionProgression } from "@codigdex/game-content/domain/careerRegionProgression";
import { careerCheckpoints, captureIds, normalizeGameSave, hasEarnedSecondaryCareer, canStudyPrimaryCareer } from "@codigdex/game-content/domain/gameProgress";
import { localize } from "@codigdex/game-core/i18n/locale";
import { useSave } from "../state/SaveProvider";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { colors, font, pixelPanel } from "../ui/theme";
import { promotionMissionFor, promotionChapterFor } from "@codigdex/game-content/domain/promotionChapters";
import { promotionCheckpoints, canStartMasterProject, masterCheckpoints, isFinalProjectComplete } from "@codigdex/game-content/domain/gameProgress";
import { masterMissionFor, masterChapterFor } from "@codigdex/game-content/domain/masterChapters";
import { CareerWorkshop } from "./CareerWorkshop";
import { SecondaryExploration } from "./SecondaryExploration";
import { mobileAssetSource } from "../assets";
import { openSourcesForRegion } from "@codigdex/game-content/domain/openSourceCatalog";
import { discoveredSourceIds } from "@codigdex/game-content/domain/openSourceEncounters";

export function CareerScreen({ onBack, onBattle, onOpenSources, selectedRegionId, onRegionChange }: { onBack(): void; onBattle(id: string): void; onOpenSources?(ids: readonly string[]): void; selectedRegionId?: string; onRegionChange?(id: string | undefined): void }) {
  const { save, locale, selectJob, selectSecondaryJob, saveError, retrySave } = useSave();
  const [localRegionId, setLocalRegionId] = useState<string>();
  const regionId = selectedRegionId ?? localRegionId;
  const setRegionId = (id: string | undefined) => { setLocalRegionId(id); onRegionChange?.(id); };
  const [confirmSecondary, setConfirmSecondary] = useState<SecondaryJobId>();
  const [workshop, setWorkshop] = useState<{ jobId: string; stageId: string }>();
  if (workshop) return <CareerWorkshop {...workshop} onBack={() => setWorkshop(undefined)} onBattle={onBattle} />;
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
    {saveError ? <><Text accessibilityRole="alert" style={styles.hint}>{ko ? "진행 또는 의뢰 기록을 저장하지 못했습니다. 종료 전에 다시 저장하세요." : "Could not save progress or request history. Retry before closing."}</Text><PixelButton testID="career-retry-save" onPress={retrySave}>{ko ? "다시 저장" : "RETRY SAVE"}</PixelButton></> : null}
    {hasEarnedSecondaryCareer(save) ? <Text style={styles.title}>{ko ? "현재 직업" : "CURRENT CAREER"} · {localize((findTertiaryJob(save.player.tertiaryJobId) ?? findSecondaryJob(save.player.secondaryJobId))!.name, locale)}</Text> : null}
    <Text style={styles.body}>{localize(current.name, locale)} · {ko ? "완성한 경로" : "Mastered paths"} {complete.size}/{JOB_OPTIONS.length}</Text>
    {hasEarnedSecondaryCareer(save) && promotionCheckpoints(save).some(({ status }) => status !== "cleared") ? <Text style={styles.hint}>{ko ? "현재 2차 경로를 완료하면 미완료 1차 경로를 시작할 수 있습니다. 완료한 1차 경로는 다시 방문할 수 있습니다." : "Finish the current tier-two path to start unfinished primary paths. Completed primary paths remain available for replay."}</Text> : null}
    {!commonComplete ? <Text style={styles.hint}>{ko ? "튜토리얼 · Git · Linux 공통 경로를 완료하면 1차 전직이 열립니다." : "Complete Tutorial · Git · Linux to unlock primary careers."}</Text> : null}
    <View style={styles.panel}>
      {JOB_OPTIONS.map((job) => {
        const selectable = canStudyPrimaryCareer(save, job.id);
        return <View key={job.id} style={styles.item}>
          <Text style={styles.title}>{complete.has(job.id) ? "★ " : ""}{localize(job.name, locale)}{current.id === job.id ? (hasEarnedSecondaryCareer(save) ? (ko ? " · 학습 경로" : " · STUDY PATH") : (ko ? " · 현재" : " · ACTIVE")) : ""}</Text>
          <Text style={styles.body}>{localize(job.tagline, locale)}</Text>
          <PixelButton testID={`career-select-${job.id}`} disabled={!selectable} onPress={() => { selectJob(job.id); setRegionId(undefined); }} variant={current.id === job.id ? "primary" : "secondary"}>{current.id === job.id ? (hasEarnedSecondaryCareer(save) ? (ko ? "현재 학습 경로" : "CURRENT STUDY PATH") : (ko ? "현재 직업" : "CURRENT CAREER")) : (hasEarnedSecondaryCareer(save) ? (ko ? "이 경로 학습" : "STUDY THIS PATH") : (ko ? "이 직업 선택" : "SELECT CAREER"))}</PixelButton>
        </View>;
      })}
      {commonComplete && !hasEarnedSecondaryCareer(save) && current.id !== "junior" && !complete.has(current.id) ? <Text style={styles.hint}>{ko ? "현재 경로를 모두 완료하면 다른 1차 직업을 선택할 수 있습니다." : "Finish the current path before choosing another primary career."}</Text> : null}
    </View>
    {confirmSecondary ? <View style={styles.panel}>
      <Text accessibilityRole="header" style={styles.title}>{localize(findSecondaryJob(confirmSecondary)!.name, locale)}</Text>
      <Image accessibilityLabel={localize(promotionChapterFor(confirmSecondary)!.npcName, locale)} source={mobileAssetSource(promotionMissionFor(confirmSecondary)!.guideAssetKey)} style={styles.guide} resizeMode="contain" />
      <Text style={styles.body}>{localize(promotionMissionFor(confirmSecondary)!.story.intro, locale)}</Text>
      <Text style={styles.hint}>{localize(promotionChapterFor(confirmSecondary)!.npcName, locale)}</Text>
      <PixelButton testID="promotion-confirm" onPress={() => { selectSecondaryJob(confirmSecondary); setConfirmSecondary(undefined); }}>{ko ? "전직하고 의뢰 시작" : "CONFIRM · START MISSION"}</PixelButton>
      <PixelButton onPress={() => setConfirmSecondary(undefined)} variant="quiet">{ko ? "나중에" : "LATER"}</PixelButton>
    </View> : null}
    {save.player.secondaryJobId && promotionChapterFor(save.player.secondaryJobId) ? <SecondaryExploration regionId={regionId} onRegion={setRegionId} onPractice={(stageId) => setWorkshop({ jobId: save.player.secondaryJobId!, stageId })} onOpenSources={onOpenSources} /> : null}
    <MasterMission onPractice={(jobId, stageId) => setWorkshop({ jobId, stageId })} onBattle={onBattle} />
    {current.id !== "junior" ? <CareerRegions jobId={current.id} regionId={regionId} onRegion={setRegionId} onBattle={onBattle} onOpenSources={onOpenSources} /> : null}
    <Text style={styles.heading}>{ko ? "상위 직업 도감" : "HIGHER CAREER DEX"}</Text>
    {CAREER_CATALOG.filter(({ tier }) => tier >= 2).map((entry) => {
      const status = careerStatus(careerDex, entry.id);
      return <View key={entry.id} style={styles.item}>
        <Text style={styles.title}>{entry.tier} · {status === "locked" ? "???" : localize(entry.name, locale)}</Text>
        <Text style={styles.hint}>{status === "locked" ? (ko ? "선행 직업 경로를 완성하면 공개됩니다." : "Revealed after mastering the required careers.") : promotionChapterFor(entry.id) ? `${localize(promotionChapterFor(entry.id)!.name, locale)} · ${ko ? "구역별 실습과 다섯 의뢰를 이어 가세요." : "Follow regional practice and five linked missions."}` : (ko ? "2차 MASTER·구역 실습 완료 → 최종 설계 프로젝트 → 3차 전직" : "Tier-two MASTER + regional practice → final design project → tier three")}</Text>
        {entry.tier === 2 && commonComplete && canSelectSecondaryJob(findSecondaryJob(entry.id)!, complete) ? <PixelButton testID={`promotion-select-${entry.id}`} onPress={() => setConfirmSecondary(entry.id as SecondaryJobId)}>{save.player.secondaryJobId === entry.id ? (ko ? "전직 의뢰 다시 보기" : "REVIEW PROMOTION MISSION") : (ko ? "전직 의뢰 보기" : "VIEW PROMOTION MISSION")}</PixelButton> : null}
      </View>;
    })}
  </Screen>;
}

function MasterMission({ onPractice, onBattle }: { onPractice(jobId: string, stageId: string): void; onBattle(id: string): void }) {
  const { save, locale, selectTertiaryJob } = useSave();
  const job = TERTIARY_JOB_OPTIONS.find(({ requires }) => requires === save.player.secondaryJobId);
  if (!job || !canStartMasterProject(save, job.id)) return null;
  const ko = locale === "ko";
  const mission = masterMissionFor(job.id)!;
  const complete = isFinalProjectComplete(save, job.id);
  return <View style={styles.panel}>
    <Text testID="master-chapter-title" accessibilityRole="header" style={styles.heading}>{masterChapterFor(job.id)!.label} · {mission.chapter.name[locale]}</Text>
    <Text style={styles.title}>{findTertiaryJob(job.id)!.name[locale]}</Text>
    <Text style={styles.body}>{save.player.tertiaryJobId === job.id ? (ko ? "3차 전직을 확정했습니다. 완료한 설계 의뢰는 다시 검증할 수 있습니다." : "Your tier-three career is confirmed. Completed design milestones remain available for review.") : (complete ? mission.story.ending : mission.story.intro)[locale]}</Text>
    {masterCheckpoints(save).map(({ monster, status }) => <View key={monster.id} style={styles.item}>
      <Text style={styles.title}>{status === "cleared" ? "✓ " : ""}{status === "locked" ? "???" : monster.name[locale]}</Text>
      <PixelButton testID={`master-checkpoint-${monster.id}`} disabled={status === "locked"} onPress={() => status === "cleared" ? onBattle(monster.id) : onPractice(job.id, monster.id)}>{status === "cleared" ? (ko ? "다시 검증" : "VERIFY AGAIN") : (ko ? "설계 자료·프로젝트 검증" : "DESIGN BRIEF · VERIFY")}</PixelButton>
    </View>)}
    {complete && save.player.tertiaryJobId !== job.id ? <PixelButton testID="master-confirm" onPress={() => selectTertiaryJob(job.id)}>{ko ? "3차 전직 확정" : "CONFIRM TIER THREE"}</PixelButton> : null}
    {save.player.tertiaryJobId === job.id ? <Text testID="master-active" style={styles.title}>★ {job.name[locale]} · MASTER</Text> : null}
  </View>;
}

function CareerRegions({ jobId, regionId, onRegion, onBattle, onOpenSources }: { jobId: JobId; regionId?: string; onRegion(id: string): void; onBattle(id: string): void; onOpenSources?(ids: readonly string[]): void }) {
  const { save, locale, sourceHistory } = useSave();
  const discovered = discoveredSourceIds(save, sourceHistory);
  const ko = locale === "ko";
  const path = careerPathFor(jobId);
  const progression = careerRegionProgression(path, captureIds(save));
  const bookmarked = careerCheckpoints(save, jobId).find(({ monster, status }) => monster.id === save.ui.checkpointId && status !== "locked");
  const selected = progression.find(({ region }) => region.id === regionId)
    ?? progression.find(({ region }) => bookmarked?.chapter.id === `career:${region.id}`)
    ?? progression.find(({ status }) => status === "available") ?? progression[0];
  const related = openSourcesForRegion(selected.region.id, jobId).filter(({ id }) => discovered.has(id));
  return <>
    <Text style={styles.heading}>{localize(path.title, locale)}</Text>
    <View style={styles.panel}>
      {progression.map(({ region, status }) => <PixelButton testID={`career-region-${region.id}`} key={region.id} disabled={status === "locked"} onPress={() => onRegion(region.id)} variant={region.id === selected.region.id ? "primary" : "secondary"}>{status === "completed" ? "✓ " : status === "locked" ? "🔒 " : ""}{localize(region.label, locale)}</PixelButton>)}
    </View>
    <View style={styles.panel}>
      <Text style={styles.title}>{localize(selected.region.label, locale)}</Text>
      {onOpenSources && related.length > 0 ? <PixelButton testID="career-region-open-source" compact variant="quiet" onPress={() => onOpenSources(related.map(({ id }) => id))}>{ko ? "관련 오픈소스" : "RELATED OPEN SOURCE"} · {related.length}</PixelButton> : null}
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
