import { Image, Text, View } from "react-native";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { localize } from "@codigdex/game-core/i18n/locale";
import { mobileAssetSource } from "../assets";
import { PixelScene } from "../ui/PixelScene";
import { canEnterBattle } from "./progression";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { useSave } from "../state/SaveProvider";
import { styles } from "./gameScreenStyles";

export function MonsterDetail({ monster, onBack, onBattle }: { monster: MonsterDefinition; onBack(): void; onBattle(): void }) {
  const { locale, save } = useSave();
  const ko = locale === "ko";
  const captured = new Set(save.progress.captures.map(({ id }) => id));
  const available = !monster.id.startsWith("open-source:") && canEnterBattle(save, monster.id);
  return <Screen scroll><View style={styles.detail}>
    <PixelButton onPress={onBack} variant="quiet">{ko ? "도감으로" : "BACK TO DEX"}</PixelButton>
    <Text style={styles.kicker}>NO.{monster.dexNumber} · LV.{monster.level}</Text>
    <Text accessibilityRole="header" style={styles.hudTitle}>{localize(monster.name, locale)}</Text>
    <View style={styles.resultStage}><PixelScene backdrop scene="field" /><Image accessibilityLabel={localize(monster.name, locale)} source={mobileAssetSource(monster.assetKey)} resizeMode="contain" style={styles.resultMonster} /></View>
    <Text style={styles.body}>{localize(monster.briefing, locale)}</Text>
    {captured.has(monster.id) ? <><Text style={styles.body}>{localize(monster.classification, locale)} · {localize(monster.trait, locale)}</Text><Text style={styles.body}>{localize(monster.description, locale)}</Text><Text selectable style={styles.hint}>{localize(monster.snippet, locale)}</Text></> : null}
    <Text style={styles.hint}>{monster.id.startsWith("open-source:") ? (ko ? "이 도구는 직무 모험 중 돌발 의뢰로 만날 수 있어요. 발견 노트에서 역할을 복습하세요." : "Meet this tool through surprise requests during career adventures. Review its role in your discovery notes.") : available ? (ko ? "정답 60% 이상이면 포획할 수 있어요. 힌트를 사용해도 정답으로 인정해요." : "Get at least 60% correct to capture. Answers with hints count too.") : (ko ? "선행 체크포인트를 완료하고 해당 직업 경로를 선택하세요." : "Complete preceding checkpoints and select this career path.")}</Text>
    <PixelButton disabled={!available} onPress={onBattle}>{captured.has(monster.id) ? (ko ? "다시 도전" : "BATTLE AGAIN") : (ko ? "배틀 시작" : "START BATTLE")}</PixelButton>
  </View></Screen>;
}
