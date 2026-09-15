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
const COINS_PER_COMPLETION = 20;

function shuffledNumbers() {
  const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function SequenceTapScreen() {
  const { coins, addCoins } = useApp();
  const [status, setStatus] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
  const [cells, setCells] = useState(shuffledNumbers);
  const [nextExpected, setNextExpected] = useState(1);
  const [completions, setCompletions] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  function startGame() {
    setCompletions(0);
    setCells(shuffledNumbers());
    setNextExpected(1);
    setTimeLeft(GAME_DURATION_S);
    setStatus('playing');
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setStatus('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function handleTap(num) {
    if (status !== 'playing' || num !== nextExpected) return;
    tapLight();
    if (nextExpected === 9) {
      setCompletions((c) => c + 1);
      setCells(shuffledNumbers());
      setNextExpected(1);
    } else {
      setNextExpected((n) => n + 1);
    }
  }

  const reward = completions * COINS_PER_COMPLETION;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Sequence Tap" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        {status === 'idle' ? (
          <>
            <Text style={styles.bigIcon}>🔢</Text>
            <Text style={[Typography.h3, styles.centerText]}>Tap 1 to 9 in order, as fast as you can!</Text>
            <Text style={[Typography.small, styles.hint]}>
              {GAME_DURATION_S}s · {COINS_PER_COMPLETION} coins per full sequence
            </Text>
            <Button title="Start" onPress={startGame} style={styles.startBtn} />
          </>
        ) : null}

        {status === 'playing' ? (
          <>
            <View style={styles.statsRow}>
              <Text style={Typography.h3}>⏱ {timeLeft}s</Text>
              <Text style={Typography.h3}>🏁 {completions}</Text>
            </View>
            <Text style={[Typography.small, styles.hint]}>Next: {nextExpected}</Text>
            <View style={styles.grid}>
              {cells.map((num) => (
                <Pressable
                  key={num}
                  onPress={() => handleTap(num)}
                  style={[styles.cell, num < nextExpected && styles.cellDone]}
                >
                  <Text style={[styles.cellText, num < nextExpected && styles.cellTextDone]}>{num}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {status === 'done' ? (
          <>
            <Text style={styles.bigIcon}>🏁</Text>
            <Text style={Typography.h2}>{completions} sequences!</Text>
            <Text style={[Typography.h3, styles.rewardText]}>{formatCoins(reward)} coins earned</Text>
            <Button title="Watch Ad to Claim" onPress={() => setShowAd(true)} style={styles.startBtn} />
          </>
        ) : null}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={reward}
        rewardLabel="Quick fingers!"
        onClaim={() => addCoins(reward, { label: 'Sequence Tap', icon: '🔢' })}
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
  hint: { color: Colors.textMuted, marginBottom: Spacing.md },
  startBtn: { alignSelf: 'stretch', marginTop: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.xl, marginBottom: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 270, justifyContent: 'space-between', rowGap: Spacing.sm, marginTop: Spacing.md },
  cell: {
    width: 82,
    height: 82,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellDone: { backgroundColor: Colors.surfaceAlt },
  cellText: { ...Typography.h1, color: Colors.white },
  cellTextDone: { color: Colors.textMuted },
  rewardText: { color: Colors.coin, marginTop: 4, marginBottom: Spacing.sm },
});
