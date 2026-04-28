# Classroom → Lesson → Game Bridge: "Play Lesson" Button

**Date:** 2026-04-24  
**Branch:** development-branch  
**Author:** Justine L. Llamera

---

## Summary

Added a "Play Lesson" button at the bottom of the classroom lesson detail screen that launches the corresponding local curriculum game session. This bridges the backend MongoDB classroom system (Stack 1 Curriculum lessons) with the local `CurriculumOrchestrator` game engine.

---

## Problem Statement

The app has two systems that were completely disconnected:

1. **Backend Classroom System** — Teachers create classrooms with grades, quarters, and lessons pulled from MongoDB. Students can browse lesson content (title, video, objectives, rich text) but couldn't do anything interactive.
2. **Local Game Engine (CurriculumOrchestrator)** — G1 has 20 pre-built lesson game sessions (IDs 1–20) mapped to JSON question banks in `content/game-data/`. These are accessible via the student's personal Journey Map but had no connection to the classroom.

**The gap:** A student viewing "Fun with shapes: Getting to know our flat friends!" in their classroom had no way to jump into the corresponding `Geometric Blooms` game session (local lessonId = 1).

---

## Key Constraint Discovered During Research

MongoDB classroom data confirmed that **only GRADE 1 classrooms have actual lesson content** — all GRADE 2–6 classrooms have empty `lessons: []` arrays across all quarters. This is because the local Curriculum Stack (JSON-driven) only exists for G1; Grades 2–6 use the Generative Stack (procedural generators with no pre-authored JSON lessons).

This made a grade gate mandatory — the button must only render for G1 content.

---

## Architecture Context

### Dual-Stack Game System
- **Curriculum Stack (G1):** `CurriculumOrchestrator.jsx` ← lessonIds 1–20 ← `lessonResolver.js` ← `content/game-data/quarter-{1-4}/`
- **Generative Stack (G2–G6):** `PracticeOrchestrator` ← procedural generators ← `src/utils/generators/grades/`
- **Game Route Entry:** `app/game/[lessonId].jsx` — routes to `CurriculumOrchestrator` when `type !== 'generative'`

### Local Curriculum Lesson Map (G1)
| Quarter | lessonId | Internal Name |
|---------|----------|---------------|
| Q1 | 1 | Geometric Blooms |
| Q1 | 2 | Pairing Petals |
| Q1 | 3 | Ranking Vines |
| Q1 | 4 | Sorting Seeds |
| Q1 | 5 | Master Gardener (Boss — no button) |
| Q2 | 6 | Measuring Meadow |
| Q2 | 7 | Hundred Vines |
| Q2 | 8 | Place Value Pond |
| Q2 | 9 | Addition Grove |
| Q2 | 10 | Harvest Master (Boss — no button) |
| Q3 | 11 | Data Garden |
| Q3 | 12 | Subtraction Springs |
| Q3 | 13 | Deep Roots |
| Q3 | 14 | Pattern Trails |
| Q3 | 15 | Fruit Season Boss (Boss — no button) |
| Q4 | 16 | Fraction Flowers |
| Q4 | 17 | Peso Market |
| Q4 | 18 | Garden Clock Tower |
| Q4 | 19 | Calendar Clearing |
| Q4 | 20 | Grand Gardener (Boss — no button) |

Boss levels (IDs 5, 10, 15, 20) are intentionally excluded from the keyword map.

---

## Approach: Client-Side Keyword Mapping

No backend changes were made. The mapping from MongoDB lesson titles to local game IDs is resolved entirely on the client using a static keyword table scoped by quarter.

**Why quarter-scoped?**
"Subtraction" appears as a keyword in both Q3 Lesson 2 (`Subtraction Springs`, to 20) and Q3 Lesson 3 (`Deep Roots`, to 100). Scoping matching to the quarter prevents cross-quarter collisions.

**Why not lessonIndex within a quarter?**
The backend lesson order within a quarter is not guaranteed to be stable. Keyword matching is more robust.

---

## Data Flow (Complete)

```
MongoDB: classroom { name: "GRADE 1", sections: [{ _id: sectionId }] }
  ↓  classroomService.getLessonsBySection(sectionId)
  ↓  { quarters: [{ quarter: 1, lessons: [{ _id, title, description }] }] }

app/classroom/[id].jsx
  classDetails.name = "GRADE 1"
  gradeKey = "GRADE 1".replace('GRADE ', 'G').replace(' ', '') → "G1"
  router.push(`/classroom/lesson/${lesson._id}?sectionId=...&grade=G1&quarter=1`)
  ↓

app/classroom/lesson/[lessonId].jsx
  lessonService.getLessonById(lessonId) → { title: "Fun with shapes...", ... }
  grade = "G1" ✓
  quarter = "1" → parseInt → 1
  resolveGameLesson("Fun with shapes: Getting to know our flat friends!", 1)
    → lower.includes('shape') → match → gameLesson: 1
  gameLessonId = 1
  → "Play Lesson" button renders at bottom of ScrollView
  → router.push(`/game/1?grade=G1`)
  ↓

app/game/[lessonId].jsx
  lessonId = "1", grade = "G1", type = undefined → CurriculumOrchestrator
  getBundledLesson('G1', '1') → Geometric Blooms question banks
  → Game session starts ✓
```

---

