# Interaction-First MVP — Shape Engines (SHAPE_HUNT + COMPOSE_DRAG)

**Date:** 2026-04-16  
**Scope:** Grade 1, Lesson 1 ("Geometric Blooms"), shape question banks  
**Motivation:** The existing JSON banks used a text Q&A model (read question → pick answer) that is ill-suited for Grade 1 learners. This change evolves the schema toward an interaction-first, scene-driven design where learners demonstrate understanding through action (tapping, placing) rather than reading and selecting text.

---

## What Changed

### 1. Schema Migration — `shapeHuntQuestionBank.json`

All 6 SHAPE_HUNT questions updated:
- `"question"` field renamed to `"prompt"` (aligns with scene-description intent; audio is the primary prompt driver)
- Top-level `"audio"` placeholder field added to each entry

No structural or logic changes — purely a field rename so engines read `data.prompt` instead of `data.question`.

### 2. Schema Migration — `shapeComposingQuestionBank.json`

The 1 DRAGDROP placeholder entry was replaced with a flat COMPOSE_DRAG entry:

```json
{
    "id": "mg_1_comp_001",
    "type": "COMPOSE_DRAG",
    "prompt": "Make a square!",
    "audio": "shape_compose_square.mp3",
    "palette": ["triangle", "triangle", "circle"],
    "target": "square",
    "requiredCount": 2,
    "accepts": ["triangle"]
}
```

Schema design principles applied:
- **Dead flat** — no nested `scene`/`success` envelope wrappers
- `palette` is a plain string array (shape type names)
- `requiredCount` = how many correct taps = success
- `accepts` = which palette types are valid
- Engine owns all success logic; JSON carries only the minimum data needed to render

The 2 existing PICKER entries were left completely untouched.

### 3. Engine Update — `ShapeHuntEngine.jsx`

Single-line change:
- Before: `const { items = [], question: instructionText } = data;`
- After: `const { items = [], prompt: instructionText } = data;`

JSDoc updated to reflect new field name. No behavioral changes.

### 4. New Engine — `ShapeComposeEngine.jsx`

New file. Implements the **tap-to-place** mechanic for COMPOSE_DRAG:

**Mechanic:**
- Palette row of tappable shape tiles (triangle, circle, etc.)
- Dashed target zone with N empty slots (`requiredCount`)
- Tap a correct tile (type in `accepts`) → spring animation, snaps into next open slot
- Tap wrong tile → red flash (error badge, haptic), no penalty
- All slots filled → auto-success, calls `onResult(true)`
- Edge case: if all valid palette tiles exhausted before slots filled → auto-fail, calls `onResult(false)`

**Key design decisions:**
- Tap-to-place chosen over actual drag-and-drop physics for MVP simplicity and gesture reliability
- `PaletteTile` and `TargetSlot` as internal sub-components
- `used` state tracked by palette index (not type) to allow duplicate types (e.g. 2 triangles)
- `rejectedIdx` state cleared after 600ms for brief flash feedback
- Auto-speak prompt via `speechManager.speakInstruction` on load
- `key={currentQuestionIndex}` on engine mount ensures clean state reset between questions (enforced by Orchestrator)

**Internal shape asset map:**
```javascript
const SHAPE_ASSET = {
  triangle:  'shape_triangle',
  circle:    'shape_circle',
  square:    'shape_square',
  rectangle: 'shape_rectangle',
};
```

### 5. Orchestrator Update — `CurriculumOrchestrator.jsx`

Added import and case:
```jsx
import ShapeComposeEngine from './Engines/ShapeComposeEngine';

// In renderEngine() switch:
case 'compose_drag': return <ShapeComposeEngine key={currentQuestionIndex} {...props} />;
```

No other orchestrator logic changed. The engine receives the standard `{ data, onResult }` contract.

---

## Architecture Invariants Maintained

- Engines remain "dumb" — no session state, no scoring, no navigation
- Per-question engine routing via `currentQuestion.type` (not lesson-level)
- `key={currentQuestionIndex}` enforced for clean remount
- Standard `{ data, onResult }` prop contract
- All colors from `Colors` tokens, no hardcoded hex
- All assets registered in `assetMap.js` and rendered via `AssetDisplay`
- `StyleSheet.create()` only, no inline style objects for static values

---

## Affected Nodes

- **Node 1** ("Geometric Blooms") — primary target, contains both SHAPE_HUNT and COMPOSE_DRAG questions
- **Node 5** (Boss) — also uses `shapeHuntQuestionBank`; `prompt` field migration applies here too
- **Node 20** (Final Boss) — same as Node 5

---

## Validation Goal

Play through Node 1 end-to-end and assess:
> "Does the tap-to-place interaction feel intuitive and engaging for a Grade 1 learner, without requiring text instruction?"

If yes → extend the flat schema pattern to other engines one at a time.  
If something feels off → fix it here before propagating to other banks.

---

## What Was NOT Changed

- All other question banks (16 other JSON files)
- All other engines (NumpadEngine, MatcherEngine, ComposeEngine, DragDropEngine, etc.)
- `lessonResolver.js` — no changes needed; COMPOSE_DRAG type resolved automatically
- `assetMap.js` — shape assets already registered (`shape_triangle`, `shape_circle`, etc.)
- Generative stack (G2–G6) — completely untouched
