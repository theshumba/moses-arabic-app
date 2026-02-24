# Phase 2: App Shell & Contexts - Research

**Researched:** 2026-02-24
**Domain:** React app shell (routing, sidebar, layout), React Context state management, Arabic RTL text rendering
**Confidence:** HIGH

## Summary

Phase 2 builds the visual skeleton and state management layer on top of Phase 1's service layer. Three distinct domains are involved: (1) the app shell with React Router v7 layout routes, sidebar navigation, and main content area; (2) two React Contexts (ProgressContext and SettingsContext) using the proven split state/dispatch pattern from FrameCoach; and (3) the ArabicText component for RTL text rendering with proper diacritics support at large sizes.

All three domains are well-understood. The app shell follows the exact pattern used in FrameCoach Command Centre (`createBrowserRouter` with a layout route wrapping an `Outlet`, sidebar with `NavLink`). The context pattern is identical to FrameCoach's `AppContext.jsx` — `useReducer` + two `createContext` calls + hydration from StorageService on mount + persistence via `useEffect`. The ArabicText component is the only novel element, and its implementation is straightforward given the existing `font-arabic` Tailwind token and the pitfall research on harakat rendering.

**Primary recommendation:** Replicate FrameCoach's AppShell/Sidebar/Router pattern exactly, create ProgressContext and SettingsContext using the split state/dispatch template, and build ArabicText as a simple wrapper component with RTL isolation. No new dependencies needed.

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | ^19.2.0 | UI framework, Context API, useReducer | Already installed; `<Context value={}>` syntax |
| React Router DOM | ^7.0.0 | createBrowserRouter, NavLink, Outlet, layout routes | Already installed; proven in FrameCoach |
| Tailwind CSS | ^4.0.0 | CSS-first @theme tokens, utility classes | Already installed; dark theme tokens defined |
| date-fns | ^4.0.0 | Date calculations (used by services, not directly by Phase 2) | Already installed |

### Supporting (new — optional)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | latest | SVG icons for sidebar navigation and UI | Only if sidebar needs icons; can defer to Phase 3+ |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| lucide-react | Inline SVG or Unicode symbols | lucide adds ~5KB for tree-shaken icons; inline SVG is zero-dep but more verbose |
| React Context | Zustand/Jotai | Overkill for 2 contexts; Context pattern already proven in FrameCoach |
| createBrowserRouter | BrowserRouter + Routes | createBrowserRouter supports layout routes natively; BrowserRouter is legacy API |

**Installation:**
```bash
# No new packages required. All dependencies are already in package.json.
# Optional if sidebar needs icons:
npm install lucide-react
```

## Architecture Patterns

### Recommended Project Structure (after Phase 2)

```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.jsx        # Layout route: sidebar + Outlet
│   │   └── Sidebar.jsx         # Nav links + compact deck progress
│   └── ui/
│       └── ArabicText.jsx      # RTL-isolated Arabic text component
├── contexts/
│   ├── index.jsx               # AppProviders composition wrapper
│   ├── ProgressContext.jsx      # Card progress (split state/dispatch)
│   └── SettingsContext.jsx      # User preferences (split state/dispatch)
├── pages/
│   ├── DashboardPage.jsx       # Placeholder (implemented Phase 4)
│   ├── StudyPage.jsx           # Placeholder (implemented Phase 3)
│   ├── DecksPage.jsx           # Placeholder (implemented Phase 4)
│   └── SettingsPage.jsx        # Placeholder (implemented Phase 5)
├── data/                       # Phase 1 (unchanged)
├── services/                   # Phase 1 (unchanged)
├── hooks/                      # (empty until Phase 3)
├── App.jsx                     # Router config with createBrowserRouter
├── main.jsx                    # Entry point (unchanged)
└── index.css                   # Tailwind @theme tokens (may add sidebar width)
```

### Pattern 1: Split State/Dispatch Context (from FrameCoach)

**What:** Two separate contexts per domain — one for state (triggers re-renders), one for dispatch (stable reference, never triggers re-renders). Reducer is pure; persistence happens in `useEffect`.

