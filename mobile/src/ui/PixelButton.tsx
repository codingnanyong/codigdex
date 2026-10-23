import React, { type PropsWithChildren } from "react";
import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { colors, font } from "./theme";

interface PixelButtonProps extends PropsWithChildren, Pick<PressableProps, "accessibilityLabel" | "disabled" | "onPress" | "testID"> {
  compact?: boolean;
  variant?: "primary" | "secondary" | "quiet" | "danger";
}

export function PixelButton({ accessibilityLabel, children, compact = false, disabled, onPress, testID, variant = "primary" }: PixelButtonProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled ?? false }}
      disabled={disabled ?? false}
      onPress={onPress}
      style={({ pressed }) => [styles.base, styles[variant], compact && styles.compact, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={[styles.label, (variant === "primary" || variant === "danger") && styles.primaryLabel]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: "center", borderRadius: 0, borderWidth: 2, borderBottomWidth: 4, justifyContent: "center", minHeight: 48, paddingHorizontal: 16, paddingVertical: 10 },
  compact: { minHeight: 48, paddingHorizontal: 12, paddingVertical: 6 },
  primary: { backgroundColor: colors.cyan, borderColor: colors.shadow, borderTopColor: colors.path },
  secondary: { backgroundColor: colors.panelRaised, borderColor: colors.shadow, borderTopColor: colors.highlight },
  quiet: { backgroundColor: colors.panel, borderColor: colors.border, borderTopColor: colors.highlight },
  danger: { backgroundColor: colors.danger, borderColor: colors.shadow, borderTopColor: "#dc9075" },
  disabled: { opacity: 0.35 },
  pressed: { opacity: 0.72, transform: [{ translateY: 2 }] },
  label: { color: colors.text, fontFamily: font, fontSize: 15, textAlign: "center", lineHeight: 22 },
  primaryLabel: { color: colors.highlight },
});
