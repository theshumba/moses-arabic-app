import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProgressState } from '../contexts/ProgressContext.jsx';
import { DECKS, getCardsByDeck } from '../data/index.js';
import { DeckService } from '../services/DeckService.js';
import { StatsService } from '../services/StatsService.js';

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remainMins = mins % 60;
  return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`;
}

export default function DashboardPage() {
  const { cardProgress } = useProgressState();

  const allCardsByDeck = useMemo(() => {
    const map = {};
    for (const deck of DECKS) {
      map[deck.id] = getCardsByDeck(deck.id).map((c) => c.id);
    }
    return map;
  }, []);

  // Find the first unlocked deck that has due or new cards
  const nextDeck = useMemo(() => {
    for (const deck of DECKS) {
      const unlocked = DeckService.isDeckUnlocked(deck.id, cardProgress, allCardsByDeck);
      if (!unlocked) continue;

      const deckCardIds = allCardsByDeck[deck.id] || [];
      const stats = DeckService.getDeckStats(deck.id, cardProgress, deckCardIds);
      if (stats.due > 0 || stats.new > 0) {
        return { deck, stats };
      }
    }
    return null;
  }, [cardProgress, allCardsByDeck]);

  // Card stats across all decks
  const cardTotals = useMemo(() => {
    let totalCards = 0;
    let totalSeen = 0;
    let totalDue = 0;
    let totalMastered = 0;

    for (const deck of DECKS) {
      const deckCardIds = allCardsByDeck[deck.id] || [];
      const stats = DeckService.getDeckStats(deck.id, cardProgress, deckCardIds);
      totalCards += stats.total;
      totalSeen += stats.seen;
      totalDue += stats.due;
      totalMastered += stats.mastered;
    }

    return { totalCards, totalSeen, totalDue, totalMastered };
  }, [cardProgress, allCardsByDeck]);

  // Session and time stats
  const todayStats = useMemo(() => StatsService.getTodayStats(), [cardProgress]);
  const allTimeStats = useMemo(() => StatsService.getAllTimeStats(), [cardProgress]);
  const streak = useMemo(() => StatsService.getStreak(), [cardProgress]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Start studying CTA */}
      {nextDeck ? (
        <div className="rounded-xl border border-border bg-surface p-6 text-center mb-8">
          <div className="text-text-muted text-sm mb-1">Continue with</div>
          <div className="text-xl font-bold mb-2">{nextDeck.deck.name}</div>
          <div className="text-text-dim text-sm mb-4">
            {nextDeck.stats.due > 0
              ? `${nextDeck.stats.due} cards due for review`
              : `${nextDeck.stats.new} new cards to learn`}
          </div>
          <Link
            to={`/study/${nextDeck.deck.id}`}
            className="inline-block px-8 py-3 rounded-xl font-medium bg-accent text-white hover:bg-accent/80 transition-colors text-lg"
          >
            Start Studying
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-6 text-center mb-8">
          <div className="text-xl font-bold mb-2">All caught up!</div>
          <div className="text-text-dim text-sm mb-4">No cards due right now. Check back later.</div>
          <Link
            to="/decks"
            className="inline-block px-6 py-3 rounded-xl font-medium bg-surface-2 text-text-muted border border-border hover:bg-surface transition-colors"
          >
            Browse Decks
          </Link>
        </div>
      )}

      {/* Today's stats */}
      <div className="mb-6">
        <h2 className="text-sm uppercase tracking-wide text-text-muted mb-3">Today</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Time Studied" value={formatTime(todayStats.totalTime)} />
          <StatCard label="Cards Reviewed" value={todayStats.cardsReviewed} />
          <StatCard label="Sessions" value={todayStats.sessions} />
          <StatCard label="Accuracy" value={todayStats.accuracy > 0 ? `${todayStats.accuracy}%` : '—'} />
        </div>
      </div>

      {/* All-time stats */}
      <div className="mb-6">
        <h2 className="text-sm uppercase tracking-wide text-text-muted mb-3">All Time</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Time" value={formatTime(allTimeStats.totalTime)} />
          <StatCard label="Cards Reviewed" value={allTimeStats.totalCards} />
          <StatCard label="Streak" value={`${streak.current} day${streak.current !== 1 ? 's' : ''}`} />
          <StatCard label="Avg Accuracy" value={allTimeStats.averageAccuracy > 0 ? `${allTimeStats.averageAccuracy}%` : '—'} />
        </div>
      </div>

      {/* Card progress */}
      <div className="mb-6">
        <h2 className="text-sm uppercase tracking-wide text-text-muted mb-3">Progress</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total Cards" value={cardTotals.totalCards} />
          <StatCard label="Seen" value={cardTotals.totalSeen} />
          <StatCard label="Due" value={cardTotals.totalDue} highlight={cardTotals.totalDue > 0} />
          <StatCard label="Mastered" value={cardTotals.totalMastered} color="text-good" />
        </div>
      </div>

      {/* Browse decks link */}
      <div className="text-center">
        <Link to="/decks" className="text-accent text-sm hover:underline">
          View all decks →
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight = false, color = '' }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3 text-center">
      <div className={`text-2xl font-bold ${highlight ? 'text-accent' : color || ''}`}>{value}</div>
      <div className="text-text-dim text-xs mt-0.5">{label}</div>
    </div>
  );
}
