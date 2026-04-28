# learningOutcomeId Integration — Architecture Document

**Date:** 2026-04-27
**Branch:** development-branch
**Author:** Justine L. Llamera
**Type:** Data Layer Enhancement — Mobile Question Banks ↔ Backend Outcome Reporting

---

## 1. General Purpose

The MathSync frontend submits game session results to the backend via `POST /api/v1/game-submissions`. The payload includes an `answers` array where each entry represents one question answered by the student. This array has always included a `learningOutcomeId` field — but it has always been `null`.

This document describes the change that makes `learningOutcomeId` meaningful. Each `learningOutcomeId` is a MongoDB ObjectId that maps to a specific `LearningOutcome` document on the backend. By stamping every question in every JSON question bank with its correct `learningOutcomeId`, the backend can now attribute each student answer to a specific curriculum learning outcome — not just to a lesson or grade.

This is a **data-layer-only enhancement**. It does not add new logic, new screens, or new API endpoints. It stamps data at the source so that data flowing through the existing pipeline arrives at the backend correctly tagged.

---

## 2. Intended Goals

### What it is trying to achieve
- **Per-outcome performance visibility for teachers.** The backend's `game-submissions` collection already stores `answers[]`. With real `learningOutcomeId` values, a teacher dashboard can now query: "How many of my students answered correctly on the *Ordinal Numbers* outcome versus the *Shapes* outcome?" — instead of just "How did students do on Game Lesson 3?"
- **Complete the backend contract.** The `POST /api/v1/game-submissions` request body has always defined `learningOutcomeId` as a nullable field per answer. It was deferred (documented as a future task in the game submission architecture document). This change fulfills that deferred requirement.
- **Keep it simple and maintainable.** The `learningOutcomeId` lives on the question JSON object — the ground truth. No runtime lookup table, no API call, no extra state. When a question is answered, `CurriculumOrchestrator` reads the field directly from the question object it already holds.

### What it is NOT doing
- It does not change the backend API schema or add new endpoints.
- It does not change any engine's behavior or props.
- It does not change `lessonResolver.js` logic.
- It does not affect the Generative Stack (G2–G6). Only the Curriculum Stack (G1 JSON banks) is touched.
- It does not add `learningOutcomeId` to the DEV engine lab bank (`content/game-data/dev/engineLabQuestionBank.json`) — dev questions are never submitted to the backend.

---

## 3. Files Referenced

### 3.1 Backend Contract Files (Reference — Do Not Modify)
| Role | Path |
|---|---|
| Submission Model | `D:\LAWLL\VISUALSHIT\GITREPO\Capstone\BackEnd\src\models\game.submission.model.js` |
| Submission Controller | `D:\LAWLL\VISUALSHIT\GITREPO\Capstone\BackEnd\src\controllers\game.submission.controller.js` |
| Submission Router | `D:\LAWLL\VISUALSHIT\GITREPO\Capstone\BackEnd\src\routers\game.submission.route.js` |

### 3.2 Frontend Service (Reference — No Change Needed)
| File | Path |
|---|---|
| Game Submission Service | `src/services/gameSubmissionService.js` |

The service already forwards the `answers` array as-is. No change to this file.

### 3.3 Frontend Orchestrator (1-line fix)
| File | Path | Change |
|---|---|---|
| CurriculumOrchestrator | `src/Components/Game/Curriculum/CurriculumOrchestrator.jsx` | `handleResult`: change `learningOutcomeId: null` → `learningOutcomeId: currentQuestion?.learningOutcomeId ?? null` |

### 3.4 JSON Question Banks (Data Changes — Add `learningOutcomeId` to every question object)

**Quarter 1 — Outcome: `69da6ad0c06b1a0596d0aedf` (Define and structure shapes)**
- `content/game-data/quarter-1/grade1-q1-lesson1-shapes/shapesQuestionBank.json`
- `content/game-data/quarter-1/grade1-q1-lesson1-shapes/shapePropertiesQuestionBank.json`
- `content/game-data/quarter-1/grade1-q1-lesson1-shapes/shapeComposingQuestionBank.json`
- `content/game-data/quarter-1/grade1-q1-lesson1-shapes/shapeHuntQuestionBank.json`

