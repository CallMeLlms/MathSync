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

## 📏 6. The Golden Rule for Responsive Design

To ensure the application looks perfect across all screen sizes (phones, tablets), follow this hierarchy for layout decisions:

1.  **Flexbox First (Natively Responsive)**: Always prioritize layouts using `flex`, `alignItems`, `justifyContent`, and percentage-based strings (e.g., `width: '50%'`). This is highly performant and handles different aspect ratios natively without extra logic.
2.  **Hooks Second (Calculated Layouts)**: Only use `useWindowDimensions` or `useSafeAreaInsets` if Flexbox is insufficient—for example, when you need to calculate a specific aspect ratio or absolute position that depends on the exact screen pixel values.

---

## 📜 7. JavaScript Standard (JS-only)

The project is strictly JavaScript-only. 

**Rules:**
- **No TypeScript**: Do not use interfaces, types, or generics in code examples.
- **StyleSheet Exclusive**: Always use `StyleSheet.create()` from `react-native`.
- **Extensions**: Use `.js` for logic and `.jsx` for UI.

---

## 🧱. Core Principle: Tactile Depth (The 3D Rule)

**Drop shadows (`shadowColor`, `elevation`) remain strictly prohibited.** Depth is achieved through the **Layered Border** technique.

### The "Bulky" Construction
Every interactive element must follow this CSS construction:
* **Border:** A standard `borderWidth: 2` around the entire element.
* **Bottom Depth:** A `borderBottomWidth` between **4px and 8px** (depending on element size).
* **Border Radius:** Generous rounding (**12px to 20px**) to maintain a friendly, soft appearance.

### The "Sinking" Interaction
Buttons must not just change opacity; they must **physically sink** when pressed to simulate a mechanical button.
* **Idle State:** `translateY: 0`, `borderBottomWidth: 6`.
* **Pressed State:** `translateY: 4`, `borderBottomWidth: 2`.

---

## 3. Component Specs: The "MathSync Button"

To maintain consistency across the app, use these standard dimensions for interactive components.

| Component | Aspect Ratio | Border Radius | Depth (Bottom) |
| :--- | :--- | :--- | :--- |
| **Numpad Key** | `1 / 0.85` | `16px` | `6px` |
| **Action Button** | Full Width | `16px` | `4px` |
| **Operation Icon** | `1 / 1` | `12px` | `4px` |

---

## 4. Gradients & Layering

Gradients should be used **inside** the bulky containers. The `LinearGradient` acts as the "skin" of the button surface.

```jsx
// Correct Layering Pattern
<View style={styles.bulkyContainer}> // Has borderBottomWidth
  <LinearGradient colors={['#81C784', '#4CAF50']} style={styles.surface}>
     <Text>1</Text>
  </LinearGradient>
</View>
```

---

## 5. Typography

**Lexend** is the primary font for all "Bulky" elements. Its geometric nature pairs perfectly with thick borders.

* **Buttons/Keys:** Use `Lexend-Bold` or `Lexend-Black`.
* **Letter Spacing:** For "Check" or "Continue" buttons, use `letterSpacing: 1.2` to increase authority.
* **Input Displays:** Use `Lexend-Black` for large equation numbers.

---

## 6. Responsive Logic (MathSync Priority)

1.  **Flexbox & Aspect Ratio:** Use `flex: 1` combined with `aspectRatio` for grid items (like numpads). This ensures buttons stay "square-ish" and bulky regardless of screen width.
2.  **Safe Areas:** When using `useWindowDimensions`, always incorporate `useSafeAreaInsets` for the bottom Action Bar to ensure it clears the "Home Indicator" on iOS devices.
3.  **The Max-Width Rule:** On tablets, use `maxWidth` (e.g., `480px`) for containers to prevent buttons from becoming unnaturally wide.

---

## 7. Technical Requirements

* **Animation Engine:** Use `react-native-reanimated` for all tactile transitions.
* **Haptics:** Every "Sinking" button press **must** trigger `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`.
* **JS-Only:** No TypeScript. Use `.jsx` for all UI components.

---

_Last Updated: April 2026 — **Transition to Tactile Bulky UI Complete.**

_Last Updated: April 2026 for MathSync — **Shadow-Free & Typography Integrated**._
