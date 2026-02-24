# Arabic SRS Learning App — Design Document

**Date:** 2026-02-24
**Goal:** Learn all Arabic letters, forms, harakat, numbers, uni vocabulary, grammar, and 250 common words in 7 days using spaced repetition.
**Intensity:** 12-14 hours/day (~84-98 total hours)

## Tech Stack

- React 19 + Vite 7 + Tailwind CSS v4
- React Router v7 (createBrowserRouter)
- localStorage for persistence (via StudyService)
- No backend, no auth
- Dark theme (#0F0F0F base), forced dark (no dark: variants)

## Data Sources

| Source | Used For |
|--------|----------|
| `gogo-arabic/src/data/alphabet.json` | 28 letters, 4 positional forms, vowel combos |
| `gogo-arabic/src/data/vocabulary.json` | 250 curated words with harakat, transliteration, examples |
| `gogo-arabic/src/data/grammar.js` | Grammar lessons, conjugation tables, exercises |
| `gogo-arabic/src/data/readingPassages.js` | Reading comprehension passages |
| `uni arabic/` folder (extracted) | Uni-specific vocab, grammar patterns, nationalities |

## 10 Decks (Curriculum Order)

### Stage 1 — The Script (Target: Days 1-2)
1. **Letter Recognition** — 28 cards. Front: letter name + transliteration. Back: Arabic letter (isolated). Type: given Arabic letter, type name.
2. **Letter Forms** — 112 cards (28 x 4 positions). Front: letter name + position. Back: correct form. Type: given a form, type letter name.
3. **Harakat & Diacritics** — ~196 cards (28 letters x 7 diacritics). Front: letter + harakat. Back: pronunciation/transliteration.
4. **Sun & Moon Letters** — 28 cards. Front: letter. Back: sun/moon classification + ال pronunciation rule.

### Stage 2 — Numbers & Core Vocab (Target: Days 2-3)
5. **Numbers 1-10** — 10 cards. Arabic numeral + word + pronunciation.
6. **Uni Arabic Vocabulary** — ~80-100 cards. Family, professions, countries, nationalities, adjectives, prepositions, adverbs from Westminster materials.

### Stage 3 — Grammar Patterns (Target: Days 3-5)
7. **Grammar Cards** — ~80 cards. Personal pronouns (8), present tense conjugation (8 verbs x 8 pronouns, grouped), possessive suffixes (7), masculine/feminine pairs, singular/plural patterns, demonstratives.

### Stage 4 — Vocabulary & Reading (Target: Days 5-7)
8. **250 Common Words** — From Gogo Arabic vocabulary.json. Categories: nouns, verbs, adjectives, phrases.
9. **Connected Letter Reading** — ~50 cards. Common Arabic words shown letter-by-letter breakdown on back. Practice reading joined script.
10. **Reading Practice** — ~30 cards. Full sentences from uni materials + Gogo Arabic passages. Front: Arabic sentence. Back: English translation + transliteration.

**Total: ~700-800 cards**

## SM-2 Spaced Repetition Algorithm

Per-card state:
```
{
  cardId: string,
  interval: number,       // days until next review
  repetition: number,     // consecutive correct reviews
  easeFactor: number,     // default 2.5, min 1.3
  nextReviewDate: string, // ISO date
  lapses: number,         // times forgotten
  lastRating: number,     // 1-4
  totalReviews: number
}
```

Rating scale:
- **Again (1):** interval = 1min/10min (learning steps), reset repetition. Lapse +1.
- **Hard (2):** interval x 1.2, easeFactor -= 0.15 (min 1.3)
- **Good (3):** interval x easeFactor
- **Easy (4):** interval x easeFactor x 1.3, easeFactor += 0.15

New card learning steps: 1min -> 10min -> 1day (graduate to review queue).

Session defaults: 50 new cards + unlimited reviews (adjustable in settings).

## Unlock Logic

| Deck | Prerequisite |
|------|-------------|
| 1. Letter Recognition | Unlocked from start |
| 2. Letter Forms | 80% of Deck 1 seen at least once |
| 3. Harakat | 60% of Deck 2 rated Good+ at least once |
| 4. Sun/Moon Letters | 50% of Deck 3 seen |
| 5. Numbers | Unlocks with Deck 2 (parallel) |
| 6. Uni Vocab | Stage 1 50% mastered |
| 7. Grammar | Deck 6 30% seen |
| 8. 250 Words | Stage 2 50% mastered |
| 9. Connected Reading | Deck 2 70% mastered |
| 10. Reading Practice | Deck 8 30% seen |

**Mastered = reviewed 3+ times, last rating Good/Easy, interval >= 1 day**

## App Structure

### Pages
1. **Dashboard** — Cards due, mastery per deck, time studied, streak, curriculum progress
2. **Study View** — Full-screen card interface (Flip mode + Type mode)
3. **Deck Browser** — All 10 decks with stats, locked/unlocked state
4. **Settings** — Study mode, cards per session, export/import, reset

### Component Tree
```
App
├── Layout
│   ├── Sidebar (deck nav, compact stats)
│   └── TopBar (current deck name, session progress)
├── DashboardPage
│   ├── StageProgress (4-stage visual)
│   ├── DueCardsSummary
│   ├── StudyTimeTracker
│   └── DeckMasteryGrid
├── StudyPage
│   ├── StudySessionManager (orchestrates card queue)
│   ├── FlipCard (front/back with large Arabic text)
│   ├── TypeCard (prompt + input + validation)
│   ├── RatingButtons (Again/Hard/Good/Easy)
│   └── SessionComplete (stats summary)
├── DecksPage
│   └── DeckCard (per deck: name, stats, lock state)
└── SettingsPage
    ├── StudyPreferences
    ├── DataManagement (export/import/reset)
    └── SessionConfig
```

### Services
- **StudyService** — SM-2 algorithm, card scheduling, queue management
- **StorageService** — localStorage abstraction (debounced writes, quota management)
- **DeckService** — Deck definitions, unlock logic, mastery calculations
- **StatsService** — Time tracking, session stats, streak calculation

### Context
- **StudyContext** — Active session state, current card, card queue
- **ProgressContext** — All card progress data, deck stats, unlock states
- **SettingsContext** — User preferences

## UI Design

- **Dark theme:** Background #0F0F0F, surface #1A1A1A, border #2A2A2A
- **Arabic text:** 48-64px, `font-family: 'Noto Sans Arabic'`, RTL, high contrast white
- **Stage colors:** Blue (#3B82F6), Green (#22C55E), Amber (#F59E0B), Purple (#A855F7)
- **Card colors per rating:** Again=Red, Hard=Orange, Good=Green, Easy=Blue

### Keyboard Shortcuts
- `Space` — Flip card / Submit typed answer
- `1/2/3/4` — Rate Again/Hard/Good/Easy
- `Enter` — Submit typed answer
- `Tab` — Switch flip/type mode
- `Escape` — Exit study session
- `Cmd+K` — Quick deck switcher

## Data Preparation

Cards are generated at build time from source data files:
1. Copy `alphabet.json` and `vocabulary.json` from Gogo Arabic
2. Extract uni Arabic vocabulary into a curated JSON file
3. Generate all card variants (letter x form x harakat combinations)
4. Grammar cards defined as structured JSON with conjugation tables

## Non-Goals

- No audio/TTS (can be added later)
- No handwriting recognition
- No multiplayer/social features
- No backend/cloud sync
- No gamification (XP, levels, achievements)
