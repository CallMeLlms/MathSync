# Curriculum Question Bank Schema Alignment & Engine Readiness

**Date**: 2026-04-21
**Topic**: Technical Alignment of Question Bank Schemas with Engine Architecture
**Scope**: 30+ Files across Q1-Q4 (Grade 1 Curriculum)

## Executive Summary

Reversed a project-wide regression where narrative-based questions were incorrectly routed to the `NUMPAD` engine, leading to rendering failures. Standardized the `NUMPAD` schema by injecting missing `equation` objects and implemented a strict `N/A` placeholder policy for story-driven content.

Building on the initial alignment, performed an in-depth refactor of the `NUMPAD` engine data constraints across the Grade 1 curriculum. Specifically, ensured that any question typed as `NUMPAD` contains the `equation` object (with `left`, `operator`, `blank` fields) and a `maxDigits` property.

---

## 🛠 What Changed?

### 1. Engine Type Refactoring
- **Retyped 20+ Questions to `N/A`**: Shifted non-mathematical prompts away from the `NUMPAD` type. This includes date logic (Calendar), chronological sequences (Time), and story-driven word problems (Money Problems).
- **Consolidated `NUMPAD` Usage**: Strictly reserved the `NUMPAD` type for pure arithmetic expressions.
- **Conceptual Place Value Update**: The conceptual question `na_2_pv_007` (asking for the place value of a digit in 84) was successfully re-categorized from `NUMPAD` to `N/A` to prevent it from failing in the `NumpadEngine`.

### 2. Schema Standardization
- **Injected `equation` Objects**: For all valid `NUMPAD` questions, added the required `{ left, operator, blank }` schema. This allows the `NumpadEngine` to correctly map question data to physical UI slots.
- **Injected `maxDigits`**: Added the `maxDigits` property to ensure the engine correctly limits expected inputs.
- **Example Implementation**:
```json
{
  "type": "NUMPAD",
  "equation": {
    "left": "72 + 14",
    "operator": "=",
    "blank": "right"
  },
  "maxDigits": 2
}
```

### 3. Detailed Files Updated
- `content/game-data/quarter-2/grade1-q2-lesson3-place-value/placeValueQuestionBank.json` (Retyped `na_2_pv_007` to `N/A`)
- `content/game-data/quarter-3/grade1-q3-lesson1-data/pictographInterpretationQuestionBank.json` (Injected `equation` and `maxDigits` for `dp_3_int_007`)
- `content/game-data/quarter-3/grade1-q3-lesson2-subtraction-to-20/basicSubtractionTo20QuestionBank.json` (Injected `equation` and `maxDigits` for `na_3_sub20_007`)

### 4. Comprehensive Audit Log
- Created a persistent tracking table in `implementation_plan.md` that maps every `N/A` question to its intended future engine type.

---

## 🎯 Purpose of This Change

### 1. Stability (Zero-Crash Policy)
The `NumpadEngine` assumes the presence of an `equation` object to render its central card. When this object is missing, the engine renders an empty card or crashes. By retyping these to `N/A`, the `CurriculumOrchestrator` can now skip rendering attempts for incompletely defined engines.

### 2. UI/UX Integrity
Fixed the "Empty Problem Box" issue where students would see a text prompt but no math expression to solve, leading to pedagogical confusion.

### 3. Data Integrity
Cleaned the "catch-all" overuse of `NUMPAD`, ensuring that the `type` field accurately reflects the interaction model required for the question.

---

## 🚀 Future Use & Strategic Road Map

### 1. Migration to WORD_PROBLEM Engine
The questions currently typed as **`N/A`** are strategically marked for high-priority migration. Once the `WordProblemEngine` is finalized and registered in the `CurriculumOrchestrator`, a simple global search-and-replace of `N/A` → `WORD_PROBLEM` will activate 20+ dormant lessons.

### 2. Engine-Library Expansion
The **Audit Log** acts as a backlog for engine development. It specifically highlights the need for:
- **`TimeLogicEngine`**: For calendar and clock-based chronological prompts.
- **`StoryCardEngine`**: For text-heavy scenarios that require a dedicated "Prompt Card" UI instead of a math equation display.

### 3. Automated Validation
This structural alignment enables future CI/CD scripts to validate question banks against specific JSON schemas, preventing similar misalignments in future Grade implementations.
