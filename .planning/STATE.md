# State: Moses Arabic App

## Current Position
- **Phase:** 3 of 5 (Study Flow)
- **Phase Name:** Study Flow
- **Plan:** 3 of 3 completed
- **Status:** Phase complete
- **Last activity:** 2026-02-24 - Completed quick-001 (Fix Phase 3 Code Review Issues)
- **Progress:** `[██████████░░░░░░░░░░]` 10/19 plans

## Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-24 | SM-2 over FSRS | Simpler, well-understood, proven effective |
| 2026-02-24 | 5-phase roadmap | Services -> Shell -> Study -> Dashboard -> Polish |
| 2026-02-24 | Skip research-phase for all phases | Research docs contain sufficient detail |
| 2026-02-24 | Renamed project to Moses Arabic App | Personal branding, findability |
| 2026-02-24 | Tailwind v4 CSS-first only | No tailwind.config.js, all config in @theme block |
| 2026-02-24 | Forced dark theme, no dark: variants | Single theme, body styles set bg/text colors |
| 2026-02-24 | 17 @theme color tokens | bg, surface, surface-2, border, text, text-muted, text-dim, 4 stage, 4 SRS response, accent |
| 2026-02-24 | font-arabic token | Noto Sans Arabic with Arial and sans-serif fallbacks |
| 2026-02-24 | STORAGE_PREFIX = 'moses-arabic-' | Namespace isolation in shared localStorage |
| 2026-02-24 | DEBOUNCE_MS = 2000 for StorageService | Batch rapid writes without perceptible delay |
| 2026-02-24 | SM-2 learning steps: 1min/10min/graduate | Standard Anki-style learning progression |
| 2026-02-24 | EF recovery +0.05 on Good when EF < 2.5 | Prevents EF death spiral |
| 2026-02-24 | Again re-show capped at 3 per session | Prevents frustration loops, interleaving 2/3/5 |
| 2026-02-24 | ISO string dates in SrsService | JSON-safe, no Date serialization issues |
| 2026-02-24 | 28 base letters for card decks (exclude ta_marbuta/hamza) | Special characters not suited for letter-form/harakat/sun-moon drills |
| 2026-02-24 | 734 total cards across 10 decks | Within 700-800 target, covering script basics through fluency |
| 2026-02-24 | Pre-generate cards at module load | Static data, no runtime cost concern, enables O(1) lookups |
| 2026-02-24 | Bare JSON imports (Vite-native) | No import attributes needed, Vite handles natively |
| 2026-02-24 | DeckService is pure (no StorageService) | All data passed as arguments, testable and framework-agnostic |
| 2026-02-24 | StatsService session start time ephemeral | Module variable, not persisted — incomplete sessions meaningless |
| 2026-02-24 | Sessions capped at 100 (FIFO) | Prevents unbounded localStorage growth |
| 2026-02-24 | StatsService uses setImmediate for writes | Prevents data loss on tab close for critical session/streak data |
| 2026-02-24 | Accuracy = % Good + Easy ratings | Standard SRS metric for measuring recall quality |
| 2026-02-24 | Streak resets on gap > 1 day | Yesterday maintains streak, 2+ day gap resets to 0 |
| 2026-02-24 | unicodeBidi inline style in ArabicText | Tailwind v4 has no unicode-bidi: isolate utility |
| 2026-02-24 | fontFeatureSettings liga+calt in ArabicText | Enables proper Arabic ligatures and contextual alternates |
| 2026-02-24 | StudyPage pre-wired with useParams(:deckId) | Validates route param wiring before router exists |
| 2026-02-24 | ProgressContext: flat cardProgress object | cardId -> progress, matches StorageService 'progress' key |
| 2026-02-24 | SettingsContext merges DEFAULT_SETTINGS on LOAD | Handles future settings additions without migration |
| 2026-02-24 | AppProviders: SettingsProvider outer, ProgressProvider inner | ProgressProvider may later read settings (newCardsPerSession) |
| 2026-02-24 | Fixed sidebar, no responsive collapse | Deferred to v2, keeps initial implementation simple |
| 2026-02-24 | allCardsByDeck memoized with useMemo([], static) | Deck/card data never changes, compute once |
| 2026-02-24 | Dashboard NavLink uses end prop | Prevents false active on all routes since / matches everything |
| 2026-02-24 | study/:deckId route before /study | Parameterized route matches first |
| 2026-02-24 | AppProviders wraps RouterProvider (outside router) | All routes including AppShell have context access |
| 2026-02-24 | --spacing-sidebar: 16rem | Tailwind v4 @theme token for sidebar width |
| 2026-02-24 | useRef for queue/againCounts/ratingsBreakdown | Mutable non-reactive state, no re-renders needed for high-frequency mutations |
| 2026-02-24 | cardProgressRef syncs context for callbacks | Avoids stale closures in rate() without adding cardProgress to deps |
| 2026-02-24 | cardsCompleted+1 in endSession call | React setState async, increment hasn't flushed at call time |
| 2026-02-24 | sessionEndedRef guard | Prevents double endSession from completion + unmount |
| 2026-02-24 | FlashCard instant swap, no flip animation | Keeps implementation simple, avoids CSS 3D transform complexity |
| 2026-02-24 | FlashCard back face non-interactive | User must use rating buttons to proceed, not re-flip |
| 2026-02-24 | RatingButtons as constant array mapping | Easy to maintain and extend rating definitions |
| 2026-02-24 | SessionComplete inline formatDuration | Simple enough to not warrant a separate utility file |
| 2026-02-24 | StudyFlow inner component isolates hook mount | React hooks cannot be called conditionally, validation in outer StudyPage |
| 2026-02-24 | Keyboard shortcuts guarded by activeElement tag | Prevents Space/1-4 firing in INPUT/TEXTAREA/SELECT fields |
| 2026-02-24 | Empty queue = isComplete && !sessionResult | Zero-length queue triggers immediate isComplete without sessionResult |
| 2026-02-24 | Progress counter shows cardsCompleted+1 | 1-indexed display for user-facing numbering |
| 2026-02-24 | cardsCompletedRef mirrors cardsCompleted state for cleanup access | Avoids stale closure in unmount cleanup effect |
| 2026-02-24 | totalCards derived from queueRef.current.length | Eliminates redundant state, always accurate including Again re-shows |

## Issues

(None)

## Blockers

(None)

## Quick Tasks

| ID | Name | Date | Commits |
|----|------|------|---------|
| 001 | Fix Phase 3 Code Review Issues | 2026-02-24 | 35c92a2, 6707886 |

## Session Continuity
- **Last session:** 2026-02-24
- **Stopped at:** Completed quick-001 (Fix Phase 3 Code Review Issues)
- **Resume:** Plan Phase 4 (Dashboard)

---
*Last updated: 2026-02-24*
