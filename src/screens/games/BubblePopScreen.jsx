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
const SPAWN_INTERVAL_MS = 550;
const BUBBLE_LIFETIME_MS = 1200;
const BUBBLE_SIZE = 60;
const PLAY_AREA = { width: 300, height: 340 };
const BUBBLE_EMOJIS = ['🫧', '🔵', '🟣', '🟢'];

export default function BubblePopScreen() {
  const { coins, addCoins } = useApp();
  const [status, setStatus] = useState('idle'); // idle | playing | done
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION_S);
  const [popped, setPopped] = useState(0);
  const [bubbles, setBubbles] = useState([]);
  const [showAd, setShowAd] = useState(false);
  const timerRef = useRef(null);
  const spawnRef = useRef(null);
  const idRef = useRef(0);
  const lifeTimersRef = useRef({});

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      clearInterval(spawnRef.current);
      Object.values(lifeTimersRef.current).forEach(clearTimeout);
    },
    []
  );

  function removeBubble(id) {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
    clearTimeout(lifeTimersRef.current[id]);
    delete lifeTimersRef.current[id];
  }

  function spawnBubble() {
    const id = idRef.current++;
    const x = Math.random() * (PLAY_AREA.width - BUBBLE_SIZE);
    const y = Math.random() * (PLAY_AREA.height - BUBBLE_SIZE);
    const emoji = BUBBLE_EMOJIS[Math.floor(Math.random() * BUBBLE_EMOJIS.length)];
    const scale = new Animated.Value(0);

    setBubbles((prev) => [...prev, { id, x, y, emoji, scale }]);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 5 }).start();

    lifeTimersRef.current[id] = setTimeout(() => removeBubble(id), BUBBLE_LIFETIME_MS);
  }

  function popBubble(id) {
    tapLight();
    setPopped((p) => p + 1);
    removeBubble(id);
  }

  function startGame() {
    setPopped(0);
    setBubbles([]);
    setTimeLeft(GAME_DURATION_S);
    setStatus('playing');

    spawnRef.current = setInterval(spawnBubble, SPAWN_INTERVAL_MS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          clearInterval(spawnRef.current);
          Object.values(lifeTimersRef.current).forEach(clearTimeout);
          lifeTimersRef.current = {};
          setBubbles([]);
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
      <GameHeader title="Bubble Pop" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        {status === 'idle' ? (
          <>
            <Text style={styles.bigIcon}>🫧</Text>
            <Text style={[Typography.h3, styles.centerText]}>Pop bubbles before they vanish!</Text>
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
              <Text style={Typography.h3}>🫧 {popped}</Text>
            </View>
            <View style={[styles.playArea, PLAY_AREA]}>
              {bubbles.map((b) => (
                <Animated.View
                  key={b.id}
                  style={[styles.bubbleWrap, { left: b.x, top: b.y, transform: [{ scale: b.scale }] }]}
                >
                  <Pressable onPress={() => popBubble(b.id)} style={styles.bubble}>
                    <Text style={styles.bubbleIcon}>{b.emoji}</Text>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </>
        ) : null}

        {status === 'done' ? (
          <>
            <Text style={styles.bigIcon}>🏁</Text>
            <Text style={Typography.h2}>{popped} bubbles popped!</Text>
            <Text style={[Typography.h3, styles.rewardText]}>{formatCoins(reward)} coins earned</Text>
            <Button title="Watch Ad to Claim" onPress={() => setShowAd(true)} style={styles.startBtn} />
          </>
        ) : null}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={reward}
        rewardLabel="Nice popping!"
        onClaim={() => addCoins(reward, { label: 'Bubble Pop', icon: '🫧' })}
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
  bubbleWrap: { position: 'absolute', width: BUBBLE_SIZE, height: BUBBLE_SIZE },
  bubble: {
    flex: 1,
    borderRadius: BUBBLE_SIZE / 2,
    backgroundColor: 'rgba(108,92,231,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleIcon: { fontSize: 28 },
  rewardText: { color: Colors.coin, marginTop: 4, marginBottom: Spacing.sm },
});
