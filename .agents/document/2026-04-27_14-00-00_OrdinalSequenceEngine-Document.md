# OrdinalSequenceEngine — Implementation Plan

**Date:** 2026-04-27  
**Topic:** New specialized curriculum engine for Lesson 3 (Ordinal Numbers — "The Ranking Vines")  
**Status:** Planning

---

## 1. Goal

Build a creative, specialized game engine (`OrdinalSequenceEngine`) that works with the existing `ORDINAL_SEQUENCE` question type. Validate it in complete isolation via a new `engineLabQuestionBank.json` before any integration with the real Lesson 3 SuperLesson.

---

## 2. Context

Lesson 3 ("The Ranking Vines") has an existing `ordinalSequenceQuestionBank.json` with `type: "ORDINAL_SEQUENCE"`, explicitly flagged:

> "TEST BANK — engine validation only. Not yet merged into the Lesson 3 SuperLesson."

No engine for this type exists yet. The Orchestrator has no `ordinal_sequence` case. This plan creates the engine, a standalone lab question bank, and wires everything together without disturbing any existing curriculum.

---

## 3. Engine Concept: "Stamp the Line"

A row of fruit emojis is displayed. The player taps each fruit **left-to-right in sequence** to stamp an ordinal badge (1st, 2nd, 3rd…) onto it. The engine is self-validating by index order — no explicit `answer` field is needed in the question bank.

### Interaction Design

| Event | Animation |
|---|---|
| **Correct tap** | `scale: 1.0 → 1.3 → 1.0` (spring) + ordinal badge drops in (`translateY: -8 → 0`, `opacity: 0 → 1`) |
| **Wrong tap (out of order)** | Red border flash (`opacity` pulse: `0 → 1 → 0`) + downward bounce (`translateY: 0 → 4 → 0`). **No horizontal shake.** |
| **All stamped (completion)** | Staggered wave: each fruit scales `1.0 → 1.15 → 1.0` with `delay(i * 80ms)`, then `onResult(true, [...])` is called |

### Haptics
- Correct tap → `Haptics.impactAsync(Light)`
- Wrong tap → `Haptics.notificationAsync(Warning)`

---

## 4. Header Responsibility

The Orchestrator already renders the question prompt (`data.question`) for all engine types not in its exclusion list. `ordinal_sequence` is **not** added to that exclusion list — the orchestrator naturally renders the question text.

The engine itself renders **no duplicate header**. The only engine-internal text is a live progress cue: `"Tap: 3rd next →"` — this is a UI state indicator, not a question header.

```
[Orchestrator renders]  "Tap the fruits from 1st to 3rd!"
[Engine renders]        🥭  🍌  🌽   ← fruit row
                        Tap: 2nd next →  ← progress cue (engine-internal)
```

---

## 5. Files to Create

### `content/game-data/quarter-1/grade1-q1-lesson3-position/engineLabQuestionBank.json`

Isolated test bank. 4 questions, counts 3–6, easy → medium difficulty.

```json
{
  "meta": {
    "topic": "Ordinal Sequence Engine Lab",
    "totalQuestions": 4,
    "engines": { "ORDINAL_SEQUENCE": "Engine lab — isolated test" },
    "note": "ENGINE LAB — not merged into any SuperLesson."
  },
  "questions": [
    {
      "id": "lab_seq_001", "type": "ORDINAL_SEQUENCE", "difficulty": "Easy",
      "question": "Tap each fruit in order — 1st to 3rd!",
      "fruits": ["🥭", "🍌", "🌽"], "count": 3, "assetType": "NONE"
    },
    {
      "id": "lab_seq_002", "type": "ORDINAL_SEQUENCE", "difficulty": "Easy",
      "question": "Tap each fruit in order — 1st to 4th!",
      "fruits": ["🍊", "🍓", "🍋", "🍇"], "count": 4, "assetType": "NONE"
    },
    {
      "id": "lab_seq_003", "type": "ORDINAL_SEQUENCE", "difficulty": "Medium",
      "question": "Label each fruit with its position — 1st to 5th!",
      "fruits": ["🥭", "🍌", "🌽", "🍊", "🍓"], "count": 5, "assetType": "NONE"
    },
    {
      "id": "lab_seq_004", "type": "ORDINAL_SEQUENCE", "difficulty": "Medium",
      "question": "Tap the fruits from 1st to 6th, in order!",
      "fruits": ["🍋", "🍇", "🍉", "🍑", "🥝", "🍒"], "count": 6, "assetType": "NONE"
    }
  ]
}
```

