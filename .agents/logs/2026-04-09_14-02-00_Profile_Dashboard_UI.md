# Profile Dashboard Overhaul & Design refinement

## Overview
Overhauled the Profile Dashboard to implement the "Explorer Leo / Discovery Garden" aesthetic. The UI transition focused on high-density information display using a shadow-free tonal system, strictly following project guidelines.

## Changes
- **Expanded Color System**: Updated `src/constants/colors.js` with 10+ new tonal variants (e.g., `surfaceContainerLow/High/Highest`, `primaryContainer`, `tertiaryContainer`) to enable depth through color shifts rather than shadows.
- **Explorer Leo UI Components**:
  - `AchievementSection.jsx`: Growth Bloom cards with progress tracks and tactile container styling.
  - `ActivityFeed.jsx`: Rounded pill-shaped activity rows with icon-rich labelling.
  - `ProfileBarGraph.jsx`: Custom-built weekly activity chart with animated entrance using `react-native-reanimated`.
- **Layout Refinements (User Feedback)**:
  - Removed `ProfileHeader.jsx` from the main assembly to simplify the screen entrance.
  - Removed `KeepGrowingCard.jsx` to lean out the dashboard.
  - Adjusted `ProfileBarGraph` title margins for better visual separation.
- **State Management**: Maintained `src/data-stores/useUserStore.js` as a placeholder with full documentation of the future data schema.

## Visual & Guideline Compliance
- **Zero Shadows**: Audited all new components; depth is achieved 100% through tonal background shifts and subtle `outlineVariant` borders.
- **Typography Integration**: Used `Lexend-Black` for high-impact headers and `PlusJakartaSans` for body/labels.
- **Responsive Flexbox**: All items (pills, cards, bars) use Flexbox for native responsiveness across devices.

## Future Work
- Connect placeholder components to Zustand state.
- Implement logic for persistent achievements.
- Design individual "Badge Detail" modals/views.
