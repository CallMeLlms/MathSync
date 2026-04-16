# Interaction-First Rollout — Phase 2 (Content Audit + Engine Strengthening)

**Date:** 2026-04-16  
**Scope:** All Grade 1 question banks — NUMPAD and PICKER audit and reclassification; VisualNumpadEngine and PickerEngine upgrades

---

## Problem Addressed

After Phase 1 MVP validation, the underlying content distribution was audited:
- NUMPAD: **80 questions (40%)** — many were sequence/missing-number tasks, not arithmetic
- PICKER: **38 questions (19%)** — text Q&A model, ill-suited for visual Grade 1 content
- Combined: **59% of all questions** were text-heavy despite Grade 1 covering shapes, patterns, measurement, money, and time

Root cause: NUMPAD and PICKER schemas are trivially simple to author, so they were overused. Content that demands visual/spatial reasoning was shoehorned into text engines.

### NUMPAD Three-Cognitive-Jobs Problem (🚨 Key Finding)

| Job | Engine | Correct? |
|---|---|---|
| Pure arithmetic recall: "What is 5 + 3?" | NUMPAD | ✅ |
| Concrete counting: "3 apples + 4 oranges = ?" | VISUAL_NUMPAD | ✅ |
| Symbolic/sequence: "2, 4, __, 8 — what's missing?" | NUMPAD ❌ | Wrong — no visual context |

VISUAL_NUMPAD could not serve sequence questions because its visual zone renders tile groups (for counting), not number sequences. No engine was correctly serving this job.

---

## What Changed

### 1. VisualNumpadEngine.jsx — Sequence Display Mode Added

New `SequenceCard` sub-component and `'sequence'` rendering mode inside `renderVisualZone()`.

**New schema:**
```json
{
  "type": "VISUAL_NUMPAD",
  "question": "What number is missing?",
  "answer": 57,
  "maxDigits": 2,
  "metadata": { "sequence": [55, 56, null, 58] }
}
```

**Behavior:**
- `metadata.sequence` is an array → `visualGroups.mode = 'sequence'`
- Numbers → solid card with Lexend-Black number text
- `null` → dashed-border card with pulsing `?` (blinkOpacity animation, 560ms period)
- Cards stagger in with `ZoomIn.springify().delay(index * 60)`
- All existing modes (`two-group`, `count`, `single`, `none`) fully preserved
- No orchestrator changes, no new engine case

**Sequence priority:** Checked first in the `visualGroups` useMemo, before `addends`/`count`/etc.

### 2. JSON Migrations — NUMPAD → VISUAL_NUMPAD (Sequence Mode)

5 questions migrated across 2 files:

**`countingSequenceQuestionBank.json`:**
- `na_2_seq_001`: "What number comes just before 21?" → `sequence: [null, 21]`, answer: 20
- `na_2_seq_004`: "What number is missing? 55, 56, __, 58." → `sequence: [55, 56, null, 58]`, answer: 57
- `na_2_seq_007`: "What number is 10 more than 40?" → **kept NUMPAD** (pure arithmetic, no sequence context needed)

**`skipCountingQuestionBank.json`:**
- `na_2_skip_001`: "Count by 2s: 2, 4, 6, 8, __?" → `sequence: [2, 4, 6, 8, null]`, answer: 10
- `na_2_skip_004`: "Count in 2s: 2, 4, 6, 8, 10, __?" → `sequence: [2, 4, 6, 8, 10, null]`, answer: 12
- `na_2_skip_007`: "Skip counting: 40, 50, 60, __, 80." → `sequence: [40, 50, 60, null, 80]`, answer: 70

### 3. JSON Migrations — PICKER → VISUAL_NUMPAD (Sequence Mode)

**`numberLineOrderingQuestionBank.json`:**
- `na_1_seq_004`: "What number is missing between 11 and 13?" → `VISUAL_NUMPAD` with `sequence: [11, null, 13]`, answer: 12
  - Previously PICKER with numeric options `[10, 12, 14]` — now rendered as a sequence card row

### 4. JSON Migrations — PICKER → NUMPAD (Route A)

Questions where all options were numbers and the answer is a number:

