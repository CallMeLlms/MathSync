# CompareOrderEngine — Implementation Log
**Date**: 2026-04-25  
**Topic**: Compare & Order Numbers (NA.1.7-1.8)

## What Was Built
New curriculum engine `CompareOrderEngine.jsx` for G1 Q1 Lesson 4 question banks covering comparison and ordering of numbers up to 20.

## Files Created / Modified
- **NEW**: `src/Components/Game/Curriculum/Engines/CompareOrderEngine.jsx`
- **MOD**: `src/Components/Game/Curriculum/CurriculumOrchestrator.jsx` — import + `compare_order` case
- **MOD**: `content/game-data/dev/engineLabQuestionBank.json` — 3 test questions added

## Engine Type
`COMPARE_ORDER` (lowercase: `compare_order` in Orchestrator switch)

## Sub-modes (auto-detected from metadata shape)
| Metadata keys | Mode | Interaction |
|---|---|---|
| `pile_a`, `pile_b` | `pile_compare` | Tap bigger of 2 bulky cards |
| `plate_a`, `plate_b`, `plate_c` | `multi_compare` | Tap biggest of 3 compact cards |
| `items[]` | `sequence_order` | Tap numbers in ascending order (retry on wrong, no advance) |

## Design Notes
- No shake animation on wrong — uses opacity dim-flash instead
- Bulky card construction: `borderWidth: 2`, `borderBottomWidth: 6`, `borderRadius: 20`
- Sinking press: `translateY 0→4`, `borderBottomWidth 6→2` via `withSpring`
- Correct feedback: scale pop `1→1.06→1.0` + green border + checkmark badge
- Wrong feedback: opacity `1→0.4→1.0` + red border + X badge (no shake)
- Sequence mode allows infinite retry — only `onResult(true)` advances the question
- All emojis resolved programmatically from `assetId` via `ASSET_EMOJI` map (no assetMap.js dependency)

## Next Step (Phase 2)
After Engine Lab validation, update the 3 curriculum JSON banks:
- `compareOrderQuestionBank.json` — 1 SORT → COMPARE_ORDER
- `comparingQuantitiesQuestionBank.json` — 2 SORT → COMPARE_ORDER
- `numberLineOrderingQuestionBank.json` — 1 SORT → COMPARE_ORDER
