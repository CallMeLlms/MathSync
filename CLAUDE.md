# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

MathSync is an Expo / React Native math learning app (JavaScript only — no TypeScript). It uses Expo Router for navigation, Zustand for state, and AsyncStorage for persistence. Target surfaces are Android and Web (`expo run:android`, `expo start --web`).

## Commands

- `npm start` — Expo dev server
- `npm run android` — build/run on Android
- `npm run web` — run on web
- `npm run lint` — `expo lint`
- `npm test` — `jest --watchAll` (preset `jest-expo`). Run a single test with `npx jest path/to/file.test.js` or `npx jest -t "test name"`.
- `npm run reset-project` — `node ./scripts/reset-project.js`

## Reference Docs (read these before non-trivial work)

- [.agents/guidelines/codebase-guidelines.md](.agents/guidelines/codebase-guidelines.md) — coding standards (authoritative)
- [.agents/guidelines/folder-structure-guidelines.md](.agents/guidelines/folder-structure-guidelines.md) — directory map
- [.agents/guidelines/design-guidelines.md](.agents/guidelines/design-guidelines.md) — UI conventions (note: grade themes table is **reference-only, do not apply**)
- [.agents/document/dual_engine_architecture.md](.agents/document/dual_engine_architecture.md) — complete architectural reference for the dual-stack game system
- Other topic guides live in [.agents/guidelines/](.agents/guidelines/) (generative engine, curriculum games, reanimated 3.x, MATATAG G1 games)

## Architecture — Triple-Stack Game System

The single most important thing to understand. Three independent game pipelines exist side by side, selected by grade:

- **Curriculum Stack** ([src/Components/Game/Curriculum/](src/Components/Game/Curriculum/)) — used by **G1**. JSON question banks in [content/game-data/](content/game-data/) are merged by [lessonResolver.js](src/Components/Game/Curriculum/lessonResolver.js) into a "SuperLesson" playlist, driven by `CurriculumOrchestrator.jsx`, which routes to per-question UI engines (NumpadEngine, ComposeEngine, MatcherEngine) based on each question's `type` field.
- **Generative Stack** ([src/Components/Game/Generative/](src/Components/Game/Generative/)) — used by **G2–G6**. No JSON; procedural generators under [src/utils/generators/grades/](src/utils/generators/grades/) produce fresh problems at runtime via `GenerativeOrchestrator.jsx`. Uses a central `registry.js` to map topics → generators.
- **Exam Stack** ([src/Components/Game/Exam/](src/Components/Game/Exam/)) — Fixed-question exam sessions with navigation and result tracking. **Code exists but not yet in active use — feature decision pending.**
- **Global** ([src/Components/Game/Global/](src/Components/Game/Global/)) — cross-mode UI atoms (AssetDisplay, HUD, modals). Includes `EngineBase` for standardized game UI. **No business logic here.**
- **Flow** ([src/Components/Game/Flow/](src/Components/Game/Flow/)) — JourneyMap and navigation UI.
- **Support**: `services/` (tracking), `context/` (global setup), `classroom/` (teacher tools).

### Critical invariants

- **Engines are "dumb"**: accept `{ data, onResult }` props only. No session state, no scoring, no navigation. Orchestrators own all session logic.
- **Per-question engine routing**: the render switch reads `currentQuestion.type` — *not* `lessonContent.type` — so engines can swap mid-session within a SuperLesson.
- **`key={currentQuestionIndex}` on engines**: forces unmount/remount between questions so internal engine state never leaks across questions.
- **Legacy prop contracts**: if an engine (e.g. `MatcherEngine`) uses `{ question, onAnswer }` instead of `{ data, onResult }`, do **not** rewrite the engine — write a thin inline adapter in the Orchestrator's switch.
- **One Journey node = one topic**: `content/lesson-map/G<N>.json` node IDs map 1:1 to entries in `lessonResolver.js`. Adding a node requires adding a matching lesson.
- **Grade gating**: [app/journey/[grade].jsx](app/journey/[grade].jsx) uses a `CURRICULUM_GRADES` constant as the master switch. Grades in the list use locked→active→completed progression (persisted via `useUserStore.markLessonComplete`); grades not in the list render all nodes as `'active'`.
- **Session continuity**: `useGameEngine` (Zustand) is the session-wide source of truth for score/index/sessionId and survives engine unmounts.

## Code Conventions (enforced)

- **JS only** — `.jsx` for components (PascalCase filenames), `.js` for everything else (camelCase filenames). No TS.
- **Path aliases** (defined in [babel.config.js](babel.config.js)): `@/` → `src/`, `@assets` → `assets/`, `@content` → `content/`. Use **only** these three; avoid IDE-suggested aliases like `@hooks` or `@constants`.
- **Folder casing**: PascalCase for component dirs (`GameComponents/`), lowercase/kebab-case for non-component dirs (`utils/`, `stores/user-stores/`).
- **Styling**: `StyleSheet.create()` from `react-native` only. No Tailwind / NativeWind. camelCase style keys. Styles live at the bottom of the file; inline styles are reserved for runtime-computed values.
- **Design tokens**: never hardcode hex codes or grade fonts in components. Pull colors from [src/constants/colors](src/constants/colors) and game visual DNA from [src/theme/gameThemes.js](src/theme/gameThemes.js). Fonts are `PlusJakartaSans` and `Lexend` (not Satoshi).
- **Assets**: all dynamic game media must be registered in [src/constants/assetMap.js](src/constants/assetMap.js) and rendered via the global `AssetDisplay` component.
- **Hooks**: `use`-prefixed, camelCase, `.js`.

## Timeline / Logging Convention

Significant architectural changes are logged as markdown files under [.agents/logs/](.agents/logs/) and planning docs under [.agents/document/](.agents/document/), named `YYYY-MM-DD_HH-MM-SS_TOPIC.md`. Update these when the change is architecturally meaningful (not for routine edits).
