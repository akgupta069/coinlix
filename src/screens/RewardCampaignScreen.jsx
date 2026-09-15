import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

import { useApp } from '../context/AppContext';
import GameHeader from '../components/GameHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import CoinBadge from '../components/CoinBadge';
import { Colors, Radius, Spacing, Typography } from '../utils/theme';
import { formatCoins } from '../utils/format';
import { DEFAULT_CAMPAIGN, brandLinkFor } from '../data/rewards';
import { getRewardState, startCampaign, saveCode } from '../utils/rewardState';
import { allocateRewardCode } from '../services/rewardsService';
import { success as hapticSuccess, error as hapticError } from '../utils/haptics';
import { showToast } from '../components/Toast';

function formatRemaining(ms) {
  const totalHours = Math.ceil(ms / (60 * 60 * 1000));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

export default function RewardCampaignScreen({ route, navigation }) {
  const { sku } = route.params;
  const { coins, spendCoins } = useApp();
  const campaign = sku.campaign || DEFAULT_CAMPAIGN;

  const [state, setState] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [, forceTick] = useState(0);

  useEffect(() => {
    (async () => setState(await getRewardState(sku.id)))();
  }, [sku.id]);

  // Re-render once a minute so the unlock countdown stays accurate.
  useEffect(() => {
    const t = setInterval(() => forceTick((n) => n + 1), 60000);
    return () => clearInterval(t);
  }, []);

  if (!state) return null;

  const unlocksAt = state.startedAt ? state.startedAt + campaign.unlockDays * 24 * 60 * 60 * 1000 : null;
  const isUnlocked = unlocksAt ? Date.now() >= unlocksAt : false;

  const handleStart = async () => {
    const next = await startCampaign(sku.id);
    setState(next);
    Linking.openURL(campaign.ctaLink).catch(() => {});
  };

  const handleGetCode = async () => {
    if (coins < sku.coins) {
      showToast("You don't have enough coins for this reward anymore", 'error');
      return;
    }
    setClaiming(true);
    const result = await allocateRewardCode(sku);
    if (result.ok) {
      const spend = spendCoins(sku.coins, { label: sku.label, icon: sku.icon });
      if (!spend.ok) {
        showToast('Not enough coins', 'error');
        setClaiming(false);
        return;
      }
      const next = await saveCode(sku.id, result.code);
      setState(next);
      hapticSuccess();
    } else {
      hapticError();
      showToast(
        result.error === 'out_of_stock' ? 'Out of stock — check back soon' : 'Network error, try again',
        'error'
      );
    }
    setClaiming(false);
  };

  const copyCode = async () => {
    await Clipboard.setStringAsync(state.code);
    showToast('Code copied', 'success');
  };

  const brandLink = brandLinkFor(sku.label);

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title={`${sku.label} · ${sku.sub}`} right={<CoinBadge amount={coins} size="sm" />} />

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Card style={styles.bannerCard}>
          <Text style={styles.bannerEmoji}>{campaign.bannerEmoji}</Text>
          {campaign.bannerText ? <Text style={[Typography.small, styles.bannerText]}>{campaign.bannerText}</Text> : null}
          <Text style={styles.rewardValue}>🪙 {formatCoins(sku.coins)} coins</Text>
        </Card>

        {state.code ? (
          <Card style={styles.codeCard}>
            <Text style={styles.icon}>🎉</Text>
            <Text style={Typography.h3}>Your code</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText} selectable>{state.code}</Text>
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
          </Card>
        ) : (
          <>
            <Card style={styles.stepsCard}>
              <Text style={Typography.h3}>{campaign.title}</Text>
              {campaign.steps.map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{i + 1}</Text>
                  </View>
                  <Text style={[Typography.small, styles.stepText]}>{step}</Text>
                </View>
              ))}
            </Card>

            {!state.startedAt ? (
              <Button title={campaign.ctaLabel} onPress={handleStart} style={styles.actionBtn} />
            ) : !isUnlocked ? (
              <View style={styles.lockedBox}>
                <Text style={styles.lockedText}>🔒 REDEEM CODE</Text>
                <Text style={[Typography.caption, styles.unlockNote]}>
                  Unlocks in {formatRemaining(unlocksAt - Date.now())}
                </Text>
              </View>
            ) : (
              <Button
                title="GET MY CODE"
                onPress={handleGetCode}
                loading={claiming}
                style={styles.actionBtn}
              />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  body: { padding: Spacing.lg, paddingTop: 0, paddingBottom: Spacing.xl },
  bannerCard: { alignItems: 'center', paddingVertical: Spacing.lg, marginBottom: Spacing.lg },
  bannerEmoji: { fontSize: 36 },
  bannerText: { color: Colors.textSec, marginTop: Spacing.xs, textAlign: 'center' },
  rewardValue: { ...Typography.h2, color: Colors.coin, marginTop: Spacing.sm },
  stepsCard: { marginBottom: Spacing.lg },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginTop: Spacing.md },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: Colors.white, fontWeight: '700', fontSize: 12 },
  stepText: { flex: 1, color: Colors.textSec, marginTop: 3 },
  actionBtn: { alignSelf: 'stretch', marginBottom: Spacing.xs },
  lockedBox: {
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
  },
  lockedText: { ...Typography.h3, color: Colors.textMuted },
  unlockNote: { color: Colors.textMuted, marginTop: 4 },
  codeCard: { alignItems: 'center', paddingVertical: Spacing.lg },
  icon: { fontSize: 36, marginBottom: Spacing.xs },
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
});
