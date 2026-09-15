import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import GameHeader from '../../components/GameHeader';
import Button from '../../components/Button';
import Card from '../../components/Card';
import CoinBadge from '../../components/CoinBadge';
import AdRewardModal from '../../components/AdRewardModal';
import { Colors, Radius, Spacing, Typography } from '../../utils/theme';
import { formatCoins } from '../../utils/format';
import { success as hapticSuccess, error as hapticError } from '../../utils/haptics';
import { showToast } from '../../components/Toast';
import { scrambleWord, randomWord } from '../../data/scrambleWords';

const REWARD_PER_CORRECT = 30;

export default function WordScrambleScreen() {
  const { coins, addCoins } = useApp();
  const [word, setWord] = useState(randomWord);
  const [scrambled, setScrambled] = useState(() => scrambleWord(word));
  const [input, setInput] = useState('');
  const [solved, setSolved] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const pendingRewardRef = useRef(0);

  function nextWord() {
    const w = randomWord();
    setWord(w);
    setScrambled(scrambleWord(w));
    setInput('');
  }

  function submit() {
    if (input.trim().toUpperCase() === word) {
      hapticSuccess();
      pendingRewardRef.current = REWARD_PER_CORRECT;
      setShowAd(true);
    } else {
      hapticError();
      showToast('Not quite — try again', 'error');
    }
  }

  const handleClaim = () => {
    addCoins(pendingRewardRef.current, { label: 'Word Scramble', icon: '🔤' });
    setSolved((s) => s + 1);
    showToast(`+${formatCoins(pendingRewardRef.current)} coins!`, 'success');
  };

  const handleAdClose = () => {
    setShowAd(false);
    nextWord();
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Word Scramble" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        <Text style={[Typography.small, styles.hint]}>Solved: {solved} · {REWARD_PER_CORRECT} coins each</Text>

        <Card style={styles.wordCard}>
          <Text style={styles.scrambledText}>{scrambled.split('').join(' ')}</Text>
        </Card>

        <TextInput
          value={input}
          onChangeText={(t) => setInput(t.toUpperCase())}
          placeholder="Type your answer"
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="characters"
          style={styles.input}
          onSubmitEditing={submit}
        />
        <Button title="Submit" onPress={submit} disabled={!input.trim()} style={styles.submitBtn} />
        <Button title="Skip Word" variant="ghost" onPress={nextWord} />
      </View>

      <AdRewardModal
        visible={showAd}
        coins={pendingRewardRef.current}
        rewardLabel="Word Scramble"
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
  hint: { color: Colors.textMuted, marginBottom: Spacing.lg },
  wordCard: { alignSelf: 'stretch', alignItems: 'center', paddingVertical: Spacing.xl, marginBottom: Spacing.lg },
  scrambledText: { fontSize: 34, fontWeight: '900', letterSpacing: 4, color: Colors.primary },
  input: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    fontSize: 18,
    letterSpacing: 2,
    textAlign: 'center',
    color: Colors.text,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  submitBtn: { alignSelf: 'stretch', marginBottom: Spacing.xs },
});
