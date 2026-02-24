# Architecture Research

**Domain:** React SRS flashcard application (SM-2, localStorage, progressive unlock)
**Researched:** 2026-02-24
**Confidence:** HIGH

## Four-Layer Architecture

```
PRESENTATION  ->  Pages (Dashboard, Study, Decks, Settings) + UI Primitives
STATE         ->  ProgressContext, StudyContext, SettingsContext (split state/dispatch)
SERVICE       ->  SrsService, DeckService, StatsService, StorageService (pure functions)
DATA          ->  Static card data (JS/JSON) + localStorage (progress, settings, stats)
```

## Component Responsibilities

| Component | Responsibility | Key Pattern |
|-----------|---------------|-------------|
| SrsService | SM-2 algorithm, queue building | Pure functions, no side effects |
| DeckService | Unlock logic, mastery calculation | Pure functions, derived state |
| StatsService | Time tracking, streak calculation | Reads/writes StorageService |
| StorageService | localStorage abstraction | Only module touching localStorage |
| ProgressContext | Card progress, deck unlocks | Split state/dispatch, persistent |
| StudyContext | Active session state | Ephemeral (not persisted) |
| SettingsContext | User preferences | Split state/dispatch, persistent |

## Key Architectural Patterns

### 1. Service Layer as Pure Functions
Business logic in plain JS. Services receive data, return new data. Never access context/DOM. Testable without React. Callable from reducers.

### 2. Split State/Dispatch Contexts
Two contexts per domain (state + dispatch). RatingButtons only subscribes to dispatch, skips re-renders. Proven in FrameCoach.

### 3. Ephemeral Session State
Study session (queue, current card, timer) NOT persisted. Rebuilds from progress data on session start (<10ms for 800 cards). No stale queue bugs.

### 4. Derived State Over Denormalized
Deck stats and unlock state computed at render time. Never stored. Single source of truth (progress data). No sync bugs.

## Data Flow (Critical Path)

```
Study button -> StudyPage loads -> SrsService.buildStudyQueue(progress, deckCardIds)
  -> Render FlipCard/TypeCard -> User rates (1-4)
  -> ProgressContext dispatch REVIEW_CARD -> SrsService.reviewCard(progress, rating)
  -> useEffect persists to StorageService -> advance to next card
  -> Queue empty -> SessionComplete
```

## Build Order (Dependency Graph)

```
Wave 1 (parallel, no deps):  Data Layer + Services + UI Primitives
Wave 2 (needs Wave 1):       Contexts (needs Services) + App Shell (needs UI)
Wave 3 (needs Wave 2):       StudyPage + Dashboard + Decks + Settings (parallel)
Wave 4 (needs Wave 3):       Keyboard Shortcuts + Polish + Verification
```

## Anti-Patterns to Avoid

1. Storing SRS state on card objects (mix static + runtime)
2. Persisting study queue (stale queue bugs)
3. SM-2 logic in reducer (untestable, not reusable)
4. Multiple sources of truth for unlock state (sync bugs)
5. One giant context (re-renders entire tree on every review)

## Project Structure

```
src/
  data/          Static card content (immutable)
  services/      Pure business logic
  context/       React state (split state/dispatch)
  components/    UI primitives (flat, <15 components)
  pages/         Route-level (one per route)
  hooks/         Custom hooks (useKeyboardShortcuts)
  App.jsx        Router setup
  main.jsx       Provider nesting + entry
  index.css      Tailwind v4 @theme tokens
```

---
*Architecture research for: React SRS flashcard app*
