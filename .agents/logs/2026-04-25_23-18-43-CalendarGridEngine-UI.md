# CalendarGridEngine — Interactive Calendar Date-Picker

**Date:** 2026-04-25
**Scope:** New Curriculum Stack engine (G1, MG.4.11 Calendar Use)

## Summary

Added a new engine type `CALENDAR_GRID` that renders an interactive monthly calendar grid. The student taps a date cell on the rendered calendar to answer questions like "What is the date of the first Monday?" — replacing the previous fallback to `NUMPAD` for these question types.

This complements the existing `CalendarPageEngine` (text-card multiple choice) by providing a true calendar-reading interaction with proper day-of-week alignment.

## Files Touched

| File | Change |
|---|---|
| `src/Components/Game/Curriculum/Engines/CalendarGridEngine.jsx` | **new** — full engine implementation |
| `src/Components/Game/Curriculum/CurriculumOrchestrator.jsx` | added `CalendarGridEngine` import + `'calendar_grid'` switch case |
| `content/game-data/dev/engineLabQuestionBank.json` | added 3 `CALENDAR_GRID` lab questions; added `"calendar_grid"` to `engines_covered` |

## Engine Contract

**Type string:** `CALENDAR_GRID` (uppercase in JSON, lowercased to `calendar_grid` by orchestrator).

**Required `data` shape:**
```json
{
  "type": "CALENDAR_GRID",
  "question": "Tap the FIRST MONDAY of March 2025.",
  "answer": 3,
  "metadata": {
    "month": "March",
    "year": 2025,
    "startDay": 6,
    "totalDays": 31
  }
}
```

- `answer` — integer (the date number)
- `metadata.startDay` — 0 (Sun) to 6 (Sat); which weekday the 1st of the month falls on
- `metadata.totalDays` — 28/29/30/31

**Output:** standard `onResult(isCorrect, [String(selectedDate)])` contract.

## Visual Design

- Bulky-bordered date cells (`borderWidth: 2`, `borderBottomWidth: 6`) with sink-on-press animation
- Stylized month/year masthead with primary-color top strip
- 7-column grid with `Sun…Sat` weekday headers
- Empty leading/trailing cells render as transparent placeholders so the 1st aligns to its correct weekday column
- Idle / Selected / Correct / Wrong color states (matches `CalendarPageEngine` palette)
- Confetti overlay on correct
- Wrong-answer shake on the selected cell only
- TTS narration via `speechManager`
- Haptics on cell tap (Light) and Check press (Medium)

## Routing

`calendar_grid` is **not** in `GESTURE_ENGINES` — it uses plain `Pressable`, so the orchestrator wraps it in `ScrollView` automatically (correct for a tall grid layout).

## Lab Test Coverage

3 questions added to `engineLabQuestionBank.json`:
- March 2025 — first Monday → 3 (startDay=Sat)
- April 2025 — third Friday → 18 (startDay=Tue)
- February 2025 — last day → 28 (startDay=Sat)

These exercise leading-empty alignment, mid-week starts, and the shortest-month edge case.

## Next Steps (not yet executed)

The original target question `mg_4_caluse_001` in `usingCalendarQuestionBank.json` still uses `NUMPAD`. Once the new engine is validated in the lab, that bank can be migrated to use `CALENDAR_GRID` with proper `startDay` / `totalDays` metadata.
