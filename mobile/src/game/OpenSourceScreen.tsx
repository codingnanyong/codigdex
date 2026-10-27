import { useState } from "react";
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { localize, type Locale } from "@codigdex/game-core/i18n/locale";
import { OPEN_SOURCE_CATALOG, OPEN_SOURCE_FAMILIES, OPEN_SOURCE_KIND_LABELS, filterOpenSources, findOpenSource, type OpenSourceFamily } from "@codigdex/game-content/domain/openSourceCatalog";
import { JOB_OPTIONS, type JobId } from "@codigdex/game-content/domain/player/jobs";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { colors, font, pixelPanel } from "../ui/theme";
import { mobileAssetSource } from "../assets";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { openSourceCheckpoints } from "@codigdex/game-content/domain/gameProgress";
import { openSourceExpeditionFor } from "@codigdex/game-content/domain/openSourceChapters";

export function OpenSourceScreen({ locale, save, initialIds, onBack, onBattle }: { locale: Locale; save: StoredGameStateV3; initialIds?: readonly string[]; onBack(): void; onBattle(id: string): void }) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<OpenSourceFamily>();
  const [jobId, setJobId] = useState<JobId>();
  const [ids, setIds] = useState(initialIds);
  const ko = locale === "ko";
  const entries = filterOpenSources({ query, family, jobId, ids });
  const checkpoints = openSourceCheckpoints(save);
  return <Screen scroll>
    <PixelButton testID="open-source-back" onPress={onBack} variant="quiet">← {ko ? "돌아가기" : "BACK"}</PixelButton>
    <Text accessibilityRole="header" style={styles.heading}>{ko ? "오픈소스 탐험 노트" : "OPEN-SOURCE FIELD NOTES"}</Text>
    <Text style={styles.body}>{ko ? "9개 생태계의 이야기를 따라 38종을 포획하세요. 공통 경로 완료 후 열리며 전직 MASTER 조건에는 영향을 주지 않습니다." : "Follow 9 ecosystem stories and capture 38 creatures. Opens after the common path; career MASTER requirements stay the same."}</Text>
    <TextInput testID="open-source-search" accessibilityLabel={ko ? "오픈소스 검색" : "Search open source"} placeholder={ko ? "Kafka, 하둡, 계보…" : "Kafka, Hadoop, lineage…"} placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} autoCapitalize="none" autoCorrect={false} style={styles.input} />
    <ScrollView horizontal contentContainerStyle={styles.filters} showsHorizontalScrollIndicator>
      <PixelButton compact onPress={() => setFamily(undefined)} variant={!family ? "primary" : "secondary"}>{ko ? "모든 생태계" : "All ecosystems"}</PixelButton>
      {Object.entries(OPEN_SOURCE_FAMILIES).map(([id, copy]) => <PixelButton compact key={id} onPress={() => setFamily(id as OpenSourceFamily)} variant={family === id ? "primary" : "secondary"}>{localize(copy, locale)}</PixelButton>)}
    </ScrollView>
    <ScrollView horizontal contentContainerStyle={styles.filters} showsHorizontalScrollIndicator>
      <PixelButton compact onPress={() => setJobId(undefined)} variant={!jobId ? "primary" : "secondary"}>{ko ? "모든 경로" : "All paths"}</PixelButton>
      {JOB_OPTIONS.map((job) => <PixelButton compact key={job.id} onPress={() => setJobId(job.id)} variant={jobId === job.id ? "primary" : "secondary"}>{localize(job.name, locale)}</PixelButton>)}
    </ScrollView>
    <PixelButton compact variant="quiet" onPress={() => { setQuery(""); setFamily(undefined); setJobId(undefined); setIds(undefined); }}>{ko ? "전체 보기" : "SHOW ALL"}</PixelButton>
    <Text testID="open-source-count" accessibilityLiveRegion="polite" style={styles.count}>{entries.length}/{OPEN_SOURCE_CATALOG.length} · {ids ? (ko ? "현재 의뢰의 관련 도구" : "Tools related to this mission") : (ko ? "프로젝트·구성요소·데이터 형식" : "Projects, components and data formats")}</Text>
    {!entries.length ? <Text style={styles.body}>{ko ? "조건에 맞는 도구가 없습니다. 검색이나 필터를 바꿔 보세요." : "No matching tools. Try changing the search or filters."}</Text> : null}
    {entries.map((entry) => {
      const checkpoint = checkpoints.find(({ monster }) => monster.id === `open-source:${entry.id}`)!;
      const expedition = openSourceExpeditionFor(entry.family)!;
      const complete = expedition.chapter.stages.every(({ id }) => save.progress.captures.some((capture) => capture.id === id));
      return <View testID={`open-source-${entry.id}`} key={entry.id} style={styles.card}>
      <Text style={styles.muted}>{localize(OPEN_SOURCE_FAMILIES[entry.family], locale)} · {localize(OPEN_SOURCE_KIND_LABELS[entry.kind], locale)}</Text>
      {entry.character.assetKey ? <Image accessibilityLabel={localize(entry.character.name, locale)} source={mobileAssetSource(entry.character.assetKey)} resizeMode="contain" style={styles.character} /> : null}
      <Text accessibilityRole="header" style={styles.title}>{entry.name}</Text>
      {entry.parentId ? <Text style={styles.muted}>{ko ? "구성요소:" : "Component of:"} {findOpenSource(entry.parentId)!.name}</Text> : null}
      <Text style={styles.body}>{localize(entry.role, locale)}</Text>
      <Text style={styles.learning}>{localize(entry.learning, locale)}</Text>
      <Text style={styles.title}>{localize(entry.character.name, locale)}</Text>
      <Text style={styles.body}>{localize(entry.character.motif, locale)}</Text>
      <Text style={styles.title}>{localize(expedition.chapter.name, locale)}</Text>
      <Text style={styles.body}>{localize(complete ? expedition.ending : expedition.intro, locale)}</Text>
      <Text style={styles.muted}>{checkpoint.status === "cleared" ? (ko ? "✓ 도감 등록 완료" : "✓ REGISTERED IN DEX") : checkpoint.status === "locked" ? (ko ? "공통 경로와 이 생태계의 선행 의뢰를 완료하세요." : "Complete the common path and earlier missions in this ecosystem.") : (ko ? "4문항 중 3문항 정답으로 포획" : "Capture with 3 of 4 correct")}</Text>
      <PixelButton testID={`source-battle-${entry.id}`} disabled={checkpoint.status === "locked"} onPress={() => onBattle(checkpoint.monster.id)}>{checkpoint.status === "cleared" ? (ko ? "의뢰 다시 도전" : "REPLAY MISSION") : (ko ? "의뢰 배틀 시작" : "START MISSION BATTLE")}</PixelButton>
      <PixelButton compact accessibilityLabel={`${entry.name} · ${ko ? "공식 프로젝트 자료" : "Official project documentation"}`} variant="quiet" onPress={() => { void Linking.openURL(entry.officialUrl).catch(() => Alert.alert(ko ? "자료를 열지 못했습니다." : "Could not open documentation.")); }}>{ko ? "공식 프로젝트 자료 ↗" : "OFFICIAL DOCUMENTATION ↗"}</PixelButton>
    </View>; })}
  </Screen>;
}

const styles = StyleSheet.create({
  heading: { fontFamily: font, color: colors.amber, fontSize: 24, lineHeight: 32, marginVertical: 14 },
  character: { width: 192, height: 192, alignSelf: "center" },
  title: { fontFamily: font, color: colors.amber, fontSize: 19, lineHeight: 27 },
  body: { fontFamily: font, color: colors.text, fontSize: 16, lineHeight: 24 },
  muted: { fontFamily: font, color: colors.muted, fontSize: 14, lineHeight: 22 },
  count: { fontFamily: font, color: colors.muted, fontSize: 15, lineHeight: 23, marginVertical: 12 },
  input: { ...pixelPanel, fontFamily: font, color: colors.text, fontSize: 16, padding: 12, minHeight: 48, marginVertical: 12 },
  filters: { gap: 8, paddingVertical: 8 },
  card: { ...pixelPanel, padding: 16, gap: 10, marginBottom: 14 },
  learning: { fontFamily: font, color: colors.text, fontSize: 16, lineHeight: 24, padding: 8, backgroundColor: colors.panelRaised },
});