**Quarter 1 — Outcome: `69da6ad0c06b1a0596d0aee0` (Count, recognize, represent whole numbers to 100)**
- `content/game-data/quarter-1/grade1-q1-lesson2-numbers/numberMatchingQuestionBank.json`
- `content/game-data/quarter-1/grade1-q1-lesson2-numbers/additionQuestionBank.json`
- `content/game-data/quarter-1/grade1-q1-lesson2-numbers/basicAdditionQuestionBank.json`
- `content/game-data/quarter-1/grade1-q1-lesson2-numbers/composeDecomposeQuestionBank.json`
- `content/game-data/quarter-1/grade1-q1-lesson2-numbers/countingQuestionBank.json`

**Quarter 1 — Outcome: `69da6ad0c06b1a0596d0aee1` (Use ordinal numbers up to 10th)**
- `content/game-data/quarter-1/grade1-q1-lesson3-position/ordinalNumbersQuestionBank.json`
- `content/game-data/quarter-1/grade1-q1-lesson3-position/positionalReasoningQuestionBank.json`
- `content/game-data/quarter-1/grade1-q1-lesson3-position/ordinalSequenceQuestionBank.json`
- `content/game-data/quarter-1/grade1-q1-lesson3-position/ordinalMatchingQuestionBank.json`

**Quarter 1 — Outcome: `69da6ad0c06b1a0596d0aee2` (Compare and order numbers up to 20)**
- `content/game-data/quarter-1/grade1-q1-lesson4-compare-and-order/compareOrderQuestionBank.json`
- `content/game-data/quarter-1/grade1-q1-lesson4-compare-and-order/comparingQuantitiesQuestionBank.json`
- `content/game-data/quarter-1/grade1-q1-lesson4-compare-and-order/numberLineOrderingQuestionBank.json`

**Quarter 2 — Outcome: `69da6ad0c06b1a0596d0aee3` (Non-standard units for length and distance)**
- `content/game-data/quarter-2/grade1-q2-lesson1-measurement/lengthComparisonQuestionBank.json`
- `content/game-data/quarter-2/grade1-q2-lesson1-measurement/lengthMeasurementQuestionBank.json`
- `content/game-data/quarter-2/grade1-q2-lesson1-measurement/measurementWordProblemsQuestionBank.json`

**Quarter 2 — Outcome: `69da6ad0c06b1a0596d0aee4` (Order and decompose numbers to 100)**
- `content/game-data/quarter-2/grade1-q2-lesson2-numbers-to-100/countingSequenceQuestionBank.json`
- `content/game-data/quarter-2/grade1-q2-lesson2-numbers-to-100/orderingTo100QuestionBank.json`
- `content/game-data/quarter-2/grade1-q2-lesson2-numbers-to-100/skipCountingQuestionBank.json`
- `content/game-data/quarter-2/grade1-q2-lesson3-place-value/placeValueQuestionBank.json`
- `content/game-data/quarter-2/grade1-q2-lesson3-place-value/decompositionTo100QuestionBank.json`
- `content/game-data/quarter-2/grade1-q2-lesson3-place-value/expandedFormQuestionBank.json`

> Note: Lessons 7 (Numbers to 100) and 8 (Place Value) share the same outcome because both align to "order and decompose numbers up to 100" (NA). Numbers-to-100 covers counting/ordering; Place Value covers decomposition into tens and ones. Both are facets of the same MATATAG competency block.

**Quarter 2 — Outcome: `69da6ad0c06b1a0596d0aee5` (Addition with sums up to 100)**
- `content/game-data/quarter-2/grade1-q2-lesson4-addition-to-100/basicAdditionTo100QuestionBank.json`
- `content/game-data/quarter-2/grade1-q2-lesson4-addition-to-100/pictorialAdditionTo100QuestionBank.json`
- `content/game-data/quarter-2/grade1-q2-lesson4-addition-to-100/wordProblemsAdditionTo100QuestionBank.json`

