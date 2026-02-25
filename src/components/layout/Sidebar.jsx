import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useProgressState } from '../../contexts/ProgressContext.jsx';
import { DECKS, STAGES, getCardsByDeck } from '../../data/index.js';
import { DeckService } from '../../services/DeckService.js';

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

const baseClasses = 'block px-4 py-2 rounded-r text-sm transition-colors';
const activeClasses = `${baseClasses} bg-surface-2 text-text border-l-2 border-accent`;
const inactiveClasses = `${baseClasses} text-text-muted hover:text-text hover:bg-surface`;

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/study', label: 'Study', end: false },
  { to: '/decks', label: 'Decks', end: false },
  { to: '/settings', label: 'Settings', end: false },
];

export default function Sidebar() {
  const { cardProgress } = useProgressState();

  // Static data — compute card ID arrays once
  const allCardsByDeck = useMemo(() => {
    const map = {};
    for (const deck of DECKS) {
      map[deck.id] = getCardsByDeck(deck.id).map((c) => c.id);
    }
    return map;
  }, []);

  // Group decks by stage
  const decksByStage = useMemo(() => {
    const grouped = {};
    for (const stage of STAGES) {
      grouped[stage.id] = DECKS.filter((d) => d.stage === stage.id);
    }
    return grouped;
  }, []);

  return (
    <aside className="w-sidebar shrink-0 bg-surface border-r border-border flex flex-col overflow-y-auto">
      {/* App title */}
      <div className="px-4 pt-5 pb-3">
        <div className="text-lg font-bold">Moses Arabic</div>
        <div className="text-text-dim text-xs">7-Day Sprint</div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 px-1">
        {NAV_ITEMS.map(({ to, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <hr className="border-border my-4" />

      {/* Deck progress by stage */}
      <div className="px-4 pb-4 flex flex-col gap-3">
        {STAGES.map((stage) => {
          const stageDecks = decksByStage[stage.id] || [];
          const stageColorClass = STAGE_COLOR_MAP[stage.id];
          const barColorClass = STAGE_BAR_COLOR_MAP[stage.id];

          return (
            <div key={stage.id}>
              <div className={`text-xs uppercase tracking-wide mb-1 ${stageColorClass}`}>
                {stage.name}
              </div>
              <div className="flex flex-col gap-1.5">
                {stageDecks.map((deck) => {
                  const deckCardIds = allCardsByDeck[deck.id] || [];
                  const stats = DeckService.getDeckStats(deck.id, cardProgress, deckCardIds);
                  const unlocked = DeckService.isDeckUnlocked(deck.id, cardProgress, allCardsByDeck);

                  return unlocked ? (
                    <NavLink
                      key={deck.id}
                      to={`/study/${deck.id}`}
                      className="block rounded px-1 py-0.5 -mx-1 hover:bg-surface-2 transition-colors"
                    >
                      <div className="text-xs text-text-muted truncate">{deck.name}</div>
                      <div className="h-1 rounded-full bg-surface-2 mt-0.5">
                        <div
                          className={`h-1 rounded-full ${barColorClass}`}
                          style={{ width: `${stats.masteryPercent}%` }}
                        />
                      </div>
                    </NavLink>
                  ) : (
                    <div key={deck.id} className="opacity-40">
                      <div className="text-xs text-text-muted truncate">{deck.name}</div>
                      <div className="h-1 rounded-full bg-surface-2 mt-0.5" />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
