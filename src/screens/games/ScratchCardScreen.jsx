import React, { useRef, useState } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import GameHeader from '../../components/GameHeader';
import AdRewardModal from '../../components/AdRewardModal';
import Button from '../../components/Button';
import CoinBadge from '../../components/CoinBadge';
import { Colors, Radius, Spacing, Typography } from '../../utils/theme';
import { formatCoins } from '../../utils/format';
import { tapMedium } from '../../utils/haptics';

const PRIZES = [10, 20, 30, 40, 60, 100];

export default function ScratchCardScreen() {
  const { coins, addCoins } = useApp();
  const [prize, setPrize] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const flip = useRef(new Animated.Value(0)).current;

  const scratch = () => {
    if (revealed) return;
    const value = PRIZES[Math.floor(Math.random() * PRIZES.length)];
    setPrize(value);
    tapMedium();
    Animated.timing(flip, { toValue: 1, duration: 450, useNativeDriver: true }).start(() => {
      setRevealed(true);
    });
  };

  const playAgain = () => {
    setRevealed(false);
    setPrize(null);
    flip.setValue(0);
  };

  const coverOpacity = flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.3, 0] });
  const revealScale = flip.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Scratch Card" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        <Text style={[Typography.small, styles.hint]}>Tap the card to scratch it</Text>

        <Pressable onPress={scratch} disabled={revealed}>
          <View style={styles.cardWrap}>
            <Animated.View style={[styles.reveal, { transform: [{ scale: revealScale }] }]}>
              <Text style={styles.revealIcon}>🪙</Text>
              <Text style={styles.revealText}>{prize !== null ? formatCoins(prize) : ''}</Text>
            </Animated.View>
            <Animated.View pointerEvents="none" style={[styles.cover, { opacity: coverOpacity }]}>
              <Text style={styles.coverIcon}>🎟️</Text>
              <Text style={styles.coverText}>Tap to scratch</Text>
            </Animated.View>
          </View>
        </Pressable>

        {revealed ? (
          <Button title="Watch Ad to Claim" onPress={() => setShowAd(true)} style={styles.actionBtn} />
        ) : null}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={prize || 0}
        rewardLabel="Card revealed!"
        onClaim={() => addCoins(prize, { label: 'Scratch Card', icon: '🎟️' })}
        onClose={() => {
          setShowAd(false);
          playAgain();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  hint: { color: Colors.textMuted, marginBottom: Spacing.lg },
  cardWrap: {
    width: 240,
    height: 160,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  reveal: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFF6DD',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
  },
  revealIcon: { fontSize: 36 },
  revealText: { ...Typography.h1, color: '#8A6A00', marginTop: 4 },
  cover: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
  },
  coverIcon: { fontSize: 32, marginBottom: 8 },
  coverText: { color: Colors.white, fontWeight: '600' },
  actionBtn: { alignSelf: 'stretch', marginTop: Spacing.xl },
});
