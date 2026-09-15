import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Share, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';

import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { Colors, Radius, Spacing, Typography } from '../utils/theme';
import { formatCoins } from '../utils/format';
import { showToast } from '../components/Toast';
import { success as hapticSuccess, error as hapticError } from '../utils/haptics';
import { getEffectiveStreak } from '../utils/checkinStreak';
import { getLevelInfo } from '../data/levels';
import achievementsList from '../data/achievements';

const REDEEM_ERROR_MESSAGES = {
  invalid_format: 'Enter a valid referral code',
  invalid_code: "That code doesn't exist",
  self_referral: "You can't use your own code",
  already_used: 'You already used a referral code',
  network_error: 'Something went wrong. Try again',
  login_required: 'Sign in with Google to use a referral code',
};

const SETTINGS_ITEMS = [
  { id: 'notifications', icon: '🔔', title: 'Notifications', subtitle: 'Manage alerts & offers' },
  { id: 'privacy', icon: '🔒', title: 'Privacy & Security', subtitle: 'Account safety settings' },
  { id: 'help', icon: '❓', title: 'Help & Support', subtitle: 'FAQ, chat support' },
  { id: 'terms', icon: '📄', title: 'Terms & Privacy Policy', subtitle: 'Legal documents' },
  { id: 'rate', icon: '⭐', title: 'Rate CoinLix', subtitle: 'Love us? Leave a review!' },
];

function Avatar({ uri, name }) {
  if (uri) return <Image source={{ uri }} style={styles.avatar} />;
  const initial = (name || 'G').trim().charAt(0).toUpperCase();
  return (
    <LinearGradient colors={['#FFD76B', '#F5A623']} style={[styles.avatar, styles.avatarFallback]}>
      <Text style={styles.avatarInitial}>{initial}</Text>
    </LinearGradient>
  );
}

