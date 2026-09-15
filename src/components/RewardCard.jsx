import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { Radius, Spacing, Typography } from '../utils/theme';
import { formatCoins } from '../utils/format';
import { tapLight } from '../utils/haptics';

export default function RewardCard({ sku, coins, affordable, onPress, style }) {
  const percent = Math.min(100, Math.round((coins / sku.coins) * 100));

  return (
    <Pressable
      onPress={() => {
        tapLight();
        onPress();
      }}
      style={[styles.wrap, { backgroundColor: `${sku.color}1F` }, style]}
    >
      {sku.instant ? (
        <View style={styles.ribbon}>
          <Text style={styles.ribbonText}>INSTANT{'\n'}REDEEM</Text>
        </View>
      ) : null}

      {!affordable ? (
        <View style={styles.lockBadge}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      ) : null}

      <Text style={styles.icon}>{sku.icon}</Text>
      <Text style={[styles.label, { color: sku.color }]} numberOfLines={1}>{sku.label}</Text>
      <Text style={styles.sub} numberOfLines={1}>{sku.sub}</Text>

      <View style={[styles.coinsPill, { backgroundColor: `${sku.color}26` }]}>
        <Text style={[styles.coinsText, { color: sku.color }]}>🪙 {formatCoins(sku.coins)}</Text>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: sku.color }]} />
      </View>

      <View style={[styles.claimBtn, { backgroundColor: sku.color }]}>
        <Text style={styles.claimText}>Claim</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '31%',
    borderRadius: Radius.lg,
    alignItems: 'center',
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  icon: { fontSize: 26, marginBottom: 4 },
  label: { ...Typography.caption, fontWeight: '800', textAlign: 'center' },
  sub: { ...Typography.caption, color: '#1B1D29', fontWeight: '700', textAlign: 'center', marginTop: 1, marginBottom: 6 },
  coinsPill: { borderRadius: 999, paddingVertical: 3, paddingHorizontal: 8, marginBottom: 6 },
  coinsText: { fontSize: 11, fontWeight: '800' },
  progressTrack: {
    alignSelf: 'stretch',
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: { height: '100%', borderRadius: 999 },
  claimBtn: { alignSelf: 'stretch', borderRadius: 999, paddingVertical: 7, alignItems: 'center' },
  claimText: { fontSize: 12, fontWeight: '800', color: '#fff' },
  ribbon: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: '#2E7D32',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderBottomRightRadius: Radius.md,
  },
  ribbonText: { fontSize: 7, fontWeight: '800', color: '#fff', lineHeight: 9 },
  lockBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: { fontSize: 10 },
});
