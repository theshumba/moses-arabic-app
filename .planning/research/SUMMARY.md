# Project Research Summary

**Project:** Arabic SRS Flashcard App
**Domain:** Spaced-repetition learning app with Arabic script support
**Researched:** 2026-02-24
**Confidence:** HIGH

## Executive Summary

Arabic SRS flashcard apps are well-understood products: the SM-2 algorithm is public domain, the card-flip interaction is universal, and the localStorage-first architecture is the correct choice for a no-backend learning tool. The recommended approach mirrors what has been proven in the FrameCoach and Gogo Arabic codebases — React 19 + Vite 7 + Tailwind v4 with split Context/useReducer state, a pure-function service layer for SRS logic, and static JSON card data. The biggest insight from feature research is that the 4-stage curriculum structure (Script, Core, Grammar, Vocab) with progressive deck unlocking is not just a nice-to-have — it is the core pedagogical value proposition that separates this tool from Anki.

The key risks are Arabic-specific and require proactive defensive coding. Harakat (diacritics) at large font sizes clip without explicit line-height tuning; answer validation for Type mode requires a multi-step normalization pipeline (NFC, strip harakat, strip tatweel, normalize hamza/alif variants) plus multiple accepted answers per card; and the SM-2 ease-factor death spiral must be corrected by allowing recovery on Good ratings. None of these risks are blocking, but all three will produce subtle bugs if not addressed at the service and component level before pages are built.

Architecture is straightforward: four layers (presentation, state, service, data), three contexts (ProgressContext, StudyContext, SettingsContext), and four services (SrsService, DeckService, StatsService, StorageService). The build order follows a strict dependency graph: data and services first, then contexts and app shell, then pages in parallel. The study queue must be ephemeral (rebuilt at session start, never persisted) to avoid stale-queue bugs. No external SRS library, no chart library, no animation library — the feature set does not justify them.

## Key Findings

### Recommended Stack

The stack is locked from two verified local projects and requires no version research. React 19 and Vite 7 are the same versions used in FrameCoach and Gogo Arabic. Tailwind v4 CSS-first `@theme` tokens with forced dark and no config file follows the established pattern. The only app-specific additions are date-fns for interval calculations and Noto Sans Arabic via Google Fonts CDN for Arabic diacritics rendering.

**Core technologies:**
- React ^19.2.0: framework — `<Context value={}>` syntax, split state/dispatch pattern
- Vite ^7.2.0: build tool — fast dev server, Tailwind plugin
- Tailwind CSS ^4.1.0: styling — CSS-first `@theme`, forced dark, no config file
- React Router DOM ^7.13.0: routing — `createBrowserRouter`, layout routes
- date-fns ^4.1.0: SRS interval arithmetic — tree-shakeable, already in Gogo Arabic
- Noto Sans Arabic (CDN): Arabic rendering — best diacritics support at 48-64px

### Expected Features

SM-2 spaced repetition, 4-button rating (Again/Hard/Good/Easy), card flip, due-card queue, localStorage persistence, and 10 decks in 4 curriculum stages are non-negotiable table stakes. The progressive deck unlock system and Arabic-specific card templates (harakat combinations, sun/moon letters, connected letter forms) are the primary differentiators. Type mode is a strong P2 addition that requires the normalization pipeline from PITFALLS.md.

