import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import GameHeader from '../../components/GameHeader';
import AdRewardModal from '../../components/AdRewardModal';
import Button from '../../components/Button';
import CoinBadge from '../../components/CoinBadge';
import { Colors, Radius, Spacing, Typography } from '../../utils/theme';
import { formatCoins } from '../../utils/format';
import { tapLight, success as hapticSuccess } from '../../utils/haptics';

const ICONS = ['🍕', '🚀', '🎧', '⚽', '🐱', '🌟'];
const PAIR_COUNT = ICONS.length;

function newDeck() {
  const deck = [...ICONS, ...ICONS]
    .map((value, i) => ({ id: i, value, flipped: false, matched: false }))
    .sort(() => Math.random() - 0.5);
  return deck;
}

function computeReward(moves) {
  const extra = Math.max(0, moves - PAIR_COUNT);
  return Math.max(20, 100 - extra * 4);
}

export default function MemoryMatchScreen() {
  const { coins, addCoins } = useApp();
  const [cards, setCards] = useState(newDeck);
  const [picks, setPicks] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [done, setDone] = useState(false);
  const [showAd, setShowAd] = useState(false);

  const reward = computeReward(moves);

  function reset() {
    setCards(newDeck());
    setPicks([]);
    setMoves(0);
    setLocked(false);
    setDone(false);
  }

  function handleFlip(index) {
    if (locked || cards[index].flipped || cards[index].matched || picks.length === 2) return;
    tapLight();
    const nextCards = cards.map((c, i) => (i === index ? { ...c, flipped: true } : c));
    const nextPicks = [...picks, index];
    setCards(nextCards);
    setPicks(nextPicks);

    if (nextPicks.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = nextPicks;
      if (nextCards[a].value === nextCards[b].value) {
        const matchedCards = nextCards.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c));
        setCards(matchedCards);
        setPicks([]);
        if (matchedCards.every((c) => c.matched)) {
          hapticSuccess();
          setTimeout(() => setDone(true), 300);
        }
      } else {
        setLocked(true);
        setTimeout(() => {
          setCards((prev) => prev.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)));
          setPicks([]);
          setLocked(false);
        }, 700);
      }
    }
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Memory Match" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        {!done ? (
          <>
            <Text style={[Typography.small, styles.hint]}>Moves: {moves}</Text>
            <View style={styles.grid}>
              {cards.map((card, i) => (
                <Pressable key={card.id} onPress={() => handleFlip(i)} style={styles.cardSlot}>
                  <View style={[styles.card, (card.flipped || card.matched) && styles.cardFlipped]}>
                    <Text style={styles.cardText}>
                      {card.flipped || card.matched ? card.value : '❔'}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <>
            <Text style={styles.bigIcon}>🏆</Text>
            <Text style={Typography.h2}>Matched in {moves} moves!</Text>
            <Text style={[Typography.h3, styles.rewardText]}>{formatCoins(reward)} coins earned</Text>
            <Button title="Watch Ad to Claim" onPress={() => setShowAd(true)} style={styles.actionBtn} />
          </>
        )}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={reward}
        rewardLabel="Well matched!"
        onClaim={() => addCoins(reward, { label: 'Memory Match', icon: '🃏' })}
        onClose={() => {
          setShowAd(false);
          reset();
        }}
      />
    </SafeAreaView>
  );
}

const CARD_SIZE = 72;

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  hint: { color: Colors.textMuted, marginBottom: Spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'center', maxWidth: CARD_SIZE * 4 + Spacing.sm * 3 },
  cardSlot: { width: CARD_SIZE, height: CARD_SIZE },
  card: {
    flex: 1,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFlipped: { backgroundColor: Colors.surfaceAlt, borderWidth: 1, borderColor: Colors.border },
  cardText: { fontSize: 28 },
  bigIcon: { fontSize: 44, marginBottom: Spacing.sm },
  rewardText: { color: Colors.coin, marginTop: 4, marginBottom: Spacing.sm },
  actionBtn: { alignSelf: 'stretch', marginTop: Spacing.lg },
});
