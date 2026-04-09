# Grade Selection Portal & Dynamic Journey Architecture

## Overview
Implemented a scalable, data-driven Grade Selection system and the accompanying "Journey Map" architecture. This enables students to choose a grade level and explore a unique, curriculum-aligned path of lessons and challenges.

## Changes
- **Grade Selection Portal (`app/(drawer)/Grades.jsx`)**:
  - Implemented a tactile card-based grid for Grades 1–6.
  - Features diverse tonal backgrounds (no shadows) using the project's core color palette.
  - Integrated with the global user store to persist grade selection.
- **Dynamic Journey Map (`app/journey/[grade].jsx`)**:
  - Created an "Official Journey" entry point using Expo Router's dynamic routing segments (`[grade]`).
  - Added smart data loading logic that pulls specific curriculum maps from the content layer.
- **Reusable Journey Mapping Engine (`src/Components/GameFlowComponents/JourneyMap.jsx`)**:
  - Engineered a component that automatically generates a smooth, curvy SVG pathway between nodes based on JSON coordinates.
  - Implemented tactile node states: `active`, `completed`, and `locked` with distinct visuals.
- **State Management & Persistence (`src/stores/user-stores/useUserStore.js`)**:
  - Transformed the store blueprint into a functional Zustand implementation.
  - Integrated `@react-native-async-storage/async-storage` for persistence across app restarts.
- **Curriculum Content Layer (`content/lesson-map/`)**:
  - Established a standardized JSON schema for curriculum definition.
  - Created placeholder MATATAG maps for Grade 1 and Grade 2.

## Visual & Guideline Compliance
- **Shadow-Free Depth**: All cards, nodes, and headers achieve depth through tonal layering and color shifts.
- **Typography Integration**: Heavily utilized `Lexend-Black` for branding/headers and `PlusJakartaSans` for interactive labels.
- **Responsive Flexbox**: Grid and list layouts are fully fluid for mobile and tablet compatibility.

## Future Work
- Build the "Lesson View" template for content delivery.
- Create the "Achievement Modal" for successfully completing journey nodes.
- Populate more official MATATAG curriculum data for Grades 3–6.
