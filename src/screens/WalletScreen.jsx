import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import RewardCard from '../components/RewardCard';
import RewardProgressModal from '../components/RewardProgressModal';
import RewardInstantModal from '../components/RewardInstantModal';
import { Colors, Radius, Spacing, Typography } from '../utils/theme';
import { formatCoins } from '../utils/format';
import { DEFAULT_CATALOG, CATEGORIES, normalizeSku } from '../data/rewards';
import { readRewardsConfig } from '../services/firestoreStore';
import { showToast } from '../components/Toast';
import { COINS_PER_INR } from '../data/redeemCodes';

function inrEquivalent(coins) {
  const value = coins / COINS_PER_INR;
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);
}

export default function WalletScreen() {
  const navigation = useNavigation();
  const { coins, totalEarned, totalRedeemed } = useApp();
  const { user, isGuest, signInWithGoogle } = useAuth();

  const [catalog, setCatalog] = useState(DEFAULT_CATALOG);
  const [category, setCategory] = useState('All');
  const [progressSku, setProgressSku] = useState(null);
  const [instantSku, setInstantSku] = useState(null);

  useEffect(() => {
    (async () => {
      const remote = await readRewardsConfig();
      if (remote?.items?.length) {
        setCatalog(remote.items.map(normalizeSku));
      }
    })();
  }, []);

  const visibleRewards = useMemo(() => {
    const filtered = category === 'All' ? catalog : catalog.filter((s) => s.category === category);
    return [...filtered].sort((a, b) => a.coins - b.coins);
  }, [catalog, category]);

  const handleRewardPress = (sku) => {
    if (!user) {
      showToast('Sign in with Google to redeem rewards', 'error');
      if (isGuest) signInWithGoogle();
      return;
    }
    if (coins < sku.coins) {
      setProgressSku(sku);
    } else if (sku.instant) {
      setInstantSku(sku);
    } else {
      navigation.navigate('RewardCampaign', { sku });
    }
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceTopRow}>
            <Text style={styles.balanceLabel}>💰 Coin Balance</Text>
            <View style={styles.inrPill}>
              <Text style={styles.inrText}>≈ ₹{inrEquivalent(coins)}</Text>
            </View>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.balanceValue}>{formatCoins(coins)}</Text>
          </View>

          <View style={styles.balanceDivider} />

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statArrow}>↑ {formatCoins(totalEarned)}</Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
            <View style={styles.statCol}>
              <Text style={[styles.statArrow, styles.statArrowDown]}>↓ {formatCoins(totalRedeemed)}</Text>
              <Text style={styles.statLabel}>Total Redeemed</Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryRow}
        >
          {CATEGORIES.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => setCategory(item.key)}
              style={[styles.categoryChip, category === item.key && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryText, category === item.key && styles.categoryTextActive]}>
                {item.emoji} {item.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={[Typography.h3, styles.sectionTitle]}>
          {category === 'All' ? '🎁 All Rewards' : `${category} Rewards`}
        </Text>

        <View style={styles.rewardGrid}>
          {visibleRewards.map((sku) => (
            <RewardCard
              key={sku.id}
              sku={sku}
              coins={coins}
              affordable={coins >= sku.coins}
              onPress={() => handleRewardPress(sku)}
              style={styles.rewardCardWrap}
            />
          ))}
        </View>
      </ScrollView>

      <RewardProgressModal
        visible={!!progressSku}
        sku={progressSku}
        coins={coins}
        onClose={() => setProgressSku(null)}
        onEarnMore={() => {
          setProgressSku(null);
          navigation.navigate('Home');
        }}
      />

      <RewardInstantModal
        visible={!!instantSku}
        sku={instantSku}
        onClose={() => setInstantSku(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  balanceCard: { borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg },
  balanceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabel: { ...Typography.small, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  inrPill: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingVertical: 3, paddingHorizontal: 10 },
  inrText: { ...Typography.caption, color: Colors.white, fontWeight: '700' },
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
  coinIcon: { fontSize: 28 },
  balanceValue: { fontSize: 34, fontWeight: '800', color: Colors.white },
  balanceDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: Spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCol: { alignItems: 'flex-start' },
  statArrow: { ...Typography.h3, color: '#7CFFB2' },
  statArrowDown: { color: '#FFD3CE' },
  statLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  categoryRow: { gap: Spacing.sm, paddingBottom: Spacing.md },
  categoryChip: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceAlt,
  },
  categoryChipActive: { backgroundColor: Colors.primary },
  categoryText: { ...Typography.small, fontWeight: '600', color: Colors.textSec },
  categoryTextActive: { color: Colors.white },
  sectionTitle: { marginBottom: Spacing.sm },
  rewardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.sm },
  rewardCardWrap: { marginBottom: Spacing.sm },
});
