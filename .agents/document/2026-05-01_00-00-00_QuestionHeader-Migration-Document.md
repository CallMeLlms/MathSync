# Plan: Move Question Header Ownership from Orchestrator → Engines

**Date:** 2026-05-01  
**Scope:** `CurriculumOrchestrator.jsx` + all 28 Curriculum Engines  
**Reference Pattern:** `VisualPickerEngine.jsx` (speech bubble), `WordProblemEngine.jsx` (story card), `MoneyEngine.jsx` (speech bubble)

---

## Context

Currently, `CurriculumOrchestrator` owns the question header UI — it reads `currentQuestion.question` (or `.instruction`, `.text`, `.prompt`) and renders a shared `questionHeader` block above every engine. It also conditionally renders the `questionAssetContainer` for most engines.

This creates coupling: engines cannot control their own visual layout context. Two engines (`visual_picker`, `money_engine`) already opted out of the shared header by being hard-excluded in the orchestrator's condition — they render their question text themselves via speech bubbles. `WordProblemEngine` also renders its own story card.

The goal is to make **all engines self-contained** — each engine owns its question display, freeing the orchestrator to be pure session logic.

---

## Audit Results

### Already Self-Contained (no changes needed)
These engines already render their own question/instruction UI internally:

| Engine | Current Question UI |
|--------|-------------------|
| `VisualPickerEngine` | Speech bubble with optional asset card |
| `WordProblemEngine` | Story card layout |
| `MoneyEngine` | Speech bubble with asset |
| `ConnectTheDotsEngine` | Hint text internally |
| `DragAndDropEngine` | Dynamic instruction via `getInstruction()` |
| `GeoboardEngine` | Goal badge + dynamic instruction |
| `OrdinalSequenceEngine` | Dynamic instruction via `getInstruction()` |
| `ShapeComposeEngine` | Dynamic hint via `getHintText()` |
| `ShapeHuntEngine` | Dynamic instruction |
| `ShapeTracerEngine` | Dynamic instruction |
| `ClockSetterEngine` | Dynamic instruction (no `data.question` field) |
| `ComposeEngine` | Dynamic instruction (no `data.question` field) |
| `SortEngine` | Dynamic hint text |

### Rely on Orchestrator — Need Question Header Added (14 engines)

| Engine | `data` question field | Has own asset? |
|--------|----------------------|----------------|
| `PickerEngine` | `data.question` | No |
| `NumpadEngine` | `data.equation` (no question field) | No |
| `VisualNumpadEngine` | `data.question` | No (visual context card) |
| `ComparePickerEngine` | `data.question` | Yes — AssetDisplay |
| `CompareOrderEngine` | No question field | Yes — AssetDisplay |
| `FractionShapeEngine` | `data.question` | SVG shapes |
| `CalendarPageEngine` | `data.question` | No |
| `CalendarGridEngine` | `data.question` | SVG grid |
| `TurnCompassEngine` | `data.question` | SVG compass |
| `PatternSequenceEngine` | `data.question` | No |
| `PictographReaderEngine` | `data.question` | Pictograph |
| `DataTableReaderEngine` | `data.question` | Pictograph visualization |
| `FruitStandEngine` | `data.question` | Emoji fruit (partial — has stand header) |
| `MatcherEngine` | None (`data.pairs`) | No |

---

## Implementation Plan

### Step 0 — Create `QuestionHeader` shared component

**File:** `src/Components/Game/Global/QuestionHeader.jsx`

A reusable, dumb component that all engines can drop in. Accepts:
- `text` — the question/instruction string
- `style` — optional override for the outer container

Renders the existing orchestrator pill style (rounded card, `Lexend-Bold`, 24px). This is the **only** styling source — engines import and use it, never duplicate it.

```jsx
// Usage inside any engine:
import QuestionHeader from '@/Components/Game/Global/QuestionHeader';

<QuestionHeader text={data.question} />
```

---

### Step 1 — Update `CurriculumOrchestrator`

Remove:
- The `questionHeader` block (lines 263–267)
- The `questionAssetContainer` block (lines 272–285)
- All `engineType !== 'visual_picker'` / `engineType !== 'money_engine'` exclusion conditions
- The `questionText` variable (line 126) — no longer needed at orchestrator level
- `styles.questionHeader`, `styles.questionHeaderText`, `styles.questionAssetContainer`, `styles.questionAsset` style entries

