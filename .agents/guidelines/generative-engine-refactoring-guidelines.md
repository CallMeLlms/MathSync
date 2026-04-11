# Guideline: Refactoring Legacy Engines to MathSync

This document defines the process for extracting "bundled" legacy game logic into the decoupled, high-performance **Dual-Stack** architecture of MathSync.

## 1. The De-bundling Principle

Legacy components (`MathTRICk`) often bundle logic, state, and UI. In MathSync, these must be split:

| Layer | Responsibility | Location |
| :--- | :--- | :--- |
| **Logic (Generator)** | Math problem creation & distractors. | `src/utils/generators/` |
| **State (Orchestrator)** | Session lifecycle, scoring, and progress. | `src/Components/Game/Generative/Orchestrators/` |
| **UI (Engine)** | Pure visual representation and user input. | `src/Components/Game/Generative/Engines/` |
| **Visualizers (Shared)** | Reusable math manipulatives (blocks, lines). | `src/Components/Game/Global/Visualizers/` |

> [!TIP]
> **Don't Silo Visualizers**: Always check `Global/Visualizers` before creating new visual assets inside an engine folder. If a visual component (like number lines or base-10 blocks) is generically useful, it belongs in the Global directory to ensure architectural consistency and reusability.

## 2. Stateless Engine Requirements

All engines MUST be functional components that follow this interface:

```jsx
export default function MyEngine({ problem, onAnswer, theme, showFeedback }) {
  // 1. Receive data via props
  // 2. Report answers via onAnswer(isCorrect, formattedAnswer)
  // 3. Style using the 'theme' object
}
```

- **NO Zustand in Engines**: Engines should never import `useGameEngine`. They report results up to the Orchestrator.
- **NO Local Timers**: Session-wide timers belong in the Orchestrator.

## 3. Strict Design Guideline Compliance

To ensure the MathSync UI is consistent, performant, and curriculum-aligned, all engines MUST abide by the official `design-guidelines.md`.

- **🚫 NO Shadows**: Shadows (`shadowColor`, `elevation`, etc.) are strictly prohibited. Achieve depth using **Tonal Layering** (e.g., using `surface` vs `surface-container` shades) or thick bottom/right borders (`borderWidth: 3`).
- **Gradients & Backgrounds**: Screen backgrounds and prominent thematic elements should leverage `LinearGradient` from `expo-linear-gradient` utilizing `theme.gradient`.
- **Typography Integration**: Adopt MathSync's dual-font system. Use `theme.fontFamily.title` (Lexend) for high-impact headers and prompts, and `theme.fontFamily.body` or `theme.fontFamily.accent` (Plus Jakarta Sans) for readable data elements and instructional text.
- **Flexbox First (Responsive)**: Prioritize Flexbox (`flex`, `alignItems`, percentage-based widths) for native layout adaptability. Only fallback to calculating exact pixels via `useWindowDimensions()` when Flexbox is insufficient.
- **Dynamic Theming**: Always derive primary and accent styling from the `theme` prop (e.g., `theme.primaryColor`) rather than hardcoding hex values.

## 4. Standard Interactions

- **Haptics**: Use `expo-haptics` on every significant interaction.
    - `Light`: Tile selection.
    - `Medium`: Confirmation/Submit.
    - `Heavy`: Error/Failure.
- **Animations**: Use Reanimated 3.
    - Prefer `entering={FadeIn}`/`exiting={FadeOut}` for slot transitions.
    - Use `layout={LinearTransition}` for grid reshuffles.

## 5. Workflow: The Extraction Steps

1. **Extraction**: Identify the core "Question Area" and "Choice Container" in the legacy file.
2. **Prop Mapping**: Map legacy `useState` values to the new `problem` object structure.
3. **Theming**: Replace legacy `hex` colors with `theme` tokens.
4. **Haptic Pass**: Add haptics to all `TouchableOpacity` or `GestureDetector` handlers.
5. **Registration**: Add the engine to the `GenerativeOrchestrator` resolver and register its generator in `registry.js`.
