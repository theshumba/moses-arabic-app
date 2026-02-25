/**
 * SrsService — Pure functions implementing the SM-2 spaced repetition algorithm.
 *
 * Features:
 * - SM-2 interval/EF calculations with EF recovery on Good ratings
 * - Learning steps: 1min -> 10min -> graduate (1 day)
 * - Study queue building (due reviews first, then new cards)
 * - Again re-show capping (max 3 per session with interleaving)
 * - All dates stored as ISO strings (JSON-safe)
 *
 * NO React imports. NO side effects. Pure functions only.
 */

import { addMinutes, addDays, isBefore, isEqual } from 'date-fns';

/** Rating constants */
const AGAIN = 1;
const HARD = 2;
const GOOD = 3;
const EASY = 4;

/** Learning steps in minutes: step 1 = 1min, step 2 = 10min */
const LEARNING_STEPS = [1, 10];

/** EF floor — never goes below this */
const EF_FLOOR = 1.3;

/** Graduation interval in days */
const GRADUATION_INTERVAL = 1;

/** Max again re-shows per session */
const MAX_AGAIN_RESHOWS = 3;

/**
 * Clamp EF to floor.
 * @param {number} ef
 * @returns {number}
 */
function clampEF(ef) {
  return Math.max(EF_FLOOR, ef);
}

/**
 * Get a Date object from various inputs.
 * @param {Date|string|number} [dateInput]
 * @returns {Date}
 */
function toDate(dateInput) {
  if (!dateInput) return new Date();
  if (dateInput instanceof Date) return dateInput;
  return new Date(dateInput);
}

