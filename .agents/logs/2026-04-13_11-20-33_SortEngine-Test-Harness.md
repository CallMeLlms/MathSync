# SortEngine Test Harness

## Date & Time
2026-04-13 11:20

## Topic
New Curriculum Engine — Highly-Interactive Drag-Sorting (`SortEngine`)

## Summary
Added a new Curriculum-stack engine that supports two interaction modes — **ordered slot sorting** and **bucket categorization** — driven by drag-and-drop tiles with Reanimated 3.x + Gesture Handler. Introduced a dedicated TEST bank (6 questions covering both modes, progressive difficulty) and wired it into the Lesson 4 ("Sorting Seeds") SuperLesson via the existing `getPlayableQuestions()` pipeline. No changes required to JourneyMap, gameThemes, or progress gating.

## Changes Made
1. **`src/Components/Game/Curriculum/Engines/SortEngine.jsx`** (new): Drag-sort engine. Prop contract `{ data, onResult }`. Supports `mode: "order"` (each slot holds one tile matched by `acceptsTileId`) and `mode: "bucket"` (each bucket accepts a list via `acceptsTileIds`). Uses `Gesture.Pan()` with shared-value transforms on the UI thread; haptics on pickup/drop; spring snap on successful drop and spring-back otherwise; shake animation on incorrect check; "Check Answer" CTA gated on `allPlaced`. Accessibility: all interactive elements ≥44×44. Speech: calls `speechManager.speakInstruction` on mount and `speechManager.speakFeedback` on submit.
2. **`src/Components/Game/Curriculum/CurriculumOrchestrator.jsx`**: Added import + `case 'sort':` to the per-question engine switch with `key={currentQuestionIndex}` to guarantee clean remount between questions.
3. **`content/game-data/quarter-1/grade1-q1-lesson4-compare-and-order/sortEngineTestBank.json`** (new): 6-question TEST bank. 3 × `order` mode (3→5 tiles, smallest↔largest) and 3 × `bucket` mode (shapes, number ranges, Filipino name initials). Metadata `"note": "TEST BANK — SortEngine validation only..."` follows the existing convention.
4. **`src/Components/Game/Curriculum/lessonResolver.js`**: Imported `G1_SortTest` and appended it to Lesson 4's `getPlayableQuestions([...])` array. Reachable by navigating to Grade 1 → Node 4 "Sorting Seeds".

## Verification
- Manual: `npm run web` → Grades → G1 → Node 4. Step through until `type: 'SORT'` renders. Verify order-mode shake on wrong, bucket-mode multi-tile drop, re-tap to unplace, `key={currentQuestionIndex}` prevents drag-state leak between questions.
- Regression: other Lesson 4 engines (Numpad) and sibling lessons' engines (Composer, Matcher) still render since change is additive.
