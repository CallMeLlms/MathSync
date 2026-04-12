# MathSync Dual-Engine Architecture
## The Complete Technical Reference for Grade 1 Curriculum & Grade 2–6 Generative Systems

> **Authored:** 2026-04-12  
> **Status:** Active  
> **Scope:** `src/Components/Game/Curriculum/`, `src/Components/Game/Generative/`, `app/journey/`, `content/`

---

## Table of Contents

1. [The Big Picture: Two Modes, One Platform](#1-the-big-picture)
2. [Type A: Curriculum Engine (The Grade 1 Model)](#2-type-a-curriculum-engine)
3. [The "SuperLesson" Pattern](#3-the-superlesson-pattern)
4. [Type B: Generative Engine (The Grades 2–6 Model)](#4-type-b-generative-engine)
5. [Access Control: Locked vs. Unlocked Progression](#5-access-control)
6. [Technical Implementation of the Multi-Engine Playlist](#6-technical-implementation)
7. [File Reference Map](#7-file-reference-map)
8. [Future Work & Extension Points](#8-future-work)

---

## 1. The Big Picture

MathSync operates in two fundamentally different modes depending on the grade level being played. This is by design. Grade 1 students are building foundational, concrete skills that need to be scaffolded carefully with curated content authored by teachers. Grades 2–6 students need high-volume, variable practice to develop automaticity, which is best served by procedurally generated problems.

```
┌─────────────────────────────────────────────────────────────┐
│                       [grade].jsx                           │
│              (Journey Map Route Controller)                  │
└────────────────────────┬────────────────────────────────────┘
                         │  grade param
           ┌─────────────┴─────────────┐
           │                           │
      grade === 'G1'           grade in ['G2'..'G6']
           │                           │
           ▼                           ▼
  ┌─────────────────┐        ┌──────────────────────┐
  │  Curriculum     │        │   Generative Engine  │
  │  Orchestrator   │        │   (Procedural Gen)   │
  │  + JSON Banks   │        │   All nodes unlocked  │
  └─────────────────┘        └──────────────────────┘
```

---

## 2. Type A: Curriculum Engine (The Grade 1 Model)

### Philosophy

Grade 1 uses a **fixed JSON Question Bank**. Every question, every answer, every prompt, and every pedagogical metadata field is pre-authored by a curriculum specialist and stored in static JSON files under `content/game-data/`. 

This is intentional. Grade 1 is a **prototyping sandbox** for the MathSync engine system — it's where new game interaction models (NumpadEngine, ComposeEngine, MatcherEngine) are incubated, tested, and refined before being promoted to the generative stack.

### Data Flow

```
content/game-data/
  └── quarter-1/
        └── grade1-q1-lesson2-numbers/
              ├── additionQuestionBank.json       → NumpadEngine
              ├── composeDecomposeQuestionBank.json → ComposeEngine
              └── numberMatchingQuestionBank.json  → MatcherEngine (pending)
                      │
                      ▼
            lessonResolver.js
            (consolidates banks → SuperLesson)
                      │
                      ▼
          CurriculumOrchestrator.jsx
          (reads currentQuestion.type per-question)
                      │
             ┌────────┴────────┐
             ▼                 ▼
       NumpadEngine      ComposeEngine
       (type='NUMPAD')   (type='COMPOSER')
```

### Key Contracts

- **Engines are "dumb"**: An Engine receives exactly one question object as `data` and one callback `onResult`. It knows nothing about the lesson, the score, or what comes next.
- **Orchestrator is "smart"**: `CurriculumOrchestrator.jsx` owns all session state — score, index, modal visibility, lesson completion marking.
- **All routing is type-driven**: The `type` field on each individual question JSON object determines which Engine renders it.

### A "Dumb" Engine — The Contract

```jsx
// Any engine only cares about these two props:
export default function NumpadEngine({ data, onResult }) {
  // data: the current question object from the JSON bank
  // onResult: (isCorrect: boolean, userAnswerItems?: any[]) => void
  
  const handleSubmit = (userInput) => {
    const isCorrect = userInput === data.answer;
    onResult(isCorrect, [userInput]); // ← bubble up, do nothing else
  };
}
```

}
```

### 2.1 Prop API Bridging (Exceptions)

If a third-party or legacy generative engine uses a different prop contract (e.g., `MatcherEngine` uses `question` and `onAnswer` instead of `data` and `onResult`), **do not modify the engine**. Instead, write a thin inline adapter in the Orchestrator's render switch:

```jsx
// CurriculumOrchestrator.jsx
case 'matcher': 
  return (
    <MatcherEngine
      key={currentQuestionIndex}
      question={activeQuestion}
      onAnswer={(isCorrect) => handleResult(isCorrect, [])}
    />
  );
```

### 2.2 UI Standard for Engines

All engines, whether curriculum or generative, must adhere to the **MathSync Design Token Standard**:

1. **Colors**: Never use hex codes. Always import `Colors` from `@/constants/colors` (e.g., `Colors.success`, `Colors.surface`).
2. **Typography**: Use the project standard font families (`PlusJakartaSans` and `Lexend`), not Satoshi.
3. **Contextual Instructions**: Provide dynamic instruction hints that change based on user state (e.g., `"Tap a tile to begin"` → `"Now tap its match"` → `"❌ Some matches are wrong"`). See `MatcherEngine` for reference.
4. **Layout**: Use `flex: 1` to fill the available safe area, rather than stacking UI components at the top of the screen.

---

## 3. The "SuperLesson" Pattern

### The Problem It Solves

Early in development, each JSON bank (Addition, NumberMatching, ComposeDecompose) was mapped to its own separate Journey Map node. This meant 3 nodes → 3 separate mini-sessions → 3 separate "Finish" screens. This felt fractured and quiz-like — not engaging for a 7-year-old.

### The Solution

The **SuperLesson** groups all question banks for a single **topic** into one merged playlist that runs as a single uninterrupted session. The lesson resolver flattens them:

```javascript
// src/Components/Game/Curriculum/lessonResolver.js

questions: [
  ...G1_Addition.questions,           // Questions 1–3  → NumpadEngine
  ...G1_ComposeDecompose.questions,   // Questions 4–12 → ComposeEngine
  ...G1_NumberMatch.questions,        // Questions 13+  → MatcherEngine
],
```

### Why This Matters (Pedagogy)

| Old Approach | SuperLesson Approach |
|---|---|
| Student taps "Node 2" → 3 addition questions → "Done!" back to map | Student taps "Pairing Petals" → 15 questions of progressive difficulty → single grand "Level Complete!" |
| Feels like a quiz | Feels like an RPG level |
| 3 separate completion events | 1 significant accomplishment |
| No pedagogical narrative | Concrete → Pictorial → Abstract (CPA) progression |

The ordering of banks within the SuperLesson matters. The canonical ordering follows the **CPA pedagogical model**:
1. **Concrete** → Number Matching (visual/tactile recognition)
2. **Pictorial** → Addition (number sentences with numpad input)
3. **Abstract** → Compose & Decompose (mental decomposition)

### One Node Per Topic, Always

The Journey Map node IDs in `content/lesson-map/G1.json` ID a **curriculum topic**, not a single game type. This is the invariant that makes the SuperLesson pattern work cleanly.

```json
// G1.json — each ID maps to one topic node
{ "id": 2, "title": "Pairing Petals", "subtitle": "Read, write & add numbers up to 20" }
```

> **Rule:** `G1.json` node IDs correspond 1:1 to `lessonResolver.js` lesson IDs. If you add a new node, add a matching lesson.

---

## 4. Type B: Generative Engine (The Grades 2–6 Model)

### Philosophy

For Grades 2–6, questions are **procedurally generated at runtime**. There is no JSON bank. Instead, a Generator function takes a `difficulty` parameter and returns a fresh problem object each time it's called.

### Why Generative for Higher Grades?

- **Volume**: A Grade 4 student might need hundreds of rounding problems. Authoring those by hand is impossible.
- **Variability**: Procedural generation prevents memorization of specific values.
- **Adaptivity**: Difficulty can be adjusted based on performance without touching any data files.

### How a Generative Engine Works

```javascript
// src/utils/generators/grades/G4/roundingGenerator.js

export function generateRoundingProblem(difficulty = 'medium') {
  const range = difficulty === 'hard' ? 10000 : 1000;
  const number = Math.floor(Math.random() * range);
  const placeValue = difficulty === 'hard' ? 1000 : 100;
  
  return {
    type: 'rounding',
    prompt: `Round ${number} to the nearest ${placeValue}.`,
    answer: Math.round(number / placeValue) * placeValue,
    metadata: { difficulty, originalNumber: number, placeValue }
  };
}
```

The Generative Orchestrator calls this function each time `nextQuestion()` fires — there is no pre-loaded array.

### The Key Difference: No lessonResolver

```
Grade 2–6 Journey Node Pressed
         │
         ▼
  GenerativeOrchestrator.jsx
  (calls generator function directly)
         │
         ▼
  generator(difficulty) → fresh question object
         │
         ▼
  Generative Engine (e.g., OrderingEngine)
```

There is **no `lessonResolver.js`**, no JSON import, and no `questions` array. The Orchestrator simply keeps calling the generator.

---

### The "Master Progress Switch" (Reference Note)

The `CURRICULUM_GRADES` constant in `app/journey/[grade].jsx` acts as the primary toggle for journey map behavior. 

| Configuration | Progress Logic | Use Case |
|---|---|---|
| `grade` IN `CURRICULUM_GRADES` | **Gated** (Locked/Active/Completed) | Official MATATAG Grade 1 Lessons |
| `grade` NOT IN `CURRICULUM_GRADES` | **Open** (All nodes 'Active') | Generative Practice (Grades 2-6) |

---

## 5. Access Control: Locked vs. Unlocked Progression

This is one of the most important behavioral differences between the two engine types.

### Grade 1: Linear Progression (Locked/Active/Completed)

Grade 1 uses a **gated progression model**. A student must complete each node before the next unlocks. This mirrors the scaffolded nature of the curriculum — you cannot reasonably do Compose/Decompose before you understand basic addition.

```javascript
// app/journey/[grade].jsx

// Grade 1: status is computed from useUserStore progress
if (isCompleted) {
  status = 'completed';
} else if (allPreviousCompleted) {
  status = 'active';  // ← only unlocks when previous are done
} else {
  status = 'locked';  // ← still waiting
}
```

Completion is persisted via **`useUserStore.markLessonComplete(gradeKey, lessonId)`**, which is called by the Orchestrator when the student finishes the final question in the SuperLesson and taps "Finish".

### Grades 2–6: All Nodes Unlocked

For Grades 2–6, all journey map nodes should be **unlocked by default**. Students can practice any topic in any order — the generative system can handle anyone at any time.

```javascript
// PLANNED IMPLEMENTATION in app/journey/[grade].jsx

const CURRICULUM_GRADES = ['G1']; // Only G1 uses locked progression

const computedLevels = useMemo(() => {
  if (!curriculum) return [];

  const isGenerativeGrade = !CURRICULUM_GRADES.includes(grade);

  return curriculum.levels.map((level, index) => {
    // ── Generative grades: always unlocked ──────────────────
    if (isGenerativeGrade) {
      return { ...level, status: 'active' };
    }

    // ── Curriculum grade (G1): gated progression ────────────
    const id = String(level.id);
    const isCompleted = completedLessons.includes(id);
    const allPreviousCompleted = curriculum.levels
      .slice(0, index)
      .every((prev) => completedLessons.includes(String(prev.id)));

    let status;
    if (isCompleted) status = 'completed';
    else if (allPreviousCompleted) status = 'active';
    else status = 'locked';

    return { ...level, status };
  });
}, [curriculum, completedLessons, grade]);
```

> **This is the planned implementation.** It needs to be actualized in `[grade].jsx` when Grade 2 content is ready to ship.

---

## 6. Technical Implementation of the Multi-Engine Playlist

### 6.1 Dynamic Engine Routing (Per-Question)

The most critical architectural decision in the curriculum system is that engine routing is evaluated **per-question**, not per-lesson.

**Before (broken for SuperLessons):**
```javascript
// ❌ This locks the entire session to one engine type
switch (lessonContent.type) {
  case 'numpad': return <NumpadEngine {...props} />;
}
```

**After (multi-engine capable):**
```javascript
// ✅ This reads the type from the ACTIVE question, enabling mid-session swaps
const engineType = currentQuestion?.type?.toLowerCase();

switch (engineType) {
  case 'numpad':    return <NumpadEngine   key={currentQuestionIndex} {...props} />;
  case 'composer':  return <ComposeEngine  key={currentQuestionIndex} {...props} />;
  case 'matcher':   return <MatcherEngine  key={currentQuestionIndex} {...props} />;
  default:          return <Text>Engine "{engineType}" not found.</Text>;
}
```

### 6.2 The `key` Prop — Guaranteed Clean State

When React sees a component with the same type but a **different `key` prop**, it completely unmounts and remounts it. This is critical for engine swaps.

Without `key`, the internal `useState` of `NumpadEngine` might still be set to the previous answer when `ComposeEngine` renders in its place, causing visual bugs or stale state leaks.

```jsx
// By using the question index as the key, every new question
// forces a completely fresh engine mount — no state leakage.
<NumpadEngine key={currentQuestionIndex} data={currentQuestion} onResult={handleResult} />
```

### 6.3 Seamless Session via `useGameEngine`

Even though the UI Engine component swaps completely between questions, the **game session remains a single continuous unit**. This is because `useGameEngine` (the Zustand store) is global state — it is completely untouched by Engine mounting or unmounting.

```
Question 3 (NUMPAD)      Question 4 (COMPOSER)
NumpadEngine unmounts → ComposeEngine mounts

useGameEngine state:
  currentQuestionIndex: 3 → 4   (increments)
  totalScore: 20 → 30           (accumulates)
  sessionId: "abc-123"          (unchanged)
```

The student never perceives the engine swap. From their perspective, they answered a numpad question, saw the result modal, tapped "Continue", and the next question appeared. The underlying component swap is invisible.

### 6.4 Lesson Completion & Progress Write-back

When `currentQuestionIndex >= lessonContent.questions.length`, the Orchestrator renders the "Level Complete" screen. On the "Finish" button press:

```javascript
// CurriculumOrchestrator.jsx

onPress={() => {
  // 1. Persist completion to AsyncStorage via Zustand
  useUserStore.getState().markLessonComplete(gradeKey, lessonId);

  // 2. Navigate back to the Journey Map
  router.back();
}}

// On return, [grade].jsx re-computes computedLevels.
// The just-completed lesson is now 'completed', and the NEXT
// lesson becomes 'active' (unlocked) automatically.
```

---

## 7. File Reference Map

| File | Role |
|---|---|
| `content/lesson-map/G1.json` | Journey Map node definitions (id, title, subtitle, icon, position) |
| `content/game-data/quarter-1/.../additionQuestionBank.json` | Raw question data for the NumpadEngine |
| `content/game-data/quarter-1/.../composeDecomposeQuestionBank.json` | Raw question data for the ComposeEngine |
| `content/game-data/quarter-1/.../numberMatchingQuestionBank.json` | Raw question data for the MatcherEngine (pending) |
| `src/Components/Game/Curriculum/lessonResolver.js` | Maps node IDs → merged SuperLesson question arrays |
| `src/Components/Game/Curriculum/CurriculumOrchestrator.jsx` | Session controller: loads content, tracks index, routes engines, marks completion |
| `src/Components/Game/Curriculum/Engines/NumpadEngine.jsx` | UI for typed number input problems (`type: 'NUMPAD'`) |
| `src/Components/Game/Curriculum/Engines/ComposeEngine.jsx` | UI for part-part-whole decomposition (`type: 'COMPOSER'`) |
| `src/Components/Game/Curriculum/Engines/MatcherEngine.jsx` | UI for number-picture matching (`type: 'MATCHER'`) |
| `app/journey/[grade].jsx` | Journey route: loads G1 map, computes locked/active/completed status from store |
| `src/Components/Game/Flow/JourneyMap.jsx` | Pure UI renderer for the node map with ambient animations |
| `src/stores/user-stores/useUserStore.js` | Persists `completedLessons: { G1: ['2', '4'] }` to AsyncStorage |
| `src/stores/game-stores/useGameEngine.js` | Ephemeral session state: score, index, session ID |

---

## 8. Future Work & Extension Points

### Near-Term
- [x] **Build `MatcherEngine.jsx`** — the number matching game to complete the SuperLesson playlist for "Pairing Petals"
- [x] **Restore CPA ordering** in `lessonResolver.js` — NumberMatch (Concrete) → Addition (Pictorial) → ComposeDecompose (Abstract)
- [x] **Implement generative grade bypass** in `[grade].jsx` — added `CURRICULUM_GRADES` constant and auto-unlock logic for G2–G6

### Medium-Term
- [ ] **Grade 1 Q1 Lesson 1 — Geometric Blooms** — Author question banks for shapes and connect to Node 1
- [ ] **Grade 1 Q1 Lesson 3 — The Ranking Vines** — Author ordinal position question banks
- [ ] **Grade 1 Q1 Lesson 4 — Sorting Seeds** — Author compare and order question banks

### Architectural
- [ ] **Question bank shuffling** — The `questionRegistry.js` in the legacy codebase implements a Fisher-Yates shuffle via `getLessonQuestions()`. Consider adding optional shuffle support to `lessonResolver.js` via a flag in the SuperLesson definition.
- [ ] **Engine transition animations** — When the engine type changes mid-session (e.g., from Numpad to Compose), consider adding a brief `FadeOut/FadeIn` transition on the `engineWrapper` to visually signal to the student that a new topic is beginning.

---

_MathSync Engineering Reference — Dual-Engine Architecture v1.0_  
_Generated: 2026-04-12_
