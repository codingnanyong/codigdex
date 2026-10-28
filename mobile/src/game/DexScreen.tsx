import { useMemo } from "react";
import { FlatList, Image, Pressable, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DEX_MONSTERS } from "@codigdex/game-content/domain/chapters";
import type { MonsterDefinition } from "@codigdex/game-core/domain/chapters/types";
import { localize } from "@codigdex/game-core/i18n/locale";
import { mobileAssetSource } from "../assets";
import { Screen } from "../ui/Screen";
import { PixelButton } from "../ui/PixelButton";
import { useSave } from "../state/SaveProvider";
import { styles } from "./gameScreenStyles";

export function DexScreen({ onBack, onSelect, onCareer }: { onBack(): void; onSelect(monster: MonsterDefinition): void; onCareer(): void }) {
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
            <Pressable accessibilityRole="button" accessibilityLabel={`NO.${entry.dexNumber} ${unlocked ? localize(entry.name, locale) : (ko ? "미발견" : "Undiscovered")}`} onPress={() => onSelect(entry)} style={[styles.dexCard, unlocked && styles.dexCardCaptured]}>
              <Text style={styles.number}>NO.{entry.dexNumber}</Text>
              {unlocked ? <Image resizeMode="contain" source={mobileAssetSource(entry.assetKey)} style={styles.dexMonster} /> : <View style={styles.dexUnknown}><Text style={styles.dexQuestion}>?</Text></View>}
              <Text numberOfLines={1} style={styles.dexName}>{unlocked ? localize(entry.name, locale) : "???"}</Text>
            </Pressable>
          );
        }} />
    </Screen>
  );
}
