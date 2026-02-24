# Feature Research

**Domain:** Arabic SRS flashcard learning app
**Researched:** 2026-02-24
**Confidence:** HIGH

## Table Stakes

| Feature | Complexity | Notes |
|---------|------------|-------|
| SM-2 spaced repetition scheduling | MEDIUM | Core value. Without it, random flashcards |
| 4-button rating (Again/Hard/Good/Easy) | LOW | Standard Anki paradigm. Keyboard 1-4 essential |
| Card flip interaction | LOW | Tap/space to reveal. CSS rotateY animation |
| Due card queue with review priority | MEDIUM | Reviews before new cards. Session new-card limit |
| Progress persistence (localStorage) | LOW | Debounced writes. StorageService pattern |
| Large crisp Arabic text (RTL) | LOW | Noto Sans Arabic 48-64px. dir="rtl" + lang="ar" |
| Deck/topic organization | LOW | 10 decks in 4 stages |
| Session completion summary | LOW | Cards done, accuracy, time |
| Data export/import | LOW | JSON blob download/upload |
| Dark theme | LOW | #0F0F0F base, forced dark |
| Keyboard-driven study flow | LOW | Space=flip, 1-4=rate, Enter=submit, Escape=exit |
| Deck statistics | LOW | Seen/mastered/due/new computed from progress |
| New cards per session limit | LOW | Configurable 10-100, default 50 |

## Differentiators

| Feature | Value | Complexity | Notes |
|---------|-------|------------|-------|
| Progressive deck unlock (curriculum gating) | HIGH | MEDIUM | Prevents overwhelm. Enforces pedagogical order |
| 4-stage curriculum structure | HIGH | LOW | Script -> Core -> Grammar -> Vocab. Visual progress |
| Type mode (typed answer validation) | HIGH | MEDIUM | Active recall. Multiple accepted answers. Normalization |
| Arabic-specific card templates | HIGH | HIGH | Letter forms, harakat combos, sun/moon. Card generator |
| Flip/Type/Alternating study modes | MEDIUM | LOW | Settings toggle |
| "Continue Studying" CTA | MEDIUM | LOW | One-click to highest-priority deck |
| Connected script reading cards | HIGH | MEDIUM | Letter-by-letter breakdown of joined words |
| Harakat combination cards | HIGH | LOW | 28 letters x 7 diacritics = 196 cards. Programmatic |
| Sun/Moon letter classification | MEDIUM | LOW | 28 binary classification cards |
| Sidebar with compact deck progress | MEDIUM | LOW | Always-visible progress. Lock icons |

## Anti-Features (Do NOT Build)

| Feature | Why Problematic |
|---------|-----------------|
| Audio/TTS | Massive complexity, poor Arabic TTS quality, 10-50x bundle size |
| Handwriting recognition | Entire research project. Not solvable in sprint |
| Cloud sync/backend | No auth, no server costs, no sync conflicts needed |
| Gamification (XP, levels) | Optimizes engagement, not learning. Adds UI complexity |
| Social features | Requires backend, auth, moderation. Zero value for solo tool |
| FSRS algorithm | Marginal improvement over SM-2, much more complex |
| Custom card creation | Curated curriculum is the point. Use Anki for custom |
| Analytics graphs | Insufficient data for 7-day sprint. Basic stats sufficient |
| Light mode | Forced dark simplifies CSS. Arabic highest contrast on dark |
| Drag-and-drop reordering | Progressive unlock IS the study order |
| Offline PWA | Already works offline after load. SW adds complexity |

## Feature Dependencies

- SrsService requires Card data model (card shape)
- ProgressContext requires SrsService (reviewCard in reducer)
- DeckService requires ProgressContext (mastery calculations)
- StudyPage requires: SrsService + ProgressContext + SettingsContext + FlipCard/TypeCard + RatingButtons
- Dashboard and StudyPage are independent (can parallel after shared deps)
- Keyboard shortcuts enhance but don't block study flow
- Type Mode enhances Flip Mode (build flip first)

## Priority Matrix

- **P1 (Launch):** SM-2 engine, all 10 decks, flip mode, progressive unlock, dashboard, deck browser, persistence, dark theme, keyboard shortcuts
- **P2 (Add when possible):** Type mode, session time tracking, streak, alternating mode, settings page
- **P3 (Future):** Quick deck switcher (Cmd+K), responsive mobile, card flip polish

---
*Feature research for: Arabic SRS flashcard learning app*
