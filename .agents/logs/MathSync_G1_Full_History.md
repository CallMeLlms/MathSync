# MathSync: Grade 1 Curriculum Master History

This document serves as the permanent chronological record of the Grade 1 curriculum development for MathSync. It tracks the migration from legacy structures to the modernized, MATATAG-compliant architecture.

## 🧭 Project Context
**Target Curriculum**: MATATAG K-10 (Philippines)
**Pedagogical Model**: Concrete-Pictorial-Abstract (CPA)
**Architecture**: Dual-Stack (Curriculum + Generative)

---

## 📅 Timeline & Milestones

### 🏁 Phase 1: Inception & Legacy Extraction (April 2026)
- **Objective**: Harvesting logic from legacy MathTRICk codebase.
- **Outcome**: Established the `content/game-data/` structure and extracted basic math generators.

### 🧩 Phase 2: Engine Development & Naming Standards (April 10-11, 2026)
- **Objective**: Creating the UI "Engines" for curriculum play.
- **Outcome**: Developed `NumpadEngine`, `MatcherEngine`, `ComposerEngine`, and `DragDropEngine`. Established `src/constants/assetMap.js` for safe asset resolution.

### 🌸 Phase 3: Grade 1 Garden Journey (April 12, 2026)
- **Objective**: Mapping the Grade 1 progress nodes.
- **Outcome**: Created `content/lesson-map/G1.json` with a 48-node garden theme. Integrated "SuperLesson" logic to bundle multiple banks per node.

### 📊 Phase 4: CPA Optimization (April 12-13, 2026)
- **Objective**: Alignment with MATATAG Grade 1 guidelines.
- **Outcome**: 
    - Standardized all 52 banks to the **1-1-1 CPA split** (1 Concrete, 1 Pictorial, 1 Abstract).
    - Reduced overall question volume to 156 high-fidelity questions.
    - Integrated localized assets (Philippine Peso, Mango, etc.).

### 🔍 Phase 5: Curriculum Audit & Asset Integration (Current)
- **Objective**: Finalizing data-layer readiness and identifying production gaps.
- **Outcome**: 
    - Successfully mapped 22 "Ready" assets into JSON data.
    - Identified 85 "TODO" production items for visual fidelity.
    - Generated automated audit reports for production tracking.

---

## 🛠 Architectural Integrity Check
- **Codebase**: React Native (StyleSheet Only), Strictly JavaScript.
- **Theming**: Integrated with `src/theme/gameThemes.js`.
- **Media**: All assets resolved via `@assets` alias and `AssetMap.js` registry.

---
**Last Updated**: 2026-04-13
**Status**: Data Layer Finalized / Asset Production Ongoing
