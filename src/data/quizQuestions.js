// Local placeholder question bank. Swap for a remote-config-driven set later.
// Each client shuffles independently (Fisher–Yates, seeded by Math.random()),
// so different users/sessions naturally see a different order.
// Kept very easy (1st-grade level) and bilingual (English / Hindi) on purpose.
const quizQuestions = [
  { q: 'How many legs does a dog have? / कुत्ते के कितने पैर होते हैं?', options: ['2', '4', '6', '8'], correct: 1 },
  { q: 'What color is the sky on a clear day? / साफ दिन में आसमान का रंग कैसा होता है?', options: ['Green (हरा)', 'Blue (नीला)', 'Red (लाल)', 'Black (काला)'], correct: 1 },
  { q: 'What color is a banana? / केला किस रंग का होता है?', options: ['Yellow (पीला)', 'Purple (बैंगनी)', 'Blue (नीला)', 'Black (काला)'], correct: 0 },
  { q: 'How many days are there in a week? / एक हफ्ते में कितने दिन होते हैं?', options: ['5', '6', '7', '8'], correct: 2 },
  { q: 'Which animal says "Meow"? / कौन सा जानवर "म्याऊं" बोलता है?', options: ['Dog (कुत्ता)', 'Cat (बिल्ली)', 'Cow (गाय)', 'Lion (शेर)'], correct: 1 },
  { q: 'How many fingers are there on one hand? / एक हाथ में कितनी उंगलियां होती हैं?', options: ['4', '5', '6', '10'], correct: 1 },
  { q: 'What do we use to see in the dark? / अंधेरे में देखने के लिए हम क्या इस्तेमाल करते हैं?', options: ['Torch (टॉर्च)', 'Fan (पंखा)', 'Spoon (चम्मच)', 'Book (किताब)'], correct: 0 },
  { q: 'Which is bigger: an elephant or a mouse? / कौन बड़ा है: हाथी या चूहा?', options: ['Elephant (हाथी)', 'Mouse (चूहा)', 'Same (बराबर)', "Don't know (पता नहीं)"], correct: 0 },
  { q: 'What color is grass? / घास किस रंग की होती है?', options: ['Green (हरा)', 'Red (लाल)', 'Blue (नीला)', 'Pink (गुलाबी)'], correct: 0 },
  { q: 'How many eyes do you have? / आपकी कितनी आंखें हैं?', options: ['1', '2', '3', '4'], correct: 1 },
  { q: 'Which animal gives us milk? / कौन सा जानवर हमें दूध देता है?', options: ['Cow (गाय)', 'Cat (बिल्ली)', 'Dog (कुत्ता)', 'Hen (मुर्गी)'], correct: 0 },
  { q: 'What do bees make? / मधुमक्खी क्या बनाती है?', options: ['Milk (दूध)', 'Honey (शहद)', 'Bread (रोटी)', 'Butter (मक्खन)'], correct: 1 },
  { q: 'What shape is a ball? / गेंद किस आकार की होती है?', options: ['Square (चौकोर)', 'Round (गोल)', 'Triangle (त्रिकोण)', 'Star (तारा)'], correct: 1 },
  { q: 'How many months are there in a year? / एक साल में कितने महीने होते हैं?', options: ['10', '11', '12', '13'], correct: 2 },
  { q: 'What do we drink when thirsty? / प्यास लगने पर हम क्या पीते हैं?', options: ['Water (पानी)', 'Oil (तेल)', 'Sand (रेत)', 'Air (हवा)'], correct: 0 },
  { q: 'Which one is a fruit? / इनमें से कौन सा फल है?', options: ['Apple (सेब)', 'Chair (कुर्सी)', 'Table (मेज)', 'Shoe (जूता)'], correct: 0 },
  { q: 'What do we wear on our feet? / हम अपने पैरों में क्या पहनते हैं?', options: ['Shoes (जूते)', 'Hat (टोपी)', 'Gloves (दस्ताने)', 'Watch (घड़ी)'], correct: 0 },
  { q: 'Which season is very cold? / कौन सा मौसम बहुत ठंडा होता है?', options: ['Summer (गर्मी)', 'Winter (सर्दी)', 'Rainy (बरसात)', 'Spring (बसंत)'], correct: 1 },
  { q: 'How many wheels does a bicycle have? / साइकिल में कितने पहिए होते हैं?', options: ['1', '2', '3', '4'], correct: 1 },
  { q: 'What color is the sun? / सूरज किस रंग का होता है?', options: ['Yellow (पीला)', 'Green (हरा)', 'Blue (नीला)', 'Black (काला)'], correct: 0 },
  { q: 'Which animal is known as "man\'s best friend"? / कौन सा जानवर "इंसान का सबसे अच्छा दोस्त" कहलाता है?', options: ['Cat (बिल्ली)', 'Dog (कुत्ता)', 'Fish (मछली)', 'Bird (चिड़िया)'], correct: 1 },
  { q: 'What do we use to write? / हम लिखने के लिए क्या इस्तेमाल करते हैं?', options: ['Pen (पेन)', 'Spoon (चम्मच)', 'Comb (कंघी)', 'Plate (थाली)'], correct: 0 },
  { q: 'How many sides does a triangle have? / त्रिकोण की कितनी भुजाएं होती हैं?', options: ['2', '3', '4', '5'], correct: 1 },
  { q: 'Which one is a vegetable? / इनमें से कौन सी सब्जी है?', options: ['Potato (आलू)', 'Mango (आम)', 'Banana (केला)', 'Grapes (अंगूर)'], correct: 0 },
  { q: 'What do we use to cut paper? / हम कागज काटने के लिए क्या इस्तेमाल करते हैं?', options: ['Scissors (कैंची)', 'Spoon (चम्मच)', 'Cup (कप)', 'Ball (गेंद)'], correct: 0 },
  { q: 'Which is the first day of the week? / हफ्ते का पहला दिन कौन सा है?', options: ['Monday (सोमवार)', 'Sunday (रविवार)', 'Friday (शुक्रवार)', 'Saturday (शनिवार)'], correct: 1 },
  { q: 'How many colors are there in a rainbow? / इंद्रधनुष में कितने रंग होते हैं?', options: ['5', '6', '7', '8'], correct: 2 },
  { q: 'What do plants need to grow? / पौधों को बढ़ने के लिए क्या चाहिए?', options: ['Water (पानी)', 'Ice (बर्फ)', 'Salt (नमक)', 'Sugar (चीनी)'], correct: 0 },
  { q: 'Which animal has a long neck? / किस जानवर की गर्दन लंबी होती है?', options: ['Giraffe (जिराफ)', 'Pig (सूअर)', 'Frog (मेंढक)', 'Duck (बत्तख)'], correct: 0 },
  { q: 'What do we use to brush our teeth? / हम दांत साफ करने के लिए क्या इस्तेमाल करते हैं?', options: ['Toothbrush (टूथब्रश)', 'Comb (कंघी)', 'Pencil (पेंसिल)', 'Spoon (चम्मच)'], correct: 0 },
  { q: 'How many seasons are there in a year? / एक साल में कितने मौसम होते हैं?', options: ['2', '3', '4', '5'], correct: 2 },
  { q: 'Which shape has 4 equal sides? / किस आकार की चारों भुजाएं बराबर होती हैं?', options: ['Circle (गोला)', 'Square (चौकोर)', 'Triangle (त्रिकोण)', 'Oval (अंडाकार)'], correct: 1 },
  { q: 'What do we call our mother\'s mother? / हमारी मां की मां को क्या कहते हैं?', options: ['Aunt (मौसी)', 'Grandmother (नानी)', 'Sister (बहन)', 'Cousin (चचेरी बहन)'], correct: 1 },
  { q: 'Which animal is the "King of the Jungle"? / कौन सा जानवर "जंगल का राजा" कहलाता है?', options: ['Tiger (बाघ)', 'Lion (शेर)', 'Elephant (हाथी)', 'Bear (भालू)'], correct: 1 },
  { q: 'What comes after Monday? / सोमवार के बाद कौन सा दिन आता है?', options: ['Tuesday (मंगलवार)', 'Sunday (रविवार)', 'Friday (शुक्रवार)', 'Wednesday (बुधवार)'], correct: 0 },
];

// Fisher–Yates shuffle for genuinely uniform randomness.
export function shuffledQuestions() {
  const arr = [...quizQuestions];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default quizQuestions;