export default function ProfileScreen() {
  const { user, profile, isGuest, signInWithGoogle, signOutUser } = useAuth();
  const { coins, totalEarned, totalRedeemed, config, claimReferralCode } = useApp();
  const [codeInput, setCodeInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [streak, setStreak] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getEffectiveStreak().then(setStreak);
    }, [])
  );

  const submitCode = async () => {
    setSubmitting(true);
    const result = await claimReferralCode(codeInput);
    setSubmitting(false);
    if (result.ok) {
      hapticSuccess();
      showToast(`Code applied! +${formatCoins(result.bonus)} coins`, 'success');
      setCodeInput('');
    } else {
      hapticError();
      showToast(REDEEM_ERROR_MESSAGES[result.error] || 'Could not apply code', 'error');
    }
  };

  const copyReferral = async () => {
    if (!profile?.referCode) return;
    await Clipboard.setStringAsync(profile.referCode);
    showToast('Referral code copied', 'success');
  };

  const shareReferral = async () => {
    if (!profile?.referCode) return;
    try {
      await Share.share({
        message: `Join CoinLix and earn real rewards! Use my code ${profile.referCode} to get a bonus when you sign up.`,
      });
    } catch {
      // user dismissed share sheet
    }
  };

  const displayName = user?.displayName || (isGuest ? 'Guest Player' : 'Player');
  const { level, tier, next, progressPercent } = getLevelInfo(totalEarned);
  const achievementCtx = { totalEarned, totalRedeemed, streak, referralCount: profile?.referralCount || 0 };
  const unlockedCount = achievementsList.filter((a) => a.check(achievementCtx)).length;

  const l1Count = profile?.referralCount || 0;
  const l1Coins = profile?.referralCoinsEarned || 0;
  const l2Count = profile?.referralCountL2 || 0;
  const l2Coins = profile?.referralCoinsEarnedL2 || 0;

  return (
    <SafeAreaView style={styles.flex} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTopRow}>
            <Avatar uri={user?.photoURL} name={user?.displayName} />
            <View style={styles.heroIdentity}>
              <Text style={styles.heroName}>{displayName}</Text>
              <View style={styles.levelPill}>
                <Text style={styles.levelPillText}>✦ Level {level} · {tier}</Text>
              </View>
            </View>
            <Text style={styles.locationText}>📍 India</Text>
          </View>

          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>
                {next ? `Progress to Level ${next.level}` : 'Max level reached'}
              </Text>
              <Text style={styles.progressPercent}>{progressPercent}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
            </View>
          </View>

          <View style={styles.pillsRow}>
            <View style={styles.pill}>
              <View style={styles.coinPillBadge}>
                <Text style={styles.coinPillText}>🪙 {formatCoins(coins)}</Text>
              </View>
              <Text style={styles.pillLabel}>Total Coins</Text>
            </View>
            <View style={styles.pillDivider} />
            <View style={styles.pill}>
              <Text style={styles.pillValue}>{streak} 🔥</Text>
              <Text style={styles.pillLabel}>Day Streak</Text>
            </View>
            <View style={styles.pillDivider} />
            <View style={styles.pill}>
              <Text style={styles.pillValue}>{l1Count} 👥</Text>
              <Text style={styles.pillLabel}>Referrals</Text>
            </View>
          </View>

          <View style={styles.achievementsHeaderRow}>
            <Text style={styles.achievementsTitle}>🥇 Achievements</Text>
            <Text style={styles.achievementsCount}>{unlockedCount}/{achievementsList.length} unlocked</Text>
          </View>
          <View style={styles.achievementsGrid}>
            {achievementsList.map((a) => {
              const unlocked = a.check(achievementCtx);
              return (
                <View key={a.id} style={[styles.achievementCard, unlocked ? styles.achievementUnlocked : styles.achievementLocked]}>
                  <Text style={styles.achievementIcon}>{a.icon}</Text>
                  <Text style={styles.achievementLabel} numberOfLines={2}>{a.label}</Text>
                  <Text style={styles.achievementIndicator}>{unlocked ? '●' : '🔒'}</Text>
                </View>
              );
            })}
          </View>
        </LinearGradient>

        {isGuest && !user ? (
          <Card style={styles.guestBanner}>
            <Text style={styles.guestBannerTitle}>Guest Mode Active</Text>
            <Text style={[Typography.small, styles.guestBannerText]}>
              Guest session is temporary — sign in with Google for permanent access to your coins.
            </Text>
            <Button title="Sign in with Google" onPress={signInWithGoogle} style={styles.signInBtn} />
          </Card>
        ) : null}

        <Text style={[Typography.h3, styles.sectionTitle]}>👥 Refer & Earn</Text>

        {!profile?.referCode ? (
          <LinearGradient
            colors={['#FF7A45', '#F5576C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.inviteBanner}
          >
            <Text style={styles.inviteEmoji}>🎁</Text>
            <View style={styles.flex1}>
              <Text style={styles.inviteTitle}>Invite Friends & Earn</Text>
              <Text style={styles.inviteSubtitle}>
                Sign in with Google to get your referral code
              </Text>
            </View>
            <Pressable onPress={signInWithGoogle} style={styles.inviteSignInBtn}>
              <Text style={styles.inviteSignInText}>Sign In</Text>
            </Pressable>
          </LinearGradient>
        ) : null}

        {profile?.referCode ? (
          <>
            <LinearGradient
              colors={['#FF7A45', '#F5576C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.inviteBanner}
            >
              <Text style={styles.inviteEmoji}>🎁</Text>
              <View style={styles.flex1}>
                <Text style={styles.inviteTitle}>Invite Friends & Earn</Text>
                <Text style={styles.inviteSubtitle}>
                  Level 1: +{formatCoins(config.referralBonusL1)} coins · Level 2: +{formatCoins(config.referralBonusL2)} coins
                </Text>
              </View>
            </LinearGradient>

            <Card style={styles.section}>
              <Text style={[Typography.caption, styles.codeLabel]}>Your Referral Code</Text>
              <View style={styles.codeBox}>
                <Text style={styles.code}>{profile.referCode}</Text>
                <Pressable onPress={copyReferral} hitSlop={8}>
                  <Text style={styles.copyIconText}>📋 Copy</Text>
                </Pressable>
              </View>

              <View style={styles.referralStatsRow}>
                <View style={styles.referralStatCard}>
                  <Text style={styles.referralStatIcon}>👥</Text>
                  <Text style={styles.referralStatValue}>{l1Count}</Text>
                  <Text style={styles.referralStatLabel}>Level 1 Referrals</Text>
                  <View style={styles.referralStatPill}>
                    <Text style={styles.referralStatPillText}>🪙 +{formatCoins(l1Coins)}</Text>
                  </View>
                  <Text style={styles.referralStatSub}>+{formatCoins(config.referralBonusL1)} coins each</Text>
                </View>
                <View style={styles.referralStatCard}>
                  <Text style={styles.referralStatIcon}>👥👥</Text>
                  <Text style={styles.referralStatValue}>{l2Count}</Text>
                  <Text style={styles.referralStatLabel}>Level 2 Referrals</Text>
                  <View style={styles.referralStatPill}>
                    <Text style={styles.referralStatPillText}>🪙 +{formatCoins(l2Coins)}</Text>
                  </View>
                  <Text style={styles.referralStatSub}>+{formatCoins(config.referralBonusL2)} coins each</Text>
                </View>
              </View>

              <View style={styles.howItWorks}>
                <Text style={[Typography.caption, styles.howItWorksTitle]}>HOW IT WORKS</Text>
                {[
                  'Share your code with friends',
                  `Friend installs & joins CoinLix → You get ${formatCoins(config.referralBonusL1)} coins`,
                  `Friend refers someone → You also get ${formatCoins(config.referralBonusL2)} coins`,
                ].map((step, i) => (
                  <View key={i} style={styles.stepRow}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{i + 1}</Text>
                    </View>
                    <Text style={[Typography.small, styles.stepText]}>{step}</Text>
                  </View>
                ))}
              </View>

              <LinearGradient colors={['#FF9A3D', '#FF6B2B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.shareBtnWrap}>
                <Pressable onPress={shareReferral} style={styles.shareBtnInner}>
                  <Text style={styles.shareBtnText}>🎁  Share & Earn</Text>
                </Pressable>
              </LinearGradient>

              <Text style={styles.summaryText}>
                👥 {l1Count + l2Count} referrals  ·  🪙 {formatCoins(l1Coins + l2Coins)} earned
              </Text>
            </Card>
          </>
        ) : null}

        {user && !profile?.referredBy ? (
          <Card style={styles.section}>
            <Text style={[Typography.caption, styles.codeLabel]}>Have a referral code?</Text>
            <View style={styles.codeInputRow}>
              <TextInput
                value={codeInput}
                onChangeText={(t) => setCodeInput(t.toUpperCase())}
                placeholder="Enter code"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                maxLength={10}
                style={styles.input}
              />
              <Button
                title="Apply"
                onPress={submitCode}
                loading={submitting}
                disabled={!codeInput.trim()}
              />
            </View>
          </Card>
        ) : null}

        <Text style={[Typography.h3, styles.sectionTitle]}>⚙️ Settings</Text>
        <Card style={styles.settingsCard} padded={false}>
          {SETTINGS_ITEMS.map((item, i) => (
            <Pressable
              key={item.id}
              onPress={() => showToast('Coming soon', 'default')}
              style={[styles.settingsRow, i < SETTINGS_ITEMS.length - 1 && styles.settingsRowBorder]}
            >
              <Text style={styles.settingsIcon}>{item.icon}</Text>
              <View style={styles.flex1}>
                <Text style={Typography.body}>{item.title}</Text>
                <Text style={[Typography.caption, styles.settingsSubtitle]}>{item.subtitle}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          ))}
          <View style={styles.settingsRow}>
            <Text style={styles.settingsIcon}>ℹ️</Text>
            <View style={styles.flex1}>
              <Text style={Typography.body}>About CoinLix</Text>
              <Text style={[Typography.caption, styles.settingsSubtitle]}>Version 1.0.0</Text>
            </View>
          </View>
        </Card>

        {user || isGuest ? (
          <Button
            title={isGuest && !user ? '🚪 Exit Guest Mode' : 'Log out'}
            variant={isGuest && !user ? 'secondary' : 'ghost'}
            onPress={signOutUser}
            style={[styles.logoutBtn, isGuest && !user && styles.exitGuestBtn]}
          />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  flex1: { flex: 1 },
  scroll: { padding: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.xl },

  hero: { borderRadius: Radius.xl, padding: Spacing.lg, marginBottom: Spacing.lg },
  heroTopRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 64, height: 64, borderRadius: 32 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: Colors.white, fontSize: 24, fontWeight: '800' },
  heroIdentity: { flex: 1 },
  heroName: { fontSize: 22, fontWeight: '800', color: Colors.white },
  levelPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5A623',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  levelPillText: { ...Typography.small, color: Colors.white, fontWeight: '800' },
  locationText: { ...Typography.small, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },

  progressSection: { marginTop: Spacing.lg },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { ...Typography.small, color: 'rgba(255,255,255,0.85)' },
  progressPercent: { ...Typography.small, color: Colors.white, fontWeight: '800' },
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.2)', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#F5A623', borderRadius: 999 },

  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
  },
  pill: { flex: 1, alignItems: 'center' },
  coinPillBadge: {
    backgroundColor: '#FFF1D6',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  coinPillText: { ...Typography.small, color: '#8A6A00', fontWeight: '800' },
  pillValue: { fontSize: 20, fontWeight: '800', color: Colors.white, marginBottom: 6 },
  pillLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.8)' },
  pillDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)' },

  achievementsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  achievementsTitle: { ...Typography.h3, color: Colors.white },
  achievementsCount: { ...Typography.caption, color: 'rgba(255,255,255,0.75)', fontWeight: '700' },
  achievementsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  achievementCard: {
    width: '15.5%',
    borderRadius: Radius.sm,
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    gap: 2,
  },
  achievementUnlocked: { backgroundColor: 'rgba(255,255,255,0.16)' },
  achievementLocked: { backgroundColor: 'rgba(0,0,0,0.18)' },
  achievementIcon: { fontSize: 15 },
  achievementLabel: { fontSize: 7.5, lineHeight: 9, color: Colors.white, textAlign: 'center', fontWeight: '700' },
  achievementIndicator: { fontSize: 8, color: '#7CFFB2' },

  guestBanner: { marginBottom: Spacing.lg, borderLeftWidth: 3, borderLeftColor: Colors.warning },
  guestBannerTitle: { ...Typography.h3 },
  guestBannerText: { color: Colors.textSec, marginTop: 4, marginBottom: Spacing.sm },
  signInBtn: { alignSelf: 'stretch' },

  sectionTitle: { marginBottom: Spacing.sm },
  inviteBanner: { borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  inviteEmoji: { fontSize: 30 },
  inviteTitle: { ...Typography.h3, color: Colors.white },
  inviteSubtitle: { ...Typography.caption, color: 'rgba(255,255,255,0.9)', marginTop: 2 },
  inviteSignInBtn: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 },
  inviteSignInText: { ...Typography.small, color: '#F5576C', fontWeight: '800' },

  section: { marginBottom: Spacing.lg },
  codeLabel: { color: Colors.textMuted, marginBottom: Spacing.xs },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}0D`,
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  code: { ...Typography.h3, letterSpacing: 2, color: Colors.primary },
  copyIconText: { ...Typography.small, fontWeight: '700', color: Colors.primary },

  referralStatsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  referralStatCard: {
    flex: 1,
    backgroundColor: '#231B4D',
    borderRadius: Radius.md,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 2,
  },
  referralStatIcon: { fontSize: 18 },
  referralStatValue: { fontSize: 26, fontWeight: '800', color: '#F5A623' },
  referralStatLabel: { ...Typography.caption, color: 'rgba(255,255,255,0.85)' },
  referralStatPill: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 999, paddingVertical: 2, paddingHorizontal: 8, marginTop: 2 },
  referralStatPillText: { ...Typography.caption, color: '#7CFFB2', fontWeight: '700' },
  referralStatSub: { ...Typography.caption, color: 'rgba(255,255,255,0.55)', marginTop: 2 },

  howItWorks: { backgroundColor: Colors.surfaceAlt, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md },
  howItWorksTitle: { color: Colors.textMuted, fontWeight: '700', marginBottom: Spacing.sm, letterSpacing: 0.5 },
  stepRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, alignItems: 'flex-start' },
  stepNumber: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: Colors.white, fontWeight: '700', fontSize: 11 },
  stepText: { flex: 1, color: Colors.textSec, marginTop: 2 },

  shareBtnWrap: { borderRadius: Radius.pill, marginBottom: Spacing.sm },
  shareBtnInner: { paddingVertical: 14, alignItems: 'center' },
  shareBtnText: { ...Typography.h3, color: Colors.white },
  summaryText: { textAlign: 'center', color: Colors.textMuted, ...Typography.small },

  codeInputRow: { flexDirection: 'row', gap: Spacing.sm },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    color: Colors.text,
    letterSpacing: 1,
  },

  settingsCard: { marginBottom: Spacing.lg, overflow: 'hidden' },
  settingsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, paddingHorizontal: Spacing.md },
  settingsRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingsIcon: { fontSize: 18 },
  settingsSubtitle: { color: Colors.textMuted, marginTop: 1 },
  chevron: { fontSize: 20, color: Colors.textMuted },

  logoutBtn: { marginTop: Spacing.sm },
  exitGuestBtn: { borderWidth: 1, borderColor: Colors.danger },
});
