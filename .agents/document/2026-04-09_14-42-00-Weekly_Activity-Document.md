# Project Documentation Plan: Weekly Activity Track

**Status**: [PLANNED] / [UNDER REVISION]
**Topic**: Dynamic Activity Logging & Weekly Visualization
**Date**: 2026-04-09_14-42-00

---

## 🎯 1. Overview
The Weekly Activity track provides students with a visual representation of their learning consistency over a rolling 7-day window. This system uses raw XP-based logs to compute real-time growth metrics.

## 🏗️ 2. Architectural Blueprint

### A. State Management (Zustand + Persistence)
To ensure isolation and performance, we follow a **Dictionary-per-User** approach:
- **Storage**: Single static key `mathsync-app-storage`.
- **State Structure**:
  ```javascript
  {
    activeUserId: "user_123",
    users: {
      "user_123": { activities: [...] },
      "user_456": { activities: [...] }
    }
  }
  ```
- **Pruning (Garbage Collection)**: The `addActivity` action aggressively prunes logs older than 30 days to avoid `AsyncStorage` bloat.

### B. Timezone & Data Integrity
- **Storage**: All timestamps are stored in **UTC (ISOString)**.
- **Display**: Conversion to the user's local timezone occurs only at the "Selector/Hook" layer during graph mapping.

### C. Metric: XP Logic
- **Primary Metric**: **Sum of XP Points**.
- **Normalization**: The graph Y-Axis is dynamic. The ceiling is calculated as `Math.max(...dailyTotals) * 1.2` to ensure bars never overflow the UI container.

---

## 🖼️ 3. UI/UX Specifications

### The "Empty State" Experience
When 0 activities are recorded for the current window:
- **Visual**: Minimal 5% height bars.
- **Message**: "Not much growth yet! Start learning!"

### Tactile Feedback
- **Growth Animation**: Bars use `react-native-reanimated` with `Easing.out(Easing.exp)`.
- **Shadow-Free**: Tonal depth layering only.

---

## 🛠️ 4. Future Implementation Steps (ON HOLD)
1. Implement the user-dictionary structure in `useUserStore.js`.
2. Create `activityAggregator.js` with dynamic normalization logic ($max \times 1.2$).
3. Integrate UTC-to-Local conversion in `useWeeklyActivity.js`.

