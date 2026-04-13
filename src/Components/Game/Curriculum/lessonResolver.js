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
import G1_ShapeHunt from '@content/game-data/quarter-1/grade1-q1-lesson1-shapes/shapeHuntQuestionBank.json';

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
import G1_SortTest from '@content/game-data/quarter-1/grade1-q1-lesson4-compare-and-order/sortEngineTestBank.json';

// ─── Quarter 2, Lesson 1: Measurement (Measuring Meadow) ─────────────────────
import G1_LengthComparison from '@content/game-data/quarter-2/grade1-q2-lesson1-measurement/lengthComparisonQuestionBank.json';
import G1_LengthMeasurement from '@content/game-data/quarter-2/grade1-q2-lesson1-measurement/lengthMeasurementQuestionBank.json';
import G1_MeasurementWordProblems from '@content/game-data/quarter-2/grade1-q2-lesson1-measurement/measurementWordProblemsQuestionBank.json';

// ─── Quarter 2, Lesson 2: Numbers to 100 (Hundred Vines) ─────────────────────
import G1_CountingSequence from '@content/game-data/quarter-2/grade1-q2-lesson2-numbers-to-100/countingSequenceQuestionBank.json';
import G1_OrderingTo100 from '@content/game-data/quarter-2/grade1-q2-lesson2-numbers-to-100/orderingTo100QuestionBank.json';
import G1_SkipCounting from '@content/game-data/quarter-2/grade1-q2-lesson2-numbers-to-100/skipCountingQuestionBank.json';

// ─── Quarter 2, Lesson 3: Place Value (Place Value Pond) ─────────────────────
import G1_PlaceValue from '@content/game-data/quarter-2/grade1-q2-lesson3-place-value/placeValueQuestionBank.json';
import G1_Decomposition from '@content/game-data/quarter-2/grade1-q2-lesson3-place-value/decompositionTo100QuestionBank.json';
import G1_ExpandedForm from '@content/game-data/quarter-2/grade1-q2-lesson3-place-value/expandedFormQuestionBank.json';

// ─── Quarter 2, Lesson 4: Addition to 100 (Addition Grove) ───────────────────
import G1_AdditionTo100 from '@content/game-data/quarter-2/grade1-q2-lesson4-addition-to-100/basicAdditionTo100QuestionBank.json';
import G1_PictorialAddition from '@content/game-data/quarter-2/grade1-q2-lesson4-addition-to-100/pictorialAdditionTo100QuestionBank.json';
import G1_AdditionWordProblems100 from '@content/game-data/quarter-2/grade1-q2-lesson4-addition-to-100/wordProblemsAdditionTo100QuestionBank.json';

// ─── Quarter 3, Lesson 1: Data (Data Garden) ─────────────────────────────────
import G1_DataTable from '@content/game-data/quarter-3/grade1-q3-lesson1-data/dataTableQuestionBank.json';
import G1_PictographInterpret from '@content/game-data/quarter-3/grade1-q3-lesson1-data/pictographInterpretationQuestionBank.json';
import G1_PictographRepresent from '@content/game-data/quarter-3/grade1-q3-lesson1-data/pictographRepresentationQuestionBank.json';

// ─── Quarter 3, Lesson 2: Subtraction to 20 (Subtraction Springs) ────────────
import G1_BasicSubtraction20 from '@content/game-data/quarter-3/grade1-q3-lesson2-subtraction-to-20/basicSubtractionTo20QuestionBank.json';
import G1_EquivalentExpressions from '@content/game-data/quarter-3/grade1-q3-lesson2-subtraction-to-20/equivalentExpressionsQuestionBank.json';
import G1_MissingNumber from '@content/game-data/quarter-3/grade1-q3-lesson2-subtraction-to-20/missingNumberSubtractionQuestionBank.json';

// ─── Quarter 3, Lesson 3: Subtraction to 100 (The Deep Roots) ────────────────
import G1_BasicSubtraction100 from '@content/game-data/quarter-3/grade1-q3-lesson3-subtraction-to-100/basicSubtractionTo100QuestionBank.json';
import G1_ExpandedSubtraction from '@content/game-data/quarter-3/grade1-q3-lesson3-subtraction-to-100/expandedSubtractionQuestionBank.json';
import G1_SubtractionWordProblems from '@content/game-data/quarter-3/grade1-q3-lesson3-subtraction-to-100/wordProblemsSubtractionTo100QuestionBank.json';

// ─── Quarter 3, Lesson 4: Patterns (Pattern Trails) ──────────────────────────
import G1_RepeatingPatterns from '@content/game-data/quarter-3/grade1-q3-lesson4-patterns/repeatingPatternsQuestionBank.json';
import G1_ComplexPatterns from '@content/game-data/quarter-3/grade1-q3-lesson4-patterns/complexPatternsQuestionBank.json';
import G1_PatternCreation from '@content/game-data/quarter-3/grade1-q3-lesson4-patterns/patternCreationQuestionBank.json';

