# React Native Reanimated 3.x — Reference Guidelines

> **Stack:** Expo SDK ~52.0.49 · React Native 0.76.9 · Reanimated ~3.16.1 · Gesture Handler ~2.20.2  
> **Purpose:** Quick-lookup reference for animation implementation. Optimized for developer and AI-tool consumption.  
> **Source of truth:** `package.json` — always cross-check versions there.

---

## 1. Overview & Philosophy

React Native Reanimated 3.x is an animation library by Software Mansion that runs animation logic on the **UI thread** via _worklets_ — small JavaScript functions compiled and shipped to the native side by Babel.

### Why Reanimated over the built-in `Animated` API?

| Concern | RN `Animated` | Reanimated 3.x |
|---|---|---|
| Thread | JS thread (bridge serialization) | UI thread (worklets) |
| Gesture integration | Limited | First-class via `react-native-gesture-handler` |
| Layout animations | Not supported | Built-in entering/exiting/layout props |
| Interruption handling | Poor | Seamless mid-animation value takeover |
| Complexity ceiling | Low–medium | High (custom worklet logic, derived values) |

### When to use Reanimated

- Any animation that must stay at 60 fps while the JS thread is busy (data fetching, parsing, state updates).
- Gesture-driven interactions (drag, swipe, pinch).
- Layout enter/exit transitions on lists.
- Interpolated scroll effects (collapsing headers, parallax).

### Guiding principle

> ✅ **Keep animation logic off the JS thread.** Every `useState` update that drives a visual change is a re-render on the JS thread. Use `useSharedValue` + `useAnimatedStyle` instead.

---

## 2. Setup & Configuration (Expo 52)

### Installation

```bash
npx expo install react-native-reanimated
```

Expo SDK 52 ships a compatible Reanimated 3.x version. No manual native linking is required for managed workflow.

### babel.config.js

Add the Reanimated Babel plugin **last** in the plugins array:

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // ... other plugins
      "react-native-reanimated/plugin", // MUST be last
    ],
  };
};
```

> ⚠️ **Warning:** The plugin must be listed last. Other plugin orderings can cause worklet compilation failures.

### metro.config.js (recommended)

Wrap your Metro config for improved error call stacks:

```js
// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

const config = getDefaultConfig(__dirname);

module.exports = wrapWithReanimatedMetroConfig(config);
```

### Clear cache after setup

```bash
npx expo start -c
```

### Compatibility notes

- Expo SDK 52 managed workflow: fully supported, no additional native steps.
- Web: install `@babel/plugin-proposal-export-namespace-from` and add it before the Reanimated plugin in `babel.config.js`.
- Hermes engine (default in Expo 52): fully compatible.

---

## 3. Core Concepts

### `useSharedValue`

A mutable value that lives on the **UI thread**. Does _not_ trigger React re-renders when updated.

```jsx
import { useSharedValue } from "react-native-reanimated";

const offset = useSharedValue(0);

// Update (can be called from JS or UI thread):
offset.value = 100;

// Animate:
offset.value = withSpring(100);
```

### `useAnimatedStyle`

Derives a style object from shared values. The callback runs as a **worklet** on the UI thread.

```jsx
import Animated, { useAnimatedStyle } from "react-native-reanimated";

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: offset.value }],
}));

return <Animated.View style={animatedStyle} />;
```

### Animation functions

#### `withTiming` — duration-based

```jsx
import { withTiming, Easing } from "react-native-reanimated";

offset.value = withTiming(200, {
  duration: 300,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
});
```

#### `withSpring` — physics-based

```jsx
import { withSpring } from "react-native-reanimated";

scale.value = withSpring(1, {
  damping: 15,
  stiffness: 150,
});
```

#### `withDecay` — momentum/velocity-based

```jsx
import { withDecay } from "react-native-reanimated";

