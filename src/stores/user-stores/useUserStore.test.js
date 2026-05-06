/* eslint-env jest */
import useUserStore from './useUserStore';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const GRADE_KEY = 'G1';
const LESSON_ID = 'lesson-1';

function recordSession({ correctCount, totalQuestions = 10, score = correctCount }) {
  useUserStore.getState().recordSessionResult(GRADE_KEY, LESSON_ID, {
    correctCount,
    totalQuestions,
    score,
  });
}

function getLessonRecord() {
  return useUserStore.getState().completedLessons[GRADE_KEY][LESSON_ID];
}

describe('useUserStore recordSessionResult', () => {
  beforeEach(() => {
    useUserStore.getState().resetStore();
  });

  it('stores a below-80 first attempt without completing or awarding sun points', () => {
    recordSession({ correctCount: 6 });

    const state = useUserStore.getState();
    const lesson = getLessonRecord();

    expect(lesson.completed).toBe(false);
    expect(lesson.score).toBe(6);
    expect(lesson.accuracy).toBe(60);
    expect(lesson.lastScore).toBe(6);
    expect(lesson.lastAccuracy).toBe(60);
    expect(lesson.lastCorrectCount).toBe(6);
    expect(lesson.lastTotalQuestions).toBe(10);
    expect(state.stats.sunPoints).toBe(0);
    expect(state.stats.problemsSolved).toBe(0);
  });

  it('awards sun points once on the first passing attempt', () => {
    recordSession({ correctCount: 6 });
    recordSession({ correctCount: 8 });

    const state = useUserStore.getState();
    const lesson = getLessonRecord();

    expect(lesson.completed).toBe(true);
    expect(lesson.score).toBe(8);
    expect(lesson.accuracy).toBe(80);
    expect(lesson.lastScore).toBe(8);
    expect(lesson.lastAccuracy).toBe(80);
    expect(state.stats.sunPoints).toBe(8);
    expect(state.stats.problemsSolved).toBe(10);
  });

  it('keeps completion and best values when a failed replay happens after passing', () => {
    recordSession({ correctCount: 8 });
    recordSession({ correctCount: 5 });

    const state = useUserStore.getState();
    const lesson = getLessonRecord();

    expect(lesson.completed).toBe(true);
    expect(lesson.score).toBe(8);
    expect(lesson.accuracy).toBe(80);
    expect(lesson.lastScore).toBe(5);
    expect(lesson.lastAccuracy).toBe(50);
    expect(state.stats.sunPoints).toBe(8);
  });

  it('updates best accuracy on a perfect replay without adding more sun points', () => {
    recordSession({ correctCount: 8 });
    recordSession({ correctCount: 10 });

    const state = useUserStore.getState();
    const lesson = getLessonRecord();

    expect(lesson.completed).toBe(true);
    expect(lesson.score).toBe(10);
    expect(lesson.accuracy).toBe(100);
    expect(lesson.lastScore).toBe(10);
    expect(lesson.lastAccuracy).toBe(100);
    expect(state.stats.sunPoints).toBe(8);
  });
});
