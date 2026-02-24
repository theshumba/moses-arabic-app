# Stack Research

**Domain:** Arabic SRS flashcard learning app
**Researched:** 2026-02-24
**Confidence:** HIGH (versions verified from FrameCoach + Gogo Arabic local projects)

## Recommended Stack

| Layer | Technology | Version | Rationale | Confidence |
|-------|-----------|---------|-----------|------------|
| Framework | React | ^19.2.0 | Same as FrameCoach/Gogo Arabic. React 19 `<Context value={}>` syntax | HIGH |
| Build | Vite | ^7.2.0 | Fast dev server, Tailwind plugin support | HIGH |
| Styling | Tailwind CSS | ^4.1.0 | CSS-first `@theme` tokens, forced dark, no config file | HIGH |
| Routing | React Router DOM | ^7.13.0 | createBrowserRouter, layout routes | HIGH |
| Dates | date-fns | ^4.1.0 | Tree-shakeable, used for SRS interval calculation | HIGH |
| Font | Noto Sans Arabic | CDN (Google Fonts) | Best Arabic diacritics support at large sizes | HIGH |

## What NOT to Use

| Technology | Why Not |
|-----------|---------|
| Redux/RTK | 3 contexts with split state/dispatch is sufficient. RTK is overkill for this state shape |
| Framer Motion | CSS `transform: rotateY()` handles the one animation (card flip). 32KB+ for no value |
| ts-fsrs | SM-2 is ~50 lines of pure JS. FSRS is more complex than needed |
| Axios/React Query/SWR | No backend. All data is localStorage. No HTTP calls |
| Recharts/D3 | Progress bars and numeric stats only. No charts needed in v1 |
| Any SRS library | SM-2 is trivial to implement correctly. No external dependency justified |

## Key Findings

- All versions verified from two live local projects built Feb 2026
- SM-2 is a pure-function implementation task (~50 lines), not a library integration
- localStorage comfortably holds 800 cards of progress (~85KB estimated vs 5MB limit)
- Font loading is a one-line Google Fonts CDN link with preconnect
- Context + useReducer with split state/dispatch pattern (proven in FrameCoach)
- CSS card flip animation over Framer Motion

## Sources

- FrameCoach Command Centre (local, verified Feb 2026): React ^19.2.0, Vite ^7.2.0, Tailwind ^4.1.0
- Gogo Arabic (local, verified Feb 2026): React ^19.2.0, date-fns ^4.1.0
- npm registry (current versions consistent with local projects)

---
*Stack research for: Arabic SRS flashcard learning app*
