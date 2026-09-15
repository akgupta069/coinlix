// Cosmetic progression, derived entirely from totalEarned — no server state.
const LEVELS = [
  { level: 1, tier: 'Bronze', min: 0 },
  { level: 2, tier: 'Bronze', min: 1000 },
  { level: 3, tier: 'Bronze', min: 2500 },
  { level: 4, tier: 'Silver', min: 5000 },
  { level: 5, tier: 'Silver', min: 8000 },
  { level: 6, tier: 'Silver', min: 12000 },
  { level: 7, tier: 'Gold', min: 18000 },
  { level: 8, tier: 'Gold', min: 25000 },
  { level: 9, tier: 'Gold', min: 35000 },
  { level: 10, tier: 'Platinum', min: 50000 },
];

export function getLevelInfo(totalEarned) {
  let current = LEVELS[0];
  let next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (totalEarned >= LEVELS[i].min) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
    }
  }
  const progressPercent = next
    ? Math.min(100, Math.round(((totalEarned - current.min) / (next.min - current.min)) * 100))
    : 100;
  return {
    level: current.level,
    tier: current.tier,
    next,
    progressPercent,
    coinsToNext: next ? Math.max(0, next.min - totalEarned) : 0,
  };
}
