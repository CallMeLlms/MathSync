# ClockSetterEngine — Stage 1 Implementation
**Date:** 2026-04-19

## What Was Built

Added `ClockSetterEngine.jsx` to `src/Components/Game/Curriculum/Engines/`. This is a new Grade 1 curriculum engine for analog clock reading. Stage 1 implements **hour-only mode**.

## Stage 1 Scope

- Hour hand rotates freely via a Pan gesture on the entire clock face, snapping to 12 whole-hour positions (30° increments).
- Minute hand rendered at 12 o'clock, frozen and decorative (opacity 0.25). Not interactive.
- Validation: exact whole-hour match (`snapHour === targetTime.hour`).
- Reset on wrong answer after 1400ms, restoring hands to `initialTime`.

## Architecture Decisions

- **Full-face pan gesture**: `GestureDetector` wraps the entire `clockFace` View (280×280). Any drag on the clock rotates the hour hand. This avoids zero-size hit-area issues from putting the gesture on the pivot directly, and is more forgiving for young children.
- **Pivot anchor technique**: A zero-size `Animated.View` positioned absolutely at the clock center (`top: CLOCK_RADIUS, left: CLOCK_RADIUS`). The hand is a child with `bottom: 0`, extending upward. Rotating the pivot rotates the hand around the clock center. At 0° the hand points to 12 o'clock.
- **Angle math**: `((atan2(dy, dx) * 180/π) + 90 + 360) % 360` maps screen touch to clock angle where 0° = 12 o'clock, clockwise positive.
- **Worklet safety**: `snapToStep` is a worklet. Hour derivation from angle is inlined in `.onEnd` (avoids marking `angleToHour` as worklet). `onHourSnap` is called via `runOnJS`.
- **Clock center**: Read via `measureInWindow` inside `onLayout`, stored in `useSharedValue`s for worklet access.

## Files Modified

| File | Change |
|---|---|
| `src/Components/Game/Curriculum/Engines/ClockSetterEngine.jsx` | Created |
| `src/Components/Game/Curriculum/CurriculumOrchestrator.jsx` | Added import, added `'clocksetter'` to `GESTURE_ENGINES`, added `case 'clocksetter'` to render switch |

## Pending (Stage 2)

Half-hour mode: minute hand becomes interactive, snaps only to 0° or 180° (0 or 30 minutes). Add `minutePan` gesture with `snapToAllowedAngles([0, 180])` and exact minute validation.