// ─── Quarter 4, Lesson 1: Fractions (Fraction Flowers) ───────────────────────
import G1_IdentifyingFractions from '@content/game-data/quarter-4/grade1-q4-lesson1-fractions/identifyingFractionsQuestionBank.json';
import G1_ComparingFractions from '@content/game-data/quarter-4/grade1-q4-lesson1-fractions/comparingFractionsQuestionBank.json';
import G1_CountingFractions from '@content/game-data/quarter-4/grade1-q4-lesson1-fractions/countingFractionsQuestionBank.json';

// ─── Quarter 4, Lesson 2: Money (Peso Market) ────────────────────────────────
import G1_MoneyId from '@content/game-data/quarter-4/grade1-q4-lesson2-money/moneyIdentificationQuestionBank.json';
import G1_MoneyValues from '@content/game-data/quarter-4/grade1-q4-lesson2-money/moneyValuesQuestionBank.json';
import G1_MoneyWordProblems from '@content/game-data/quarter-4/grade1-q4-lesson2-money/moneyWordProblemsQuestionBank.json';

// ─── Quarter 4, Lesson 3: Time & Clocks (Garden Clock Tower) ─────────────────
import G1_AnalogTime from '@content/game-data/quarter-4/grade1-q4-lesson3-time-clocks/analogTimeQuestionBank.json';
import G1_ClockMatching from '@content/game-data/quarter-4/grade1-q4-lesson3-time-clocks/clockMatchingQuestionBank.json';
import G1_TimeLogic from '@content/game-data/quarter-4/grade1-q4-lesson3-time-clocks/timeLogicQuestionBank.json';

