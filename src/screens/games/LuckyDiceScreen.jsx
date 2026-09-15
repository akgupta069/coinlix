import React, { useRef, useState } from 'react';
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

const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const REWARDS = [10, 20, 30, 50, 80, 120];
const ROLL_MS = 1000;
const TICK_MS = 80;

export default function LuckyDiceScreen() {
  const { coins, addCoins } = useApp();
  const [rolling, setRolling] = useState(false);
  const [face, setFace] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const intervalRef = useRef(null);

  function roll() {
    if (rolling) return;
    setRolling(true);
    setFace(null);
    tapMedium();

    intervalRef.current = setInterval(() => {
      setFace(Math.floor(Math.random() * 6));
    }, TICK_MS);

    setTimeout(() => {
      clearInterval(intervalRef.current);
      const finalFace = Math.floor(Math.random() * 6);
      setFace(finalFace);
      setRolling(false);
    }, ROLL_MS);
  }

  const reward = face !== null ? REWARDS[face] : 0;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Lucky Dice" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        <Text style={[Typography.small, styles.hint]}>Roll the die · up to {formatCoins(600)} coins</Text>

        <View style={styles.diceBox}>
          <Text style={styles.diceFace}>{face !== null ? FACES[face] : '🎲'}</Text>
        </View>

        {face !== null && !rolling ? (
          <Text style={styles.resultText}>You rolled a {face + 1}! +{formatCoins(reward)} coins</Text>
        ) : null}

        <Button
          title={rolling ? 'Rolling…' : face !== null ? 'Watch Ad to Claim' : 'Roll the Dice'}
          onPress={face !== null && !rolling ? () => setShowAd(true) : roll}
          disabled={rolling}
          style={styles.rollBtn}
        />
      </View>

      <AdRewardModal
        visible={showAd}
        coins={reward}
        rewardLabel="Lucky roll!"
        onClaim={() => addCoins(reward, { label: 'Lucky Dice', icon: '🎲' })}
        onClose={() => {
          setShowAd(false);
          setFace(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.xl },
  hint: { color: Colors.textMuted, marginBottom: Spacing.xl },
  diceBox: {
    width: 160,
    height: 160,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  diceFace: { fontSize: 90 },
  resultText: { ...Typography.h3, color: Colors.success, textAlign: 'center', marginBottom: Spacing.lg },
  rollBtn: { alignSelf: 'stretch', marginTop: Spacing.md },
});
