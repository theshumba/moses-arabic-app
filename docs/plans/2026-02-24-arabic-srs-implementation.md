# Arabic SRS App — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a React SRS flashcard app for learning Arabic letters, forms, harakat, grammar, and vocabulary in a 7-day intensive sprint.

**Architecture:** Single-page React app with localStorage persistence. SM-2 spaced repetition algorithm. 10 decks unlocked progressively. Data seeded from Gogo Arabic project files + curated uni material.

**Tech Stack:** React 19, Vite 7, Tailwind CSS v4, React Router v7, localStorage, Noto Sans Arabic font

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `vite.config.js`, `index.html`, `tailwind.css`, `src/main.jsx`, `src/App.jsx`

**Step 1: Initialize Vite + React project**

```bash
cd /Users/theshumba/Documents/GitHub/arabic-srs
npm create vite@latest . -- --template react
npm install
npm install react-router-dom date-fns
npm install -D tailwindcss @tailwindcss/vite
```

**Step 2: Configure Tailwind v4 CSS-first**

Replace `src/index.css` with:
```css
@import "tailwindcss";

@theme {
  --color-bg: #0F0F0F;
  --color-surface: #1A1A1A;
  --color-surface-2: #242424;
  --color-border: #2A2A2A;
  --color-text: #F5F5F5;
  --color-text-muted: #A0A0A0;
  --color-stage-script: #3B82F6;
  --color-stage-core: #22C55E;
  --color-stage-grammar: #F59E0B;
  --color-stage-vocab: #A855F7;
  --color-again: #EF4444;
  --color-hard: #F97316;
  --color-good: #22C55E;
  --color-easy: #3B82F6;
  --font-arabic: 'Noto Sans Arabic', 'Arial', sans-serif;
}
```

**Step 3: Configure Vite**

Update `vite.config.js`:
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

**Step 4: Set up index.html with Arabic font**