// ─── Quarter 4, Lesson 4: Calendar & Turns (Calendar Clearing) ───────────────
import G1_CalendarSequence from '@content/game-data/quarter-4/grade1-q4-lesson4-calendar-turns/calendarSequenceQuestionBank.json';
import G1_RotationsTurns from '@content/game-data/quarter-4/grade1-q4-lesson4-calendar-turns/rotationsTurnsQuestionBank.json';
import G1_UsingCalendar from '@content/game-data/quarter-4/grade1-q4-lesson4-calendar-turns/usingCalendarQuestionBank.json';

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
      // Banks: Shapes (SHAPE_HUNT), Shape Properties (MATCHER/NUMPAD), Shape Composing (DRAGDROP/NUMPAD), ShapeHunt (SHAPE_HUNT)
      // All banks are now playable with assigned engine types.
      {
        id: '1',
        meta: {
          topic: 'Geometric Blooms',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'MG.1.1–1.3',
          description: '2D Shapes — Circles, squares, triangles & more',
        },
        questions: getPlayableQuestions([G1_Shapes, G1_ShapeProps, G1_ShapeCompose, G1_ShapeHunt]),
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
      // Banks: CompareOrder (SORT/NUMPAD), Comparing Quantities (SORT/NUMPAD),
      //        Number Line Ordering (SORT/NUMPAD), Sort Test
      {
        id: '4',
        meta: {
          topic: 'Sorting Seeds',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'NA.1.7–1.8',
          description: 'Compare & Order — Smallest to largest',
        },
        questions: getPlayableQuestions([G1_CompareOrder, G1_ComparingQty, G1_NumberLine, G1_SortTest]),
      },

      // --- Node 5: "The Master Gardener" — Q1 Boss Review ---
      // Pulls a cross-section from all Q1 lesson banks as a cumulative review.
      {
        id: '5',
        meta: {
          topic: 'The Master Gardener',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'MG.1.1–1.3, NA.1.4–1.11',
          description: 'Quarter 1 Boss — Final review of all Q1 topics',
        },
        questions: getPlayableQuestions([
          G1_ShapeHunt, G1_NumberMatch, G1_OrdinalSequence, G1_CompareOrder, G1_SortTest,
        ]),
      },

      // ─── Quarter 2 ──────────────────────────────────────────────────

      // --- Node 6: "Measuring Meadow" — Measurement Super Lesson ---
      {
        id: '6',
        meta: {
          topic: 'Measuring Meadow',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'ME.1.1',
          description: 'Measurement — Compare lengths using non-standard units',
        },
        questions: getPlayableQuestions([G1_LengthComparison, G1_LengthMeasurement, G1_MeasurementWordProblems]),
      },

      // --- Node 7: "Hundred Vines" — Numbers to 100 Super Lesson ---
      {
        id: '7',
        meta: {
          topic: 'Hundred Vines',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'NA.1.12–1.15',
          description: 'Numbers to 100 — Count, order & skip-count to 100',
        },
        questions: getPlayableQuestions([G1_CountingSequence, G1_OrderingTo100, G1_SkipCounting]),
      },

      // --- Node 8: "Place Value Pond" — Place Value Super Lesson ---
      {
        id: '8',
        meta: {
          topic: 'Place Value Pond',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'NA.1.16–1.18',
          description: 'Place Value — Tens and ones up to 100',
        },
        questions: getPlayableQuestions([G1_PlaceValue, G1_Decomposition, G1_ExpandedForm]),
      },

      // --- Node 9: "Addition Grove" — Addition to 100 Super Lesson ---
      {
        id: '9',
        meta: {
          topic: 'Addition Grove',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'NA.1.19–1.21',
          description: 'Addition to 100 — Add two-digit numbers',
        },
        questions: getPlayableQuestions([G1_AdditionTo100, G1_PictorialAddition, G1_AdditionWordProblems100]),
      },

      // --- Node 10: "The Harvest Master" — Q2 Boss Review ---
      {
        id: '10',
        meta: {
          topic: 'The Harvest Master',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'ME.1.1, NA.1.12–1.21',
          description: 'Quarter 2 Boss — Final review of all Q2 topics',
        },
        questions: getPlayableQuestions([
          G1_LengthComparison, G1_SkipCounting, G1_PlaceValue, G1_AdditionTo100,
        ]),
      },

      // ─── Quarter 3 ──────────────────────────────────────────────────

      // --- Node 11: "Data Garden" — Data Super Lesson ---
      {
        id: '11',
        meta: {
          topic: 'Data Garden',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'SP.1.1',
          description: 'Data — Read & create pictographs and data tables',
        },
        questions: getPlayableQuestions([G1_DataTable, G1_PictographInterpret, G1_PictographRepresent]),
      },

      // --- Node 12: "Subtraction Springs" — Subtraction to 20 Super Lesson ---
      {
        id: '12',
        meta: {
          topic: 'Subtraction Springs',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'NA.1.22–1.24',
          description: 'Subtraction to 20 — Take away and find missing numbers',
        },
        questions: getPlayableQuestions([G1_BasicSubtraction20, G1_EquivalentExpressions, G1_MissingNumber]),
      },

      // --- Node 13: "The Deep Roots" — Subtraction to 100 Super Lesson ---
      {
        id: '13',
        meta: {
          topic: 'The Deep Roots',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'NA.1.25–1.27',
          description: 'Subtraction to 100 — Subtract two-digit numbers',
        },
        questions: getPlayableQuestions([G1_BasicSubtraction100, G1_ExpandedSubtraction, G1_SubtractionWordProblems]),
      },

      // --- Node 14: "Pattern Trails" — Patterns Super Lesson ---
      {
        id: '14',
        meta: {
          topic: 'Pattern Trails',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'AL.1.1',
          description: 'Patterns — Identify, extend & create repeating patterns',
        },
        questions: getPlayableQuestions([G1_RepeatingPatterns, G1_ComplexPatterns, G1_PatternCreation]),
      },

      // --- Node 15: "Fruit Season Boss" — Q3 Boss Review ---
      {
        id: '15',
        meta: {
          topic: 'Fruit Season Boss',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'SP.1.1, NA.1.22–1.27, AL.1.1',
          description: 'Quarter 3 Boss — Final review of all Q3 topics',
        },
        questions: getPlayableQuestions([
          G1_PictographInterpret, G1_BasicSubtraction20, G1_BasicSubtraction100, G1_ComplexPatterns,
        ]),
      },

      // ─── Quarter 4 ──────────────────────────────────────────────────

      // --- Node 16: "Fraction Flowers" — Fractions Super Lesson ---
      {
        id: '16',
        meta: {
          topic: 'Fraction Flowers',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'NS.1.1',
          description: 'Fractions — Identify halves, thirds & fourths',
        },
        questions: getPlayableQuestions([G1_IdentifyingFractions, G1_ComparingFractions, G1_CountingFractions]),
      },

      // --- Node 17: "Peso Market" — Money Super Lesson ---
      {
        id: '17',
        meta: {
          topic: 'Peso Market',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'ME.1.2',
          description: 'Money — Identify & count Philippine peso coins and bills',
        },
        questions: getPlayableQuestions([G1_MoneyId, G1_MoneyValues, G1_MoneyWordProblems]),
      },

      // --- Node 18: "Garden Clock Tower" — Time Super Lesson ---
      {
        id: '18',
        meta: {
          topic: 'Garden Clock Tower',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'ME.1.3',
          description: 'Time — Read analog clocks and tell time to the half hour',
        },
        questions: getPlayableQuestions([G1_AnalogTime, G1_ClockMatching, G1_TimeLogic]),
      },

      // --- Node 19: "Calendar Clearing" — Calendar Super Lesson ---
      {
        id: '19',
        meta: {
          topic: 'Calendar Clearing',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'ME.1.4',
          description: 'Calendar & Turns — Days, months & quarter/half turns',
        },
        questions: getPlayableQuestions([G1_CalendarSequence, G1_RotationsTurns, G1_UsingCalendar]),
      },

      // --- Node 20: "The Grand Gardener" — Final Boss All Quarters ---
      {
        id: '20',
        meta: {
          topic: 'The Grand Gardener',
          curriculum: 'MATATAG K-10 Grade 1',
          competency: 'All Grade 1 Competencies',
          description: 'Final Boss — Master all 4 Quarters of Grade 1',
        },
        questions: getPlayableQuestions([
          G1_ShapeHunt, G1_BasicAddition, G1_OrdinalSequence, G1_SortTest,
          G1_PlaceValue, G1_AdditionTo100, G1_BasicSubtraction20, G1_ComplexPatterns,
          G1_IdentifyingFractions, G1_MoneyId, G1_AnalogTime, G1_CalendarSequence,
        ]),
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
