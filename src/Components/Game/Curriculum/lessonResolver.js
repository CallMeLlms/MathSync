import G1Data from '@content/game-data/G1-Q1-Lessons.json';

/**
 * Local Lesson Resolver
 * Bridges the gap between the route and the bundled JSON question banks.
 */
const BUNDLED_DATA = {
  G1: G1Data,
  // Grade 2, 3 placeholders
};

export const getBundledLesson = (gradeKey, lessonId) => {
  const gradeData = BUNDLED_DATA[gradeKey];
  if (!gradeData) return null;

  return gradeData.lessons.find(l => l.id === lessonId) || gradeData.lessons[0];
};

export default getBundledLesson;
