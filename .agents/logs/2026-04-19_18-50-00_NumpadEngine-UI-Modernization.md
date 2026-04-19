# NumpadEngine UI Modernization

**Date**: April 19, 2026  
**Scope**: Curriculum Engine — `NumpadEngine.jsx`

## Summary

Rewrote the `NumpadEngine.jsx` to implement a "Bulky" tactile UI and standardize its logic.

## Changes Made

### `NumpadEngine.jsx` — Full Rewrite
- **Layout**: Replaced 2-row (1-5, 6-0) colored layout with a standard 3x4 grid (1-3, 4-6, 7-9, Empty-0-Backspace).
- **Key Colors**: Removed multi-color `KEY_COLORS` array. All keys now use `Colors.surfaceContainerLowest`. Backspace uses `Colors.surfaceContainerHigh`.
- **Tactile Depth**: Keys use `borderBottomWidth: 4` with `#D5D4D4` to simulate a pressed-button feel. On press, keys animate `translateY: 4` to "flatten".
- **Check CTA**: Full-width, solid `Colors.success` button with `borderBottomWidth: 4` and `#00531e` depth. No gradient per user direction.
- **Shake Animation**: Added horizontal shake (`translateX` sequence) on incorrect answer submission.
- **Typography**: `Lexend-Bold` for key numbers (fontSize 26) and Check CTA. `PlusJakartaSans-SemiBold` for instructions.
- **Logic**: Maintained standard `({ data, onResult })` prop contract. Input state is a single string. `maxDigits` enforcement preserved.

### Duolingo-Style Refinements (Pass 2)
- **Tile Shape**: `aspectRatio: 1 / 0.8` (slightly wider than tall) for ergonomic thumb reach.
- **Weighty Borders**: `borderWidth: 2` (solid outline) + `borderBottomWidth: 4` with `#D5D4D4` for tactile 3D depth.
- **Border Radius**: Changed from `16` to `12` for a less-rounded, bulkier feel.
- **Press Shift**: Reduced from `translateY: 4` to `translateY: 2` on press for a subtler Duolingo-like shift.
- **Check Button States**: Grey (`surfaceContainerHigh`) when disabled, green (`success`) when active. Uses separate `checkButtonDisabled` style instead of opacity toggle.
- **Check Button Radius**: Changed from `28` (pill) to `16` (matching tile style) for consistency.

## Design Decisions
- The "Bulky" style uses `borderRadius: 16` (not too rounded) per user preference.
- No shadows used anywhere — depth achieved via `borderBottomWidth` (Tonal Layering compliant).
- The Check button uses solid color, not gradient, per explicit user feedback.
