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
import { tapLight, error as hapticError } from '../../utils/haptics';

const GAME_DURATION_S = 15;
const COINS_PER_CORRECT = 5;
const GROUPS = [
  ['🍎', '🍏', '🍊', '🍋', '🍇'],
  ['🐶', '🐱', '🐰', '🦊', '🐻'],
  ['⚽', '🏀', '🏈', '🎾', '🏐'],
  ['🚗', '🚕', '🚙', '🚌', '🚓'],
  ['🌸', '🌺', '🌻', '🌷', '🌹'],
];

function generateRound() {
  const groupIndex = Math.floor(Math.random() * GROUPS.length);
  const sameEmoji = GROUPS[groupIndex][Math.floor(Math.random() * GROUPS[groupIndex].length)];
  let oddGroupIndex;
  do {
    oddGroupIndex = Math.floor(Math.random() * GROUPS.length);
  } while (oddGroupIndex === groupIndex);
  const oddEmoji = GROUPS[oddGroupIndex][Math.floor(Math.random() * GROUPS[oddGroupIndex].length)];

  const oddPosition = Math.floor(Math.random() * 9);
  const cells = Array.from({ length: 9 }, (_, i) => (i === oddPosition ? oddEmoji : sameEmoji));
  return { cells, oddPosition };
}

export default function OddOneOutScreen() {
  const { coins, addCoins } = useApp();
  const [status, setStatus] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(generateRound);
  const [showAd, setShowAd] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  function startGame() {
    setScore(0);
    setRound(generateRound());
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

  function handleTap(index) {
    if (status !== 'playing') return;
    if (index === round.oddPosition) {
      tapLight();
      setScore((s) => s + 1);
    } else {
      hapticError();
    }
    setRound(generateRound());
  }

  const reward = score * COINS_PER_CORRECT;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Odd One Out" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        {status === 'idle' ? (
          <>
            <Text style={styles.bigIcon}>🔍</Text>
            <Text style={[Typography.h3, styles.centerText]}>Find the emoji that doesn't belong!</Text>
            <Text style={[Typography.small, styles.hint]}>
              {GAME_DURATION_S}s · {COINS_PER_CORRECT} coins per find
            </Text>
            <Button title="Start" onPress={startGame} style={styles.startBtn} />
          </>
        ) : null}

        {status === 'playing' ? (
          <>
            <View style={styles.statsRow}>
              <Text style={Typography.h3}>⏱ {timeLeft}s</Text>
              <Text style={Typography.h3}>✅ {score}</Text>
            </View>
            <View style={styles.grid}>
              {round.cells.map((emoji, i) => (
                <Pressable key={i} onPress={() => handleTap(i)} style={styles.cell}>
                  <Text style={styles.cellEmoji}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        {status === 'done' ? (
          <>
            <Text style={styles.bigIcon}>🏁</Text>
            <Text style={Typography.h2}>{score} found!</Text>
            <Text style={[Typography.h3, styles.rewardText]}>{formatCoins(reward)} coins earned</Text>
            <Button title="Watch Ad to Claim" onPress={() => setShowAd(true)} style={styles.startBtn} />
          </>
        ) : null}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={reward}
        rewardLabel="Sharp eyes!"
        onClaim={() => addCoins(reward, { label: 'Odd One Out', icon: '🔍' })}
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
  grid: { flexDirection: 'row', flexWrap: 'wrap', width: 270, justifyContent: 'space-between', rowGap: Spacing.sm },
  cell: {
    width: 82,
    height: 82,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellEmoji: { fontSize: 34 },
  rewardText: { color: Colors.coin, marginTop: 4, marginBottom: Spacing.sm },
});