**`additionPropertiesQuestionBank.json`:**
- `na_1_addprop_004`: PICKER → NUMPAD. "4 birds + 3 = 3 birds + __ birds?" answer: 4, maxDigits: 1

**`compareOrderQuestionBank.json`:**
- `na_1_compare_005`: PICKER → NUMPAD. "Which number is larger: 14 or 19?" answer: 19, maxDigits: 2

### 5. PickerEngine.jsx — Rewrite to 2×2 Visual Tile Layout

Previous: vertical full-width list of option rows with a separate "Check Answer" button (two-step select → check).

**New behavior:**
- 2-column `flexWrap` grid of square-ish tiles (width: `47%`, height: `SCREEN_HEIGHT * 0.13`)
- **Tap is instant feedback — no Check button**
  - Correct tap: green border + checkmark badge → `onResult(true)` after 600ms auto-advance
  - Wrong tap: red border + close badge → reset after 600ms, student retries (no `onResult(false)` on wrong tap)
- Per-option state via `tileStates` object (keyed by stringified option value)
- Color bar (6px horizontal bar) replaces the color dot from the old design
- Shuffles once per question via `useMemo([data])`
- Contract unchanged: `{ data, onResult }` (reads `data.question`, `data.answer`, `data.metadata.options`)

**Why no `onResult(false)` on wrong tap:** Grade 1 learners with 2–4 options will always find the correct answer. Calling `onResult(false)` on each wrong tap would trigger the ResultModal every time, creating an unacceptable UX rhythm. The wrong-tap flash gives immediate sensory feedback without interrupting the flow.

---

## Engine Creation Rule (Formalized)

> Create a new engine when:
> (a) the physical input the learner uses is fundamentally different, OR
> (b) the visual context required to reason cannot be added to an existing engine without distorting its original purpose.
>
> Never create an engine because: a new topic arrives, a question count is high, or authoring an existing engine's schema is harder.

Applied here: no new engine was created for sequence questions. VISUAL_NUMPAD was extended because the input affordance (type a number) is identical. Only the visual zone changes.

---

## Architecture Invariants Maintained

- Engines remain "dumb" — no session state, no scoring, no navigation
- `key={currentQuestionIndex}` enforced for clean remount
- `{ data, onResult }` standard prop contract across all engines
- All colors from `Colors` tokens, no hardcoded hex
- `StyleSheet.create()` only, no inline style objects for static values
- Flat schema pattern maintained — no nested wrappers added

---

## Files Changed

| File | Change |
|---|---|
| `VisualNumpadEngine.jsx` | Added `SequenceCard` component, `'sequence'` mode in `renderVisualZone`, sequence styles |
| `PickerEngine.jsx` | Full rewrite — 2×2 grid, instant tap feedback, no check button |
| `countingSequenceQuestionBank.json` | 2 NUMPAD → VISUAL_NUMPAD (sequence) |
| `skipCountingQuestionBank.json` | 3 NUMPAD → VISUAL_NUMPAD (sequence) |
| `numberLineOrderingQuestionBank.json` | 1 PICKER → VISUAL_NUMPAD (sequence) |
| `additionPropertiesQuestionBank.json` | 1 PICKER → NUMPAD |
| `compareOrderQuestionBank.json` | 1 PICKER → NUMPAD |

---

## What Was NOT Changed

- All other question banks (47 JSON files untouched)
- SORT, COMPOSER, SHAPETRACER, GEOBOARD, CONNECTDOTS, ORDINAL_SEQUENCE banks
- WORD_PROBLEM banks (deferred)
- MATCHER banks (Phase 3)
- `lessonResolver.js` — no structural changes
- `CurriculumOrchestrator.jsx` — no changes needed; VISUAL_NUMPAD already routed
- Generative stack (G2–G6) — completely untouched
- Fraction PICKER questions (need new asset registrations — deferred to Phase 3)

---

## What Comes Next (Phase 3)

- MATCHER content upgrade: make it domain-agnostic (money, fractions, time, ordinals)
- Fraction PICKER → SHAPE_HUNT migration (needs fraction assets in `assetMap.js`)
- New question banks for money, fractions, and time nodes authored against generalized engines
- Target: reduce NUMPAD + PICKER to < 25% combined across all banks
