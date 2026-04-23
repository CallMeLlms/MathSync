# 2026-04-23 — ComparePickerEngine Implementation

## Summary
Added a new curriculum engine `COMPARE_PICKER` for comparing quantities questions (e.g. "Which pile is bigger?"). Engine presents two large vertical box tiles side-by-side, each displaying a pile of emoji icons repeated N times to represent the quantity. Student taps the bigger pile and confirms with CHECK.

---

## Files Created

### `src/Components/Game/Curriculum/Engines/ComparePickerEngine.jsx`
- New standalone curriculum engine following the `{ data, onResult }` props contract
- Two full-height `TileCard` sub-components in a vertical column layout
- Emoji pile rendered by repeating `metadata.emoji` up to 10 times in a wrap grid
- Bulky tactile tile design: `borderBottomWidth: 6`, `borderRadius: 20`, `minHeight: 180`
- Press animation: `translateY` 0→4, `borderBottomWidth` 6→2 (Reanimated spring, same config as PickerEngine)
- Tile states: `idle` → `selected` → `correct` / `wrong` with Ionicons badge
- Haptics + `speechManager.speakInstruction` on question mount
- No `assetId` dependency — emoji is declared directly in `metadata.emoji`

---

## Files Modified

### `src/Components/Game/Curriculum/CurriculumOrchestrator.jsx`
- Added `import ComparePickerEngine from './Engines/ComparePickerEngine'`
- Added `case 'compare_picker'` to the engine switch statement

### `content/game-data/dev/engineLabQuestionBank.json`
- Added 2 `COMPARE_PICKER` test questions for dev validation:
  - `lab-compare-picker-1`: 🍎 pile of 3 vs 7, answer `pile_b`
  - `lab-compare-picker-2`: ⭐ group of 9 vs 4, answer `pile_a`
- Updated `engines_covered` meta array to include `compare_picker`

---

## Question Bank Schema

```json
{
  "id": "lab-compare-picker-1",
  "type": "COMPARE_PICKER",
  "question": "Which pile of apples is bigger? Tap the bigger pile.",
  "answer": "pile_b",
  "metadata": {
    "emoji": "🍎",
    "pile_a": 3,
    "pile_b": 7
  }
}
```

- `answer` is `"pile_a"` or `"pile_b"` — string key of the larger quantity
- `metadata.emoji` — the emoji character rendered as the pile item
- `metadata.pile_a` / `metadata.pile_b` — integer counts (max 10 displayed)

---

## Design Notes
- Follows MathSync flat/tactile design: no shadows, depth via `borderBottomWidth`
- Colors pulled from `Colors` token set (`surfaceContainerLowest`, `secondaryContainer`, `success`, `error`, `tertiary`)
- Fonts: `Lexend-Black` for count label, `PlusJakartaSans-Medium` reserved for question text (handled by Orchestrator header)
- Engine is "dumb" — no session state, no scoring, orchestrator owns all session logic
