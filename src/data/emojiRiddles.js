const riddles = [
  { emoji: '🍕🧀', options: ['Pizza', 'Burger', 'Salad', 'Soup'], correct: 0 },
  { emoji: '🌧️🌈', options: ['Sunny day', 'Rain and rainbow', 'Snowstorm', 'Desert'], correct: 1 },
  { emoji: '🐝🍯', options: ['Butterfly', 'Bee and honey', 'Flower', 'Garden'], correct: 1 },
  { emoji: '🎂🎉', options: ['Funeral', 'Birthday party', 'Office meeting', 'Exam'], correct: 1 },
  { emoji: '🚗💨', options: ['Slow walk', 'Fast car', 'Boat', 'Airplane'], correct: 1 },
  { emoji: '📚🎓', options: ['Cooking', 'Graduation', 'Sports', 'Music'], correct: 1 },
  { emoji: '🌙⭐', options: ['Night sky', 'Sunrise', 'Beach', 'Forest'], correct: 0 },
  { emoji: '🐱🐶', options: ['Fish', 'Cats and dogs', 'Birds', 'Insects'], correct: 1 },
  { emoji: '☕📖', options: ['Reading with coffee', 'Swimming', 'Running', 'Sleeping'], correct: 0 },
  { emoji: '⚽🥅', options: ['Cricket', 'Football (soccer)', 'Tennis', 'Golf'], correct: 1 },
  { emoji: '🎣🐟', options: ['Fishing', 'Cooking', 'Swimming', 'Diving'], correct: 0 },
  { emoji: '🔥🚒', options: ['Fire truck', 'Police car', 'Ambulance', 'School bus'], correct: 0 },
  { emoji: '❄️⛄', options: ['Summer', 'Winter snowman', 'Autumn', 'Spring'], correct: 1 },
  { emoji: '🎬🍿', options: ['Cooking show', 'Movie night', 'Concert', 'Gym'], correct: 1 },
  { emoji: '💊🏥', options: ['Hospital', 'School', 'Bank', 'Market'], correct: 0 },
];

export function randomRiddle() {
  return riddles[Math.floor(Math.random() * riddles.length)];
}

export default riddles;
