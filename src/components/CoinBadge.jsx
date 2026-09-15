import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../utils/theme';
import { formatCoins } from '../utils/format';

export default function CoinBadge({ amount, size = 'md' }) {
  const isSm = size === 'sm';
  return (
    <View style={[styles.badge, isSm && styles.badgeSm]}>
      <Text style={[styles.icon, isSm && styles.iconSm]}>🪙</Text>
      <Text style={[styles.text, isSm ? Typography.small : Typography.h3, styles.textColor]}>
        {formatCoins(amount)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: '#FFF6DD',
    borderRadius: Radius.pill,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    alignSelf: 'flex-start',
  },
  badgeSm: { paddingVertical: 3, paddingHorizontal: Spacing.sm },
  icon: { fontSize: 16 },
  iconSm: { fontSize: 12 },
  text: { fontWeight: '700' },
  textColor: { color: '#8A6A00' },
});
