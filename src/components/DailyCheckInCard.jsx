import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useApp } from '../context/AppContext';
import Card from './Card';
import AdRewardModal from './AdRewardModal';
import { Colors, Radius, Spacing, Typography, Shadows } from '../utils/theme';
import { formatCoins } from '../utils/format';
import { success as hapticSuccess } from '../utils/haptics';
import { showToast } from './Toast';

const STATE_KEY = 'coinlix_checkin_state';
const REWARDS = [500, 700, 900, 1000, 1300, 1600, 2000];
const LOCKED_COLORS = ['#20C46A', '#F0483E', '#00C2A8', '#5D3FD3', '#F5A623', '#3498DB', '#8E54E9'];

function dateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export default function DailyCheckInCard() {
  const { addCoins } = useApp();
  const [state, setState] = useState({ streak: 0, lastCheckIn: null });
  const [loaded, setLoaded] = useState(false);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STATE_KEY);
      if (raw) setState(JSON.parse(raw));
      setLoaded(true);
    })();
  }, []);

  const today = dateKey(0);
  const yesterday = dateKey(-1);
  const checkedInToday = state.lastCheckIn === today;
  const effectiveStreak =
    state.lastCheckIn === today || state.lastCheckIn === yesterday ? state.streak : 0;
  // Card is hidden once checked in today (see early return below), so by
  // the time this renders the user always still has today's day pending.
  const completedInCycle = effectiveStreak % 7;

  const checkIn = () => {
    if (checkedInToday) return;
    setShowAd(true);
  };

  const handleClaim = async () => {
    const newStreak = effectiveStreak + 1;
    const dayIndex = (newStreak - 1) % 7;
    const reward = REWARDS[dayIndex];
    addCoins(reward, { label: 'Daily check-in', icon: '🎁' });
    const next = { streak: newStreak, lastCheckIn: today };
    setState(next);
    await AsyncStorage.setItem(STATE_KEY, JSON.stringify(next));
    hapticSuccess();
    showToast(`+${formatCoins(reward)} coins added!`, 'success');
  };

  if (!loaded || checkedInToday) return null;

  const todayReward = REWARDS[completedInCycle % 7];

  return (
    <Card style={styles.card} padded={false}>
      <View style={styles.header}>
        <View style={styles.headerIconWrap}>
          <Text style={styles.headerIcon}>💰</Text>
        </View>
        <View style={styles.flex1}>
          <Text style={styles.headerTitle}>Daily Check-in</Text>
          <View style={styles.progressRow}>
            {REWARDS.map((_, i) => (
              <View key={i} style={[styles.progressDot, i < completedInCycle && styles.progressDotFilled]} />
            ))}
          </View>
        </View>
        <View style={styles.streakBox}>
          <Text style={styles.streakNumber}>{effectiveStreak}</Text>
          <Text style={styles.streakLabel}>day streak</Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayRow}>
        {REWARDS.map((reward, i) => {
          const isDone = i < completedInCycle;
          const isClaimable = i === completedInCycle;

          if (isClaimable) {
            return (
              <LinearGradient
                key={i}
                colors={[Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.dayCard, styles.dayCardToday]}
              >
                <View style={styles.todayPill}>
                  <Text style={styles.todayPillText}>TODAY</Text>
                </View>
                <Text style={styles.dayCardIcon}>🎉</Text>
                <Text style={styles.dayLabel}>Day {i + 1}</Text>
                <View style={styles.dayRewardPill}>
                  <Text style={styles.dayRewardText}>🪙 +{formatCoins(reward)}</Text>
                </View>
                <Pressable onPress={checkIn} hitSlop={6}>
                  <Text style={styles.claimText}>▶ Claim</Text>
                </Pressable>
              </LinearGradient>
            );
          }

          return (
            <View
              key={i}
              style={[
                styles.dayCard,
                isDone ? styles.dayCardDone : { backgroundColor: LOCKED_COLORS[i % LOCKED_COLORS.length] },
              ]}
            >
              <Text style={styles.dayCardIcon}>{isDone ? '✅' : '🏆'}</Text>
              <Text style={[styles.dayLabel, isDone && styles.dayLabelDone]}>Day {i + 1}</Text>
              <View style={[styles.dayRewardPill, isDone && styles.dayRewardPillDone]}>
                <Text style={[styles.dayRewardText, isDone && styles.dayRewardTextDone]}>
                  🪙 +{formatCoins(reward)}
                </Text>
              </View>
              <Text style={isDone ? styles.doneText : styles.lockTextLight}>
                {isDone ? '✓ Done' : '🔒 Locked'}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <Pressable onPress={checkIn} style={styles.checkInBtn}>
        <View style={styles.checkInIconWrap}>
          <Text style={styles.checkInIcon}>🏆</Text>
        </View>
        <Text style={styles.checkInText}>Check In</Text>
        <View style={styles.checkInPill}>
          <Text style={styles.checkInPillText}>🪙 +{formatCoins(todayReward)}</Text>
        </View>
      </Pressable>

      <AdRewardModal
        visible={showAd}
        coins={todayReward}
        rewardLabel="Daily check-in"
        autoClaim
        onClaim={handleClaim}
        onClose={() => setShowAd(false)}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', marginBottom: Spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: '#F1EEFF',
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  headerIcon: { fontSize: 22 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.text },
  flex1: { flex: 1 },
  progressRow: { flexDirection: 'row', gap: 4, marginTop: 6 },
  progressDot: { flex: 1, height: 5, borderRadius: 999, backgroundColor: Colors.border },
  progressDotFilled: { backgroundColor: Colors.success },
  streakBox: {
    alignItems: 'center',
    backgroundColor: '#E4DBFF',
    borderRadius: Radius.md,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  streakNumber: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  streakLabel: { ...Typography.caption, color: Colors.primaryDark, fontWeight: '600' },

  dayRow: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.sm },
  dayCard: {
    width: 112,
    borderRadius: Radius.lg,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 4,
  },
  dayCardToday: { borderWidth: 2, borderColor: '#FFD700', paddingTop: 20 },
  dayCardDone: { backgroundColor: '#DCDEEA' },
  todayPill: {
    position: 'absolute',
    top: 8,
    backgroundColor: '#FFD700',
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  todayPillText: { ...Typography.caption, color: '#5B3D00', fontWeight: '800' },
  dayCardIcon: { fontSize: 24 },
  dayLabel: { ...Typography.small, color: Colors.white, fontWeight: '700' },
  dayLabelDone: { color: Colors.text },
  dayRewardPill: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  dayRewardPillDone: { backgroundColor: 'rgba(27,29,41,0.08)' },
  dayRewardText: { ...Typography.caption, color: Colors.white, fontWeight: '700' },
  dayRewardTextDone: { color: Colors.textSec },
  claimText: { ...Typography.small, color: Colors.white, fontWeight: '800', marginTop: 2 },
  doneText: { ...Typography.caption, color: Colors.success, fontWeight: '800', marginTop: 2 },
  lockTextLight: { ...Typography.caption, color: 'rgba(255,255,255,0.9)', fontWeight: '700', marginTop: 2 },

  checkInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.success,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    paddingVertical: 14,
    borderRadius: Radius.pill,
  },
  checkInIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInIcon: { fontSize: 13 },
  checkInText: { ...Typography.h3, color: Colors.white, fontWeight: '800' },
  checkInPill: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  checkInPillText: { ...Typography.small, color: Colors.white, fontWeight: '800' },
});
