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
const COINS_PER_CATCH = 5;
const SPAWN_INTERVAL_MS = 700;
const FALL_DURATION_MS = 2400;
const COIN_SIZE = 44;
const PLAY_AREA = { width: 300, height: 360 };

export default function CoinRunnerScreen() {
  const { coins, addCoins } = useApp();
  const [status, setStatus] = useState('idle'); // idle | playing | done
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
  const [caught, setCaught] = useState(0);
  const [falling, setFalling] = useState([]);
  const [showAd, setShowAd] = useState(false);
  const timerRef = useRef(null);
  const spawnRef = useRef(null);
  const idRef = useRef(0);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    clearInterval(spawnRef.current);
  }, []);

  function spawnCoin() {
    const id = idRef.current++;
    const x = Math.random() * (PLAY_AREA.width - COIN_SIZE);
    const y = new Animated.Value(0);
    setFalling((prev) => [...prev, { id, x, y }]);

    Animated.timing(y, {
      toValue: PLAY_AREA.height - COIN_SIZE,
      duration: FALL_DURATION_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) removeCoin(id);
    });
  }

  function removeCoin(id) {
    setFalling((prev) => prev.filter((c) => c.id !== id));
  }

  function catchCoin(id) {
    tapLight();
    setCaught((c) => c + 1);
    removeCoin(id);
  }

  function startGame() {
    setCaught(0);
    setFalling([]);
    setTimeLeft(GAME_DURATION_S);
    setStatus('playing');

    spawnRef.current = setInterval(spawnCoin, SPAWN_INTERVAL_MS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          clearInterval(spawnRef.current);
          setFalling([]);
          setStatus('done');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  const reward = caught * COINS_PER_CATCH;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Coin Runner" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        {status === 'idle' ? (
          <>
            <Text style={styles.bigIcon}>🏃</Text>
            <Text style={[Typography.h3, styles.centerText]}>Catch the falling coins!</Text>
            <Text style={[Typography.small, styles.hint]}>
              {GAME_DURATION_S}s · {COINS_PER_CATCH} coins per catch
            </Text>
            <Button title="Start" onPress={startGame} style={styles.startBtn} />
          </>
        ) : null}

        {status === 'playing' ? (
          <>
            <View style={styles.statsRow}>
              <Text style={Typography.h3}>⏱ {timeLeft}s</Text>
              <Text style={Typography.h3}>🪙 {caught}</Text>
            </View>
            <View style={[styles.playArea, PLAY_AREA]}>
              {falling.map((c) => (
                <Animated.View
                  key={c.id}
                  style={[styles.coinWrap, { left: c.x, transform: [{ translateY: c.y }] }]}
                >
                  <Pressable onPress={() => catchCoin(c.id)} style={styles.coin}>
                    <Text style={styles.coinIcon}>🪙</Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </>
        ) : null}

        {status === 'done' ? (
          <>
            <Text style={styles.bigIcon}>🏁</Text>
            <Text style={Typography.h2}>{caught} coins caught!</Text>
            <Text style={[Typography.h3, styles.rewardText]}>{formatCoins(reward)} coins earned</Text>
            <Button title="Watch Ad to Claim" onPress={() => setShowAd(true)} style={styles.startBtn} />
          </>
        ) : null}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={reward}
        rewardLabel="Great running!"
        onClaim={() => addCoins(reward, { label: 'Coin Runner', icon: '🏃' })}
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
  coinWrap: { position: 'absolute', top: 0, width: COIN_SIZE, height: COIN_SIZE },
  coin: {
    flex: 1,
    borderRadius: COIN_SIZE / 2,
    backgroundColor: '#FFF6DD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinIcon: { fontSize: 22 },
  rewardText: { color: Colors.coin, marginTop: 4, marginBottom: Spacing.sm },
});
