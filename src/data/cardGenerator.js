/**
 * Card generator — transforms raw data sources into standardized flashcards.
 *
 * Every card has this shape:
 * {
 *   id: string,        — unique across all decks (prefixed by deck type)
 *   deckId: string,     — references DECKS[].id
 *   front: { primary: string, secondary?: string, hint?: string },
 *   back:  { primary: string, secondary?: string, detail?: string },
 *   typeAnswer: { prompt: string, acceptedAnswers: string[] }
 * }
 */

import alphabet from './alphabet.json';
import vocabulary from './vocabulary.json';
import { numberCards } from './numberCards.js';
import { uniVocab } from './uniVocab.js';
import { grammarCards, pronounCards, verbConjugationCards, possessiveCards, genderPairCards, demonstrativeCards, grammarConceptCards } from './grammarCards.js';
import { connectedReadingCards, readingPracticeCards } from './readingCards.js';

// ============================================================
// Sun/Moon letter classification
// ============================================================
const SUN_LETTERS = new Set(['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ن', 'ل']);
const MOON_LETTERS = new Set(['ا', 'ب', 'ج', 'ح', 'خ', 'ع', 'غ', 'ف', 'ق', 'ك', 'م', 'ه', 'و', 'ي']);

// ============================================================
// Deck 1: Letter Recognition (28 base letters, no ta_marbuta/hamza)
// ============================================================
function generateLetterRecognition() {
  const baseLetters = alphabet.letters.filter(
    (l) => l.id !== 'ta_marbuta' && l.id !== 'hamza'
  );
  return baseLetters.map((letter, i) => ({
    id: `lr-${String(i + 1).padStart(3, '0')}`,
    deckId: 'letter-recognition',
    front: {
      primary: letter.letter,
      hint: 'What letter is this?',
    },
    back: {
      primary: letter.name,
      secondary: `Sound: "${letter.transliteration}"`,
      detail: `Group ${letter.group}`,
    },
    typeAnswer: {
      prompt: `What is the name of this letter: ${letter.letter}?`,
      acceptedAnswers: [
        letter.name.toLowerCase(),
        letter.transliteration.toLowerCase(),
      ],
    },
  }));
}

// ============================================================
// Deck 2: Letter Forms (28 letters x 3 non-isolated forms = 84)
// ============================================================
function generateLetterForms() {
  const baseLetters = alphabet.letters.filter(
    (l) => l.id !== 'ta_marbuta' && l.id !== 'hamza'
  );
  const formNames = ['initial', 'medial', 'final'];
  const cards = [];
  let idx = 0;

  for (const letter of baseLetters) {
    for (const formName of formNames) {
      idx++;
      const form = letter.forms[formName];
      cards.push({
        id: `lf-${String(idx).padStart(3, '0')}`,
        deckId: 'letter-forms',
        front: {
          primary: form,
          hint: `${formName} form`,
        },
        back: {
          primary: `${letter.name} — ${formName}`,
          secondary: letter.transliteration,
          detail: `Isolated: ${letter.forms.isolated}`,
        },
        typeAnswer: {
          prompt: `Which letter is this ${formName} form: ${form}?`,
          acceptedAnswers: [
            letter.name.toLowerCase(),
            letter.transliteration.toLowerCase(),
          ],
        },
      });
    }
  }
  return cards;
}

// ============================================================
// Deck 3: Harakat / Vowel Marks (28 letters x 3 vowels = 84)
// ============================================================
function generateHarakat() {
  const baseLetters = alphabet.letters.filter(
    (l) => l.id !== 'ta_marbuta' && l.id !== 'hamza'
  );
  const cards = [];
  let idx = 0;

  for (const letter of baseLetters) {
    for (const vc of letter.vowelCombinations) {
      idx++;
      cards.push({
        id: `har-${String(idx).padStart(3, '0')}`,
        deckId: 'harakat',
        front: {
          primary: vc.arabic,
          hint: 'How is this pronounced?',
        },
        back: {
          primary: vc.sound,
          secondary: `${letter.name} + ${vc.vowel}`,
          detail: `Letter: ${letter.letter}, Vowel: ${vc.vowel}`,
        },
        typeAnswer: {
          prompt: `How is ${vc.arabic} pronounced?`,
          acceptedAnswers: [vc.sound.toLowerCase()],
        },
      });
    }
  }
  return cards;
}