Add to `<head>` in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
```

**Step 5: Create minimal App.jsx with dark background**

```jsx
export default function App() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <h1 className="text-2xl p-8">Arabic SRS</h1>
    </div>
  )
}
```

**Step 6: Verify dev server runs**

```bash
npm run dev
```
Expected: App renders with dark background at localhost:5173

**Step 7: Create .gitignore and commit**

```bash
echo "node_modules\ndist\n.DS_Store" > .gitignore
git add -A && git commit -m "feat: scaffold Vite + React 19 + Tailwind v4 project"
```

---

## Task 2: Data Layer — Copy & Generate Card Data

**Files:**
- Create: `src/data/alphabet.json` (copy from Gogo Arabic)
- Create: `src/data/vocabulary.json` (copy from Gogo Arabic)
- Create: `src/data/cards.js` (card generator)
- Create: `src/data/uniVocab.js` (curated uni vocabulary)
- Create: `src/data/grammarCards.js` (grammar flashcards)
- Create: `src/data/numberCards.js` (numbers 1-10)
- Create: `src/data/readingCards.js` (connected reading + sentences)

**Step 1: Copy Gogo Arabic data files**

```bash
cp /Users/theshumba/Documents/GitHub/gogo-arabic/src/data/alphabet.json src/data/
cp /Users/theshumba/Documents/GitHub/gogo-arabic/src/data/vocabulary.json src/data/
```

**Step 2: Create `src/data/numberCards.js`**

```js
export const numberCards = [
  { id: 'num-1', arabic: '١', word: 'واحِد', english: 'one', transliteration: 'waahid' },
  { id: 'num-2', arabic: '٢', word: 'اِثنان', english: 'two', transliteration: 'ithnaan' },
  { id: 'num-3', arabic: '٣', word: 'ثَلاثة', english: 'three', transliteration: 'thalaatha' },
  { id: 'num-4', arabic: '٤', word: 'أَربَعة', english: 'four', transliteration: "arba'a" },
  { id: 'num-5', arabic: '٥', word: 'خَمسة', english: 'five', transliteration: 'khamsa' },
  { id: 'num-6', arabic: '٦', word: 'سِتّة', english: 'six', transliteration: 'sitta' },
  { id: 'num-7', arabic: '٧', word: 'سَبعة', english: 'seven', transliteration: "sab'a" },
  { id: 'num-8', arabic: '٨', word: 'ثَمانية', english: 'eight', transliteration: 'thamaaniya' },
  { id: 'num-9', arabic: '٩', word: 'تِسعة', english: 'nine', transliteration: "tis'a" },
  { id: 'num-10', arabic: '١٠', word: 'عَشَرة', english: 'ten', transliteration: "'ashara" },
]
```

**Step 3: Create `src/data/uniVocab.js`**

Curate ~90 vocabulary items from the Westminster materials covering: family terms, professions, countries, nationalities, adjectives, prepositions, adverbs, common verbs. Each entry:
```js
{ id, arabic, english, transliteration, category }
```

Categories: `family`, `professions`, `countries`, `nationalities`, `adjectives`, `prepositions`, `adverbs`, `verbs`, `nouns`

Key words to include (from extracted PDFs):
- Family: أب، أم، أخ، أخت، ابن، بنت، والد، والدة، زوج، زوجة، عم، عمة، خال، خالة، جد، جدة
- Professions: طبيب، مهندس، أستاذ، مدرّس، مترجم، موظف، ممرضة، محاسب، ربّة منزل
- Countries: مصر، سوريا، لبنان، الأردن، العراق، فلسطين، السعودية، المغرب، الجزائر، تونس، ليبيا، اليمن، قطر، الإمارات، الكويت، البحرين، بريطانيا، فرنسا، أمريكا، روسيا
- Adjectives: كبير، صغير، جميل، قديم، جديد، طويل، قصير، سمين، سعيد، مريح
- Common nouns: بيت، مدينة، جامعة، مدرسة، شركة، مكتب، منطقة، شقة، سيارة، كتاب
- Verbs: يسكن، يعمل، يدرس، يذهب، يقرأ، يكتب، يتكلّم، يشاهد، يسافر، يطبخ، يأكل، يشرب، يزور
- Prepositions: في، من، إلى، مع، عن، على
- Adverbs: دائماً، عادةً، أحياناً، نادراً، أبداً، كلّ يوم

**Step 4: Create `src/data/grammarCards.js`**

~80 cards covering:
- 8 personal pronouns (أنا، أنتَ، أنتِ، هو، هي، نحن، أنتم، هم)
- Present tense conjugation of 8 common verbs (سكن، عمل، درس، ذهب، قرأ، كتب، شرب، أكل) × 8 pronouns = 64 conjugation cards
- 7 possessive suffix cards (ي، كَ، كِ، ه، ها، نا، هم)
- Masculine/feminine pairs (8 cards)
- Demonstratives (هذا/هذه — 4 cards)

Each card: `{ id, type, front: { text, hint }, back: { text, detail } }`

**Step 5: Create `src/data/readingCards.js`**

~50 connected-word cards + ~30 sentence cards. Connected words show a common Arabic word on front, letter-by-letter breakdown + meaning on back.

**Step 6: Create `src/data/cards.js` — Card Generator**

This module imports all data sources and generates the full card set for all 10 decks:

```js
import alphabetData from './alphabet.json'
import vocabData from './vocabulary.json'
import { numberCards } from './numberCards'
import { uniVocab } from './uniVocab'
import { grammarCards } from './grammarCards'
import { readingCards } from './readingCards'

export const DECKS = [
  { id: 'letter-recognition', name: 'Letter Recognition', stage: 1, ... },
  { id: 'letter-forms', name: 'Letter Forms', stage: 1, ... },
  { id: 'harakat', name: 'Harakat & Diacritics', stage: 1, ... },
  { id: 'sun-moon', name: 'Sun & Moon Letters', stage: 1, ... },
  { id: 'numbers', name: 'Numbers 1-10', stage: 2, ... },
  { id: 'uni-vocab', name: 'Uni Arabic Vocabulary', stage: 2, ... },
  { id: 'grammar', name: 'Grammar Patterns', stage: 3, ... },
  { id: 'common-words', name: '250 Common Words', stage: 4, ... },
  { id: 'connected-reading', name: 'Connected Reading', stage: 4, ... },
  { id: 'reading-practice', name: 'Reading Practice', stage: 4, ... },
]

