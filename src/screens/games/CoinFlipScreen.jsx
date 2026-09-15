import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import GameHeader from '../../components/GameHeader';
import AdRewardModal from '../../components/AdRewardModal';
import Button from '../../components/Button';
import CoinBadge from '../../components/CoinBadge';
import { Colors, Radius, Spacing, Typography } from '../../utils/theme';
import { formatCoins } from '../../utils/format';
import { tapMedium } from '../../utils/haptics';

const WIN_REWARD = 60;
const LOSE_REWARD = 10;
const FLIP_MS = 900;

export default function CoinFlipScreen() {
  const { coins, addCoins } = useApp();
  const [guess, setGuess] = useState(null);
  const [flipping, setFlipping] = useState(false);
  const [result, setResult] = useState(null);
  const [showAd, setShowAd] = useState(false);

  function pick(choice) {
    if (flipping) return;
    setGuess(choice);
    setFlipping(true);
    setResult(null);
    tapMedium();
    setTimeout(() => {
      setResult(Math.random() < 0.5 ? 'heads' : 'tails');
      setFlipping(false);
    }, FLIP_MS);
  }

  const won = result !== null && result === guess;
  const reward = won ? WIN_REWARD : LOSE_REWARD;

  function reset() {
    setGuess(null);
    setResult(null);
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Coin Flip" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        <Text style={[Typography.small, styles.hint]}>
          Guess right for {formatCoins(WIN_REWARD)} coins, wrong still gets {formatCoins(LOSE_REWARD)}
        </Text>

        <View style={styles.coinBox}>
          <Text style={styles.coinFace}>{flipping ? '🌀' : result === 'heads' ? '🪙' : result === 'tails' ? '⚪' : '❔'}</Text>
        </View>

        {result !== null && !flipping ? (
          <Text style={[Typography.h3, won ? styles.winText : styles.loseText]}>
            {result.toUpperCase()} — {won ? 'You guessed right! 🎉' : 'Not quite this time'}
          </Text>
        ) : null}

        {result === null || flipping ? (
          <View style={styles.choiceRow}>
            <Button
              title="🪙 Heads"
              variant={guess === 'heads' ? 'primary' : 'secondary'}
              onPress={() => pick('heads')}
              disabled={flipping}
              style={styles.choiceBtn}
            />
            <Button
              title="⚪ Tails"
              variant={guess === 'tails' ? 'primary' : 'secondary'}
              onPress={() => pick('tails')}
              disabled={flipping}
              style={styles.choiceBtn}
            />
          </View>
        ) : (
          <Button title="Watch Ad to Claim" onPress={() => setShowAd(true)} style={styles.claimBtn} />
        )}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={reward}
        rewardLabel={won ? 'You called it!' : 'Better luck flip!'}
        onClaim={() => addCoins(reward, { label: 'Coin Flip', icon: '🪙' })}
        onClose={() => {
          setShowAd(false);
          reset();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  hint: { color: Colors.textMuted, marginBottom: Spacing.xl, textAlign: 'center' },
  coinBox: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  coinFace: { fontSize: 80 },
  winText: { color: Colors.success, marginBottom: Spacing.lg, textAlign: 'center' },
  loseText: { color: Colors.textSec, marginBottom: Spacing.lg, textAlign: 'center' },
  choiceRow: { flexDirection: 'row', gap: Spacing.md, alignSelf: 'stretch' },
  choiceBtn: { flex: 1 },
  claimBtn: { alignSelf: 'stretch' },
});
