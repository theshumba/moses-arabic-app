# Moses Arabic App

## What This Is

A single-page React flashcard app for learning Arabic letters, forms, harakat, grammar, and vocabulary in a 7-day intensive sprint. Uses SM-2 spaced repetition across 10 progressively-unlocked decks (~700-800 cards), seeded from Gogo Arabic project data and curated university material. Built for personal use — solo learner, no backend, localStorage persistence.

## Core Value

The SM-2 spaced repetition engine must correctly schedule cards, track progress, and persist state across sessions — without this, the app is just a random flashcard viewer.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 10 decks covering Arabic script, core vocab, grammar, and reading
- [ ] SM-2 algorithm with Again/Hard/Good/Easy ratings
- [ ] Progressive deck unlock based on mastery prerequisites
- [ ] Flip mode and Type mode study views
- [ ] Dashboard with due cards, mastery stats, stage progress, streak
- [ ] Deck browser with stats and lock states
- [ ] Settings with study preferences and data export/import/reset
- [ ] Keyboard shortcuts for study flow (Space, 1-4, Enter, Escape)
- [ ] Dark theme with large RTL Arabic text (Noto Sans Arabic)
- [ ] localStorage persistence with debounced writes

### Out of Scope

- Audio/TTS — can be added later
- Handwriting recognition — complexity not justified
- Multiplayer/social features — solo tool
- Backend/cloud sync — localStorage sufficient for personal use
- Gamification (XP, levels, achievements) — distraction from learning

## Context

- Data sources: `gogo-arabic/src/data/alphabet.json` (28 letters, 4 forms, vowels), `gogo-arabic/src/data/vocabulary.json` (250 words), plus curated uni Arabic material
- Intensity target: 12-14 hours/day for 7 days (~84-98 hours total)
- Existing detailed implementation plan in `docs/plans/2026-02-24-arabic-srs-implementation.md` with 12 tasks and parallelization map
- Design document in `docs/plans/2026-02-24-arabic-srs-design.md`

## Constraints

- **Tech stack**: React 19 + Vite 7 + Tailwind CSS v4 + React Router v7 — matches FrameCoach patterns
- **No backend**: All data in localStorage, no auth, no server
- **Dark theme**: #0F0F0F base, forced dark (no `dark:` variants), Tailwind v4 CSS-first
- **Font**: Noto Sans Arabic (Google Fonts), 48-64px for flashcard display
- **Timeline**: Build fast — existing plan targets rapid execution

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| SM-2 algorithm (not Leitner/FSRS) | Well-understood, proven effective, simple to implement | — Pending |
| 10 decks with progressive unlock | Prevents overwhelm, enforces curriculum order | — Pending |
| localStorage only | No backend complexity, data export covers backup needs | — Pending |
| Tailwind v4 CSS-first | Consistent with FrameCoach patterns, no config file | — Pending |
| Copy data from Gogo Arabic | Reuse existing curated Arabic content, don't recreate | — Pending |

---
*Last updated: 2026-02-24 after initialization*
