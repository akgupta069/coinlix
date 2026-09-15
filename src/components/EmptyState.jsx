import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../utils/theme';

export default function EmptyState({ emoji = '📭', title = 'Nothing here yet', subtitle }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={[Typography.h3, styles.title]}>{title}</Text>
      {subtitle ? <Text style={[Typography.small, styles.subtitle]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl },
  emoji: { fontSize: 40, marginBottom: Spacing.sm },
  title: { color: Colors.text, textAlign: 'center' },
  subtitle: { color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
});
