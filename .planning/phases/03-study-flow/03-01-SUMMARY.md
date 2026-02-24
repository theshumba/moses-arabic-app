---
phase: 03-study-flow
plan: 01
subsystem: study-flow
tags: [react-hooks, sm-2, spaced-repetition, state-machine, useCallback, useRef]

# Dependency graph
requires:
  - phase: 01-data-services
    provides: SrsService (buildStudyQueue, reviewCard, shouldReshow, getInterleavingDistance), StatsService (startSession, endSession), card data (getCardsByDeck, getCardById)
  - phase: 02-app-shell
    provides: ProgressContext (useProgressState, useProgressDispatch), SettingsContext (useSettingsState)
provides:
  - useStudySession hook — session state machine for StudyPage
  - Session queue building (due + new cards)
  - Card rating with Again re-show interleaving
  - Session completion stats (accuracy, duration, ratings breakdown)
affects: [03-02 (StudyPage UI), 03-03 (session results display)]

# Tech tracking
tech-stack:
  added: []
  patterns: [useRef for mutable non-reactive state, useCallback for stable action references, ref-synchronized context reads]

key-files:
  created: [src/hooks/useStudySession.js]
  modified: []

key-decisions:
  - "useRef for queue/againCounts/ratingsBreakdown (mutable, no re-render needed)"
  - "useState for currentIndex/isFlipped/isComplete/cardsCompleted (reactive, drive UI)"
  - "cardProgressRef synced from context to avoid stale closures in rate()"
  - "cardsCompleted+1 passed to endSession since setState hasn't flushed"
  - "sessionEndedRef guard prevents double endSession calls"

patterns-established:
  - "Mutable ref + reactive state split: refs for high-frequency mutations, state for UI-driving values"
  - "Context ref sync: useRef mirrors context value for stable callback access"
  - "Session lifecycle: startSession on mount, endSession on complete or unmount"

# Metrics
duration: 1min
completed: 2026-02-24
---

# Phase 3 Plan 1: useStudySession Hook Summary

**SM-2 session state machine hook with queue building, card rating via ProgressContext, Again re-show interleaving, and StatsService session lifecycle**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-24T07:30:09Z
- **Completed:** 2026-02-24T07:31:15Z
- **Tasks:** 1
- **Files created:** 1

## Accomplishments
- Session state machine hook that builds study queue from SrsService on mount (due reviews first, then new cards up to newCardsPerSession limit)
- Rating flow dispatches REVIEW_CARD to ProgressContext, tracks breakdown, handles Again re-shows with interleaving distances from SrsService
- Session lifecycle integrates StatsService (startSession on mount, endSession on completion or unmount for data safety)
- Clean API surface: currentCard, isFlipped, isComplete, cardsCompleted, totalCards, flip, rate, sessionResult

## Task Commits

Each task was committed atomically:

1. **Task 1: Create useStudySession hook with full session state machine** - `7f2c88a` (feat)

## Files Created/Modified
- `src/hooks/useStudySession.js` - Session state machine hook: queue building, flip/rate actions, Again re-show interleaving, session stats

## Decisions Made
- Used useRef for queue array, againCounts, ratingsBreakdown (mutated frequently, no re-render needed) and useState for currentIndex, isFlipped, isComplete, cardsCompleted (drive UI updates)
- Synced cardProgress context value into a ref (cardProgressRef) so rate() callback always reads latest progress without needing cardProgress in its dependency array
- Passed cardsCompleted+1 to StatsService.endSession because React setState is async and the increment hasn't flushed yet
- Added sessionEndedRef guard to prevent double endSession calls (completion path vs unmount cleanup)
- totalCards updates dynamically when Again re-shows splice into the queue

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- useStudySession hook ready for consumption by StudyPage (Plan 03-02)
- All integration points verified: SrsService, ProgressContext, SettingsContext, StatsService
- Build passes clean (431KB bundle)

---
*Phase: 03-study-flow*
*Completed: 2026-02-24*
