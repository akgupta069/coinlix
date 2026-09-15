// All Firestore reads/writes live here — screens and contexts never talk to
// Firestore directly.
import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  runTransaction,
  query,
  collection,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import { generateReferralCode } from '../utils/referral';

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

// ---- App state (coins mirror + recent transactions) ----------------------

/**
 * Returns:
 *  - { status: 'confirmed', exists: false, data: null }  → brand new account, no cloud doc yet
 *  - { status: 'confirmed', exists: true,  data }         → cloud doc read successfully
 *  - { status: 'failed' }                                 → read failed/timed out — caller must
 *    NOT treat this the same as "confirmed empty", or a fresh install could wipe a real balance.
 */
export async function readUserAppState(uid, { timeoutMs = 8000 } = {}) {
  try {
    const ref = doc(db, 'users', uid, 'app', 'state');
    const snap = await withTimeout(getDoc(ref), timeoutMs);
    if (!snap.exists()) return { status: 'confirmed', exists: false, data: null };
    return { status: 'confirmed', exists: true, data: snap.data() };
  } catch (error) {
    return { status: 'failed', exists: null, data: null, error };
  }
}

export function subscribeUserAppState(uid, onChange, onError) {
  const ref = doc(db, 'users', uid, 'app', 'state');
  return onSnapshot(
    ref,
    (snap) => {
      if (snap.exists()) onChange(snap.data());
    },
    onError
  );
}

export async function writeUserAppState(uid, { coins, recentTxns }) {
  const updatedAt = Date.now();
  const stateRef = doc(db, 'users', uid, 'app', 'state');
  const userRef = doc(db, 'users', uid);
  await setDoc(stateRef, { coins, recentTxns, updatedAt }, { merge: true });
  await setDoc(userRef, { coins, updatedAt }, { merge: true }); // mirror on profile doc
  return updatedAt;
}

// ---- User profile -----------------------------------------------------

export async function readUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

async function generateUniqueReferralCode() {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateReferralCode();
    const existing = await getDoc(doc(db, 'referralCodes', code));
    if (!existing.exists()) return code;
  }
  // astronomically unlikely, but fall back to a longer code
  return generateReferralCode() + generateReferralCode();
}

/**
 * Creates the users/{uid} profile doc on first Google login, plus the
 * public referralCodes/{code} → { uid } lookup doc. No-op if the profile
 * already exists (returns the existing profile instead).
 */
export async function ensureUserProfile(uid, { name, email, photo }) {
  const ref = doc(db, 'users', uid);
  const existing = await getDoc(ref);
  if (existing.exists()) return existing.data();

  const referCode = await generateUniqueReferralCode();
  const profile = {
    name: name || 'Player',
    email: email || '',
    photo: photo || '',
    referCode,
    referredBy: null,
    coins: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    referralCount: 0,
    referralCoinsEarned: 0,
    referralCountL2: 0,
    referralCoinsEarnedL2: 0,
    createdAt: Date.now(),
  };
  await setDoc(ref, profile);
  await setDoc(doc(db, 'referralCodes', referCode), { uid });
  return profile;
}

// ---- Referral (2-tier) ------------------------------------------------
//
// Firestore rules only ever let a user write their OWN users/{uid} doc, so
// no client can directly credit someone else's balance. We use a small
// "claim outbox", extended to two tiers:
//
//   L1 (direct referral):
//     1. Referee looks up the code in the public referralCodes/{code} map.
//     2. Referee creates referralClaims/{refereeUid}_L1 (their own uid in
//        the doc id, once ever — a repeat attempt is a Firestore *update*,
//        which the rules reject since only the referrer may update it).
//     3. Next time the REFERRER's app is open, it finds unclaimed L1 claims
//        where forReferrerUid == me, credits itself locally through the
//        normal addCoins() path, and flips creditedToReferrer.
//
//   L2 (your referral's referral):
//     4. While crediting an L1 claim, the referrer (now acting as "via")
//        checks its OWN profile.referredBy. If set, it forwards a claim to
//        that upline account: referralClaims/{refereeUid}_L2. The doc id is
//        still keyed off the ORIGINAL referee's uid, so it can only ever be
//        forwarded once per signup — enforced by rules via get() checks
//        that (a) the L1 doc really names "via" as its referrer and (b)
//        "via"'s own profile really names this upline uid as its referrer.
//     5. The upline account credits itself the same way L1 works.
//
// Every write is made by the account it benefits (or, for the L2 forward,
// by the account with proof — via get() — that it's a legitimate link in
// the chain). Nobody ever writes someone else's balance directly.

export async function findReferrerUidByCode(code) {
  const snap = await getDoc(doc(db, 'referralCodes', code.trim().toUpperCase()));
  return snap.exists() ? snap.data().uid : null;
}

export async function createReferralClaim(refereeUid, referrerUid, bonusAmount) {
  const claimRef = doc(db, 'referralClaims', `${refereeUid}_L1`);
  try {
    await setDoc(claimRef, {
      forReferrerUid: referrerUid,
      refereeUid,
      level: 1,
      bonus: bonusAmount,
      createdAt: Date.now(),
      creditedToReferrer: false,
    });
  } catch {
    // Doc already existed → this write was rejected as an "update" by a
    // non-referrer, which the rules disallow. That only happens if this
    // user already claimed a code before.
    throw new Error('already_used');
  }
  await setDoc(doc(db, 'users', refereeUid), { referredBy: referrerUid }, { merge: true });
}

/** Forwards an L2 credit to the upline referrer. No-op if already forwarded. */
export async function forwardLevel2Claim(viaUid, sourceRefereeUid, upstreamReferrerUid, bonusAmount) {
  const claimRef = doc(db, 'referralClaims', `${sourceRefereeUid}_L2`);
  try {
    await setDoc(claimRef, {
      forReferrerUid: upstreamReferrerUid,
      refereeUid: sourceRefereeUid,
      viaUid,
      level: 2,
      bonus: bonusAmount,
      createdAt: Date.now(),
      creditedToReferrer: false,
    });
  } catch {
    // Already forwarded for this signup — fine, ignore.
  }
}

/** Returns pending (uncredited) claims — both levels — where the given uid is the beneficiary. */
export async function fetchPendingReferralClaims(referrerUid) {
  const q = query(
    collection(db, 'referralClaims'),
    where('forReferrerUid', '==', referrerUid),
    where('creditedToReferrer', '==', false)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function markClaimCredited(claimId) {
  await setDoc(doc(db, 'referralClaims', claimId), { creditedToReferrer: true }, { merge: true });
}

export async function incrementReferrerStats(referrerUid, bonusAmount, level) {
  const ref = doc(db, 'users', referrerUid);
  const countField = level === 2 ? 'referralCountL2' : 'referralCount';
  const coinsField = level === 2 ? 'referralCoinsEarnedL2' : 'referralCoinsEarned';
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.data() || {};
    tx.set(
      ref,
      {
        [countField]: (data[countField] || 0) + 1,
        [coinsField]: (data[coinsField] || 0) + bonusAmount,
      },
      { merge: true }
    );
  });
}

// ---- Remote config ---------------------------------------------------

export async function readRemoteConfig() {
  try {
    const snap = await withTimeout(getDoc(doc(db, 'config', 'app')), 6000);
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

export async function readRewardsConfig() {
  try {
    const snap = await withTimeout(getDoc(doc(db, 'config', 'rewards')), 6000);
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}

export async function readRedeemCodesConfig() {
  try {
    const snap = await withTimeout(getDoc(doc(db, 'config', 'redeemCodes')), 6000);
    return snap.exists() ? snap.data() : null;
  } catch {
    return null;
  }
}
