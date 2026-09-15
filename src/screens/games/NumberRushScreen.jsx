import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import GameHeader from '../../components/GameHeader';
import Card from '../../components/Card';
import CoinBadge from '../../components/CoinBadge';
import AdRewardModal from '../../components/AdRewardModal';
import { Colors, Radius, Spacing, Typography } from '../../utils/theme';
import { tapLight, error as hapticError } from '../../utils/haptics';

const REWARD_PER_CORRECT = 30;
const QUESTION_TIME_S = 5;

function generateProblem() {
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * 20) + 1;
  let b = Math.floor(Math.random() * 12) + 1;
  if (op === '-' && b > a) [a, b] = [b, a];

  let answer;
  if (op === '+') answer = a + b;
  else if (op === '-') answer = a - b;
  else answer = a * b;

  const options = new Set([answer]);
  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 9) - 4;
    const candidate = answer + offset;
    if (candidate !== answer && candidate >= 0) options.add(candidate);
  }
  const shuffled = [...options].sort(() => Math.random() - 0.5);
  return { text: `${a} ${op} ${b}`, answer, options: shuffled };
}

export default function NumberRushScreen() {
  const { coins, addCoins } = useApp();
  const [problem, setProblem] = useState(generateProblem);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_S);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [streak, setStreak] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const pendingRewardRef = useRef(0);

  useEffect(() => {
    if (answered) return;
    if (timeLeft <= 0) {
      hapticError();
      setStreak(0);
      nextQuestion();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, answered]);

  function nextQuestion() {
    setProblem(generateProblem());
    setTimeLeft(QUESTION_TIME_S);
    setAnswered(false);
    setSelected(null);
  }

  function handleSelect(value) {
    if (answered) return;
    setSelected(value);
    setAnswered(true);
    if (value === problem.answer) {
      tapLight();
      pendingRewardRef.current = REWARD_PER_CORRECT + streak * 10;
      setShowAd(true);
    } else {
      hapticError();
      setStreak(0);
      setTimeout(nextQuestion, 700);
    }
  }

  const handleClaim = () => {
    addCoins(pendingRewardRef.current, { label: 'Number Rush', icon: '🔢' });
    setStreak((s) => s + 1);
  };

  const handleAdClose = () => {
    setShowAd(false);
    nextQuestion();
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Number Rush" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        <Text style={[Typography.small, styles.progress]}>
          🔥 Streak: {streak} · ⏱ {timeLeft}s
        </Text>

        <Card style={styles.problemCard}>
          <Text style={styles.problemText}>{problem.text} = ?</Text>
        </Card>

        <View style={styles.options}>
          {problem.options.map((opt) => {
            let optStyle = styles.option;
            if (answered) {
              if (opt === problem.answer) optStyle = [styles.option, styles.optionCorrect];
              else if (opt === selected) optStyle = [styles.option, styles.optionWrong];
              else optStyle = [styles.option, styles.optionMuted];
            }
            return (
              <Pressable key={opt} onPress={() => handleSelect(opt)} style={optStyle} disabled={answered}>
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[Typography.caption, styles.hint]}>
          {REWARD_PER_CORRECT}+ coins per correct answer · streak bonus included
        </Text>
      </View>

      <AdRewardModal
        visible={showAd}
        coins={pendingRewardRef.current}
        rewardLabel="Number Rush"
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
  progress: { color: Colors.textMuted, marginBottom: Spacing.sm, textAlign: 'center' },
  problemCard: { alignItems: 'center', paddingVertical: Spacing.xl, marginBottom: Spacing.lg },
  problemText: { ...Typography.h1 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, justifyContent: 'space-between' },
  option: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 18,
    alignItems: 'center',
  },
  optionCorrect: { backgroundColor: '#E8F9EF', borderColor: Colors.success },
  optionWrong: { backgroundColor: '#FDEBEA', borderColor: Colors.danger },
  optionMuted: { opacity: 0.5 },
  optionText: { ...Typography.h2 },
  hint: { textAlign: 'center', marginTop: Spacing.lg, color: Colors.textMuted },
});
