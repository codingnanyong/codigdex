import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "./theme";
import { PixelScene } from "./PixelScene";

export function Screen({ children, scroll = false }: PropsWithChildren<{ scroll?: boolean }>) {
  const content = <View style={styles.content}>{children}</View>;
  return (
    <View style={styles.root}>
      <PixelScene backdrop />
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.readingVeil]} />
      <SafeAreaView edges={["top", "right", "bottom", "left"]} style={styles.safeArea}>
        {scroll ? <ScrollView contentContainerStyle={styles.scroll}>{content}</ScrollView> : content}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: colors.background, flex: 1 },
  readingVeil: { backgroundColor: colors.background, opacity: 0.94 },
  safeArea: { flex: 1 },
  content: { flex: 1, minHeight: 0, minWidth: 0, paddingHorizontal: 18, paddingVertical: 12 },
  scroll: { flexGrow: 1 },
});