The orchestrator becomes purely: session state + engine routing + modals. No presentation logic.

---

### Step 2 — Migrate the 14 engines (batched by complexity)

#### Batch A — Simple text-only engines (drop in `<QuestionHeader>`)
`PickerEngine`, `CalendarPageEngine`, `PatternSequenceEngine`, `TurnCompassEngine`

Each gets `<QuestionHeader text={data.question} />` added at the top of their render output. No asset to handle — straightforward.

#### Batch B — Engines with their own asset rendering
`ComparePickerEngine`, `FractionShapeEngine`, `PictographReaderEngine`, `DataTableReaderEngine`, `FruitStandEngine`

These already render their visual content internally. Add `<QuestionHeader>` above their existing visual layout. The orchestrator's shared `questionAssetContainer` was rendering duplicates for some of these — removing it is correct.

#### Batch C — Engines with complex visual context
`VisualNumpadEngine`, `CalendarGridEngine`

`VisualNumpadEngine` has a visual context card (sequences/groups/count blocks). The question header should sit above the context card. `CalendarGridEngine` renders an SVG calendar — question header goes above it.

#### Batch D — Special cases
- `CompareOrderEngine` — no question field on `data`; needs investigation of its question bank JSON to confirm the field name before adding the header.
- `NumpadEngine` — uses `data.equation`, not `data.question`. The orchestrator currently renders the question text for it. Add question rendering only if `data.question` exists (some numpad questions have a word context, others don't).
- `MatcherEngine` — uses `{ question, onAnswer }` prop contract (legacy). Already has its own dynamic hint. No orchestrator question header to replace; leave as-is.

---

### Step 3 — Verification

For each migrated engine:
1. Play through a question of that engine type in the app
2. Confirm question text appears inside the engine
3. Confirm no double rendering (header gone from orchestrator, present in engine)
4. Confirm asset renders correctly (not duplicated, not missing)

---

## Invariants to Preserve

- `MatcherEngine` keeps its `{ question, onAnswer }` legacy prop contract — do **not** rewrite it, per orchestrator invariant
- `key={currentQuestionIndex}` stays on all engines — this plan does not touch the key pattern
- `GESTURE_ENGINES` set in the orchestrator remains unchanged
- Engines remain "dumb" — `QuestionHeader` receives a string, no session state

---

## Files Touched

| File | Change |
|------|--------|
| `src/Components/Game/Global/QuestionHeader.jsx` | **CREATE** — new shared component |
| `src/Components/Game/Curriculum/CurriculumOrchestrator.jsx` | Remove question header + asset blocks |
| `src/Components/Game/Curriculum/Engines/PickerEngine.jsx` | Add `<QuestionHeader>` |
| `src/Components/Game/Curriculum/Engines/NumpadEngine.jsx` | Add conditional `<QuestionHeader>` |
| `src/Components/Game/Curriculum/Engines/VisualNumpadEngine.jsx` | Add `<QuestionHeader>` |
| `src/Components/Game/Curriculum/Engines/ComparePickerEngine.jsx` | Add `<QuestionHeader>` |
| `src/Components/Game/Curriculum/Engines/CompareOrderEngine.jsx` | Investigate + add `<QuestionHeader>` |
| `src/Components/Game/Curriculum/Engines/FractionShapeEngine.jsx` | Add `<QuestionHeader>` |
| `src/Components/Game/Curriculum/Engines/CalendarPageEngine.jsx` | Add `<QuestionHeader>` |
| `src/Components/Game/Curriculum/Engines/CalendarGridEngine.jsx` | Add `<QuestionHeader>` |
| `src/Components/Game/Curriculum/Engines/TurnCompassEngine.jsx` | Add `<QuestionHeader>` |
| `src/Components/Game/Curriculum/Engines/PatternSequenceEngine.jsx` | Add `<QuestionHeader>` |
| `src/Components/Game/Curriculum/Engines/PictographReaderEngine.jsx` | Add `<QuestionHeader>` |
| `src/Components/Game/Curriculum/Engines/DataTableReaderEngine.jsx` | Add `<QuestionHeader>` |
| `src/Components/Game/Curriculum/Engines/FruitStandEngine.jsx` | Add `<QuestionHeader>` |

**Total: 1 new file, 15 modified files**
