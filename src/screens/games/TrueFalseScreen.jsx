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
import { randomStatement } from '../../data/trueFalseStatements';

const REWARD_PER_CORRECT = 25;

export default function TrueFalseScreen() {
  const { coins, addCoins } = useApp();
  const [statement, setStatement] = useState(randomStatement);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [streak, setStreak] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const pendingRewardRef = useRef(0);

  function handleAnswer(choice) {
    if (answered) return;
    const isRight = choice === statement.answer;
    setAnswered(true);
    setCorrect(isRight);
    if (isRight) {
      tapLight();
      pendingRewardRef.current = REWARD_PER_CORRECT + streak * 10;
      setShowAd(true);
    } else {
      hapticError();
      setStreak(0);
      setTimeout(() => {
        setStatement(randomStatement());
        setAnswered(false);
      }, 900);
    }
  }

  const handleClaim = () => {
    addCoins(pendingRewardRef.current, { label: 'True or False', icon: '❓' });
    setStreak((s) => s + 1);
    showToast(`+${formatCoins(pendingRewardRef.current)} coins!`, 'success');
  };

  const handleAdClose = () => {
    setShowAd(false);
    setStatement(randomStatement());
    setAnswered(false);
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="True or False" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        <Text style={[Typography.small, styles.hint]}>🔥 Streak: {streak}</Text>

        <Card style={[styles.statementCard, answered && (correct ? styles.correctCard : styles.wrongCard)]}>
          <Text style={Typography.h3}>{statement.text}</Text>
        </Card>

        <View style={styles.optionsRow}>
          <Pressable
            onPress={() => handleAnswer(true)}
            disabled={answered}
            style={[styles.option, styles.trueOption]}
          >
            <Text style={styles.optionText}>✅ TRUE</Text>
          </Pressable>
          <Pressable
            onPress={() => handleAnswer(false)}
            disabled={answered}
            style={[styles.option, styles.falseOption]}
          >
            <Text style={styles.optionText}>❌ FALSE</Text>
          </Pressable>
        </View>
        <Text style={[Typography.caption, styles.rewardHint]}>
          {REWARD_PER_CORRECT}+ coins per correct answer
        </Text>
      </View>

      <AdRewardModal
        visible={showAd}
        coins={pendingRewardRef.current}
        rewardLabel="True or False"
        autoClaim
        onClaim={handleClaim}
        onClose={handleAdClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, alignItems: 'center' },
  hint: { color: Colors.textMuted, marginBottom: Spacing.md },
  statementCard: { alignSelf: 'stretch', alignItems: 'center', paddingVertical: Spacing.xl, marginBottom: Spacing.xl },
  correctCard: { backgroundColor: '#E8F9EF', borderColor: Colors.success },
  wrongCard: { backgroundColor: '#FDEBEA', borderColor: Colors.danger },
  optionsRow: { flexDirection: 'row', gap: Spacing.md, alignSelf: 'stretch' },
  option: { flex: 1, borderRadius: Radius.lg, paddingVertical: 20, alignItems: 'center' },
  trueOption: { backgroundColor: Colors.success },
  falseOption: { backgroundColor: Colors.danger },
  optionText: { ...Typography.h3, color: Colors.white },
  rewardHint: { color: Colors.textMuted, marginTop: Spacing.lg },
});
