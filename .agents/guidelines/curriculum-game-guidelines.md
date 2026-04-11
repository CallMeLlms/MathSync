# MathSync Curriculum Game Guidelines

## 1. Philosophy: JSON-Driven Architecture

MathSync utilizes a **Dual-Stack Game Architecture**. While Generative Games rely on algorithmic problem solving (Stack 2), **Curriculum Games** (Stack 1) are pre-authored, JSON-driven experiences designed to align strictly with the MATATAG curriculum guidelines.

### Core Principles:
- **Data-Driven**: All problems, answers, choices, and pedagogical metadata must live in static JSON files within the `content/game-data/` directory.
- **Dumb Engines**: Game Engines are pure UI renderers. They receive a slice of data as props and bubble up interaction events. They have no awareness of the overall lesson progress or user session score.
- **Centralized Orchestration**: The `CurriculumOrchestrator` handles all global state, progress tracking, and validation, passing only the necessary active question data to the current Engine.

---

## 2. Technical Standards & Folder Structure

Curriculum games follow strict location conventions, mapped out in the core `folder-structure-guidelines.md`:

- **Data Models**: `content/game-data/` (e.g., `G1-Q1-Lessons.json`)
- **Asset Registry**: `src/constants/assetMap.js` (Maps string keys to local static assets).
- **UI Engines**: `src/Components/Game/Curriculum/Engines/` (Standard interactive UI components).
- **The Orchestrator**: `src/Components/Game/Curriculum/Orchestrators/CurriculumOrchestrator.jsx`.

---

## 3. The Implementation Flow: Creating a New Curriculum Game

### Step 1: Define the structured Data (JSON)

Every curriculum game begins with the data. Update the appropriate JSON bank in `content/game-data/` with a clearly defined schema.

**Rules:**
- Every question must have an `id`, `prompt`, and `answer`.
- Use string keys for assets (`imageKey`, `audioKey`). Do not use relative `require()` paths in JSON.
- Include a specific `engineType` mapping at the lesson or question level.

*Example (`content/game-data/G1-Q1-Lessons.json`):*
```json
{
  "lessonId": "g1-q1-l1",
  "topic": "Counting Foundations",
  "engineType": "CountingGridEngine",
  "questions": [
    {
      "id": "q1",
      "prompt": "How many apples are on the tree?",
      "imageKey": "assets_counting_apples_5",
      "targetCount": 5
    }
  ]
}
```

### Step 2: Map Static Assets

Because React Native cannot dynamically `require()` variables at runtime from JSON, you must map the string keys to hard paths in the global asset registry.

**Update `src/constants/assetMap.js`:**
```javascript
export const AssetMap = {
  // Always use the @assets alias
  assets_counting_apples_5: require('@assets/images/games/counting/apples_5.png'),
};
```

### Step 3: Architect the Engine Component

Create the specific UI interaction Engine inside `src/Components/Game/Curriculum/Engines/[EngineName].jsx`.

**Rules:**
- Follow **PascalCase** naming.
- Extract generic shared UI (buttons, cards) from `src/Components/Shared/`.
- The engine receives the current question `data` and an `onComplete` callback.
- **Do not manage session-level state**. The Engine handles local interaction state (e.g., drag coordinates, selected index) but passes the final result upward.

*Example (`CountingGridEngine.jsx`):*
```jsx
import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { AssetDisplay } from '@/Components/Game/Global/AssetDisplay';
import { PrimaryButton } from '@/Components/Shared/PrimaryButton';

export const CountingGridEngine = ({ data, onComplete }) => {
  const [currentCount, setCurrentCount] = useState(0);

  const handleSubmit = () => {
    // Determine correctness locally based on the JSON payload
    const isCorrect = currentCount === data.targetCount;
    
    // Bubble up to Orchestrator - DO NOT dispatch to global store manually
    onComplete({ 
      isCorrect, 
      userAnswer: currentCount,
      correctAnswer: data.targetCount 
    });
  };

  return (
    <View>
      <Text>{data.prompt}</Text>
      <AssetDisplay assetKey={data.imageKey} />
      {/* Interactive elements updating local currentCount state... */}
      <PrimaryButton onPress={handleSubmit} label="Submit Answer" />
    </View>
  );
};
```

### Step 4: Register the Engine in the Orchestrator

The main `CurriculumOrchestrator` must be aware of your new Engine to route lessons to it.

**Update `CurriculumOrchestrator.jsx`:**
```jsx
// 1. Import your new specific engine
import { CountingGridEngine } from '../Engines/CountingGridEngine';
import { MultiChoiceEngine } from '../Engines/MultiChoiceEngine';

// 2. Add it to the dynamic render switch
const renderEngine = () => {
  switch (currentLesson.engineType) {
    case 'CountingGridEngine':
      return <CountingGridEngine data={activeQuestion} onComplete={handleAnswerSubmit} />;
    case 'MultiChoiceEngine':
      return <MultiChoiceEngine data={activeQuestion} onComplete={handleAnswerSubmit} />;
    default:
      return <FallbackEngine message="Engine Type Not Found" />;
  }
};
```

### Step 5: End-to-End Verification

Before finalizing a new game type:
1. **Asset Checks**: Ensure the app builds without crashing on missing images mapped in `assetMap.js`.
2. **State Leakage Check**: Verify that the Engine unmounts and completely resets its local state when the Orchestrator cycles to a new question.
3. **Scoring Hookups**: Ensure the `onComplete` payload triggers the expected XP and Lives animations orchestrated by the `game-stores`.

---

## 4. Key Architectural Directives

1. **No Logic Bleed**: Do NOT perform global state mutations (e.g., deducting lives, incrementing score) inside the Engine component. Allow the Orchestrator to handle all application-level logic.
2. **Always Use Aliases**: Leverage `@/` for internal UI components and `@content` for data imports to preserve codebase mobility and prevent relative path errors.
3. **Resiliency**: Always design Engines to handle missing or malformed JSON data gracefully (e.g., using optional chaining `data?.targetCount` and fallback UI).

---
_MathSync Engineering Standard - v1.0.0_
