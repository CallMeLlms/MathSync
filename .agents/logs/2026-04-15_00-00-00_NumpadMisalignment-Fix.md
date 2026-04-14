# Fix: NUMPAD Engine Misalignment in Question Banks
**Date:** 2026-04-15  
**Scope:** `content/game-data/` (Q3–Q4)  
**Type:** Data Fix (JSON-only, no engine code changed)

---

## Problem

8 questions across 6 JSON files had `type: "NUMPAD"` but non-numeric answers (day names, month names, time strings, letter sequences). In-game, these rendered a number keypad that the student could never use to correctly answer the question.

## Root Cause

Questions were authored with placeholder `NUMPAD` types at the abstract/hard level before the correct engine was determined. The `PickerEngine` — which handles string answers via multiple-choice tiles — was the correct fit for all 8 cases.

## Fix Applied

Changed `type` from `NUMPAD` → `PICKER` and added `metadata.options` array to each affected question. No engine or orchestrator code required changes.

---

## Files Modified

| File | Questions Fixed |
|---|---|
| `content/game-data/quarter-3/grade1-q3-lesson4-patterns/complexPatternsQuestionBank.json` | `na_3_comp_007` — letter pattern answer |
| `content/game-data/quarter-3/grade1-q3-lesson4-patterns/repeatingPatternsQuestionBank.json` | `na_3_pat_007` — multi-value number sequence answer |
| `content/game-data/quarter-4/grade1-q4-lesson4-calendar-turns/calendarSequenceQuestionBank.json` | `mg_4_calseq_004` (day name), `mg_4_calseq_007` (month name) |
| `content/game-data/quarter-4/grade1-q4-lesson4-calendar-turns/usingCalendarQuestionBank.json` | `mg_4_caluse_004` (day name), `mg_4_caluse_007` (date string) |
| `content/game-data/quarter-4/grade1-q4-lesson3-time-clocks/clockMatchingQuestionBank.json` | `na_4_match_007` — Yes/No answer |
| `content/game-data/quarter-4/grade1-q4-lesson3-time-clocks/analogTimeQuestionBank.json` | `mg_4_clock_004` — time string answer |

**Questions left untouched (valid NUMPAD):** `mg_4_caluse_001` (answer: 3), `mg_4_clock_001` (answer: 12), `mg_4_clock_007` (answer: 30)

---

## Verification

- Lesson 14 (Pattern Trails): abstract pattern questions now show option tiles
- Lesson 18 (Garden Clock Tower): `mg_4_clock_004` now shows time choices
- Lesson 19 (Calendar Clearing): day/month/date questions now show picker tiles
- Remaining numeric NUMPAD questions in same banks unaffected
