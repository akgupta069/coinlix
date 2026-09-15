import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import GameHeader from '../../components/GameHeader';
import AdRewardModal from '../../components/AdRewardModal';
import Card from '../../components/Card';
import CoinBadge from '../../components/CoinBadge';
import { Colors, Radius, Spacing, Typography } from '../../utils/theme';
import { shuffledQuestions } from '../../data/quizQuestions';
import { tapLight, error as hapticError } from '../../utils/haptics';
import { showToast } from '../../components/Toast';

const REWARD_PER_CORRECT = 40;

export default function QuizScreen() {
  const { coins, addCoins } = useApp();
  const [questions, setQuestions] = useState(() => shuffledQuestions());
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const question = questions[index];

  useEffect(() => {
    if (!answered || selected === question.correct) return;
    const t = setTimeout(() => goToNext(), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answered]);

  function goToNext() {
    const nextIndex = index + 1;
    if (nextIndex >= questions.length) {
      showToast('New round started!', 'success');
      setQuestions(shuffledQuestions());
      setIndex(0);
    } else {
      setIndex(nextIndex);
    }
    setSelected(null);
    setAnswered(false);
  }

  function handleSelect(optionIndex) {
    if (answered) return;
    setSelected(optionIndex);
    setAnswered(true);
    if (optionIndex === question.correct) {
      tapLight();
      setCorrectCount((c) => c + 1);
      setTimeout(() => setShowAd(true), 400);
    } else {
      hapticError();
    }
  }

  function optionStyle(optionIndex) {
    if (!answered) return styles.option;
    if (optionIndex === question.correct) return [styles.option, styles.optionCorrect];
    if (optionIndex === selected) return [styles.option, styles.optionWrong];
    return [styles.option, styles.optionMuted];
  }

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Quiz Rush" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        <Text style={[Typography.caption, styles.progress]}>
          Question {index + 1} of {questions.length} · {correctCount} correct this round
        </Text>

        <Card style={styles.questionCard}>
          <Text style={Typography.h3}>{question.q}</Text>
        </Card>

        <View style={styles.options}>
          {question.options.map((opt, i) => (
            <Pressable key={i} onPress={() => handleSelect(i)} style={optionStyle(i)} disabled={answered}>
              <Text style={styles.optionText}>{opt}</Text>
            </Pressable>
          ))}
        </View>

        {answered && selected !== question.correct ? (
          <Text style={[Typography.small, styles.wrongNote]}>
            Not quite — next question coming up.
          </Text>
        ) : null}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={REWARD_PER_CORRECT}
        rewardLabel="Correct!"
        autoClaim
        onClaim={() => addCoins(REWARD_PER_CORRECT, { label: 'Quiz correct answer', icon: '🧠' })}
        onClose={() => {
          setShowAd(false);
          goToNext();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, paddingHorizontal: Spacing.lg },
  progress: { color: Colors.textMuted, marginBottom: Spacing.sm },
  questionCard: { marginBottom: Spacing.lg, paddingVertical: Spacing.lg },
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
  wrongNote: { marginTop: Spacing.md, color: Colors.textSec, textAlign: 'center' },
});
