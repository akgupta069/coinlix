import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { Colors, Radius, Spacing, Typography, Shadows } from '../utils/theme';
import { formatCoins } from '../utils/format';

export default function RewardProgressModal({ visible, sku, coins, onClose, onEarnMore }) {
  if (!visible || !sku) return null;

  const percent = Math.min(100, Math.round((coins / sku.coins) * 100));
  const remaining = Math.max(0, sku.coins - coins);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={[styles.iconWrap, { backgroundColor: `${sku.color}22` }]}>
            <Text style={styles.icon}>{sku.icon}</Text>
          </View>
          <Text style={Typography.h3}>{sku.label}</Text>
          <Text style={[Typography.small, styles.sub]}>{sku.sub}</Text>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: sku.color }]} />
          </View>
          <Text style={[Typography.caption, styles.percentText]}>
            {formatCoins(coins)} / {formatCoins(sku.coins)} coins ({percent}%)
          </Text>
          <Text style={styles.needText}>You need {formatCoins(remaining)} more coins</Text>

          <Button title="Earn More Coins" onPress={onEarnMore} style={styles.earnBtn} />
          <Button title="Close" variant="ghost" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.floating,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  icon: { fontSize: 28 },
  sub: { color: Colors.textSec, marginBottom: Spacing.md },
  progressTrack: {
    alignSelf: 'stretch',
    height: 10,
    borderRadius: 999,
    backgroundColor: Colors.surfaceAlt,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999 },
  percentText: { marginTop: Spacing.xs, color: Colors.textMuted },
  needText: { ...Typography.h3, color: Colors.text, marginTop: Spacing.md, marginBottom: Spacing.lg, textAlign: 'center' },
  earnBtn: { alignSelf: 'stretch', marginBottom: Spacing.xs },
});
