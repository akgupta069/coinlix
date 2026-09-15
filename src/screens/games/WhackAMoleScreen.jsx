import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import GameHeader from '../../components/GameHeader';
import AdRewardModal from '../../components/AdRewardModal';
import Button from '../../components/Button';
import CoinBadge from '../../components/CoinBadge';
import { Colors, Radius, Spacing, Typography } from '../../utils/theme';
import { formatCoins } from '../../utils/format';
import { tapLight } from '../../utils/haptics';

const GAME_DURATION_S = 15;
const COINS_PER_HIT = 5;
const MOLE_INTERVAL_MS = 750;
const HOLE_COUNT = 6;

export default function WhackAMoleScreen() {
  const { coins, addCoins } = useApp();
  const [status, setStatus] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
  const [score, setScore] = useState(0);
  const [moleIndex, setMoleIndex] = useState(-1);
  const [showAd, setShowAd] = useState(false);
  const timerRef = useRef(null);
  const moleRef = useRef(null);

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      clearInterval(moleRef.current);
    },
    []
  );

  function popNewMole() {
    setMoleIndex((prev) => {
      let next = Math.floor(Math.random() * HOLE_COUNT);
      if (next === prev) next = (next + 1) % HOLE_COUNT;
      return next;
    });
  }

  function startGame() {
    setScore(0);
    setTimeLeft(GAME_DURATION_S);
    setStatus('playing');
    popNewMole();
    moleRef.current = setInterval(popNewMole, MOLE_INTERVAL_MS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          clearInterval(moleRef.current);
          setMoleIndex(-1);
          setStatus('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function handleTap(index) {
    if (status !== 'playing' || index !== moleIndex) return;
    tapLight();
    setScore((s) => s + 1);
    setMoleIndex(-1);
  }

  const reward = score * COINS_PER_HIT;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Whack-a-Mole" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        {status === 'idle' ? (
          <>
            <Text style={styles.bigIcon}>🔨</Text>
            <Text style={[Typography.h3, styles.centerText]}>Tap the mole as soon as it pops up!</Text>
            <Text style={[Typography.small, styles.hint]}>
              {GAME_DURATION_S}s · {COINS_PER_HIT} coins per hit
            </Text>
            <Button title="Start" onPress={startGame} style={styles.startBtn} />
          </>
        ) : null}

        {status === 'playing' ? (
          <>
            <View style={styles.statsRow}>
              <Text style={Typography.h3}>⏱ {timeLeft}s</Text>
              <Text style={Typography.h3}>🔨 {score}</Text>
            </View>
            <View style={styles.grid}>
              {Array.from({ length: HOLE_COUNT }).map((_, i) => (
                <Pressable key={i} onPress={() => handleTap(i)} style={styles.hole}>
                  <Text style={styles.holeIcon}>{i === moleIndex ? '🐹' : '🕳️'}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {status === 'done' ? (
          <>
            <Text style={styles.bigIcon}>🏁</Text>
            <Text style={Typography.h2}>{score} hits!</Text>
            <Text style={[Typography.h3, styles.rewardText]}>{formatCoins(reward)} coins earned</Text>
            <Button title="Watch Ad to Claim" onPress={() => setShowAd(true)} style={styles.startBtn} />
          </>
        ) : null}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={reward}
        rewardLabel="Great whacking!"
        onClaim={() => addCoins(reward, { label: 'Whack-a-Mole', icon: '🔨' })}
        onClose={() => {
          setShowAd(false);
          setStatus('idle');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  bigIcon: { fontSize: 44, marginBottom: Spacing.sm },
  centerText: { textAlign: 'center', marginBottom: Spacing.xs },
  hint: { color: Colors.textMuted, marginBottom: Spacing.lg },
  startBtn: { alignSelf: 'stretch', marginTop: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.xl, marginBottom: Spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 270, justifyContent: 'space-between', rowGap: Spacing.md },
  hole: {
    width: 82,
    height: 82,
    borderRadius: Radius.lg,
    backgroundColor: '#D8CBB0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holeIcon: { fontSize: 36 },
  rewardText: { color: Colors.coin, marginTop: 4, marginBottom: Spacing.sm },
});