**Quarter 3 — Outcome: `69da6ad0c06b1a0596d0aee6` (Pictograph without a scale)**
- `content/game-data/quarter-3/grade1-q3-lesson1-data/dataTableQuestionBank.json`
- `content/game-data/quarter-3/grade1-q3-lesson1-data/pictographInterpretationQuestionBank.json`
- `content/game-data/quarter-3/grade1-q3-lesson1-data/pictographRepresentationQuestionBank.json`

**Quarter 3 — Outcome: `69da6ad0c06b1a0596d0aee7` (Subtraction where both numbers < 100)**
- `content/game-data/quarter-3/grade1-q3-lesson2-subtraction-to-20/basicSubtractionTo20QuestionBank.json`
- `content/game-data/quarter-3/grade1-q3-lesson2-subtraction-to-20/equivalentExpressionsQuestionBank.json`
- `content/game-data/quarter-3/grade1-q3-lesson2-subtraction-to-20/missingNumberSubtractionQuestionBank.json`
- `content/game-data/quarter-3/grade1-q3-lesson3-subtraction-to-100/basicSubtractionTo100QuestionBank.json`
- `content/game-data/quarter-3/grade1-q3-lesson3-subtraction-to-100/expandedSubtractionQuestionBank.json`
- `content/game-data/quarter-3/grade1-q3-lesson3-subtraction-to-100/wordProblemsSubtractionTo100QuestionBank.json`

> Note: Lessons 12 (Subtraction to 20) and 13 (Subtraction to 100) share the same outcome. Both are covered by the single MATATAG outcome "perform subtraction of numbers where both numbers are less than 100" — the to-20 bank is the concrete/entry-level subset of the same competency.

**Quarter 3 — Outcome: `69da6ad0c06b1a0596d0aee8` (Extend and create repeating patterns)**
- `content/game-data/quarter-3/grade1-q3-lesson4-patterns/repeatingPatternsQuestionBank.json`
- `content/game-data/quarter-3/grade1-q3-lesson4-patterns/complexPatternsQuestionBank.json`
- `content/game-data/quarter-3/grade1-q3-lesson4-patterns/patternCreationQuestionBank.json`

**Quarter 4 — Outcome: `69da6ad0c06b1a0596d0aee9` (Illustrate and compare fractions 1/2 and 1/4)**
- `content/game-data/quarter-4/grade1-q4-lesson1-fractions/identifyingFractionsQuestionBank.json`
- `content/game-data/quarter-4/grade1-q4-lesson1-fractions/comparingFractionsQuestionBank.json`
- `content/game-data/quarter-4/grade1-q4-lesson1-fractions/countingFractionsQuestionBank.json`

**Quarter 4 — Outcome: `69da6ad0c06b1a0596d0aeea` (Recognize Philippine coins/bills up to ₱100)**
- `content/game-data/quarter-4/grade1-q4-lesson2-money/moneyIdentificationQuestionBank.json`
- `content/game-data/quarter-4/grade1-q4-lesson2-money/moneyValuesQuestionBank.json`

**Quarter 4 — Outcome: `69da6ad0c06b1a0596d0aeeb` (Add/subtract money up to ₱100)**
- `content/game-data/quarter-4/grade1-q4-lesson2-money/moneyWordProblemsQuestionBank.json`

> Note: The money lesson (Lesson 17) maps to two different outcomes. Identification and value recognition banks go to `...aeea`; word problems (which require addition/subtraction of money) go to `...aeeb`. This is intentional — the two outcomes are distinct competencies even within the same game lesson node.

**Quarter 4 — Outcome: `69da6ad0c06b1a0596d0aeed` (Time: hours, half hours, days, weeks, months, years)**
- `content/game-data/quarter-4/grade1-q4-lesson3-time-clocks/analogTimeQuestionBank.json`
- `content/game-data/quarter-4/grade1-q4-lesson3-time-clocks/clockMatchingQuestionBank.json`
- `content/game-data/quarter-4/grade1-q4-lesson3-time-clocks/timeLogicQuestionBank.json`

**Quarter 4 — Outcome: `69da6ad0c06b1a0596d0aeec` (Position after half/quarter turn, clockwise/counter-clockwise)**
- `content/game-data/quarter-4/grade1-q4-lesson4-calendar-turns/calendarSequenceQuestionBank.json`
- `content/game-data/quarter-4/grade1-q4-lesson4-calendar-turns/rotationsTurnsQuestionBank.json`
- `content/game-data/quarter-4/grade1-q4-lesson4-calendar-turns/usingCalendarQuestionBank.json`

