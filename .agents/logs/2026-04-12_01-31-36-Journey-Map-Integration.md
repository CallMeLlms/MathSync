# Journey Map: Engine Integration

**Date**: 2026-04-12
**Topic**: Live testing via Journey Map

## Changes Made
- **Lesson Payload Configuration**: Created `G1-Q1-Lessons.json` uniting chunks from `composeDecomposeQuestionBank.json` and `additionQuestionBank.json` into `g1_compose_lesson` and `g1_numpad_lesson` payloads respectively.
- **Node Status**: Updated `G1.json` to configure "Pairing Petals" and "Falling Leaves" map nodes as `"active"`, binding them to these payloads.
- **Dependency Cleanup**: Eliminated React Native crash vectors in `CurriculumOrchestrator` by commenting out unwritten game engines (`Picker`, `Counter`, `DragDrop`).
- **Route Tracking**: Modified Journey routes (`[grade].jsx`) to explicitly pass semantic grade tags so dynamic payloads fetch correctly.
