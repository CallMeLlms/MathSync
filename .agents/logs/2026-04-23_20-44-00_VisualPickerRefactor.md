# 2026-04-23: VisualPickerEngine Refactor & Measurement Alignment

## Overview
Refactored the `VisualPickerEngine` to support dynamic operators in the equation label and token rendering. This allows the engine to handle subtraction and other operations beyond the default addition. Simultaneously migrated the measurement word problems to this engine.

## Changes

### 1. VisualPickerEngine Refactor
- Modified `VisualPickerEngine.jsx` to extract `operator` from `metadata` (defaults to `+`).
- Updated `equationLabel` and `wordTokens` to use the dynamic `operator`.
- This enables questions like "20 - 7 = ?" to render with the correct operator pill.

### 2. Measurement Word Problems Alignment
- Updated `measurementWordProblemsQuestionBank.json` to use `VISUAL_PICKER` engine.
- Enforced strict 3-option limit for all questions.
- Configured Question 3 to use the new subtraction operator support.
- Assigned storytelling icons (`icon_boy`, `icon_girl`) to all questions.

## Impact
- `VisualPickerEngine` is now multi-operational.
- Measurement curriculum is now more visually engaging and interactive.
- Schema alignment maintained for Grade 1 curricula.
