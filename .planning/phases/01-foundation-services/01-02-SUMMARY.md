---
phase: 01-foundation-services
plan: 02
subsystem: data
tags: [arabic, flashcards, sm-2, json, card-generator, spaced-repetition]

# Dependency graph
requires:
  - phase: 01-01
    provides: Vite + React 19 scaffold with src/ directory structure
provides:
  - 10 deck definitions with progressive prerequisite unlocking across 4 stages
  - 734 generated flashcards in standardized shape (id, deckId, front, back, typeAnswer)
  - Barrel export module for all card data and deck definitions
  - Gogo Arabic source data (30 letters, 250 vocabulary words)
  - 4 curated data modules (numbers, uni-vocab, grammar, reading)
affects: [01-03, 01-04, 02-shell, 03-study-view, 05-polish]

# Tech tracking
tech-stack:
  added: []
  patterns: [card-standard-shape, deck-prerequisites, barrel-export, generator-per-deck]

key-files:
  created:
    - src/data/alphabet.json
    - src/data/vocabulary.json
    - src/data/numberCards.js
    - src/data/uniVocab.js
    - src/data/grammarCards.js
    - src/data/readingCards.js
    - src/data/decks.js
    - src/data/cardGenerator.js
    - src/data/index.js
  modified: []

key-decisions:
  - "28 base letters for card generation (exclude ta_marbuta and hamza from letter-recognition/forms/harakat/sun-moon decks)"
  - "734 total cards across 10 decks — within 700-800 target range"
  - "Pre-generate all cards at module load in index.js (static data, acceptable cost)"
  - "Bare JSON imports for Vite compatibility (no import attributes needed)"
  - "Verb conjugation uses flatMap pattern for 6 verbs x 8 pronouns = 48 cards"

patterns-established:
  - "Card standard shape: { id, deckId, front: { primary, secondary?, hint? }, back: { primary, secondary?, detail? }, typeAnswer: { prompt, acceptedAnswers[] } }"
  - "Deck prerequisite format: { deckId, metric, threshold } or { stage, metric, threshold }"
  - "ID prefix convention: lr-, lf-, har-, sm-, num-, uni-, gram-, cw-, rc-, rp-"
  - "Generator-per-deck pattern in cardGenerator.js with GENERATORS lookup map"
  - "Barrel export in index.js with pre-computed CARD_MAP and CARD_BY_ID"

# Metrics
duration: 6min
completed: 2026-02-24
---

# Phase 1 Plan 2: Card Data Summary

**734 flashcards across 10 decks (4 stages) generated from Gogo Arabic source data plus curated grammar, numbers, and reading modules**

## Performance

- **Duration:** 6 min
- **Started:** 2026-02-24T06:17:49Z
- **Completed:** 2026-02-24T06:24:18Z
- **Tasks:** 2
- **Files created:** 9

## Accomplishments
- Copied Gogo Arabic source data (30 letters with forms/vowels, 250 vocabulary words)
- Created 4 curated data modules: numberCards (10), uniVocab (90), grammarCards (80), readingCards (80)
- Built 10 deck definitions with progressive prerequisites across 4 learning stages
- Card generator produces 734 cards all conforming to the standard shape
- Barrel export provides DECKS, STAGES, ALL_CARDS, getCardsByDeck, getCardById

## Task Commits

Each task was committed atomically:

1. **Task 1: Copy Gogo Arabic data and create curated card sources** - `243d0c0` (feat)
2. **Task 2: Create deck definitions, card generator, and barrel export** - `149ac46` (feat)

## Files Created/Modified
- `src/data/alphabet.json` - 30 Arabic letters with forms, groups, and vowel combinations (from Gogo Arabic)
- `src/data/vocabulary.json` - 250 curated Arabic words across 15 categories (from Gogo Arabic)
- `src/data/numberCards.js` - 10 Arabic numeral entries (Eastern Arabic digits + word forms)
- `src/data/uniVocab.js` - 90 university-level vocabulary items across 9 categories
- `src/data/grammarCards.js` - 80 grammar entries (8 pronouns, 48 conjugations, 7 possessives, 8 gender pairs, 4 demonstratives, 5 concepts)
- `src/data/readingCards.js` - 50 connected reading words with letter breakdowns + 30 practice sentences
- `src/data/decks.js` - 4 stages and 10 deck definitions with prerequisite chains
- `src/data/cardGenerator.js` - Per-deck generator functions producing standardized cards
- `src/data/index.js` - Barrel export with pre-computed card maps and lookup functions

## Decisions Made
- Excluded ta_marbuta and hamza from the 4 letter-based decks (28 base letters, not 30) since they are special characters not standard in letter-form/harakat drills
- Pre-generate all cards at module load in the barrel export (static data never changes at runtime)
- Used bare JSON imports (no `with { type: 'json' }`) since Vite handles them natively
- Verb conjugation data structured as nested array then flatMapped to 48 cards for maintainability
- Grammar cards combined from 6 sub-arrays via spread into single grammarCards export

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Card data layer complete, ready for SM-2 engine (Plan 03) to schedule these cards
- All 734 cards available via barrel export for study view consumption
- Deck prerequisites defined for progressive unlocking logic

## Self-Check: PASSED

All 9 created files verified present. Both task commits (243d0c0, 149ac46) verified in git log.

---
*Phase: 01-foundation-services*
*Completed: 2026-02-24*
