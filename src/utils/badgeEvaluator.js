import G1Map from '@content/lesson-map/G1.json';

// Pre-build a lookup: quarterNumber -> string[] of lesson IDs (non-boss only)
const QUARTER_LESSON_IDS = G1Map.levels.reduce((acc, node) => {
  if (node.type !== 'boss') {
    const key = node.quarter;
    if (!acc[key]) acc[key] = [];
    acc[key].push(String(node.id));
  }
  return acc;
}, {});

function countCompletedLessons(completedLessons) {
  return Object.values(completedLessons).reduce((total, gradeLessons) => {
    return total + Object.values(gradeLessons).filter((r) => r.completed).length;
  }, 0);
}

function hasPerfectScore(completedLessons) {
  return Object.values(completedLessons).some((gradeLessons) =>
    Object.values(gradeLessons).some((r) => r.completed && r.accuracy === 100)
  );
}

function hasTopicComplete(completedLessons, topic) {
  const keyword = topic.toLowerCase();
  return Object.entries(completedLessons).some(([, gradeLessons]) =>
    Object.entries(gradeLessons).some(
      ([lessonId, r]) => r.completed && lessonId.toLowerCase().includes(keyword)
    )
  );
}

function isQuarterComplete(completedLessons, quarterString) {
  // quarterString is e.g. "quarter-1" → extract number
  const num = parseInt(quarterString.replace('quarter-', ''), 10);
  const requiredIds = QUARTER_LESSON_IDS[num] || [];
  if (!requiredIds.length) return false;

  // Check across all grades (G1 for now)
  const allCompletedIds = Object.values(completedLessons).flatMap((gradeLessons) =>
    Object.entries(gradeLessons)
      .filter(([, r]) => r.completed)
      .map(([id]) => id)
  );

  return requiredIds.every((id) => allCompletedIds.includes(id));
}

function checkCondition(badge, { completedLessons, stats }) {
  switch (badge.conditionType) {
    case 'lessonCount':
      return countCompletedLessons(completedLessons) >= badge.threshold;
    case 'perfectScore':
      return hasPerfectScore(completedLessons);
    case 'topicComplete':
      return hasTopicComplete(completedLessons, badge.topic);
    case 'problemsSolved':
      return (stats.problemsSolved || 0) >= badge.threshold;
    case 'streak':
      return (stats.streak || 0) >= badge.threshold;
    case 'quarterComplete':
      return isQuarterComplete(completedLessons, badge.quarter);
    default:
      return false;
  }
}

/**
 * Evaluates which badges should unlock given the current user state.
 * Pure function — no side effects, no store imports.
 *
 * @param {{ completedLessons: object, stats: object, earnedBadges: string[] }} userState
 * @param {Array} badgeBank
 * @returns {string[]} IDs of newly unlocked badges
 */
export function evaluateBadges({ completedLessons = {}, stats = {}, earnedBadges = [] }, badgeBank) {
  return badgeBank
    .filter((badge) => !earnedBadges.includes(badge.id))
    .filter((badge) => checkCondition(badge, { completedLessons, stats }))
    .map((badge) => badge.id);
}
