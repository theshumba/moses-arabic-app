import { useCallback, useState } from 'react';
import ArabicText from '../ui/ArabicText.jsx';

/**
 * Cache for loaded voices. speechSynthesis.getVoices() is async in most browsers —
 * it returns [] on first call and fires 'voiceschanged' when ready.
 */
let cachedVoices = [];
let voicesLoaded = false;

function loadVoices() {
  if (!window.speechSynthesis) return;
  cachedVoices = window.speechSynthesis.getVoices();
  if (cachedVoices.length > 0) voicesLoaded = true;
}

// Load immediately (works in Firefox)
loadVoices();

// Listen for async voice loading (Chrome, Safari, Edge)
if (window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Speak Arabic text using the Web Speech API.
 * MUST be called synchronously from a user click handler (no setTimeout).
 */
function speakArabic(text) {
  const synth = window.speechSynthesis;
  if (!synth || !text) return;

  // Ensure voices are loaded
  if (!voicesLoaded) loadVoices();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ar-SA';
  utterance.rate = 0.8;
  utterance.volume = 1;

  // Find an Arabic voice — try several lang codes macOS/Chrome use
  const arabicVoice =
    cachedVoices.find((v) => v.lang === 'ar-SA') ||
    cachedVoices.find((v) => v.lang === 'ar-001') ||
    cachedVoices.find((v) => v.lang === 'ar_001') ||
    cachedVoices.find((v) => v.lang.startsWith('ar'));

  if (arabicVoice) {
    utterance.voice = arabicVoice;
    utterance.lang = arabicVoice.lang;
  }

  // Must call speak() synchronously from click — no setTimeout
  synth.cancel();
  synth.speak(utterance);
}

export default function FlashCard({ card, isFlipped, onFlip }) {
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = useCallback(
    (e) => {
      e.stopPropagation();
      if (!card) return;
      setSpeaking(true);
      speakArabic(card.front.primary);
      setTimeout(() => setSpeaking(false), 1500);
    },
    [card]
  );

  if (!card) return null;

  const speakButton = (
    <button
      onClick={handleSpeak}
      className={`mt-3 px-4 py-2 rounded-lg text-sm transition-colors ${
        speaking
          ? 'bg-accent/20 text-accent'
          : 'bg-surface-2 text-text-muted hover:text-text hover:bg-border'
      }`}
      aria-label="Listen to pronunciation"
      type="button"
    >
      {speaking ? '🔊 Playing...' : '🔊 Listen'}
    </button>
  );

  return (
    <div
      className={`max-w-2xl mx-auto min-h-[24rem] bg-surface rounded-2xl border border-border p-8 flex flex-col items-center justify-center ${
        !isFlipped ? 'cursor-pointer' : ''
      }`}
      onClick={!isFlipped ? onFlip : undefined}
      role={!isFlipped ? 'button' : undefined}
      aria-label={!isFlipped ? 'Flip card' : undefined}
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
        /* -- Front Face -- */
        <div className="flex flex-col items-center justify-center text-center">
          <ArabicText size="text-6xl" as="div">
            {card.front.primary}
          </ArabicText>

          {speakButton}

          {card.front.secondary && (
            <div className="text-text-muted text-lg mt-3">
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
        /* -- Back Face -- */
        <div className="flex flex-col items-center justify-center text-center">
          <ArabicText size="text-4xl" as="div" className="text-text-muted">
            {card.front.primary}
          </ArabicText>

          {speakButton}

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