const SrsService = {
  /**
   * Create initial progress for a card.
   * @param {string} cardId
   * @returns {Object} Fresh card progress
   */
  createCardProgress(cardId) {
    return {
      cardId,
      interval: 0,
      repetition: 0,
      easeFactor: 2.5,
      nextReview: null,
      lapses: 0,
      lastRating: null,
      totalReviews: 0,
      step: 0,
    };
  },

  /**
   * Process a review and return a NEW progress object (immutable).
   *
   * SM-2 implementation:
   * - Again (1): Reset to step 1, lapse, EF-0.2, next = now+1min
   * - Hard (2): Learning: stay at step. Graduated: interval*1.2, EF-0.15
   * - Good (3): Learning: advance step. Graduated: interval*EF. EF recovery if < 2.5
   * - Easy (4): Learning: graduate immediately. Graduated: interval*EF*1.3, EF+0.15
   *
   * @param {Object} progress - Current card progress
   * @param {number} rating - 1 (Again), 2 (Hard), 3 (Good), 4 (Easy)
   * @param {Date|string} [now] - Current time (defaults to new Date())
   * @returns {Object} New progress object
   */
  reviewCard(progress, rating, now) {
    const currentTime = toDate(now);
    const isLearning = progress.step < LEARNING_STEPS.length;

    let newStep = progress.step;
    let newInterval = progress.interval;
    let newRepetition = progress.repetition;
    let newEF = progress.easeFactor;
    let newLapses = progress.lapses;
    let nextReview;

    switch (rating) {
      case AGAIN: {
        // Reset to step 1, lapse
        newStep = 0;
        newInterval = 0;
        newRepetition = 0;
        newLapses = progress.lapses + 1;
        newEF = clampEF(progress.easeFactor - 0.2);
        nextReview = addMinutes(currentTime, LEARNING_STEPS[0]).toISOString();
        break;
      }

      case HARD: {
        if (isLearning) {
          // Stay at current step, repeat the step interval
          const stepMinutes = LEARNING_STEPS[newStep] || LEARNING_STEPS[LEARNING_STEPS.length - 1];
          nextReview = addMinutes(currentTime, stepMinutes).toISOString();
        } else {
          // Graduated: interval * 1.2
          newInterval = Math.max(1, Math.round(progress.interval * 1.2));
          newEF = clampEF(progress.easeFactor - 0.15);
          newRepetition = progress.repetition + 1;
          nextReview = addDays(currentTime, newInterval).toISOString();
        }
        break;
      }

      case GOOD: {
        if (isLearning) {
          // Advance step
          newStep = progress.step + 1;
          if (newStep >= LEARNING_STEPS.length) {
            // Graduate: step = length (graduated), interval = 1 day
            newInterval = GRADUATION_INTERVAL;
            newRepetition = 1;
            nextReview = addDays(currentTime, GRADUATION_INTERVAL).toISOString();
          } else {
            // Next learning step
            nextReview = addMinutes(currentTime, LEARNING_STEPS[newStep]).toISOString();
          }
        } else {
          // Graduated: interval * EF
          newInterval = Math.max(1, Math.round(progress.interval * progress.easeFactor));
          newRepetition = progress.repetition + 1;
          nextReview = addDays(currentTime, newInterval).toISOString();
          // EF recovery: if EF < 2.5, nudge up
          if (progress.easeFactor < 2.5) {
            newEF = clampEF(progress.easeFactor + 0.05);
          }
        }
        break;
      }

      case EASY: {
        if (isLearning) {
          // Graduate immediately
          newStep = LEARNING_STEPS.length;
          newInterval = GRADUATION_INTERVAL;
          newRepetition = 1;
          newEF = clampEF(progress.easeFactor + 0.15);
          nextReview = addDays(currentTime, GRADUATION_INTERVAL).toISOString();
        } else {
          // Graduated: interval * EF * 1.3
          newInterval = Math.max(1, Math.round(progress.interval * progress.easeFactor * 1.3));
          newRepetition = progress.repetition + 1;
          newEF = clampEF(progress.easeFactor + 0.15);
          nextReview = addDays(currentTime, newInterval).toISOString();
        }
        break;
      }

      default:
        throw new Error(`Invalid rating: ${rating}. Must be 1-4.`);
    }

    return {
      ...progress,
      step: newStep,
      interval: newInterval,
      repetition: newRepetition,
      easeFactor: newEF,
      lapses: newLapses,
      nextReview,
      lastRating: rating,
      totalReviews: progress.totalReviews + 1,
    };
  },

  /**
   * Get cards that are due for review.
   * @param {Object} allProgress - Map of cardId -> progress
   * @param {string[]} cardIds - All available card IDs
   * @param {Date|string} [now] - Current time
   * @returns {Object[]} Due card progress objects, sorted most overdue first
   */
  getDueCards(allProgress, cardIds, now) {
    const currentTime = toDate(now);

    return cardIds
      .filter((id) => {
        const prog = allProgress[id];
        return prog && this.isCardDue(prog, currentTime);
      })
      .map((id) => allProgress[id])
      .sort((a, b) => {
        // Most overdue first (earliest nextReview)
        return new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
      });
  },

  /**
   * Get cards with no progress (new/unseen cards).
   * @param {Object} allProgress - Map of cardId -> progress
   * @param {string[]} cardIds - All available card IDs
   * @param {number} limit - Max new cards to return
   * @returns {string[]} Card IDs with no progress entry
   */
  getNewCards(allProgress, cardIds, limit) {
    const newCards = [];
    for (const id of cardIds) {
      if (!allProgress[id]) {
        newCards.push(id);
        if (newCards.length >= limit) break;
      }
    }
    return newCards;
  },

  /**
   * Build a study queue: due reviews first, then new cards up to limit.
   * @param {Object} allProgress - Map of cardId -> progress
   * @param {string[]} cardIds - All available card IDs
   * @param {Object} [options]
   * @param {number} [options.newLimit=10] - Max new cards to add
   * @param {Date|string} [options.now] - Current time
   * @returns {{ due: Object[], newCards: string[], queue: string[] }}
   */
  buildStudyQueue(allProgress, cardIds, options = {}) {
    const { newLimit = 10, now } = options;
    const currentTime = toDate(now);

    const due = this.getDueCards(allProgress, cardIds, currentTime);
    const newCards = this.getNewCards(allProgress, cardIds, newLimit);

    // Queue: due card IDs first, then new card IDs
    const queue = [...due.map((p) => p.cardId), ...newCards];

    return { due, newCards, queue };
  },

  /**
   * Check if a card should be re-shown after an Again rating.
   * Capped at MAX_AGAIN_RESHOWS (3) per session.
   * @param {string} cardId
   * @param {Object} againCounts - Map of cardId -> again count this session
   * @returns {boolean}
   */
  shouldReshow(cardId, againCounts) {
    const count = againCounts[cardId] || 0;
    return count < MAX_AGAIN_RESHOWS;
  },

  /**
   * Get the interleaving distance for re-showing an Again card.
   * More distance for repeated agains.
   * @param {number} againCount - How many times this card was Again'd this session
   * @returns {number} Number of cards to interleave before re-showing
   */
  getInterleavingDistance(againCount) {
    if (againCount <= 1) return 2;
    if (againCount === 2) return 3;
    return 5;
  },

  /**
   * Check if a card is considered mastered.
   *
   * Strict but sprint-compatible definition:
   * - Graduated from learning steps (survived 1min → 10min → graduate cycle)
   * - Interval >= 1 day (graduated to review stage)
   * - Last rating was Good (3) or Easy (4) (no recent lapse)
   * - At least 3 total reviews (proved recall multiple times)
   * - 2 or fewer total lapses (stable retention, not a leech)
   *
   * Combined with 95% thresholds, this means near-perfect recall across
   * the full learning pipeline before advancing. Achievable in a single
   * focused day of study.
   *
   * @param {Object} progress
   * @returns {boolean}
   */
  isCardMastered(progress) {
    if (!progress) return false;
    return (
      progress.step >= LEARNING_STEPS.length &&
      progress.interval >= 1 &&
      progress.totalReviews >= 3 &&
      progress.lastRating >= GOOD &&
      (progress.lapses || 0) <= 2
    );
  },

  /**
   * Check if a card is due for review.
   * Due = nextReview is not null AND nextReview <= now
   * @param {Object} progress
   * @param {Date|string} [now] - Current time
   * @returns {boolean}
   */
  isCardDue(progress, now) {
    if (!progress || !progress.nextReview) return false;
    const currentTime = toDate(now);
    const reviewTime = new Date(progress.nextReview);
    return isBefore(reviewTime, currentTime) || isEqual(reviewTime, currentTime);
  },
};

export {
  SrsService,
  AGAIN,
  HARD,
  GOOD,
  EASY,
  LEARNING_STEPS,
  EF_FLOOR,
  MAX_AGAIN_RESHOWS,
};
