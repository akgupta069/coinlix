const WORDS = [
  'APPLE', 'HOUSE', 'TIGER', 'PLANET', 'MUSIC', 'FRIEND', 'SCHOOL', 'GARDEN',
  'WINTER', 'SUMMER', 'MARKET', 'ROCKET', 'CAMERA', 'PENCIL', 'BASKET',
  'ORANGE', 'YELLOW', 'BRIDGE', 'CASTLE', 'DRAGON', 'FOREST', 'ISLAND',
  'MIRROR', 'SILVER', 'GOLDEN', 'PUZZLE', 'WIZARD', 'CANDLE', 'BOTTLE', 'JACKET',
];

export function scrambleWord(word) {
  let letters;
  do {
    letters = word.split('');
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
  } while (letters.join('') === word && word.length > 1);
  return letters.join('');
}

export function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)];
}
