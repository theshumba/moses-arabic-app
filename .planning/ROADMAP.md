# Roadmap: Moses Arabic App v1.0

**Created:** 2026-02-24
**Core Value:** SM-2 spaced repetition engine correctly schedules cards, tracks progress, and persists state across sessions
**Total Phases:** 5
**Total Requirements:** 25

## Phase 1: Foundation & Services

**Goal:** Scaffold the project, generate all card data from Gogo Arabic sources, and implement the pure-function service layer (SM-2 algorithm, deck unlock logic, storage, stats). Everything else depends on this.

**Directory:** `.planning/phases/01-foundation-services/`

**Requirements:**
- SRS-01: SM-2 algorithm with Again/Hard/Good/Easy ratings
- SRS-02: Study queue (due reviews first, then new cards up to session limit)
- SRS-03: Again re-show capped at 3 per session with interleaving
- DATA-01: 10 decks across 4 stages (~700-800 cards)
- DATA-02: Card generator imports Gogo Arabic alphabet.json + vocabulary.json
- DATA-03: Curated uni vocabulary, grammar cards, number cards, reading cards
- UNLOCK-01: Deck mastery prerequisites gate access
- UNLOCK-02: Stage mastery % from aggregate member deck mastery
- UI-04: StorageService (debounced writes, prefixed keys, quota handling, export/import/clear)

**Success Criteria:**
- [ ] `npm run dev` serves dark-themed app at localhost
- [ ] 10 decks generate correct card counts (total ~700-800)
- [ ] SrsService.reviewCard() correctly implements SM-2 with EF recovery
- [ ] StorageService round-trips data through localStorage
- [ ] DeckService.isDeckUnlocked() enforces prerequisite chain

---

## Phase 2: App Shell & Contexts

**Goal:** Build the visual skeleton (dark theme, sidebar, routing, ArabicText component) and wire up React contexts that consume Phase 1 services. After this phase, navigating between pages works and state persists.

**Directory:** `.planning/phases/02-shell-contexts/`

**Requirements:**
- UI-01: Dark theme (#0F0F0F), forced dark via Tailwind v4 @theme tokens
- UI-02: ArabicText component (dir="rtl", lang="ar", Noto Sans Arabic, line-height 1.8+)
- UI-03: App shell with sidebar navigation and main content layout

**Success Criteria:**
- [ ] 4 routes render (Dashboard, Study, Decks, Settings) with sidebar nav
- [ ] ArabicText renders harakat at 64px without clipping
- [ ] ProgressContext loads/persists card progress across page refreshes
- [ ] SettingsContext loads/persists preferences

---

## Phase 3: Study Flow (Core Loop)

**Goal:** Implement the primary user interaction — the study session. Card flip, rating, session queue management, keyboard shortcuts, and session completion. This is where learning happens.

**Directory:** `.planning/phases/03-study-flow/`

**Requirements:**
- STUDY-01: Flip mode (front with Arabic + hint, space/click reveals back, then ratings)
- STUDY-03: Rating buttons (Again/Hard/Good/Easy) with keyboard 1-4, color-coded
- STUDY-04: Session complete screen (cards done, accuracy, time, navigation)
- STUDY-05: Keyboard shortcuts (Space=flip, 1-4=rate, Enter=submit, Escape=exit)

**Success Criteria:**
- [ ] Full study session: select deck → flip cards → rate → session complete
- [ ] Keyboard shortcuts work (Space, 1-4, Escape) and don't fire in inputs
- [ ] Progress persists after session (card intervals update, due dates set)
- [ ] Session complete shows accurate stats

---

## Phase 4: Dashboard & Deck Browser

**Goal:** Build the dashboard (stats, stage progress, deck grid, continue CTA) and the deck browser (all 10 decks with stats, lock states, study buttons). These are the "home" screens users see before studying.

**Directory:** `.planning/phases/04-dashboard-decks/`

**Requirements:**
- DASH-01: Hero stats row (cards due, mastery %, time studied, streak)
- DASH-02: 4-stage progress bars with mastery percentages
- DASH-03: 10-deck grid (name, stage badge, mastered/total, due count, Study/lock)
- DASH-04: "Continue Studying" CTA → highest-priority deck with due cards
- DECK-01: All 10 decks with stats, mastery bar, lock state, unlock text, Study button

**Success Criteria:**
- [ ] Dashboard shows correct due counts and streak after studying
- [ ] Stage progress bars reflect actual mastery per stage
- [ ] Locked decks show lock icon + unlock requirement text
- [ ] "Continue Studying" navigates to correct deck

---

## Phase 5: Type Mode, Settings & Polish

**Goal:** Add Type mode with Arabic normalization pipeline, Settings page (study prefs + data management), and final polish (transitions, empty states, responsive sidebar).

**Directory:** `.planning/phases/05-type-settings-polish/`

**Requirements:**
- STUDY-02: Type mode (prompt + input, Enter submits, Arabic normalization pipeline)
- SET-01: Study mode toggle (Flip/Type/Alternating) + new cards per session slider
- SET-02: Export progress as JSON, import with schema validation
- SET-03: Reset all progress with confirmation dialog

**Success Criteria:**
- [ ] Type mode validates answers with normalization (NFC, strip harakat/tatweel, hamza)
- [ ] Settings changes persist immediately
- [ ] Export/import round-trips all progress data
- [ ] Reset clears all progress with confirmation

---

## Requirement Traceability

| Requirement | Phase | Description |
|-------------|-------|-------------|
| SRS-01 | 1 | SM-2 algorithm |
| SRS-02 | 1 | Study queue building |
| SRS-03 | 1 | Again re-show cap |
| DATA-01 | 1 | 10 decks, ~700-800 cards |
| DATA-02 | 1 | Import Gogo Arabic data |
| DATA-03 | 1 | Curated uni/grammar/number/reading cards |
| UNLOCK-01 | 1 | Deck prerequisites |
| UNLOCK-02 | 1 | Stage mastery % |
| UI-04 | 1 | StorageService |
| UI-01 | 2 | Dark theme |
| UI-02 | 2 | ArabicText component |
| UI-03 | 2 | App shell + sidebar |
| STUDY-01 | 3 | Flip mode |
| STUDY-03 | 3 | Rating buttons |
| STUDY-04 | 3 | Session complete |
| STUDY-05 | 3 | Keyboard shortcuts |
| DASH-01 | 4 | Hero stats |
| DASH-02 | 4 | Stage progress bars |
| DASH-03 | 4 | Deck grid |
| DASH-04 | 4 | Continue CTA |
| DECK-01 | 4 | Deck browser |
| STUDY-02 | 5 | Type mode |
| SET-01 | 5 | Study preferences |
| SET-02 | 5 | Export/import |
| SET-03 | 5 | Reset progress |

**Coverage:** 25/25 requirements mapped (0 unmapped)

---
*Roadmap created: 2026-02-24*
