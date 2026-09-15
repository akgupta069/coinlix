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

const GAME_DURATION_S = 10;
const COINS_PER_TAP = 2;
const TARGET_SIZE = 72;
const PLAY_AREA = { width: 280, height: 320 };

export default function TapBlastScreen() {
  const { coins, addCoins } = useApp();
  const [status, setStatus] = useState('idle'); // idle | playing | done
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
  const [taps, setTaps] = useState(0);
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [showAd, setShowAd] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => () => clearInterval(intervalRef.current), []);

  function randomPos() {
    return {
      x: Math.random() * (PLAY_AREA.width - TARGET_SIZE),
      y: Math.random() * (PLAY_AREA.height - TARGET_SIZE),
    };
  }

  function startGame() {
    setTaps(0);
    setTimeLeft(GAME_DURATION_S);
    setTargetPos(randomPos());
    setStatus('playing');
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current);
          setStatus('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function handleTap() {
    if (status !== 'playing') return;
    tapLight();
    setTaps((t) => t + 1);
    setTargetPos(randomPos());
  }

  const reward = taps * COINS_PER_TAP;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Tap Blast" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        {status === 'idle' ? (
          <>
            <Text style={styles.bigIcon}>💥</Text>
            <Text style={[Typography.h3, styles.centerText]}>Tap the target as many times as you can!</Text>
            <Text style={[Typography.small, styles.hint]}>{GAME_DURATION_S} seconds · {COINS_PER_TAP} coins per tap</Text>
            <Button title="Start" onPress={startGame} style={styles.startBtn} />
          </>
        ) : null}

        {status === 'playing' ? (
          <>
            <View style={styles.statsRow}>
              <Text style={Typography.h3}>⏱ {timeLeft}s</Text>
              <Text style={Typography.h3}>👆 {taps}</Text>
            </View>
            <View style={[styles.playArea, PLAY_AREA]}>
              <Pressable
                onPress={handleTap}
                style={[styles.target, { left: targetPos.x, top: targetPos.y }]}
              >
                <Text style={styles.targetIcon}>🎯</Text>
              </Pressable>
            </View>
          </>
        ) : null}

        {status === 'done' ? (
          <>
            <Text style={styles.bigIcon}>🏁</Text>
            <Text style={Typography.h2}>{taps} taps!</Text>
            <Text style={[Typography.h3, styles.rewardText]}>{formatCoins(reward)} coins earned</Text>
            <Button title="Watch Ad to Claim" onPress={() => setShowAd(true)} style={styles.startBtn} />
          </>
        ) : null}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={reward}
        rewardLabel="Nice tapping!"
        onClaim={() => addCoins(reward, { label: 'Tap Blast', icon: '💥' })}
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
  statsRow: { flexDirection: 'row', gap: Spacing.xl, marginBottom: Spacing.md },
  playArea: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  target: {
    position: 'absolute',
    width: TARGET_SIZE,
    height: TARGET_SIZE,
    borderRadius: TARGET_SIZE / 2,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetIcon: { fontSize: 30 },
  rewardText: { color: Colors.coin, marginTop: 4, marginBottom: Spacing.sm },
});
