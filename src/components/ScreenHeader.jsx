import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../utils/theme';

export default function ScreenHeader({ title, subtitle, right = null }) {
  return (
    <View style={styles.row}>
      <View style={styles.textWrap}>
        <Text style={Typography.h1}>{title}</Text>
        {subtitle ? <Text style={[Typography.small, styles.subtitle]}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  textWrap: { flex: 1 },
  subtitle: { marginTop: 2, color: Colors.textSec },
});
