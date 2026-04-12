import G1_ComposeDecompose from '@content/game-data/quarter-1/grade1-q1-lesson2-numbers/composeDecomposeQuestionBank.json';
import G1_Addition from '@content/game-data/quarter-1/grade1-q1-lesson2-numbers/additionQuestionBank.json';
import G1_NumberMatch from '@content/game-data/quarter-1/grade1-q1-lesson2-numbers/numberMatchingQuestionBank.json';

/**
 * Local Lesson Resolver
 * Bridges the gap between the route and the nested JSON question banks.
 *
 * Multi-engine lessons are supported. questions are merged into a flat array.
 * The CurriculumOrchestrator reads the `type` from each individual question
 * to determine which engine to render, enabling a seamless per-question
 * engine swap mid-session.
 */

const BUNDLED_DATA = {
  G1: {
    lessons: [
      // --- Node 1: "Welcome to the Garden" — locked, question bank pending ---
      // --- Node 2: "Pairing Petals" — ACTIVE, consolidated super-lesson ---
      {
        id: '2',
        meta: {
          topic: 'Pairing Petals',
          curriculum: 'MATATAG K-10 Grade 1',
        },
        // CPA Progression: Concrete → Pictorial → Abstract
        // NumberMatch (Matcher) → Addition (Numpad) → ComposeDecompose (Composer)
        questions: [
          ...G1_NumberMatch.questions,      // Matcher Engine  — Concrete  (tap to match)
          ...G1_Addition.questions,         // Numpad Engine   — Pictorial (type the answer)
          ...G1_ComposeDecompose.questions, // Compose Engine  — Abstract  (decompose parts)
        ],
      },
      // --- Node 3: "Falling Leaves" — locked, question bank pending ---
    ]
  },
};

export const getBundledLesson = (gradeKey, lessonId) => {
  const gradeData = BUNDLED_DATA[gradeKey];
  if (!gradeData) return null;

  const lesson = gradeData.lessons.find(l => String(l.id) === String(lessonId));
  return lesson || null;
};

export default getBundledLesson;
