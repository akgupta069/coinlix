import React from 'react';
import { View, Text, Image, ScrollView, Share, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Button from '../components/Button';
import SectionHeader from '../components/SectionHeader';
import DailyCheckInCard from '../components/DailyCheckInCard';
import QuickEarnCard from '../components/QuickEarnCard';
import GameThumbnailCard from '../components/GameThumbnailCard';
import Card from '../components/Card';
import { Colors, Radius, Spacing, Typography } from '../utils/theme';
import { formatCoins } from '../utils/format';
import { showToast } from '../components/Toast';
import quickEarn from '../data/quickEarn';
import games from '../data/games';

const HOME_GAMES = games.slice(0, 6);

export default function HomeScreen() {
  const navigation = useNavigation();
  const { profile, signInWithGoogle } = useAuth();
  const { coins, config } = useApp();

  const shareReferral = async () => {
    if (!profile?.referCode) return;
    try {
      await Share.share({
        message: `Join CoinLix and earn real rewards! Use my code ${profile.referCode} to get a bonus when you sign up.`,
      });
    } catch {
      // user dismissed share sheet — nothing to do
    }
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      >
        <View style={styles.stickyHeader}>
          <View style={styles.topRow}>
            <View style={styles.brandRow}>
              <Image source={require('../../assets/icon.png')} style={styles.brandIcon} />
              <View>
                <Text style={styles.brandName}>CoinLix</Text>
                <Text style={styles.brandTagline}>Play · Earn · Redeem</Text>
              </View>
            </View>
            <View style={styles.topRowRight}>
              <Pressable
                style={styles.moonBtn}
                hitSlop={8}
                onPress={() => showToast('Dark mode coming soon')}
              >
                <Text style={styles.moonIcon}>🌙</Text>
              </Pressable>
              <LinearGradient
                colors={['#F9C846', '#F5A623']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.balancePill}
              >
                <View style={styles.balanceIconWrap}>
                  <Text style={styles.balanceIcon}>🏦</Text>
                </View>
                <Text style={styles.balanceText}>{formatCoins(coins)}</Text>
              </LinearGradient>
            </View>
          </View>

          <View style={styles.ctaRow}>
            <Pressable style={styles.ctaPillWrap} onPress={() => navigation.navigate('Wallet')}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaPill}
              >
                <View style={styles.ctaIconWrap}>
                  <Text style={styles.ctaIcon}>🎁</Text>
                </View>
                <Text style={styles.ctaText}>Easy Rewards</Text>
              </LinearGradient>
            </Pressable>
            <View style={styles.ctaPillWrap}>
              <Pressable
                style={[styles.ctaPill, styles.ctaPillLight]}
                onPress={() => navigation.navigate('RedeemCode')}
              >
                <View style={[styles.ctaIconWrap, styles.ctaIconWrapLight]}>
                  <Text style={styles.ctaIcon}>🎫</Text>
                </View>
                <Text style={[styles.ctaText, styles.ctaTextLight]}>Redeem Code</Text>
              </Pressable>
              <View style={styles.hotBadge}>
                <Text style={styles.hotBadgeText}>🔥 HOT</Text>
              </View>
            </View>
          </View>
        </View>

        <DailyCheckInCard />

        <View style={[styles.section, styles.quickEarnBand]}>
          <SectionHeader title="⚡ Quick Earn" actionLabel="View All" onAction={() => navigation.navigate('Games')} />
          <View style={styles.quickGrid}>
            {quickEarn.map((item) => (
              <QuickEarnCard
                key={item.id}
                item={item}
                onPress={() => navigation.navigate(item.route)}
                style={styles.quickCardWrap}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="🎮 Play & Earn" actionLabel="See All" onAction={() => navigation.navigate('Games')} />
          <View style={styles.gameGrid}>
            {HOME_GAMES.map((game) => (
              <GameThumbnailCard
                key={game.id}
                game={game}
                onPress={() => navigation.navigate(game.route)}
                style={styles.gameCardWrap}
              />
            ))}
          </View>
        </View>

        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.inviteBanner}
        >
          <View style={styles.inviteIconWrap}>
            <Text style={styles.inviteIcon}>👥</Text>
          </View>
          <View style={styles.flexShrink}>
            <Text style={styles.inviteTitle}>Invite Friends</Text>
            <Text style={styles.inviteSubtitle}>
              {profile?.referCode
                ? `🪙 ${formatCoins(config.referralBonusL1)} coins per invite`
                : 'Sign in with Google to get your referral code'}
            </Text>
          </View>
          {profile?.referCode ? (
            <Button title="Invite Now" variant="secondary" onPress={shareReferral} style={styles.inviteBtn} />
          ) : (
            <Button title="Sign In" variant="secondary" onPress={signInWithGoogle} style={styles.inviteBtn} />
          )}
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.surveysHeaderRow}>
            <Text style={Typography.h3}>Surveys for You</Text>
            <View style={styles.comingSoonPill}>
              <Text style={styles.comingSoonText}>COMING SOON</Text>
            </View>
          </View>
          <Card style={styles.surveysCard}>
            <Text style={styles.surveysIcon}>📋</Text>
            <Text style={[Typography.small, styles.surveysText]}>
              Paid surveys will unlock here once partner offers are connected — nothing to complete yet.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  stickyHeader: { backgroundColor: Colors.background, marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  brandIcon: { width: 52, height: 52, borderRadius: 14 },
  brandName: { fontSize: 21, fontWeight: '800', color: Colors.text },
  brandTagline: { ...Typography.caption, color: Colors.textMuted, marginTop: 2, fontWeight: '600' },
  topRowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  moonBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#EDEBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moonIcon: { fontSize: 18 },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: Radius.pill,
    paddingVertical: 8,
    paddingLeft: 8,
    paddingRight: 16,
  },
  balanceIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceIcon: { fontSize: 15 },
  balanceText: { fontSize: 20, fontWeight: '800', color: Colors.white },
  ctaRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: -Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    backgroundColor: '#EDEBFF',
  },
  ctaPillWrap: { flex: 1 },
  ctaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.pill,
    overflow: 'hidden',
  },
  ctaPillLight: { backgroundColor: Colors.white },
  ctaIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaIconWrapLight: { backgroundColor: 'rgba(108,92,231,0.12)' },
  ctaIcon: { fontSize: 13 },
  ctaText: { ...Typography.small, color: Colors.white, fontWeight: '800' },
  ctaTextLight: { color: Colors.primary },
  hotBadge: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: Colors.danger,
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  hotBadgeText: { fontSize: 10, color: Colors.white, fontWeight: '800' },
  flexShrink: { flexShrink: 1 },
  section: { marginBottom: Spacing.lg },
  // Full-bleed lavender band behind Quick Earn, so the colourful tiles sit on a
  // tinted panel instead of the plain page background.
  quickEarnBand: {
    backgroundColor: '#EEF0FF',
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.sm },
  quickCardWrap: { marginBottom: Spacing.sm },

  gameGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: Spacing.sm },
  gameCardWrap: { marginBottom: Spacing.sm },

  inviteBanner: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  inviteIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteIcon: { fontSize: 20 },
  inviteTitle: { ...Typography.h3, color: Colors.white },
  inviteSubtitle: { ...Typography.small, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  inviteBtn: { paddingHorizontal: Spacing.md },

  surveysHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  comingSoonPill: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
  },
  comingSoonText: { ...Typography.caption, color: Colors.textMuted, fontWeight: '700' },
  surveysCard: { alignItems: 'center', paddingVertical: Spacing.lg },
  surveysIcon: { fontSize: 30, marginBottom: Spacing.xs },
  surveysText: { color: Colors.textSec, textAlign: 'center' },
});
