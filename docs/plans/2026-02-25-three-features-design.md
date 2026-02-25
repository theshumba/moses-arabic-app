# Moses Arabic App — Three Features Design

Date: 2026-02-25
Context: 5-day sprint (Wed-Mon), 12-14 hrs/day study, goal is full mastery of all decks

## Feature 1: Mastery Forecast on Dashboard

Add a "Mastery Forecast" section below the existing Progress section on DashboardPage.

### What it shows

For each unlocked Stage 1 deck (letter-recognition, letter-forms, harakat, sun-moon):
- Deck name
- Mastery progress bar (X/Y mastered, percentage)
- Estimated sessions remaining to reach 100% mastery

### Estimation logic

- Uses existing `SrsService.isCardMastered()` definition (interval >= 1 day, step >= 2, reviews >= 3, lastRating >= 3, lapses <= 2)
- For each unmastered card: estimate reviews needed based on current step, interval, easeFactor
  - New card (no reviews): ~4 successful reviews to master (step 0 → 1 → graduate → interval grows)
  - Learning card (step 0-1): ~3 reviews remaining
  - Graduated but not mastered: ~1-2 reviews remaining depending on interval/reviews/lapses
- Total remaining reviews / avg cards-per-session = estimated sessions
- Avg cards-per-session: use StatsService session history average, fallback to 20
- Unstarted decks: total card count * 4 reviews / cards-per-session

### Files touched

- `DashboardPage.jsx` — add Mastery Forecast section + estimation logic

## Feature 2: Firebase Cloud Sync

Add Firebase anonymous auth + Firestore for cross-device progress sync.

### Architecture

New files:
- `src/config/firebase.js` — Firebase config constants
- `src/services/FirebaseService.js` — init, auth, CRUD, sync, link codes

Modified files:
- `StorageService.js` — add Firestore sync after localStorage writes
- `SettingsPage.jsx` — add Link Device UI
- `ProgressContext.jsx` — integrate sync on load
- `SettingsContext.jsx` — integrate sync on load
- `package.json` — add firebase dependency

### Sync flow

1. App loads → Firebase anonymous auth → get UID
2. Check Firestore for data under UID
3. Firestore has data → merge with localStorage (Firestore wins on conflicts)
4. Only localStorage has data → push to Firestore
5. On changes: localStorage (fast) + debounced Firestore write

### Link Device flow

1. Device A generates 6-char alphanumeric code → stored in `linkCodes/{code}` with 10-min expiry
2. Device B enters code → looks up UID → links to same account → pulls data
3. Expired codes cleaned up on read

### Firestore structure

```
users/{uid}/data/progress  → { cardProgress: {...} }
users/{uid}/data/settings  → { studyMode, newCardsPerSession }
users/{uid}/data/stats     → { sessions: [...], streak: {...} }
linkCodes/{code}           → { uid, createdAt, expiresAt }
```

### User action required

Create a free Firebase project (Spark plan) in browser console.

## Feature 3: robots.txt

Add `public/robots.txt`:
```
User-agent: *
Disallow: /
```

## Implementation order

1. Feature 3 (robots.txt) — trivial
2. Feature 1 (Mastery Forecast) — self-contained, dashboard only
3. Feature 2 (Firebase Cloud Sync) — largest, touches multiple files
