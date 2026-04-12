/**
 * Local Lesson Resolver
 * Bridges the gap between the route and the nested JSON question banks.
 *
 * Multi-engine lessons are supported. Questions are merged into a flat array
 * and shuffled with Fisher-Yates. The CurriculumOrchestrator reads the `type`
 * from each individual question to determine which engine to render, enabling
 * seamless per-question engine swaps mid-session.
 *
 * NOTE: Banks with type "N/A" are deferred — their engines are not yet implemented.
 * They are included in imports for future readiness but excluded from the
 * active Super Lesson delivery until an engine is assigned.
 */

// ─── Quarter 1, Lesson 1: Shapes (Geometric Blooms) ─────────────────
import G1_Shapes from '@content/game-data/quarter-1/grade1-q1-lesson1-shapes/shapesQuestionBank.json';
import G1_ShapeProps from '@content/game-data/quarter-1/grade1-q1-lesson1-shapes/shapePropertiesQuestionBank.json';
import G1_ShapeCompose from '@content/game-data/quarter-1/grade1-q1-lesson1-shapes/shapeComposingQuestionBank.json';

// ─── Quarter 1, Lesson 2: Numbers (Pairing Petals) ──────────────────
import G1_NumberMatch from '@content/game-data/quarter-1/grade1-q1-lesson2-numbers/numberMatchingQuestionBank.json';
import G1_Addition from '@content/game-data/quarter-1/grade1-q1-lesson2-numbers/additionQuestionBank.json';
import G1_BasicAddition from '@content/game-data/quarter-1/grade1-q1-lesson2-numbers/basicAdditionQuestionBank.json';
import G1_ComposeDecompose from '@content/game-data/quarter-1/grade1-q1-lesson2-numbers/composeDecomposeQuestionBank.json';
import G1_Counting from '@content/game-data/quarter-1/grade1-q1-lesson2-numbers/countingQuestionBank.json';
// TODO: Addition Properties & Word Problems — type "N/A", deferred
// import G1_AdditionProps from '@content/game-data/quarter-1/grade1-q1-lesson2-numbers/additionPropertiesQuestionBank.json';
// import G1_WordProblems from '@content/game-data/quarter-1/grade1-q1-lesson2-numbers/wordProblemsAdditionQuestionBank.json';

// ─── Quarter 1, Lesson 3: Ordinal Numbers (The Ranking Vines) ───────
import G1_Ordinal from '@content/game-data/quarter-1/grade1-q1-lesson3-position/ordinalNumbersQuestionBank.json';
import G1_Positional from '@content/game-data/quarter-1/grade1-q1-lesson3-position/positionalReasoningQuestionBank.json';
import G1_OrdinalSequence from '@content/game-data/quarter-1/grade1-q1-lesson3-position/ordinalSequenceQuestionBank.json';

// ─── Quarter 1, Lesson 4: Compare & Order (Sorting Seeds) ───────────
import G1_CompareOrder from '@content/game-data/quarter-1/grade1-q1-lesson4-compare-and-order/compareOrderQuestionBank.json';
import G1_ComparingQty from '@content/game-data/quarter-1/grade1-q1-lesson4-compare-and-order/comparingQuantitiesQuestionBank.json';
import G1_NumberLine from '@content/game-data/quarter-1/grade1-q1-lesson4-compare-and-order/numberLineOrderingQuestionBank.json';

// ─── Fisher-Yates Shuffle ────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Helper: Filter out questions with type "N/A" (no engine assigned yet).
 * These will be silently excluded until their engines are built.
 */
function getPlayableQuestions(banks) {
  const all = banks.flatMap(bank => bank.questions || []);
  const playable = all.filter(q => q.type && q.type !== 'N/A');

  // If ALL questions are N/A, include them anyway so the lesson isn't empty.
  // The Orchestrator will show an "Engine not found" message as a fallback.
  if (playable.length === 0) return shuffle(all);

  return shuffle(playable);
}

// ─── Bundled Lesson Data ─────────────────────────────────────────────
const BUNDLED_DATA = {
  G1: {
    lessons: [
      // --- Node 1: "Geometric Blooms" — 2D Shapes Super Lesson ---
      // Banks: Shapes (N/A), Shape Properties (N/A), Shape Composing (N/A)
      // NOTE: All three banks currently have type "N/A". Once the Picker or
      //       DragDrop engines are assigned to these questions, they will
      //       automatically become playable. For now the lesson will load
      //       with N/A-type questions as a preview.
      {
        id: '1',
        meta: {
          topic: 'Geometric Blooms',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'MG.1.1–1.3',
          description: '2D Shapes — Circles, squares, triangles & more',
        },
        questions: getPlayableQuestions([G1_Shapes, G1_ShapeProps, G1_ShapeCompose]),
      },

      // --- Node 2: "Pairing Petals" — Numbers Super Lesson ---
      // Banks: NumberMatching (MATCHER), Addition (NUMPAD), BasicAddition (NUMPAD),
      //        ComposeDecompose (COMPOSER), Counting (N/A — deferred)
      // CPA Progression: Concrete → Pictorial → Abstract
      {
        id: '2',
        meta: {
          topic: 'Pairing Petals',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'NA.1.4–1.11',
          description: 'Numbers — Read, write & add numbers up to 20',
        },
        questions: getPlayableQuestions([
          G1_NumberMatch,
          G1_Addition,
          G1_BasicAddition,
          G1_ComposeDecompose,
          G1_Counting,
        ]),
      },

      // --- Node 3: "The Ranking Vines" — Ordinal Numbers Super Lesson ---
      // Banks: Ordinal (N/A), Positional Reasoning (N/A), OrdinalSequence (ORDINAL_SEQUENCE — test bank)
      // NOTE: The first two banks are still "N/A" (deferred). OrdinalSequence is a
      //       TEST bank wired here to validate the OrdinalSequenceEngine end-to-end.
      {
        id: '3',
        meta: {
          topic: 'The Ranking Vines',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'NA.1.9',
          description: 'Ordinal Numbers — Describe position (1st–10th)',
        },
        questions: getPlayableQuestions([G1_Ordinal, G1_Positional, G1_OrdinalSequence]),
      },

      // --- Node 4: "Sorting Seeds" — Compare & Order Super Lesson ---
      // Banks: CompareOrder (N/A + NUMPAD), Comparing Quantities (N/A),
      //        Number Line Ordering (N/A)
      // NOTE: Most questions are type "N/A". Deferred until engines assigned.
      {
        id: '4',
        meta: {
          topic: 'Sorting Seeds',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'NA.1.7–1.8',
          description: 'Compare & Order — Smallest to largest',
        },
        questions: getPlayableQuestions([G1_CompareOrder, G1_ComparingQty, G1_NumberLine]),
      },
    ],
  },
};

// ─── Public API ──────────────────────────────────────────────────────
export const getBundledLesson = (gradeKey, lessonId) => {
  const gradeData = BUNDLED_DATA[gradeKey];
  if (!gradeData) return null;

  const lesson = gradeData.lessons.find(l => String(l.id) === String(lessonId));
  return lesson || null;
};

export default getBundledLesson;
