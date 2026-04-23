# 2026-04-23: Curriculum Engine Implementation & Alignment

## Summary
Today's development focused on enhancing the Grade 1 Measurement curriculum by implementing a new `COMPARE_PICKER` engine, refactoring the `VISUAL_PICKER` engine for more complex operations, and aligning three major question banks with "Tactile Bulky" standards.

---

## 1. Engine Implementations & Refactors

### [NEW] ComparePickerEngine
Added a specialized engine for comparing quantities (e.g., "Which pile is bigger?").
- **Architecture**: Dual vertical tiles using `TileCard` sub-components.
- **Visuals**: Dynamic emoji piles (repeating `metadata.emoji`) with a wrap grid.
- **Interactions**: Tonal-layered tactile response (`translateY: 4`, `borderBottom: 2`) with spring animations.
- **Integration**: Added to `CurriculumOrchestrator` and validated via `engineLabQuestionBank`.

### [REFACTOR] VisualPickerEngine
Enhanced the existing picker to support word problems involving operations beyond addition.
- **Dynamic Operator**: Added support for `metadata.operator` in equation labels and tokens.
- **Logic**: Now correctly renders subtraction (`-`) for problems like "Liza cuts off 7 hand-spans."
- **Backward Compatibility**: Defaults to `+` if no operator is specified.

---

## 2. Curriculum Alignment Logs

### Length Comparison (`lengthComparisonQuestionBank.json`)
Migrated to `COMPARE_PICKER` to utilize visual piles.
- **Refactor**: Converted `PICKER` choices into `pile_a`/`pile_b` schema.
- **Visuals**: Assigned emojis (Stick 📏, Giraffe 🦒, Banana 🍌) to represent relative lengths.
- **Validation**: Verified engine-required key mapping for all comparison tasks.

### Length Measurement (`lengthMeasurementQuestionBank.json`)
Pedagogically shifted from counting to comparison tasks.
- **Refactor**: Unified schema to `COMPARE_PICKER`.
- **Consistency**: Used distinct emojis (Pencil ✏️ vs Crayon 🖍️) to reinforce relative magnitude concepts.

### Measurement Word Problems (`measurementWordProblemsQuestionBank.json`)
Migrated to `VISUAL_PICKER` for interactive storytelling.
- **Constraint**: Enforced strict **3-option limit** for all questions.
- **Features**: Enabled equation pills using the new dynamic operator support for subtraction tasks.
- **Aesthetics**: Assigned storyteller icons (`icon_boy`, `icon_girl`) to all challenges.

---

## 3. Schema References

### COMPARE_PICKER
```json
{
  "type": "COMPARE_PICKER",
  "answer": "pile_a",
  "metadata": { "emoji": "🍎", "pile_a": 9, "pile_b": 4 }
}
```

### VISUAL_PICKER
```json
{
  "type": "VISUAL_PICKER",
  "metadata": { "addends": [20, 7], "operator": "-", "options": ["13", "17", "27"] }
}
```

---
*Consolidated by Antigravity*