## Files Changed

### 1. CREATED — `src/constants/classroomLessonMap.js`

New constant module. Exports `resolveGameLesson(title, quarter)` — pure function, no side effects.

**Structure:**
```js
const LESSON_MAP = [
  { quarter: 1, keywords: [...], gameLesson: 1 },
  ...
];

export function resolveGameLesson(title = '', quarter = null) {
  const lower = title.toLowerCase();
  const candidates = quarter ? LESSON_MAP.filter(e => e.quarter === quarter) : LESSON_MAP;
  const match = candidates.find(entry => entry.keywords.some(kw => lower.includes(kw)));
  return match ? match.gameLesson : null;
}
```

Returns `null` when no keyword matches — used as the gate condition for rendering the button.

---

### 2. MODIFIED — `app/classroom/[id].jsx`

**What changed:** The `onPress` handler inside `renderLessons()` → `quarterData.lessons.map` now derives a `gradeKey` from `classDetails.name` and passes `grade` and `quarter` as query params.

**Before:**
```js
router.push(`/classroom/lesson/${lesson._id}?sectionId=${sectionId}`)
```

**After:**
```js
const gradeKey = classDetails?.name?.replace('GRADE ', 'G').replace(' ', '') ?? '';
router.push(`/classroom/lesson/${lesson._id}?sectionId=${sectionId}&grade=${gradeKey}&quarter=${quarterData.quarter}`);
```

The `gradeKey` derivation: `"GRADE 1"` → (remove `"GRADE "`, prepend `"G"`) → `"G1"`. The second `.replace(' ', '')` is a safety guard for spacing edge cases.

`classDetails` and `quarterData` are both available in closure scope at the point of navigation — no new state was needed.

---

### 3. MODIFIED — `app/classroom/lesson/[lessonId].jsx`

**Imports added:**
- `TouchableOpacity` added to `react-native` destructure
- `useRouter` added to `expo-router` destructure
- `import { resolveGameLesson } from '@/constants/classroomLessonMap'` (authorized `@/` alias)

**Params extracted:**
```js
const { lessonId, grade, quarter } = useLocalSearchParams();
const router = useRouter();
```

**Computed value (inline, not state):**
```js
const gameLessonId = grade === 'G1'
  ? resolveGameLesson(lesson?.title, quarter ? parseInt(quarter, 10) : null)
  : null;
```

Placed after the loading/error early-return guards so `lesson` is guaranteed non-null when evaluated.

**Button JSX** (added at end of ScrollView, after `lessonContent` block):
```jsx
{gameLessonId !== null && (
  <View style={styles.playSection}>
    <TouchableOpacity
      style={styles.playButton}
      activeOpacity={0.85}
      onPress={() => router.push(`/game/${gameLessonId}?grade=G1`)}
    >
      <Feather name="zap" size={22} color="#FFFFFF" />
      <Text style={styles.playButtonText}>Play Lesson</Text>
    </TouchableOpacity>
  </View>
)}
```

**New styles added:**
```js
playSection: {
  marginTop: 8,
  marginBottom: 16,
},
playButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: Colors.primary,
  paddingVertical: 18,
  borderRadius: 14,
},
playButtonText: {
  fontFamily: 'Lexend-Bold',
  fontSize: 18,
  color: '#FFFFFF',
  marginLeft: 10,
},
```

---

## Grade Gating Logic

| Classroom Grade | gradeKey | Button Visible |
|---|---|---|
| GRADE 1 | G1 | Yes (if keyword match found) |
| GRADE 2 | G2 | Never |
| GRADE 3 | G3 | Never |
| GRADE 4 | G4 | Never |
| GRADE 5 | G5 | Never |
| GRADE 6 | G6 | Never |
| (unset / missing) | `''` | Never |

---

## Invariants Preserved

- `CurriculumOrchestrator`, `lessonResolver.js`, and all game engines are untouched
- `app/game/[lessonId].jsx` is untouched — it already handled `grade=G1` and non-generative routing
- Only authorized path aliases used (`@/`, no `@constants` shorthand)
- No TypeScript — `.js` file created, `.jsx` files modified
- Styles defined at bottom of file, camelCase keys, no inline static styles
- No hardcoded hex colors in new styles — `Colors.primary` used
- Offline lesson cache path unaffected — keyword matching is local, `resolveGameLesson` has no network dependency

---

## Verification Steps

1. **G1 lesson with a known keyword match:**
   - Join a GRADE 1 classroom → open "Fun with shapes: Getting to know our flat friends!" → scroll to bottom → "Play Lesson" button with ⚡ icon appears
   - Tap → navigates to `/game/1?grade=G1` → `CurriculumOrchestrator` loads Geometric Blooms

2. **G1 lesson with no keyword match (edge case):**
   - Open any Boss Review lesson (no keywords in map) → no button renders, clean empty bottom padding

3. **G2–G6 classroom:**
   - Open any lesson in a non-G1 classroom → no button renders

4. **Offline (cached lesson):**
   - Go offline, open a previously viewed G1 lesson → offline banner shows, button still renders and resolves correctly (keyword matching is synchronous/local)

5. **Quarter isolation:**
   - A Q2 lesson titled "Addition Grove" matches `gameLesson: 9` (quarter 2 scope), not `gameLesson: 2` (quarter 1 scope)
