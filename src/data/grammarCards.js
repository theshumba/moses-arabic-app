/**
 * Grammar cards (~80 items).
 * Covers pronouns, verb conjugation, possessive suffixes,
 * masculine/feminine pairs, demonstratives, and grammar concepts.
 */

// === Personal Pronouns (8) ===
export const pronounCards = [
  { id: 'gram-pron-01', arabic: 'أَنا', english: 'I', transliteration: 'anaa', person: '1st singular' },
  { id: 'gram-pron-02', arabic: 'أَنتَ', english: 'you (m)', transliteration: 'anta', person: '2nd singular masc' },
  { id: 'gram-pron-03', arabic: 'أَنتِ', english: 'you (f)', transliteration: 'anti', person: '2nd singular fem' },
  { id: 'gram-pron-04', arabic: 'هُوَ', english: 'he', transliteration: 'huwa', person: '3rd singular masc' },
  { id: 'gram-pron-05', arabic: 'هِيَ', english: 'she', transliteration: 'hiya', person: '3rd singular fem' },
  { id: 'gram-pron-06', arabic: 'نَحنُ', english: 'we', transliteration: 'nahnu', person: '1st plural' },
  { id: 'gram-pron-07', arabic: 'أَنتُم', english: 'you (pl)', transliteration: 'antum', person: '2nd plural' },
  { id: 'gram-pron-08', arabic: 'هُم', english: 'they', transliteration: 'hum', person: '3rd plural' },
];

// === Verb Conjugation Cards (~48: 6 verbs x 8 pronouns) ===
const conjugationVerbs = [
  {
    root: 'يَكتُب',
    rootEnglish: 'to write',
    rootTransliteration: 'yaktub',
    conjugations: [
      { pronoun: 'أَنا', form: 'أَكتُب', transliteration: 'aktub' },
      { pronoun: 'أَنتَ', form: 'تَكتُب', transliteration: 'taktub' },
      { pronoun: 'أَنتِ', form: 'تَكتُبِين', transliteration: 'taktubiina' },
      { pronoun: 'هُوَ', form: 'يَكتُب', transliteration: 'yaktub' },
      { pronoun: 'هِيَ', form: 'تَكتُب', transliteration: 'taktub' },
      { pronoun: 'نَحنُ', form: 'نَكتُب', transliteration: 'naktub' },
      { pronoun: 'أَنتُم', form: 'تَكتُبُون', transliteration: 'taktubuuna' },
      { pronoun: 'هُم', form: 'يَكتُبُون', transliteration: 'yaktubuuna' },
    ],
  },
  {
    root: 'يَدرُس',
    rootEnglish: 'to study',
    rootTransliteration: 'yadrus',
    conjugations: [
      { pronoun: 'أَنا', form: 'أَدرُس', transliteration: 'adrus' },
      { pronoun: 'أَنتَ', form: 'تَدرُس', transliteration: 'tadrus' },
      { pronoun: 'أَنتِ', form: 'تَدرُسِين', transliteration: 'tadrusiina' },
      { pronoun: 'هُوَ', form: 'يَدرُس', transliteration: 'yadrus' },
      { pronoun: 'هِيَ', form: 'تَدرُس', transliteration: 'tadrus' },
      { pronoun: 'نَحنُ', form: 'نَدرُس', transliteration: 'nadrus' },
      { pronoun: 'أَنتُم', form: 'تَدرُسُون', transliteration: 'tadrusuuna' },
      { pronoun: 'هُم', form: 'يَدرُسُون', transliteration: 'yadrusuuna' },
    ],
  },
  {
    root: 'يَذهَب',
    rootEnglish: 'to go',
    rootTransliteration: 'yadhhab',
    conjugations: [
      { pronoun: 'أَنا', form: 'أَذهَب', transliteration: 'adhhab' },
      { pronoun: 'أَنتَ', form: 'تَذهَب', transliteration: 'tadhhab' },
      { pronoun: 'أَنتِ', form: 'تَذهَبِين', transliteration: 'tadhhabiina' },
      { pronoun: 'هُوَ', form: 'يَذهَب', transliteration: 'yadhhab' },
      { pronoun: 'هِيَ', form: 'تَذهَب', transliteration: 'tadhhab' },
      { pronoun: 'نَحنُ', form: 'نَذهَب', transliteration: 'nadhhab' },
      { pronoun: 'أَنتُم', form: 'تَذهَبُون', transliteration: 'tadhhabuuna' },
      { pronoun: 'هُم', form: 'يَذهَبُون', transliteration: 'yadhhabuuna' },
    ],
  },
  {
    root: 'يَعمَل',
    rootEnglish: 'to work',
    rootTransliteration: "ya'mal",
    conjugations: [
      { pronoun: 'أَنا', form: 'أَعمَل', transliteration: "a'mal" },
      { pronoun: 'أَنتَ', form: 'تَعمَل', transliteration: "ta'mal" },
      { pronoun: 'أَنتِ', form: 'تَعمَلِين', transliteration: "ta'maliina" },
      { pronoun: 'هُوَ', form: 'يَعمَل', transliteration: "ya'mal" },
      { pronoun: 'هِيَ', form: 'تَعمَل', transliteration: "ta'mal" },
      { pronoun: 'نَحنُ', form: 'نَعمَل', transliteration: "na'mal" },
      { pronoun: 'أَنتُم', form: 'تَعمَلُون', transliteration: "ta'maluuna" },
      { pronoun: 'هُم', form: 'يَعمَلُون', transliteration: "ya'maluuna" },
    ],
  },
  {
    root: 'يَسكُن',
    rootEnglish: 'to live/reside',
    rootTransliteration: 'yaskun',
    conjugations: [
      { pronoun: 'أَنا', form: 'أَسكُن', transliteration: 'askun' },
      { pronoun: 'أَنتَ', form: 'تَسكُن', transliteration: 'taskun' },
      { pronoun: 'أَنتِ', form: 'تَسكُنِين', transliteration: 'taskuniina' },
      { pronoun: 'هُوَ', form: 'يَسكُن', transliteration: 'yaskun' },
      { pronoun: 'هِيَ', form: 'تَسكُن', transliteration: 'taskun' },
      { pronoun: 'نَحنُ', form: 'نَسكُن', transliteration: 'naskun' },
      { pronoun: 'أَنتُم', form: 'تَسكُنُون', transliteration: 'taskunuuna' },
      { pronoun: 'هُم', form: 'يَسكُنُون', transliteration: 'yaskunuuna' },
    ],
  },
  {
    root: 'يَأكُل',
    rootEnglish: 'to eat',
    rootTransliteration: "ya'kul",
    conjugations: [
      { pronoun: 'أَنا', form: 'آكُل', transliteration: 'aakul' },
      { pronoun: 'أَنتَ', form: 'تَأكُل', transliteration: "ta'kul" },
      { pronoun: 'أَنتِ', form: 'تَأكُلِين', transliteration: "ta'kuliina" },
      { pronoun: 'هُوَ', form: 'يَأكُل', transliteration: "ya'kul" },
      { pronoun: 'هِيَ', form: 'تَأكُل', transliteration: "ta'kul" },
      { pronoun: 'نَحنُ', form: 'نَأكُل', transliteration: "na'kul" },
      { pronoun: 'أَنتُم', form: 'تَأكُلُون', transliteration: "ta'kuluuna" },
      { pronoun: 'هُم', form: 'يَأكُلُون', transliteration: "ya'kuluuna" },
    ],
  },
];