offset.value = withDecay({
  velocity: velocityFromGesture,
  clamp: [0, 500], // optional bounds
});
```

### Composing animations

```jsx
import {
  withSequence,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

// Sequence: run animations in order
offset.value = withSequence(
  withTiming(100, { duration: 200 }),
  withTiming(0, { duration: 200 })
);

// Delay: wait before starting
offset.value = withDelay(500, withSpring(100));

// Repeat: loop an animation
// -1 = infinite, true = reverse each cycle
offset.value = withRepeat(
  withTiming(100, { duration: 500 }),
  -1,
  true
);
```

### `useAnimatedProps`

Animate non-style native props (e.g., SVG attributes, `ScrollView` content offset).

```jsx
import Animated, { useAnimatedProps } from "react-native-reanimated";
import { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const radius = useSharedValue(50);

const animatedProps = useAnimatedProps(() => ({
  r: radius.value,
}));

return <AnimatedCircle cx="100" cy="100" animatedProps={animatedProps} />;
```

### `runOnJS` and `runOnUI`

Cross the thread boundary safely. Worklets run on the UI thread; regular JS functions run on the JS thread.

```jsx
import { runOnJS, runOnUI } from "react-native-reanimated";

// From UI thread → JS thread
const onFinished = (result) => {
  console.log("Back on JS thread:", result);
};

const animatedCallback = () => {
  "worklet";
  // ... UI thread logic ...
  runOnJS(onFinished)(42);
};

// From JS thread → UI thread
const doUIWork = () => {
  "worklet";
  // runs on UI thread
};

runOnUI(doUIWork)();
```

> ⚠️ **Warning:** `runOnJS` is asynchronous. The JS function will execute on the next event loop tick, not immediately.

### `useDerivedValue`

Compute a value derived from one or more shared values. Runs as a worklet.

```jsx
import { useDerivedValue } from "react-native-reanimated";

const x = useSharedValue(0);
const y = useSharedValue(0);

const hypotenuse = useDerivedValue(() => {
  return Math.sqrt(x.value ** 2 + y.value ** 2);
});
```

### `useAnimatedReaction`

React to shared value changes and trigger side effects.

```jsx
import { useAnimatedReaction, runOnJS } from "react-native-reanimated";

const progress = useSharedValue(0);

useAnimatedReaction(
  () => progress.value,           // what to track
  (current, previous) => {        // reaction callback (worklet)
    if (current >= 1 && (previous ?? 0) < 1) {
      runOnJS(onComplete)();      // notify JS thread once
    }
  }
);
```

### Worklets

A worklet is a JavaScript function that runs on the UI thread. Marked by the `"worklet"` directive or automatically by certain hooks.

```jsx
const clampValue = (v, min, max) => {
  "worklet";
  return Math.min(Math.max(v, min), max);
};
```

**Rules for worklets:**

- Must be self-contained — no closures over non-shared, non-primitive JS values.
- Cannot import heavy modules (no `lodash`, no `axios`).
- Can read/write `SharedValue.value`.
- Can call other worklets.
- Can call `runOnJS(fn)(args)` to jump to the JS thread.

---

## 4. Gesture Handler Integration

### Setup

```bash
npx expo install react-native-gesture-handler
```

Wrap your app root with `<GestureHandlerRootView>`:

```jsx
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* app content */}
    </GestureHandlerRootView>
  );
}
```

### Legacy vs. New API

| Legacy | New (Reanimated 3.x preferred) |
|---|---|
| `useAnimatedGestureHandler` | `Gesture.Pan()` / `Gesture.Pinch()` etc. |
| Wraps `PanGestureHandler` component | Uses `GestureDetector` component |
| Event-based object | Builder pattern with `.onStart()`, `.onUpdate()`, `.onEnd()` |

> ✅ **Best Practice:** Always use the new `Gesture` API with Reanimated 3.x.

### Full example: Draggable card

```jsx
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export function DraggableCard() {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  // Store the position at gesture start so movement is relative
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = startX.value + event.translationX;
      translateY.value = startY.value + event.translationY;
    })
    .onEnd(() => {
      // Spring back to origin
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View style={styles.container}>
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.card, animatedStyle]} />
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    width: 200,
    height: 120,
    backgroundColor: "#3B82F6",
    borderRadius: 16,
  },
});
```

---

## 5. Layout Animations

Reanimated provides declarative `entering`, `exiting`, and `layout` props on `Animated.View` (and other Animated components).

### Common presets

```jsx
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  ZoomIn,
  ZoomOut,
  LinearTransition,
} from "react-native-reanimated";

<Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)}>
  {/* content */}
</Animated.View>

// Layout transition (animates position/size changes)
<Animated.View layout={LinearTransition.springify()}>
  {/* content that changes size or position */}