**When to use:** Every context in this project (ProgressContext, SettingsContext).

**Example (verified from FrameCoach `src/contexts/AppContext.jsx`):**
```jsx
import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { StorageService } from '../services/StorageService.js';

const ProgressStateContext = createContext(null);
const ProgressDispatchContext = createContext(null);

const initialState = { cardProgress: {}, /* ... */ };

function progressReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...state, ...action.payload };
    case 'REVIEW_CARD':
      return {
        ...state,
        cardProgress: {
          ...state.cardProgress,
          [action.payload.cardId]: action.payload.progress,
        },
      };
    // ...
    default:
      return state;
  }
}

export function ProgressProvider({ children }) {
  const [state, dispatch] = useReducer(progressReducer, initialState);
  const initialized = useRef(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = StorageService.get('progress');
    if (saved) {
      dispatch({ type: 'LOAD', payload: saved });
    }
    initialized.current = true;
  }, []);

  // Persist on change (debounced via StorageService.set)
  useEffect(() => {
    if (!initialized.current) return;
    StorageService.set('progress', state.cardProgress);
  }, [state.cardProgress]);

  // Flush on beforeunload
  useEffect(() => {
    const handler = () => StorageService.flushAll();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  return (
    <ProgressStateContext value={state}>
      <ProgressDispatchContext value={dispatch}>
        {children}
      </ProgressDispatchContext>
    </ProgressStateContext>
  );
}

export function useProgressState() {
  const ctx = useContext(ProgressStateContext);
  if (ctx === null) throw new Error('useProgressState must be used within ProgressProvider');
  return ctx;
}

export function useProgressDispatch() {
  const ctx = useContext(ProgressDispatchContext);
  if (ctx === null) throw new Error('useProgressDispatch must be used within ProgressProvider');
  return ctx;
}
```

### Pattern 2: Layout Route with AppShell (from FrameCoach)

**What:** `createBrowserRouter` with a pathless parent route whose `Component` is `AppShell`. All page routes are children. `AppShell` renders `Sidebar` + `<Outlet />`.

**When to use:** The single router configuration in `App.jsx`.

**Example (verified from FrameCoach `src/App.jsx`):**
```jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from './contexts/index.jsx';
import AppShell from './components/layout/AppShell.jsx';

const router = createBrowserRouter([
  {
    Component: AppShell,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'study/:deckId', Component: StudyPage },
      { path: 'decks', Component: DecksPage },
      { path: 'settings', Component: SettingsPage },
    ],
  },
]);

export default function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
```

### Pattern 3: Provider Composition Wrapper (from FrameCoach)

**What:** A single `AppProviders` component that nests all context providers in order. Import once in `App.jsx`.

**When to use:** `src/contexts/index.jsx`.

**Example (verified from FrameCoach `src/contexts/index.jsx`):**
```jsx
import { ProgressProvider } from './ProgressContext.jsx';
import { SettingsProvider } from './SettingsContext.jsx';

export function AppProviders({ children }) {
  return (
    <SettingsProvider>
      <ProgressProvider>
        {children}
      </ProgressProvider>
    </SettingsProvider>
  );
}
```

**Nesting order:** SettingsProvider outermost (settings has no dependencies), ProgressProvider innermost (may read settings later for new-card limit).

### Pattern 4: ArabicText RTL Isolation Component

**What:** A reusable wrapper component that renders Arabic text with proper RTL direction, language tag, font, line-height, and unicode-bidi isolation. Prevents RTL contamination of parent layout.

**When to use:** Every instance of Arabic text rendering throughout the app.

**Example:**
```jsx
export default function ArabicText({
  children,
  className = '',
  size = 'text-2xl',
  as: Tag = 'span',
  ...props
}) {
  return (
    <Tag
      dir="rtl"
      lang="ar"
      className={`font-arabic ${size} leading-[1.8] ${className}`}
      style={{
        unicodeBidi: 'isolate',
        fontFeatureSettings: '"liga" 1, "calt" 1',
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
```

