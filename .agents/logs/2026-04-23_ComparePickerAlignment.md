# Engine Alignment Log: ComparePickerEngine

**Date**: 2026-04-23
**Target Engine**: `ComparePickerEngine.jsx`
**Target Question Bank**: `lengthComparisonQuestionBank.json`

## Changes Summary

Refactored the length comparison question bank to align with the specialized `COMPARE_PICKER` engine schema. This migration ensures that comparison questions are visualized correctly using emoji piles instead of generic picking options.

### 1. Schema Migration
- **Type Change**: `PICKER` → `COMPARE_PICKER`
- **Metadata Refactoring**:
    - Removed: `options` array.
    - Added: `pile_a` (first quantity), `pile_b` (second quantity).
    - Added: `emoji_a` and `emoji_b` for distinct visual representation of compared objects.
    - Fallback: The engine supports a single `emoji` key for backward compatibility.
- **Answer Mapping**:
    - Contextual answers (e.g., `"giraffe"`) were mapped to the engine-required keys (`"pile_a"` or `"pile_b"`).

### 2. Alignment Logic

| Question ID | Logic | Magnitude A | Magnitude B | Emoji A | Emoji B | Answer |
|-------------|-------|-------------|-------------|---------|---------|--------|
| `mg_2_comp_001` | Longer stick | 8 | 5 | 📏 | 📏 | `pile_a` |
| `mg_2_comp_004` | Taller giraffe | 10 | 6 | 🦒 | 🐘 | `pile_a` |
| `mg_2_comp_007` | Shorter banana | 4 | 6 | 🍌 | 🥕 | `pile_a` |

## Impact
- Questions are now compatible with `CurriculumOrchestrator` when selecting the `COMPARE_PICKER` engine.
- Visual representation of length is now concretized using emoji units.

---
*Created by Antigravity*