</Animated.View>
```

### When to use layout animations

- **Good fit:** List items appearing/disappearing, toggling visibility, accordion expand/collapse.
- **Overkill:** Static content, performance-critical lists with hundreds of items (measure impact first).

### Code snippet: animated list item

```jsx
import React, { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

export function AnimatedList() {
  const [items, setItems] = useState(["A", "B", "C"]);

  const addItem = () => {
    setItems((prev) => [...prev, String.fromCharCode(65 + prev.length)]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Button title="Add Item" onPress={addItem} />
      {items.map((item, index) => (
        <Animated.View
          key={item}
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          layout={LinearTransition.springify()}
          style={styles.item}
        >
          <Text onPress={() => removeItem(index)}>
            {item} (tap to remove)
          </Text>
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 8 },
  item: {
    padding: 16,
    backgroundColor: "#E0E7FF",
    borderRadius: 8,
  },
});
```

---

## 6. Performance Best Practices

### Use `useSharedValue` instead of `useState` for animation drivers

`useState` triggers a React re-render on the JS thread every time the value changes. `useSharedValue` updates on the UI thread with zero re-renders.

```jsx
// ❌ Bad: re-renders entire component 60× per second during animation
const [offset, setOffset] = useState(0);

// ✅ Good: stays on UI thread
const offset = useSharedValue(0);
```

### Never read `.value` in the render path

Accessing `sharedValue.value` outside a worklet reads the value on the JS thread, which defeats the purpose and can cause stale reads.

```jsx
// ❌ Bad
return <Text>{progress.value}</Text>;

// ✅ Good: use useAnimatedStyle or useDerivedValue
const animatedStyle = useAnimatedStyle(() => ({
  width: `${progress.value * 100}%`,
}));
```

### Keep worklets pure and minimal

Worklets are compiled and serialized. Large closures or imports will bloat the worklet and can crash.

- No `require()` or dynamic `import()` inside worklets.
- No complex objects from the JS closure — only primitives and shared values.

### Limit `runOnJS` to one-time events

Calling `runOnJS` on every frame of a gesture or animation creates a bridge hop every frame, negating Reanimated's performance advantage.

```jsx
// ❌ Bad: called on every pan update
.onUpdate((e) => {
  runOnJS(setPosition)({ x: e.translationX, y: e.translationY });
})

// ✅ Good: only call on end
.onEnd(() => {
  runOnJS(onDragComplete)();
})
```

### Use `useAnimatedProps` for non-style native props

Re-rendering a component to update a native prop (like SVG `r` or `strokeDashoffset`) is expensive. `useAnimatedProps` bypasses React.

### Batch shared value updates

Multiple `.value` assignments in the same worklet execute in one native flush. Avoid spreading them across separate `runOnUI` calls.

### Avoid inline style recalculation

```jsx
// ❌ Bad: new object every render
<Animated.View style={{ transform: [{ translateX: offset.value }] }} />

// ✅ Good: stable reference via useAnimatedStyle
const style = useAnimatedStyle(() => ({
  transform: [{ translateX: offset.value }],
}));
<Animated.View style={style} />
```

### Migration note: replacing JS-thread polling

If your app currently drives UI from a large JSON state (e.g., question bank), every state update forces a full re-render. Replace the animation-relevant parts of that state with shared values:

1. Keep the data model in JS state (questions, answers, scores).
2. Extract the _visual_ state (progress, position, opacity) into shared values.
3. Drive transitions with `withTiming`/`withSpring` on the shared values instead of conditional rendering triggered by `setState`.

This decouples the rendering cost of data changes from the animation frame budget.

---

## 7. Common Patterns

### Fade In/Out toggle

```jsx
import React, { useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export function FadeToggle() {
  const [visible, setVisible] = useState(true);
  const opacity = useSharedValue(1);

  const toggle = () => {
    const next = !visible;
    opacity.value = withTiming(next ? 1 : 0, { duration: 300 });
    setVisible(next);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Button title="Toggle" onPress={toggle} />
      <Animated.View style={[styles.box, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", gap: 20, padding: 40 },
  box: { width: 150, height: 150, backgroundColor: "#6366F1", borderRadius: 12 },
});
```

### Spring-based scale press effect

```jsx
import React from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export function ScaleButton({ label }) {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.92, { damping: 15, stiffness: 200 });
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[styles.button, animatedStyle]}>
        <Text style={styles.label}>{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    backgroundColor: "#10B981",
    borderRadius: 10,
    alignItems: "center",
  },
  label: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
```

### Interpolated scroll header

```jsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

const HEADER_MAX = 120;
const HEADER_MIN = 60;

export function CollapsibleHeader() {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_MAX - HEADER_MIN],
      [HEADER_MAX, HEADER_MIN],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_MAX - HEADER_MIN],
      [1, 0.6],
      Extrapolation.CLAMP
    );
    return { height, opacity };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, headerStyle]}>
        <Text style={styles.headerText}>Header</Text>
      </Animated.View>
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {Array.from({ length: 40 }, (_, i) => (
          <View key={i} style={styles.item}>
            <Text>Item {i + 1}</Text>
          </View>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: "#4F46E5",
    justifyContent: "flex-end",
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  headerText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  scrollContent: { paddingTop: 8 },
  item: { padding: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
});
```

### Progress bar animation

```jsx
import React from "react";
import { Button, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export function ProgressBar() {
  const progress = useSharedValue(0);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  const advance = () => {
    const next = Math.min(progress.value + 0.2, 1);
    progress.value = withTiming(next, { duration: 400 });
  };

  return (
    <View style={styles.container}>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      <Button title="Advance 20%" onPress={advance} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 16 },
  track: {
    height: 12,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#3B82F6",
    borderRadius: 6,
  },
});
```

### Conditional entrance animation (replacing JSON-driven rendering)

Instead of reading a question index from a large JSON blob and conditionally rendering a new component (causing a full JS re-render), use shared values and layout animations:

```jsx
import React, { useCallback, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";

const QUESTIONS = [
  { id: 1, text: "What is the capital of France?" },
  { id: 2, text: "What is 2 + 2?" },
  { id: 3, text: "Name a primary color." },
];

export function QuestionCarousel() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % QUESTIONS.length);
  }, []);

  const question = QUESTIONS[index];

  return (
    <View style={styles.container}>
      {/* key change triggers entering/exiting layout animations */}
      <Animated.View
        key={question.id}
        entering={FadeInRight.duration(300)}
        exiting={FadeOutLeft.duration(200)}
        style={styles.card}
      >
        <Text style={styles.questionText}>{question.text}</Text>
      </Animated.View>
      <Button title="Next Question" onPress={next} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20, gap: 20 },
  card: {
    padding: 24,
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  questionText: { fontSize: 18, color: "#0C4A6E" },
});
```

---

## 8. Anti-Patterns & Pitfalls to Avoid

### 8.1 Using `useState` to drive animation values

```jsx
// ❌ Wrong: triggers re-render every frame
const [offset, setOffset] = useState(0);
// ... inside gesture: setOffset(e.translationX);

// ✅ Correct: stays on UI thread
const offset = useSharedValue(0);
// ... inside gesture: offset.value = e.translationX;
```

### 8.2 Reading `.value` inside JSX render

```jsx
// ❌ Wrong: reads JS-thread snapshot, not reactive
return <Text>Progress: {progress.value}</Text>;

// ✅ Correct: use useAnimatedStyle for visual output
// For text display, use useAnimatedReaction + runOnJS to sync to useState
```

### 8.3 Non-worklet code inside `useAnimatedStyle`

```jsx
// ❌ Wrong: Date is not available in worklet context
const style = useAnimatedStyle(() => {
  const now = new Date(); // crashes
  return { opacity: now.getSeconds() > 30 ? 1 : 0 };
});

// ✅ Correct: pass external data via shared values
const secondsFlag = useSharedValue(1);
const style = useAnimatedStyle(() => ({
  opacity: secondsFlag.value,
}));
```

### 8.4 Mixing RN `Animated` with Reanimated

```jsx
// ❌ Wrong: two incompatible animation systems
import { Animated } from "react-native";          // RN core
import ReAnimated from "react-native-reanimated";  // Reanimated

// ✅ Correct: use Reanimated exclusively
import Animated from "react-native-reanimated";
```

### 8.5 Forgetting to use the Gesture API

```jsx
// ❌ Wrong: raw PanResponder or onTouchMove — runs on JS thread
<View onTouchMove={(e) => { /* JS thread */ }} />

// ✅ Correct: GestureDetector + Gesture.Pan()
const pan = Gesture.Pan().onUpdate((e) => {
  offset.value = e.translationX; // UI thread
});
<GestureDetector gesture={pan}>
  <Animated.View style={animatedStyle} />
</GestureDetector>
```

### 8.6 Expensive JS work inside gesture callbacks

```jsx
// ❌ Wrong: parsing JSON on every frame
.onUpdate((e) => {
  runOnJS(parseAndUpdateQuestions)(largeJSON);
})

// ✅ Correct: only update shared values during gesture; defer JS work to onEnd
.onUpdate((e) => {
  translateX.value = e.translationX; // UI thread only
})
.onEnd(() => {
  runOnJS(handleGestureComplete)(); // one-time JS call
})
```

### 8.7 Mixing layout animations with `transform` animated styles on the same component

```jsx
// ❌ Wrong: layout animation (entering) and useAnimatedStyle transform on the same Animated.View
// Produces: [Reanimated] Property "transform" of AnimatedComponent(View) may be overwritten
//           by a layout animation. Please wrap your component with an animated view and apply
//           the layout animation on the wrapper.
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

return (
  <Animated.View entering={ZoomIn.springify()} style={animatedStyle}>
    {/* content */}
  </Animated.View>
);

// ✅ Correct: outer Animated.View owns the layout animation, inner owns the transform style
return (
  <Animated.View entering={ZoomIn.springify()}>
    <Animated.View style={animatedStyle}>
      {/* content */}
    </Animated.View>
  </Animated.View>
);
```

> **Rule:** Never put both an `entering`/`exiting`/`layout` prop AND a `style` containing `transform` on the same `Animated.View`. The layout animation uses `transform` internally — it will overwrite any transform from `useAnimatedStyle` on the same node. Always separate them onto two layers: one wrapper for the layout animation, one inner for the animated style.

### 8.8 Over-using `runOnJS`

```jsx
// ❌ Wrong: using runOnJS as a crutch for all logic
const style = useAnimatedStyle(() => {
  runOnJS(updateState)(offset.value); // bridge hop every frame
  return { transform: [{ translateX: offset.value }] };
});

// ✅ Correct: keep derived logic in worklets or useDerivedValue
const clamped = useDerivedValue(() =>
  Math.min(Math.max(offset.value, 0), MAX)
);
const style = useAnimatedStyle(() => ({
  transform: [{ translateX: clamped.value }],
}));
```

---

## 9. Quick Reference Cheat Sheet

### Hook → Job

| Hook / Function | Purpose | Runs on |
|---|---|---|
| `useSharedValue` | Mutable animated value | UI thread (read/write) |
| `useAnimatedStyle` | Derive styles from shared values | UI thread (worklet) |
| `useAnimatedProps` | Derive non-style native props | UI thread (worklet) |
| `useDerivedValue` | Compute values from other shared values | UI thread (worklet) |
| `useAnimatedReaction` | Side effects on shared value changes | UI thread (worklet) |
| `useAnimatedScrollHandler` | Handle scroll events | UI thread (worklet) |
| `useAnimatedRef` | Ref for `measure()` / `scrollTo()` on UI thread | Both |
| `runOnJS` | Call JS function from worklet | JS thread (async) |
| `runOnUI` | Call worklet from JS | UI thread |
| `createAnimatedComponent` | Wrap any component for animated props | — |

### Animation function selection

| Function | Use when… |
|---|---|
| `withTiming` | You need precise duration/easing control |
| `withSpring` | You want natural, physics-based motion |
| `withDecay` | Continuing momentum from a gesture velocity |
| `withSequence` | Chaining multiple animations in order |
| `withDelay` | Pausing before an animation starts |
| `withRepeat` | Looping an animation (pulse, shimmer, bounce) |
| `withClamp` | Bounding an animation's output range |

### Layout animation presets

| Entering | Exiting | Layout |
|---|---|---|
| `FadeIn` | `FadeOut` | `LinearTransition` |
| `SlideInRight` | `SlideOutLeft` | `SequencedTransition` |
| `SlideInLeft` | `SlideOutRight` | `FadingTransition` |
| `ZoomIn` | `ZoomOut` | `JumpingTransition` |
| `BounceIn` | `BounceOut` | `CurvedTransition` |
| `FlipInXUp` | `FlipOutXDown` | — |

> All presets support modifiers: `.duration(ms)`, `.delay(ms)`, `.springify()`, `.damping(n)`, `.withCallback(fn)`.

---

_Last updated for Reanimated 3.x on Expo SDK 52 (JS Only)._