// ============================================================
// Deck 4: Sun & Moon Letters (28 letters, classify each)
// ============================================================
function generateSunMoon() {
  const baseLetters = alphabet.letters.filter(
    (l) => l.id !== 'ta_marbuta' && l.id !== 'hamza'
  );
  return baseLetters.map((letter, i) => {
    const isSun = SUN_LETTERS.has(letter.letter);
    const type = isSun ? 'Sun (shamsiyya)' : 'Moon (qamariyya)';
    const alExample = isSun
      ? `ال + ${letter.letter} → الـ${letter.letter} (assimilates)`
      : `ال + ${letter.letter} → الـ${letter.letter} (no assimilation)`;

    return {
      id: `sm-${String(i + 1).padStart(3, '0')}`,
      deckId: 'sun-moon',
      front: {
        primary: letter.letter,
        hint: 'Sun or Moon letter?',
      },
      back: {
        primary: type,
        secondary: alExample,
        detail: isSun
          ? 'The lam of "al-" assimilates into this letter'
          : 'The lam of "al-" is pronounced normally',
      },
      typeAnswer: {
        prompt: `Is ${letter.name} (${letter.letter}) a sun or moon letter?`,
        acceptedAnswers: isSun
          ? ['sun', 'shamsiyya', 'shams']
          : ['moon', 'qamariyya', 'qamar'],
      },
    };
  });
}

// ============================================================
// Deck 5: Numbers 1-10
// ============================================================
function generateNumbers() {
  return numberCards.map((num) => ({
    id: `num-${num.id.split('-')[1]}`,
    deckId: 'numbers',
    front: {
      primary: num.arabic,
      hint: 'What number is this?',
    },
    back: {
      primary: num.english,
      secondary: `${num.word} (${num.transliteration})`,
    },
    typeAnswer: {
      prompt: `What number is ${num.arabic}?`,
      acceptedAnswers: [
        num.english.toLowerCase(),
        num.transliteration.toLowerCase(),
      ],
    },
  }));
}

// ============================================================
// Deck 6: University Vocabulary (~90)
// ============================================================
function generateUniVocab() {
  return uniVocab.map((item, i) => ({
    id: `uni-${String(i + 1).padStart(3, '0')}`,
    deckId: 'uni-vocab',
    front: {
      primary: item.arabic,
      hint: item.category,
    },
    back: {
      primary: item.english,
      secondary: item.transliteration,
      detail: `Category: ${item.category}`,
    },
    typeAnswer: {
      prompt: `What does ${item.arabic} mean?`,
      acceptedAnswers: [item.english.toLowerCase()],
    },
  }));
}

// ============================================================
// Deck 7: Grammar (~80)
// ============================================================
function generateGrammar() {
  const cards = [];

  // Pronouns (8)
  for (const p of pronounCards) {
    cards.push({
      id: `gram-p-${p.id.split('-')[2]}`,
      deckId: 'grammar',
      front: {
        primary: p.arabic,
        hint: 'Personal pronoun',
      },
      back: {
        primary: p.english,
        secondary: p.transliteration,
        detail: p.person,
      },
      typeAnswer: {
        prompt: `What does the pronoun ${p.arabic} mean?`,
        acceptedAnswers: [p.english.toLowerCase()],
      },
    });
  }

  // Verb conjugations (48)
  for (const vc of verbConjugationCards) {
    cards.push({
      id: `gram-c-${vc.id.split('gram-conj-')[1]}`,
      deckId: 'grammar',
      front: {
        primary: `${vc.pronoun} + ${vc.verb}`,
        secondary: `Conjugate: ${vc.verbEnglish}`,
        hint: 'Verb conjugation',
      },
      back: {
        primary: vc.conjugated,
        secondary: vc.transliteration,
        detail: `${vc.pronoun} ${vc.verbEnglish}`,
      },
      typeAnswer: {
        prompt: `Conjugate ${vc.verb} (${vc.verbEnglish}) for ${vc.pronoun}:`,
        acceptedAnswers: [vc.conjugated, vc.transliteration.toLowerCase()],
      },
    });
  }

  // Possessives (7)
  for (const ps of possessiveCards) {
    cards.push({
      id: `gram-ps-${ps.id.split('-')[2]}`,
      deckId: 'grammar',
      front: {
        primary: ps.suffix,
        secondary: `Example: ${ps.example}`,
        hint: 'Possessive suffix',
      },
      back: {
        primary: ps.english,
        secondary: ps.transliteration,
        detail: `${ps.example} = ${ps.exampleEnglish}`,
      },
      typeAnswer: {
        prompt: `What does the suffix ${ps.suffix} mean? (e.g. ${ps.example})`,
        acceptedAnswers: [ps.english.toLowerCase()],
      },
    });
  }

  // Gender pairs (8)
  for (const gp of genderPairCards) {
    cards.push({
      id: `gram-gp-${gp.id.split('-')[2]}`,
      deckId: 'grammar',
      front: {
        primary: gp.masculine,
        secondary: `What is the feminine form?`,
        hint: 'Masculine/Feminine pair',
      },
      back: {
        primary: gp.feminine,
        secondary: gp.transliteration,
        detail: `${gp.english}: ${gp.masculine} (m) / ${gp.feminine} (f)`,
      },
      typeAnswer: {
        prompt: `What is the feminine of ${gp.masculine} (${gp.english})?`,
        acceptedAnswers: [gp.feminine],
      },
    });
  }

  // Demonstratives (4)
  for (const d of demonstrativeCards) {
    cards.push({
      id: `gram-d-${d.id.split('-')[2]}`,
      deckId: 'grammar',
      front: {
        primary: d.arabic,
        hint: 'Demonstrative pronoun',
      },
      back: {
        primary: d.english,
        secondary: d.transliteration,
        detail: `${d.example} = ${d.exampleEnglish}`,
      },
      typeAnswer: {
        prompt: `What does ${d.arabic} mean?`,
        acceptedAnswers: [d.english.toLowerCase()],
      },
    });
  }

  // Grammar concepts (5)
  for (const gc of grammarConceptCards) {
    cards.push({
      id: `gram-gc-${gc.id.split('-')[2]}`,
      deckId: 'grammar',
      front: {
        primary: gc.arabic,
        secondary: gc.title,
        hint: 'Grammar concept',
      },
      back: {
        primary: gc.explanation,
        secondary: `${gc.example} = ${gc.exampleEnglish}`,
      },
      typeAnswer: {
        prompt: `What grammar concept does "${gc.arabic}" refer to?`,
        acceptedAnswers: [gc.title.toLowerCase()],
      },
    });
  }

  return cards;
}

