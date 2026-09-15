import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import GameHeader from '../components/GameHeader';
import CoinBadge from '../components/CoinBadge';
import RedeemCodeModal from '../components/RedeemCodeModal';
import { Colors, Radius, Spacing, Typography, Shadows } from '../utils/theme';
import { formatCoins } from '../utils/format';
import { showToast } from '../components/Toast';
import { tapLight } from '../utils/haptics';
import { DEFAULT_REDEEM_CARDS, DELIVERY_LINK, normalizeRedeemCard } from '../data/redeemCodes';
import { readRedeemCodesConfig } from '../services/firestoreStore';

export default function RedeemCodeScreen() {
  const navigation = useNavigation();
  const { coins, spendCoins } = useApp();
  const { user, isGuest, signInWithGoogle } = useAuth();
  const [cards, setCards] = useState(DEFAULT_REDEEM_CARDS);
  const [link, setLink] = useState(DELIVERY_LINK);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      const remote = await readRedeemCodesConfig();
      if (remote?.cards?.length) setCards(remote.cards.map(normalizeRedeemCard));
      if (remote?.deliveryLink) setLink(remote.deliveryLink);
    })();
  }, []);

  // Guests can open the modal to see how far off they are — the sign-in gate
  // only matters at the point coins actually get spent.
  const handleGet = (card) => setSelected(card);

  const handleClaim = () => {
    const card = selected;
    if (!card) return;
    if (!user) {
      setSelected(null);
      showToast('Sign in with Google to redeem codes', 'error');
      if (isGuest) signInWithGoogle();
      return;
    }
    const spend = spendCoins(card.coins, {
      label: `${card.brand} ₹${card.inr}`,
      icon: '🎫',
    });
    if (!spend.ok) {
      showToast('Could not redeem — please try again', 'error');
      return;
    }
    setSelected(null);
    Linking.openURL(link).catch(() => {
      showToast('Could not open the code page', 'error');
    });
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <GameHeader title="Redeem Code" right={<CoinBadge amount={coins} size="sm" />} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.introRow}>
          <View style={styles.introIconWrap}>
            <Text style={styles.introIcon}>🎫</Text>
          </View>
          <View style={styles.flex1}>
            <Text style={Typography.h3}>Redeem Code Giveaway</Text>
            <Text style={[Typography.small, styles.introSub]}>Browse codes by denomination</Text>
          </View>
        </View>

        {cards.map((card) => {
          const affordable = coins >= card.coins;
          return (
            <View key={card.id} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>₹{formatCoins(card.inr)} Cards</Text>
                <Text style={[styles.groupCount, affordable && styles.groupCountReady]}>
                  {affordable ? 'Unlocked' : '🔒 Locked'}
                </Text>
              </View>

              <View style={styles.card}>
                <View style={styles.cardTopRow}>
                  <View style={styles.flex1}>
                    <Text style={styles.brand}>{card.brand}</Text>
                    <Text style={styles.sub}>{card.sub}</Text>
                  </View>
                  <Text style={styles.inr}>₹{formatCoins(card.inr)}</Text>
                </View>

                <View style={styles.cardBottomRow}>
                  <View style={styles.coinsPill}>
                    <Text style={styles.coinsText}>🪙 {formatCoins(card.coins)}</Text>
                  </View>
                  <Pressable
                    onPress={() => {
                      tapLight();
                      handleGet(card);
                    }}
                    style={[styles.getBtn, !affordable && styles.getBtnLocked]}
                  >
                    <Text style={styles.getText}>
                      {affordable ? 'Get This' : '🔒 Get This'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}

        <Text style={[Typography.caption, styles.footNote]}>
          Codes are issued on the redeem page after your coins are deducted.
        </Text>
      </ScrollView>

      <RedeemCodeModal
        visible={!!selected}
        card={selected}
        coins={coins}
        onClose={() => setSelected(null)}
        onEarnMore={() => {
          setSelected(null);
          navigation.navigate('Games');
        }}
        onClaim={handleClaim}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },

  introRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  introIconWrap: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card,
  },
  introIcon: { fontSize: 24 },
  introSub: { color: Colors.textMuted, marginTop: 2 },

  group: { marginBottom: Spacing.lg },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  groupTitle: { ...Typography.h3, fontWeight: '800' },
  groupCount: { ...Typography.small, color: Colors.textMuted, fontWeight: '700' },
  groupCountReady: { color: Colors.success },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  brand: { ...Typography.small, color: Colors.textMuted, fontWeight: '700' },
  sub: { ...Typography.h3, fontWeight: '800', marginTop: 1 },
  inr: { fontSize: 26, fontWeight: '900', color: Colors.text },

  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  coinsPill: { paddingHorizontal: Spacing.sm },
  coinsText: { ...Typography.small, fontWeight: '800', color: Colors.text, letterSpacing: 1 },
  getBtn: {
    backgroundColor: Colors.success,
    borderRadius: Radius.md,
    paddingVertical: 10,
    paddingHorizontal: Spacing.lg,
  },
  getBtnLocked: { backgroundColor: Colors.textMuted },
  getText: { ...Typography.small, color: Colors.white, fontWeight: '800' },

  footNote: { textAlign: 'center', color: Colors.textMuted, marginTop: Spacing.sm },
});
