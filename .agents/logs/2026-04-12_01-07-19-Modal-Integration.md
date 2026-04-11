# Modal Integration: Orchestrator Workflow

**Date**: 2026-04-12
**Topic**: Connected `ExitModal` and `ResultModal` to `CurriculumOrchestrator`

## Changes Made
- **CurriculumOrchestrator.jsx**:
  - Implemented state logic for `ExitModal` and `ResultModal`.
  - Replaced immediate back-navigation on the HUD exit button with `ExitModal`.
  - Updated `handleResult` to temporarily halt advancing to the next question, instead showing `ResultModal` first.
  - Advancing requires user to hit "Continue".
- **ComposeEngine & NumpadEngine**:
  - Upgraded the `onResult` signature so engines send `userAnswer` arrays back, allowing the visual comparison to render accurately inside `ResultModal`.
- **ResultModal.jsx**:
  - Added robust checks (`getCorrectAnswerArray()`) to support new formats like `COMPOSER` targets where single discrete 'answers' are nonexistent.
