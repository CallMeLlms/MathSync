# ShapeHuntEngine — Implementation Log

**Date:** 2026-04-13
**Topic:** Grade 1 Lesson 1 ("Geometric Blooms") — 2D Shapes (MG.1.1–1.3)
**Status:** Engine + example bank created; standalone scope (not wired into SuperLesson)

---

## Summary

Built a new curriculum engine (`ShapeHuntEngine`) for Grade 1 Lesson 1 shape recognition.
The engine implements a **multi-target tap-hunt** mechanic: a shuffled grid of mixed shape
tiles is shown, and students must find and tap every instance of the target shape.

**Per-tap feedback is immediate:**
- **Correct tap** → tile spring-pops, green border, checkmark badge springs in, stays locked
- **Wrong tap** → tile shakes (translateX sequence) + red border flash → visual resets,
  does NOT stay selected. Increments `wrongTaps` counter
- **Check Answer button** appears (via `ZoomIn.springify()`) only once `foundSet.size === targetCount`
- `isCorrect = (wrongTaps === 0)` — finding all targets without mistakes = perfect

**Scope note:** This is an engine + example bank only. Not yet wired into `lessonResolver.js`
or `CurriculumOrchestrator.jsx` — those are intentionally deferred per the plan.

---

## Files Created

### 1. `src/Components/Game/Curriculum/Engines/ShapeHuntEngine.jsx`
- Props contract: `{ data, onResult }` (standard dumb-engine API)
- Sub-component: `ShapeTile` — owns per-tile `useSharedValue`s (scale, translateX, borderFlash)
  to scope animation drivers and prevent cross-tile re-render churn
- State:
  - `foundSet` — Set of item IDs correctly tapped
  - `wrongTaps` — integer count of incorrect taps
  - `resolved` — boolean, locks interaction after Check submit
  - `targetCount` — memoized count of target items
- Animations (Reanimated 3.x):
  - `FadeInDown.delay(index * 70).springify().damping(14)` entrance stagger per tile
  - `withSequence(withSpring(1.12), withSpring(1))` pop on correct tap
  - `withSequence(withSpring(-10), withSpring(10), withSpring(-5), withSpring(0))` shake on wrong tap
  - `withSequence(withTiming(1, 120), withTiming(0, 450))` on borderFlash shared value → drives red flash
  - `ZoomIn.springify().damping(12)` on checkmark badge when found
  - `ZoomIn.springify()` / `ZoomOut` on Check Answer button
- Gesture handlers: `Gesture.Tap()` per tile (disabled when answered/already found); `Gesture.Tap()` on Check button
- Feedback: `expo-haptics` (Light on correct, Medium on wrong, Success/Error on submit)
  + `speechManager` instruction on mount + feedback on submit (700ms delay before `onResult`)
- Image rendering: `AssetDisplay` component resolves shape assets from `assetMap.js`
  (`shape_circle`, `shape_square`, `shape_triangle`, `shape_rectangle`)
- Layout: 3-column grid via `flexDirection: 'row', flexWrap: 'wrap'`, tiles at `width: '30%'`, `aspectRatio: 1`
- Design system: no shadows, tonal tokens (`surfaceContainerHigh` untapped → `surfaceContainerLow` found),
  `Lexend-Bold` on Check button, `PlusJakartaSans-SemiBold` hint

### 2. `content/game-data/quarter-1/grade1-q1-lesson1-shapes/shapeHuntQuestionBank.json`
Example bank — 6 questions validating the engine end-to-end:

| # | Level | Difficulty | Question | Target | Grid size |
|---|---|---|---|---|---|
| 1 | concrete | Easy | "Tap all the circles!" | 3 circles | 6 |
| 2 | concrete | Easy | "Tap all the triangles!" | 3 triangles | 6 |
| 3 | concrete | Medium | "Find all the squares!" | 3 squares | 7 |
| 4 | pictorial | Medium | "Tap all shapes with 4 sides!" | 2 squares + 2 rectangles | 7 |
| 5 | pictorial | Hard | "Find every shape with 3 corners!" | 3 triangles | 8 |
| 6 | abstract | Hard | "Tap shapes that are NOT circles!" | 5 non-circles | 8 |

All questions use `type: "SHAPE_HUNT"` (would lowercase to `shape_hunt` when routed by the Orchestrator).

---

## Verification Checklist

- [ ] Import engine into a test screen with a hardcoded question object
- [ ] Entrance stagger plays for all tiles on mount
- [ ] Correct tap → spring pop + green border + checkmark badge → tile locks
- [ ] Wrong tap → shake + red border flash → tile resets to normal → no badge
- [ ] Check button stays hidden until `foundSet.size === targetCount`
- [ ] Pressing Check with zero wrong taps → success haptic + speech → `onResult(true, [...assetIds])`
- [ ] Pressing Check with wrong taps along the way → error haptic + speech → `onResult(false, ...)`
- [ ] Expo Speech fires instruction on mount and feedback on submit
- [ ] 8-item grid on 320px-wide screen → all tiles tappable, no overflow
- [ ] Rapid-tap wrong tiles → shake animations don't interfere with each other (per-tile shared values)

---

## Notes & Follow-ups

- **Wiring deferred**: Adding `import` + `case 'shape_hunt'` to `CurriculumOrchestrator.jsx`
  and registering the bank in `lessonResolver.js` Lesson 1 entry are separate future tasks.
- **Asset dependency**: Engine relies on `shape_circle`, `shape_square`, `shape_triangle`,
  `shape_rectangle` registered in `src/constants/assetMap.js`. Already present.
- **Future enhancements**:
  - Shuffle items client-side on mount for replay variation
  - Add per-tile "wobble attract" animation after 5s idle to hint at unfound targets
  - Swap emoji/illustration sets via `assetId` for thematic variants (animals, vehicles)
- **Pedagogical coverage**: Bank covers MG.1.1 (concrete recognition), MG.1.2 (property-based:
  sides/corners), and MG.1.3 (abstract: negation). Ready to drop-in as a full production bank
  alongside or in place of the existing N/A banks once wiring is done.
