# Mastery Forecast + Firebase Sync + robots.txt Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add mastery forecast to dashboard, Firebase cloud sync for cross-device progress, and robots.txt to hide from search engines.

**Architecture:** Feature 3 (robots.txt) is a single static file. Feature 1 (mastery forecast) adds estimation logic and a new dashboard section using existing SrsService/DeckService/StatsService. Feature 2 (Firebase sync) adds firebase SDK, a new FirebaseService, modifies StorageService to sync writes, updates contexts to hydrate from Firestore, and adds device linking UI to SettingsPage.

**Tech Stack:** React 19, Vite 7, Tailwind CSS v4, Firebase v11 (Auth + Firestore), date-fns v4

---

### Task 1: Add robots.txt

**Files:**
- Create: `public/robots.txt`

**Step 1: Create robots.txt**

```
User-agent: *
Disallow: /
```

**Step 2: Verify it's served correctly**

Run: `npm run build` in `/Users/theshumba/Documents/GitHub/moses-arabic-app/`
Expected: `dist/robots.txt` exists with correct content

**Step 3: Commit**

```bash
git add public/robots.txt
git commit -m "feat: add robots.txt to hide from search engines"
```

---

### Task 2: Add Mastery Forecast section to DashboardPage

**Files:**
- Modify: `src/pages/DashboardPage.jsx`

**Step 1: Add estimation helper function**

Add this function above the `DashboardPage` component (after the `formatTime` function, before `export default function DashboardPage()`):

```jsx
/**
 * Estimate remaining sessions to fully master a deck.
 * Uses existing isCardMastered() definition from SrsService.
 */
function estimateSessions(deckCardIds, cardProgress, avgCardsPerSession) {
  let totalRemainingReviews = 0;

  for (const cardId of deckCardIds) {
    const progress = cardProgress[cardId];

    if (!progress) {
      // New card: needs ~4 successful reviews to master
      // (step 0 → step 1 → graduate → interval review → mastered)
      totalRemainingReviews += 4;
      continue;
    }

    if (SrsService.isCardMastered(progress)) {
      continue; // Already mastered
    }

    // Estimate remaining reviews based on current state
    const step = progress.step || 0;
    const totalReviews = progress.totalReviews || 0;
    const lapses = progress.lapses || 0;
    const lastRating = progress.lastRating || 0;

    // Mastery requires: step >= 2, interval >= 1, totalReviews >= 3, lastRating >= 3, lapses <= 2
    let remaining = 0;

    if (step < 2) {
      // Still in learning steps — needs to graduate first
      remaining += (2 - step); // steps to graduate
      remaining += 1; // at least one graduated review to reach mastery criteria
    }

    if (totalReviews < 3) {
      remaining = Math.max(remaining, 3 - totalReviews);
    }

    if (lastRating < 3) {
      remaining = Math.max(remaining, 1); // needs at least one Good/Easy
    }

    if (lapses > 2) {
      // Leech card — can't be mastered until lapses drop (they don't drop)
      // This card won't count as mastered, but we still estimate reviews
      remaining = Math.max(remaining, 2);
    }

    totalRemainingReviews += Math.max(remaining, 1);
  }

  if (totalRemainingReviews === 0) return 0;
  return Math.ceil(totalRemainingReviews / avgCardsPerSession);
}
```

**Step 2: Add imports**

Add `SrsService` to the imports at the top of DashboardPage.jsx. Change:

```jsx
import { DECKS, getCardsByDeck } from '../data/index.js';
```

to:

```jsx
import { DECKS, STAGES, getCardsByDeck } from '../data/index.js';
```

And add:

```jsx
import { SrsService } from '../services/SrsService.js';
```

**Step 3: Add mastery forecast data computation**

Inside the `DashboardPage` component, after the `streak` useMemo (line 66), add:

```jsx
  // Mastery forecast for Stage 1 decks
  const masteryForecast = useMemo(() => {
    const stage1Decks = DECKS.filter((d) => d.stage === 1);

    // Calculate avg cards per session from history, fallback to 20
    const sessions = StatsService.getSessionHistory(100);
    const avgCardsPerSession = sessions.length > 0
      ? Math.max(1, Math.round(sessions.reduce((sum, s) => sum + (s.cardsReviewed || 0), 0) / sessions.length))
      : 20;

    return stage1Decks.map((deck) => {
      const deckCardIds = allCardsByDeck[deck.id] || [];
      const unlocked = DeckService.isDeckUnlocked(deck.id, cardProgress, allCardsByDeck);
      const stats = DeckService.getDeckStats(deck.id, cardProgress, deckCardIds);
      const sessionsRemaining = estimateSessions(deckCardIds, cardProgress, avgCardsPerSession);

      return {
        deck,
        unlocked,
        total: stats.total,
        mastered: stats.mastered,
        masteryPercent: stats.masteryPercent,
        sessionsRemaining,
      };
    });
  }, [cardProgress, allCardsByDeck]);
```

**Step 4: Add Mastery Forecast JSX**

After the Progress section closing `</div>` (the one at line 133) and before the Browse decks link, add:

