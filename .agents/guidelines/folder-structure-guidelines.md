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
├── (drawer)/                   # Main Navigation (Drawer)
│   ├── Home.jsx                # Dashboard / Landing
│   ├── Grades.jsx              # Grade Selection Portal
│   ├── Profile.jsx             # User Statistics
│   └── _layout.js              # Drawer Navigation Layout
├── journey/                    # Grade Journeys
│   └── [grade].jsx             # Dynamic Journey Entry (Progress & Node Mapping)
├── game/                       # Universal Game Route
│   └── [lessonId].jsx          # Active Game Session (Orchestrator Entry)
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
│   │   ├── Curriculum/         # Lesson-based games (Stack 1)
│   │   │   ├── CurriculumOrchestrator.jsx # Unified lesson container
│   │   │   ├── lessonResolver.js          # Node ID to Question Bank mapper
│   │   │   └── Engines/        # Standard UI engines (Numpad, Compose, Matcher)
│   │   ├── Generative/         # Problem-generated games (Stack 2)
│   │   │   ├── Orchestrators/  # Dynamic PracticeOrchestrators
│   │   │   └── Engines/        # Logic-aware engines (Ordering, Rounding)
│   │   ├── Global/             # Game UI (Hud, Modals, AssetDisplay)
│   │   └── Flow/               # Navigation UI (JourneyMap)
│   ├── Shared/                 # Common UI (Buttons, Cards, Overlays)
│   └── Navigation/             # Custom Navigation Components
├── constants/                  # Configuration & Registry
├── stores/                     # Global State (Zustand)
│   ├── user-stores/            # User Profile & Activity
│   └── game-stores/            # Active session & Engine logic (useGameEngine)
├── theme/                      # Styling & Game Themes
├── utils/                      # Common Utility Helpers
│   └── generators/             # Math Generation Library
│       ├── grades/             # Grade-Specific Problem Brains
│       │   ├── G1/ ... G6/     # Subfolders for each grade
│       └── registry.js         # Central Topic-to-Generator Registry
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
├── lesson-map/                 # Grade Journey maps (Node definitions)
│   ├── G1.json                 # Grade 1 map (Garden Theme)
│   └── G2.json                 # Grade 2 map
├── game-data/                  # Static Question Banks (Lessons)
│   ├── quarter-1/              # Nested by Quarter
│   ├── quarter-2/              # (e.g., measurement, place-value)
│   ├── quarter-3/              # (e.g., pictographs, subtraction, patterns)
│   └── quarter-4/              # (e.g., fractions, money, time, calendar)
│       └── [lesson-topic]/     # Folder per topic
│           └── bank.json       # JSON questions mapped by lessonResolver
```

---

## 🎮 4. Dual-Stack Game Architecture (Standardized)
MathSync utilizes a dual-stack approach to maintain strict logic isolation.

- **Stack 1: Curriculum Games**: JSON-driven, grade-specific lessons aligned with MATATAG. Primarily used in Grade 1 as a prototyping sandox. Uses `CurriculumOrchestrator`.
- **Stack 2: Generative Games**: Logic-driven, infinite practice modes. Used heavily in Grades 2–6. Uses the `PracticeOrchestrator` and procedural generators.

---

## 🖼 5. /assets — Static Media
```
assets/
├── anim/                       # Lottie JSON Animations
├── fonts/                      # Custom Typefaces (Lexend, Plus Jakarta Sans)
├── images/                     # UI Imagery & Graphics

## 📜 6. Timeline & Documentation Standards
All significant changes and planned architecture must be logged using the following naming conventions:
- **Plans**: `.agents/document/YYYY-MM-DD_HH-MM-SS-(TOPIC)-Document.md`
- **Logs**: `.agents/logs/YYYY-MM-DD_HH-MM-SS-(TOPIC)-UI.md`
- **Master Reference**: `.agents/logs/MathSync_G1_Full_History.md` (Consolidated log of all implementation steps)

---

_Last Updated: April 2026 for MathSync._
