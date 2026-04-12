# Session Log: Engine Modernization & Journey Map Alignment
**Date**: 2026-04-12 16:19  
**Scope**: Curriculum Engine Migration + Grade 1 Journey Map

---

## Part 1: Curriculum Engine Modernization

### Objective
Modernize three legacy game engines (`DragAndDropEngine`, `ConnectTheDotsEngine`, `ShapeTracerEngine`) to conform to the MathSync Dual-Stack architecture.

### Changes Made

#### Engine Refactoring (3 files)
| File | Key Changes |
|------|-------------|
| `DragAndDropEngine.jsx` | Props → `{data, onResult}`, Satoshi → Lexend/PlusJakartaSans, removed all shadows, integrated `speechManager`, `AssetDisplay` with fallback |
| `ConnectTheDotsEngine.jsx` | Props → `{data, onResult}`, SVG canvas with `useAnimatedProps` tracking line, `speechManager`, tonal layering instead of shadows |
| `ShapeTracerEngine.jsx` | Props → `{data, onResult}`, segment-based hit detection, 3 CRA modes (`guided`, `semi_guided`, `freeform`), 44×44 touch targets enforced |

#### Orchestrator Registration
- `CurriculumOrchestrator.jsx` — Added `"dragdrop"`, `"connectdots"`, `"shapetracer"` to the engine switch block.

#### Asset Auditing
- Tagged 18 questions across 3 JSON banks with `assetId` fields using the `g1_q1_shape_triangle` convention.
- Updated `assetMap.js` with 13 commented placeholder entries organized by quarter:
  - **Q1 Shapes**: `g1_q1_shape_triangle`, `g1_q1_shape_square`, `g1_q1_object_door`
  - **Q2 Addition**: `g1_q2_manipulative_tens_block`, `g1_q2_manipulative_tens_ones_block`, `g1_q2_manipulative_stick_bundle`, `g1_q2_diagram_base10_addition`, `g1_q2_diagram_bundle_count`
  - **Q4 Money**: `g1_q4_money_peso_1_coin`, `g1_q4_money_peso_5_coin`, `g1_q4_money_peso_20_bill`, `g1_q4_money_peso_100_bill`, `g1_q4_money_peso_coins_set`

### Verification Results
| Check | Status |
|-------|--------|
| No `shadowColor`/`elevation` in engines | ✅ Zero matches |
| No `Satoshi` font references | ✅ Zero matches |
| All engines use `{data, onResult}` | ✅ Confirmed |
| Orchestrator routes new engines | ✅ Registered |

---

## Part 2: Grade 1 Journey Map Alignment

### Objective
Align the G1 journey map and lesson resolution with the legacy "Super Lesson" structure, where each map node delivers a shuffled mix of questions from multiple banks.

### Changes Made

#### G1.json — Journey Map Data
| Node | Title | Legacy Equivalent |
|------|-------|-------------------|
| 1 | Geometric Blooms | `q1_lesson1_shapes` — 2D Shapes |
| 2 | Pairing Petals | `q1_lesson2_numbers` — Numbers |
| 3 | The Ranking Vines | `q1_lesson3_position` — Ordinal Numbers |
| 4 | Sorting Seeds | `q1_lesson4_compare_order` — Compare & Order |
| 5 | The Master Gardener | Boss Review Node |

#### lessonResolver.js — Super Lesson Bundles
Refactored from a single hardcoded lesson to four consolidated Super Lessons:

| Node | Banks Bundled | Active Engine Types |
|------|---------------|---------------------|
| Geometric Blooms | `shapesQuestionBank`, `shapePropertiesQuestionBank`, `shapeComposingQuestionBank` | All `N/A` (deferred) |
| Pairing Petals | `numberMatchingQuestionBank`, `additionQuestionBank`, `basicAdditionQuestionBank`, `composeDecomposeQuestionBank`, `countingQuestionBank` | MATCHER, NUMPAD, COMPOSER |
| The Ranking Vines | `ordinalNumbersQuestionBank`, `positionalReasoningQuestionBank` | All `N/A` (deferred) |
| Sorting Seeds | `compareOrderQuestionBank`, `comparingQuantitiesQuestionBank`, `numberLineOrderingQuestionBank` | All `N/A` (deferred) |

Key additions:
- **Fisher-Yates shuffle** for randomized question delivery
- **`getPlayableQuestions()` filter** — excludes `type: "N/A"` questions; falls back to all if none are playable

### Route Chain
```
G1.json (id: 1-4)
  → [grade].jsx → router.push(/game/${node.id}?grade=G1)
    → [lessonId].jsx → CurriculumOrchestrator({ lessonId, gradeKey })
      → lessonResolver.js → getBundledLesson("G1", lessonId)
        → Returns shuffled questions from bundled banks
```

---

## Files Modified
- `src/Components/Game/Curriculum/Engines/DragAndDropEngine.jsx`
- `src/Components/Game/Curriculum/Engines/ConnectTheDotsEngine.jsx`
- `src/Components/Game/Curriculum/Engines/ShapeTracerEngine.jsx`
- `src/Components/Game/Curriculum/CurriculumOrchestrator.jsx`
- `src/Components/Game/Curriculum/lessonResolver.js`
- `src/constants/assetMap.js`
- `content/lesson-map/G1.json`
- `content/game-data/quarter-1/grade1-q1-lesson1-shapes/shapesQuestionBank.json`
- `content/game-data/quarter-2/grade1-q2-lesson4-addition-to-100/pictorialAdditionTo100QuestionBank.json`
- `content/game-data/quarter-4/grade1-q4-lesson2-money/moneyIdentificationQuestionBank.json`

## Next Steps
- Assign engine types to `N/A` questions in Nodes 1, 3, 4 (e.g., `DRAGDROP`, `SHAPETRACER`, `CONNECTDOTS`)
- Create actual PNG/SVG assets for the 13 `assetId` placeholders in `assetMap.js`
- Implement Q2–Q4 Super Lessons in `lessonResolver.js`

## Test Activation (2026-04-12)
Activated the following questions from `"N/A"` to internal engines for verification:
- **Node 1**: 3 Shaping Compose (`DRAGDROP`), 3 Shape Properties (`MATCHER`)
- **Node 3**: 3 Ordinal Numbers (`DRAGDROP`)
- **Node 4**: 1 Compare Order (`DRAGDROP`)
