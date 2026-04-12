# OrdinalSequenceEngine — Implementation Log

**Date:** 2026-04-13
**Topic:** Grade 1 Lesson 3 ("The Ranking Vines") — Ordinal Numbers (NA.1.9)
**Status:** Engine + test bank wired; ready for simulator validation

---

## Summary

Built a new curriculum engine (`OrdinalSequenceEngine`) for the Grade 1 Lesson 3 stack.
The engine teaches ordinal number sequence (1st–10th) via a **tap-to-label** mechanic:
students tap a row of fruit emojis in left-to-right order, and an ordinal badge springs
onto each tapped tile. A "Check Answer" button appears once every fruit is labeled, and
the engine validates correctness by comparing tap order against `[0, 1, …, count-1]`.

This is the **first playable engine** for Lesson 3 — previously all L3 banks had engine
type `"N/A"` and were filtered out by `getPlayableQuestions`.

---

## Files Created

### 1. `src/Components/Game/Curriculum/Engines/OrdinalSequenceEngine.jsx`
- Props contract: `{ data, onResult }` (standard dumb-engine API)
- Sub-component: `FruitTile` — owns its own `useSharedValue` scale/opacity so tap pops stay scoped per-tile
- State:
  - `tappedOrder` — array of fruit indices in tap order
  - `badges` — map of `fruitIndex → '1st' | '2nd' | …`
  - `answered` — locks interaction after submit
  - `misplacedSet` — memoized set of fruit indices whose received label doesn't match their position (drives red border on incorrect tiles)
- Animations (Reanimated 3.x):
  - `ZoomIn.springify().damping(12)` on badge stamp
  - `withSpring` scale pop + release on each tap
  - `FadeIn` opacity transition on tile dim after tap
  - `ZoomIn.springify()` on Check button, `FadeIn.duration(200)` on Reset
- Gesture handlers: `Gesture.Tap()` on each tile, plus Check and Reset buttons
- Feedback: `expo-haptics` (Light on tap, Success/Error on submit) + `speechManager` instruction on mount and feedback on submit (700ms delay before `onResult`)
- Layout: horizontal `ScrollView` for the fruit row (accommodates 10-item questions on small screens)
- Design system: no shadows, flat surface tokens (`surfaceContainerHigh` untapped → `surfaceContainerLow` tapped), `Lexend-Bold` badge text, `PlusJakartaSans-SemiBold` hint text

### 2. `content/game-data/quarter-1/grade1-q1-lesson3-position/ordinalSequenceQuestionBank.json`
Test bank — 5 questions validating the engine end-to-end:

| # | Level | Fruits | Count | Purpose |
|---|---|---|---|---|
| 1 | concrete / Easy | 🥭🍌🌽 | 3 | Minimal happy path |
| 2 | concrete / Easy | 🍊🍓🍋🍇 | 4 | Slightly longer row |
| 3 | pictorial / Medium | 🥭🍌🌽🍊🍓 | 5 | Mid-range |
| 4 | pictorial / Medium | 🍋🍇🍉🍑🥝🍒 | 6 | Edge of no-scroll range |
| 5 | abstract / Hard | 🥭🍌🌽🍊🍓🍋🍇🍉🍑🥝 | 10 | Stress-tests scroll & 10-item limit |

All questions use `type: "ORDINAL_SEQUENCE"` (lowercased to `ordinal_sequence` by the Orchestrator).

---

## Files Modified

### 3. `src/Components/Game/Curriculum/lessonResolver.js`
- Imported `G1_OrdinalSequence` from the new test bank
- Added it as the third bank in Lesson 3's `getPlayableQuestions([...])` call
- Lesson 3 is now playable — previously all questions filtered to N/A

### 4. `src/Components/Game/Curriculum/CurriculumOrchestrator.jsx`
- Imported `OrdinalSequenceEngine`
- Added `case 'ordinal_sequence':` to the engine routing switch (alongside existing cases like `shapetracer`, `dragdrop`, etc.)

---

## Verification Checklist

- [ ] Launch Lesson 3 — engine mounts with fruit row visible
- [ ] Tap left-to-right (3-fruit question) → badges stamp 1st/2nd/3rd → Check Answer → success haptic + speech → advances to next question
- [ ] Tap right-to-left → badges land out of order → Check Answer → error haptic + speech → misplaced tiles get red border → advances to next question
- [ ] Reset button clears all badges mid-question
- [ ] 10-fruit question scrolls horizontally on a small screen
- [ ] Expo Speech fires instruction on mount, feedback on submit
- [ ] Orchestrator advances through all 5 test questions without state leak (engine remounts via `key={currentQuestionIndex}`)

---

## Notes & Follow-ups

- The existing L3 banks (`ordinalNumbersQuestionBank.json`, `positionalReasoningQuestionBank.json`, `ordinalMatchingQuestionBank.json`) remain `type: "N/A"` — their engines (PickerEngine, DragDrop variants for position tapping) are future work.
- The test bank is not a production bank. A full production ORDINAL_SEQUENCE bank should cover the MATATAG NA.1.9 performance indicators with ~20–30 questions spanning CPA progression.
- Future enhancement: themed variants (animals, vehicles, characters) can be swapped via the `fruits` JSON field — the engine is emoji-agnostic.