---

## 4. Expected Output

### Before This Change
Every answer in every game submission payload arrives at the backend with `null`:
```json
{
  "sectionId": "...",
  "classroomId": "...",
  "lessonId": "69da6ad0c06b1a0596d0aedf",
  "totalScore": 8,
  "totalItems": 10,
  "answers": [
    { "question": "Tap the block that is a triangle.", "learningOutcomeId": null, "isCorrect": true },
    { "question": "How many corners does a square have?", "learningOutcomeId": null, "isCorrect": false }
  ]
}
```

### After This Change
Each answer carries the MongoDB ObjectId of its learning outcome:
```json
{
  "sectionId": "...",
  "classroomId": "...",
  "lessonId": "69da6ad0c06b1a0596d0aedf",
  "totalScore": 8,
  "totalItems": 10,
  "answers": [
    { "question": "Tap the block that is a triangle.", "learningOutcomeId": "69da6ad0c06b1a0596d0aedf", "isCorrect": true },
    { "question": "How many corners does a square have?", "learningOutcomeId": "69da6ad0c06b1a0596d0aedf", "isCorrect": false }
  ]
}
```

The MongoDB `game-submissions` collection document now has a fully populated `answers` array where each entry can be cross-referenced with the `LearningOutcome` collection.

---

## 5. In-Depth Technical Details

### 5.1 Three Distinct ID Types — Never Confuse Them

This system uses three different IDs that each mean something completely different:

| Name | Type | Lives in | Purpose |
|---|---|---|---|
| `gameLessonId` | String `"1"`–`"20"` | `lessonResolver.js`, URL param | Local numeric ID; used by `CurriculumOrchestrator` to load the correct JSON question banks via `getBundledLesson()` |
| `mongoLessonId` | MongoDB ObjectId string | URL param from classroom lesson `_id` | The classroom lesson's `_id` in MongoDB; sent to backend as `lessonId` in the submission body |
| `learningOutcomeId` | MongoDB ObjectId string | JSON question bank, per question object | The specific MATATAG learning outcome this question addresses; sent per-answer in the submission body |

These are never interchangeable. A single game session (e.g. `gameLessonId: "3"`, `mongoLessonId: "69d36053d4917097e571d497"`) may produce answers with `learningOutcomeId: "69da6ad0c06b1a0596d0aee1"` on every question because all questions in Lesson 3's banks address the same ordinal outcome.

### 5.2 Why the Field Lives on Individual Question Objects

The `meta` object at the top of each JSON bank already contains a `learningOutcomeId`. But `meta` is never passed to the Orchestrator — `lessonResolver.js` extracts only the `questions` array (via `bank.questions`), flattens them into a shuffled pool, and the Orchestrator works exclusively with individual question objects.

The Orchestrator's `handleResult` fires once per question, with access to `currentQuestion` — the specific question object being answered. For the outcome to be recorded per-answer, it must be a field on that object. Having it only in `meta` would require a reverse-lookup from question back to its source bank, which would be complex and fragile.

**Decision: `learningOutcomeId` belongs on the question object, not just in meta.**

### 5.3 The Complete Data Flow

