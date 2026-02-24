import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useMemo } from 'react';
import { useStudySession } from '../hooks/useStudySession.js';
import FlashCard from '../components/study/FlashCard.jsx';
import RatingButtons from '../components/study/RatingButtons.jsx';
import SessionComplete from '../components/study/SessionComplete.jsx';
import { DeckService } from '../services/DeckService.js';
import { DECKS, getCardsByDeck } from '../data/index.js';
import { useProgressState } from '../contexts/ProgressContext.jsx';

export default function StudyPage() {
  const { deckId } = useParams();
  const navigate = useNavigate();

  // Find the deck definition
  const deck = DECKS.find((d) => d.id === deckId);

  // Progress context for unlock checks
  const { cardProgress } = useProgressState();

  // Build allCardsByDeck map (static data, compute once)
  const allCardsByDeck = useMemo(() => {
    const map = {};
    for (const d of DECKS) {
      map[d.id] = getCardsByDeck(d.id).map((c) => c.id);
    }
    return map;
  }, []);

  // Check if deck is unlocked
  const isUnlocked = deck
    ? DeckService.isDeckUnlocked(deckId, cardProgress, allCardsByDeck)
    : false;

  // --- No deck or invalid deckId ---
  if (!deckId || !deck) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Select a Deck</h1>
        <p className="text-text-muted mb-6">
          Choose a deck to start studying.
        </p>
        <Link
          to="/decks"
          className="px-6 py-3 rounded-xl font-medium bg-accent text-white hover:bg-accent/80 transition-colors"
        >
          Browse Decks
        </Link>
      </div>
    );
  }

  // --- Deck is locked ---
  if (!isUnlocked) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Deck Locked</h1>
        <p className="text-text-muted mb-2">{deck.name}</p>
        <p className="text-text-dim mb-6">
          {DeckService.getUnlockRequirement(deckId)}
        </p>
        <Link
          to="/decks"
          className="px-6 py-3 rounded-xl font-medium bg-surface-2 text-text-muted border border-border hover:bg-surface transition-colors"
        >
          Back to Decks
        </Link>
      </div>
    );
  }

  // --- Deck is valid and unlocked: render study flow ---
  return <StudyFlow deck={deck} deckId={deckId} navigate={navigate} />;
}

/**
 * Inner component that mounts the study session hook.
 * Separated so useStudySession only runs when deck is valid + unlocked.
 */
function StudyFlow({ deck, deckId, navigate }) {
  const {
    currentCard,
    isFlipped,
    isComplete,
    cardsCompleted,
    totalCards,
    flip,
    rate,
    sessionResult,
  } = useStudySession(deckId);

  // --- Keyboard shortcuts ---
  useEffect(() => {
    function handleKeyDown(e) {
      // Guard: don't fire shortcuts when focused on form fields
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case ' ':
          if (!isFlipped && !isComplete) {
            e.preventDefault();
            flip();
          }
          break;
        case '1':
          if (isFlipped && !isComplete) rate(1);
          break;
        case '2':
          if (isFlipped && !isComplete) rate(2);
          break;
        case '3':
          if (isFlipped && !isComplete) rate(3);
          break;
        case '4':
          if (isFlipped && !isComplete) rate(4);
          break;
        case 'Escape':
          navigate('/decks');
          break;
        default:
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFlipped, isComplete, flip, rate, navigate]);

  // --- Empty queue (complete immediately, no session result) ---
  if (isComplete && !sessionResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">No Cards Due</h1>
        <p className="text-text-muted mb-6">
          All caught up! Come back later for reviews, or try another deck.
        </p>
        <Link
          to="/decks"
          className="px-6 py-3 rounded-xl font-medium bg-accent text-white hover:bg-accent/80 transition-colors"
        >
          Browse Decks
        </Link>
      </div>
    );
  }

  // --- Session complete with results ---
  if (isComplete && sessionResult) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <SessionComplete
          sessionResult={sessionResult}
          deckId={deckId}
          deckName={deck.name}
        />
      </div>
    );
  }

  // --- Active study ---
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header: deck name + progress count */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-muted text-sm">{deck.name}</span>
        <span className="text-text-dim text-sm">
          {cardsCompleted + 1} / {totalCards}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-surface-2 mb-6">
        <div
          className="h-1 rounded-full bg-accent transition-all duration-300"
          style={{
            width: `${totalCards > 0 ? (cardsCompleted / totalCards) * 100 : 0}%`,
          }}
        />
      </div>

      {/* Flashcard */}
      <FlashCard card={currentCard} isFlipped={isFlipped} onFlip={flip} />

      {/* Rating buttons or flip hint */}
      {isFlipped ? (
        <div className="mt-6">
          <RatingButtons onRate={rate} disabled={false} />
        </div>
      ) : (
        <p className="text-text-dim text-xs text-center mt-6">
          Press Space or tap the card
        </p>
      )}
    </div>
  );
}
