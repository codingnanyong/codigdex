import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { isCommonPathComplete } from "@codigdex/game-content/domain/chapters";
import { CAREER_CATALOG, careerStatus, isCareerId } from "@codigdex/game-content/domain/careerDex";
import { JOB_OPTIONS, canSelectPrimaryJob, findJob, type JobId } from "@codigdex/game-content/domain/player/jobs";
import { careerPathFor, completedCareerPathIds } from "@codigdex/game-content/domain/careerPaths";
import { careerRegionProgression } from "@codigdex/game-content/domain/careerRegionProgression";
import { careerCheckpoints, captureIds, normalizeGameSave } from "@codigdex/game-content/domain/gameProgress";
import { localize } from "@codigdex/game-core/i18n/locale";
import { useSave } from "../state/SaveProvider";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { colors, font, pixelPanel } from "../ui/theme";

export function CareerScreen({ onBack, onBattle }: { onBack(): void; onBattle(id: string): void }) {
  const { save, locale, selectJob } = useSave();
  const [regionId, setRegionId] = useState<string>();
  const ko = locale === "ko";
  const captured = captureIds(save);
  const current = findJob(save.player.primaryJobId);
  const complete = completedCareerPathIds(captured);
  const commonComplete = isCommonPathComplete(captured);
  const normalized = normalizeGameSave(save);
  const careerDex = { careers: normalized.progress.careers.flatMap((record) => isCareerId(record.id) ? [{ ...record, id: record.id }] : []) };
  return <Screen scroll>
    <PixelButton onPress={onBack} variant="quiet">← {ko ? "메뉴" : "MENU"}</PixelButton>
    <Text accessibilityRole="header" style={styles.heading}>{ko ? "전직 계보 · 직업 경로" : "CAREER LINEAGE · PATHS"}</Text>
    <Text style={styles.body}>{localize(current.name, locale)} · {ko ? "완성한 경로" : "Mastered paths"} {complete.size}/{JOB_OPTIONS.length}</Text>
    {!commonComplete ? <Text style={styles.hint}>{ko ? "튜토리얼 · Git · Linux 공통 경로를 완료하면 1차 전직이 열립니다." : "Complete Tutorial · Git · Linux to unlock primary careers."}</Text> : null}
    <View style={styles.panel}>
      {JOB_OPTIONS.map((job) => {
        const selectable = commonComplete && canSelectPrimaryJob(current.id, job.id, current.id !== "junior" && complete.has(current.id));
        return <View key={job.id} style={styles.item}>
          <Text style={styles.title}>{complete.has(job.id) ? "★ " : ""}{localize(job.name, locale)}{current.id === job.id ? (ko ? " · 현재" : " · ACTIVE") : ""}</Text>
          <Text style={styles.body}>{localize(job.tagline, locale)}</Text>
          <PixelButton disabled={!selectable} onPress={() => { selectJob(job.id); setRegionId(undefined); }} variant={current.id === job.id ? "primary" : "secondary"}>{current.id === job.id ? (ko ? "현재 직업" : "CURRENT CAREER") : (ko ? "이 직업 선택" : "SELECT CAREER")}</PixelButton>
        </View>;
      })}
      {commonComplete && current.id !== "junior" && !complete.has(current.id) ? <Text style={styles.hint}>{ko ? "현재 경로를 모두 완료하면 다른 1차 직업을 선택할 수 있습니다." : "Finish the current path before choosing another primary career."}</Text> : null}
    </View>
    {current.id !== "junior" ? <CareerRegions jobId={current.id} regionId={regionId} onRegion={setRegionId} onBattle={onBattle} /> : null}
    <Text style={styles.heading}>{ko ? "상위 직업 도감" : "HIGHER CAREER DEX"}</Text>
    {CAREER_CATALOG.filter(({ tier }) => tier >= 2).map((entry) => {
      const status = careerStatus(careerDex, entry.id);
      return <View key={entry.id} style={styles.item}>
        <Text style={styles.title}>{entry.tier} · {status === "locked" ? "???" : localize(entry.name, locale)}</Text>
        <Text style={styles.hint}>{status === "locked" ? (ko ? "선행 직업 경로를 완성하면 공개됩니다." : "Revealed after mastering the required careers.") : (ko ? "공개 완료 · 상위 직업의 플레이 콘텐츠는 준비 중입니다." : "Revealed · playable higher-career content is being prepared.")}</Text>
      </View>;
    })}
  </Screen>;
}

function CareerRegions({ jobId, regionId, onRegion, onBattle }: { jobId: JobId; regionId?: string; onRegion(id: string): void; onBattle(id: string): void }) {
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
      {progression.map(({ region, status }) => <PixelButton key={region.id} disabled={status === "locked"} onPress={() => onRegion(region.id)} variant={region.id === selected.region.id ? "primary" : "secondary"}>{status === "completed" ? "✓ " : status === "locked" ? "🔒 " : ""}{localize(region.label, locale)}</PixelButton>)}
    </View>
    <View style={styles.panel}>
      <Text style={styles.title}>{localize(selected.region.label, locale)}</Text>
      {careerCheckpoints(save, jobId).filter(({ chapter }) => chapter.id === `career:${selected.region.id}`).map(({ monster, status }) => <PixelButton key={monster.id} disabled={status === "locked"} onPress={() => onBattle(monster.id)} variant={status === "cleared" ? "secondary" : "primary"}>Lv.{monster.level} · {status === "locked" ? "???" : localize(monster.name, locale)}{status === "cleared" ? " ✓" : ""}</PixelButton>)}
      <Text style={styles.hint}>{ko ? "포획 후 이 경로로 돌아옵니다. 완료한 체크포인트는 다시 도전할 수 있습니다." : "Return here after capture. Cleared checkpoints can be replayed."}</Text>
    </View>
  </>;
}

const styles = StyleSheet.create({
  heading: { color: colors.text, fontFamily: font, fontSize: 22, marginVertical: 14 },
  title: { color: colors.text, fontFamily: font, fontSize: 17, lineHeight: 25 },
  body: { color: colors.text, fontFamily: font, fontSize: 15, lineHeight: 23 },
  hint: { color: colors.muted, fontFamily: font, fontSize: 15, lineHeight: 23 },
  panel: { ...pixelPanel, padding: 14, gap: 12, marginVertical: 8 },
  item: { gap: 8, paddingVertical: 10 },
});
