# Pitfalls Research

**Domain:** Arabic SRS Flashcard App (SM-2, RTL text, localStorage)
**Researched:** 2026-02-24
**Confidence:** MEDIUM-HIGH

## Critical Pitfalls

### 1. SM-2 Ease Factor Death Spiral
**Risk:** HIGH | **Phase:** Task 3 (SrsService)

Cards rated Hard repeatedly hit EF floor (1.3) permanently. Good (3) in design doc doesn't recover EF. Card appears every 1-2 days forever.

**Prevention:** Good rating should increase EF slightly (+0.05) when EF < 2.5. Or use original SM-2 formula exactly. Track cards at EF floor > 10 reviews as leeches.

### 2. Arabic Harakat Rendering at Large Sizes
**Risk:** HIGH | **Phase:** Task 5 (ArabicText)

Diacritics (fatha, kasra, damma, shadda) clipped at 48-64px. Shadda+fatha stacking is especially tall. Tailwind default line-height too tight.

**Prevention:** `line-height: 1.8-2.0` for Arabic text. `overflow: visible` (never hidden). Generous padding. Test with shadda+fatha stress string.

### 3. Connected Letter Forms + Tatweel
**Risk:** MEDIUM | **Phase:** Task 2 (Data) + Task 7 (TypeCard)

Gogo Arabic uses tatweel (U+0640) for positional forms. Works visually but breaks Type mode string comparison.

**Prevention:** Strip tatweel in normalization pipeline. Display uses tatweel; validation strips it.

### 4. Type Mode Answer Validation
**Risk:** HIGH | **Phase:** Task 3 (normalize utility) + Task 7 (TypeCard)

Arabic comparison fails: transliteration ambiguity, hamza variants, alif maqsura/ya, ta marbuta/ha, diacritics in input, NFC vs NFD.

**Prevention:** Build normalization pipeline: NFC normalize -> strip harakat (U+064B-U+065E) -> strip tatweel -> normalize hamza -> normalize alif maqsura -> case-insensitive -> trim. Provide 3-5 accepted variants per card.

### 5. localStorage Quota
**Risk:** LOW | **Phase:** Task 3 (StorageService)

800 cards x 200 bytes = ~160KB. Fine. But session history can grow unbounded. Don't store session-level data.

**Prevention:** Store only per-card progress. Flat object `{ [cardId]: progress }`. Debounce 2-3 seconds. Handle QuotaExceededError.

### 6. SM-2 "Again" Infinite Loops
**Risk:** MEDIUM | **Phase:** Task 3 + Task 7

Again on new card = reappears every minute. User stuck on same 5 cards for an hour.

**Prevention:** Cap re-shows at 3 per session. Interleave 2-5 other cards between re-shows. Show "Card 12/50" progress.

### 7. RTL Layout Breaks with Mixed Content
**Risk:** MEDIUM | **Phase:** Task 5 (ArabicText) + Task 7

`dir="rtl"` on card container reverses ALL children including English text, buttons, flex order.

**Prevention:** Isolate RTL to ArabicText only (`dir="rtl"` + `lang="ar"` + `unicode-bidi: isolate`). Card container stays LTR.

## "Looks Done But Isn't" Checklist

- [ ] EF floor `Math.max(1.3, newEF)` in ALL code paths
- [ ] First review `repetition === 0` produces `interval = 1` day
- [ ] Learning-step graduation logic (1min -> 10min -> 1day)
- [ ] `lang="ar"` on every ArabicText instance
- [ ] `font-feature-settings: "liga" 1, "calt" 1` for Arabic ligatures
- [ ] Keyboard shortcuts guarded against input fields
- [ ] Deck unlock graph is acyclic
- [ ] QuotaExceededError caught in StorageService
- [ ] All ~800 card IDs unique across 10 decks
- [ ] Empty queue shows "All caught up!" not blank screen
- [ ] Rating undo (1-card buffer) -- misclick on Again is permanent EF damage

## Pitfall-to-Phase Map

| Pitfall | Prevention Phase | Verification |
|---------|-----------------|--------------|
| EF death spiral | Task 3 | 10 Hard then 10 Good -> EF recovers above 1.5 |
| Harakat clipping | Task 5 | Diacritized phrase at 64px, all marks visible |
| Tatweel in forms | Task 2 + 7 | Type letter name for initial form, accepted |
| Answer validation | Task 3 + 7 | 20+ edge cases passing |
| localStorage quota | Task 3 | 800 cards x progress < 1MB |
| Again loops | Task 3 + 7 | 5 Again ratings -> card deferred after 3 |
| RTL breaks | Task 5 + 7 | Mixed Arabic/English card renders correctly |

---
*Pitfalls research for: Arabic SRS Flashcard App*