```jsx
      {/* Mastery Forecast */}
      <div className="mb-6">
        <h2 className="text-sm uppercase tracking-wide text-text-muted mb-3">Mastery Forecast</h2>
        <div className="space-y-3">
          {masteryForecast.map(({ deck, unlocked, total, mastered, masteryPercent, sessionsRemaining }) => (
            <div key={deck.id} className={`rounded-lg border border-border bg-surface p-4 ${!unlocked ? 'opacity-50' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm">{deck.name}</span>
                <span className="text-xs text-text-dim">
                  {masteryPercent === 100
                    ? 'Mastered!'
                    : unlocked
                      ? `~${sessionsRemaining} session${sessionsRemaining !== 1 ? 's' : ''} left`
                      : 'Locked'}
                </span>
              </div>
              <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${masteryPercent}%`,
                    backgroundColor: masteryPercent === 100 ? 'var(--color-good)' : 'var(--color-accent)',
                  }}
                />
              </div>
              <div className="text-xs text-text-dim mt-1">
                {mastered}/{total} cards mastered ({masteryPercent}%)
              </div>
            </div>
          ))}
        </div>
      </div>
```

**Step 5: Verify visually**

Run: `npm run dev` in `/Users/theshumba/Documents/GitHub/moses-arabic-app/`
Open: `http://localhost:5173/moses-arabic-app/`
Expected: Dashboard shows Mastery Forecast section with 4 Stage 1 decks, progress bars, and session estimates.

**Step 6: Commit**

```bash
git add src/pages/DashboardPage.jsx
git commit -m "feat: add mastery forecast section to dashboard"
```

---

### Task 3: Install Firebase and create config

**Files:**
- Modify: `package.json` (via npm install)
- Create: `src/config/firebase.js`

**Step 1: Install Firebase SDK**

Run: `npm install firebase` in `/Users/theshumba/Documents/GitHub/moses-arabic-app/`

**Step 2: User action — Create Firebase project**

The user must create a Firebase project in the browser:

1. Go to https://console.firebase.google.com/
2. Click "Create a project" (or "Add project")
3. Name it "moses-arabic-app"
4. Disable Google Analytics (not needed)
5. Click "Create project"
6. In project settings, under "Your apps", click the web icon (`</>`)
7. Register app name: "moses-arabic-app"
8. Copy the `firebaseConfig` object
9. In the Firebase console sidebar: Build > Authentication > Get Started > Enable "Anonymous" sign-in
10. In the Firebase console sidebar: Build > Firestore Database > Create database > Start in test mode > Select closest region

**Step 3: Create Firebase config file**

Create `src/config/firebase.js` with the user's config values:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "USER_WILL_PASTE_THIS",
  authDomain: "moses-arabic-app.firebaseapp.com",
  projectId: "moses-arabic-app",
  storageBucket: "moses-arabic-app.firebasestorage.app",
  messagingSenderId: "USER_WILL_PASTE_THIS",
  appId: "USER_WILL_PASTE_THIS",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
```

**Step 4: Commit**

```bash
git add package.json package-lock.json src/config/firebase.js
git commit -m "feat: add Firebase SDK and config"
```

---

### Task 4: Create FirebaseService

**Files:**
- Create: `src/services/FirebaseService.js`

**Step 1: Create FirebaseService with auth, sync, and link code methods**

```javascript
/**
 * FirebaseService — Firebase anonymous auth, Firestore sync, and device linking.
 *
 * Features:
 * - Anonymous auth (persistent UID per device)
 * - Read/write progress, settings, stats to Firestore
 * - Device linking via 6-char codes (10-min expiry)
 * - Debounced Firestore writes
 */

import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase.js';

const SYNC_DEBOUNCE_MS = 3000;
const LINK_CODE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes
const LINK_CODE_LENGTH = 6;

/** Pending Firestore writes (debounced) */
const pendingSync = new Map();

/** Current user UID */
let currentUid = null;

/** Auth ready promise */
let authReadyResolve;
const authReady = new Promise((resolve) => {
  authReadyResolve = resolve;
});

// Listen for auth state changes
onAuthStateChanged(auth, (user) => {
  currentUid = user ? user.uid : null;
  authReadyResolve(currentUid);
});

const FirebaseService = {
  /**
   * Initialize anonymous auth. Returns the UID.
   * @returns {Promise<string|null>} User UID or null on failure
   */
  async init() {
    try {
      const result = await signInAnonymously(auth);
      currentUid = result.user.uid;
      return currentUid;
    } catch (err) {
      console.error('[FirebaseService] Auth failed:', err.message);
      return null;
    }
  },

  /**
   * Wait for auth to be ready and return UID.
   * @returns {Promise<string|null>}
   */
  async waitForAuth() {
    return authReady;
  },

  /**
   * Get current UID (synchronous, may be null if not authed yet).
   * @returns {string|null}
   */
  getUid() {
    return currentUid;
  },

  /**
   * Read a data document from Firestore.
   * Path: users/{uid}/data/{key}
   * @param {string} key - Document key (progress, settings, stats)
   * @returns {Promise<object|null>}
   */
  async read(key) {
    if (!currentUid) return null;
    try {
      const ref = doc(db, 'users', currentUid, 'data', key);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error(`[FirebaseService] Read ${key} failed:`, err.message);
      return null;
    }
  },

  /**
   * Write a data document to Firestore (debounced).
   * Path: users/{uid}/data/{key}
   * @param {string} key - Document key
   * @param {object} data - Data to write
   */
  write(key, data) {
    if (!currentUid) return;

    const existing = pendingSync.get(key);
    if (existing) clearTimeout(existing.timer);

    const timer = setTimeout(async () => {
      pendingSync.delete(key);
      try {
        const ref = doc(db, 'users', currentUid, 'data', key);
        await setDoc(ref, data, { merge: true });
      } catch (err) {
        console.error(`[FirebaseService] Write ${key} failed:`, err.message);
      }
    }, SYNC_DEBOUNCE_MS);

    pendingSync.set(key, { data, timer });
  },

  /**
   * Write immediately (non-debounced).
   * @param {string} key
   * @param {object} data
   * @returns {Promise<boolean>}
   */
  async writeImmediate(key, data) {
    if (!currentUid) return false;
    try {
      const ref = doc(db, 'users', currentUid, 'data', key);
      await setDoc(ref, data, { merge: true });
      return true;
    } catch (err) {
      console.error(`[FirebaseService] WriteImmediate ${key} failed:`, err.message);
      return false;
    }
  },

  /**
   * Generate a 6-char link code for device linking.
   * Stored at linkCodes/{code} with 10-min expiry.
   * @returns {Promise<string|null>} The generated code, or null on failure
   */
  async generateLinkCode() {
    if (!currentUid) return null;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I/O/0/1 for clarity
    let code = '';
    for (let i = 0; i < LINK_CODE_LENGTH; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    try {
      const ref = doc(db, 'linkCodes', code);
      await setDoc(ref, {
        uid: currentUid,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + LINK_CODE_EXPIRY_MS).toISOString(),
      });
      return code;
    } catch (err) {
      console.error('[FirebaseService] Generate link code failed:', err.message);
      return null;
    }
  },

  /**
   * Redeem a link code — pull data from the linked account.
   * @param {string} code - 6-char code
   * @returns {Promise<{ success: boolean, data?: { progress: object, settings: object, stats: object }, error?: string }>}
   */
  async redeemLinkCode(code) {
    try {
      const ref = doc(db, 'linkCodes', code.toUpperCase());
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        return { success: false, error: 'Invalid code' };
      }

      const linkData = snap.data();

      // Check expiry
      if (new Date(linkData.expiresAt) < new Date()) {
        await deleteDoc(ref);
        return { success: false, error: 'Code expired' };
      }

      const sourceUid = linkData.uid;

      // Read all data from source account
      const progress = await this._readFromUid(sourceUid, 'progress');
      const settings = await this._readFromUid(sourceUid, 'settings');
      const stats = await this._readFromUid(sourceUid, 'stats');

      // Write to current account
      if (progress) await this.writeImmediate('progress', progress);
      if (settings) await this.writeImmediate('settings', settings);
      if (stats) await this.writeImmediate('stats', stats);

      // Clean up the code
      await deleteDoc(ref);

      return { success: true, data: { progress, settings, stats } };
    } catch (err) {
      console.error('[FirebaseService] Redeem link code failed:', err.message);
      return { success: false, error: err.message };
    }
  },

  /**
   * Read data from a specific UID (for link code redemption).
   * @param {string} uid
   * @param {string} key
   * @returns {Promise<object|null>}
   * @private
   */
  async _readFromUid(uid, key) {
    try {
      const ref = doc(db, 'users', uid, 'data', key);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data() : null;
    } catch {
      return null;
    }
  },

  /**
   * Flush all pending Firestore writes immediately.
   * @returns {Promise<void>}
   */
  async flushAll() {
    const promises = [];
    for (const [key, entry] of pendingSync) {
      clearTimeout(entry.timer);
      if (currentUid) {
        const ref = doc(db, 'users', currentUid, 'data', key);
        promises.push(setDoc(ref, entry.data, { merge: true }).catch(() => {}));
      }
    }
    pendingSync.clear();
    await Promise.all(promises);
  },
};

