# 2026-04-13: Curriculum Engine UI Elevation

**Date**: 2026-04-13 15:33 PHT
**Branch**: `development-branch`
**Status**: Completed

---

## Summary

Modernized the UI of all 10 curriculum game engines and the `CurriculumOrchestrator` to achieve a premium, standardized look that mirrors the generative engine stack. Introduced 2 new shared base components, removed the legacy HUD, and applied subtle `LinearGradient` interactivity across engines.

---

## Changes Made

### Phase 0 — New Shared Components (`src/Components/Game/Global/EngineBase/`)

#### [NEW] `EngineHeader.jsx`
Standardized dynamic question header for all curriculum engines.
- **Question text**: Centered, `Lexend-Bold`, themed `primary` color
- **Instruction hint**: Dynamic state feedback with color overrides (success/error)
- **Progress badge**: Optional pill badge (e.g., `"2 / 5 Paired"`, `"75% traced"`)
- Entrance animations via `FadeInDown` + `FadeIn`

#### [NEW] `EngineCheckButton.jsx`
Unified action button with two variants:
- **`primary`**: Green `LinearGradient` (`#43A047` → `#2E7D32`) with Reanimated spring scale
- **`secondary`**: Outlined tonal button for reset/clear actions
- Uses `Gesture.Tap()` for Reanimated compatibility (no `TouchableOpacity`)

### Phase 1 — Orchestrator Refactor

#### [MODIFY] `CurriculumOrchestrator.jsx`
- **Removed**: Full-width HUD bar (`hud` View, `exitButton`, `exitText`, `scoreText`)
- **Added**: Floating circular exit button (`floatingExit` style) — 44×44px, `surfaceContainerLow` background, `Ionicons close` icon, positioned `top: 12, left: 12, zIndex: 20`
- **Added**: `@expo/vector-icons` import for `Ionicons`
- Score tracking remains internal for result calculation but is no longer displayed

### Phase 2 — Engine Refactors (Full Rewrite)

#### [MODIFY] `PickerEngine.jsx`
- Replaced flat-colored option tiles with `LinearGradient`-backed option tiles (8-color gradient palette)
- Replaced local question card with `EngineHeader`
- Replaced local check button with `EngineCheckButton`
- Added `speechManager` integration for question TTS
- Dynamic instruction color for success/error states

#### [MODIFY] `MatcherEngine.jsx`
- Replaced flat match tiles with `LinearGradient`-backed tiles (separate palettes for left/right columns)
- Replaced local question container with `EngineHeader` (includes progress badge: `"X / Y Paired"`)
- Replaced local check/reset buttons with `EngineCheckButton` (primary + secondary variants)
- Column headers styled with uppercase labels

#### [MODIFY] `ComposeEngine.jsx`
- Replaced flat number chips with `LinearGradient`-backed chips (6-color deep gradient palette)
- Replaced local question header with `EngineHeader`
- Replaced local check/reset buttons with `EngineCheckButton`
- Visual number bond structure preserved (slots + connectors + plus sign)

### Phase 3 — Engine Refactors (In-Place Edits)

| Engine | Changes |
|--------|---------|
| `NumpadEngine.jsx` | Gradient numpad keys (`LinearGradient`), `EngineHeader`, `EngineCheckButton` |
| `DragAndDropEngine.jsx` | `EngineHeader` replaced hint container, `EngineCheckButton` replaced check tap |
| `SortEngine.jsx` | `EngineHeader` replaced hint container, `EngineCheckButton` replaced check tap |
| `ConnectTheDotsEngine.jsx` | `EngineHeader` with progress badge, `EngineCheckButton`, removed duplicate progress |
| `ShapeTracerEngine.jsx` | `EngineHeader` with `% traced` badge, `EngineCheckButton` (primary + secondary), removed duplicate progress |
| `ShapeHuntEngine.jsx` | `EngineHeader` with `Found X of Y` badge, `EngineCheckButton`, removed duplicate progress |
| `OrdinalSequenceEngine.jsx` | `EngineHeader` with `X / Y labeled` badge, `EngineCheckButton` (primary + secondary), removed duplicate progress |

---

## Files Changed

### New Files (2)
| File | Purpose |
|------|---------|
| `src/Components/Game/Global/EngineBase/EngineHeader.jsx` | Shared dynamic question header |
| `src/Components/Game/Global/EngineBase/EngineCheckButton.jsx` | Shared gradient action button |

### Modified Files (11)
| File | Type of Change |
|------|---------------|
| `src/Components/Game/Curriculum/CurriculumOrchestrator.jsx` | HUD removal, floating exit |
| `src/Components/Game/Curriculum/Engines/PickerEngine.jsx` | Full rewrite |
| `src/Components/Game/Curriculum/Engines/MatcherEngine.jsx` | Full rewrite |
| `src/Components/Game/Curriculum/Engines/ComposeEngine.jsx` | Full rewrite |
| `src/Components/Game/Curriculum/Engines/NumpadEngine.jsx` | In-place refactor |
| `src/Components/Game/Curriculum/Engines/DragAndDropEngine.jsx` | In-place refactor |
| `src/Components/Game/Curriculum/Engines/SortEngine.jsx` | In-place refactor |
| `src/Components/Game/Curriculum/Engines/ConnectTheDotsEngine.jsx` | In-place refactor |
| `src/Components/Game/Curriculum/Engines/ShapeTracerEngine.jsx` | In-place refactor |
| `src/Components/Game/Curriculum/Engines/ShapeHuntEngine.jsx` | In-place refactor |
| `src/Components/Game/Curriculum/Engines/OrdinalSequenceEngine.jsx` | In-place refactor |

---

## Design Decisions

1. **No EngineInteractiveTile base component**: Each engine has fundamentally different tile mechanics (drag, tap-to-stamp, SVG tracing, etc.), so a shared tile wrapper would add abstraction without reducing complexity. Gradients were applied directly.
2. **Exit via floating button, not EngineHeader**: Kept the exit logic in the Orchestrator (not individual engines) to avoid changing the `{ data, onResult }` engine contract.
3. **Progress badges in EngineHeader**: Replaced per-engine inline progress containers with a unified `progressBadge` prop on `EngineHeader`, reducing visual clutter and duplication.
4. **LinearGradient on all interactivity**: Per user directive, subtle gradients are applied to option tiles, match tiles, number chips, and numpad keys — not just the check button.

---

## Architectural Notes

- `EngineCheckButton` creates an `AnimatedLinearGradient` via `Animated.createAnimatedComponent(LinearGradient)` — this is required for Reanimated animated styles on the gradient container.
- All `Gesture.Tap()` handlers use `runOnJS()` for JS-thread callbacks, consistent with the existing codebase pattern.
- The `EngineHeader` does not import or use `Gesture` — it is a pure presentational component with entrance animations only.
