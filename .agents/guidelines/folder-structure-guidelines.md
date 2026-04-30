# MathSync — Folder Structure Map

This document defines the official directory structure and naming conventions for the MathSync project. All new features must adhere to this architectural map to ensure scalability and consistency.

---

## 🏗 Project Root
```
MathSync/
├── app/                        # Expo Router (Routing & Hubs)
├── src/                        # Core Application Source (Logic/UI)
├── content/                    # Structured Data (JSON Curricula)
├── assets/                     # Static Assets (Images, Game Media)
├── .agents/                    # AI Behavior & Guidelines
│   ├── document/               # Architectural Plans & Feature Blueprints
│   ├── logs/                   # Implementation Timelines & Summaries
│   └── guidelines/             # Core Project Standards
├── scratch/                    # Temporary & Experimental Scripts
├── scripts/                    # Build & Utility Scripts
└── package.json
```

---

## 🧭 1. /app — Routing & Navigation
Following the Expo Router convention, the `app/` directory maps to the application's URL/Screen structure.

```
app/
├── (auth)/                     # Authentication Route Group
│   ├── Confirmation.jsx
│   ├── SignIn.jsx
│   ├── SignUp.jsx
│   └── _layout.js
├── (drawer)/                   # Main Navigation (Drawer)
│   ├── Badges.jsx              # Badge Collection Screen
│   ├── Calendar.jsx            # Activity Calendar
│   ├── Grades.jsx              # Grade Selection Portal
│   ├── Home.jsx                # Dashboard / Landing
│   ├── Leaderboard.jsx         # Leaderboard Screen
│   ├── MentalMath.jsx          # Mental Math Practice
│   ├── Profile.jsx             # User Statistics
│   ├── Settings.jsx            # App Settings
│   └── _layout.js              # Drawer Navigation Layout
├── classroom/                  # Teacher/Classroom Features
│   ├── [id].jsx                # Classroom Detail
│   ├── assignment/
│   │   └── [assignmentId].jsx  # Assignment Session
│   └── lesson/
│       └── [lessonId].jsx      # Classroom Lesson Session
├── exam/                       # Exam Route Group
│   └── [examId].jsx            # Exam Session
├── journey/                    # Grade Journeys
│   └── [grade].jsx             # Dynamic Journey Entry (Progress & Node Mapping)
├── game/                       # Universal Game Route
│   ├── [lessonId].jsx          # Active Game Session (Orchestrator Entry)
│   └── result.jsx              # Post-Game Result Screen
├── index.jsx                   # Entry Point / Splash Redirect
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
│   │   │   ├── CurriculumOrchestrator.jsx  # Unified lesson container
│   │   │   ├── lessonResolver.js           # Node ID to Question Bank mapper
│   │   │   └── Engines/        # 27 standard UI engines
│   │   │       ├── CalendarGridEngine.jsx
│   │   │       ├── CalendarPageEngine.jsx
│   │   │       ├── ClockSetterEngine.jsx
│   │   │       ├── CompareOrderEngine.jsx
│   │   │       ├── ComparePickerEngine.jsx
│   │   │       ├── ComposeEngine.jsx
│   │   │       ├── ConnectTheDotsEngine.jsx
│   │   │       ├── DataTableReaderEngine.jsx
│   │   │       ├── DragAndDropEngine.jsx
│   │   │       ├── FractionShapeEngine.jsx
│   │   │       ├── FruitStandEngine.jsx
│   │   │       ├── GeoboardEngine.jsx
│   │   │       ├── MatcherEngine.jsx
│   │   │       ├── MoneyEngine.jsx
│   │   │       ├── NumpadEngine.jsx
│   │   │       ├── OrdinalSequenceEngine.jsx
│   │   │       ├── PatternSequenceEngine.jsx
│   │   │       ├── PickerEngine.jsx
│   │   │       ├── PictographReaderEngine.jsx
│   │   │       ├── ShapeComposeEngine.jsx
│   │   │       ├── ShapeHuntEngine.jsx
│   │   │       ├── ShapeTracerEngine.jsx
│   │   │       ├── SortEngine.jsx
│   │   │       ├── TurnCompassEngine.jsx
│   │   │       ├── VisualNumpadEngine.jsx
│   │   │       ├── VisualPickerEngine.jsx
│   │   │       └── WordProblemEngine.jsx
│   │   ├── Generative/         # Problem-generated games (Stack 2)
│   │   │   ├── Orchestrators/
│   │   │   │   └── GenerativeOrchestrator.jsx  # Dynamic practice orchestrator
│   │   │   └── Engines/        # 14 logic-aware engines
│   │   │       ├── AdvancedFractionsEngine.jsx
│   │   │       ├── AlgebraEngine.jsx
│   │   │       ├── DecimalOrderingEngine.jsx
│   │   │       ├── FactorsMultiplesEngine.jsx
│   │   │       ├── MatchingEngine.jsx
│   │   │       ├── MeanMedianEngine.jsx
│   │   │       ├── MeasurementEngine.jsx
│   │   │       ├── MentalMathEngine.jsx
│   │   │       ├── MultiplicationEngine.jsx
│   │   │       ├── OrderingEngine.jsx
│   │   │       ├── PercentagesEngine.jsx
│   │   │       ├── PlaceValueEngine.jsx
│   │   │       ├── RoundingEngine.jsx
│   │   │       └── TimeMoneyEngine.jsx
│   │   ├── Exam/               # Exam-mode games (Stack 3) — EXISTS but NOT yet in active use; feature pending decision
│   │   │   ├── ExamOrchestrator.jsx
│   │   │   ├── ExamHUD.jsx
│   │   │   ├── ExamResultScreen.jsx
│   │   │   ├── ExamQuestionNav.jsx
│   │   │   └── Engines/
│   │   │       ├── ExamNumpadEngine.jsx
│   │   │       └── ExamVisualPickerEngine.jsx
│   │   ├── Global/             # Cross-mode Game UI Atoms
│   │   │   ├── AssetDisplay.jsx
│   │   │   ├── ExitModal.jsx
│   │   │   ├── GameFeedback.jsx
│   │   │   ├── ResultModal.jsx
│   │   │   └── Visualizers/    # Low-level game input components
│   │   │       ├── ClockFace.jsx
│   │   │       ├── CoinDisplay.jsx
│   │   │       ├── FractionVisual.jsx
│   │   │       ├── MeasurementVisual.jsx
│   │   │       ├── NumPad.jsx
│   │   │       ├── PlaceValueVisual.jsx
│   │   │       └── SequenceVisualizer.jsx
│   │   └── Flow/               # Navigation UI
│   │       └── JourneyMap.jsx
│   ├── LessonComponents/       # Reusable lesson media components
│   │   ├── OfflineVideoPlayer.jsx
│   │   └── RichTextRenderer.jsx
│   ├── Navigation/             # Custom Navigation
│   │   └── CustomDrawerContent.jsx
│   └── Profile/                # User stats & badge UI
│       ├── ActivityFeed.jsx
│       ├── BadgeItem.jsx
│       ├── BadgeScreen.jsx
│       ├── BadgeSection.jsx
│       └── ProfileBarGraph.jsx
├── constants/                  # Configuration & Registry
│   ├── assetMap.js             # Dynamic game media registry
│   ├── classroomLessonMap.js   # Classroom lesson ID mappings
│   └── colors.js               # Design token color palette
├── context/                    # React Contexts (Global settings)
├── hooks/                      # Custom hooks library
│   ├── useAppFonts.js
│   └── useWeeklyActivity.js
├── services/                   # API & data services
│   ├── apiManager.js           # Base API client
│   ├── assignmentService.js
│   ├── authService.js
│   ├── badgeService.js
│   ├── classroomService.js
│   ├── examService.js
│   ├── examSubmissionService.js
│   ├── gameAnalyticsService.js
│   ├── gameSubmissionService.js
│   ├── lessonCacheService.js
│   ├── lessonService.js
│   └── submissionService.js
├── stores/                     # Global State (Zustand)
│   ├── user-stores/
│   │   └── useUserStore.js
│   └── game-stores/
│       └── useGameEngine.js    # Session-wide score/index/sessionId
├── theme/                      # Styling & Game Themes
│   └── gameThemes.js           # Visual DNA per grade (gradient, font, accent)
└── utils/                      # Common Utility Helpers
    ├── activityAggregator.js
    ├── badgeEvaluator.js
    ├── downloadManager.js
    ├── gradeMapping.js
    ├── speechManager.js
    └── generators/             # Math Generation Library
        ├── core/               # Shared generator logic
        │   └── mathHelpers.js
        ├── common/             # General math helpers
        │   ├── arithmeticGenerator.js
        │   └── mentalMathGenerator.js
        └── grades/             # Grade-Specific Problem Generators
            ├── registry.js     # Central Topic-to-Generator Registry
            ├── G1/             # Grade 1 (placeholder — uses Curriculum stack)
            ├── G2/             # orderingNumber, placeValue, rounding
            ├── G3/             # multiplication, multiplicationMatching, timeAndMoney
            ├── G4/             # advancedFractions, measurement, orderingDecimals
            ├── G5/             # factorsMultiples, meanMedian, percentages
            └── G6/             # algebra, integerOrdering, orderOfOperations
```

