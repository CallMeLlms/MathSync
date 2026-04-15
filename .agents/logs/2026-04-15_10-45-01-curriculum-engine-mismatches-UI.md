# Curriculum Engine-Question Mismatch Fixes

**Date**: 2026-04-15
**Scope**: Grade 1 Lessons 1 & 2 (Geometric Blooms, Pairing Petals)

## Problem

Several Grade 1 questions were routed to engines that could not render them correctly:

1. `SHAPE_HUNT` questions lacking the required `items[]` array → empty grid.
2. `DRAGDROP` question using one question-level `assetId` across all draggable items → every choice rendered the same image.
3. `NUMPAD` questions with no `equation` field but pictorial/visual content → blank equation card.
4. `NUMPAD` questions that were actually text-only word problems → blank equation card.

## Changes

### New engines

- `src/Components/Game/Curriculum/Engines/VisualNumpadEngine.jsx`
  Type key `VISUAL_NUMPAD`. Renders a visual group card driven by `metadata` (`addends`, `group_a/b`, or `count`) + answer box + numpad.

- `src/Components/Game/Curriculum/Engines/WordProblemEngine.jsx`
  Type key `WORD_PROBLEM`. Renders a story card (prominent text + optional context icon) + answer box + numpad.

### Engine + orchestrator updates

- `CurriculumOrchestrator.jsx`: added `visual_numpad` and `word_problem` switch cases + imports; skips the shared top-asset slot for these two engines (each owns its own visual layout). Added `key={currentQuestionIndex}` to `NumpadEngine` for state isolation parity with the new engines.
- `DragAndDropEngine.jsx`: `dragItems` now supports `{value, assetId}` objects in addition to legacy strings. Per-item `assetId` is forwarded to `DraggableItem` / `DroppedItemDisplay` so each choice can show a distinct asset.

### Question bank fixes

- `shapesQuestionBank.json` — `mg_1_shapes_001`, `mg_1_shapes_004`: `SHAPE_HUNT` → `PICKER` with text-label options.
- `shapeComposingQuestionBank.json` — `mg_1_comp_001`: `dragItems` restructured to per-item `{value, assetId}` objects (triangle / circle / square).
- `basicAdditionQuestionBank.json` — `na_1_basicadd_001` and `na_1_basicadd_004` retyped to `VISUAL_NUMPAD`; `na_1_basicadd_007` gains the missing `equation` field.
- `countingQuestionBank.json` — `na_1_count_001` and `na_1_count_004` → `VISUAL_NUMPAD`; `na_1_count_007` → `WORD_PROBLEM`.
- `wordProblemsAdditionQuestionBank.json` — all 3 questions retyped `NUMPAD` → `WORD_PROBLEM` (bank remains commented out in `lessonResolver.js` but is now ready to re-enable).

## Verification

- Lesson 1: "Tap the block that is a triangle" and "Which object is shaped like a rectangle?" now render text choices via `PickerEngine`. "Which two shapes make a square?" shows the correct per-item asset on each draggable.
- Lesson 2: Concrete/pictorial counting + addition questions now render their groups via `VisualNumpadEngine`; equation "What is 5 + 4?" works in `NumpadEngine`; "What number comes just after 49?" renders via `WordProblemEngine`.
