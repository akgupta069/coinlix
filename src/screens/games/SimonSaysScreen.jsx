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

const COLORS = [
  { key: 'red', bg: '#F0483E' },
  { key: 'green', bg: '#20C46A' },
  { key: 'blue', bg: '#1CA9E8' },
  { key: 'yellow', bg: '#F5B60A' },
];
const COINS_PER_LEVEL = 10;
const FLASH_MS = 500;
const GAP_MS = 250;

export default function SimonSaysScreen() {
  const { coins, addCoins } = useApp();
  const [status, setStatus] = useState('idle'); // idle | showing | input | done
  const [sequence, setSequence] = useState([]);
  const [userIndex, setUserIndex] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showAd, setShowAd] = useState(false);
  const timeoutsRef = useRef([]);

  useEffect(() => () => timeoutsRef.current.forEach(clearTimeout), []);

  function playSequence(seq) {
    setStatus('showing');
    setActiveIndex(-1);
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    seq.forEach((colorIndex, i) => {
      const onT = setTimeout(() => setActiveIndex(colorIndex), i * (FLASH_MS + GAP_MS));
      const offT = setTimeout(() => setActiveIndex(-1), i * (FLASH_MS + GAP_MS) + FLASH_MS);
      timeoutsRef.current.push(onT, offT);
    });
    const doneT = setTimeout(() => {
      setStatus('input');
      setUserIndex(0);
    }, seq.length * (FLASH_MS + GAP_MS));
    timeoutsRef.current.push(doneT);
  }

  function startGame() {
    const first = [Math.floor(Math.random() * 4)];
    setSequence(first);
    playSequence(first);
  }

  function handleTap(colorIndex) {
    if (status !== 'input') return;
    setActiveIndex(colorIndex);
    setTimeout(() => setActiveIndex(-1), 200);

    if (colorIndex === sequence[userIndex]) {
      tapLight();
      if (userIndex + 1 === sequence.length) {
        const next = [...sequence, Math.floor(Math.random() * 4)];
        setSequence(next);
        setTimeout(() => playSequence(next), 500);
      } else {
        setUserIndex((i) => i + 1);
      }
    } else {
      hapticError();
      setStatus('done');
    }
  }

  const level = Math.max(0, sequence.length - 1);
  const reward = level * COINS_PER_LEVEL;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Simon Says" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        {status === 'idle' ? (
          <>
            <Text style={styles.bigIcon}>🎵</Text>
            <Text style={[Typography.h3, styles.centerText]}>Watch the pattern, then repeat it!</Text>
            <Text style={[Typography.small, styles.hint]}>{COINS_PER_LEVEL} coins per level survived</Text>
            <Button title="Start" onPress={startGame} style={styles.startBtn} />
          </>
        ) : null}

        {status === 'showing' || status === 'input' ? (
          <>
            <Text style={[Typography.h3, styles.levelText]}>
              Level {sequence.length} · {status === 'showing' ? 'Watch…' : 'Your turn'}
            </Text>
            <View style={styles.grid}>
              {COLORS.map((c, i) => (
                <Pressable
                  key={c.key}
                  onPress={() => handleTap(i)}
                  disabled={status !== 'input'}
                  style={[styles.pad, { backgroundColor: c.bg }, activeIndex === i && styles.padActive]}
                />
              ))}
            </View>
          </>
        ) : null}

        {status === 'done' ? (
          <>
            <Text style={styles.bigIcon}>🏁</Text>
            <Text style={Typography.h2}>Reached level {sequence.length}!</Text>
            <Text style={[Typography.h3, styles.rewardText]}>{formatCoins(reward)} coins earned</Text>
            <Button
              title={reward > 0 ? 'Watch Ad to Claim' : 'Try Again'}
              onPress={() => (reward > 0 ? setShowAd(true) : setStatus('idle'))}
              style={styles.startBtn}
            />
          </>
        ) : null}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={reward}
        rewardLabel="Great memory!"
        onClaim={() => addCoins(reward, { label: 'Simon Says', icon: '🎵' })}
        onClose={() => {
          setShowAd(false);
          setStatus('idle');
          setSequence([]);
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
  levelText: { marginBottom: Spacing.lg },
  grid: {
    width: 240,
    height: 240,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  pad: { width: 115, height: 115, borderRadius: Radius.lg, opacity: 0.55 },
  padActive: { opacity: 1 },
  rewardText: { color: Colors.coin, marginTop: 4, marginBottom: Spacing.sm },
});
