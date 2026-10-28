import { useState } from "react";
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { localize, type Locale } from "@codigdex/game-core/i18n/locale";
import { OPEN_SOURCE_FAMILIES, OPEN_SOURCE_KIND_LABELS, filterOpenSources, findOpenSource, type OpenSourceFamily } from "@codigdex/game-content/domain/openSourceCatalog";
import { JOB_OPTIONS } from "@codigdex/game-content/domain/player/jobs";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { colors, font, pixelPanel } from "../ui/theme";
import { mobileAssetSource } from "../assets";
import type { StoredGameStateV3 } from "@codigdex/game-core/save/schema";
import { SOURCE_CAREERS, activeSourceCareer, discoveredSourceIds, emptyEncounterHistory, encounterTools, sourceCareer, sourceCareerName, type SourceEncounterHistory, type SourceCareerId } from "@codigdex/game-content/domain/openSourceEncounters";

export function OpenSourceScreen({ locale, save, initialIds, onBack, history = emptyEncounterHistory() }: { locale: Locale; save: StoredGameStateV3; initialIds?: readonly string[]; history?: SourceEncounterHistory; onBack(): void }) {
  const [query, setQuery] = useState("");
  const [family, setFamily] = useState<OpenSourceFamily>();
  const [jobId, setJobId] = useState<SourceCareerId>();
  const [ids, setIds] = useState(initialIds);
  const ko = locale === "ko";
  const discovered = discoveredSourceIds(save, history);
  const roleTools = jobId ? new Set(encounterTools(jobId).map(({ id }) => id)) : undefined;
  const entries = filterOpenSources({ query, family, ids }).filter(({ id }) => discovered.has(id) && (!roleTools || roleTools.has(id)));
  return <Screen scroll>
    <PixelButton testID="open-source-back" onPress={onBack} variant="quiet">← {ko ? "돌아가기" : "BACK"}</PixelButton>
    <Text accessibilityRole="header" style={styles.heading}>{ko ? "발견한 오픈소스 노트" : "OPEN-SOURCE FIELD NOTES"}</Text>
    <Text style={styles.body}>{ko ? "직무 전투 뒤 돌발 의뢰로 만난 도구를 복습합니다. 해결한 도구는 도감에도 등록됩니다." : "Review tools met through surprise requests after career battles. Solved tools are also registered in your dex."}</Text>
    <TextInput testID="open-source-search" accessibilityLabel={ko ? "오픈소스 검색" : "Search open source"} placeholder={ko ? "Kafka, 하둡, 계보…" : "Kafka, Hadoop, lineage…"} placeholderTextColor={colors.muted} value={query} onChangeText={setQuery} autoCapitalize="none" autoCorrect={false} style={styles.input} />
    <ScrollView horizontal contentContainerStyle={styles.filters} showsHorizontalScrollIndicator>
      <PixelButton compact onPress={() => setFamily(undefined)} variant={!family ? "primary" : "secondary"}>{ko ? "모든 생태계" : "All ecosystems"}</PixelButton>
      {Object.entries(OPEN_SOURCE_FAMILIES).map(([id, copy]) => <PixelButton compact key={id} onPress={() => setFamily(id as OpenSourceFamily)} variant={family === id ? "primary" : "secondary"}>{localize(copy, locale)}</PixelButton>)}
    </ScrollView>
    <ScrollView horizontal contentContainerStyle={styles.filters} showsHorizontalScrollIndicator>
      <PixelButton compact onPress={() => setJobId(undefined)} variant={!jobId ? "primary" : "secondary"}>{ko ? "모든 경로" : "All paths"}</PixelButton>
      {SOURCE_CAREERS.filter(({ id }) => JOB_OPTIONS.some((job) => job.id === id) || activeSourceCareer(save) === id || history.offeredCareers.includes(id)).map(({ id }) => <PixelButton compact key={id} onPress={() => setJobId(id)} variant={jobId === id ? "primary" : "secondary"}>{localize(sourceCareerName(id), locale)}</PixelButton>)}
    </ScrollView>
    <PixelButton compact variant="quiet" onPress={() => { setQuery(""); setFamily(undefined); setJobId(undefined); setIds(undefined); }}>{ko ? "전체 보기" : "SHOW ALL"}</PixelButton>
    <Text testID="open-source-count" accessibilityLiveRegion="polite" style={styles.count}>{entries.length}/{discovered.size} · {ids ? (ko ? "발견한 관련 도구" : "Discovered related tools") : (ko ? "직무 모험에서 발견한 기록" : "Discoveries from your career adventure")}</Text>
    {!entries.length ? <Text testID="open-source-empty" style={styles.body}>{discovered.size ? (ko ? "조건에 맞는 기록이 없습니다. 검색이나 필터를 바꿔 보세요." : "No matching discoveries. Try changing the search or filters.") : (ko ? "아직 만난 도구가 없습니다. 직무 전투를 완료하면 돌발 의뢰로 도구를 만날 수 있어요." : "No tools discovered yet. Finish career battles to meet tools through surprise requests.")}</Text> : null}
    {entries.map((entry) => {
      const captured = save.progress.captures.some(({ id }) => id === "open-source:" + entry.id);
      const roles = [...new Set(history.discoveries.filter(({ toolId }) => toolId === entry.id).map(({ careerId }) => careerId))];
      return <View testID={`open-source-${entry.id}`} key={entry.id} style={styles.card}>
      <Text style={styles.muted}>{localize(OPEN_SOURCE_FAMILIES[entry.family], locale)} · {localize(OPEN_SOURCE_KIND_LABELS[entry.kind], locale)}</Text>
      {entry.character.assetKey ? <Image accessibilityLabel={localize(entry.character.name, locale)} source={mobileAssetSource(entry.character.assetKey)} resizeMode="contain" style={styles.character} /> : null}
      <Text accessibilityRole="header" style={styles.title}>{entry.name}</Text>
      {entry.parentId ? <Text style={styles.muted}>{ko ? "구성요소:" : "Component of:"} {findOpenSource(entry.parentId)!.name}</Text> : null}
      <Text style={styles.body}>{localize(entry.role, locale)}</Text>
      <Text style={styles.learning}>{localize(entry.learning, locale)}</Text>
      <Text style={styles.title}>{localize(entry.character.name, locale)}</Text>
      <Text style={styles.body}>{localize(entry.character.motif, locale)}</Text>
      {roles.map((id) => <Text key={id} style={styles.body}>{localize(sourceCareerName(id), locale)} · {localize(sourceCareer(id)!.workplace, locale)}</Text>)}
      <Text style={styles.muted}>{captured ? (ko ? "✓ 도감 등록 완료" : "✓ REGISTERED IN DEX") : (ko ? "발견 기록 · 직무 모험 중 다시 만날 수 있어요." : "Discovered · You can meet this tool again during your career adventure.")}</Text>
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
