/**
 * useStudySession — Session state machine that drives the entire study flow.
 *
 * Encapsulates:
 * - Building the study queue from SrsService (due reviews + new cards)
 * - Tracking the current card and flip state
 * - Processing ratings through ProgressContext
 * - Handling Again re-shows with interleaving (capped at 3)
 * - Tracking session stats (ratings breakdown, cards completed)
 * - Producing a session-complete summary via StatsService
 *
 * Consumed by StudyPage.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { getCardsByDeck, getCardById } from '../data/index.js';
import { SrsService, AGAIN } from '../services/SrsService.js';
import { StatsService } from '../services/StatsService.js';
import { useProgressState, useProgressDispatch } from '../contexts/ProgressContext.jsx';
import { useSettingsState } from '../contexts/SettingsContext.jsx';

/**
 * Rating number to name mapping for ratingsBreakdown keys.
 */
const RATING_NAMES = {
  1: 'again',
  2: 'hard',
  3: 'good',
  4: 'easy',
};

/**
 * Custom hook that manages a complete study session for a given deck.
 *
 * @param {string} deckId - The deck to study, from route params
 * @returns {{
 *   currentCard: object|null,
 *   isFlipped: boolean,
 *   isComplete: boolean,
 *   cardsCompleted: number,
 *   totalCards: number,
 *   flip: () => void,
 *   rate: (rating: 1|2|3|4) => void,
 *   sessionResult: { cardsReviewed: number, accuracy: number, duration: number, ratingsBreakdown: object }|null
 * }}
 */
export function useStudySession(deckId) {
  // --- Reactive state (triggers re-renders) ---
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [cardsCompleted, setCardsCompleted] = useState(0);
  const [sessionResult, setSessionResult] = useState(null);

  // --- Mutable refs (no re-renders needed) ---
  const queueRef = useRef([]);
  const againCountsRef = useRef({});
  const ratingsBreakdownRef = useRef({ again: 0, hard: 0, good: 0, easy: 0 });
  const cardsCompletedRef = useRef(0);
  const sessionStartedRef = useRef(false);
  const sessionEndedRef = useRef(false);

  // --- Context access ---
  const { cardProgress } = useProgressState();
  const dispatch = useProgressDispatch();
  const { settings } = useSettingsState();

  // --- Stable ref to cardProgress for use in rate() without stale closures ---
  const cardProgressRef = useRef(cardProgress);
  cardProgressRef.current = cardProgress;

  // --- Initialization (build queue on mount) ---
  useEffect(() => {
    const deckCardIds = getCardsByDeck(deckId).map((c) => c.id);
    const { queue } = SrsService.buildStudyQueue(cardProgress, deckCardIds, {
      newLimit: settings.newCardsPerSession,
    });

    queueRef.current = queue;

    // Start session tracking (guarded against double-call in StrictMode)
    if (!sessionStartedRef.current) {
      StatsService.startSession();
      sessionStartedRef.current = true;
    }

    // If no cards to study, complete immediately
    if (queue.length === 0) {
      setIsComplete(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  // --- Cleanup: end session on unmount if not already ended ---
  useEffect(() => {
    return () => {
      if (sessionStartedRef.current && !sessionEndedRef.current) {
        sessionEndedRef.current = true;
        const result = StatsService.endSession(
          cardsCompletedRef.current,
          ratingsBreakdownRef.current
        );
        if (!result) {
          console.warn('StatsService.endSession returned null during cleanup');
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Derive current card from queue and index ---
  const queue = queueRef.current;
  const currentCard = !isComplete && queue.length > 0
    ? getCardById(queue[currentIndex]) || null
    : null;

  // --- Actions ---

  /**
   * Flip the card to show the back.
   * No-op if already flipped or session is complete.
   */
  const flip = useCallback(() => {
    if (isFlipped || isComplete) return;
    setIsFlipped(true);
  }, [isFlipped, isComplete]);

  /**
   * Process a rating for the current card and advance the queue.
   *
   * Steps:
   * 1. Get current card progress (or create fresh)
   * 2. Compute new progress via SrsService.reviewCard
   * 3. Dispatch REVIEW_CARD to ProgressContext
   * 4. Track rating in breakdown
   * 5. Handle Again re-show with interleaving
   * 6. Advance to next card
   * 7. Check for session completion
   *
   * @param {1|2|3|4} rating
   */
  const rate = useCallback((rating) => {
    if (isComplete) return;

    const cardId = queueRef.current[currentIndex];
    if (!cardId) return;

    // 1. Get current progress or create new
    const progress = cardProgressRef.current[cardId] || SrsService.createCardProgress(cardId);

    // 2. Compute new progress
    const newProgress = SrsService.reviewCard(progress, rating);

    // 3. Dispatch to ProgressContext
    dispatch({ type: 'REVIEW_CARD', payload: { cardId, progress: newProgress } });

    // 4. Track rating
    const ratingName = RATING_NAMES[rating];
    ratingsBreakdownRef.current[ratingName]++;

    // 5. Increment cards completed
    setCardsCompleted((prev) => prev + 1);
    cardsCompletedRef.current += 1;

    // 6. Handle Again re-show
    if (rating === AGAIN) {
      if (!againCountsRef.current[cardId]) {
        againCountsRef.current[cardId] = 0;
      }
      againCountsRef.current[cardId]++;

      if (SrsService.shouldReshow(cardId, againCountsRef.current)) {
        const distance = SrsService.getInterleavingDistance(againCountsRef.current[cardId]);
        const insertAt = Math.min(currentIndex + 1 + distance, queueRef.current.length);
        queueRef.current.splice(insertAt, 0, cardId);
      }
    }

    // 7. Advance to next card
    const nextIndex = currentIndex + 1;

    // 8. Reset flip state
    setIsFlipped(false);

    // 9. Check completion
    if (nextIndex >= queueRef.current.length) {
      sessionEndedRef.current = true;
      const result = StatsService.endSession(
        cardsCompleted + 1, // +1 because setState hasn't flushed yet
        ratingsBreakdownRef.current
      );
      if (!result) {
        console.warn('StatsService.endSession returned null');
      }

      setSessionResult({
        cardsReviewed: cardsCompleted + 1,
        accuracy: result ? result.accuracy : 0,
        duration: result ? result.duration : 0,
        ratingsBreakdown: { ...ratingsBreakdownRef.current },
      });
      setIsComplete(true);
    }

    setCurrentIndex(nextIndex);
  }, [currentIndex, isComplete, dispatch, cardsCompleted]);

  // Derived from queue ref — always reflects current queue length (including Again re-shows)
  const totalCards = queueRef.current.length;

  return {
    // Current state
    currentCard,
    isFlipped,
    isComplete,
    // Progress
    cardsCompleted,
    totalCards,
    // Actions
    flip,
    rate,
    // Session result (only meaningful when isComplete)
    sessionResult,
  };
}