export function generateDeckCards(deckId) { ... }
```

Each generated card has shape:
```js
{
  id: string,
  deckId: string,
  front: { primary: string, secondary?: string, hint?: string },
  back: { primary: string, secondary?: string, detail?: string },
  typeAnswer: { prompt: string, acceptedAnswers: string[] },
}
```

**Step 7: Commit**

```bash
git add src/data/ && git commit -m "feat: add all card data (alphabet, vocab, grammar, numbers, reading)"
```

---

## Task 3: Storage & SRS Services

**Files:**
- Create: `src/services/StorageService.js`
- Create: `src/services/SrsService.js`
- Create: `src/services/DeckService.js`
- Create: `src/services/StatsService.js`

**Step 1: Create StorageService**

localStorage wrapper with debounced writes and JSON serialization:
```js
const STORAGE_PREFIX = 'arabic-srs-'
export const StorageService = {
  get(key) { ... },      // parse JSON from localStorage
  set(key, value) { ... }, // debounced JSON.stringify + save
  remove(key) { ... },
  exportAll() { ... },    // returns all arabic-srs-* keys as JSON blob
  importAll(data) { ... }, // validates + replaces all data
  clear() { ... },
}
```

**Step 2: Create SrsService — SM-2 Algorithm**

```js
export const SrsService = {
  createCardProgress(cardId) {
    return { cardId, interval: 0, repetition: 0, easeFactor: 2.5, nextReview: null, lapses: 0, totalReviews: 0 }
  },

  reviewCard(progress, rating) {
    // rating: 1=Again, 2=Hard, 3=Good, 4=Easy
    // Returns updated progress object (immutable)
    // Implements SM-2: adjusts interval, easeFactor, repetition, nextReview
  },

  getDueCards(allProgress, deckCardIds) {
    // Returns cards due for review (nextReview <= now) sorted by priority
    // New cards (no progress) are also included up to the session limit
  },

  getNewCards(allProgress, deckCardIds, limit) {
    // Returns cards never seen before, up to limit
  },

  buildStudyQueue(allProgress, deckCardIds, { newLimit = 50 }) {
    // Combines due reviews + new cards into ordered queue
    // Reviews first, then new cards
  },
}
```

**Step 3: Create DeckService — Unlock Logic**

```js
import { DECKS } from '../data/cards'

export const DeckService = {
  getDeckStats(deckId, allProgress, deckCardIds) {
    // Returns: { total, seen, mastered, due, new, masteryPercent }
  },

  isDeckUnlocked(deckId, allProgress, allDecks) {
    // Implements unlock prerequisites from design doc
  },

  getStageMastery(stage, allProgress, allDecks) {
    // Returns aggregate mastery % for a stage (1-4)
  },
}
```

**Step 4: Create StatsService — Time & Streak Tracking**

```js
export const StatsService = {
  startSession() { ... },       // records session start time
  endSession(cardsReviewed) { ... }, // saves session duration + count
  getTodayStats() { ... },       // total time, cards reviewed today
  getStreak() { ... },           // consecutive days with >= 1 review
  getAllTimeStats() { ... },     // total reviews, total time, avg per day
}
```

**Step 5: Commit**

```bash
git add src/services/ && git commit -m "feat: add SRS, Storage, Deck, and Stats services"
```

---

## Task 4: React Context — Progress & Settings

**Files:**
- Create: `src/context/ProgressContext.jsx`
- Create: `src/context/SettingsContext.jsx`

**Step 1: Create ProgressContext**

Manages all card progress state + deck unlock states. Uses reducer pattern (same as FrameCoach ContactsContext):

```jsx
const ProgressContext = createContext()
const ProgressDispatchContext = createContext()

// Actions: REVIEW_CARD, RESET_DECK, RESET_ALL, IMPORT_PROGRESS
function progressReducer(state, action) { ... }

export function ProgressProvider({ children }) {
  // Load from localStorage on mount
  // Persist to localStorage on every dispatch (debounced via StorageService)
}

