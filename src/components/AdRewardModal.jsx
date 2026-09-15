import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Text, StyleSheet, Animated } from 'react-native';
import { RewardedAd, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';
import Button from './Button';
import { Colors, Radius, Spacing, Typography, Shadows } from '../utils/theme';
import { formatCoins } from '../utils/format';
import { success as hapticSuccess } from '../utils/haptics';
import { getRewardedAdUnitId } from '../services/ads';
import { logGamePlayed, logRewardClaimed, trackAdImpression } from '../services/metaEvents';
import { beginSuppressingAppOpenAd, endSuppressingAppOpenAd } from '../services/adGate';

const AD_DURATION_MS = 2500; // fallback duration when no real rewarded ad is ready
const AUTO_CLOSE_DELAY_MS = 1300;

// One rewarded ad is preloaded for the whole app and reused across every
// game screen — AdMob ad units are meant to be requested well ahead of the
// moment they're shown, not created fresh per modal mount.
const rewardedAd = RewardedAd.createForAdRequest(getRewardedAdUnitId());

export default function AdRewardModal({
  visible,
  coins,
  rewardLabel = 'You won',
  autoClaim = false,
  onClaim,
  onClose,
}) {
  const [phase, setPhase] = useState('watching'); // watching | ready
  const [adLoaded, setAdLoaded] = useState(rewardedAd.loaded);
  const progress = useRef(new Animated.Value(0)).current;
  const timersRef = useRef([]);
  const earnedRef = useRef(false);

  // The ad-event listeners below are attached once for the app's lifetime
  // (see the empty deps array), so they must read callbacks through refs
  // that always point at the latest onClaim/onClose — otherwise they'd keep
  // calling whichever closure was passed in on the very first render.
  const onClaimRef = useRef(onClaim);
  const onCloseRef = useRef(onClose);
  const coinsRef = useRef(coins);
  const rewardLabelRef = useRef(rewardLabel);
  useEffect(() => {
    onClaimRef.current = onClaim;
    onCloseRef.current = onClose;
    coinsRef.current = coins;
    rewardLabelRef.current = rewardLabel;
  }, [onClaim, onClose, coins, rewardLabel]);

  useEffect(() => {
    const unsubLoaded = rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => setAdLoaded(true));
    const unsubEarned = rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
      earnedRef.current = true;
    });
    const unsubClosed = rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      setAdLoaded(false);
      rewardedAd.load();
      if (earnedRef.current) {
        earnedRef.current = false;
        hapticSuccess();
        onClaimRef.current?.();
        logRewardClaimed(coinsRef.current, rewardLabelRef.current);
      }
      onCloseRef.current?.();
      endSuppressingAppOpenAd();
    });
    const unsubError = rewardedAd.addAdEventListener(AdEventType.ERROR, () => {
      setAdLoaded(false);
      endSuppressingAppOpenAd();
    });
    const unsubPaid = rewardedAd.addAdEventListener(AdEventType.PAID, (p) => {
      trackAdImpression(p?.value, p?.currency, 'rewarded');
    });
    if (!rewardedAd.loaded) rewardedAd.load();

    return () => {
      unsubLoaded();
      unsubEarned();
      unsubClosed();
      unsubError();
      unsubPaid();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    if (!visible) return undefined;

    logGamePlayed(rewardLabel);

    if (adLoaded) {
      beginSuppressingAppOpenAd();
      rewardedAd.show().catch(() => {
        setAdLoaded(false);
        endSuppressingAppOpenAd();
      });
      return undefined;
    }

    // No real ad ready yet (still loading, offline, or no fill) — fall back
    // to the placeholder flow so the reward is never blocked on ad supply.
    setPhase('watching');
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: AD_DURATION_MS,
      useNativeDriver: false,
    }).start();

    const adTimer = setTimeout(() => {
      setPhase('ready');
      if (autoClaim) {
        hapticSuccess();
        onClaim?.();
        logRewardClaimed(coins, rewardLabel);
        const closeTimer = setTimeout(() => onClose?.(), AUTO_CLOSE_DELAY_MS);
        timersRef.current.push(closeTimer);
      }
    }, AD_DURATION_MS);
    timersRef.current.push(adTimer);

    return () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, adLoaded]);

  // Once a real ad is loaded, AdMob's own full-screen unit handles the
  // watching UI — nothing to render here until it closes.
  if (!visible || adLoaded) return null;

  const handleClaim = () => {
    hapticSuccess();
    onClaim?.();
    logRewardClaimed(coins, rewardLabel);
    onClose?.();
  };

  const widthInterpolate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {phase === 'watching' ? (
            <>
              <Text style={styles.icon}>📺</Text>
              <Text style={Typography.h3}>Ad playing…</Text>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: widthInterpolate }]} />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.icon}>🎉</Text>
              <Text style={Typography.h2}>{rewardLabel}</Text>
              <Text style={styles.coinsText}>+{formatCoins(coins)} coins</Text>
              {!autoClaim && <Button title="Claim" onPress={handleClaim} style={styles.claimBtn} />}
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadows.floating,
  },
  icon: { fontSize: 40, marginBottom: Spacing.sm },
  sub: { color: Colors.textMuted, marginTop: 4, textAlign: 'center' },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 999,
    backgroundColor: Colors.surfaceAlt,
    overflow: 'hidden',
    marginTop: Spacing.lg,
  },
  progressFill: { height: '100%', backgroundColor: Colors.primary },
  coinsText: { ...Typography.h1, color: Colors.coin, marginTop: Spacing.xs },
  claimBtn: { marginTop: Spacing.lg, alignSelf: 'stretch' },
});
