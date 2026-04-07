# MathSync — Folder Structure Map

This document defines the official directory structure and naming conventions for the MathSync project. All new features must adhere to this architectural map to ensure scalability and consistency.

---

## 🏗 Project Root
```
MathSync/
├── app/                        # Expo Router (File-based Routing)
├── src/                        # Core Application Source
├── assets/                     # Static Assets (Images, Fonts, Lottie)
├── .agents/                    # AI Behavior & Guidelines
└── package.json
```

---

## 🧭 1. /app — Routing & Navigation
Following the Expo Router convention, the `app/` directory maps to the application's URL/Screen structure.

```
app/
├── (auth)/                     # Authentication Route Group
│   ├── sign-in.js              # Sign In Screen
│   ├── sign-up.js              # Sign Up Screen
│   └── _layout.js              # Auth Stack Layout
├── (tabs)/                     # Main Tab Navigation (Drawer/Tabs)
│   ├── Home.jsx                # Dashboard / Landing
│   ├── GameHub.jsx             # Game Selection
│   ├── Profile.jsx             # User Statistics
│   ├── ScoresRewards.jsx       # Achievement Tracking
│   ├── Settings.jsx            # User Preferences
│   └── _layout.js              # Tab Navigation Layout
├── index.js                    # Entry Point / Splash Redirect
└── _layout.js                  # Root Application Layout
```

---

## 🧩 2. /src — Core Source Code
The `src/` directory contains all reusable logic, state, and UI components.

```
src/
├── Components/                 # UI Components (PascalCase)
│   ├── GameComponents/         # Reusable Game UI
│   ├── GameFlowComponents/     # Navigation & Progress UI
│   ├── HomeComponents/         # Dashboard Widgets
│   ├── LessonComponents/       # Educational Content Display
│   └── Shared/                 # Common UI (Buttons, Cards)
├── context/                    # React Context Providers
│   └── badge-system/           # Badge & Reward Logic
├── data-stores/                # Zustand State Management
│   └── useGameConfig.js        # Global Game Configuration
├── hooks/                      # Custom React Hooks
│   ├── useLessonProgress.js    # Progress Tracking Logic
│   └── usePlayerAudio.js       # Sound Effect Management
├── services/                   # External API & Device Services
│   └── api-manager.js          # Axios & Interceptor Logic
└── utils/                      # Utility Functions & Generators
    └── problem-generators/     # Math Problem Logic
```

**Naming Rules for `/src`**:
- **Components & Component Folders**: Must use `PascalCase` (e.g., `GameComponents/`).
- **Non-Component Folders**: Must use `lowercase` or `kebab-case` (e.g., `data-stores/`).
- **Non-Component Files**: Must use `camelCase` (e.g., `useLessonProgress.js`).
- **Strict JS**: All files use `.js` or `.jsx`.

---

## 🎮 3. Game Module Organization
MathSync uses a modular approach for its curriculum-based games.

```
src/Games/                      # Game Logic & Question Banks
└── GradeGames/                 # Grade-Specific Modules
    └── Grade1/                 # Grade 1 MATATAG-aligned
        ├── Data/               # Question Banks (JSON)
        │   └── Quarter1/       # Seasonal Lessons
        ├── Components/         # Game Engines (Picker, DragDrop)
        ├── Assets/             # Game-specific Media (Audio/PNG)
        ├── GameScreen.jsx      # Unified Game Template
        └── index.jsx           # Journey Map Entry
```

---

## 🖼 4. /assets — Static Media
```
assets/
├── anim/                       # Lottie JSON Animations
├── fonts/                      # Custom Typefaces (Satoshi)
├── images/                     # UI Imagery & Graphics
└── sounds/                     # Game Audio & Feedback
```

---

_Last Updated: April 2026 for MathSync._
