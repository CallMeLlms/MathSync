# Project Documentation Plan: Learning Achievement (Growth Blooms)

**Status**: [PLANNED] / [NOT YET CREATED]
**Topic**: Evolutionary Growth System & Curriculum Mastery
**Date**: 2026-04-09_14-57-18

---

## 🎯 1. Overview
The Learning Achievement system visualizes student mastery through "Growth Blooms"—evolutionary milestones that represent progress in specific curriculum areas. This system is cumulative and persistent.

## 🏗️ 2. Architectural Blueprint

### A. The "Evolutionary" Stage Model
Blooms are not static progress bars; they evolve through life stages:
| Stage | Range | Visual Representation (Stage-ID) |
| :--- | :--- | :--- |
| **Seed** | 0-25% | stage_0 |
| **Sprout** | 26-50% | stage_1 |
| **Bud** | 51-75% | stage_2 |
| **Bloom** | 76-99% | stage_3 |
| **Mastered** | 100% | stage_4 (Permanent Trophy) |

### B. State Management (Zustand)
- **Store**: `useUserStore`.
- **Data Model**:
  ```javascript
  blooms: {
    "numeracy": {
      tag: "numeracy",
      title: "Seed Growth",
      xp: 450,
      nextStageXp: 1000,
      stage: 1,
      mastery: 0.45,
      history: [] // Stage-up timestamps
    }
  }
  ```
- **Observer Logic**: The store listens for `onActivityLogged` events. If an activity matches a bloom's `tag`, the bloom receives XP.

---

## 🖼️ 3. UI/UX Specifications

### Tactile Evolution
- **Icon Swapping**: The `AchievementSection` will dynamically swap icons based on the `stage` property (Seed icon -> Sprout icon -> etc.).
- **Stage Pulse**: When a progress change triggers a stage-up, the icon should pulse using `withSequence` and `withSpring` animations.

### Curriculum Connectivity
- **Tag Subscriptions**: Each unit in the backend/math-engine must be tagged. 
  - *Example*: Completing `lesson_introduction_to_addition` (tag: `numeracy`) feeds the "Seed Growth" bloom.

---

## 🛠️ 4. Future Implementation Steps
1. Migrate `blooms` state from static to the Zustand user store.
2. Implement the `useBloomProgress` hook to handle stage-to-icon mapping.
3. Build the `activityObserver` utility to distribute XP from incoming logs.
4. Refactor `AchievementSection.jsx` to be zero-mock data.
