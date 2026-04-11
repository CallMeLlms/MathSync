# Architectural Decisions: Generative Mapping & Orchestration

This document tracks high-level design decisions and future considerations for the MathSync Generative Engine.

## Lesson ID to Engine Mapping (Post-Migration Phase)

### Current Implementation (Phase 2)
The universal router ([app/game/[lessonId].jsx](file:///d:/LAWLL/VISUALSHIT/GITREPO/Projects/MathSync/app/game/%5BlessonId%5D.jsx)) uses a smart-detection logic to decide between `CurriculumOrchestrator` and `GenerativeOrchestrator`.
- **Logic**: If `type === 'generative'` OR the `lessonId` matches a known topic (like `ordering-numbers`), it defaults to the Generative Engine.
- **Testing Alias**: `lessonId: "1"` is currently aliased to `ordering-numbers` to allow for immediate testing from the legacy UI buttons.

### Future Strategy (Standardization)
To avoid hardcoding logic in the router, the following pattern is proposed for the v1.0 release:

1. **Curriculum Map as Source of Truth**:
   The curriculum data (JSON or Database) should include a `mode` field for every lesson node.
   ```json
   {
     "id": "1",
     "mode": "generative",
     "topicId": "ordering-numbers"
   }
   ```

2. **Decoupled Resolver**:
   A dedicated utility `src/utils/curriculum/resolveLessonType.js` should handle the logic of determining which orchestrator to launch, keeping the router clean.

3. **Topic Registry Priority**:
   If a `topicId` is provided in the URL params, the Orchestrator should always prioritize it. This allows for developer testing routes that bypass the curriculum map.

## Session Orchestration & Length

### Current Implementation
- **Infinite Practice**: Generative sessions currently default to infinite practice loops.
- **HUD**: Only the total score is displayed. No `GameConclusion` modal is triggered automatically.

### Future Considerations (UI/UX)
- **Question Goals**: Implemeting a `questionCount` (default: 10) to provide a sense of "completion" for curriculum lessons.
- **Mastery Scoring**: Optional "Mastery" mode where a lesson is completed once a target score (e.g. 100) is reached.
- **Progress Visualization**: Transitioning the HUD to show a progress bar (e.g., `currentIndex / totalQuestions`) instead of just a raw score.
- **Review Mode**: A future feature to allow students to toggle the Result Modal visibility to cross-reference the explanation with their current game board state.

---
**Date Recorded**: 2026-04-11
**Decision by**: MathSync Development Team
