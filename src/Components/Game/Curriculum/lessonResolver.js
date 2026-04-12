import G1_ComposeDecompose from '@content/game-data/quarter-1/grade1-q1-lesson2-numbers/composeDecomposeQuestionBank.json';
import G1_Addition from '@content/game-data/quarter-1/grade1-q1-lesson2-numbers/additionQuestionBank.json';
import G1_NumberMatch from '@content/game-data/quarter-1/grade1-q1-lesson2-numbers/numberMatchingQuestionBank.json';

/**
 * Local Lesson Resolver
 * Bridges the gap between the route and the nested JSON question banks.
 */

// Helper to normalize JSON structure for the orchestrator
const normalizeLesson = (data) => {
  if (!data) return null;
  return {
    ...data,
    // Ensure the type is lowercase as expected by the Orchestrator switch cases
    type: data.questions?.[0]?.type?.toLowerCase() || 'unknown',
    questions: data.questions || []
  };
};

const BUNDLED_DATA = {
  G1: {
    lessons: [
      { id: '1', ...normalizeLesson(G1_NumberMatch) },
      { id: '2', ...normalizeLesson(G1_Addition) },
      { id: '3', ...normalizeLesson(G1_ComposeDecompose) },
      // Aliases for more descriptive access
      { id: 'lesson-match', ...normalizeLesson(G1_NumberMatch) },
      { id: 'lesson-addition', ...normalizeLesson(G1_Addition) },
      { id: 'lesson-compose', ...normalizeLesson(G1_ComposeDecompose) },
    ]
  },
  // Grade 2, 3 placeholders
};

export const getBundledLesson = (gradeKey, lessonId) => {
  const gradeData = BUNDLED_DATA[gradeKey];
  if (!gradeData) return null;

  // Find by ID string or number
  const lesson = gradeData.lessons.find(l => String(l.id) === String(lessonId));
  return lesson || gradeData.lessons[0];
};

export default getBundledLesson;
