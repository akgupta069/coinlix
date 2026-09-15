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
import { tapMedium, error as hapticError } from '../../utils/haptics';
import { showToast } from '../../components/Toast';

const TOTAL_ROUNDS = 5;

function rewardForReaction(ms) {
  return Math.max(5, Math.round(60 - ms / 30));
}

export default function ReflexTapScreen() {
  const { coins, addCoins } = useApp();
  const [status, setStatus] = useState('idle'); // idle | waiting | go | done
  const [round, setRound] = useState(0);
  const [total, setTotal] = useState(0);
  const [lastMs, setLastMs] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const timeoutRef = useRef(null);
  const goAtRef = useRef(0);

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  function armRound() {
    setStatus('waiting');
    const delay = 1000 + Math.random() * 2200;
    timeoutRef.current = setTimeout(() => {
      goAtRef.current = Date.now();
      setStatus('go');
    }, delay);
  }

  function startGame() {
    setTotal(0);
    setRound(0);
    armRound();
  }

  function handleTap() {
    if (status === 'waiting') {
      clearTimeout(timeoutRef.current);
      hapticError();
      showToast('Too soon! Wait for green', 'error');
      armRound();
      return;
    }
    if (status === 'go') {
      const ms = Date.now() - goAtRef.current;
      const reward = rewardForReaction(ms);
      setLastMs(ms);
      setTotal((t) => t + reward);
      tapMedium();
      const nextRound = round + 1;
      if (nextRound >= TOTAL_ROUNDS) {
        setStatus('done');
      } else {
        setRound(nextRound);
        armRound();
      }
    }
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Reflex Tap" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        {status === 'idle' ? (
          <>
            <Text style={styles.bigIcon}>⚡</Text>
            <Text style={[Typography.h3, styles.centerText]}>Tap the instant the screen turns green!</Text>
            <Text style={[Typography.small, styles.hint]}>{TOTAL_ROUNDS} rounds · faster taps earn more coins</Text>
            <Button title="Start" onPress={startGame} style={styles.startBtn} />
          </>
        ) : null}

        {status === 'waiting' || status === 'go' ? (
          <>
            <Text style={[Typography.small, styles.hint]}>Round {round + 1} of {TOTAL_ROUNDS}</Text>
            <Pressable
              onPress={handleTap}
              style={[styles.zone, status === 'go' ? styles.zoneGo : styles.zoneWait]}
            >
              <Text style={styles.zoneText}>{status === 'go' ? 'TAP NOW!' : 'Wait…'}</Text>
            </Pressable>
            {lastMs !== null ? (
              <Text style={[Typography.caption, styles.lastMs]}>Last: {lastMs}ms</Text>
            ) : null}
          </>
        ) : null}

        {status === 'done' ? (
          <>
            <Text style={styles.bigIcon}>🏁</Text>
            <Text style={Typography.h2}>Nice reflexes!</Text>
            <Text style={[Typography.h3, styles.rewardText]}>{formatCoins(total)} coins earned</Text>
            <Button title="Watch Ad to Claim" onPress={() => setShowAd(true)} style={styles.startBtn} />
          </>
        ) : null}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={total}
        rewardLabel="Lightning fast!"
        onClaim={() => addCoins(total, { label: 'Reflex Tap', icon: '⚡' })}
        onClose={() => {
          setShowAd(false);
          setStatus('idle');
          setLastMs(null);
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
  zone: {
    width: 280,
    height: 280,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoneWait: { backgroundColor: Colors.danger },
  zoneGo: { backgroundColor: Colors.success },
  zoneText: { ...Typography.h1, color: Colors.white },
  lastMs: { marginTop: Spacing.md, color: Colors.textMuted },
  rewardText: { color: Colors.coin, marginTop: 4, marginBottom: Spacing.sm },
});
