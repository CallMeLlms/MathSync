const { create } = require('zustand');

// Mock Store Logic
const recordSessionResult = (state, gradeKey, lessonId, results) => {
  const { correctCount, totalQuestions, score } = results;
  const id = String(lessonId);
  
  const sessionAccuracy = totalQuestions > 0 
    ? Math.round((correctCount / totalQuestions) * 100) 
    : 0;

  const gradeLessons = state.completedLessons[gradeKey] || {};
  const existingRecord = gradeLessons[id];
  const isFirstTime = !existingRecord;

  const pointsToAdd = isFirstTime ? score : 0;
  const solvedToAdd = isFirstTime ? totalQuestions : 0;

  const newRecord = {
    completed: true,
    score: existingRecord ? Math.max(existingRecord.score, score) : score,
    accuracy: existingRecord ? Math.max(existingRecord.accuracy, sessionAccuracy) : sessionAccuracy,
    timestamp: new Date().toISOString()
  };

  const newTotalCorrect = (state.stats.totalCorrect || 0) + correctCount;
  const newTotalAttempted = (state.stats.totalAttempted || 0) + totalQuestions;
  const globalAccuracy = newTotalAttempted > 0 
    ? `${Math.round((newTotalCorrect / newTotalAttempted) * 100)}%` 
    : '0%';

  return {
    ...state,
    stats: {
      ...state.stats,
      sunPoints: (state.stats.sunPoints || 0) + pointsToAdd,
      problemsSolved: (state.stats.problemsSolved || 0) + solvedToAdd,
      totalCorrect: newTotalCorrect,
      totalAttempted: newTotalAttempted,
      accuracy: globalAccuracy
    },
    completedLessons: {
      ...state.completedLessons,
      [gradeKey]: {
        ...gradeLessons,
        [id]: newRecord
      }
    }
  };
};

// Initial State
let state = {
  stats: { sunPoints: 0, problemsSolved: 0, totalCorrect: 0, totalAttempted: 0, accuracy: '0%' },
  completedLessons: {}
};

console.log('--- TEST 1: First Completion ---');
state = recordSessionResult(state, 'G1', 'L1', { correctCount: 8, totalQuestions: 10, score: 80 });
console.log('G1 L1 Record:', state.completedLessons.G1['L1']);
console.log('Global Stats:', state.stats);
// Expected: score 80, accuracy 80%, global sunPoints 80, solved 10, global accuracy 80%

console.log('\n--- TEST 2: Replay with LOWER Score (Anti-Farming) ---');
state = recordSessionResult(state, 'G1', 'L1', { correctCount: 5, totalQuestions: 10, score: 50 });
console.log('G1 L1 Record (should stay 80):', state.completedLessons.G1['L1'].score);
console.log('Global sunPoints (should stay 80):', state.stats.sunPoints);
console.log('Global accuracy (should update correctly):', state.stats.accuracy); 
// totalCorrect: 8+5=13, totalAttempted: 10+10=20. Expected accuracy: 65%

console.log('\n--- TEST 3: Replay with HIGHER Score ---');
state = recordSessionResult(state, 'G1', 'L1', { correctCount: 10, totalQuestions: 10, score: 100 });
console.log('G1 L1 Record (should be 100):', state.completedLessons.G1['L1'].score);
console.log('Global sunPoints (should stay 80):', state.stats.sunPoints);
console.log('Global accuracy:', state.stats.accuracy);
// totalCorrect: 13+10=23, totalAttempted: 20+10=30. Expected accuracy: 77%

console.log('\n--- TEST 4: New Lesson ---');
state = recordSessionResult(state, 'G1', 'L2', { correctCount: 10, totalQuestions: 10, score: 100 });
console.log('Global sunPoints (should be 80+100=180):', state.stats.sunPoints);
console.log('Global accuracy:', state.stats.accuracy);
// totalCorrect: 23+10=33, totalAttempted: 30+10=40. Expected accuracy: 83%
