# ComposeEngine UI/UX Refactor
**Date:** 2026-04-21  
**File:** `src/Components/Game/Curriculum/Engines/ComposeEngine.jsx`

## Summary
Three-phase refactor of the number-bond game engine to align with current design standards.

## Changes

### Phase 1 — UI: Tactile Bulky Aesthetic
- `CHIP_COLORS` migrated from hardcoded hex values to `Colors` token system (`secondary`, `primary`, `tertiary`, `onSurfaceVariant`)
- `NumberChip` rewritten: replaced `GestureDetector` + scale animation with `Pressable` + sinking mechanic (`translateY` + `borderBottomWidth` 6→2 on press), matching GeoboardEngine/ShapeTracerEngine pattern
- `DropSlot` upgraded: dynamic `borderBottomWidth: 5` when filled, `2` when empty
- Target bubble upgraded: `borderWidth: 2` + `borderBottomWidth: 6` for tactile depth
- Added `TactileFooterButton` sub-component (identical to GeoboardEngine pattern) — `Pressable` + Reanimated spring sinking, haptics on pressIn

### Phase 2 — UX: Always-Visible Footer
- Removed `{!answered && (...)}` conditional wrapper around footer
- Reset and Check Answer buttons are now always rendered; `disabled` prop (opacity 0.4) replaces conditional rendering
- Removed all `entering` animations from footer wrapper and button elements — no more pop-in layout shifts

### Phase 3 — Redundancy Cleanup
- Removed `equationDisplay` variable and the `Animated.Text` equation string below the slots (redundant with slot values)
- Removed `withDelay` from Reanimated imports (was unused)
- Removed old `resetButton`, `checkButton`, `equationText` styles; replaced with `tactileButton` family
