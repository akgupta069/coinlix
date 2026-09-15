import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth } from './AuthContext';
import {
  readUserAppState,
  writeUserAppState,
  subscribeUserAppState,
  readRemoteConfig,
  findReferrerUidByCode,
  createReferralClaim,
  forwardLevel2Claim,
  fetchPendingReferralClaims,
  markClaimCredited,
  incrementReferrerStats,
} from '../services/firestoreStore';
import { isValidCodeFormat } from '../utils/referral';

const LOCAL_STATE_KEY = 'coinlix_app_state';
const CLOUD_WRITE_THROTTLE_MS = 3 * 60 * 1000; // one write every few minutes at most
const MAX_LOCAL_TXNS = 200;
const MAX_CLOUD_TXNS = 30;

const DEFAULT_CONFIG = {
  dailyBonusAmount: 50,
  referralBonus: 100, // welcome bonus for the person entering a code
  referralBonusL1: 2000, // credited to your direct referrer
  referralBonusL2: 100, // credited to their referrer, one level up
  minRedeem: 5000,
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user, profile, isGuest, setProfile } = useAuth();

  const [coins, setCoins] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalRedeemed, setTotalRedeemed] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [cloudStatus, setCloudStatus] = useState('idle'); // idle | confirmed | failed
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  // Refs mirror state for use inside timers/listeners without stale closures.
  const coinsRef = useRef(0);
  const transactionsRef = useRef([]);
  const localSavedAtRef = useRef(0);
  const dirtyRef = useRef(false);
  const lastCloudWriteAtRef = useRef(0);
  const unsubscribeListenerRef = useRef(null);

  // ---- 1. Load remote config (with in-code fallback) ---------------------
  useEffect(() => {
    (async () => {
      const remote = await readRemoteConfig();
      if (remote) setConfig({ ...DEFAULT_CONFIG, ...remote });
    })();
  }, []);

  // ---- 2. Hydrate from local storage on first mount -----------------------
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(LOCAL_STATE_KEY);
        if (raw) {
          const saved = JSON.parse(raw);
          applyLocalToState(saved);
          localSavedAtRef.current = saved._localSavedAt || 0;
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  function applyLocalToState(saved) {
    setCoins(saved.coins || 0);
    setTransactions(saved.transactions || []);
    setTotalEarned(saved.totalEarned || 0);
    setTotalRedeemed(saved.totalRedeemed || 0);
    coinsRef.current = saved.coins || 0;
    transactionsRef.current = saved.transactions || [];
  }

  async function persistLocal(next) {
    const savedAt = Date.now();
    localSavedAtRef.current = savedAt;
    dirtyRef.current = true;
    const payload = { ...next, _localSavedAt: savedAt };
    await AsyncStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(payload));
  }

  // ---- 3. Cloud hydration + realtime "sync up only" listener --------------
  useEffect(() => {
    detachListener();

    if (!user || isGuest || !hydrated) {
      setCloudStatus('idle');
      return;
    }

    let cancelled = false;

    (async () => {
      const result = await readUserAppState(user.uid);
      if (cancelled) return;

      if (result.status === 'failed') {
        // A failed/timed-out read is NOT the same as "no cloud data" — never
        // write local (possibly zero, on a fresh install) up to Firestore
        // this session.
        setCloudStatus('failed');
        return;
      }

      if (result.exists) {
        const cloud = result.data;
        if ((cloud.updatedAt || 0) > localSavedAtRef.current) {
          const next = {
            coins: cloud.coins || 0,
            transactions: cloud.recentTxns || transactionsRef.current,
            totalEarned,
            totalRedeemed,
          };
          applyLocalToState(next);
          await persistLocal(next);
        }
      }
      // else: brand new cloud account — local (possibly guest-carried)
      // progress wins as-is and will reach the cloud on the next write.

      setCloudStatus('confirmed');
      attachListener(user.uid);
      processReferralClaims(user.uid);
    })();

    return () => {
      cancelled = true;
      detachListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, isGuest, hydrated]);

  function attachListener(uid) {
    unsubscribeListenerRef.current = subscribeUserAppState(
      uid,
      (data) => {
        if (!data) return;
        // Realtime updates only ever move coins UP. A stale server value
        // must never silently lower a locally-earned balance.
        if ((data.coins || 0) > coinsRef.current) {
          const next = {
            coins: data.coins,
            transactions: data.recentTxns || transactionsRef.current,
            totalEarned,
            totalRedeemed,
          };
          applyLocalToState(next);
          persistLocal(next);
        }
      },
      () => setCloudStatus((s) => (s === 'confirmed' ? s : 'failed'))
    );
  }

  function detachListener() {
    if (unsubscribeListenerRef.current) {
      unsubscribeListenerRef.current();
      unsubscribeListenerRef.current = null;
    }
  }

  // ---- 4. Throttled cloud writes + authoritative flush on background -----
  async function flushToCloud({ force = false } = {}) {
    if (!user || isGuest || cloudStatus !== 'confirmed') return;
    if (!dirtyRef.current) return;
    const elapsed = Date.now() - lastCloudWriteAtRef.current;
    if (!force && elapsed < CLOUD_WRITE_THROTTLE_MS) return;

    try {
      await writeUserAppState(user.uid, {
        coins: coinsRef.current,
        recentTxns: transactionsRef.current.slice(0, MAX_CLOUD_TXNS),
      });
      lastCloudWriteAtRef.current = Date.now();
      dirtyRef.current = false;
    } catch {
      // Leave dirtyRef true — will retry on the next throttle tick / background event.
    }
  }

  useEffect(() => {
    const interval = setInterval(() => flushToCloud(), 30 * 1000);
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        flushToCloud({ force: true });
      }
    });
    return () => {
      clearInterval(interval);
      sub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, isGuest, cloudStatus]);

  // ---- Public API ----------------------------------------------------------

  function commit(nextCoins, nextTxns, earnedDelta, redeemedDelta) {
    const next = {
      coins: nextCoins,
      transactions: nextTxns,
      totalEarned: totalEarned + earnedDelta,
      totalRedeemed: totalRedeemed + redeemedDelta,
    };
    setCoins(next.coins);
    setTransactions(next.transactions);
    setTotalEarned(next.totalEarned);
    setTotalRedeemed(next.totalRedeemed);
    coinsRef.current = next.coins;
    transactionsRef.current = next.transactions;
    persistLocal(next);
  }

  function addCoins(amount, { label = 'Earned', icon = '🪙' } = {}) {
    if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: 'invalid_amount' };
    const txn = { id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, type: 'earn', amount, label, icon, createdAt: Date.now() };
    const nextTxns = [txn, ...transactionsRef.current].slice(0, MAX_LOCAL_TXNS);
    commit(coinsRef.current + amount, nextTxns, amount, 0);
    return { ok: true };
  }

  function spendCoins(amount, { label = 'Redeemed', icon = '🎁' } = {}) {
    if (!Number.isFinite(amount) || amount <= 0) return { ok: false, error: 'invalid_amount' };
    if (coinsRef.current < amount) return { ok: false, error: 'insufficient_coins' };
    const txn = { id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, type: 'redeem', amount, label, icon, createdAt: Date.now() };
    const nextTxns = [txn, ...transactionsRef.current].slice(0, MAX_LOCAL_TXNS);
    commit(coinsRef.current - amount, nextTxns, 0, amount);
    return { ok: true };
  }

  async function claimReferralCode(enteredCode) {
    if (!user) return { ok: false, error: 'login_required' };
    if (!isValidCodeFormat(enteredCode)) return { ok: false, error: 'invalid_format' };

    const code = enteredCode.trim().toUpperCase();
    try {
      const referrerUid = await findReferrerUidByCode(code);
      if (!referrerUid) return { ok: false, error: 'invalid_code' };
      if (referrerUid === user.uid) return { ok: false, error: 'self_referral' };

      // Only the referee's own docs are written here — see firestoreStore's
      // referral claim-outbox comment for why the referrer is credited
      // separately, from their own client.
      await createReferralClaim(user.uid, referrerUid, config.referralBonusL1);
      addCoins(config.referralBonus, { label: 'Referral bonus', icon: '🎁' });
      setProfile((p) => (p ? { ...p, referredBy: referrerUid } : p));
      return { ok: true, bonus: config.referralBonus };
    } catch (e) {
      if (e.message === 'already_used') return { ok: false, error: 'already_used' };
      return { ok: false, error: 'network_error' };
    }
  }

  /** Referrer-side half of the referral flow — credits any L1/L2 bonuses
   * earned while this user was away, and forwards a level-2 credit to this
   * user's own upline referrer for each L1 claim just processed. */
  async function processReferralClaims(uid) {
    try {
      const claims = await fetchPendingReferralClaims(uid);
      let l1Count = 0;
      let l1Coins = 0;
      let l2Count = 0;
      let l2Coins = 0;

      for (const claim of claims) {
        const level = claim.level || 1;
        addCoins(claim.bonus, {
          label: level === 2 ? "Your friend's referral joined" : 'Friend joined with your code',
          icon: '🎉',
        });
        await incrementReferrerStats(uid, claim.bonus, level);
        await markClaimCredited(claim.id);

        if (level === 1) {
          l1Count += 1;
          l1Coins += claim.bonus;
          if (profile?.referredBy) {
            await forwardLevel2Claim(uid, claim.refereeUid, profile.referredBy, config.referralBonusL2);
          }
        } else {
          l2Count += 1;
          l2Coins += claim.bonus;
        }
      }

      if (claims.length) {
        setProfile((p) =>
          p
            ? {
                ...p,
                referralCount: (p.referralCount || 0) + l1Count,
                referralCoinsEarned: (p.referralCoinsEarned || 0) + l1Coins,
                referralCountL2: (p.referralCountL2 || 0) + l2Count,
                referralCoinsEarnedL2: (p.referralCoinsEarnedL2 || 0) + l2Coins,
              }
            : p
        );
      }
    } catch {
      // best-effort — will retry next time this user's app hydrates
    }
  }

  const value = useMemo(
    () => ({
      coins,
      transactions,
      totalEarned,
      totalRedeemed,
      hydrated,
      cloudStatus,
      config,
      addCoins,
      spendCoins,
      claimReferralCode,
    }),
    [coins, transactions, totalEarned, totalRedeemed, hydrated, cloudStatus, config]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
