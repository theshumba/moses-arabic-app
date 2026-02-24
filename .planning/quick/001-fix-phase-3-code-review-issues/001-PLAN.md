---
phase: quick-001
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/hooks/useStudySession.js
  - src/pages/StudyPage.jsx
  - src/components/study/FlashCard.jsx
  - src/components/study/RatingButtons.jsx
  - src/components/study/SessionComplete.jsx
autonomous: true

must_haves:
  truths:
    - "Unmount cleanup uses current cardsCompleted value, not stale closure"
    - "Navigating between decks resets study session state completely"
    - "FlashCard has aria-label for screen readers"
    - "Rating buttons cannot trigger form submission"
    - "Duration display handles fractional seconds"
    - "totalCards is derived from queue ref, not separate state"
  artifacts:
    - path: "src/hooks/useStudySession.js"
      provides: "Study session hook with cardsCompletedRef, derived totalCards"
      contains: "cardsCompletedRef"
    - path: "src/pages/StudyPage.jsx"
      provides: "StudyPage with key={deckId} on StudyFlow"
      contains: "key={deckId}"
    - path: "src/components/study/FlashCard.jsx"
      provides: "Accessible flashcard with aria-label"
      contains: "aria-label"
    - path: "src/components/study/RatingButtons.jsx"
      provides: "Rating buttons with explicit type"
      contains: 'type="button"'
    - path: "src/components/study/SessionComplete.jsx"
      provides: "Session complete with defensive Math.round"
      contains: "Math.round"
  key_links:
    - from: "src/hooks/useStudySession.js"
      to: "cleanup effect"
      via: "cardsCompletedRef.current"
      pattern: "cardsCompletedRef\\.current"
---

<objective>
Fix 7 code review issues from Phase 3 study flow: 2 important bugs (stale closure in unmount cleanup, missing key on StudyFlow) and 5 suggestions (aria-label, type="button", Math.round, null-check warning, derived totalCards).

Purpose: Eliminate potential bugs and improve accessibility/robustness before moving to Phase 4.
Output: 5 files patched, build clean.
</objective>

<execution_context>
@/Users/theshumba/.claude/get-shit-done/workflows/execute-plan.md
@/Users/theshumba/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/hooks/useStudySession.js
@src/pages/StudyPage.jsx
@src/components/study/FlashCard.jsx
@src/components/study/RatingButtons.jsx
@src/components/study/SessionComplete.jsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix useStudySession bugs and improvements</name>
  <files>src/hooks/useStudySession.js</files>
  <action>
  Three changes to useStudySession.js:

  **1. Fix stale cardsCompleted in unmount cleanup (IMPORTANT)**
  Add a `cardsCompletedRef` that stays in sync with `cardsCompleted` state, using the same pattern as `ratingsBreakdownRef`. This fixes the closure bug where the cleanup effect captures cardsCompleted=0 from mount time.

  - Add `const cardsCompletedRef = useRef(0);` alongside the other refs (line ~61 area)
  - After each `setCardsCompleted` call, also update the ref: `cardsCompletedRef.current = prev + 1` -- actually, simpler: sync the ref after state, same as cardProgressRef pattern. Add `cardsCompletedRef.current = cardsCompleted;` as a line after the ref declaration (it runs every render, keeping ref in sync). BUT this has the same +1 issue. Better approach: update cardsCompletedRef.current inside the setCardsCompleted updater or right after the increment. Cleanest: just keep a ref that increments alongside state.

  Concrete implementation:
  - Declare `const cardsCompletedRef = useRef(0);` with the other refs
  - In `rate()`, where `setCardsCompleted((prev) => prev + 1)` is called, add `cardsCompletedRef.current += 1;` immediately after
  - In the cleanup effect (lines 97-108), replace `cardsCompleted` with `cardsCompletedRef.current`
  - This removes `cardsCompleted` from the cleanup closure entirely

  **2. Add defensive warning on StatsService.endSession null result**
  In the cleanup effect, after `StatsService.endSession(...)` call, the result is discarded. Add a `const result = StatsService.endSession(...)` and if `!result`, log `console.warn('StatsService.endSession returned null during cleanup')`.

  In the `rate()` completion path (line ~188), the `result ?` ternary already guards. Add a similar warning: if `!result`, `console.warn('StatsService.endSession returned null')`.

  **3. Derive totalCards from queueRef instead of separate state**
  - Remove `const [totalCards, setTotalCards] = useState(0);` entirely
  - Add a derived value: `const totalCards = queueRef.current.length;` right after `const queue = queueRef.current;` (line ~111 area)
  - Remove `setTotalCards(queue.length);` from the initialization effect (line ~80)
  - Remove `setTotalCards(queueRef.current.length);` from the Again re-show handler (line ~175)
  - This works because queueRef.current.length is read fresh on every render. The queue mutation (splice) already triggers a re-render via setCardsCompleted or setCurrentIndex.
  </action>
  <verify>
  Run `npx vite build` from project root -- build must succeed with no errors. Grep for `cardsCompletedRef` in the file to confirm it exists. Grep to confirm `setTotalCards` no longer exists.
  </verify>
  <done>
  - cardsCompletedRef used in cleanup effect instead of stale cardsCompleted closure
  - totalCards derived from queueRef.current.length, no separate state
  - StatsService.endSession null results produce console.warn
  </done>