### Anti-Patterns to Avoid

- **Single context for state + dispatch:** Causes all consumers to re-render when any state changes (even dispatch-only consumers). Always split.
- **`dir="rtl"` on parent containers:** Reverses flex order, button alignment, and English text. Isolate RTL to `ArabicText` only.
- **Persisting in reducers:** Reducers must be pure functions. Persistence happens in `useEffect` hooks watching state.
- **`overflow: hidden` on Arabic text containers:** Clips diacritics (shadda+fatha stacking). Use `overflow: visible`.
- **`line-height: 1.5` or less for Arabic:** Default Tailwind line-height clips harakat at large sizes. Must be `1.8+`.
- **Missing `initialized` ref guard:** Without it, the persistence `useEffect` writes initial (empty) state to localStorage on first render, overwriting any saved data.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Routing | Custom hash router or manual history management | React Router v7 `createBrowserRouter` | Layout routes, NavLink active state, URL params |
| State persistence | Manual localStorage reads in components | Context + useEffect + StorageService | Centralized, debounced, quota-safe |
| Active nav highlighting | Manual `window.location.pathname` checks | React Router `NavLink` with `isActive` callback | Handles nested routes, end prop for index route |
| RTL text isolation | Inline `dir="rtl"` everywhere with manual style resets | ArabicText component | Consistent isolation, prevents layout bugs, reusable |

**Key insight:** Every element of Phase 2 has a direct precedent in FrameCoach. The app shell, sidebar, router config, context pattern, and provider composition are all copy-adapt patterns, not novel implementations.

## Common Pitfalls

### Pitfall 1: Harakat Clipping at Large Font Sizes
**What goes wrong:** Diacritics (fatha, kasra, damma, shadda) are clipped when Arabic text is rendered at 48-64px. Shadda+fatha stacking is especially tall.
**Why it happens:** Tailwind's default `leading-normal` (line-height ~1.5) is too tight for Arabic with diacritics. Combined with `overflow: hidden` on containers.
**How to avoid:** Set `line-height: 1.8` minimum on ArabicText component. Use `overflow: visible` on ArabicText and its parent. Test with stress string: `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ` at 64px.
**Warning signs:** Diacritics appear cut off at the top of the line, especially when shadda (ّ) and fatha (َ) stack.

### Pitfall 2: RTL Layout Contamination
**What goes wrong:** Setting `dir="rtl"` on a parent container reverses flex direction, text alignment, and child ordering for ALL children including English text and buttons.
**Why it happens:** `dir` attribute is inherited and affects the entire CSS layout context.
**How to avoid:** Apply `dir="rtl"` only to the `ArabicText` component, never to card containers or page layouts. Use `unicode-bidi: isolate` to prevent bidirectional text from affecting surrounding content.
**Warning signs:** English text appears right-aligned, rating buttons are reversed, sidebar items flow right-to-left.

### Pitfall 3: Context Hydration Race Condition
**What goes wrong:** The persistence `useEffect` fires before hydration completes, writing empty initial state to localStorage and overwriting saved data.
**Why it happens:** React runs all effects after the first render. Without a guard, the "persist on change" effect runs with initial (empty) state before the "hydrate on mount" effect has updated state.
**How to avoid:** Use `initialized` ref pattern: `const initialized = useRef(false)`. Set to `true` at end of hydration effect. Guard persistence effects with `if (!initialized.current) return`.
**Warning signs:** Progress resets to zero after page refresh. StorageService.get returns data but context shows empty state.

### Pitfall 4: NavLink Active State on Index Route
**What goes wrong:** Dashboard NavLink shows as active on ALL routes because `/` is a prefix of every path.
**Why it happens:** React Router's NavLink matches by prefix by default.
**How to avoid:** Add `end={true}` to the Dashboard NavLink (or use `end` prop). This forces exact matching for the index route.
**Warning signs:** Dashboard nav item is highlighted regardless of which page you're on.

