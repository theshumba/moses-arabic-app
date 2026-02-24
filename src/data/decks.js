/**
 * Deck definitions and stage configuration.
 * 4 stages, 10 decks with progressive unlocking via prerequisites.
 */

/**
 * Learning stages — cards progress through these stages.
 * Stage 1: Script basics (letters, forms, vowels, sun/moon)
 * Stage 2: Vocabulary building (numbers, uni vocab)
 * Stage 3: Grammar foundations
 * Stage 4: Fluency (common words, reading)
 */
export const STAGES = [
  { id: 1, name: 'Script Basics', description: 'Learn the Arabic alphabet, letter forms, and vowel marks' },
  { id: 2, name: 'Vocabulary Building', description: 'Build core vocabulary with numbers and university-level words' },
  { id: 3, name: 'Grammar Foundations', description: 'Learn pronouns, verb conjugation, and basic grammar' },
  { id: 4, name: 'Fluency', description: 'Common words and connected reading practice' },
];

/**
 * 10 deck definitions with progressive unlocking.
 *
 * Prerequisite format:
 *   { deckId, metric, threshold }
 *   metric: 'seen' (% cards seen at least once), 'goodPlus' (% cards rated good+), 'mastered' (% cards at max interval)
 *   threshold: 0-1 (e.g. 0.8 = 80%)
 *
 * Stage-level prerequisites:
 *   { stage, metric, threshold }
 *   Applies across all decks in that stage.
 */
export const DECKS = [
  // === Stage 1: Script Basics ===
  {
    id: 'letter-recognition',
    name: 'Letter Recognition',
    description: 'Identify all 28 Arabic letters by their isolated form',
    stage: 1,
    order: 1,
    prerequisite: null,
  },
  {
    id: 'letter-forms',
    name: 'Letter Forms',
    description: 'Learn initial, medial, and final forms of each letter',
    stage: 1,
    order: 2,
    prerequisite: { deckId: 'letter-recognition', metric: 'seen', threshold: 0.8 },
  },
  {
    id: 'harakat',
    name: 'Harakat (Vowel Marks)',
    description: 'Practice fatha, kasra, and damma on each letter',
    stage: 1,
    order: 3,
    prerequisite: { deckId: 'letter-forms', metric: 'goodPlus', threshold: 0.6 },
  },
  {
    id: 'sun-moon',
    name: 'Sun & Moon Letters',
    description: 'Learn which letters assimilate the "al-" definite article',
    stage: 1,
    order: 4,
    prerequisite: { deckId: 'harakat', metric: 'seen', threshold: 0.5 },
  },

  // === Stage 2: Vocabulary Building ===
  {
    id: 'numbers',
    name: 'Numbers 1-10',
    description: 'Arabic numerals and their word forms',
    stage: 2,
    order: 5,
    prerequisite: { deckId: 'letter-forms', metric: 'seen', threshold: 0.8 },
  },
  {
    id: 'uni-vocab',
    name: 'University Vocabulary',
    description: 'Essential vocabulary from introductory Arabic courses',
    stage: 2,
    order: 6,
    prerequisite: { stage: 1, metric: 'mastered', threshold: 0.5 },
  },

  // === Stage 3: Grammar Foundations ===
  {
    id: 'grammar',
    name: 'Grammar',
    description: 'Pronouns, verb conjugation, possessives, and grammar concepts',
    stage: 3,
    order: 7,
    prerequisite: { deckId: 'uni-vocab', metric: 'seen', threshold: 0.3 },
  },

  // === Stage 4: Fluency ===
  {
    id: 'common-words',
    name: 'Common Words',
    description: '250 frequently used Arabic words from everyday contexts',
    stage: 4,
    order: 8,
    prerequisite: { stage: 2, metric: 'mastered', threshold: 0.5 },
  },
  {
    id: 'connected-reading',
    name: 'Connected Reading',
    description: 'Read connected Arabic script with letter breakdowns',
    stage: 4,
    order: 9,
    prerequisite: { deckId: 'letter-forms', metric: 'mastered', threshold: 0.7 },
  },
  {
    id: 'reading-practice',
    name: 'Reading Practice',
    description: 'Full Arabic sentences for reading comprehension',
    stage: 4,
    order: 10,
    prerequisite: { deckId: 'common-words', metric: 'seen', threshold: 0.3 },
  },
];
