# State: Moses Arabic App

## Current Position
- **Phase:** 2 of 5
- **Phase Name:** App Shell & Contexts
- **Plan:** 2 of 3 completed
- **Status:** In progress, ready for Plan 03
- **Last activity:** 2026-02-24 - Completed 02-02-PLAN.md (ArabicText + Placeholder Pages)
- **Progress:** `[██████░░░░░░░░░░░░░░]` 6/19 plans

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

## Issues

(None)

## Blockers

(None)

## Session Continuity
- **Last session:** 2026-02-24
- **Stopped at:** Completed 02-02-PLAN.md (ArabicText + Placeholder Pages)
- **Resume:** `/gsd:execute-plan` — Plan 03 (AppShell + Sidebar + Router)

---
*Last updated: 2026-02-24*
