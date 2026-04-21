# GeoboardEngine UI Redesign — Tactile Bulky Design System

**Date:** 2026-04-21 22:02:08  
**File:** `src/Components/Game/Curriculum/Engines/GeoboardEngine.jsx`

---

## Summary

Upgraded `GeoboardEngine.jsx` from a flat, shadow-minimal UI to a fully compliant **Tactile Bulky / Duolingo-style** design. No logic, geometry validation, data contract, or engine API was changed.

---

## Changes Made

### 1. `TactileFooterButton` — New Subcomponent
Replaced three `GestureDetector`-based flat `Animated.View` buttons (Undo, Reset, Check Shape) with a single reusable `TactileFooterButton` backed by `Pressable`. 

**Sinking mechanic:**
- `useSharedValue` for `translateY` and `borderBottomWidth`
- Idle: `translateY=0`, `borderBottomWidth=6`
- Pressed: `translateY=4`, `borderBottomWidth=2`
- Haptics on `onPressIn`

**Button variants:**
| Button | Color | Border |
|---|---|---|
| Check Shape | `Colors.success` | `#1b5e20` |
| Undo | `Colors.secondary` | `#003d8f` |
| Reset | `#546E7A` | `#37474F` |

### 2. `DotProgressBar` — New Subcomponent
Added a horizontal dot-count tracker (filled vs outlined circles) positioned between the Goal Badge and the instruction text.
- Filled dots: accent color, animated in with `ZoomIn.springify()`
- Empty dots: `Colors.outlineVariant` outlined circles
- Driven by `selectedDots.length` / `requiredDots`

### 3. `DotNode` Upgrade
- `DOT_VISUAL_SIZE`: `18px` → `20px`
- Hit area: `44px` → `48px`
- Active nodes grow by `+8px` (was `+6px`) for clearer selection feedback
- **Borders added:** idle = `1.5px outlineVariant`; active (first) = `2.5px primary`; active (selected) = `2.5px secondary`
- Color tokens: replaced hardcoded `#AB47BC` purple with `Colors.secondary` (Curiosity Blue)

### 4. Canvas Tonal Layering
- Background: `surfaceContainerLowest` → `surfaceContainer` (one tonal step darker)
- Added `borderBottomWidth: 6` and `borderColor: Colors.outlineVariant` for depth

### 5. Goal Badge Upgrade
- `borderBottomWidth: 4` added for depth
- `borderRadius: 20` → `24` (rounder, friendlier)
- Shape emoji prefix (`▲`, `■`, `▬`) added before label text

### 6. SVG Line Weight
- `strokeWidth`: `3.5` → `4.5` for heavier, bolder lines matching the bulky aesthetic

### 7. StyleSheet Cleanup
- Removed all hardcoded hex codes that have `Colors` token equivalents
- All style keys remain `camelCase`
- Styles remain at bottom of file per codebase standards

---

## Assets / Dependencies
No new packages required. All used libraries were already in the project:
- `react-native-reanimated`
- `react-native-gesture-handler`
- `expo-haptics`
- `react-native-svg`

---

# ShapeTracerEngine — Tactile Bulky UI & UX Overhaul

**Date:** 2026-04-21  
**Files Modified:**
- `src/Components/Game/Curriculum/Engines/ShapeTracerEngine.jsx`
- `content/game-data/dev/engineLabQuestionBank.json`

## Summary

Brought `ShapeTracerEngine` into full compliance with the Tactile Bulky / Duolingo-style design system used by GeoboardEngine and other recent engines.

## Changes

### Phase 1: UI
- Replaced `GestureDetector`-based Check/Reset buttons with `TactileFooterButton` (local subcomponent matching GeoboardEngine pattern)
- Both **Clear** and **Check Answer** buttons are **always rendered** — `disabled` prop (opacity 0.4) replaces conditional show/hide
- Sinking press mechanic: `translateY 0→4`, `borderBottomWidth 6→2` via `withSpring({ damping: 15, stiffness: 300 })`
- Haptics on every `onPressIn`
- Root wrapped in `ScrollView` to prevent footer clip on small screens
- Removed unused `ZoomIn`, `ZoomOut` imports

### Phase 2: UX
- `COVERAGE_THRESHOLD` raised `0.75 → 0.80` (80% required to enable Check Answer)
- `handleReset` now triggers `ImpactFeedbackStyle.Medium` haptic on clear
- `shape` lookup normalized with `.toLowerCase()` to handle mixed-case JSON values

### Test Bank
- Added 3 `SHAPETRACER` entries to `content/game-data/dev/engineLabQuestionBank.json` (triangle, square, rectangle — guided mode)

### Final Adjustments
- **Check Answer always available after first trace**: `canCheck` changed from `coverage >= COVERAGE_THRESHOLD` to `tracedCount > 0`. Button unlocks as soon as any tracing begins. Pressing below 80% still resolves as a wrong answer via `handleCheckAnswer`; the 80% gate only determines pass/fail, not button visibility.
- **Check Answer text centering fixed**: `Pressable` wrapper now receives `width: '100%'` when `fullWidth` is true, allowing the inner `Animated.View` to stretch and center content correctly.
- **Canvas stays neutral on submit**: Removed `answered && styles.canvasCorrect` — canvas background no longer turns green on correct answer. The `ResultModal` handles all correct/wrong feedback display.