export function useProgress() { return useContext(ProgressContext) }
export function useProgressDispatch() { return useContext(ProgressDispatchContext) }
```

**Step 2: Create SettingsContext**

```jsx
// Settings: studyMode ('flip'|'type'|'alternating'), newCardsPerSession (number), theme preferences
export function SettingsProvider({ children }) { ... }
export function useSettings() { ... }
export function useSettingsDispatch() { ... }
```

**Step 3: Commit**

```bash
git add src/context/ && git commit -m "feat: add Progress and Settings contexts with localStorage persistence"
```

---

## Task 5: UI Components — Primitives

**Files:**
- Create: `src/components/Button.jsx`
- Create: `src/components/ProgressBar.jsx`
- Create: `src/components/Badge.jsx`
- Create: `src/components/ArabicText.jsx`
- Create: `src/components/Card.jsx`

**Step 1: Create Button component**

```jsx
// variant: 'primary' | 'secondary' | 'ghost' | 'again' | 'hard' | 'good' | 'easy'
// size: 'sm' | 'md' | 'lg'
export default function Button({ variant = 'primary', size = 'md', children, ...props }) { ... }
```

**Step 2: Create ProgressBar**

```jsx
// value: 0-100, color: stage color or custom
export default function ProgressBar({ value, color, label }) { ... }
```

**Step 3: Create Badge**

```jsx
// For deck stage labels, card count badges
export default function Badge({ children, color }) { ... }
```

**Step 4: Create ArabicText**

```jsx
// Renders Arabic text with proper RTL, large font, Noto Sans Arabic
// size: 'sm' | 'md' | 'lg' | 'xl' (xl = 64px for flashcard display)
export default function ArabicText({ children, size = 'md' }) {
  return <span dir="rtl" lang="ar" className={`font-arabic ${sizeClasses[size]}`}>{children}</span>
}
```

**Step 5: Create Card (visual card container)**

```jsx
// Flip animation container for flashcards
export default function Card({ front, back, isFlipped, onFlip }) { ... }
```

**Step 6: Commit**

```bash
git add src/components/ && git commit -m "feat: add UI primitives (Button, ProgressBar, Badge, ArabicText, Card)"
```

---

## Task 6: App Shell — Layout, Router, Sidebar

**Files:**
- Create: `src/components/Layout.jsx`
- Create: `src/components/Sidebar.jsx`
- Create: `src/pages/DashboardPage.jsx` (placeholder)
- Create: `src/pages/StudyPage.jsx` (placeholder)
- Create: `src/pages/DecksPage.jsx` (placeholder)
- Create: `src/pages/SettingsPage.jsx` (placeholder)
- Modify: `src/App.jsx`

**Step 1: Create Layout with Sidebar**

```jsx
export default function Layout() {
  return (
    <div className="flex min-h-screen bg-bg text-text">
      <Sidebar />
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
```

**Step 2: Create Sidebar**

Shows: app name, 4 nav links (Dashboard, Study, Decks, Settings), compact deck progress bars.

**Step 3: Create placeholder pages**

Each returns a simple heading.

**Step 4: Wire up React Router in App.jsx**

```jsx
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'study/:deckId?', element: <StudyPage /> },
      { path: 'decks', element: <DecksPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
```

**Step 5: Wrap with providers in main.jsx**

```jsx
<ProgressProvider>
  <SettingsProvider>
    <RouterProvider router={router} />
  </SettingsProvider>
</ProgressProvider>
```

**Step 6: Verify navigation works, commit**

```bash
git add -A && git commit -m "feat: add app shell with layout, sidebar, router, placeholder pages"
```

---

## Task 7: Study View — FlipCard & TypeCard

**Files:**
- Create: `src/components/FlipCard.jsx`
- Create: `src/components/TypeCard.jsx`
- Create: `src/components/RatingButtons.jsx`
- Create: `src/components/SessionComplete.jsx`
- Modify: `src/pages/StudyPage.jsx`

**Step 1: Create FlipCard**

Full-screen card. Shows front (large Arabic text + hint). Space/click to flip. Back shows answer + detail. Then rating buttons appear.

**Step 2: Create TypeCard**

Shows prompt. Text input for answer. Enter to submit. Shows correct/incorrect feedback. Then rating buttons.

Accept multiple valid answers (e.g., transliteration variants). Case-insensitive comparison. Strip diacritics for comparison if needed.

**Step 3: Create RatingButtons**

4 buttons: Again (1), Hard (2), Good (3), Easy (4). Keyboard shortcuts 1-4. Color-coded (red/orange/green/blue).

**Step 4: Create SessionComplete**

Summary screen after all cards reviewed: cards done, accuracy (% rated Good+), time taken, "Continue" or "Back to Dashboard" buttons.

**Step 5: Implement StudyPage**

```jsx
export default function StudyPage() {
  const { deckId } = useParams()
  // 1. Build study queue via SrsService.buildStudyQueue()
  // 2. Track current card index
  // 3. Render FlipCard or TypeCard based on settings
  // 4. On rating: dispatch REVIEW_CARD, advance to next card
  // 5. When queue empty: show SessionComplete
  // Keyboard: Space=flip, 1-4=rate, Enter=submit, Escape=exit
}
```

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add study view with FlipCard, TypeCard, rating, and session flow"
```

---

## Task 8: Dashboard Page

**Files:**
- Modify: `src/pages/DashboardPage.jsx`

**Step 1: Implement Dashboard**

Sections:
1. **Hero stats row:** Cards due today | Mastery % | Time studied today | Streak
2. **Stage progress:** 4 horizontal stage bars (Script / Core / Grammar / Vocab) with % mastery
3. **Deck grid:** 10 deck cards showing: name, stage badge, mastered/total, due count, "Study" button (or lock icon if locked)
4. **"Continue Studying" CTA:** Big button that navigates to `/study/{highest-priority-deck-with-due-cards}`

Uses `useProgress()` + `DeckService` + `StatsService` to compute all data.

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add dashboard with stats, stage progress, and deck grid"
```

---

## Task 9: Decks Page

**Files:**
- Modify: `src/pages/DecksPage.jsx`

**Step 1: Implement DecksPage**

List/grid of all 10 decks. Each deck card shows:
- Name + stage color badge
- Total cards / Mastered / Due / New
- Mastery progress bar
- Lock state with unlock requirement text
- "Study" button → navigates to `/study/{deckId}`

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add decks browser page with stats and unlock indicators"
```

---

## Task 10: Settings Page

**Files:**
- Modify: `src/pages/SettingsPage.jsx`

**Step 1: Implement SettingsPage**

Sections:
1. **Study preferences:** Study mode toggle (Flip / Type / Alternating), new cards per session slider (10-100, default 50)
2. **Data management:** Export progress (JSON download), Import progress (file upload), Reset all progress (with confirmation)

**Step 2: Commit**

```bash
git add -A && git commit -m "feat: add settings page with preferences and data management"
```

---

## Task 11: Keyboard Shortcuts & Polish

**Files:**
- Create: `src/hooks/useKeyboardShortcuts.js`
- Modify: various components for polish

**Step 1: Create useKeyboardShortcuts hook**

Global keyboard handler:
- `Space` — flip card (study view)
- `1/2/3/4` — rate card (study view, only when flipped)
- `Enter` — submit typed answer (study view)
- `Escape` — exit study session → dashboard

Guard against firing when typing in input fields.

**Step 2: Polish pass**

- Add CSS transitions for card flip animation (transform: rotateY)
- Add hover states on all interactive elements
- Ensure Arabic text is always large and crisp
- Add loading states for initial data parse
- Responsive: sidebar collapses on small screens

**Step 3: Commit**

```bash
git add -A && git commit -m "feat: add keyboard shortcuts and UI polish"
```

---

## Task 12: Integration Test & Final Verification

**Step 1: Verify full flow**

1. `npm run dev` — app loads with dark theme
2. Dashboard shows all stats at zero, Deck 1 unlocked, rest locked
3. Click "Study" on Deck 1 → study view with 28 letter cards
4. Complete a session with ratings → progress persists on refresh
5. After seeing 80% of Deck 1 → Deck 2 unlocks
6. Settings export/import works
7. All keyboard shortcuts work
8. Arabic text renders correctly with RTL

**Step 2: Build check**

```bash
npm run build
```
Expected: Clean build, no warnings.

**Step 3: Final commit**

```bash
git add -A && git commit -m "feat: integration verification and build check"
```

---

## Parallelization Map

Tasks that can run in parallel (after Task 1 completes):

**Wave 1 (after Task 1):**
- Task 2: Data Layer (independent)
- Task 3: Services (independent)
- Task 5: UI Primitives (independent)

**Wave 2 (after Wave 1):**
- Task 4: Context (needs Task 3)
- Task 6: App Shell (needs Task 5)

**Wave 3 (after Wave 2):**
- Task 7: Study View (needs Tasks 4, 5, 6)
- Task 8: Dashboard (needs Tasks 4, 5, 6)
- Task 9: Decks Page (needs Tasks 4, 5, 6)
- Task 10: Settings (needs Tasks 4, 6)

**Wave 4 (after Wave 3):**
- Task 11: Keyboard & Polish
- Task 12: Verification
