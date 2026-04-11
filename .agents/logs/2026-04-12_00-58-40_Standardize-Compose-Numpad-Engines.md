# Standardizing Compose & Numpad Engines

**Date**: 2026-04-12
**Topic**: Refactored Curriculum Engines

## Changes Made
- **ComposeEngine.jsx & NumpadEngine.jsx**:
  - Removed all `shadow` and `elevation` properties, implementing the "Shadow-Free" tonal layering guidelines.
  - Replaced legacy `Satoshi` fonts with `Lexend` and `PlusJakartaSans`.
  - Replaced hardcoded hex colors with tokens from `Colors` (`@/constants/colors`).
  - Standardized props to accept `data` instead of `question` and structured output using `onResult` and `onComplete`.
- **CurriculumOrchestrator.jsx**:
  - Imported and registered `ComposeEngine` and `NumpadEngine` into the main rendering switch.