### Pitfall 5: Sidebar Width Transition Jank
**What goes wrong:** Sidebar collapse/expand causes content area to jump or overlap during transition.
**Why it happens:** Main content area doesn't resize smoothly with sidebar width change.
**How to avoid:** Use Tailwind transition classes on sidebar width. Main content area uses `flex-1 min-w-0` to fill remaining space. Sidebar uses `shrink-0` to prevent flex compression. Define sidebar widths as @theme tokens.
**Warning signs:** Content overlaps sidebar during transition, or content reflows abruptly.

## Code Examples

Verified patterns from the FrameCoach codebase and Phase 1 services:

### AppShell Layout (adapted from FrameCoach `src/components/layout/AppShell.jsx`)
```jsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';

export default function AppShell() {
  return (
    <div className="flex h-screen bg-bg text-text overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
```

### Sidebar with Deck Progress (adapted from FrameCoach `src/components/layout/Sidebar.jsx`)
```jsx
import { NavLink } from 'react-router-dom';
import { useProgressState } from '../../contexts/ProgressContext.jsx';
import { DECKS } from '../../data/index.js';
import { DeckService } from '../../services/DeckService.js';

export default function Sidebar() {
  const { cardProgress } = useProgressState();
  // Compute deck stats for sidebar progress bars
  // NavLink items with isActive styling
  // Compact deck progress bars below nav
}
```

### ProgressContext Storage Keys
```
moses-arabic-progress  → { [cardId]: { cardId, interval, repetition, easeFactor, ... } }
moses-arabic-settings  → { studyMode: 'flip', newCardsPerSession: 50 }
```

### ArabicText with Tailwind Tokens
```jsx
// Uses the existing font-arabic token from index.css @theme
<ArabicText size="text-6xl">بِسْمِ</ArabicText>
// Renders as: <span dir="rtl" lang="ar" class="font-arabic text-6xl leading-[1.8]" style="unicode-bidi: isolate; font-feature-settings: 'liga' 1, 'calt' 1">بِسْمِ</span>
```

### Placeholder Page Pattern
```jsx
// src/pages/DashboardPage.jsx (Phase 2 placeholder)
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="text-text-muted">Coming in Phase 4</p>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<Context.Provider value={}>` | `<Context value={}>` | React 19 (2024) | Simpler JSX, no `.Provider` needed |
| `BrowserRouter` + `<Routes>` | `createBrowserRouter` + `RouterProvider` | React Router v6.4+ (2022) | Layout routes, data loading, error boundaries |
| `tailwind.config.js` | `@theme` in CSS | Tailwind v4 (2024) | CSS-first, no JS config, faster builds |
| `dark:` variants | Forced dark (body bg/text) | Project decision | No theme switching, simpler CSS |

**Deprecated/outdated:**
- `<Context.Provider>`: Still works in React 19 but `<Context value={}>` is the new syntax
- `BrowserRouter`: Still works but lacks layout routes and data API features of `createBrowserRouter`

## Open Questions

1. **Whether to install lucide-react for sidebar icons**
   - What we know: FrameCoach uses lucide-react for sidebar nav icons. Moses Arabic has a simpler sidebar (4 routes vs 6).
   - What's unclear: Whether the user wants text-only navigation or icon+text navigation in the sidebar.
   - Recommendation: Install lucide-react — sidebar icons are standard UX and the tree-shaken import is ~5KB for 4-5 icons. If the user wants text-only, skip it.

2. **Sidebar collapse behavior**
   - What we know: FrameCoach auto-collapses at 1280px with manual toggle. Moses Arabic is a personal tool likely used on a single screen.
   - What's unclear: Whether responsive collapse is needed for a personal sprint-use app.
   - Recommendation: Build a fixed sidebar (no collapse) to keep Phase 2 lean. Add responsive collapse in Phase 5 polish if needed (V2-05 requirement is explicitly deferred to v2).

