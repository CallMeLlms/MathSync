import { create } from 'zustand';

/**
 * useGameEngine Store
 * Centralized state for managing active game sessions across the Hub.
 */
const useGameEngine = create((set, get) => ({
  activeLessonId: null,
  totalScore: 0,
  currentQuestionIndex: 0,
  isSessionActive: false,

  // Start a new game session
  startGameSession: (lessonId) => set({
    activeLessonId: lessonId,
    totalScore: 0,
    currentQuestionIndex: 0,
    isSessionActive: true,
  }),

  // Record an answer result
  recordAnswer: (isCorrect) => set((state) => ({
    totalScore: isCorrect ? state.totalScore + 10 : state.totalScore,
  })),

  // Move to next question
  nextQuestion: () => set((state) => ({
    currentQuestionIndex: state.currentQuestionIndex + 1,
  })),

  // End the game session
  endGameSession: () => set({
    isSessionActive: false,
    activeLessonId: null,
  }),
}));

export default useGameEngine;
