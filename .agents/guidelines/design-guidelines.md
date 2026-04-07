# MathSync — UI Design Guidelines (Minimalist)

This document defines the core visual and naming standards for the MathSync project. All UI development must strictly follow these conventions to ensure a consistent, curriculum-aligned experience.

---

## 🎨 1. Color System

### Grade Themes === NOTE: DO NOT USE THESE GRADE THEMES YET. THEY ARE ONLY INCLUDED AS A REFERENCE FOR THE FUTURE. IF YOU ARE AN AI, DO NOT APPLY THESE THEMES UNTIL FORMALLY DECIDED. ===
Each grade level utilizes a unique 3-color gradient and a primary accent color. These should be defined in a central configuration (e.g., `src/store-config/gradeThemes.js`).

| Grade | Gradient (light → dark) | Accent |
|---|---|---|
| 1 | `#F48FB1` → `#E91E63` → `#AD1457` | `#E91E63` |
| 2 | `#80DEEA` → `#00BCD4` → `#00838F` | `#00BCD4` |
| 3 | `#FF8A65` → `#FF5722` → `#D84315` | `#FF5722` |
| 4 | `#81C784` → `#4CAF50` → `#2E7D32` | `#4CAF50` |
| 5 | `#FFD54F` → `#FFC107` → `#FF8F00` | `#FFC107` |
| 6 | `#90A4AE` → `#607D8B` → `#37474F` | `#607D8B` |

### Operation Themes (Math Operations)
Color mapping for core math functionalities:

| Operation | Gradient | Border |
|---|---|---|
| Addition | `#81C784` → `#4CAF50` → `#2E7D32` | `#2E7D32` |
| Subtraction | `#64B5F6` → `#2196F3` → `#1565C0` | `#1565C0` |
| Multiplication | `#BA68C8` → `#9C27B0` → `#6A1B9A` | `#6A1B9A` |
| Division | `#FF8A65` → `#FF5722` → `#D84315` | `#D84315` |

### Semantic Colors

| Token | Value | Usage |
|---|---|---|
| Correct | `#4CAF50` | Positive reinforcement, flash overlays, success badges |
| Wrong | `#F44336` | Negative feedback, error states, incorrect flashes |
| Neutral Text | `#37474F` / `#2C3E50` | Primary dark text for body and headings |
| Muted Text | `#7F8C8D` / `#78909C` | Subtitles, labels, and instructional secondary text |

---

## 🌈 2. Gradients & Backgrounds

**All main game and flow screens** must use `LinearGradient` (from `expo-linear-gradient`) as the primary background element.

```jsx
import { LinearGradient } from 'expo-linear-gradient';

// Standard Screen Background Pattern
<LinearGradient 
  colors={THEME.gradient} 
  style={styles.background}
>
  {/* Screen Content */}
</LinearGradient>
```

### Gradient Directions

| Pattern | `start` / `end` Properties |
|---|---|
| Top-to-Bottom (Backgrounds) | Default (omit properties) |
| Left-to-Right (Badges, Progress) | `{ x: 0, y: 0 }` → `{ x: 1, y: 0 }` |
| Diagonal (Cards) | `{ x: 1, y: 0 }` → `{ x: 0, y: 1 }` |

---

## 🚫 3. Core Principle: No Shadows

**The use of shadows is strictly prohibited throughout the entire application.** MathSync follows a flat, modern design language where depth is achieved through color shifts, gradients, and layering rather than drop shadows.

**Strictly Prohibited Properties:**
- `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius`
- `elevation` (Android)

**Approved Alternative for Depth:**
- Use slightly different background shades (e.g., `surface` vs `surface-container`)
- Use the **Tonal Layering** principle: Stack surfaces of different tonal weights to create visual hierarchy.

---

## 🗂 4. Naming Conventions

Maintain strict structural integrity across the repository.

- **Components Layer**:
    - **Folders**: Must use `PascalCase` (e.g., `src/Components/GameComponents/`).
    - **Files**: Must use `PascalCase` and `.jsx` (e.g., `ScoreCard.jsx`).
- **Logic & Support Layer**:
    - **Folders**: Must use `lowercase` or `kebab-case` (e.g., `src/utils/`, `src/store-config/`).
    - **Files**: Must use `camelCase` and `.js` (e.g., `useLessonProgress.js`).
- **Hooks**: Always prefix with `use` (e.g., `useSoundEffects.js`).

---

## 🆎 5. Typography

MathSync uses **Lexend** and **Plus Jakarta Sans** for a premium, editorial feel that prioritizes readability for young learners.

| Font Family | Usage |
|---|---|
| **Lexend** | Primary Headlines, Display titles, and high-impact headings. |
| **Plus Jakarta Sans** | Body text, titles, labels, and secondary instructional text. |

### Available Font Weights
Always reference the loaded font keys in your `StyleSheet`:

**Lexend:**
- `Lexend-Thin` (100)
- `Lexend-ExtraLight` (200)
- `Lexend-Light` (300)
- `Lexend-Regular` (400)
- `Lexend-Medium` (500)
- `Lexend-SemiBold` (600)
- `Lexend-Bold` (700)
- `Lexend-ExtraBold` (800)
- `Lexend-Black` (900)

**Plus Jakarta Sans:**
- `PlusJakartaSans-ExtraLight` (200)
- `PlusJakartaSans-Light` (300)
- `PlusJakartaSans-Regular` (400)
- `PlusJakartaSans-Medium` (500)
- `PlusJakartaSans-SemiBold` (600)
- `PlusJakartaSans-Bold` (700)
- `PlusJakartaSans-ExtraBold` (800)

---

## 📜 6. JavaScript Standard (JS-only)

The project is strictly JavaScript-only. 

**Rules:**
- **No TypeScript**: Do not use interfaces, types, or generics in code examples.
- **StyleSheet Exclusive**: Always use `StyleSheet.create()` from `react-native`.
- **Extensions**: Use `.js` for logic and `.jsx` for UI.

---

_Last Updated: April 2026 for MathSync — **Shadow-Free & Typography Integrated**._
