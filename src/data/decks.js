/**
 * Deck definitions and stage configuration.
 * 4 stages, 10 decks with progressive unlocking via strict mastery gates.
 *
 * Unlock philosophy (based on SuperMemo 95% retention + WaniKani Guru model):
 * - Every gate uses the 'mastered' metric (3+ day interval, Good+ last rating, ≤2 lapses)
 * - Stage 1-2: 95% mastered (foundational — near-perfect recall required)
 * - Stage 3-4: 90% mastered (conceptual — slight buffer for harder items)
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
 *   { deckId, metric: 'mastered', threshold }
 *   threshold: 0-1 (e.g. 0.95 = 95%)
 *
 * Stage-level prerequisites:
 *   { stage, metric: 'mastered', threshold }
 *   Requires average mastery across all decks in that stage.
 */
export const DECKS = [
  // === Stage 1: Script Basics (95% mastery gates, timed recall) ===
  {
    id: 'letter-recognition',
    name: 'Letter Recognition',
    description: 'Identify all 28 Arabic letters by their isolated form',
    stage: 1,
    order: 1,
    prerequisite: null,
    timeLimit: 8,
  },
  {
    id: 'letter-forms',
    name: 'Letter Forms',
    description: 'Learn initial, medial, and final forms of each letter',
    stage: 1,
    order: 2,
    prerequisite: { deckId: 'letter-recognition', metric: 'mastered', threshold: 0.95 },
    timeLimit: 10,
  },
  {
    id: 'harakat',
    name: 'Harakat (Vowel Marks)',
    description: 'Practice fatha, kasra, and damma on each letter',
    stage: 1,
    order: 3,
    prerequisite: { deckId: 'letter-forms', metric: 'mastered', threshold: 0.95 },
    timeLimit: 10,
  },
  {
    id: 'sun-moon',
    name: 'Sun & Moon Letters',
    description: 'Learn which letters assimilate the "al-" definite article',
    stage: 1,
    order: 4,
    prerequisite: { deckId: 'harakat', metric: 'mastered', threshold: 0.95 },
    timeLimit: 12,
  },

  // === Stage 2: Vocabulary Building (95% mastery gates) ===
  {
    id: 'numbers',
    name: 'Numbers 1-10',
    description: 'Arabic numerals and their word forms',
    stage: 2,
    order: 5,
    prerequisite: { deckId: 'letter-forms', metric: 'mastered', threshold: 0.95 },
  },
  {
    id: 'uni-vocab',
    name: 'University Vocabulary',
    description: 'Essential vocabulary from introductory Arabic courses',
    stage: 2,
    order: 6,
    prerequisite: { stage: 1, metric: 'mastered', threshold: 0.95 },
  },

  // === Stage 3: Grammar Foundations (90% mastery gate) ===
  {
    id: 'grammar',
    name: 'Grammar',
    description: 'Pronouns, verb conjugation, possessives, and grammar concepts',
    stage: 3,
    order: 7,
    prerequisite: { deckId: 'uni-vocab', metric: 'mastered', threshold: 0.90 },
  },

  // === Stage 4: Fluency (90% mastery gates) ===
  {
    id: 'common-words',
    name: 'Common Words',
    description: '250 frequently used Arabic words from everyday contexts',
    stage: 4,
    order: 8,
    prerequisite: { stage: 2, metric: 'mastered', threshold: 0.90 },
  },
  {
    id: 'connected-reading',
    name: 'Connected Reading',
    description: 'Read connected Arabic script with letter breakdowns',
    stage: 4,
    order: 9,
    prerequisite: { deckId: 'letter-forms', metric: 'mastered', threshold: 0.95 },
  },
  {
    id: 'reading-practice',
    name: 'Reading Practice',
    description: 'Full Arabic sentences for reading comprehension',
    stage: 4,
    order: 10,
    prerequisite: { deckId: 'common-words', metric: 'mastered', threshold: 0.90 },
  },
];
