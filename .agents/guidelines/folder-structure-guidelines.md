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
├── scratch/                    # Temporary & Experimental Scripts
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
│   ├── [id].jsx                # Specific Classroom View
│   ├── assignment/             # Assignment Routes
│   │   └── [assignmentId].jsx
│   └── lesson/                 # Lesson Routes
│       └── [lessonId].jsx
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
│   │   ├── Curriculum/         # Lesson-based games (MATATAG)
│   │   │   ├── Orchestrators/  # Generic CurriculumOrchestrator
│   │   │   └── Engines/        # Standard JSON-driven engines
│   │   ├── Generative/         # Problem-generated games (Logic)
│   │   │   ├── Orchestrators/  # Dynamic PracticeOrchestrator
│   │   │   └── Engines/        # Logic-aware engines
│   │   ├── Global/             # Cross-mode Shared UI (AssetDisplay, etc.)
│   │   └── Flow/               # Navigation UI (JourneyMap)
│   ├── HomeComponents/         # Dashboard Widgets
│   ├── Shared/                 # Common UI (Buttons, Cards)
│   └── Navigation/             # Custom Navigation Components
├── constants/                  # Configuration & Registry
│   ├── colors.js               # Design Tokens
│   └── assetMap.js             # Global Image/Audio Registry
├── context/                    # React Context Providers
├── stores/                     # Global State (Zustand)
│   ├── user-stores/            # User Profile & Activity
│   └── game-stores/            # Active session & Engine logic
├── hooks/                      # Custom React Hooks
├── services/                   # External API & Auth Services
├── theme/                      # Design Tokens
├── utils/                      # Common Utility Helpers
│   └── generators/             # Math Generation Library
│       ├── common/             # Reusable Generator Logic
│       ├── core/               # Math Primitives
│       ├── grades/             # Grade-Specific Problem Brains
│       │   ├── G1/ ... G6/     # Subfolders for each grade
│       └── registry.js         # Central Topic-to-Brain Registry
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
├── game-data/                  # Static Question Banks (Lessons)
│   └── G1-Q1-Lessons.json      # Grade 1 Data injected into the Engines
└── generative-templates/       # Dynamic Generation Rules (Practice)
    └── arithmetic-addition.json
```

---

## 🎮 4. Dual-Stack Game Architecture (Standardized)
MathSync utilizes a dual-stack approach to maintain strict logic isolation.

- **Stack 1: Curriculum Games**: JSON-driven, grade-specific lessons aligned with MATATAG. Uses the generic `CurriculumOrchestrator`.
- **Stack 2: Generative Games**: Logic-driven, infinite practice modes. Uses the `PracticeOrchestrator` (Logic Brains).

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
