# Engine Alignment Log: Length Measurement

**Date**: 2026-04-23
**Target Engine**: `ComparePickerEngine.jsx`
**Target Question Bank**: `lengthMeasurementQuestionBank.json`

## Changes Summary

Refactored the length measurement question bank into a comparison-focused bank. The original measurement (counting) questions were pedagogically shifted into comparison tasks to align with the `ComparePickerEngine` specialized UI.

### 1. Schema Migration
- **Type Change**: `NUMPAD` / `N/A` → `COMPARE_PICKER`
- **Metadata Refactoring**:
    - Implemented `pile_a` and `pile_b` magnitudes.
    - Added distinct emojis (`emoji_a`, `emoji_b`) for each comparison object.
- **Answer Mapping**:
    - Refactored questions to use the `"pile_a"` / `"pile_b"` engine schema.

### 2. Alignment Logic

| Question ID | Refined Question | Emoji A | Emoji B | Answer | Magnitude A | Magnitude B |
|-------------|------------------|---------|---------|--------|-------------|-------------|
| `mg_2_meas_001` | Which is longer: the pencil or the crayon? | ✏️ | 🖍️ | `pile_a` | 5 | 3 |
| `mg_2_meas_004` | Which is shorter: the pen or the marker? | 🖊️ | 🖍️ | `pile_a` | 4 | 7 |
| `mg_2_meas_007` | Which is longer: the ruler or the pencil? | 📏 | ✏️ | `pile_a` | 12 | 7 |

## Rationale
- **Pedagogical Shift**: Moving from pure counting to comparison reinforces the concept of relative magnitude in measurement.
- **Visual Consistency**: Leverages the "Tactile Bulky" engine's ability to show distinct objects side-by-side.

---
*Created by Antigravity*
