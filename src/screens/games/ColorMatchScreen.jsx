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
const COLORS = [
  { name: 'RED', hex: '#F0483E' },
  { name: 'BLUE', hex: '#1CA9E8' },
  { name: 'GREEN', hex: '#20C46A' },
  { name: 'YELLOW', hex: '#F5B60A' },
  { name: 'PURPLE', hex: '#8E54E9' },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function generateRound() {
  const word = COLORS[Math.floor(Math.random() * COLORS.length)];
  const ink = COLORS[Math.floor(Math.random() * COLORS.length)];
  const otherOptions = shuffle(COLORS.filter((c) => c.hex !== ink.hex)).slice(0, 3);
  const options = shuffle([ink, ...otherOptions]);
  return { word: word.name, ink, options };
}

export default function ColorMatchScreen() {
  const { coins, addCoins } = useApp();
  const [status, setStatus] = useState('idle'); // idle | playing | done
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
  const [round, setRound] = useState(generateRound);
  const [score, setScore] = useState(0);
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

  function handleTap(option) {
    if (status !== 'playing') return;
    if (option.hex === round.ink.hex) {
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
      <GameHeader title="Color Match" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        {status === 'idle' ? (
          <>
            <Text style={styles.bigIcon}>🎨</Text>
            <Text style={[Typography.h3, styles.centerText]}>Tap the INK color, not the word!</Text>
            <Text style={[Typography.small, styles.hint]}>
              {GAME_DURATION_S}s · {COINS_PER_CORRECT} coins per correct tap
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
            <Text style={[styles.wordText, { color: round.ink.hex }]}>{round.word}</Text>
            <View style={styles.optionsGrid}>
              {round.options.map((opt) => (
                <Pressable
                  key={opt.name}
                  onPress={() => handleTap(opt)}
                  style={[styles.swatch, { backgroundColor: opt.hex }]}
                />
              ))}
            </View>
          </>
        ) : null}

        {status === 'done' ? (
          <>
            <Text style={styles.bigIcon}>🏁</Text>
            <Text style={Typography.h2}>{score} correct!</Text>
            <Text style={[Typography.h3, styles.rewardText]}>{formatCoins(reward)} coins earned</Text>
            <Button title="Watch Ad to Claim" onPress={() => setShowAd(true)} style={styles.startBtn} />
          </>
        ) : null}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={reward}
        rewardLabel="Sharp eyes!"
        onClaim={() => addCoins(reward, { label: 'Color Match', icon: '🎨' })}
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
  wordText: { fontSize: 42, fontWeight: '900', marginBottom: Spacing.xl },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, justifyContent: 'center' },
  swatch: { width: 70, height: 70, borderRadius: Radius.lg },
  rewardText: { color: Colors.coin, marginTop: 4, marginBottom: Spacing.sm },
});
