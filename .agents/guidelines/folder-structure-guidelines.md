# MathSync — Folder Structure Map

This document defines the official directory structure and naming conventions for the MathSync project. All new features must adhere to this architectural map to ensure scalability and consistency.

---

## 🏗 Project Root
```
MathSync/
├── app/                        # Expo Router (File-based Routing)
├── src/                        # Core Application Source
├── content/                    # Structured Data & Curricula (JSON)
├── assets/                     # Static Assets (Images, Fonts, Lottie)
├── .agents/                    # AI Behavior & Guidelines
│   ├── document/               # Architectural Plans & Feature Blueprints
│   ├── logs/                   # Implementation Timelines & Summaries
│   └── guidelines/             # Core Project Standards
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
│   ├── Grades.jsx              # Grade Selection Portal
│   ├── Profile.jsx             # User Statistics
│   ├── Settings.jsx            # User Preferences
│   ├── Calendar.jsx            # Schedule/Event Tracking
│   └── _layout.js              # Drawer Navigation Layout
├── classroom/                   # Classroom Management
│   └── [id].jsx                # Specific Classroom View
├── journey/                    # Grade Journeys
│   └── [grade].jsx             # Dynamic Journey Entry (data-driven)
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
│   ├── GameFlowComponents/     # Navigation & Progress UI (e.g., JourneyMap.jsx)
│   ├── HomeComponents/         # Dashboard Widgets
│   ├── LessonComponents/       # Educational Content Display
│   └── Shared/                 # Common UI (Buttons, Cards)
├── constants/                  # Configuration & Static Values
│   └── colors.js               # Global Color Palette
├── context/                    # React Context Providers
│   └── badge-system/           # Badge & Reward Logic
├── stores/                     # Global State Management (Zustand)
│   ├── user-stores/            # User Profile & Activity States
│   ├── game-stores/            # [Planned] Game configuration & Logic
│   └── app-stores/             # [Planned] Navigation & Network states
├── hooks/                      # Custom React Hooks
├── screens/                    # Specialized Screen Logics
├── services/                   # External API & Device Services
├── theme/                      # Global Theme & Design Tokens
└── utils/                      # Utility Functions & Generators
```

**Naming Rules for `/src`**:
- **Path Aliases**: All internal `src` imports MUST use the `@/` alias.
- **Assets & Content**: Use `@assets` for media and `@content` for data.
- **Components & Folders**: Must use **`PascalCase`** (e.g., `Profile/`, `WelcomeCard.jsx`).
- **Non-Component Folders**: Must use **`lowercase`** or **`kebab-case`** (e.g., `user-stores/`, `utils/`).
- **Non-Component Files**: Must use **`camelCase`** (e.g., `useLessonProgress.js`, `apiManager.js`).
- **Strict JS**: All files use `.js` or `.jsx`. Components use `.jsx`, others use `.js`.

---

## 📖 3. /content — Structured Data
The `content/` directory houses the "brains" of the application in JSON format.

```
content/
├── lesson-map/                 # Grade Journey maps (MATATAG)
│   ├── G1.json                 # Grade 1 map
│   └── G2.json                 # Grade 2 map
└── grades.json                 # [Planned] Global grade metadata
```

---

## 🎮 4. Game Module Organization
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

## 🖼 5. /assets — Static Media
```
assets/
├── anim/                       # Lottie JSON Animations
├── fonts/                      # Custom Typefaces (Lexend, Plus Jakarta Sans)
├── images/                     # UI Imagery & Graphics
└── sounds/                     # Game Audio & Feedback
```

---

## 📜 6. Timeline & Documentation Standards
All significant changes and planned architecture must be logged using the following naming conventions:
- **Plans**: `.agents/document/YYYY-MM-DD_HH-MM-SS-(TOPIC)-Document.md`
- **Logs**: `.agents/logs/YYYY-MM-DD_HH-MM-SS-(TOPIC)-UI.md`

---

_Last Updated: April 2026 for MathSync._
