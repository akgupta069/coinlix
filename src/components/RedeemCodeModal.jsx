import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import { Colors, Radius, Spacing, Typography, Shadows } from '../utils/theme';
import { formatCoins } from '../utils/format';

export default function RedeemCodeModal({ visible, card, coins, onClose, onEarnMore, onClaim }) {
  if (!visible || !card) return null;

  const percent = Math.min(100, Math.round((coins / card.coins) * 100));
  const remaining = Math.max(0, card.coins - coins);
  const affordable = remaining === 0;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.topStripe} />

          <View style={styles.iconWrap}>
            <Text style={styles.icon}>🎫</Text>
          </View>

          <Text style={styles.title}>{card.brand} Gift Card</Text>
          <View style={styles.denomPill}>
            <Text style={styles.denomText}>₹{formatCoins(card.inr)} Code</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.compareRow}>
            <View style={styles.compareCol}>
              <Text style={styles.compareLabel}>Required</Text>
              <View style={[styles.comparePill, styles.requiredPill]}>
                <Text style={[styles.compareValue, styles.requiredValue]}>
                  🪙 {formatCoins(card.coins)}
                </Text>
              </View>
            </View>
            <View style={styles.compareDivider} />
            <View style={styles.compareCol}>
              <Text style={styles.compareLabel}>Your coins</Text>
              <View style={[styles.comparePill, styles.yoursPill]}>
                <Text style={[styles.compareValue, styles.yoursValue]}>
                  🪙 {formatCoins(coins)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${percent}%` }]} />
          </View>

          {affordable ? (
            <View style={[styles.noticeBox, styles.noticeOk]}>
              <Text style={styles.noticeOkText}>
                ✅ You can claim this now — {formatCoins(card.coins)} coins will be deducted
              </Text>
            </View>
          ) : (
            <View style={[styles.noticeBox, styles.noticeWarn]}>
              <Text style={styles.noticeWarnText}>
                ⚡ You don't have enough coins — {formatCoins(remaining)} more needed
              </Text>
            </View>
          )}

          {affordable ? (
            <Button title="Claim this code" onPress={onClaim} style={styles.actionBtn} />
          ) : (
            <Button
              title="Earn more coins & claim this"
              onPress={onEarnMore}
              style={styles.actionBtn}
            />
          )}
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
    maxWidth: 360,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.xl,
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadows.floating,
  },
  topStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    backgroundColor: Colors.success,
  },

  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  icon: { fontSize: 30 },

  title: { ...Typography.h3, fontWeight: '800', textAlign: 'center' },
  denomPill: {
    marginTop: Spacing.sm,
    backgroundColor: '#E8F9EF',
    borderWidth: 1,
    borderColor: '#BFE9D0',
    borderRadius: Radius.pill,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
  },
  denomText: { ...Typography.h3, color: Colors.success, fontWeight: '800' },

  divider: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.md,
  },

  compareRow: { flexDirection: 'row', alignSelf: 'stretch', alignItems: 'center' },
  compareCol: { flex: 1, alignItems: 'center' },
  compareDivider: { width: 1, height: 44, backgroundColor: Colors.border },
  compareLabel: { ...Typography.small, color: Colors.textMuted, marginBottom: 6 },
  comparePill: { borderRadius: Radius.pill, paddingVertical: 6, paddingHorizontal: Spacing.md },
  requiredPill: { backgroundColor: '#EEF0FE' },
  yoursPill: { backgroundColor: '#FFF6DA' },
  compareValue: { ...Typography.h3, fontWeight: '800' },
  requiredValue: { color: Colors.primary },
  yoursValue: { color: '#B98600' },

  progressTrack: {
    alignSelf: 'stretch',
    height: 10,
    borderRadius: 999,
    backgroundColor: Colors.surfaceAlt,
    overflow: 'hidden',
    marginTop: Spacing.md,
  },
  progressFill: { height: '100%', borderRadius: 999, backgroundColor: Colors.success },

  noticeBox: {
    alignSelf: 'stretch',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  noticeWarn: { backgroundColor: '#FDEBEA', borderColor: '#F7C9C5' },
  noticeWarnText: { ...Typography.small, color: Colors.danger, fontWeight: '800', textAlign: 'center' },
  noticeOk: { backgroundColor: '#E8F9EF', borderColor: '#BFE9D0' },
  noticeOkText: { ...Typography.small, color: '#1B7F4C', fontWeight: '800', textAlign: 'center' },

  actionBtn: { alignSelf: 'stretch', marginBottom: Spacing.xs },
});
