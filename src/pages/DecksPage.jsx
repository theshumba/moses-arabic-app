import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProgressState } from '../contexts/ProgressContext.jsx';
import { DECKS, STAGES, getCardsByDeck } from '../data/index.js';
import { DeckService } from '../services/DeckService.js';

const STAGE_COLOR_MAP = {
  1: 'text-stage-script',
  2: 'text-stage-core',
  3: 'text-stage-grammar',
  4: 'text-stage-vocab',
};

const STAGE_BAR_COLOR_MAP = {
  1: 'bg-stage-script',
  2: 'bg-stage-core',
  3: 'bg-stage-grammar',
  4: 'bg-stage-vocab',
};

export default function DecksPage() {
  const { cardProgress } = useProgressState();

  const allCardsByDeck = useMemo(() => {
    const map = {};
    for (const deck of DECKS) {
      map[deck.id] = getCardsByDeck(deck.id).map((c) => c.id);
    }
    return map;
  }, []);

  const decksByStage = useMemo(() => {
    const grouped = {};
    for (const stage of STAGES) {
      grouped[stage.id] = DECKS.filter((d) => d.stage === stage.id);
    }
    return grouped;
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Decks</h1>

      <div className="flex flex-col gap-8">
        {STAGES.map((stage) => {
          const stageDecks = decksByStage[stage.id] || [];
          const stageColor = STAGE_COLOR_MAP[stage.id];

          return (
            <div key={stage.id}>
              <div className={`text-xs uppercase tracking-wide mb-1 ${stageColor}`}>
                {stage.name}
              </div>
              <p className="text-text-dim text-sm mb-3">{stage.description}</p>

              <div className="flex flex-col gap-3">
                {stageDecks.map((deck) => {
                  const deckCardIds = allCardsByDeck[deck.id] || [];
                  const stats = DeckService.getDeckStats(deck.id, cardProgress, deckCardIds);
                  const unlocked = DeckService.isDeckUnlocked(deck.id, cardProgress, allCardsByDeck);
                  const unlockText = DeckService.getUnlockRequirement(deck.id);
                  const barColor = STAGE_BAR_COLOR_MAP[deck.stage];

                  return (
                    <div
                      key={deck.id}
                      className={`rounded-xl border p-4 ${
                        unlocked
                          ? 'bg-surface border-border'
                          : 'bg-surface/50 border-border/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">{deck.name}</div>
                          <div className="text-text-dim text-sm mt-0.5">{deck.description}</div>

                          {/* Stats row */}
                          <div className="flex gap-4 mt-2 text-xs text-text-muted">
                            <span>{stats.total} cards</span>
                            {stats.seen > 0 && <span>{stats.seen} seen</span>}
                            {stats.due > 0 && <span className="text-accent">{stats.due} due</span>}
                            {stats.mastered > 0 && (
                              <span className="text-good">{stats.mastered} mastered</span>
                            )}
                          </div>

                          {/* Progress bar */}
                          {unlocked && stats.total > 0 && (
                            <div className="h-1.5 rounded-full bg-surface-2 mt-2">
                              <div
                                className={`h-1.5 rounded-full ${barColor} transition-all`}
                                style={{ width: `${stats.masteryPercent}%` }}
                              />
                            </div>
                          )}

                          {/* Lock requirement */}
                          {!unlocked && (
                            <div className="mt-2 text-xs text-text-dim">
                              🔒 {unlockText}
                            </div>
                          )}
                        </div>

                        {/* Study button */}
                        <div className="shrink-0">
                          {unlocked ? (
                            <Link
                              to={`/study/${deck.id}`}
                              className="inline-block px-5 py-2 rounded-lg font-medium text-sm bg-accent text-white hover:bg-accent/80 transition-colors"
                            >
                              {stats.due > 0 ? 'Review' : stats.seen === 0 ? 'Start' : 'Study'}
                            </Link>
                          ) : (
                            <span className="inline-block px-5 py-2 rounded-lg font-medium text-sm bg-surface-2 text-text-dim cursor-not-allowed">
                              Locked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
