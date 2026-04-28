# Generative Engine Enhancements — 2026-04-29

## Summary
Three targeted fixes and one new engine across the Generative game stack.

---

## 1. OrderingEngine — Slot `minWidth` Fix
**File:** `src/Components/Game/Generative/Engines/OrderingEngine.jsx`

- Bumped `minWidth` from `60` to `64` on `styles.slot`.
- Added `alignSelf: 'center'` to prevent flex distortion when slots wrap to a new row.

---

## 2. TimeMoneyEngine — Crash Fix + UI/UX Overhaul
**File:** `src/Components/Game/Generative/Engines/TimeMoneyEngine.jsx`

### Bug Fix
- `runOnJS` was used inside a Gesture worklet (`AnimatedChoiceTile` `.onEnd`) but was missing from the `react-native-reanimated` import. Added to import — resolves crash on choice tap.

### UI/UX Changes
- **Sinking animation**: Replaced `scale` with `translateY` + animated `borderBottomWidth` (idle: `translateY: 0` / `borderBottomWidth: 6`; pressed: `translateY: 4` / `borderBottomWidth: 2`) per Tactile Bulky spec.
- **Visual enclosure**: Added `borderBottomWidth: 6` to the coin/clock container card for depth consistency.
- **Choice tile sizing**: Added `minHeight: 72` and `minWidth: 120` to prevent collapse on small phones.
- **Dynamic instruction text**: Changes from "Tap your answer" to "Answer locked in!" after selection.
- **Prop rename**: `width` prop on `AnimatedChoiceTile` renamed to `tileWidth` to avoid shadowing the `Dimensions.get('window').width` constant.

---

## 3. MultiplicationEngine — New Engine
**File:** `src/Components/Game/Generative/Engines/MultiplicationEngine.jsx` *(new)*

- Created for the `multiplication` topic (Grade 3), consuming `multiplicationGenerator.js` output.
- **Layout**: Large equation display card (LinearGradient panel) + 2×2 tactile MCQ choice grid.
- **Equation card**: Semi-transparent gradient using `theme.primaryColor`, equation parts rendered individually with the `×` symbol in `theme.primaryColor` for visual emphasis. Includes a "Think: X groups of Y" hint line from `metadata.operand1`/`operand2`.
- **Choice tiles**: Full Tactile Bulky spec — `borderWidth: 2`, animated `borderBottomWidth` (6 idle → 2 pressed), `translateY` sinking, `borderRadius: 16`, 350ms delay before `onAnswer` fires.
- **State guard**: `hasAnswered.current` ref prevents double-submission; reset via `useEffect` on `problem.answer` change.
- **Registered** in `GenerativeOrchestrator.jsx` under key `'multiplication'`.

---

## Files Modified
- `src/Components/Game/Generative/Engines/OrderingEngine.jsx`
- `src/Components/Game/Generative/Engines/TimeMoneyEngine.jsx`
- `src/Components/Game/Generative/Engines/MultiplicationEngine.jsx` *(new)*
- `src/Components/Game/Generative/Orchestrators/GenerativeOrchestrator.jsx`
