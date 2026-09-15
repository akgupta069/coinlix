const pollQuestions = [
  { q: 'Tea or Coffee?', a: 'Tea ☕', b: 'Coffee ☕' },
  { q: 'Cricket or Football?', a: 'Cricket 🏏', b: 'Football ⚽' },
  { q: 'Movies or Web Series?', a: 'Movies 🎬', b: 'Web Series 📺' },
  { q: 'Winter or Summer?', a: 'Winter ❄️', b: 'Summer ☀️' },
  { q: 'Rice or Roti?', a: 'Rice 🍚', b: 'Roti 🫓' },
  { q: 'iOS or Android?', a: 'iOS 🍎', b: 'Android 🤖' },
];

export function pollOfTheDay() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
  );
  return pollQuestions[dayOfYear % pollQuestions.length];
}

export default pollQuestions;
