/**
 * DeckService — Pure functions for deck unlock logic, stats computation, and stage mastery.
 *
 * Features:
 * - Progressive deck unlocking via prerequisite chain
 * - Per-deck stats computation (total/seen/mastered/due/new)
 * - Stage-level mastery aggregation
 * - Human-readable unlock requirement descriptions
 *
 * NO React imports. NO side effects. Pure functions only.
 * Does NOT import StorageService — all data passed as arguments.
 */

import { DECKS, STAGES } from '../data/decks.js';
import { SrsService } from './SrsService.js';

/**
 * Get a deck definition by ID.
 * @param {string} deckId
 * @returns {Object|undefined}
 */
function getDeckById(deckId) {
  return DECKS.find((d) => d.id === deckId);
}

const DeckService = {
  /**
   * Compute stats for a single deck.
   *
   * @param {string} deckId - The deck ID
   * @param {Object} allProgress - Map of cardId -> progress object
   * @param {string[]} deckCardIds - Array of card IDs belonging to this deck
   * @returns {{ total: number, seen: number, mastered: number, due: number, new: number, masteryPercent: number, seenPercent: number }}
   */
  getDeckStats(deckId, allProgress, deckCardIds) {
    const total = deckCardIds.length;

    if (total === 0) {
      return {
        total: 0,
        seen: 0,
        mastered: 0,
        due: 0,
        new: 0,
        masteryPercent: 0,
        seenPercent: 0,
      };
    }

    let seen = 0;
    let mastered = 0;
    let due = 0;
    let newCount = 0;
    const now = new Date();

    for (const cardId of deckCardIds) {
      const progress = allProgress[cardId];
      if (!progress) {
        newCount++;
        continue;
      }

      seen++;

      if (SrsService.isCardMastered(progress)) {
        mastered++;
      }

      if (SrsService.isCardDue(progress, now)) {
        due++;
      }
    }

    return {
      total,
      seen,
      mastered,
      due,
      new: newCount,
      masteryPercent: total > 0 ? Math.round((mastered / total) * 100) : 0,
      seenPercent: total > 0 ? Math.round((seen / total) * 100) : 0,
    };
  },

  /**
   * Check if a deck is unlocked based on its prerequisite.
   *
   * Prerequisite types:
   * - null: Always unlocked (e.g. letter-recognition)
   * - { deckId, metric: 'seen', threshold }: % cards seen in prerequisite deck
   * - { deckId, metric: 'goodPlus', threshold }: % cards with lastRating >= 3
   * - { deckId, metric: 'mastered', threshold }: % cards mastered
   * - { stage, metric: 'mastered', threshold }: Average mastery across stage decks
   *
   * Edge case: prerequisite deck with 0 cards returns unlocked.
   *
   * @param {string} deckId - The deck to check
   * @param {Object} allProgress - Map of cardId -> progress object
   * @param {Object} allCardsByDeck - Map of deckId -> cardId[]
   * @returns {boolean}
   */
  isDeckUnlocked(deckId, allProgress, allCardsByDeck) {
    const deck = getDeckById(deckId);
    if (!deck) return false;

    const prereq = deck.prerequisite;

    // No prerequisite — always unlocked
    if (!prereq) return true;

    // Stage-level prerequisite: { stage, metric, threshold }
    if (prereq.stage !== undefined) {
      const stageMastery = this.getStageMastery(prereq.stage, allProgress, allCardsByDeck);
      const thresholdPercent = prereq.threshold * 100;
      return stageMastery >= thresholdPercent;
    }

    // Deck-level prerequisite: { deckId, metric, threshold }
    const prereqDeckCards = allCardsByDeck[prereq.deckId] || [];

    // Edge case: prerequisite deck with 0 cards → unlocked
    if (prereqDeckCards.length === 0) return true;

    const prereqStats = this.getDeckStats(prereq.deckId, allProgress, prereqDeckCards);
    const thresholdPercent = prereq.threshold * 100;

    switch (prereq.metric) {
      case 'mastered':
        return prereqStats.masteryPercent >= thresholdPercent;

      default:
        console.warn(`[DeckService] Unknown prerequisite metric: ${prereq.metric}`);
        return false;
    }
  },

  /**
   * Get aggregate mastery percentage for a stage.
   * Calculated as the average masteryPercent across all decks in that stage.
   *
   * @param {number} stageId - Stage ID (1-4)
   * @param {Object} allProgress - Map of cardId -> progress object
   * @param {Object} allCardsByDeck - Map of deckId -> cardId[]
   * @returns {number} Average mastery percentage (0-100)
   */
  getStageMastery(stageId, allProgress, allCardsByDeck) {
    const stageDecks = DECKS.filter((d) => d.stage === stageId);

    if (stageDecks.length === 0) return 0;

    let totalMastery = 0;
    for (const deck of stageDecks) {
      const deckCards = allCardsByDeck[deck.id] || [];
      const stats = this.getDeckStats(deck.id, allProgress, deckCards);
      totalMastery += stats.masteryPercent;
    }

    return Math.round(totalMastery / stageDecks.length);
  },

  /**
   * Get a human-readable description of what's needed to unlock a deck.
   *
   * @param {string} deckId
   * @returns {string} Human-readable unlock requirement
   */
  getUnlockRequirement(deckId) {
    const deck = getDeckById(deckId);
    if (!deck) return 'Unknown deck';

    const prereq = deck.prerequisite;
    if (!prereq) return 'Always unlocked';

    // Stage-level prerequisite
    if (prereq.stage !== undefined) {
      const stage = STAGES.find((s) => s.id === prereq.stage);
      const stageName = stage ? stage.name : `Stage ${prereq.stage}`;
      const pct = Math.round(prereq.threshold * 100);
      return `Reach ${pct}% mastery in ${stageName}`;
    }

    // Deck-level prerequisite
    const prereqDeck = getDeckById(prereq.deckId);
    const prereqName = prereqDeck ? prereqDeck.name : prereq.deckId;
    const pct = Math.round(prereq.threshold * 100);

    return `Master ${pct}% of ${prereqName} (3+ day interval, Good or Easy)`;
  },

  /**
   * Get stats, unlock status, and unlock text for all 10 decks.
   *
   * @param {Object} allProgress - Map of cardId -> progress object
   * @param {Object} allCardsByDeck - Map of deckId -> cardId[]
   * @returns {Array<{ deck: Object, stats: Object, unlocked: boolean, unlockText: string }>}
   */
  getAllDeckStats(allProgress, allCardsByDeck) {
    return DECKS.map((deck) => {
      const deckCards = allCardsByDeck[deck.id] || [];
      const stats = this.getDeckStats(deck.id, allProgress, deckCards);
      const unlocked = this.isDeckUnlocked(deck.id, allProgress, allCardsByDeck);
      const unlockText = this.getUnlockRequirement(deck.id);

      return { deck, stats, unlocked, unlockText };
    });
  },
};

export { DeckService };