**Must have (table stakes):**
- SM-2 algorithm with 4-button rating — core learning value; without it this is just random flashcards
- Card flip interaction (space/tap) with keyboard shortcuts (1-4) — universal SRS paradigm
- Due-card queue (reviews before new, session new-card limit) — prevents review debt accumulation
- 10 decks in 4 stages (Script, Core, Grammar, Vocab) — curriculum structure is the product
- Progressive deck unlock — pedagogical order enforcement; prevents overwhelm
- Large RTL Arabic text with full harakat — Noto Sans Arabic, dir="rtl", lang="ar"
- localStorage persistence with export/import — data portability, no backend
- Dark theme (#0F0F0F) — forced dark, highest contrast for Arabic script
- Deck statistics (seen/mastered/due/new) — derived, never stored
- Session completion summary — basic feedback loop

**Should have (competitive):**
- Type mode — active recall; requires normalization pipeline (NFC, strip harakat/tatweel, hamza variants)
- Harakat combination cards (28x7=196 cards, programmatic) — Arabic-specific depth
- Sun/moon letter classification cards — systematic Arabic learning
- Connected script reading cards with letter-by-letter breakdown — unique differentiator
- Sidebar with compact deck progress and lock icons — always-visible curriculum map
- "Continue Studying" CTA — one-click entry to highest-priority deck

**Defer (v2+):**
- Audio/TTS — poor Arabic TTS quality, massive complexity
- Cloud sync — no auth, no server costs justified
- Gamification (XP, levels) — optimizes engagement not learning
- Analytics graphs — insufficient data in v1; basic stats sufficient
- Offline PWA — already works offline after load; SW adds complexity

### Architecture Approach

Four-layer architecture with a strict dependency rule: presentation consumes state; state consumes services; services consume data. Services are pure functions with no side effects, making them testable without React and callable from reducers. Three contexts (ProgressContext for card progress and unlock state, StudyContext for ephemeral session state, SettingsContext for preferences) use the split state/dispatch pattern to prevent unnecessary re-renders. Study queue is rebuilt from progress data on session start rather than persisted, eliminating stale-queue bugs entirely.

**Major components:**
1. SrsService — SM-2 algorithm + queue building; pure functions, no side effects
2. DeckService — unlock logic and mastery calculation; derived state, never stored
3. StorageService — only module touching localStorage; debounced writes, QuotaExceededError handling
4. ProgressContext — card progress and deck unlocks; split state/dispatch, persistent
5. StudyContext — active session queue and current card; ephemeral, not persisted
6. FlipCard + TypeCard — study interaction components; share RatingButtons
7. ArabicText — RTL isolation component; `dir="rtl"` + `lang="ar"` + `unicode-bidi: isolate`

### Critical Pitfalls

1. **SM-2 ease-factor death spiral** — Good rating must increase EF slightly (+0.05) when EF < 2.5; cards at EF floor after 10+ reviews should be flagged as leeches. Verify: 10 Hard then 10 Good results in EF recovery above 1.5.
2. **Harakat clipping at large sizes** — Set `line-height: 1.8-2.0` and `overflow: visible` on all Arabic text containers. Test with shadda+fatha stress string at 64px before shipping ArabicText component.
3. **Type mode answer validation failures** — Normalization pipeline required: NFC normalize -> strip harakat (U+064B-U+065E) -> strip tatweel (U+0640) -> normalize hamza variants -> normalize alif maqsura -> case-insensitive trim. Provide 3-5 accepted answers per card.
4. **RTL layout contamination** — Isolate `dir="rtl"` to ArabicText component only; card container stays LTR. English UI elements reverse flex order when RTL propagates to parent.
5. **Again rating infinite loops** — Cap re-shows at 3 per session, interleave 2-5 other cards between re-shows, show session progress counter so user isn't trapped.

## Implications for Roadmap

Based on the dependency graph in ARCHITECTURE.md and the pitfall map in PITFALLS.md, the recommended phase structure is:

### Phase 1: Foundation + Service Layer
**Rationale:** Services (SrsService, DeckService, StorageService) are the deepest dependency — everything else consumes them. Building them first with correct SM-2 implementation and normalization pipeline prevents pitfalls from reaching page-level code. All three services are pure-function implementations with no React dependency.
**Delivers:** Working SM-2 algorithm, card data structure, normalization utilities, localStorage abstraction
**Addresses:** SM-2 (table stakes), data persistence (table stakes)
**Avoids:** EF death spiral (Pitfall 1), Again loops (Pitfall 6), localStorage quota (Pitfall 5), tatweel in type mode (Pitfall 3)

### Phase 2: App Shell + Contexts
**Rationale:** Contexts consume services and must exist before pages. App shell (sidebar, router, layout, dark theme) has no page dependencies and can parallel with context work in the same phase.
**Delivers:** Routing skeleton, sidebar with deck list, ProgressContext, StudyContext, SettingsContext, Tailwind design system
**Uses:** React 19, Vite 7, Tailwind v4, React Router v7, StorageService
**Implements:** Split state/dispatch pattern, layout routes

### Phase 3: Study Flow (Core Loop)
**Rationale:** The study interaction is the primary user value — everything else is support infrastructure. FlipCard, RatingButtons, session queue management, and SessionComplete must be solid before building dashboard or deck browser.
**Delivers:** End-to-end study session: FlipCard -> rate (1-4, keyboard) -> next card -> SessionComplete with summary
**Addresses:** Card flip (table stakes), keyboard shortcuts (table stakes), session limit (table stakes)
**Avoids:** RTL contamination (Pitfall 7), harakat clipping (Pitfall 2)

### Phase 4: Dashboard + Deck Browser
**Rationale:** Dashboard and Decks page are independent of each other and can develop in parallel after the study loop is complete. Progressive unlock display and "Continue Studying" CTA require ProgressContext to be populated (Phase 2).
**Delivers:** Dashboard with due counts and streak, Decks page with progressive unlock gates and lock icons, deck statistics
**Addresses:** Progressive unlock (differentiator), sidebar deck progress (differentiator), "Continue Studying" CTA (differentiator)

### Phase 5: Type Mode + Settings + Polish
**Rationale:** Type mode builds on FlipCard patterns (same rating buttons, same session queue) but adds the normalization pipeline. Settings and data export/import round out the product. Polish (transitions, empty states, "All caught up!" screen) closes gaps.
**Delivers:** TypeCard with answer validation, Settings page with mode toggle and new-card limit, JSON export/import, all empty states handled
**Addresses:** Type mode (P2), alternating mode (P2), data portability (table stakes)
**Avoids:** Validation failures (Pitfall 4) via normalization pipeline

### Phase Ordering Rationale

- Services before contexts before pages is enforced by the import dependency graph — no shortcuts possible without architectural debt.
- Study loop before dashboard because the dashboard only displays value if the user has reviewed cards; building it first produces an empty-state-only experience with no way to demo value.
- Type mode deferred to Phase 5 because it requires a working FlipCard (Phase 3) as the foundation and the normalization pipeline as a prerequisite — both are prerequisite work.
- Progressive unlock implemented in Phase 4 (Decks page) not Phase 1 because unlock logic lives in DeckService (Phase 1) and is consumed by the Decks page; the service layer ships the logic, the page ships the UI.

### Research Flags

Phases with standard patterns (skip research-phase):
- **Phase 1:** SM-2 algorithm is public domain and fully specified; normalization pipeline is established practice for Arabic NLP
- **Phase 2:** Proven patterns from FrameCoach and Gogo Arabic; no novel integration
- **Phase 3:** Standard card-flip interaction; CSS rotateY animation is well-documented
- **Phase 4:** Standard dashboard/list patterns; no novel UI patterns
- **Phase 5:** Type mode validation pipeline is specified in PITFALLS.md; no new research needed

No phases require `/gsd:research-phase` — the research files contain sufficient detail for all implementation decisions.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versions verified from two local production projects (FrameCoach, Gogo Arabic) built Feb 2026 |
| Features | HIGH | SM-2 and Anki paradigm are well-documented; curriculum structure is a product decision, not a research question |
| Architecture | HIGH | Four-layer pattern with split contexts is proven in FrameCoach; service layer pattern is textbook React architecture |
| Pitfalls | MEDIUM-HIGH | Arabic rendering pitfalls are well-documented; SM-2 edge cases (EF floor, Again loops) are confirmed by Anki community; type mode normalization is derived from Arabic NLP practice |

**Overall confidence:** HIGH

### Gaps to Address

- **Card content authoring:** FEATURES.md specifies 10 decks and card types but the actual card data (IDs, front/back text, accepted answers) must be authored during Phase 1. This is the largest unknown — quality of learning depends on card quality. Plan for this as a significant Phase 1 deliverable.
- **Type mode accepted answers per card:** PITFALLS.md recommends 3-5 accepted answers per card for Type mode. These must be explicitly authored into the data layer; they cannot be generated algorithmically for transliteration edge cases.
- **SM-2 learning steps:** PITFALLS.md references a 1min -> 10min -> 1day graduation pattern. The exact step boundaries need a concrete implementation decision before SrsService is coded.
- **Deck unlock prerequisites:** The dependency graph for progressive unlock (which deck unlocks which) must be specified in the data layer. This is a curriculum design decision, not a technical one.

## Sources

### Primary (HIGH confidence)
- FrameCoach Command Centre local project (Feb 2026) — React 19.2.0, Vite 7.2.0, Tailwind 4.1.0, React Router 7.13.0, StorageService pattern, split context pattern
- Gogo Arabic local project (Feb 2026) — React 19.2.0, date-fns 4.1.0, Arabic rendering patterns, tatweel handling
- SM-2 algorithm specification (P.A. Wozniak, 1987) — EF formula, interval calculation, ease-factor bounds

### Secondary (MEDIUM confidence)
- Anki community documentation — 4-button rating paradigm, Again loop behavior, leech threshold practices
- Arabic Unicode Consortium documentation — harakat codepoint ranges (U+064B-U+065E), tatweel (U+0640), hamza variant normalization
- Arabic NLP community practice — NFC normalization pipeline order, alif maqsura/ya normalization

### Tertiary (LOW confidence)
- General Arabic pedagogy sources — 4-stage curriculum order (Script -> Core -> Grammar -> Vocab); validated by common language-learning sequences but not formally cited

---
*Research completed: 2026-02-24*
*Ready for roadmap: yes*