**Naming Rules for `/src`**:
- **Path Aliases**: All internal `src` imports MUST use the `@/` alias.
    - **Note**: `jsconfig.json` may contain additional aliases (e.g., `@hooks/`, `@constants/`). To ensure build compatibility, only use the authorized set defined in `babel.config.js`: `@/`, `@assets`, and `@content`.
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
├── badges/
│   └── badgeBank.json          # Badge definitions and award criteria
├── lesson-map/                 # Grade Journey maps (Node definitions)
│   ├── G1.json                 # Grade 1 map
│   ├── G2.json                 # Grade 2 map
│   ├── G3.json                 # Grade 3 map
│   ├── G4.json                 # Grade 4 map
│   ├── G5.json                 # Grade 5 map
│   └── G6.json                 # Grade 6 map
└── game-data/                  # Static Question Banks (Lessons — G1 Curriculum Stack only)
    ├── dev/                    # Dev/lab question banks (not used in production)
    ├── quarter-1/              # Q1 lessons (shapes, numbers, position, compare & order)
    │   └── [lesson-topic]/
    │       └── *QuestionBank.json
    ├── quarter-2/              # Q2 lessons (measurement, numbers to 100, place value, addition to 100)
    ├── quarter-3/              # Q3 lessons (data/pictographs, subtraction, patterns)
    └── quarter-4/              # Q4 lessons (fractions, money, time/clocks, calendar/turns)
        └── [lesson-topic]/
            └── *QuestionBank.json
