/**
 * StatsService — Session time tracking, streak calculation, and study statistics.
 *
 * Features:
 * - Session start/end with duration tracking
 * - Study streak calculation (consecutive days)
 * - Today's stats aggregation
 * - All-time stats computation
 * - Session history (capped at 100 sessions)
 *
 * Uses StorageService for persistence. Session start time is ephemeral (module variable).
 */

import { startOfDay, differenceInCalendarDays } from 'date-fns';
import { StorageService } from './StorageService.js';
import { FirebaseService } from './FirebaseService.js';

/** Storage keys */
const SESSIONS_KEY = 'sessions';
const STREAK_KEY = 'streak';

/** Maximum stored sessions (FIFO eviction) */
const MAX_SESSIONS = 100;

/** Ephemeral session start time (not persisted) */
let sessionStartTime = null;

const StatsService = {
  /**
   * Start a new study session. Records start time in module variable (ephemeral).
   * Call endSession() when done.
   */
  startSession() {
    sessionStartTime = new Date();
  },

  /**
   * End the current session and persist the record.
   *
   * Creates a session record with duration, cards reviewed, ratings breakdown, and accuracy.
   * Appends to sessions array (capped at MAX_SESSIONS).
   * Updates streak data.
   *
   * @param {number} cardsReviewed - Number of cards reviewed this session
   * @param {{ again?: number, hard?: number, good?: number, easy?: number }} ratingsBreakdown - Ratings given
   * @returns {{ duration: number, accuracy: number } | null} Session summary, or null if no session started
   */
  endSession(cardsReviewed = 0, ratingsBreakdown = {}) {
    if (!sessionStartTime) {
      console.warn('[StatsService] No active session to end');
      return null;
    }

    const endTime = new Date();
    const duration = Math.round((endTime.getTime() - sessionStartTime.getTime()) / 1000);

    // Calculate accuracy: % of good + easy ratings
    const totalRatings = (ratingsBreakdown.again || 0) +
      (ratingsBreakdown.hard || 0) +
      (ratingsBreakdown.good || 0) +
      (ratingsBreakdown.easy || 0);

    const goodPlusCount = (ratingsBreakdown.good || 0) + (ratingsBreakdown.easy || 0);
    const accuracy = totalRatings > 0 ? Math.round((goodPlusCount / totalRatings) * 100) : 0;

    const session = {
      date: endTime.toISOString(),
      duration,
      cardsReviewed,
      ratings: { ...ratingsBreakdown },
      accuracy,
    };

    // Append to sessions, cap at MAX_SESSIONS
    const sessions = StorageService.get(SESSIONS_KEY) || [];
    sessions.push(session);
    if (sessions.length > MAX_SESSIONS) {
      sessions.splice(0, sessions.length - MAX_SESSIONS);
    }
    StorageService.setImmediate(SESSIONS_KEY, sessions);

    // Update streak
    this._updateStreak(endTime);

    // Sync to Firestore
    FirebaseService.write('stats', {
      sessions: StorageService.get(SESSIONS_KEY),
      streak: StorageService.get(STREAK_KEY),
    });

    // Clear ephemeral start time
    sessionStartTime = null;

    return { duration, accuracy };
  },

  /**
   * Get today's aggregated stats.
   *
   * @returns {{ totalTime: number, cardsReviewed: number, sessions: number, accuracy: number }}
   */
  getTodayStats() {
    const sessions = StorageService.get(SESSIONS_KEY) || [];
    const todayStart = startOfDay(new Date()).getTime();

    let totalTime = 0;
    let cardsReviewed = 0;
    let sessionCount = 0;
    let totalAccuracy = 0;

    for (const session of sessions) {
      const sessionDate = new Date(session.date).getTime();
      if (sessionDate >= todayStart) {
        totalTime += session.duration || 0;
        cardsReviewed += session.cardsReviewed || 0;
        sessionCount++;
        totalAccuracy += session.accuracy || 0;
      }
    }

    return {
      totalTime,
      cardsReviewed,
      sessions: sessionCount,
      accuracy: sessionCount > 0 ? Math.round(totalAccuracy / sessionCount) : 0,
    };
  },

  /**
   * Get current study streak.
   *
   * Streak logic:
   * - If last study was today: current streak
   * - If last study was yesterday: current streak (maintains)
   * - If older: reset to 0
   *
   * @returns {{ current: number, lastStudyDate: string | null }}
   */
  getStreak() {
    const streak = StorageService.get(STREAK_KEY);
    if (!streak || !streak.lastStudyDate) {
      return { current: 0, lastStudyDate: null };
    }

    const today = startOfDay(new Date());
    const lastStudy = startOfDay(new Date(streak.lastStudyDate));
    const daysDiff = differenceInCalendarDays(today, lastStudy);

    if (daysDiff <= 1) {
      // Today or yesterday — streak is current
      return { current: streak.current, lastStudyDate: streak.lastStudyDate };
    }

    // Older than yesterday — streak broken
    return { current: 0, lastStudyDate: streak.lastStudyDate };
  },

  /**
   * Get all-time aggregate stats.
   *
   * @returns {{ totalSessions: number, totalCards: number, totalTime: number, averageAccuracy: number, averageCardsPerDay: number, startDate: string | null }}
   */
  getAllTimeStats() {
    const sessions = StorageService.get(SESSIONS_KEY) || [];

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalCards: 0,
        totalTime: 0,
        averageAccuracy: 0,
        averageCardsPerDay: 0,
        startDate: null,
      };
    }

    let totalCards = 0;
    let totalTime = 0;
    let totalAccuracy = 0;

    for (const session of sessions) {
      totalCards += session.cardsReviewed || 0;
      totalTime += session.duration || 0;
      totalAccuracy += session.accuracy || 0;
    }

    const startDate = sessions[0].date;
    const firstDay = startOfDay(new Date(startDate));
    const today = startOfDay(new Date());
    const totalDays = Math.max(1, differenceInCalendarDays(today, firstDay) + 1);

    return {
      totalSessions: sessions.length,
      totalCards,
      totalTime,
      averageAccuracy: Math.round(totalAccuracy / sessions.length),
      averageCardsPerDay: Math.round(totalCards / totalDays),
      startDate,
    };
  },

  /**
   * Get recent session history.
   *
   * @param {number} [limit=10] - Maximum number of sessions to return
   * @returns {Array} Sessions, most recent first
   */
  getSessionHistory(limit = 10) {
    const sessions = StorageService.get(SESSIONS_KEY) || [];
    return sessions.slice(-limit).reverse();
  },

  /**
   * Update streak based on session end time.
   * @param {Date} sessionEndTime
   * @private
   */
  _updateStreak(sessionEndTime) {
    const streak = StorageService.get(STREAK_KEY) || { current: 0, lastStudyDate: null };
    const today = startOfDay(sessionEndTime);

    if (!streak.lastStudyDate) {
      // First ever session
      StorageService.setImmediate(STREAK_KEY, {
        current: 1,
        lastStudyDate: sessionEndTime.toISOString(),
      });
      return;
    }

    const lastStudy = startOfDay(new Date(streak.lastStudyDate));
    const daysDiff = differenceInCalendarDays(today, lastStudy);

    if (daysDiff === 0) {
      // Same day — just update lastStudyDate (streak unchanged)
      StorageService.setImmediate(STREAK_KEY, {
        current: streak.current,
        lastStudyDate: sessionEndTime.toISOString(),
      });
    } else if (daysDiff === 1) {
      // Next day — increment streak
      StorageService.setImmediate(STREAK_KEY, {
        current: streak.current + 1,
        lastStudyDate: sessionEndTime.toISOString(),
      });
    } else {
      // Gap > 1 day — reset streak
      StorageService.setImmediate(STREAK_KEY, {
        current: 1,
        lastStudyDate: sessionEndTime.toISOString(),
      });
    }
  },
};

export { StatsService, SESSIONS_KEY, STREAK_KEY, MAX_SESSIONS };