// Flatten verb conjugation data into card entries
export const verbConjugationCards = conjugationVerbs.flatMap((verb, vi) =>
  verb.conjugations.map((conj, ci) => ({
    id: `gram-conj-${String(vi + 1).padStart(2, '0')}-${String(ci + 1).padStart(2, '0')}`,
    verb: verb.root,
    verbEnglish: verb.rootEnglish,
    verbTransliteration: verb.rootTransliteration,
    pronoun: conj.pronoun,
    conjugated: conj.form,
    transliteration: conj.transliteration,
  }))
);

// === Possessive Suffix Cards (7) ===
export const possessiveCards = [
  { id: 'gram-poss-01', suffix: 'ـي', english: 'my', transliteration: '-ii', example: 'كِتابِي', exampleEnglish: 'my book' },
  { id: 'gram-poss-02', suffix: 'ـكَ', english: 'your (m)', transliteration: '-ka', example: 'كِتابُكَ', exampleEnglish: 'your book (m)' },
  { id: 'gram-poss-03', suffix: 'ـكِ', english: 'your (f)', transliteration: '-ki', example: 'كِتابُكِ', exampleEnglish: 'your book (f)' },
  { id: 'gram-poss-04', suffix: 'ـهُ', english: 'his', transliteration: '-hu', example: 'كِتابُهُ', exampleEnglish: 'his book' },
  { id: 'gram-poss-05', suffix: 'ـها', english: 'her', transliteration: '-haa', example: 'كِتابُها', exampleEnglish: 'her book' },
  { id: 'gram-poss-06', suffix: 'ـنا', english: 'our', transliteration: '-naa', example: 'كِتابُنا', exampleEnglish: 'our book' },
  { id: 'gram-poss-07', suffix: 'ـهُم', english: 'their', transliteration: '-hum', example: 'كِتابُهُم', exampleEnglish: 'their book' },
];