export { FirebaseService };
```

**Step 2: Commit**

```bash
git add src/services/FirebaseService.js
git commit -m "feat: add FirebaseService for auth, sync, and device linking"
```

---

### Task 5: Integrate Firebase sync into ProgressContext

**Files:**
- Modify: `src/contexts/ProgressContext.jsx`

**Step 1: Add Firebase sync to ProgressContext**

Replace the entire file with:

```jsx
import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { StorageService } from '../services/StorageService.js';
import { FirebaseService } from '../services/FirebaseService.js';

const ProgressStateContext = createContext(null);
const ProgressDispatchContext = createContext(null);

const initialState = { cardProgress: {} };

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
    case 'CLEAR_ALL':
      return { cardProgress: {} };
    default:
      return state;
  }
}

export function ProgressProvider({ children }) {
  const [state, dispatch] = useReducer(progressReducer, initialState);
  const initialized = useRef(false);

  // Hydrate from localStorage, then sync from Firestore
  useEffect(() => {
    const saved = StorageService.get('progress');
    if (saved) {
      dispatch({ type: 'LOAD', payload: { cardProgress: saved } });
    }

    // Sync from Firestore after auth
    FirebaseService.waitForAuth().then(async (uid) => {
      if (!uid) {
        initialized.current = true;
        return;
      }

      const cloudData = await FirebaseService.read('progress');
      if (cloudData && cloudData.cardProgress) {
        // Merge: cloud wins for conflicts (cloud has more recent data from other devices)
        const merged = { ...(saved || {}), ...cloudData.cardProgress };
        dispatch({ type: 'LOAD', payload: { cardProgress: merged } });
        StorageService.setImmediate('progress', merged);
      } else if (saved && Object.keys(saved).length > 0) {
        // No cloud data but have local — push to cloud
        FirebaseService.write('progress', { cardProgress: saved });
      }
      initialized.current = true;
    });
  }, []);

  // Persist on change (localStorage + Firestore)
  useEffect(() => {
    if (!initialized.current) return;
    StorageService.set('progress', state.cardProgress);
    FirebaseService.write('progress', { cardProgress: state.cardProgress });
  }, [state.cardProgress]);

  // Flush on beforeunload
  useEffect(() => {
    const handler = () => {
      StorageService.flushAll();
      FirebaseService.flushAll();
    };
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

**Step 2: Commit**

```bash
git add src/contexts/ProgressContext.jsx
git commit -m "feat: integrate Firebase sync into ProgressContext"
```

---

### Task 6: Integrate Firebase sync into SettingsContext

**Files:**
- Modify: `src/contexts/SettingsContext.jsx`

**Step 1: Add Firebase sync to SettingsContext**

Replace the entire file with:

```jsx
import { createContext, useContext, useEffect, useReducer, useRef } from 'react';
import { StorageService } from '../services/StorageService.js';
import { FirebaseService } from '../services/FirebaseService.js';

const SettingsStateContext = createContext(null);
const SettingsDispatchContext = createContext(null);

const DEFAULT_SETTINGS = {
  studyMode: 'flip',
  newCardsPerSession: 50,
};

const initialState = { settings: { ...DEFAULT_SETTINGS } };

function settingsReducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return { ...state, settings: { ...DEFAULT_SETTINGS, ...action.payload } };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

export function SettingsProvider({ children }) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const initialized = useRef(false);

  // Hydrate from localStorage, then sync from Firestore
  useEffect(() => {
    const saved = StorageService.get('settings');
    if (saved) {
      dispatch({ type: 'LOAD', payload: saved });
    }

    FirebaseService.waitForAuth().then(async (uid) => {
      if (!uid) {
        initialized.current = true;
        return;
      }

      const cloudData = await FirebaseService.read('settings');
      if (cloudData) {
        const merged = { ...(saved || {}), ...cloudData };
        dispatch({ type: 'LOAD', payload: merged });
        StorageService.setImmediate('settings', merged);
      } else if (saved) {
        FirebaseService.write('settings', saved);
      }
      initialized.current = true;
    });
  }, []);

  // Persist on change (localStorage + Firestore)
  useEffect(() => {
    if (!initialized.current) return;
    StorageService.set('settings', state.settings);
    FirebaseService.write('settings', state.settings);
  }, [state.settings]);

  // Flush on beforeunload
  useEffect(() => {
    const handler = () => {
      StorageService.flushAll();
      FirebaseService.flushAll();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  return (
    <SettingsStateContext value={state}>
      <SettingsDispatchContext value={dispatch}>
        {children}
      </SettingsDispatchContext>
    </SettingsStateContext>
  );
}

export function useSettingsState() {
  const ctx = useContext(SettingsStateContext);
  if (ctx === null) throw new Error('useSettingsState must be used within SettingsProvider');
  return ctx;
}

export function useSettingsDispatch() {
  const ctx = useContext(SettingsDispatchContext);
  if (ctx === null) throw new Error('useSettingsDispatch must be used within SettingsProvider');
  return ctx;
}
```

**Step 2: Commit**

```bash
git add src/contexts/SettingsContext.jsx
git commit -m "feat: integrate Firebase sync into SettingsContext"
```

---

### Task 7: Sync StatsService to Firestore

**Files:**
- Modify: `src/services/StatsService.js`

**Step 1: Add Firebase sync to StatsService**

Add import at the top (after the StorageService import):

```javascript
import { FirebaseService } from './FirebaseService.js';
```

In `endSession()`, after `StorageService.setImmediate(SESSIONS_KEY, sessions);` (line 79), add:

```javascript
    // Sync sessions to Firestore
    FirebaseService.write('stats', { sessions, streak: StorageService.get(STREAK_KEY) });
```

In `_updateStreak()`, after each `StorageService.setImmediate(STREAK_KEY, ...)` call (there are 3 of them), add a Firestore sync. The simplest way: at the very end of `_updateStreak()` (before the closing `}`), add:

```javascript
    // Sync streak to Firestore
    const updatedStreak = StorageService.get(STREAK_KEY);
    const allSessions = StorageService.get(SESSIONS_KEY);
    FirebaseService.write('stats', { sessions: allSessions, streak: updatedStreak });
```

Wait — that would duplicate. Better approach: add ONE sync at end of `_updateStreak`. But `_updateStreak` is called from `endSession` which already syncs. So remove the duplicate. Just keep the sync in `endSession` AFTER the `_updateStreak` call.

Actually, let me simplify. In `endSession()`, move the Firestore sync to after `this._updateStreak(endTime)`:

After line 83 (`this._updateStreak(endTime);`), add:

```javascript
    // Sync to Firestore
    FirebaseService.write('stats', {
      sessions: StorageService.get(SESSIONS_KEY),
      streak: StorageService.get(STREAK_KEY),
    });
```

That's the only change needed.

**Step 2: Commit**

```bash
git add src/services/StatsService.js
git commit -m "feat: sync stats to Firestore on session end"
```

---

### Task 8: Initialize Firebase on app load

**Files:**
- Modify: `src/App.jsx`

**Step 1: Add Firebase init**

Add import at the top:

```javascript
import { FirebaseService } from './services/FirebaseService.js';
```

Inside the `App` component, before the return statement, add:

```javascript
  useEffect(() => {
    FirebaseService.init();
  }, []);
```

And add the `useEffect` import:

```javascript
import { useEffect } from 'react';
```

Full updated App.jsx:

```jsx
import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppProviders } from './contexts/index.jsx';
import AppShell from './components/layout/AppShell.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StudyPage from './pages/StudyPage.jsx';
import DecksPage from './pages/DecksPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { FirebaseService } from './services/FirebaseService.js';

const router = createBrowserRouter([
  {
    Component: AppShell,
    children: [
      { index: true, Component: DashboardPage },
      { path: 'study/:deckId', Component: StudyPage },
      { path: 'study', Component: StudyPage },
      { path: 'decks', Component: DecksPage },
      { path: 'settings', Component: SettingsPage },
    ],
  },
], { basename: '/moses-arabic-app' });

export default function App() {
  useEffect(() => {
    FirebaseService.init();
  }, []);

  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
```

**Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat: initialize Firebase on app load"
```

---

### Task 9: Build SettingsPage with Link Device UI

**Files:**
- Modify: `src/pages/SettingsPage.jsx`

**Step 1: Replace SettingsPage with full implementation**

```jsx
import { useState } from 'react';
import { FirebaseService } from '../services/FirebaseService.js';
import { StorageService } from '../services/StorageService.js';
import { useProgressDispatch } from '../contexts/ProgressContext.jsx';
import { useSettingsDispatch } from '../contexts/SettingsContext.jsx';

export default function SettingsPage() {
  const [linkCode, setLinkCode] = useState(null);
  const [inputCode, setInputCode] = useState('');
  const [generating, setGenerating] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [message, setMessage] = useState(null);
  const progressDispatch = useProgressDispatch();
  const settingsDispatch = useSettingsDispatch();

  const handleGenerateCode = async () => {
    setGenerating(true);
    setMessage(null);
    const code = await FirebaseService.generateLinkCode();
    if (code) {
      setLinkCode(code);
    } else {
      setMessage({ type: 'error', text: 'Failed to generate code. Check your connection.' });
    }
    setGenerating(false);
  };

  const handleRedeemCode = async () => {
    if (inputCode.length !== 6) {
      setMessage({ type: 'error', text: 'Code must be 6 characters.' });
      return;
    }
    setRedeeming(true);
    setMessage(null);
    const result = await FirebaseService.redeemLinkCode(inputCode);
    if (result.success) {
      // Update local state with synced data
      if (result.data.progress?.cardProgress) {
        StorageService.setImmediate('progress', result.data.progress.cardProgress);
        progressDispatch({ type: 'LOAD', payload: { cardProgress: result.data.progress.cardProgress } });
      }
      if (result.data.settings) {
        StorageService.setImmediate('settings', result.data.settings);
        settingsDispatch({ type: 'LOAD', payload: result.data.settings });
      }
      if (result.data.stats?.sessions) {
        StorageService.setImmediate('sessions', result.data.stats.sessions);
      }
      if (result.data.stats?.streak) {
        StorageService.setImmediate('streak', result.data.stats.streak);
      }
      setMessage({ type: 'success', text: 'Device linked! Your progress has been synced.' });
      setInputCode('');
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to redeem code.' });
    }
    setRedeeming(false);
  };

  const handleExport = () => {
    const json = StorageService.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `moses-arabic-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = StorageService.importAll(reader.result);
      if (result.success) {
        setMessage({ type: 'success', text: 'Data imported! Reloading...' });
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setMessage({ type: 'error', text: result.error });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Sync status */}
      <div className="mb-6">
        <h2 className="text-sm uppercase tracking-wide text-text-muted mb-3">Cloud Sync</h2>
        <p className="text-text-dim text-sm mb-4">
          Your progress syncs automatically across devices. Use a link code to connect a new device.
        </p>
      </div>

      {/* Link Device */}
      <div className="rounded-xl border border-border bg-surface p-5 mb-4">
        <h3 className="font-medium mb-3">Link a Device</h3>

        {/* Generate code */}
        <div className="mb-4">
          <p className="text-text-dim text-sm mb-2">Generate a code on this device, then enter it on your other device.</p>
          <button
            onClick={handleGenerateCode}
            disabled={generating}
            className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Link Code'}
          </button>
          {linkCode && (
            <div className="mt-3 p-3 rounded-lg bg-surface-2 border border-border text-center">
              <div className="text-xs text-text-dim mb-1">Your link code (expires in 10 min):</div>
              <div className="text-3xl font-mono font-bold tracking-widest text-accent">{linkCode}</div>
            </div>
          )}
        </div>

        {/* Redeem code */}
        <div className="border-t border-border pt-4">
          <p className="text-text-dim text-sm mb-2">Or enter a code from your other device:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase().slice(0, 6))}
              placeholder="ABC123"
              maxLength={6}
              className="flex-1 px-3 py-2 rounded-lg bg-surface-2 border border-border text-text font-mono text-lg tracking-widest text-center uppercase placeholder:text-text-dim/50"
            />
            <button
              onClick={handleRedeemCode}
              disabled={redeeming || inputCode.length !== 6}
              className="px-4 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent/80 transition-colors disabled:opacity-50"
            >
              {redeeming ? 'Linking...' : 'Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Status message */}
      {message && (
        <div className={`rounded-lg p-3 mb-4 text-sm ${message.type === 'error' ? 'bg-again/20 text-again' : 'bg-good/20 text-good'}`}>
          {message.text}
        </div>
      )}

      {/* Data Management */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="font-medium mb-3">Data Management</h3>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg bg-surface-2 border border-border text-text-muted text-sm hover:bg-surface transition-colors"
          >
            Export Backup
          </button>
          <label className="px-4 py-2 rounded-lg bg-surface-2 border border-border text-text-muted text-sm hover:bg-surface transition-colors cursor-pointer">
            Import Backup
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Verify visually**

Run dev server, navigate to `/settings`.
Expected: Cloud Sync section with generate/redeem code UI and data management buttons.

**Step 3: Commit**

```bash
git add src/pages/SettingsPage.jsx
git commit -m "feat: add Settings page with device linking and data management"
```

---

### Task 10: Build, verify, and push

**Step 1: Run build**

Run: `npm run build` in `/Users/theshumba/Documents/GitHub/moses-arabic-app/`
Expected: Build succeeds with no errors.

**Step 2: Run dev server and verify all features**

Run: `npm run dev`

Verify:
1. Dashboard shows Mastery Forecast section with 4 Stage 1 decks
2. Settings page shows Cloud Sync and Link Device UI
3. `dist/robots.txt` exists with correct content
4. No console errors

**Step 3: Push to GitHub**

```bash
git push origin main
```
