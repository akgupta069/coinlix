// Shared game catalog — used by the Home "Play & Earn" grid and the Games tab.
// Each id also names that game's illustration in components/art/GameArt.
const games = [
  { id: 'spin', route: 'SpinWheel', name: 'Lucky Spin', icon: '🎡', tagline: 'Up to 200 coins', gradient: ['#8E54E9', '#4776E6'] },
  { id: 'quiz', route: 'Quiz', name: 'Quiz Rush', icon: '🧠', tagline: '40 coins / correct', gradient: ['#F857A6', '#FF5858'] },
  { id: 'scratch', route: 'ScratchCard', name: 'Scratch Card', icon: '🎟️', tagline: 'Up to 100 coins', gradient: ['#F7971E', '#FFD200'] },
  { id: 'tap', route: 'TapBlast', name: 'Tap Blast', icon: '💥', tagline: '2 coins / tap', gradient: ['#FF512F', '#DD2476'] },
  { id: 'memory', route: 'MemoryMatch', name: 'Memory Match', icon: '🃏', tagline: 'Up to 100 coins', gradient: ['#11998E', '#38EF7D'] },
  { id: 'runner', route: 'CoinRunner', name: 'Coin Runner', icon: '🏃', tagline: '5 coins / catch', gradient: ['#00C6FB', '#005BEA'] },
  { id: 'numberRush', route: 'NumberRush', name: 'Number Rush', icon: '🔢', tagline: '30+ coins / correct', gradient: ['#7F00FF', '#3B0080'] },
  { id: 'bubblePop', route: 'BubblePop', name: 'Bubble Pop', icon: '🫧', tagline: '5 coins / pop', gradient: ['#36D1DC', '#0A6E76'] },
  { id: 'colorMatch', route: 'ColorMatch', name: 'Color Match', icon: '🎨', tagline: '5 coins / correct', gradient: ['#F953C6', '#B91372'] },
  { id: 'wordScramble', route: 'WordScramble', name: 'Word Scramble', icon: '🔤', tagline: '30 coins / word', gradient: ['#FF6B6B', '#C0392B'] },
  { id: 'trueFalse', route: 'TrueFalse', name: 'True or False', icon: '❓', tagline: '25+ coins / answer', gradient: ['#16A085', '#0B5D49'] },
  { id: 'emojiRiddle', route: 'EmojiRiddle', name: 'Emoji Riddle', icon: '🧩', tagline: '30 coins / solve', gradient: ['#9B59B6', '#6C3483'] },
  { id: 'oddOneOut', route: 'OddOneOut', name: 'Odd One Out', icon: '🔍', tagline: '5 coins / find', gradient: ['#F39C12', '#B9770E'] },
  { id: 'reflexTap', route: 'ReflexTap', name: 'Reflex Tap', icon: '⚡', tagline: 'Up to 60 coins', gradient: ['#FF4E50', '#F00000'] },
  { id: 'whackAMole', route: 'WhackAMole', name: 'Whack-a-Mole', icon: '🔨', tagline: '5 coins / hit', gradient: ['#8D6E63', '#4E342E'] },
  { id: 'balloonBurst', route: 'BalloonBurst', name: 'Balloon Burst', icon: '🎈', tagline: '5 coins / pop', gradient: ['#FF6FB5', '#D6336C'] },
  { id: 'sequenceTap', route: 'SequenceTap', name: 'Sequence Tap', icon: '🔢', tagline: '20 coins / sequence', gradient: ['#3498DB', '#1B4F72'] },
  { id: 'simonSays', route: 'SimonSays', name: 'Simon Says', icon: '🎵', tagline: '10 coins / level', gradient: ['#5D3FD3', '#2C1A66'] },
  { id: 'luckyDice', route: 'LuckyDice', name: 'Lucky Dice', icon: '🎲', tagline: 'Up to 120 coins', gradient: ['#2C3E50', '#0E1B26'] },
  { id: 'coinFlip', route: 'CoinFlip', name: 'Coin Flip', icon: '🪙', tagline: 'Up to 60 coins', gradient: ['#FFD700', '#B8860B'] },
];

export default games;