// === Masculine/Feminine Pair Cards (8) ===
export const genderPairCards = [
  { id: 'gram-gend-01', masculine: 'طالِب', feminine: 'طالِبة', english: 'student', transliteration: 'taalib / taaliba' },
  { id: 'gram-gend-02', masculine: 'مُدَرِّس', feminine: 'مُدَرِّسة', english: 'teacher', transliteration: 'mudarris / mudarrisa' },
  { id: 'gram-gend-03', masculine: 'طَبِيب', feminine: 'طَبِيبة', english: 'doctor', transliteration: 'tabiib / tabiiba' },
  { id: 'gram-gend-04', masculine: 'كَبِير', feminine: 'كَبِيرة', english: 'big', transliteration: 'kabiir / kabiira' },
  { id: 'gram-gend-05', masculine: 'صَغِير', feminine: 'صَغِيرة', english: 'small', transliteration: 'Saghiir / Saghiira' },
  { id: 'gram-gend-06', masculine: 'جَمِيل', feminine: 'جَمِيلة', english: 'beautiful', transliteration: 'jamiil / jamiila' },
  { id: 'gram-gend-07', masculine: 'مِصرِي', feminine: 'مِصرِيّة', english: 'Egyptian', transliteration: 'miSrii / miSriyya' },
  { id: 'gram-gend-08', masculine: 'سَعِيد', feminine: 'سَعِيدة', english: 'happy', transliteration: "sa'iid / sa'iida" },
];

// === Demonstrative Cards (4) ===
export const demonstrativeCards = [
  { id: 'gram-demo-01', arabic: 'هٰذا', english: 'this (m)', transliteration: 'haadha', example: 'هٰذا كِتاب', exampleEnglish: 'This is a book' },
  { id: 'gram-demo-02', arabic: 'هٰذِهِ', english: 'this (f)', transliteration: 'haadhihi', example: 'هٰذِهِ سَيّارة', exampleEnglish: 'This is a car' },
  { id: 'gram-demo-03', arabic: 'ذٰلِكَ', english: 'that (m)', transliteration: 'dhaalika', example: 'ذٰلِكَ بَيت', exampleEnglish: 'That is a house' },
  { id: 'gram-demo-04', arabic: 'تِلكَ', english: 'that (f)', transliteration: 'tilka', example: 'تِلكَ مَدرَسة', exampleEnglish: 'That is a school' },
];

// === Basic Grammar Concept Cards (5) ===
export const grammarConceptCards = [
  {
    id: 'gram-concept-01',
    title: 'Definite Article',
    arabic: 'ال',
    explanation: 'الـ (al-) makes a noun definite. Attach to the beginning of the word.',
    example: 'كِتاب → الكِتاب',
    exampleEnglish: 'a book → the book',
  },
  {
    id: 'gram-concept-02',
    title: 'Ta Marbuta',
    arabic: 'ة',
    explanation: 'ة (ta marbuta) typically marks feminine nouns and adjectives.',
    example: 'طالِب → طالِبة',
    exampleEnglish: 'student (m) → student (f)',
  },
  {
    id: 'gram-concept-03',
    title: 'Nominal Sentence',
    arabic: 'جُملة اِسمِيّة',
    explanation: 'A sentence that begins with a noun (subject + predicate, no verb needed).',
    example: 'الوَلَدُ كَبِير',
    exampleEnglish: 'The boy is big',
  },
  {
    id: 'gram-concept-04',
    title: 'Idafa (Possession)',
    arabic: 'إِضافة',
    explanation: 'Two nouns placed together to show possession. First noun is indefinite, second is definite.',
    example: 'كِتابُ الطّالِب',
    exampleEnglish: "the student's book",
  },
  {
    id: 'gram-concept-05',
    title: 'Adjective Agreement',
    arabic: 'مُطابَقة',
    explanation: 'Adjectives follow the noun and must agree in gender and definiteness.',
    example: 'البِنتُ الجَمِيلة',
    exampleEnglish: 'the beautiful girl',
  },
];

/** All grammar cards combined for easy import */
export const grammarCards = [
  ...pronounCards,
  ...verbConjugationCards,
  ...possessiveCards,
  ...genderPairCards,
  ...demonstrativeCards,
  ...grammarConceptCards,
];
