import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
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
const COINS_PER_POP = 5;
const SPAWN_INTERVAL_MS = 650;
const RISE_DURATION_MS = 2600;
const BALLOON_SIZE = 48;
const PLAY_AREA = { width: 300, height: 360 };
const BALLOONS = ['🎈', '🎈', '🎈'];

export default function BalloonBurstScreen() {
  const { coins, addCoins } = useApp();
  const [status, setStatus] = useState('idle');
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
  const [popped, setPopped] = useState(0);
  const [balloons, setBalloons] = useState([]);
  const [showAd, setShowAd] = useState(false);
  const timerRef = useRef(null);
  const spawnRef = useRef(null);
  const idRef = useRef(0);

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      clearInterval(spawnRef.current);
    },
    []
  );

  function removeBalloon(id) {
    setBalloons((prev) => prev.filter((b) => b.id !== id));
  }

  function spawnBalloon() {
    const id = idRef.current++;
    const x = Math.random() * (PLAY_AREA.width - BALLOON_SIZE);
    const emoji = BALLOONS[Math.floor(Math.random() * BALLOONS.length)];
    const y = new Animated.Value(PLAY_AREA.height - BALLOON_SIZE);

    setBalloons((prev) => [...prev, { id, x, y, emoji }]);

    Animated.timing(y, {
      toValue: -BALLOON_SIZE,
      duration: RISE_DURATION_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) removeBalloon(id);
    });
  }

  function popBalloon(id) {
    tapLight();
    setPopped((p) => p + 1);
    removeBalloon(id);
  }

  function startGame() {
    setPopped(0);
    setBalloons([]);
    setTimeLeft(GAME_DURATION_S);
    setStatus('playing');

    spawnRef.current = setInterval(spawnBalloon, SPAWN_INTERVAL_MS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          clearInterval(spawnRef.current);
          setBalloons([]);
          setStatus('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  const reward = popped * COINS_PER_POP;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Balloon Burst" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        {status === 'idle' ? (
          <>
            <Text style={styles.bigIcon}>🎈</Text>
            <Text style={[Typography.h3, styles.centerText]}>Pop balloons before they float away!</Text>
            <Text style={[Typography.small, styles.hint]}>
              {GAME_DURATION_S}s · {COINS_PER_POP} coins per pop
            </Text>
            <Button title="Start" onPress={startGame} style={styles.startBtn} />
          </>
        ) : null}

        {status === 'playing' ? (
          <>
            <View style={styles.statsRow}>
              <Text style={Typography.h3}>⏱ {timeLeft}s</Text>
              <Text style={Typography.h3}>🎈 {popped}</Text>
            </View>
            <View style={[styles.playArea, PLAY_AREA]}>
              {balloons.map((b) => (
                <Animated.View
                  key={b.id}
                  style={[styles.balloonWrap, { left: b.x, transform: [{ translateY: b.y }] }]}
                >
                  <Pressable onPress={() => popBalloon(b.id)} style={styles.balloon}>
                    <Text style={styles.balloonIcon}>{b.emoji}</Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </>
        ) : null}

        {status === 'done' ? (
          <>
            <Text style={styles.bigIcon}>🏁</Text>
            <Text style={Typography.h2}>{popped} balloons popped!</Text>
            <Text style={[Typography.h3, styles.rewardText]}>{formatCoins(reward)} coins earned</Text>
            <Button title="Watch Ad to Claim" onPress={() => setShowAd(true)} style={styles.startBtn} />
          </>
        ) : null}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={reward}
        rewardLabel="Pop pop pop!"
        onClaim={() => addCoins(reward, { label: 'Balloon Burst', icon: '🎈' })}
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
  balloonWrap: { position: 'absolute', top: 0, width: BALLOON_SIZE, height: BALLOON_SIZE },
  balloon: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  balloonIcon: { fontSize: 34 },
  rewardText: { color: Colors.coin, marginTop: 4, marginBottom: Spacing.sm },
});