```
JSON Question Bank (e.g. shapesQuestionBank.json)
  └── question object:
        {
          "id": "mg_1_shapes_001",
          "learningOutcomeId": "69da6ad0c06b1a0596d0aedf",   ← stamped here
          "type": "PICKER",
          "question": "Tap the block that is a triangle.",
          ...
        }
          ↓
lessonResolver.js → getPlayableQuestions([...banks])
  Flattens all bank.questions arrays → Fisher-Yates shuffle → flat question array
  (learningOutcomeId travels with the object — no transformation needed)
          ↓
CurriculumOrchestrator.jsx
  getBundledLesson(gradeKey, lessonId) → { questions: [...] }
  setLessonContent(content)
  currentQuestion = lessonContent.questions[currentQuestionIndex]
          ↓
Engine renders question → student answers → engine calls onResult(isCorrect, userAnswerItems)
          ↓
handleResult(isCorrect, userAnswerItems):
  recordAnswer(isCorrect)                                  // Zustand score
  answersRef.current.push({
    question: currentQuestion?.question || ...,
    learningOutcomeId: currentQuestion?.learningOutcomeId ?? null,  ← reads field here
    isCorrect,
  })
  setShowResultModal(true)
          ↓
handleComplete() — when last question is answered:
  recordSessionResult(...)     // local Zustand persist
  endGameSession()             // XP + activity log
  submitGameSession({          // fire-and-forget API call
    sectionId, classroomId,
    lessonId: mongoLessonId,   // MongoDB classroom lesson _id
    totalScore,
    totalItems,
    answers: answersRef.current,  ← array with real learningOutcomeIds
  })
          ↓
gameSubmissionService.js → apiManager.post('/game-submissions', payload)
          ↓
Backend: POST /api/v1/game-submissions
  Middleware: authorize → req.user.id = studentId
  Controller: creates game-submissions document in MongoDB
  answers[] stored with real learningOutcomeId ObjectIds
```

### 5.4 The One-Line Orchestrator Fix

**File:** `src/Components/Game/Curriculum/CurriculumOrchestrator.jsx`

**Before:**
```js
answersRef.current.push({
  question: currentQuestion?.question || currentQuestion?.instruction || currentQuestion?.text || '',
  learningOutcomeId: null,
  isCorrect,
});
```

**After:**
```js
answersRef.current.push({
  question: currentQuestion?.question || currentQuestion?.instruction || currentQuestion?.text || '',
  learningOutcomeId: currentQuestion?.learningOutcomeId ?? null,
  isCorrect,
});
```

**Why `?? null` is kept:** The DEV engine lab bank (`engineLabQuestionBank.json`) does not have `learningOutcomeId` on its questions. If a developer navigates to lesson `99` or `lab-ordinal-seq`, the field will be `undefined` on the question object — the `?? null` ensures the payload remains valid JSON with an explicit `null` rather than `undefined` (which would be stripped by `JSON.stringify`).

### 5.5 Learning Outcome ID Master Reference Table

| ObjectId | Competency Area | Description | G1 Lesson Nodes | Banks |
|---|---|---|---|---|
| `69da6ad0c06b1a0596d0aedf` | MG | Define and structure 2D shapes | Node 1 (Geometric Blooms) | shapes, shapeProperties, shapeComposing, shapeHunt |
| `69da6ad0c06b1a0596d0aee0` | NA | Count, recognize, represent whole numbers to 100 | Node 2 (Pairing Petals) | numberMatching, addition, basicAddition, composeDecompose, counting |
| `69da6ad0c06b1a0596d0aee1` | NA | Use ordinal numbers up to 10th to describe position | Node 3 (Ranking Vines) | ordinalNumbers, positionalReasoning, ordinalSequence, ordinalMatching |
| `69da6ad0c06b1a0596d0aee2` | NA | Compare and order numbers up to 20; addition with sums to 20 | Node 4 (Sorting Seeds) | compareOrder, comparingQuantities, numberLineOrdering |
| `69da6ad0c06b1a0596d0aee3` | MG | Non-standard units to compare and measure length/distance | Node 6 (Measuring Meadow) | lengthComparison, lengthMeasurement, measurementWordProblems |
| `69da6ad0c06b1a0596d0aee4` | NA | Order and decompose (tens and ones) numbers to 100 | Nodes 7+8 (Hundred Vines + Place Value Pond) | countingSequence, orderingTo100, skipCounting, placeValue, decomposition, expandedForm |
| `69da6ad0c06b1a0596d0aee5` | NA | Addition with sums up to 100 | Node 9 (Addition Grove) | basicAdditionTo100, pictorialAdditionTo100, wordProblemsAdditionTo100 |
| `69da6ad0c06b1a0596d0aee6` | DP | Represent and interpret data in a pictograph without a scale | Node 11 (Data Garden) | dataTable, pictographInterpretation, pictographRepresentation |
| `69da6ad0c06b1a0596d0aee7` | NA | Subtraction where both numbers < 100 | Nodes 12+13 (Subtraction Springs + Deep Roots) | basicSubtraction20, equivalentExpressions, missingNumber, basicSubtraction100, expandedSubtraction, wordProblems |
| `69da6ad0c06b1a0596d0aee8` | NA | Extend existing and create new repeating patterns | Node 14 (Pattern Trails) | repeatingPatterns, complexPatterns, patternCreation |
| `69da6ad0c06b1a0596d0aee9` | NA | Illustrate and compare fractions 1/2 and 1/4 | Node 16 (Fraction Flowers) | identifyingFractions, comparingFractions, countingFractions |
| `69da6ad0c06b1a0596d0aeea` | NA | Recognize and determine value of Philippine coins/bills to ₱100 | Node 17 (Peso Market — identification) | moneyIdentification, moneyValues |
| `69da6ad0c06b1a0596d0aeeb` | NA | Add money (sum ≤ ₱100) and subtract money (both < ₱100) | Node 17 (Peso Market — word problems) | moneyWordProblems |
| `69da6ad0c06b1a0596d0aeed` | MG | Time: hours, half hours, quarter hours, days, weeks, months, years | Node 18 (Garden Clock Tower) | analogTime, clockMatching, timeLogic |
| `69da6ad0c06b1a0596d0aeec` | MG | Position after half/quarter turn, clockwise or counter-clockwise | Node 19 (Calendar Clearing) | calendarSequence, rotationsTurns, usingCalendar |