3. **Study route URL structure**
   - What we know: Study needs a deck ID parameter. Options: `/study/letter-recognition` (path param) or `/study?deck=letter-recognition` (query param).
   - What's unclear: No prior decision recorded.
   - Recommendation: Use path param `/study/:deckId` — it's more RESTful, supports browser history per deck, and React Router handles it natively.

## ProgressContext Shape

Based on Phase 1 services, the ProgressContext needs to store:

```js
const initialState = {
  // Per-card SRS progress: cardId -> SrsService.createCardProgress() shape
  cardProgress: {},
  // Derived at render time (NOT stored):
  //   - deckStats (via DeckService.getDeckStats)
  //   - deckUnlocked (via DeckService.isDeckUnlocked)
  //   - stageMastery (via DeckService.getStageMastery)
};
```

**Reducer actions needed:**
- `LOAD` — Hydrate from localStorage
- `REVIEW_CARD` — Update single card progress after review
- `CLEAR_ALL` — Reset all progress (for Settings reset)

**Derived state pattern:** Deck stats, unlock status, and stage mastery are NEVER stored. They are computed from `cardProgress` using DeckService at render time. This prevents sync bugs between stored progress and stored stats.

## SettingsContext Shape

```js
const DEFAULT_SETTINGS = {
  studyMode: 'flip',         // 'flip' | 'type' | 'alternating'
  newCardsPerSession: 50,    // 10-100
};
```

**Reducer actions needed:**
- `LOAD` — Hydrate from localStorage
- `UPDATE_SETTINGS` — Merge partial settings update

## Sidebar Content

The sidebar for Moses Arabic should contain:
1. **App title** — "Moses Arabic" (or abbreviated "MA" when collapsed)
2. **Navigation links** — Dashboard (/), Study (/study), Decks (/decks), Settings (/settings)
3. **Compact deck progress** — 10 decks listed with small progress bars showing mastery %, lock icons for locked decks
4. **Stage labels** — Group decks by their 4 stages with stage color accents

The Study nav link goes to `/study` without a deck ID — it should redirect to the highest-priority deck (DASH-04 requirement) or show a deck picker. For Phase 2, it can just show a placeholder.

## Tailwind Token Additions

Phase 2 needs these @theme additions to `src/index.css`:

```css
@theme {
  /* ... existing tokens ... */
  --spacing-sidebar: 16rem;     /* 256px sidebar width */
}
```

## Sources

### Primary (HIGH confidence)
- FrameCoach Command Centre codebase (local, verified 2026-02-24) — exact patterns for AppShell, Sidebar, Router, Context split, Provider composition
- Moses Arabic Phase 1 codebase (local, verified 2026-02-24) — StorageService API, SrsService API, DeckService API, existing @theme tokens
- Phase 1 Verification Report — confirmed all services working, 734 cards, correct APIs

### Secondary (MEDIUM confidence)
- [React docs: Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context) — official recommendation for split state/dispatch pattern
- [React Router docs: createBrowserRouter](https://reactrouter.com/api/data-routers/createBrowserRouter) — layout route and Outlet API reference
- [MDN: unicode-bidi](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/unicode-bidi) — isolate value for bidirectional text
- [W3C: Arabic Layout Requirements](https://www.w3.org/International/alreq/) — Arabic script rendering requirements
- [RTL Styling 101](https://rtlstyling.com/posts/rtl-styling/) — comprehensive RTL CSS patterns

### Tertiary (LOW confidence)
- General community patterns for Arabic diacritics rendering at large sizes — line-height 1.8+ recommendation from empirical testing, not from an official spec

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all dependencies already installed, patterns verified from FrameCoach
- Architecture: HIGH — direct adaptation of FrameCoach's proven AppShell/Context patterns
- ArabicText component: HIGH — straightforward CSS properties (dir, lang, unicode-bidi, font-feature-settings), pitfalls documented
- Pitfalls: HIGH — harakat clipping and RTL contamination are well-documented; hydration race condition has proven fix (initialized ref)

**Research date:** 2026-02-24
**Valid until:** 2026-03-24 (stable — no fast-moving dependencies)
