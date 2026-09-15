import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useApp } from '../../context/AppContext';
import GameHeader from '../../components/GameHeader';
import CoinBadge from '../../components/CoinBadge';
import Card from '../../components/Card';
import AdRewardModal from '../../components/AdRewardModal';
import { Colors, Radius, Spacing, Typography } from '../../utils/theme';
import { formatCoins } from '../../utils/format';
import { success as hapticSuccess } from '../../utils/haptics';
import { showToast } from '../../components/Toast';
import { pollOfTheDay } from '../../data/pollQuestions';

const REWARD = 30;
const STATE_KEY = 'coinlix_poll_state';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function PollScreen() {
  const { coins, addCoins } = useApp();
  const [poll] = useState(pollOfTheDay);
  const [votedToday, setVotedToday] = useState(false);
  const [choice, setChoice] = useState(null);
  const [percentA, setPercentA] = useState(50);
  const [loaded, setLoaded] = useState(false);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STATE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.date === todayKey()) {
          setVotedToday(true);
          setChoice(saved.choice);
          setPercentA(saved.percentA);
        }
      }
      setLoaded(true);
    })();
  }, []);

  const vote = (side) => {
    if (votedToday) return;
    const winPercent = 55 + Math.floor(Math.random() * 20); // 55–74%
    const nextPercentA = side === 'a' ? winPercent : 100 - winPercent;
    setChoice(side);
    setPercentA(nextPercentA);
    setVotedToday(true);
    hapticSuccess();
    setShowAd(true);
  };

  const handleClaim = async () => {
    addCoins(REWARD, { label: 'Daily poll', icon: '📊' });
    await AsyncStorage.setItem(
      STATE_KEY,
      JSON.stringify({ date: todayKey(), choice, percentA })
    );
    showToast(`+${formatCoins(REWARD)} coins added!`, 'success');
  };

  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Daily Poll" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        <Text style={[Typography.small, styles.hint]}>
          {votedToday ? 'Thanks for voting — see today\'s results' : `Vote to earn ${formatCoins(REWARD)} coins`}
        </Text>

        <Card style={styles.questionCard}>
          <Text style={Typography.h2}>{poll.q}</Text>
        </Card>

        <Pressable
          onPress={() => vote('a')}
          disabled={votedToday}
          style={[styles.option, choice === 'a' && styles.optionChosen]}
        >
          <Text style={styles.optionText}>{poll.a}</Text>
          {votedToday && (
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${percentA}%` }]} />
              <Text style={styles.barPercent}>{percentA}%</Text>
            </View>
          )}
        </Pressable>

        <Pressable
          onPress={() => vote('b')}
          disabled={votedToday}
          style={[styles.option, choice === 'b' && styles.optionChosen]}
        >
          <Text style={styles.optionText}>{poll.b}</Text>
          {votedToday && (
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${100 - percentA}%` }]} />
              <Text style={styles.barPercent}>{100 - percentA}%</Text>
            </View>
          )}
        </Pressable>

        {votedToday ? (
          <Text style={[Typography.caption, styles.comeBack]}>Come back tomorrow for a new poll</Text>
        ) : null}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={REWARD}
        rewardLabel="Daily poll"
        autoClaim
        onClaim={handleClaim}
        onClose={() => setShowAd(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  hint: { color: Colors.textMuted, marginBottom: Spacing.md, textAlign: 'center' },
  questionCard: { alignItems: 'center', paddingVertical: Spacing.xl, marginBottom: Spacing.lg },
  option: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  optionChosen: { borderColor: Colors.primary, backgroundColor: '#F1EEFE' },
  optionText: { ...Typography.h3 },
  barTrack: {
    marginTop: Spacing.sm,
    height: 18,
    borderRadius: 999,
    backgroundColor: Colors.surfaceAlt,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  barFill: { position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: Colors.primary, borderRadius: 999 },
  barPercent: { ...Typography.caption, color: Colors.text, fontWeight: '700', marginLeft: Spacing.sm },
  comeBack: { textAlign: 'center', color: Colors.textMuted, marginTop: Spacing.sm },
});
