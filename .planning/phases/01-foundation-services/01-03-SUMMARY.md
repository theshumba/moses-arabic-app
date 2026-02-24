---
phase: 01-foundation-services
plan: 03
subsystem: services
tags: [sm-2, spaced-repetition, localstorage, debounce, date-fns]

# Dependency graph
requires:
  - phase: 01-foundation-services/01-01
    provides: Vite + React 19 scaffold with date-fns dependency
provides:
  - StorageService: localStorage abstraction with debounced writes, export/import, quota tracking
  - SrsService: SM-2 algorithm with EF recovery, study queue building, again re-show capping
affects: [01-foundation-services/01-04, 02-app-shell, 03-study-engine]

# Tech tracking
tech-stack:
  added: []
  patterns: [debounced-writes, key-prefixing, pure-function-services, immutable-returns]

key-files:
  created:
    - src/services/StorageService.js
    - src/services/SrsService.js
  modified: []

key-decisions:
  - "STORAGE_PREFIX = 'moses-arabic-' for namespace isolation"
  - "DEBOUNCE_MS = 2000 for batched localStorage writes"
  - "Export format includes _meta.version for future schema migration"
  - "SM-2 learning steps: 1min -> 10min -> graduate (1 day)"
  - "EF recovery: +0.05 on Good when EF < 2.5"
  - "Again re-show capped at 3 per session with interleaving distances 2/3/5"
  - "All dates stored as ISO strings for JSON serialization"

patterns-established:
  - "Service module pattern: plain JS object with exported functions, no React imports"
  - "Immutable updates: reviewCard returns new object, never mutates input"
  - "Key prefixing: all localStorage access through StorageService with auto-prefix"
  - "Debounced persistence: set() queues, flushAll() forces immediate write"

# Metrics
duration: 3min
completed: 2026-02-24
---

# Phase 1 Plan 3: StorageService & SrsService Summary

**SM-2 spaced repetition engine with EF recovery and localStorage abstraction with debounced writes, export/import, and quota tracking**

## Performance

- **Duration:** 3 min
- **Started:** 2026-02-24T06:18:21Z
- **Completed:** 2026-02-24T06:21:18Z
- **Tasks:** 2
- **Files created:** 2

## Accomplishments
- StorageService: single point of localStorage access with auto-prefixed keys, debounced writes, QuotaExceededError handling, JSON export/import with version validation, and quota usage reporting
- SrsService: full SM-2 implementation with 4 ratings, learning steps (1min/10min/graduate), EF floor (1.3), EF recovery on Good, study queue building (due first, new cards capped), again re-show capping at 3 per session with interleaving
- Both services are pure JS modules with no React dependencies — fully testable and portable

## Task Commits

Each task was committed atomically:

1. **Task 1: Implement StorageService** - `8e0c5c9` (feat)
2. **Task 2: Implement SrsService** - `92b2d5c` (feat)

## Files Created/Modified
- `src/services/StorageService.js` - localStorage abstraction with debounced writes, export/import, quota tracking
- `src/services/SrsService.js` - SM-2 algorithm, study queue building, again re-show management

## Decisions Made
- STORAGE_PREFIX set to `moses-arabic-` for namespace isolation in shared localStorage
- DEBOUNCE_MS set to 2000ms to batch rapid writes without perceptible delay
- Export format includes `_meta.version` integer for forward-compatible schema migration
- Learning steps: step 0 = 1min, step 1 = 10min, step >= 2 = graduated (1-day interval)
- EF recovery: +0.05 on Good rating when EF < 2.5 (prevents EF death spiral)
- Again re-show interleaving: 2 cards for 1st again, 3 for 2nd, 5 for 3rd
- All dates stored as ISO strings via `.toISOString()` for JSON round-tripping
- Quota estimation: 5MB assumed limit, UTF-16 (2 bytes per char) for byte calculation

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- StorageService ready for DeckService (01-04) to persist deck progress and card state
- SrsService ready for study engine (Phase 3) to drive card reviews
- Both services have clean APIs documented via JSDoc comments
- Build passes clean (29 modules, 194KB JS bundle)

## Self-Check: PASSED

- FOUND: src/services/StorageService.js
- FOUND: src/services/SrsService.js
- FOUND: commit 8e0c5c9
- FOUND: commit 92b2d5c

---
*Phase: 01-foundation-services*
*Completed: 2026-02-24*