// ============================================================
// Deck 8: Common Words (250 from vocabulary.json)
// ============================================================
function generateCommonWords() {
  return vocabulary.map((word, i) => ({
    id: `cw-${String(i + 1).padStart(3, '0')}`,
    deckId: 'common-words',
    front: {
      primary: word.arabic,
      hint: word.category,
    },
    back: {
      primary: word.english,
      secondary: word.transliteration,
      detail: word.exampleSentence
        ? `${word.exampleSentence.arabic} — ${word.exampleSentence.english}`
        : undefined,
    },
    typeAnswer: {
      prompt: `What does ${word.arabic} mean?`,
      acceptedAnswers: [word.english.toLowerCase()],
    },
  }));
}

// ============================================================
// Deck 9: Connected Reading (~50)
// ============================================================
function generateConnectedReading() {
  return connectedReadingCards.map((card) => ({
    id: `rc-${card.id.split('-')[2]}`,
    deckId: 'connected-reading',
    front: {
      primary: card.word,
      hint: 'Read the connected word',
    },
    back: {
      primary: card.english,
      secondary: card.transliteration,
      detail: `Letters: ${card.letterBreakdown}`,
    },
    typeAnswer: {
      prompt: `What does ${card.word} mean?`,
      acceptedAnswers: [
        card.english.toLowerCase(),
        card.transliteration.toLowerCase(),
      ],
    },
  }));
}

// ============================================================
// Deck 10: Reading Practice (~30)
// ============================================================
function generateReadingPractice() {
  return readingPracticeCards.map((card) => ({
    id: `rp-${card.id.split('-')[2]}`,
    deckId: 'reading-practice',
    front: {
      primary: card.arabic,
      hint: 'Read and translate',
    },
    back: {
      primary: card.english,
      secondary: card.transliteration,
    },
    typeAnswer: {
      prompt: `Translate: ${card.arabic}`,
      acceptedAnswers: [card.english.toLowerCase()],
    },
  }));
}

// ============================================================
// Public API
// ============================================================

/** Map of deck generators keyed by deckId */
const GENERATORS = {
  'letter-recognition': generateLetterRecognition,
  'letter-forms': generateLetterForms,
  harakat: generateHarakat,
  'sun-moon': generateSunMoon,
  numbers: generateNumbers,
  'uni-vocab': generateUniVocab,
  grammar: generateGrammar,
  'common-words': generateCommonWords,
  'connected-reading': generateConnectedReading,
  'reading-practice': generateReadingPractice,
};

/**
 * Generate cards for a specific deck.
 * @param {string} deckId
 * @returns {Array} cards in standard shape
 */
export function generateDeckCards(deckId) {
  const gen = GENERATORS[deckId];
  if (!gen) throw new Error(`Unknown deck: ${deckId}`);
  return gen();
}

/**
 * Generate all cards for all 10 decks.
 * @returns {Map<string, Array>} deckId → Card[]
 */
export function generateAllCards() {
  const map = new Map();
  for (const deckId of Object.keys(GENERATORS)) {
    map.set(deckId, generateDeckCards(deckId));
  }
  return map;
}

/**
 * Generate all cards as a flat array.
 * @returns {Array} all cards across all decks
 */
export function getAllCardsFlat() {
  const map = generateAllCards();
  return Array.from(map.values()).flat();
}
