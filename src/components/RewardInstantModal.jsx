import React, { useEffect, useState } from 'react';
import { Modal, View, Text, ActivityIndicator, Linking, StyleSheet } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import Button from './Button';
import { Colors, Radius, Spacing, Typography, Shadows } from '../utils/theme';
import { formatCoins } from '../utils/format';
import { allocateRewardCode } from '../services/rewardsService';
import { brandLinkFor } from '../data/rewards';
import { useApp } from '../context/AppContext';
import { success as hapticSuccess, error as hapticError } from '../utils/haptics';
import { showToast } from './Toast';

const ERROR_MESSAGES = {
  out_of_stock: 'This reward is out of stock right now — check back soon.',
  network_error: 'Network error — please try again.',
};

export default function RewardInstantModal({ visible, sku, onClose }) {
  const { spendCoins } = useApp();
  const [phase, setPhase] = useState('processing'); // processing | success | error
  const [code, setCode] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!visible || !sku) return;
    setPhase('processing');
    setCode(null);
    setError(null);

    (async () => {
      const result = await allocateRewardCode(sku);
      if (result.ok) {
        const spend = spendCoins(sku.coins, { label: sku.label, icon: sku.icon });
        if (!spend.ok) {
          setPhase('error');
          setError('insufficient_coins');
          return;
        }
        setCode(result.code);
        setPhase('success');
        hapticSuccess();
      } else {
        setPhase('error');
        setError(result.error);
        hapticError();
      }
    })();
  }, [visible, sku]);

  if (!visible || !sku) return null;

  const copyCode = async () => {
    await Clipboard.setStringAsync(code);
    showToast('Code copied', 'success');
  };

  const brandLink = brandLinkFor(sku.label);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {phase === 'processing' ? (
            <>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={[Typography.h3, styles.processingText]}>Redeeming your reward…</Text>
            </>
          ) : phase === 'success' ? (
            <>
              <Text style={styles.icon}>🎉</Text>
              <Text style={Typography.h3}>{sku.label} · {sku.sub}</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeText} selectable>{code}</Text>
              </View>
              <Button title="Copy Code" onPress={copyCode} style={styles.actionBtn} />
              {brandLink ? (
                <Button
                  title={`Redeem on ${sku.label}`}
                  variant="secondary"
                  onPress={() => Linking.openURL(brandLink)}
                  style={styles.actionBtn}
                />
              ) : null}
              <Button title="Done" variant="ghost" onPress={onClose} />
            </>
          ) : (
            <>
              <Text style={styles.icon}>⚠️</Text>
              <Text style={Typography.h3}>Couldn't redeem</Text>
              <Text style={[Typography.small, styles.errorText]}>
                {ERROR_MESSAGES[error] || 'Something went wrong. Please try again.'}
              </Text>
              <Button title="Close" onPress={onClose} style={styles.actionBtn} />
            </>
          )}
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
  processingText: { marginTop: Spacing.md },
  icon: { fontSize: 40, marginBottom: Spacing.sm },
  codeBox: {
    alignSelf: 'stretch',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    paddingVertical: Spacing.md,
    marginVertical: Spacing.md,
    alignItems: 'center',
  },
  codeText: { ...Typography.h3, letterSpacing: 1 },
  actionBtn: { alignSelf: 'stretch', marginBottom: Spacing.xs },
  errorText: { color: Colors.textSec, textAlign: 'center', marginTop: Spacing.xs, marginBottom: Spacing.lg },
});
