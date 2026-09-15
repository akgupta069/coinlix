// Shared read-only access to the daily check-in streak (see
// components/DailyCheckInCard.jsx, which owns the write side).
import AsyncStorage from '@react-native-async-storage/async-storage';

const STATE_KEY = 'coinlix_checkin_state';

function dateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

export async function getEffectiveStreak() {
  const raw = await AsyncStorage.getItem(STATE_KEY);
  if (!raw) return 0;
  const state = JSON.parse(raw);
  const today = dateKey(0);
  const yesterday = dateKey(-1);
  if (state.lastCheckIn === today || state.lastCheckIn === yesterday) {
    return state.streak || 0;
  }
  return 0;
}
