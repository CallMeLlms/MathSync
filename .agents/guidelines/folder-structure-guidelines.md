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
│   ├── SignIn.jsx              # Sign In Screen
│   ├── SignUp.jsx              # Sign Up Screen
│   └── _layout.js              # Auth Stack Layout
├── (drawer)/                   # Main Navigation (Drawer)
│   ├── Home.jsx                # Dashboard / Landing
│   ├── Profile.jsx             # User Statistics
│   ├── Settings.jsx            # User Preferences
│   ├── Calendar.jsx            # Schedule/Event Tracking
│   └── _layout.js              # Drawer Navigation Layout
├── classroom/                   # Classroom Management
│   └── [id].jsx                # Specific Classroom View
├── Index.jsx                    # Entry Point / Splash Redirect
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
├── constants/                  # Configuration & Static Values
│   └── colors.js               # Global Color Palette
├── context/                    # React Context Providers
│   └── badge-system/           # Badge & Reward Logic
├── data-stores/                # Zustand State Management
│   └── useGameConfig.js        # Global Game Configuration
├── hooks/                      # Custom React Hooks
│   ├── useLessonProgress.js    # Progress Tracking Logic
│   └── usePlayerAudio.js       # Sound Effect Management
├── screens/                    # Specialized Screen Logics
├── services/                   # External API & Device Services
│   └── apiManager.js           # Axios & Interceptor Logic
├── theme/                      # Global Theme & Design Tokens
└── utils/                      # Utility Functions & Generators
    └── problem-generators/     # Math Problem Logic
```

**Naming Rules for `/src`**:
- **Components & Component Folders**: Must use **`PascalCase`** (e.g., `GameComponents/`, `WelcomeCard.jsx`).
- **Non-Component Folders**: Must use **`lowercase`** or **`kebab-case`** (e.g., `data-stores/`, `utils/`).
- **Non-Component Files**: Must use **`camelCase`** (e.g., `useLessonProgress.js`, `apiManager.js`).
- **Strict JS**: All files use `.js` or `.jsx`. Components use `.jsx`, others use `.js`.

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
