# Fix: Generative Engine Crash on Correct Answer

**Date:** 2026-04-13  
**Affected Stack:** Generative (G2–G6)  
**Severity:** Critical — app exited Expo on correct answer submission

---

## Problem

The app crashed and exited Expo entirely when a correct answer was submitted in any generative engine game. Wrong answers worked fine. The bug only surfaced at runtime (not visible in dev/Babel transpiled builds in all cases).

---

## Root Causes

### Bug 1 — `MatchingEngine`: `isTablet` used before declaration (CRITICAL)

**File:** `src/Components/Game/Generative/Engines/MatchingEngine.jsx`

`columns` was declared before `isTablet`, meaning `isTablet` was referenced before its `const` binding was initialized. Under the **Hermes JS engine** (production), this throws a `ReferenceError` (Temporal Dead Zone violation). In dev/Babel builds the `const` was silently treated as `undefined`, masking the bug.

**Fix:** Swapped the two declarations so `isTablet` is declared first.

```javascript
// Before (broken):
const columns = isTablet ? 4 : (cardCount <= 8 ? 2 : 3);
const isTablet = width > 768;

// After (fixed):
const isTablet = width > 768;
const columns = isTablet ? 4 : (cardCount <= 8 ? 2 : 3);
```

---

### Bug 2 — `MatchingEngine`: Side effect inside `setMatchedIds` state updater (HIGH)

**File:** `src/Components/Game/Generative/Engines/MatchingEngine.jsx`

`onAnswer` was called via `setTimeout` inside a `setMatchedIds` state updater function. React's contract requires updater functions to be pure. React (especially in Strict Mode) may invoke updaters multiple times, causing `onAnswer` to fire twice — resulting in double score increments and two `setShowFeedback(true)` calls in the orchestrator.

**Fix:** Made the updater pure; moved win-condition detection into a `useEffect` with cleanup.

```javascript
// Before (broken — side effect inside state updater):
setMatchedIds(mPrev => {
  const newMatched = [...mPrev, updated[0], updated[1]];
  if (newMatched.length === cards.length && cards.length > 0) {
    setTimeout(() => {
      onAnswer(true, `${(cards.length)/2} Pairs Matched`);
    }, 800);
  }
  return newMatched;
});

// After — pure updater:
setMatchedIds(mPrev => [...mPrev, updated[0], updated[1]]);

// New useEffect for win condition:
useEffect(() => {
  if (cards.length > 0 && matchedIds.length === cards.length) {
    const timeoutId = setTimeout(() => {
      onAnswer(true, `${cards.length / 2} Pairs Matched`);
    }, 800);
    return () => clearTimeout(timeoutId);
  }
}, [matchedIds, cards, onAnswer]);
```

---

### Bug 3 — `TimeMoneyEngine`: Untracked `setTimeout` with no cleanup (MEDIUM)

**File:** `src/Components/Game/Generative/Engines/TimeMoneyEngine.jsx`

The 400ms delay before calling `onAnswer` was not tracked — if the component unmounted before it fired, the stale callback would call into a dismounted orchestrator, potentially corrupting Zustand session state.

**Fix:** Added `useRef` to track the timeout and a cleanup `useEffect` to cancel it on unmount.

```javascript
const answerTimeoutRef = useRef(null);

useEffect(() => {
  return () => {
    if (answerTimeoutRef.current) clearTimeout(answerTimeoutRef.current);
  };
}, []);

// Inside handleChoiceSelect:
answerTimeoutRef.current = setTimeout(() => {
    onAnswer(isCorrect, String(value));
}, 400);
```

---

### Bug 4 — `GenerativeOrchestrator`: Unguarded generator call (MEDIUM)

**File:** `src/Components/Game/Generative/Orchestrators/GenerativeOrchestrator.jsx`

If a procedural generator throws during `generateNextProblem()` inside `handleFeedbackComplete`, the error propagated uncaught out of an event handler, crashing the JS thread. This would only surface on correct answers (wrong answers don't call `generateNextProblem`).

**Fix:** Wrapped the generator call in a try-catch.

```javascript
const handleFeedbackComplete = useCallback(() => {
  setShowFeedback(false);
  if (isLastAnswerCorrect) {
    try {
      generateNextProblem(templateData?.rules);
    } catch (e) {
      console.error('[GenerativeOrchestrator] Generator error:', e);
    }
    setCurrentIndex(prev => prev + 1);
  }
}, [isLastAnswerCorrect, generateNextProblem, templateData]);
```

---

## Files Changed

| File | Change |
|------|--------|
| `src/Components/Game/Generative/Engines/MatchingEngine.jsx` | Swapped `isTablet`/`columns` order; pure `setMatchedIds` updater; win-condition `useEffect` with cleanup |
| `src/Components/Game/Generative/Engines/TimeMoneyEngine.jsx` | Added `useRef` + cleanup `useEffect` for answer dispatch timeout |
| `src/Components/Game/Generative/Orchestrators/GenerativeOrchestrator.jsx` | Wrapped `generateNextProblem` in try-catch |

---

## Verification Checklist

- [ ] G2 "Place Patrol" (PlaceValueEngine) — correct answer advances without crash
- [ ] G2 "Round the Bend" (RoundingEngine) — correct answer advances without crash
- [ ] G3 "Pair the Products" (MatchingEngine) — all pairs matched, advances without crash
- [ ] G3 "Clock & Coin" (TimeMoneyEngine) — correct answer advances without crash
- [ ] G4 "Fraction Forge" (AdvancedFractionsEngine) — correct answer advances without crash
- [ ] Wrong answers on all engines re-show the same problem (no regression)
