import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Shadows } from '../utils/theme';

export default function Card({ children, style, floating = false, padded = true }) {
  return (
    <View
      style={[
        styles.base,
        padded && styles.padded,
        floating ? Shadows.floating : Shadows.card,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  padded: { padding: Spacing.md },
});
