// Per-SKU campaign progress (started/claimed), persisted locally so it
// survives app restarts. Session rules from the rewards master prompt:
//  - an unused session (started, no code yet) expires after 3 days
//  - once a code is shown it stays visible for 3 hours, then the flow resets
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PREFIX = 'coinlix_reward_';
const SESSION_EXPIRY_MS = 3 * 24 * 60 * 60 * 1000;
const CODE_VISIBLE_MS = 3 * 60 * 60 * 1000;

function key(skuId) {
  return `${KEY_PREFIX}${skuId}`;
}

const EMPTY_STATE = { startedAt: null, code: null, codeShownAt: null };

export async function getRewardState(skuId) {
  const raw = await AsyncStorage.getItem(key(skuId));
  if (!raw) return { ...EMPTY_STATE };

  const state = JSON.parse(raw);
  const now = Date.now();

  if (state.code && state.codeShownAt && now - state.codeShownAt > CODE_VISIBLE_MS) {
    await AsyncStorage.removeItem(key(skuId));
    return { ...EMPTY_STATE };
  }
  if (!state.code && state.startedAt && now - state.startedAt > SESSION_EXPIRY_MS) {
    await AsyncStorage.removeItem(key(skuId));
    return { ...EMPTY_STATE };
  }
  return state;
}

export async function startCampaign(skuId) {
  const state = await getRewardState(skuId);
  if (state.startedAt) return state;
  const next = { ...state, startedAt: Date.now() };
  await AsyncStorage.setItem(key(skuId), JSON.stringify(next));
  return next;
}

export async function saveCode(skuId, code) {
  const next = { startedAt: Date.now(), code, codeShownAt: Date.now() };
  await AsyncStorage.setItem(key(skuId), JSON.stringify(next));
  return next;
}

export async function clearRewardState(skuId) {
  await AsyncStorage.removeItem(key(skuId));
}
