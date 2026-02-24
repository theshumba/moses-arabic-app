# Requirements: Arabic SRS

**Defined:** 2026-02-24
**Core Value:** SM-2 spaced repetition engine correctly schedules cards, tracks progress, and persists state across sessions

## v1 Requirements

### SRS Engine

- [ ] **SRS-01**: SM-2 algorithm with Again/Hard/Good/Easy ratings, EF floor at 1.3, EF recovery on Good when below 2.5
- [ ] **SRS-02**: Study queue builds due reviews first, then new cards up to configurable session limit (default 50)
- [ ] **SRS-03**: Again re-show capped at 3 per session with card interleaving (2-5 cards between re-shows)

### Card Data

- [ ] **DATA-01**: 10 decks across 4 stages generating ~700-800 total cards
- [ ] **DATA-02**: Card generator imports Gogo Arabic alphabet.json (28 letters, 4 forms, vowel combos) and vocabulary.json (250 words)
- [ ] **DATA-03**: Curated uni vocabulary (~90 items), grammar cards (~80), number cards (10), reading cards (~80)

### Progressive Unlock

- [ ] **UNLOCK-01**: Each deck has mastery prerequisites that gate access (per design doc unlock table)
- [ ] **UNLOCK-02**: Stage mastery percentage computed from aggregate member deck mastery

### Study View

- [ ] **STUDY-01**: Flip mode shows front (Arabic + hint), space/click reveals back, then rating buttons appear
- [ ] **STUDY-02**: Type mode shows prompt with text input, Enter submits, validates with Arabic normalization pipeline (NFC, strip harakat/tatweel, hamza normalization, case-insensitive)
- [ ] **STUDY-03**: Rating buttons (Again/Hard/Good/Easy) with keyboard shortcuts 1-4, color-coded (red/orange/green/blue)
- [ ] **STUDY-04**: Session complete screen shows cards done, accuracy (% rated Good+), time taken, Continue/Dashboard navigation
- [ ] **STUDY-05**: Keyboard shortcuts (Space=flip, 1-4=rate, Enter=submit, Escape=exit) guarded against firing in input fields

### Dashboard

- [ ] **DASH-01**: Hero stats row showing cards due today, overall mastery %, time studied today, streak
- [ ] **DASH-02**: 4-stage progress bars (Script/Core/Grammar/Vocab) with mastery percentages
- [ ] **DASH-03**: 10-deck grid with name, stage badge, mastered/total, due count, Study button (or lock icon)
- [ ] **DASH-04**: "Continue Studying" CTA navigates to highest-priority deck with due cards

### Deck Browser

- [ ] **DECK-01**: All 10 decks displayed with stats (total/mastered/due/new), mastery progress bar, lock state with unlock requirement text, Study button

### Settings & Data Management

- [ ] **SET-01**: Study mode toggle (Flip/Type/Alternating) and new cards per session slider (10-100, default 50)
- [ ] **SET-02**: Export progress as JSON download, import from file upload with schema validation
- [ ] **SET-03**: Reset all progress with confirmation dialog

### UI/UX Foundation

- [ ] **UI-01**: Dark theme (#0F0F0F base), forced dark via Tailwind v4 CSS-first @theme tokens (no dark: variants)
- [ ] **UI-02**: ArabicText component with dir="rtl", lang="ar", Noto Sans Arabic font, line-height 1.8+, unicode-bidi: isolate, font-feature-settings for ligatures
- [ ] **UI-03**: App shell with sidebar (navigation + compact deck progress bars) and main content layout
- [ ] **UI-04**: localStorage persistence via StorageService (debounced writes, prefixed keys, QuotaExceededError handling, export/import/clear)

## v2 Requirements

### Enhancements

- **V2-01**: Audio pronunciation (native speaker recordings or high-quality TTS)
- **V2-02**: Per-deck new card limits (different defaults for complex decks like harakat)
- **V2-03**: Rating undo (1-card buffer to recover from misclicks)
- **V2-04**: Quick deck switcher (Cmd+K)
- **V2-05**: Responsive mobile layout (sidebar collapse on small screens)
- **V2-06**: Session time estimate on Study button ("~25 min")

## Out of Scope

| Feature | Reason |
|---------|--------|
| Handwriting recognition | Entire research project, not solvable in sprint |
| Cloud sync / backend | No auth, no server costs needed for solo tool |
| Gamification (XP, levels, achievements) | Optimizes engagement over learning |
| Social features | Requires backend, auth, moderation |
| FSRS algorithm | Marginal improvement over SM-2, much more complex |
| Custom card creation | Curated curriculum is the product |
| Analytics graphs / charts | Insufficient data for 7-day sprint |
| Light mode | Forced dark simplifies CSS, best contrast for Arabic |
| PWA / service worker | Already works offline after load |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| (To be filled by roadmap) | | |

**Coverage:**
- v1 requirements: 22 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 22

---
*Requirements defined: 2026-02-24*
*Last updated: 2026-02-24 after initial definition*
