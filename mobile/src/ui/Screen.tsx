import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "./theme";

interface ScreenProps extends PropsWithChildren {
  scroll?: boolean;
  header?: ReactNode;
}

export function Screen({ children, header, scroll = true }: ScreenProps) {
  const content = (
    <View style={styles.content}>
      {header}
      {children}
    </View>
  );

  return (
    <SafeAreaView edges={["top", "right", "bottom", "left"]} style={styles.safeArea}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, paddingBottom: 24, paddingHorizontal: 20, paddingTop: 14 },
});
