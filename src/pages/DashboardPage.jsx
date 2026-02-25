import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProgressState } from '../contexts/ProgressContext.jsx';
import { DECKS, getCardsByDeck } from '../data/index.js';
import { DeckService } from '../services/DeckService.js';
import { SrsService } from '../services/SrsService.js';
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

function estimateSessions(deckCardIds, cardProgress, avgCardsPerSession) {
  let totalRemainingReviews = 0;

  for (const cardId of deckCardIds) {
    const progress = cardProgress[cardId];

    if (!progress) {
      totalRemainingReviews += 4;
      continue;
    }

    if (SrsService.isCardMastered(progress)) {
      continue;
    }

    const step = progress.step || 0;
    const totalReviews = progress.totalReviews || 0;
    const lapses = progress.lapses || 0;
    const lastRating = progress.lastRating || 0;

    let remaining = 0;

    if (step < 2) {
      remaining += (2 - step);
      remaining += 1;
    }

    if (totalReviews < 3) {
      remaining = Math.max(remaining, 3 - totalReviews);
    }

    if (lastRating < 3) {
      remaining = Math.max(remaining, 1);
    }

    if (lapses > 2) {
      remaining = Math.max(remaining, 2);
    }

    totalRemainingReviews += Math.max(remaining, 1);
  }

  if (totalRemainingReviews === 0) return 0;
  return Math.ceil(totalRemainingReviews / avgCardsPerSession);
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

  const masteryForecast = useMemo(() => {
    const stage1Decks = DECKS.filter((d) => d.stage === 1);

    const sessions = StatsService.getSessionHistory(100);
    const avgCardsPerSession = sessions.length > 0
      ? Math.max(1, Math.round(sessions.reduce((sum, s) => sum + (s.cardsReviewed || 0), 0) / sessions.length))
      : 20;

    return stage1Decks.map((deck) => {
      const deckCardIds = allCardsByDeck[deck.id] || [];
      const unlocked = DeckService.isDeckUnlocked(deck.id, cardProgress, allCardsByDeck);
      const stats = DeckService.getDeckStats(deck.id, cardProgress, deckCardIds);
      const sessionsRemaining = estimateSessions(deckCardIds, cardProgress, avgCardsPerSession);

      return {
        deck,
        unlocked,
        total: stats.total,
        mastered: stats.mastered,
        masteryPercent: stats.masteryPercent,
        sessionsRemaining,
      };
    });
  }, [cardProgress, allCardsByDeck]);

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

      {/* Mastery Forecast */}
      <div className="mb-6">
        <h2 className="text-sm uppercase tracking-wide text-text-muted mb-3">Mastery Forecast</h2>
        <div className="space-y-3">
          {masteryForecast.map(({ deck, unlocked, total, mastered, masteryPercent, sessionsRemaining }) => (
            <div key={deck.id} className={`rounded-lg border border-border bg-surface p-4 ${!unlocked ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{deck.name}</span>
                <span className="text-xs text-text-dim">
                  {masteryPercent === 100
                    ? 'Mastered!'
                    : unlocked
                      ? `~${sessionsRemaining} session${sessionsRemaining !== 1 ? 's' : ''} left`
                      : 'Locked'}
                </span>
              </div>
              <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${masteryPercent}%`,
                    backgroundColor: masteryPercent === 100 ? 'var(--color-good)' : 'var(--color-accent)',
                  }}
                />
              </div>
              <div className="text-xs text-text-dim mt-1">
                {mastered}/{total} cards mastered ({masteryPercent}%)
              </div>
            </div>
          ))}
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