</task>

<task type="auto">
  <name>Task 2: Fix StudyPage key prop and UI component improvements</name>
  <files>
    src/pages/StudyPage.jsx
    src/components/study/FlashCard.jsx
    src/components/study/RatingButtons.jsx
    src/components/study/SessionComplete.jsx
  </files>
  <action>
  Four changes across 4 files:

  **1. Add key={deckId} to StudyFlow (StudyPage.jsx, IMPORTANT)**
  On line 73, change:
  `return <StudyFlow deck={deck} deckId={deckId} navigate={navigate} />;`
  to:
  `return <StudyFlow key={deckId} deck={deck} deckId={deckId} navigate={navigate} />;`

  This forces React to remount StudyFlow when navigating between decks, preventing stale hook state from carrying over.

  **2. Add aria-label to FlashCard (FlashCard.jsx)**
  On the outer `<div>` element (line 8), add `aria-label="Flip card"` when `!isFlipped`. The existing `role="button"` is already conditional on `!isFlipped`. Add alongside it:
  `aria-label={!isFlipped ? 'Flip card' : undefined}`

  Place it after the existing `role={!isFlipped ? 'button' : undefined}` line.

  **3. Add type="button" to rating buttons (RatingButtons.jsx)**
  On the `<button>` element (line 36), add `type="button"` as the first attribute. This prevents default form submission behavior if RatingButtons is ever used inside a form.

  **4. Add Math.round in formatDuration (SessionComplete.jsx)**
  Change the formatDuration function to handle fractional seconds:
  ```
  function formatDuration(seconds) {
    const total = Math.round(seconds);
    const m = Math.floor(total / 60);
    const s = total % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
  }
  ```
  </action>
  <verify>
  Run `npx vite build` from project root -- build must succeed with no errors. Grep for `key={deckId}` in StudyPage.jsx. Grep for `aria-label` in FlashCard.jsx. Grep for `type="button"` in RatingButtons.jsx. Grep for `Math.round` in SessionComplete.jsx.
  </verify>
  <done>
  - StudyFlow receives key={deckId} forcing remount on deck navigation
  - FlashCard has aria-label="Flip card" when interactive
  - Rating buttons have explicit type="button"
  - formatDuration defensively rounds fractional seconds
  </done>
</task>

</tasks>

<verification>
1. `npx vite build` completes with no errors, bundle size within ~5KB of current 443KB
2. All 7 code review issues addressed:
   - [x] Stale cardsCompleted in unmount cleanup (cardsCompletedRef)
   - [x] Missing key={deckId} on StudyFlow
   - [x] Defensive warning on StatsService.endSession null
   - [x] aria-label on FlashCard
   - [x] type="button" on rating buttons
   - [x] Math.round in formatDuration
   - [x] Derive totalCards from queueRef
</verification>

<success_criteria>
- Build clean (no errors, no new warnings)
- All 7 issues resolved in 5 files
- No behavioral regressions (same public API from useStudySession)
</success_criteria>

<output>
After completion, create `.planning/quick/001-fix-phase-3-code-review-issues/001-SUMMARY.md`
</output>
