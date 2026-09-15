import React, { useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import GameHeader from '../../components/GameHeader';
import Card from '../../components/Card';
import CoinBadge from '../../components/CoinBadge';
import AdRewardModal from '../../components/AdRewardModal';
import { Colors, Radius, Spacing, Typography } from '../../utils/theme';
import { formatCoins } from '../../utils/format';
import { tapLight, error as hapticError } from '../../utils/haptics';
import { showToast } from '../../components/Toast';
import { randomRiddle } from '../../data/emojiRiddles';

const REWARD_PER_CORRECT = 30;

export default function EmojiRiddleScreen() {
  const { coins, addCoins } = useApp();
  const [riddle, setRiddle] = useState(randomRiddle);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [solved, setSolved] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const pendingRewardRef = useRef(0);

  function handleSelect(i) {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    if (i === riddle.correct) {
      tapLight();
      pendingRewardRef.current = REWARD_PER_CORRECT;
      setShowAd(true);
    } else {
      hapticError();
      setTimeout(() => {
        setRiddle(randomRiddle());
        setSelected(null);
        setAnswered(false);
      }, 1000);
    }
  }

  const handleClaim = () => {
    addCoins(pendingRewardRef.current, { label: 'Emoji Riddle', icon: '🧩' });
    setSolved((s) => s + 1);
    showToast(`+${formatCoins(pendingRewardRef.current)} coins!`, 'success');
  };

  const handleAdClose = () => {
    setShowAd(false);
    setRiddle(randomRiddle());
    setSelected(null);
    setAnswered(false);
  };

  function optionStyle(i) {
    if (!answered) return styles.option;
    if (i === riddle.correct) return [styles.option, styles.optionCorrect];
    if (i === selected) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionMuted];
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Emoji Riddle" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        <Text style={[Typography.small, styles.hint]}>Solved: {solved} · {REWARD_PER_CORRECT} coins each</Text>

        <Card style={styles.riddleCard}>
          <Text style={styles.emojiText}>{riddle.emoji}</Text>
        </Card>

        <View style={styles.options}>
          {riddle.options.map((opt, i) => (
            <Pressable key={opt} onPress={() => handleSelect(i)} style={optionStyle(i)} disabled={answered}>
              <Text style={styles.optionText}>{opt}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <AdRewardModal
        visible={showAd}
        coins={pendingRewardRef.current}
        rewardLabel="Emoji Riddle"
        autoClaim
        onClaim={handleClaim}
        onClose={handleAdClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  hint: { color: Colors.textMuted, marginBottom: Spacing.sm, textAlign: 'center' },
  riddleCard: { alignItems: 'center', paddingVertical: Spacing.xl, marginBottom: Spacing.lg },
  emojiText: { fontSize: 56 },
  options: { gap: Spacing.sm },
  option: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  optionCorrect: { backgroundColor: '#E8F9EF', borderColor: Colors.success },
  optionWrong: { backgroundColor: '#FDEBEA', borderColor: Colors.danger },
  optionMuted: { opacity: 0.5 },
  optionText: { ...Typography.body },
});
