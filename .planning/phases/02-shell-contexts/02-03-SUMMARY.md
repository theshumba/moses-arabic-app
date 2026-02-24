---
phase: 02-shell-contexts
plan: 03
subsystem: ui
tags: [react-router, layout, sidebar, navigation, tailwind, deck-progress]

requires:
  - phase: 02-shell-contexts
    provides: ProgressContext (cardProgress state for deck mastery bars), AppProviders composition wrapper
  - phase: 02-shell-contexts
    provides: 4 placeholder page components (Dashboard, Study, Decks, Settings)
  - phase: 01-foundation-services
    provides: DeckService (getDeckStats), DECKS/STAGES data, StorageService
provides:
  - AppShell layout route (sidebar + scrollable main content via Outlet)
  - Sidebar with 4 NavLink items and deck progress bars grouped by stage
  - createBrowserRouter with 5 routes wrapped in AppProviders
affects: [03-study-flow, 04-dashboard-decks, 05-type-settings-polish]

tech-stack:
  added: []
  patterns: [layout-route-pattern, navlink-active-highlighting, stage-grouped-progress]

key-files:
  created:
    - src/components/layout/AppShell.jsx
    - src/components/layout/Sidebar.jsx
  modified:
    - src/App.jsx
    - src/index.css

key-decisions:
  - "Fixed sidebar (no responsive collapse) — deferred to v2"
  - "allCardsByDeck memoized with useMemo (static data, [] deps)"
  - "Dashboard NavLink uses end prop for exact match preventing false active"
  - "study/:deckId route before /study for correct param matching"
  - "AppProviders wraps RouterProvider (not inside layout) for context in all routes"

patterns-established:
  - "Layout route pattern: pathless parent route with Component: AppShell, children as page routes"
  - "NavLink active highlighting: className callback with isActive, active gets bg-surface-2 + border-l-2 border-accent"
  - "Stage-grouped deck progress: STAGES.map with STAGE_COLOR_MAP/STAGE_BAR_COLOR_MAP for O(1) color lookup"
  - "--spacing-sidebar token: 16rem sidebar width via Tailwind v4 @theme spacing"

duration: 2min
completed: 2026-02-24
---

# Phase 2 Plan 03: AppShell Layout, Sidebar Navigation, and Router Wiring Summary

**AppShell flex layout with fixed sidebar (4 NavLinks + stage-grouped deck progress bars) and createBrowserRouter with 5 routes wrapped in AppProviders**

## Performance

- **Duration:** 2 min
- **Started:** 2026-02-24
- **Completed:** 2026-02-24
- **Tasks:** 2
- **Files created:** 2
- **Files modified:** 2

## Accomplishments
- AppShell layout route with fixed sidebar and independently scrollable main content area
- Sidebar with app title, 4 NavLink items with active highlighting (Dashboard uses `end` prop for exact match)
- Compact deck progress bars grouped by 4 stages with stage-colored mastery bars via DeckService.getDeckStats
- createBrowserRouter with AppShell layout route and 5 child routes (index, study/:deckId, study, decks, settings)
- AppProviders wraps RouterProvider so all routes have access to ProgressContext and SettingsContext
- `--spacing-sidebar: 16rem` token added to Tailwind v4 @theme block

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AppShell and Sidebar with deck progress** - `1ec8d44` (feat)
2. **Task 2: Rewrite App.jsx with createBrowserRouter and AppProviders** - `a148791` (feat)

## Files Created/Modified
- `src/components/layout/AppShell.jsx` - Flex layout with Sidebar + Outlet for main content
- `src/components/layout/Sidebar.jsx` - Navigation sidebar with 4 NavLinks, deck progress bars grouped by stage
- `src/App.jsx` - Rewritten with createBrowserRouter, AppShell layout route, 5 child routes, AppProviders wrapper
- `src/index.css` - Added `--spacing-sidebar: 16rem` token to @theme block

## Decisions Made
- Fixed sidebar with no responsive collapse (deferred to v2) — keeps initial implementation simple
- `allCardsByDeck` computed via `useMemo(() => ..., [])` since deck/card data is static
- Dashboard NavLink uses `end` prop to prevent false active on all routes (since `/` matches everything)
- `/study/:deckId` route placed before `/study` so the parameterized route matches first
- AppProviders wraps RouterProvider (outside the router) so all routes including AppShell have context access
- Stage color maps (STAGE_COLOR_MAP, STAGE_BAR_COLOR_MAP) as module constants for O(1) lookup

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Phase 2 complete: contexts (Plan 01), pages + ArabicText (Plan 02), and shell + router (Plan 03) all wired
- App has working navigation between 4 routes with persistent sidebar showing deck progress
- Ready for Phase 3: Study Flow (flashcard rendering, SRS integration, session management)

---
*Phase: 02-shell-contexts*
*Completed: 2026-02-24*