### 5.6 Why Boss Nodes (5, 10, 15, 20) Are Not Listed

Boss review nodes in `lessonResolver.js` pull questions from multiple banks across different lessons — a single boss session may contain questions from 4+ different learning outcomes. This is fine: each question object already carries its own `learningOutcomeId` from its source bank. The Orchestrator reads it per-question at answer time. Boss sessions naturally emit mixed `learningOutcomeId` values in their `answers` array, which is correct — the backend will see performance broken down by each outcome that was sampled in that review.

### 5.7 Guard Conditions Unchanged

All guard conditions from the original game submission implementation remain in place. `learningOutcomeId` on answers is a data enhancement only — it does not affect whether a submission fires:

| Condition | Behavior |
|---|---|
| Journey Map play (no classroom params) | No submission — guard on `sectionId/classroomId/mongoLessonId` |
| Dev lesson (99, lab-ordinal-seq) | `learningOutcomeId: null` per answer (no field on dev questions) |
| API failure | Silent catch, local save preserved |
| Double submission (replay) | Blocked by `submittedRef` |

---

## 6. Verification Steps

1. **Q1 Lesson 1 (Shapes) via classroom "Play Lesson" button:**
   - Complete the lesson.
   - Check Metro logs for `[GameSubmission] Sending payload:`.
   - Every `learningOutcomeId` in `answers[]` should be `"69da6ad0c06b1a0596d0aedf"`.

2. **Q1 Lesson 3 (Ordinal) via classroom "Play Lesson" button:**
   - Every `learningOutcomeId` in `answers[]` should be `"69da6ad0c06b1a0596d0aee1"`.

3. **MongoDB verification:**
   - Open the `game-submissions` collection.
   - Inspect the newest document's `answers` array.
   - `learningOutcomeId` fields should be non-null ObjectId strings matching the expected outcome for the lesson played.

4. **Journey Map play (no classroom context):**
   - Play any lesson via the Journey Map (not classroom).
   - Confirm no submission fires (no `[GameSubmission]` log line appears).
   - Local save still works normally.

5. **Dev lab (lesson 99):**
   - Navigate to lesson `99` (Engine Lab).
   - If submission were to fire (it won't — no classroom params), `learningOutcomeId` would be `null` for all answers. No regression.

---

## 7. Remaining Gaps (Post-This-Change)

| Gap | Priority | Notes |
|---|---|---|
| No retry / offline queue | Low | If network fails, submission is permanently lost. Consider AsyncStorage queue for retry on next launch. |
| Non-standard `@services` alias in `app/classroom/lesson/[lessonId].jsx` line 6 | Low | Pre-existing; clean up in a separate PR |
| Boss node `answers[]` will have mixed `learningOutcomeId` values | None | This is correct behavior — the backend should handle it by grouping answers by outcome |
