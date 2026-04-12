# Curriculum CPA Optimization & Asset Integration

This log documents the systematic modernization of the MathSync Grade 1 curriculum and the establishment of a localized asset management system.

## Summary of Changes
- **Pedagogical Alignment**: Reduced all **52 question banks** (156 questions total) to the strict **1 Concrete, 1 Pictorial, and 1 Abstract (1-1-1)** structure to comply with MATATAG guidelines.
- **Engine Modernization**:
    - Refactored `CurriculumOrchestrator.jsx` to support multi-engine "SuperLessons".
    - Updated `lessonResolver.js` to handle bundled question banks per journey node.
- **Asset Integration**:
    - Established centralized asset folders in `assets/games/shared/`.
    - Registered and mapped 25+ new WebP assets including **Philippine Money** (Bills/Coins), **Localized Icons** (Mango, Calamansi, Bread, Seashells), **Clock Faces**, and **Geometric Shapes**.
    - Updated ₱20 currency logic to prioritize the new **20 Peso Coin** for current accuracy.
- **Architecture**:
    - Deleted legacy `storeTest.js`.
    - Integrated `ConnectTheDotsEngine`, `DragAndDropEngine`, and `ShapeTracerEngine` into the orchestrator.

## Files Modified
- `content/game-data/quarter-1/**/*` (16 banks)
- `content/game-data/quarter-2/**/*` (12 banks)
- `content/game-data/quarter-3/**/*` (12 banks)
- `content/game-data/quarter-4/**/*` (12 banks)
- `content/lesson-map/G1.json`
- `src/constants/assetMap.js`
- `src/Components/Game/Curriculum/CurriculumOrchestrator.jsx`
- `src/Components/Game/Curriculum/lessonResolver.js`
- `src/stores/user-stores/storeTest.js` (Deleted)

## Technical Context
The changes were driven by the need to simplify the Grade 1 gameplay loop while increasing cultural authenticity. By moving to a 1-1-1 data structure, we reduced the asset production workload by ~60% while maintaining curriculum coverage. 

---
**Timestamp**: 2026-04-13_00-36-00
**Topic**: Curriculum CPA Optimization