```

---

## 🎮 4. Triple-Stack Game Architecture (Standardized)
MathSync uses three isolated game pipelines:

- **Stack 1: Curriculum Games** (`src/Components/Game/Curriculum/`): JSON-driven, structured lessons aligned with MATATAG. Used by Grade 1. Orchestrated by `CurriculumOrchestrator.jsx`, which routes to per-question engines based on each question's `type` field.
- **Stack 2: Generative Games** (`src/Components/Game/Generative/`): Logic-driven, infinite practice modes. Used by Grades 2–6. Orchestrated by `GenerativeOrchestrator.jsx` using procedural generators from `utils/generators/grades/`.
- **Stack 3: Exam** (`src/Components/Game/Exam/`): Fixed-question exam sessions with navigation and result tracking. Code exists but **this stack is not yet in active use — feature decision pending**.

---

## 🖼 5. /assets — Static Media
```
assets/
├── adaptive-icon.png           # Expo adaptive icon
├── favicon.png
├── icon.png
├── splash-icon.png
└── games/                      # Game-specific media assets
    ├── q1-assets/              # Quarter 1 specific images
    └── shared/                 # Assets used across multiple lessons
        ├── blocks/             # Base-10 blocks
        ├── characters/         # Boy/Girl characters
        ├── clocks/             # Clock face variants (1–12)
        ├── icons/              # Item icons (fruit, objects)
        ├── money/              # Philippine coins and bills
        ├── paperclip-ruler-hand/  # Measurement tools
        ├── shapes/             # Geometry shape assets
        └── sticks/             # Counting sticks & bundles
```

---

## 📜 6. Timeline & Documentation Standards
All significant changes and planned architecture must be logged using the following naming conventions:
- **Plans**: `.agents/document/YYYY-MM-DD_HH-MM-SS-(TOPIC)-Document.md`
- **Logs**: `.agents/logs/YYYY-MM-DD_HH-MM-SS-(TOPIC)-UI.md`
- **Master Reference**: `.agents/logs/MathSync_G1_Full_History.md` (Consolidated log of all implementation steps)

---

_Last Updated: April 2026 for MathSync._