### `src/Components/Game/Curriculum/Engines/OrdinalSequenceEngine.jsx`

**Props:** `{ data, onResult }`  
**Reads from `data`:** `fruits` (emoji array), `count` (integer)

**Internal state:**
- `nextIndex` — which position must be tapped next (0-based)
- `stamps` — `boolean[]` — which fruits have been correctly stamped
- `allDone` — boolean, triggers completion wave + `onResult` call

**Ordinal labels:** `['1st','2nd','3rd','4th','5th','6th','7th','8th','9th','10th'][i]`

**Layout structure:**
```
<ScrollView>
  <View> ← wrapping fruit row (flexWrap: 'wrap', justifyContent: 'center')
    {fruits.map(fruit => (
      <Pressable> ← bulky card (borderWidth: 2, borderBottomWidth: 6, borderRadius: 16)
        <Text> ← emoji
        {stamped && <BadgeOverlay label="2nd" />} ← ordinal badge pill
      </Pressable>
    ))}
  </View>
  <Text> ← progress cue: "Tap: 3rd next →"
  {allDone && <DoneButton onPress={() => onResult(true, [])} />}
</ScrollView>
```

**Animation (react-native-reanimated):**
- Per-fruit `stampScale` shared value → `withSpring` on correct tap
- Per-fruit `badgeOpacity` + `badgeTranslateY` shared values → `withTiming` on stamp
- Per-fruit `wrongFlash` shared value → `withSequence` on wrong tap (opacity pulse)
- Per-fruit `wrongBounce` shared value → `withSequence` on wrong tap (translateY 0→4→0)
- Completion wave → staggered `withDelay(i * 80, withSpring(1.15))` per fruit

**Styling rules:**
- No shadows (`shadowColor`, `elevation` prohibited)
- All styles in `StyleSheet.create()` at bottom of file
- Colors from `@/constants/colors` tokens only
- Fonts: `Lexend-Bold` for ordinal badge labels, `PlusJakartaSans-Medium` for progress cue
- Fruit card follows MathSync Button spec: `borderBottomWidth: 6` idle → `borderBottomWidth: 2` pressed (sinking effect)

---

## 6. Files to Modify

### `src/Components/Game/Curriculum/lessonResolver.js`

Add import and a new isolated test lesson at the end of G1 lessons:

```js
import G1_OrdinalSeqLab from '@content/game-data/quarter-1/grade1-q1-lesson3-position/engineLabQuestionBank.json';

// New entry in G1 lessons array:
{
  id: 'lab-ordinal-seq',
  meta: {
    topic: 'Ordinal Sequence Engine Lab',
    curriculum: 'ENGINE LAB — Isolated',
    competency: 'NA.1.9',
    description: 'Isolated test session for OrdinalSequenceEngine validation',
  },
  questions: getPlayableQuestions([G1_OrdinalSeqLab]),
}
```

> The existing Lesson 3 SuperLesson entry is **not touched**.

### `src/Components/Game/Curriculum/CurriculumOrchestrator.jsx`

Add import and one new `case` in the engine switch:

```jsx
import OrdinalSequenceEngine from '@/Components/Game/Curriculum/Engines/OrdinalSequenceEngine';

// In the engine routing switch:
case 'ordinal_sequence':
  return (
    <OrdinalSequenceEngine
      key={currentQuestionIndex}
      data={currentQuestion}
      onResult={handleResult}
    />
  );
```

No changes to the orchestrator's header exclusion list (`visual_picker`, `money_engine`) — the orchestrator will render the question text for `ordinal_sequence` as-is.

---

## 7. Invariants Preserved

- `ordinalMatchingQuestionBank.json` — untouched
- `ordinalNumbersQuestionBank.json` — untouched  
- `positionalReasoningQuestionBank.json` — untouched
- `ordinalSequenceQuestionBank.json` — untouched (remains test-only, not merged)
- Lesson 3 SuperLesson in `lessonResolver.js` — untouched
- Engine is dumb: `{ data, onResult }` only, no session state, no navigation
- `key={currentQuestionIndex}` enforced by the orchestrator (no change needed)
- No TypeScript, no shadows, no hardcoded hex, no Tailwind

---

## 8. Testing Path

1. Navigate to the game route with `lessonId: 'lab-ordinal-seq'`
2. All 4 lab questions load (shuffled)
3. Manually test: correct sequential taps → badges stamp → completion fires `onResult(true, [])`
4. Manually test: out-of-order taps → red flash + downward bounce, no shake
5. Once validated → `ordinalSequenceQuestionBank.json` can be merged into the real Lesson 3 SuperLesson in a future step
