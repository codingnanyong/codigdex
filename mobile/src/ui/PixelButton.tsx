import type { PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { colors, font } from "./theme";

interface PixelButtonProps extends PropsWithChildren, Pick<PressableProps, "accessibilityLabel" | "onPress"> {
  variant?: "primary" | "secondary" | "quiet";
}

export function PixelButton({ accessibilityLabel, children, onPress, variant = "primary" }: PixelButtonProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles[variant], pressed && styles.pressed]}
    >
      <Text style={[styles.label, variant === "primary" ? styles.primaryLabel : undefined]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primary: { backgroundColor: colors.cyan, borderColor: colors.cyan },
  secondary: { backgroundColor: colors.panelRaised, borderColor: colors.border },
  quiet: { backgroundColor: "transparent", borderColor: colors.border },
  pressed: { opacity: 0.72, transform: [{ translateY: 2 }] },
  label: { color: colors.text, fontFamily: font, fontSize: 14, textAlign: "center" },
  primaryLabel: { color: colors.background },
});
