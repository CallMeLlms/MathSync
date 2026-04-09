# MathSync Codebase Standards

This document defines the architectural and stylistic boundaries for development in the MathSync codebase. All AI-assisted and manual contributions must strictly adhere to these rules.

> [!NOTE]
> **JavaScript Only**: This project is strictly JavaScript-based. Use `.js` or `.jsx` extensions. TypeScript (`.ts` / `.tsx`) is not used.

---

## 🎨 1. Styling Rules

To maintain consistency and performance across the React Native application, the following styling rules are non-negotiable:

- **StyleSheet Only**: Use `StyleSheet.create()` from `react-native`. **Do not** use TailwindCSS, NativeWind, or any other utility-first CSS frameworks.
- **CamelCase Keys**: All style keys must use `camelCase` (e.g., `containerWrapper`, `submitButton`, `labelText`).
- **No Static Inline Styles**: Styles should be defined at the bottom of the file outside the component function. Inline styles are permitted **only** for runtime-calculated values (e.g., dynamic theme colors, animation transforms).
- **External Definition**: Always define styles at the bottom of the file to keep components clean and readable.

---

## 🗂 2. File & Folder Conventions

Consistency in naming is critical for codebase navigability. Follow these patterns for all new directories and files:

### Path Aliases
- **Use Aliases**: Use the `@/` prefix for imports within the `src/` directory (e.g., `import Colors from '@/constants/colors'`).
- **Avoid Long Relative Paths**: Do not use deeply nested relative paths (e.g., `../../../../src/...`) unless absolutely necessary. Standardize on the mapped aliases defined in `babel.config.js`.

### Components & UI
- **Component Files**: Use `PascalCase` and the `.jsx` extension (e.g., `WelcomeCard.jsx`, `MathChoices.jsx`).
- **Component Directories**: Use `PascalCase` for any directory that exclusively groups components or nested component structures (e.g., `GameComponents/`, `MathSyncUI/`).

### Hooks
- **Prefix**: All custom hooks must start with the `use` prefix.
- **Naming**: Use `camelCase` and the `.js` extension (e.g., `useLessonProgress.js`, `useRewardState.js`).

### Non-Component Files (Utilities, Services, Stores, etc.)
- **Naming**: Use `camelCase` and the `.js` extension for any file that is not a UI component (e.g., `cacheManager.js`, `apiClient.js`).
- **Directories**: These files live in `lowercase` or `kebab-case` folders such as `utils/`, `services/`, `data-stores/`, or `app-context/`.

---

## 📝 3. Best Practices (Naming)

- Prefer descriptive names over generic ones (e.g., `useLessonProgress` instead of `useProgress`).
- Keep component files focused; if a component grows too large, split it into sub-components following the `PascalCase` directory rule.

## Timline 

- Inside the directory .agents/logs, there are md files that logs the timeline of the project. 
- Every time you make a significant change to the codebase, update the timeline log file. 
- The timeline log file is updated in a format of `YYYY-MM-DD_HH-MM-SS_TOPIC.md`.
