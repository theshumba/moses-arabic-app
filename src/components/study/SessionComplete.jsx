import { Link } from 'react-router-dom';

function formatDuration(seconds) {
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

const BREAKDOWN_SEGMENTS = [
  { key: 'again', colorClass: 'bg-again' },
  { key: 'hard', colorClass: 'bg-hard' },
  { key: 'good', colorClass: 'bg-good' },
  { key: 'easy', colorClass: 'bg-easy' },
];

export default function SessionComplete({ sessionResult, deckId, deckName }) {
  const { cardsReviewed, accuracy, duration, ratingsBreakdown = {} } =
    sessionResult || {};

  const goodEasy =
    (ratingsBreakdown.good || 0) + (ratingsBreakdown.easy || 0);

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <h2 className="text-2xl font-bold mb-2">Session Complete!</h2>
      {deckName && (
        <p className="text-text-muted text-sm mb-8">{deckName}</p>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div>
          <div className="text-3xl font-bold text-text">{cardsReviewed}</div>
          <div className="text-text-muted text-sm mt-1">Cards Reviewed</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-text">{accuracy}%</div>
          <div className="text-text-muted text-sm mt-1">Accuracy</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-text">
            {formatDuration(duration)}
          </div>
          <div className="text-text-muted text-sm mt-1">Time</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-text">{goodEasy}</div>
          <div className="text-text-muted text-sm mt-1">Good + Easy</div>
        </div>
      </div>

      {/* Ratings Breakdown Bar */}
      {cardsReviewed > 0 && (
        <div className="mb-10">
          <div className="flex h-3 rounded-full overflow-hidden">
            {BREAKDOWN_SEGMENTS.map(({ key, colorClass }) => {
              const count = ratingsBreakdown[key] || 0;
              if (count === 0) return null;
              const pct = (count / cardsReviewed) * 100;
              return (
                <div
                  key={key}
                  className={`${colorClass}`}
                  style={{ width: `${pct}%` }}
                  title={`${key}: ${count}`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-text-dim mt-2">
            {BREAKDOWN_SEGMENTS.map(({ key }) => {
              const count = ratingsBreakdown[key] || 0;
              if (count === 0) return null;
              return (
                <span key={key} className="capitalize">
                  {key}: {count}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-4 justify-center">
        <Link
          to={`/study/${deckId}`}
          className="px-6 py-3 rounded-xl font-medium bg-accent text-white hover:bg-accent/80 transition-colors"
        >
          Study Again
        </Link>
        <Link
          to="/"
          className="px-6 py-3 rounded-xl font-medium bg-surface-2 text-text-muted border border-border hover:bg-surface transition-colors"
        >
          Dashboard
        </Link>
      </div>
    </div>
  );
}
