// Kept very easy (1st-grade level) and bilingual (English / Hindi) on purpose.
const statements = [
  { text: 'The sun rises in the morning. / सूरज सुबह निकलता है।', answer: true },
  { text: 'A cat has 8 legs. / बिल्ली के 8 पैर होते हैं।', answer: false },
  { text: 'Ice is cold. / बर्फ ठंडी होती है।', answer: true },
  { text: 'Fish can fly in the sky. / मछली आसमान में उड़ सकती है।', answer: false },
  { text: 'A week has 7 days. / एक हफ्ते में 7 दिन होते हैं।', answer: true },
  { text: 'The sky is green. / आसमान हरा होता है।', answer: false },
  { text: 'Dogs can bark. / कुत्ते भौंक सकते हैं।', answer: true },
  { text: 'A triangle has 4 sides. / त्रिकोण की 4 भुजाएं होती हैं।', answer: false },
  { text: 'Milk is white. / दूध सफेद होता है।', answer: true },
  { text: 'Elephants are very small. / हाथी बहुत छोटे होते हैं।', answer: false },
  { text: 'We use our eyes to see. / हम देखने के लिए अपनी आंखों का इस्तेमाल करते हैं।', answer: true },
  { text: 'Bananas are blue. / केला नीले रंग का होता है।', answer: false },
  { text: 'A year has 12 months. / एक साल में 12 महीने होते हैं।', answer: true },
  { text: 'Birds can swim like fish. / पक्षी मछली की तरह तैर सकते हैं।', answer: false },
  { text: 'The sun is hot. / सूरज गर्म होता है।', answer: true },
  { text: 'A square has 3 sides. / चौकोर की 3 भुजाएं होती हैं।', answer: false },
  { text: 'Cows give us milk. / गाय हमें दूध देती है।', answer: true },
  { text: 'We eat food with our nose. / हम अपनी नाक से खाना खाते हैं।', answer: false },
  { text: 'Water is wet. / पानी गीला होता है।', answer: true },
  { text: 'A day has 24 hours. / एक दिन में 24 घंटे होते हैं।', answer: true },
  { text: 'Rabbits are very slow. / खरगोश बहुत धीमे होते हैं।', answer: false },
  { text: 'We sleep at night. / हम रात में सोते हैं।', answer: true },
  { text: 'Fire is cold. / आग ठंडी होती है।', answer: false },
  { text: 'A hen lays eggs. / मुर्गी अंडे देती है।', answer: true },
];

export function randomStatement() {
  return statements[Math.floor(Math.random() * statements.length)];
}

export default statements;
