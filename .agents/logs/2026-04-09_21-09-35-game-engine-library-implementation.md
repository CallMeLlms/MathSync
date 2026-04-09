# MathSync Architectural Document: Game Engine Library Implementation

**Date:** April 9, 2026
**Topic:** Standalone Game Engine Architecture
**Status:** Implemented & Unified

## 🚨 Standalone Engine Strategy

We have officially shifted focus from "Game Flow" orchestration to the **"Engine Mechanics"**.
*   **Encapsulation**: Engines are standardized units living in `src/Components/Game/Engines/`.
*   **Universal Interface**: Every engine adheres to a strict prop interface to ensure seamless swapping by any Orchestrator.

## 📂 Architecture Map

```
src/
├── Components/
│   └── Game/                     # UNIFIED GAME DOMAIN
│       ├── Engines/              # The Core Engine Library
│       │   └── Shared/           # AssetDisplay, GameFeedback, AssetMap
│       ├── Flow/                 # Journey Navigation (JourneyMap)
│       └── Orchestrators/        # Session Management (Grade1/GameScreen)
└── stores/
    └── game-stores/              # Global Game State (useGameEngine.js)

content/
└── game-data/                    # Universal Question Banks
    └── G1-Q1-Lessons.json        # Grade 1 Data injected into the Engines

assets/
└── images/
    └── games/                    # Centralized game imagery (moved out of src/)
```

## 🛠️ Implementation Phases

### 1. Establish the "Universal Engine Interface"
Every engine migrated from the legacy codebase must strictly follow this contract:
*   **`data`**: The raw JSON object passed down from `content/game-data/`.
*   **`onResult`**: Callback triggered for every user attempt (correct/incorrect) to update the parent score.
*   **`onComplete`**: Callback triggered when the specific mini-game goal is met.
*   **`onError`**: Callback to notify the parent if an asset fails to load or data is malformed.

### 2. Refactoring Standards
Migrating legacy engines (e.g., Grade 1) must adhere to:
*   **Style Overhaul**: Replacing all inline styles/CSS with `StyleSheet.create()` using `Colors.js`.
*   **De-coupling**: Removing ALL navigation logic (`router.push`) from the engines; they strictly broadcast events upward.

### 3. Shared Game Utilities & Asset Mapping
*   **AssetMap.js**: A central registry mapping string names to React Native `require()` paths (e.g., `apple: require('@assets/images/games/apple.png')`) to prevent dynamic import crashes.
*   **AssetDisplay.jsx**: Unified component to handle SVG/PNG rendering utilizing the `AssetMap`.
*   **GameFeedback.jsx**: Standardized "Correct/Try Again" animations and sounds.

### 4. Data & Navigation Integration (Grade 1 PoC)
*   Extract Grade 1 question logic into `content/game-data/G1-Q1-Lessons.json`.
*   Update `app/journey/[grade].jsx` to navigate to the Orchestrator (`src/Components/Game/Orchestrators/Grade1/GameScreen.jsx`).
*   The `GameScreen` fetches JSON data and dynamically renders the appropriate engine (e.g., `<PickerEngine />`) based on the `type` field.
