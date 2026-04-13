# JourneyMap: Animation Removal, Scroll Fix, and Icon Cleanup

**Date:** 2026-04-13  
**Files Modified:**
- `src/Components/Game/Flow/JourneyMap.jsx`
- `content/lesson-map/G1.json`
- `app/(drawer)/Grades.jsx`

---

## Summary

Three issues were resolved in this session:
1. Removed all ambient/entrance animations from `JourneyMap.jsx`.
2. Fixed G1 Q4 nodes (16–20) being unreachable in the ScrollView.
3. Fixed invalid icon name warnings across JourneyMap and Grades.

---

## 1. Animation Removal

### Motivation
Animations in the journey map felt distracting. Per project convention, animations are reserved for game engines only. The journey map is a navigation UI and should be static.

### Changes
- Removed the `Firefly` component and all related `useMemo` logic entirely.
- De-animated `ActiveNode`: removed `useSharedValue`, `useEffect`, `useAnimatedStyle` for pulse/ring effects. Replaced `Animated.View` wrappers with plain `View`.
- Removed all `entering={FadeIn.delay(...)}` and `entering={ZoomIn.springify()}` props from completed, locked, and label nodes in `renderNode`.
- Cleaned up `react-native-reanimated` import — retained only `runOnJS` (required for GestureDetector tap callbacks).

---

## 2. Q4 Nodes Unreachable (Scroll Height Fix)

### Root Cause
`G1.json` Q4 nodes (16–20) have negative `y` values (ranging down to `-0.31`). The old implementation computed pixel position as `level.y * MAP_HEIGHT`, placing Q4 nodes at negative pixel offsets — above the scroll container's content area and therefore unreachable.

### Fix
Replaced the fixed MAP_HEIGHT with a dynamic normalization approach:

```js
const yValues = levels.map(l => l.y);
const yMin = Math.min(...yValues);
const yMax = Math.max(...yValues);
const ySpan = (yMax - yMin) || 1;
const MAP_HEIGHT = Math.ceil(ySpan * 2400) + NODE_PADDING * 2;

const mapY = (y) =>
  ((y - yMin) / ySpan) * (MAP_HEIGHT - NODE_PADDING * 2) + NODE_PADDING;
```

This normalizes any y range (including negative values) into a valid pixel range `[NODE_PADDING, MAP_HEIGHT - NODE_PADDING]`, ensuring all nodes land inside the scrollable content area.

Additionally, added `+ 100` to `contentContainerStyle.height` to prevent the bottommost node's label from being clipped.

Added a `scrollToEnd` call on mount so the user starts at node 1 (the first lesson, at the bottom of the map — visually the "start"):

```js
useEffect(() => {
  const timer = setTimeout(() => {
    scrollRef.current?.scrollToEnd({ animated: false });
  }, 100);
  return () => clearTimeout(timer);
}, [levels]);
```

---

## 3. Icon Name Warnings

### Root Cause
Icon names are family-specific. Several components used names from the wrong `@expo/vector-icons` family:

| Location | Invalid Name | Family Used | Fix |
|---|---|---|---|
| `JourneyMap.jsx` — `ActiveNode` | `'play-arrow'` (fallback) | `MaterialIcons` | Switched entire `ActiveNode` to use `Feather`; fallback changed to `'play'` |
| `G1.json` — node 1 | `'shape-outline'` | (Feather) | Changed to `'square'` |
| `Grades.jsx` — G3 grade card | `'potted-plant'` | `MaterialIcons` | Changed to `'eco'` (valid MaterialIcons name) |

`MaterialIcons` was removed from the `JourneyMap.jsx` import since it was no longer used after the switch to `Feather` in `ActiveNode`.
