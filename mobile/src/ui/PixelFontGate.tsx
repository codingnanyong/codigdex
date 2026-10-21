import { loadAsync } from "expo-font";
import { useEffect, useState, type PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "./theme";

const fonts = { Galmuri14: require("../../../packages/game-assets/files/fonts/Galmuri14.ttf") };

export function PixelFontGate({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    void loadAsync(fonts).then(() => { if (active) setReady(true); }, () => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [attempt]);
  if (ready) return children;
  return <View style={styles.loading}>
    <Text accessibilityRole={failed ? "alert" : "text"} style={styles.label}>{failed ? "픽셀 폰트를 불러오지 못했습니다. / Font loading failed." : "CODIGDEX · LOADING"}</Text>
    {failed ? <Pressable accessibilityRole="button" onPress={() => { setFailed(false); setAttempt((value) => value + 1); }} style={styles.retry}><Text>다시 시도 / RETRY</Text></Pressable> : null}
  </View>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20, backgroundColor: colors.background, padding: 24 },
  label: { color: colors.text, textAlign: "center" },
  retry: { minHeight: 48, padding: 16, borderWidth: 2, borderColor: colors.shadow, backgroundColor: colors.panel },
});
