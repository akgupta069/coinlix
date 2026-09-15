import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { Colors, Spacing, Typography } from '../utils/theme';
import { showToast } from '../components/Toast';

export default function LoginScreen() {
  const { signInWithGoogle, continueAsGuest, canSignInWithGoogle, error, clearError } = useAuth();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (error) {
      showToast(error, 'error');
      clearError();
      setBusy(false);
    }
  }, [error]);

  const handleGoogle = async () => {
    setBusy(true);
    await signInWithGoogle();
    setBusy(false);
  };

  return (
    <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.hero}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} />
          <Text style={styles.appName}>CoinLix</Text>
          <Text style={styles.tagline}>Play games. Earn coins. Redeem real rewards.</Text>
        </View>

        <View style={styles.card}>
          <Text style={Typography.h2}>Welcome</Text>
          <Text style={[Typography.small, styles.subtitle]}>
            Sign in to save your coins to the cloud, or continue as a guest.
          </Text>

          <Button
            title="Continue with Google"
            onPress={handleGoogle}
            loading={busy}
            disabled={!canSignInWithGoogle}
            style={styles.btn}
          />
          <Button
            title="Continue as Guest"
            variant="secondary"
            onPress={continueAsGuest}
            style={styles.btn}
          />

          <Text style={[Typography.caption, styles.note]}>
            Guest progress stays on this device only — sign in with Google to keep your coins safe
            across devices.
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 96, height: 96, borderRadius: 24 },
  appName: { fontSize: 32, fontWeight: '800', color: Colors.white, marginTop: Spacing.sm },
  tagline: { color: 'rgba(255,255,255,0.85)', marginTop: Spacing.xs, textAlign: 'center', paddingHorizontal: Spacing.xl },
  card: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.xl,
    paddingBottom: Spacing.xl + 8,
  },
  subtitle: { marginTop: 4, marginBottom: Spacing.lg, color: Colors.textSec },
  btn: { marginBottom: Spacing.sm },
  note: { marginTop: Spacing.sm, textAlign: 'center' },
});
