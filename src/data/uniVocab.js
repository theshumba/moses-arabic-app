/**
 * University-level Arabic vocabulary (~90 items).
 * Curated from introductory Arabic courses covering everyday topics.
 */
export const uniVocab = [
  // === Family (~16) ===
  { id: 'uni-family-01', arabic: 'أَب', english: 'father', transliteration: 'ab', category: 'family' },
  { id: 'uni-family-02', arabic: 'أُمّ', english: 'mother', transliteration: 'umm', category: 'family' },
  { id: 'uni-family-03', arabic: 'أَخ', english: 'brother', transliteration: 'akh', category: 'family' },
  { id: 'uni-family-04', arabic: 'أُخت', english: 'sister', transliteration: 'ukht', category: 'family' },
  { id: 'uni-family-05', arabic: 'اِبن', english: 'son', transliteration: 'ibn', category: 'family' },
  { id: 'uni-family-06', arabic: 'بِنت', english: 'daughter', transliteration: 'bint', category: 'family' },
  { id: 'uni-family-07', arabic: 'وَالِد', english: 'father (formal)', transliteration: 'waalid', category: 'family' },
  { id: 'uni-family-08', arabic: 'وَالِدة', english: 'mother (formal)', transliteration: 'waalida', category: 'family' },
  { id: 'uni-family-09', arabic: 'زَوج', english: 'husband', transliteration: 'zawj', category: 'family' },
  { id: 'uni-family-10', arabic: 'زَوجة', english: 'wife', transliteration: 'zawja', category: 'family' },
  { id: 'uni-family-11', arabic: 'عَمّ', english: 'paternal uncle', transliteration: "'amm", category: 'family' },
  { id: 'uni-family-12', arabic: 'عَمّة', english: 'paternal aunt', transliteration: "'amma", category: 'family' },
  { id: 'uni-family-13', arabic: 'خَال', english: 'maternal uncle', transliteration: 'khaal', category: 'family' },
  { id: 'uni-family-14', arabic: 'خَالة', english: 'maternal aunt', transliteration: 'khaala', category: 'family' },
  { id: 'uni-family-15', arabic: 'جَدّ', english: 'grandfather', transliteration: 'jadd', category: 'family' },
  { id: 'uni-family-16', arabic: 'جَدّة', english: 'grandmother', transliteration: 'jadda', category: 'family' },

  // === Professions (~9) ===
  { id: 'uni-prof-01', arabic: 'طَبِيب', english: 'doctor', transliteration: 'tabiib', category: 'professions' },
  { id: 'uni-prof-02', arabic: 'مُهَندِس', english: 'engineer', transliteration: 'muhandis', category: 'professions' },
  { id: 'uni-prof-03', arabic: 'أُستاذ', english: 'professor', transliteration: 'ustaadh', category: 'professions' },
  { id: 'uni-prof-04', arabic: 'مُدَرِّس', english: 'teacher', transliteration: 'mudarris', category: 'professions' },
  { id: 'uni-prof-05', arabic: 'مُتَرجِم', english: 'translator', transliteration: 'mutarjim', category: 'professions' },
  { id: 'uni-prof-06', arabic: 'مُوَظَّف', english: 'employee', transliteration: 'muwaDDaf', category: 'professions' },
  { id: 'uni-prof-07', arabic: 'مُمَرِّضة', english: 'nurse', transliteration: 'mumarriDa', category: 'professions' },
  { id: 'uni-prof-08', arabic: 'مُحاسِب', english: 'accountant', transliteration: 'muhaasib', category: 'professions' },
  { id: 'uni-prof-09', arabic: 'رَبّة مَنزِل', english: 'housewife', transliteration: 'rabbat manzil', category: 'professions' },

  // === Countries (~10) ===
  { id: 'uni-country-01', arabic: 'مِصر', english: 'Egypt', transliteration: 'miSr', category: 'countries' },
  { id: 'uni-country-02', arabic: 'سُورِيا', english: 'Syria', transliteration: 'suuriyaa', category: 'countries' },
  { id: 'uni-country-03', arabic: 'لُبنان', english: 'Lebanon', transliteration: 'lubnaan', category: 'countries' },
  { id: 'uni-country-04', arabic: 'الأُردُن', english: 'Jordan', transliteration: 'al-urdun', category: 'countries' },
  { id: 'uni-country-05', arabic: 'العِراق', english: 'Iraq', transliteration: "al-'iraaq", category: 'countries' },
  { id: 'uni-country-06', arabic: 'فِلَسطِين', english: 'Palestine', transliteration: 'filastiin', category: 'countries' },
  { id: 'uni-country-07', arabic: 'السَّعُودِيّة', english: 'Saudi Arabia', transliteration: 'as-sa\'uudiyya', category: 'countries' },
  { id: 'uni-country-08', arabic: 'المَغرِب', english: 'Morocco', transliteration: 'al-maghrib', category: 'countries' },
  { id: 'uni-country-09', arabic: 'بِرِيطانِيا', english: 'Britain', transliteration: 'briitaaniyaa', category: 'countries' },
  { id: 'uni-country-10', arabic: 'فَرَنسا', english: 'France', transliteration: 'faransaa', category: 'countries' },

  // === Nationalities (~10) ===
  { id: 'uni-nation-01', arabic: 'مِصرِي', english: 'Egyptian', transliteration: 'miSrii', category: 'nationalities' },
  { id: 'uni-nation-02', arabic: 'سُورِي', english: 'Syrian', transliteration: 'suurii', category: 'nationalities' },
  { id: 'uni-nation-03', arabic: 'لُبنانِي', english: 'Lebanese', transliteration: 'lubnaanii', category: 'nationalities' },
  { id: 'uni-nation-04', arabic: 'أُردُنِّي', english: 'Jordanian', transliteration: 'urdunnii', category: 'nationalities' },
  { id: 'uni-nation-05', arabic: 'عِراقِي', english: 'Iraqi', transliteration: "'iraaqii", category: 'nationalities' },
  { id: 'uni-nation-06', arabic: 'فِلَسطِينِي', english: 'Palestinian', transliteration: 'filastiinii', category: 'nationalities' },
  { id: 'uni-nation-07', arabic: 'سَعُودِي', english: 'Saudi', transliteration: "sa'uudii", category: 'nationalities' },
  { id: 'uni-nation-08', arabic: 'مَغرِبِي', english: 'Moroccan', transliteration: 'maghribii', category: 'nationalities' },
  { id: 'uni-nation-09', arabic: 'بِرِيطانِي', english: 'British', transliteration: 'briitaanii', category: 'nationalities' },
  { id: 'uni-nation-10', arabic: 'فَرَنسِي', english: 'French', transliteration: 'faransii', category: 'nationalities' },

  // === Adjectives (~10) ===
  { id: 'uni-adj-01', arabic: 'كَبِير', english: 'big', transliteration: 'kabiir', category: 'adjectives' },
  { id: 'uni-adj-02', arabic: 'صَغِير', english: 'small', transliteration: 'Saghiir', category: 'adjectives' },
  { id: 'uni-adj-03', arabic: 'جَمِيل', english: 'beautiful', transliteration: 'jamiil', category: 'adjectives' },
  { id: 'uni-adj-04', arabic: 'قَدِيم', english: 'old', transliteration: 'qadiim', category: 'adjectives' },
  { id: 'uni-adj-05', arabic: 'جَدِيد', english: 'new', transliteration: 'jadiid', category: 'adjectives' },
  { id: 'uni-adj-06', arabic: 'طَوِيل', english: 'tall/long', transliteration: 'Tawiil', category: 'adjectives' },
  { id: 'uni-adj-07', arabic: 'قَصِير', english: 'short', transliteration: 'qaSiir', category: 'adjectives' },
  { id: 'uni-adj-08', arabic: 'سَعِيد', english: 'happy', transliteration: "sa'iid", category: 'adjectives' },
  { id: 'uni-adj-09', arabic: 'حَزِين', english: 'sad', transliteration: 'haziiin', category: 'adjectives' },
  { id: 'uni-adj-10', arabic: 'مُرِيح', english: 'comfortable', transliteration: 'muriih', category: 'adjectives' },

  // === Nouns (~10) ===
  { id: 'uni-noun-01', arabic: 'بَيت', english: 'house', transliteration: 'bayt', category: 'nouns' },
  { id: 'uni-noun-02', arabic: 'مَدِينة', english: 'city', transliteration: 'madiina', category: 'nouns' },
  { id: 'uni-noun-03', arabic: 'جامِعة', english: 'university', transliteration: "jaami'a", category: 'nouns' },
  { id: 'uni-noun-04', arabic: 'مَدرَسة', english: 'school', transliteration: 'madrasa', category: 'nouns' },
  { id: 'uni-noun-05', arabic: 'شَرِكة', english: 'company', transliteration: 'sharika', category: 'nouns' },
  { id: 'uni-noun-06', arabic: 'مَكتَب', english: 'office/desk', transliteration: 'maktab', category: 'nouns' },
  { id: 'uni-noun-07', arabic: 'شَقّة', english: 'apartment', transliteration: 'shaqqa', category: 'nouns' },
  { id: 'uni-noun-08', arabic: 'سَيّارة', english: 'car', transliteration: 'sayyaara', category: 'nouns' },
  { id: 'uni-noun-09', arabic: 'كِتاب', english: 'book', transliteration: 'kitaab', category: 'nouns' },
  { id: 'uni-noun-10', arabic: 'غُرفة', english: 'room', transliteration: 'ghurfa', category: 'nouns' },

  // === Verbs (~13) ===
  { id: 'uni-verb-01', arabic: 'يَسكُن', english: 'to live/reside', transliteration: 'yaskun', category: 'verbs' },
  { id: 'uni-verb-02', arabic: 'يَعمَل', english: 'to work', transliteration: "ya'mal", category: 'verbs' },
  { id: 'uni-verb-03', arabic: 'يَدرُس', english: 'to study', transliteration: 'yadrus', category: 'verbs' },
  { id: 'uni-verb-04', arabic: 'يَذهَب', english: 'to go', transliteration: 'yadhhab', category: 'verbs' },
  { id: 'uni-verb-05', arabic: 'يَقرَأ', english: 'to read', transliteration: "yaqra'", category: 'verbs' },
  { id: 'uni-verb-06', arabic: 'يَكتُب', english: 'to write', transliteration: 'yaktub', category: 'verbs' },
  { id: 'uni-verb-07', arabic: 'يَتَكَلَّم', english: 'to speak', transliteration: 'yatakallam', category: 'verbs' },
  { id: 'uni-verb-08', arabic: 'يُشاهِد', english: 'to watch', transliteration: 'yushaahid', category: 'verbs' },
  { id: 'uni-verb-09', arabic: 'يُسافِر', english: 'to travel', transliteration: 'yusaafir', category: 'verbs' },
  { id: 'uni-verb-10', arabic: 'يَطبُخ', english: 'to cook', transliteration: 'yaTbukh', category: 'verbs' },
  { id: 'uni-verb-11', arabic: 'يَأكُل', english: 'to eat', transliteration: "ya'kul", category: 'verbs' },
  { id: 'uni-verb-12', arabic: 'يَشرَب', english: 'to drink', transliteration: 'yashrab', category: 'verbs' },
  { id: 'uni-verb-13', arabic: 'يَزُور', english: 'to visit', transliteration: 'yazuur', category: 'verbs' },

  // === Prepositions (6) ===
  { id: 'uni-prep-01', arabic: 'فِي', english: 'in', transliteration: 'fii', category: 'prepositions' },
  { id: 'uni-prep-02', arabic: 'مِن', english: 'from', transliteration: 'min', category: 'prepositions' },
  { id: 'uni-prep-03', arabic: 'إِلى', english: 'to', transliteration: 'ilaa', category: 'prepositions' },
  { id: 'uni-prep-04', arabic: 'مَع', english: 'with', transliteration: "ma'a", category: 'prepositions' },
  { id: 'uni-prep-05', arabic: 'عَن', english: 'about', transliteration: "'an", category: 'prepositions' },
  { id: 'uni-prep-06', arabic: 'عَلى', english: 'on', transliteration: "'alaa", category: 'prepositions' },

  // === Adverbs (6) ===
  { id: 'uni-adv-01', arabic: 'دَائِماً', english: 'always', transliteration: "daa'iman", category: 'adverbs' },
  { id: 'uni-adv-02', arabic: 'عَادةً', english: 'usually', transliteration: "'aadatan", category: 'adverbs' },
  { id: 'uni-adv-03', arabic: 'أَحياناً', english: 'sometimes', transliteration: 'ahyaanan', category: 'adverbs' },
  { id: 'uni-adv-04', arabic: 'نادِراً', english: 'rarely', transliteration: 'naadiran', category: 'adverbs' },
  { id: 'uni-adv-05', arabic: 'أَبَداً', english: 'never', transliteration: 'abadan', category: 'adverbs' },
  { id: 'uni-adv-06', arabic: 'كُلّ يَوم', english: 'every day', transliteration: 'kull yawm', category: 'adverbs' },
];
