import { create } from 'zustand';
import useUserStore from '@/stores/user-stores/useUserStore';
import badgeBank from '@content/badges/badgeBank.json';
import { checkAndUnlockBadges } from '@/services/badgeService';

function createSessionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * useGameEngine Store
 * Centralized state for managing active game sessions across the Hub.
 */
const useGameEngine = create((set, get) => ({
  activeLessonId: null,
  totalScore: 0,
  correctCount: 0,
  currentQuestionIndex: 0,
  isSessionActive: false,
  sessionId: null,

  // Start a new game session
  startGameSession: (lessonId) => set({
    activeLessonId: lessonId,
    totalScore: 0,
    correctCount: 0,
    currentQuestionIndex: 0,
    isSessionActive: true,
    sessionId: createSessionId(),
  }),

  // Record an answer result
  recordAnswer: (isCorrect) => set((state) => ({
    totalScore: isCorrect ? state.totalScore + 10 : state.totalScore,
    correctCount: isCorrect ? state.correctCount + 1 : state.correctCount,
  })),

  // Flexible point updating (used by Generative Engines)
  updateScore: (points) => set((state) => ({
    totalScore: Math.max(0, state.totalScore + points),
  })),

  // Move to next question
  nextQuestion: () => set((state) => ({
    currentQuestionIndex: state.currentQuestionIndex + 1,
  })),

  // End the game session (logs XP once per sessionId — see useUserStore xpSessionLog note)
  endGameSession: () => {
    const state = get();
    if (state.sessionId) {
      useUserStore.getState().logXpSession({
        sessionId: state.sessionId,
        xp: state.totalScore,
        timestampUtc: new Date().toISOString(),
        lessonId: state.activeLessonId,
      });

      useUserStore.getState().addRecentActivity({
        iconType: 'material',
        iconValue: 'task-alt',
        description: state.activeLessonId
          ? `Played session: ${String(state.activeLessonId)}`
          : 'Played a lesson session',
      });

      // Badge evaluation — fire-and-forget; swap { useBackend: true } when backend is ready
      const userState = useUserStore.getState();
      checkAndUnlockBadges(userState, badgeBank).then((newBadges) => {
        newBadges.forEach((id) => useUserStore.getState().unlockBadge(id));
      });
    }
    set({
      isSessionActive: false,
      activeLessonId: null,
      sessionId: null,
      currentQuestionIndex: 0,
      totalScore: 0,
      correctCount: 0,
    });
  },
}));

export default useGameEngine;
