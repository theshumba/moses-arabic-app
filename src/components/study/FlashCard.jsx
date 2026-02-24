import ArabicText from '../ui/ArabicText.jsx';

export default function FlashCard({ card, isFlipped, onFlip }) {
  if (!card) return null;

  return (
    <div
      className={`max-w-2xl mx-auto min-h-[24rem] bg-surface rounded-2xl border border-border p-8 flex flex-col items-center justify-center ${
        !isFlipped ? 'cursor-pointer' : ''
      }`}
      onClick={!isFlipped ? onFlip : undefined}
      role={!isFlipped ? 'button' : undefined}
      tabIndex={!isFlipped ? 0 : undefined}
      onKeyDown={
        !isFlipped
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onFlip();
              }
            }
          : undefined
      }
    >
      {!isFlipped ? (
        /* ── Front Face ── */
        <div className="flex flex-col items-center justify-center text-center">
          <ArabicText size="text-6xl" as="div">
            {card.front.primary}
          </ArabicText>

          {card.front.secondary && (
            <div className="text-text-muted text-lg mt-4">
              {card.front.secondary}
            </div>
          )}

          {card.front.hint && (
            <div className="text-text-dim text-sm mt-2">
              {card.front.hint}
            </div>
          )}

          <div className="text-text-dim text-xs mt-8">
            Tap or press Space to flip
          </div>
        </div>
      ) : (
        /* ── Back Face ── */
        <div className="flex flex-col items-center justify-center text-center">
          <ArabicText size="text-4xl" as="div" className="text-text-muted">
            {card.front.primary}
          </ArabicText>

          <hr className="border-border my-4 w-32 mx-auto" />

          <div className="text-2xl font-bold text-text">
            {card.back.primary}
          </div>

          {card.back.secondary && (
            <div className="text-text-muted text-lg mt-2">
              {card.back.secondary}
            </div>
          )}

          {card.back.detail && (
            <div className="text-text-dim text-sm mt-2">
              {card.back.detail}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
