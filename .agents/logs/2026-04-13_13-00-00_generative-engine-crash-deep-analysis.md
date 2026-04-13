# Deep Analysis: Generative Engine Crash on Any Answer

**Date:** 2026-04-13  
**Affected Stack:** Generative (G2–G6)  
**Symptom:** App exits Expo entirely on any answer submission — right or wrong  
**Status:** Analysis complete. Crash source not yet confirmed — awaiting device error log.

---

## Investigation Scope

The crash happens on **every answer** (right and wrong) in **all generative engines**. Since wrong answers do not call `generateNextProblem`, do not change `currentIndex`, and do not remount the engine — the crash must occur in the shared answer path:

```
Engine calls onAnswer()
  → handleAnswer() in GenerativeOrchestrator
    → setShowFeedback(true)
      → ResultModal renders
```

This means the crash is most likely in **ResultModal rendering**, not in the engine logic.

---

## Components Audited

### 1. All Generative Engines — `onAnswer` call signatures

Every engine was read and confirmed to pass a valid string as `userAnswerStr`:

| Engine | Call |
|---|---|
| `OrderingEngine` | `onAnswer(isCorrect, placedOrder.join(', '))` |
| `DecimalOrderingEngine` | `onAnswer(isCorrect, placedOrder.join(', '))` |
| `RoundingEngine` | `onAnswer(isCorrect, String(selectedChoice))` |
| `PlaceValueEngine` | `onAnswer(isCorrect, String(selectedChoice))` |
| `TimeMoneyEngine` | `onAnswer(isCorrect, String(value))` |
| `AdvancedFractionsEngine` | `onAnswer(isCorrect, \`${numerator}/${denominator}\`)` |
| `MeasurementEngine` | `onAnswer(isCorrect, String(selectedChoice))` |
| `MatchingEngine` | `onAnswer(true, "N Pairs Matched")` — only on full completion |

**Result: All safe. No engine passes null/undefined.**

---

### 2. `ResultModal` — rendering path

**File:** `src/Components/Game/Global/ResultModal.jsx`

Key code paths checked:

```javascript
const metadata = problem?.metadata || {};  // Safe — defaults to {}
```

```javascript
// Line 105 — only runs when wrong answer AND userAnswer exists
renderVisualizer(userAnswer.split(', '), "Your Try", false)
```
All engines pass strings, so `.split(', ')` is safe.

```javascript
// getCorrectAnswerArray — returns array with fallback
if (metadata.correctOrder) return metadata.correctOrder;
if (problem?.answer !== undefined) return [problem.answer];
if (problem?.target !== undefined) return [problem.target];
if (problem?.pairs) return ['Match the pairs'];
return [''];  // Safest fallback
```
**Result: No crash path identified in ResultModal's data handling.**

---

### 3. `SequenceVisualizer`

**File:** `src/Components/Game/Global/Visualizers/SequenceVisualizer.jsx`

Has guard:
```javascript
if (!items || items.length === 0) return null;
```
Only called when `metadata.type === 'ordering-numbers' || 'ordering-decimals'`.  
**Result: Safe.**

---

### 4. `speechManager.speakFeedback`

**File:** `src/utils/speechManager.js`

```javascript
speakFeedback(text, isCorrect = true) {
    if (!text) return;  // ← guard exists
    this.stop();
    Speech.speak(text, { ... });  // ← NO try-catch here
}
```

`Speech.speak()` itself has no `try-catch` wrapper. If `expo-speech` throws natively on the device (unavailable TTS engine, Android version incompatibility), the error propagates uncaught through the `useEffect` in `ResultModal` and crashes the app.

**However:** `CurriculumOrchestrator` also calls `speechManager.speakInstruction()` in a `useEffect` and that stack works fine. So if `expo-speech` were broken, G1 would also crash. This makes `speechManager` less likely to be the root cause.

**Result: Unlikely crash source, but cannot be fully ruled out without device logs.**

---

### 5. `Colors.success`

```javascript
success: '#006e2a',  // line 34 of colors.js
```
**Result: Defined. Not the crash.**

---

### 6. `getGameTheme` — grade coverage

**File:** `src/theme/gameThemes.js`

Only **G1** and **G2** are defined. G3–G6 fall back to G1 via:
```javascript
return GameThemes[gradeKey] || GameThemes.G1;
```

G1 and G2 both have complete `fontFamily` objects. Fallback is safe.  
**Result: No crash path here.**

---

### 7. Generator Registry

**File:** `src/utils/generators/registry.js`

All topic IDs used by the `GenerativeOrchestrator` ENGINE_REGISTRY map correctly to generator functions. `getGeneratorById` returns `null` (with a `console.warn`) for unknown IDs — the orchestrator guards against null with `if (generator)`.

**Note:** `'multiplication'` is in the Expo Router's `isGenerative` list and has a registry entry, but has **no engine** in `ENGINE_REGISTRY`. This shows a placeholder text but does not crash.

---

## Confirmed Safe Summary

| Check | Status |
|---|---|
| Engine `onAnswer` strings | ✅ All valid |
| `ResultModal` data handling | ✅ Safe |
| `SequenceVisualizer` | ✅ Guarded |
| `Colors.success` | ✅ Defined |
| `speechManager.speakFeedback` | ✅ Probably safe (see note) |
| `getGameTheme` fallback | ✅ Safe |
| Generator registry | ✅ Correct |

---

## Unresolved — Needs Device Error Log

The exact crash line cannot be confirmed from code reading alone. The crash happens on every answer (right and wrong) in the generative stack only, which points to `ResultModal`'s render path with generative problem data.

**To find the root cause:**
1. Run `npm start` and reproduce the crash
2. Check the **Metro terminal** for the red-screen stacktrace
3. On Android, check `adb logcat` for native crash output
4. Share the error message and line number

---

## Known Fixes Already Applied (Previous Session)

From log `2026-04-13_12-00-00_generative-engine-crash-fix.md`:

- `MatchingEngine`: Fixed Hermes TDZ crash (`isTablet` order), pure state updater, win-condition `useEffect`
- `TimeMoneyEngine`: Added `useRef` + cleanup for answer dispatch timeout
- `GenerativeOrchestrator`: Wrapped `generateNextProblem` in try-catch

These fixes addressed the **correct-answer** crash path. The **wrong-answer** crash path (present in all engines) was not covered by those fixes and requires the device error log to diagnose.
