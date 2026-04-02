# Moses Arabic

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)

A spaced-repetition Arabic learning app built for a 7-day sprint from zero to reading. Uses the SM-2 algorithm with strict mastery gates to take you from letter recognition through connected reading across 10 progressively unlocked decks and 700+ flashcards.

**[Live App](https://moses-arabic-app.web.app)**

---

## What It Does

Moses Arabic structures Arabic acquisition into 4 stages -- script basics, vocabulary building, grammar foundations, and fluency -- each with mastery-gated decks that only unlock when you prove recall at 90-95% thresholds. The SM-2 engine schedules reviews with learning steps (1min, 10min, graduate), ease factor recovery, and again-card interleaving so you retain what you learn. Progress syncs across devices via Firebase with anonymous auth.

## Features

- **SM-2 spaced repetition** -- interval scheduling, ease factor adjustment, lapse tracking, and mastery detection
- **10 decks across 4 stages** -- letter recognition, letter forms, harakat, sun/moon letters, numbers, university vocab, grammar, common words, connected reading, reading practice
- **Progressive unlocking** -- decks gate on 90-95% mastery of prerequisites (modeled on WaniKani's Guru system)
- **Timed recall** -- configurable per-deck countdown timers that auto-fail on timeout
- **Arabic audio** -- Web Speech API pronunciation with Arabic voice detection
- **Cloud sync** -- Firebase anonymous auth + Firestore with debounced writes and device linking via 6-character codes
- **Offline-first** -- localStorage with debounced persistence, works without connectivity
- **Dashboard** -- today's stats, all-time stats, study streak, mastery forecast with session estimates
- **Data portability** -- JSON export/import with version validation
- **Keyboard shortcuts** -- Space to flip, 1-4 to rate, A to listen, Escape to exit

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | React 19 |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 |
| Routing | React Router 7 |
| Backend | Firebase (Auth + Firestore) |
| SRS Engine | Custom SM-2 implementation |
| Date handling | date-fns |
| Local storage | Custom StorageService with debounced writes |

## Project Structure

```
src/
  components/
    layout/     # AppShell, Sidebar
    study/      # FlashCard, RatingButtons, SessionComplete
    ui/         # ArabicText (RTL-aware text component)
  contexts/     # ProgressContext, SettingsContext (React Context + useReducer)
  data/         # Card generators, alphabet, vocabulary, grammar, reading data
  hooks/        # useStudySession (session state machine)
  pages/        # Dashboard, Study, Decks, Settings
  services/     # SrsService, FirebaseService, StorageService, DeckService, StatsService
```

## Getting Started

```bash
# Clone
git clone https://github.com/theshumba/moses-arabic-app.git
cd moses-arabic-app

# Install
npm install

# Dev server
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

The app runs at `http://localhost:5173/moses-arabic-app/` in development.

## Curriculum

| Stage | Decks | Cards | Mastery Gate |
|-------|-------|-------|-------------|
| Script Basics | Letter Recognition, Letter Forms, Harakat, Sun & Moon | ~224 | 95% |
| Vocabulary Building | Numbers 1-10, University Vocabulary | ~100 | 95% |
| Grammar Foundations | Pronouns, Verb Conjugation, Possessives, Gender, Demonstratives | ~80 | 90% |
| Fluency | Common Words, Connected Reading, Reading Practice | ~330 | 90% |

## License

Private repository.
