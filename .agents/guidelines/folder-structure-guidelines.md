# MathSync — Folder Structure Map

This document defines the official directory structure and naming conventions for the MathSync project. All new features must adhere to this architectural map to ensure scalability and consistency.

---

## 🏗 Project Root
```
MathSync/
├── app/                        # Expo Router (Routing & Hubs)
├── src/                        # Core Application Source (Logic/UI)
├── content/                    # Structured Data (JSON Curricula)
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
├── game/                       # Universal Game Route
│   └── [lessonId].jsx          # Active Game Session
├── Index.jsx                    # Entry Point / Splash Redirect
└── _layout.js                  # Root Application Layout
```

---

## 🧩 2. /src — Core Source Code
The `src/` directory contains all reusable logic, state, and UI components.

```
src/
├── Components/                 # UI Components (PascalCase)
│   ├── Game/                   # Unified Game Domain
│   │   ├── Engines/            # Standardized Engines (Picker, Counter)
│   │   │   └── Shared/         # Core logic (AssetDisplay, GameFeedback)
│   │   ├── Flow/               # Navigation UI (JourneyMap)
│   │   └── Orchestrators/      # Session Management (Grade1/GameScreen)
│   ├── HomeComponents/         # Dashboard Widgets
│   ├── Shared/                 # Common UI (Buttons, Cards)
│   └── Navigation/             # Custom Navigation Components
├── constants/                  # Configuration & Global Colors
├── context/                    # React Context Providers
├── stores/                     # Global State (Zustand)
│   ├── user-stores/            # User Profile & Activity
│   └── game-stores/            # Active session & Engine logic
├── hooks/                      # Custom React Hooks
├── screens/                    # Specialized Screen wrappers
├── services/                   # External API & Auth Services
├── theme/                      # Design Tokens
└── utils/                      # Common Utility Helpers
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
└── game-data/                  # Universal Question Banks
    └── G1-Q1-Lessons.json      # Grade 1 Data injected into the Engines
```

---

## 🎮 4. Game Module Organization (THIS STRUCTURE, IS A GHOST LEGACY CODE, DO NOT FOLLOW THIS STRUCTURE ANYMORE)
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
│   └── games/                  # Centralized Game Assets (AssetMap mapped)
├── sounds/                     # Game Audio & Feedback
│   └── games/                  # Voiceovers and SFX
└── audio/                      # Raw Audio Files
```

---

## 📜 6. Timeline & Documentation Standards
All significant changes and planned architecture must be logged using the following naming conventions:
- **Plans**: `.agents/document/YYYY-MM-DD_HH-MM-SS-(TOPIC)-Document.md`
- **Logs**: `.agents/logs/YYYY-MM-DD_HH-MM-SS-(TOPIC)-UI.md`

---

_Last Updated: April 2026 for MathSync._
