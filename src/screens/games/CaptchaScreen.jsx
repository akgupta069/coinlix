import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useApp } from '../../context/AppContext';
import GameHeader from '../../components/GameHeader';
import Button from '../../components/Button';
import CoinBadge from '../../components/CoinBadge';
import Card from '../../components/Card';
import AdRewardModal from '../../components/AdRewardModal';
import { Colors, Radius, Spacing, Typography } from '../../utils/theme';
import { formatCoins } from '../../utils/format';
import { success as hapticSuccess, error as hapticError } from '../../utils/haptics';
import { showToast } from '../../components/Toast';

const REWARD = 60;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const STATE_KEY = 'coinlix_captcha_last';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function generateCode() {
  let code = '';
  for (let i = 0; i < 5; i++) code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return code;
}

export default function CaptchaScreen() {
  const { coins, addCoins } = useApp();
  const [code, setCode] = useState(generateCode);
  const [input, setInput] = useState('');
  const [doneToday, setDoneToday] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showAd, setShowAd] = useState(false);

  useEffect(() => {
    (async () => {
      const last = await AsyncStorage.getItem(STATE_KEY);
      setDoneToday(last === todayKey());
      setLoaded(true);
    })();
  }, []);

  const verify = async () => {
    if (input.trim().toUpperCase() === code) {
      hapticSuccess();
      setShowAd(true);
    } else {
      hapticError();
      showToast('Incorrect — try the new code', 'error');
      setCode(generateCode());
      setInput('');
    }
  };

  const handleClaim = async () => {
    addCoins(REWARD, { label: 'Captcha completed', icon: '🔤' });
    await AsyncStorage.setItem(STATE_KEY, todayKey());
    setDoneToday(true);
    showToast(`+${formatCoins(REWARD)} coins added!`, 'success');
  };

  const handleAdClose = () => {
    setShowAd(false);
    if (!doneToday) {
      setCode(generateCode());
      setInput('');
    }
  };

  if (!loaded) return null;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Captcha" right={<CoinBadge amount={coins} size="sm" />} />

      <View style={styles.body}>
        {doneToday ? (
          <>
            <Text style={styles.bigIcon}>✅</Text>
            <Text style={Typography.h3}>Already completed today</Text>
            <Text style={[Typography.small, styles.hint]}>Come back tomorrow for another one</Text>
          </>
        ) : (
          <>
            <Text style={[Typography.small, styles.hint]}>Type the code exactly as shown</Text>
            <Card style={styles.codeCard}>
              <View style={styles.codeRow}>
                {code.split('').map((ch, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.codeChar,
                      { transform: [{ rotate: `${(i % 2 === 0 ? -1 : 1) * (6 + i * 2)}deg` }] },
                    ]}
                  >
                    {ch}
                  </Text>
                ))}
              </View>
            </Card>
            <TextInput
              value={input}
              onChangeText={(t) => setInput(t.toUpperCase())}
              placeholder="Enter code"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
              maxLength={5}
              style={styles.input}
            />
            <Button title="Verify" onPress={verify} disabled={input.length < 5} style={styles.verifyBtn} />
          </>
        )}
      </View>

      <AdRewardModal
        visible={showAd}
        coins={REWARD}
        rewardLabel="Captcha completed"
        autoClaim
        onClaim={handleClaim}
        onClose={handleAdClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  bigIcon: { fontSize: 44, marginBottom: Spacing.sm },
  hint: { color: Colors.textMuted, marginBottom: Spacing.lg, textAlign: 'center' },
  codeCard: { alignSelf: 'stretch', marginBottom: Spacing.lg, backgroundColor: Colors.surfaceAlt },
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  codeChar: { fontSize: 32, fontWeight: '800', color: Colors.text, letterSpacing: 2 },
  input: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    fontSize: 20,
    letterSpacing: 4,
    textAlign: 'center',
    color: Colors.text,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.lg,
  },
  verifyBtn: { alignSelf: 'stretch' },
});
