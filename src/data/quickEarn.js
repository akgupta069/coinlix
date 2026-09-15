// Quick Earn grid — a mix of existing games (reused) and two new fast,
// once-a-day micro-tasks (Captcha, Daily Poll).
//
// `art` names a scene in components/art/QuickEarnArt; it defaults to the id, so
// only entries whose illustration differs from their id need to set it.
const quickEarn = [
  { id: 'dailyQuiz', route: 'Quiz', name: 'Daily Quiz', icon: '💬', gradient: ['#8E54E9', '#5B2C9E'], badge: { type: 'status', text: 'Available' } },
  { id: 'spin', route: 'SpinWheel', name: 'Spin Wheel', icon: '🎡', gradient: ['#F7971E', '#C1440E'], badge: { type: 'status', text: 'Available' } },
  { id: 'captcha', route: 'Captcha', name: 'Captcha', icon: '🔤', gradient: ['#11998E', '#0B6E5F'], badge: { type: 'coins', value: 60 } },
  { id: 'poll', route: 'Poll', name: 'Daily Poll', icon: '📊', gradient: ['#1CA9E8', '#0B6FA8'], badge: { type: 'coins', value: 30 } },
  { id: 'battleQuiz', art: 'fireQuiz', route: 'Quiz', name: 'Free Fire Quiz', icon: '🔥', gradient: ['#F0483E', '#A8241B'], badge: { type: 'status', text: 'Available' } },
  { id: 'scratch', route: 'ScratchCard', name: 'Scratch Card', icon: '🎟️', gradient: ['#E91E8C', '#9C1362'], badge: { type: 'status', text: 'Available' } },
];

export default quickEarn;
