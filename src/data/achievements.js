// Each achievement's unlock rule reads only from data we already persist
// (coins, streak, referrals) — no leaderboard or server-side stat needed.
const achievements = [
  { id: 'weekStreak', icon: '🔥', label: 'Week Streak', check: (ctx) => ctx.streak >= 7 },
  { id: 'risingStar', icon: '🌟', label: 'Rising Star', check: (ctx) => ctx.totalEarned >= 1000 },
  { id: 'bigEarner', icon: '💰', label: 'Big Earner', check: (ctx) => ctx.totalEarned >= 5000 },
  { id: 'superReferrer', icon: '👥', label: 'Super Referrer', check: (ctx) => ctx.referralCount >= 3 },
  { id: 'redeemer', icon: '🎯', label: 'Redeemer', check: (ctx) => ctx.totalRedeemed > 0 },
  { id: 'diamondClub', icon: '💎', label: 'Diamond Club', check: (ctx) => ctx.totalEarned >= 25000 },
];

export default achievements;
