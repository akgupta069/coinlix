import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../utils/theme';
import { tapLight } from '../utils/haptics';

export default function Button({
  title,
  onPress,
  variant = 'primary', // primary | secondary | ghost
  loading = false,
  disabled = false,
  icon = null,
  style,
}) {
  const isDisabled = disabled || loading;

  const handlePress = () => {
    if (isDisabled) return;
    tapLight();
    onPress?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.primary} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, styles[`text_${variant}`]]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.md,
  },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border },
  ghost: { backgroundColor: 'transparent' },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: { ...Typography.h3 },
  text_primary: { color: Colors.white },
  text_secondary: { color: Colors.text },
  text_ghost: { color: Colors.primary },
});
