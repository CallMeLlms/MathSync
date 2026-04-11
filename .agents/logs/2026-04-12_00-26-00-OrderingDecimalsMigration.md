# Ordering Decimals Generative Engine Migration

- **Date**: 2026-04-12
- **Focus**: Migrating the Ordering Decimals game to the new "Dual-Stack" MathSync standard.

## 🧠 Logic Porting (`orderingDecimalsGenerator.js`)
- Harvested exact difficulty scaling configurations from the legacy system:
  - Easy: 4 decimals, tenths, ascending.
  - Medium: 5 decimals, tenths/hundredths, ascending/descending.
  - Hard: 6 decimals.
- Added variable prompts: `Arrange decimals from smallest to largest!`, etc.
- Added strict reshuffling so choices are never originally spawned sorted.
- Re-architected `MathSync` generator to accept rules seamlessly.
- Retained dynamic formatting (`.toFixed`) so numbers fit with the Engine's Zero Padding feature.

## 🎨 UI Modernization (`DecimalOrderingEngine.jsx`)
- Verified exact compliance with Shadow-free design logic (`borderBottomWidth`, `borderRightWidth` layered approach).
- Confirmed use of `GestureDetector` with 0.92 scales (`withSpring` + high stiffness).
- Ensured total functional isolation (no `useGameEngine` internally, uses `onAnswer`).

## ⚙️ Generative Flow
- `registry.js` already successfully bound the `ordering-decimals` term to `decimalsG4.generateProblem`.
- `GenerativeOrchestrator` processes standard inputs and runs the `DecimalOrderingEngine`.
