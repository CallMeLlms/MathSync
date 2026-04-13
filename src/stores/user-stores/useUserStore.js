import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const XP_LOG_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * MathSync User Store
 * 
 * Handles user profile data, educational progress, and global preferences.
 * Uses AsyncStorage for automatic persistence across app restarts.
 */
export const useUserStore = create(
  persist(
    (set, get) => ({
      // --- State ---
      profile: { 
        name: 'Explorer', 
        email: null,
        avatar: null, 
        level: 1,
        isMaster: false,
        registeredGrade: null 
      },
      
      // The current selected grade context (e.g., 'G1', 'G2', etc.)
      currentGrade: null,
      
      stats: { 
        sunPoints: 0, 
        badges: 0, 
        problemsSolved: 0, 
        accuracy: '0%', 
        streak: 0 
      },
      
      // Curriculum progress: { G1: ['1', '3'], G2: [] }
      completedLessons: {},

      activities: [], // Array of { id, type, title, timestamp, points, icon }

      /*
       * XP session log (weekly chart / analytics) — separate from `activities` (UI feed).
       *
       * Event definition: one row per game session when `useGameEngine.endGameSession` runs
       * (cleanup on leave, including early exit). XP is the session totalScore at that moment.
       *
       * Dedup: `logXpSession` ignores duplicate `sessionId` values. Session IDs are issued in
       * `startGameSession` so the same session cannot be logged twice even if finalization paths
       * multiply (e.g. navigation + unmount).
       *
       * Storage: timestamps are UTC ISO strings; local calendar bucketing happens in
       * `activityAggregator` / `useWeeklyActivity` only.
       */
      xpSessionLog: [],

      // --- Actions ---
      
      /**
       * Sets the global grade context for the user.
       * @param {string} gradeId - Example: 'G1', 'G2'...
       */
      setCurrentGrade: (gradeId) => set({ currentGrade: gradeId }),

      setProfile: (newProfile) => set((state) => ({
        profile: { ...state.profile, ...newProfile }
      })),

      addActivity: (activity) => set((state) => ({
        activities: [
          { ...activity, id: Date.now().toString(), timestamp: new Date() },
          ...state.activities
        ].slice(0, 50) // Keep last 50
      })),

      /**
       * Persists one XP sample per game session (see inline note on `xpSessionLog`).
       */
      logXpSession: ({ sessionId, xp, timestampUtc, type = 'game_session', lessonId = null }) =>
        set((state) => {
          if (!sessionId) return state;
          const prevLog = state.xpSessionLog ?? [];
          if (prevLog.some((e) => e.sessionId === sessionId)) return state;

          const cutoff = Date.now() - XP_LOG_RETENTION_MS;
          const entry = {
            id: sessionId,
            sessionId,
            xp: Math.max(0, Number(xp) || 0),
            timestampUtc: timestampUtc || new Date().toISOString(),
            type,
            lessonId: lessonId != null ? String(lessonId) : null,
          };

          const merged = [entry, ...prevLog].filter((e) => {
            const t = new Date(e.timestampUtc).getTime();
            return !Number.isNaN(t) && t >= cutoff;
          });

          return { xpSessionLog: merged };
        }),

      updateStats: (newStats) => set((state) => ({
        stats: { ...state.stats, ...newStats }
      })),

      /**
       * Marks a curriculum lesson as completed for a given grade.
       * @param {string} gradeKey - e.g. 'G1'
       * @param {string|number} lessonId - e.g. '2'
       */
      markLessonComplete: (gradeKey, lessonId) => set((state) => {
        const gradeProgress = state.completedLessons[gradeKey] || [];
        const id = String(lessonId);
        if (gradeProgress.includes(id)) return state;
        return {
          completedLessons: {
            ...state.completedLessons,
            [gradeKey]: [...gradeProgress, id]
          }
        };
      }),

      /**
       * Returns whether a specific lesson has been completed.
       */
      isLessonComplete: (gradeKey, lessonId) => {
        const gradeProgress = get().completedLessons[gradeKey] || [];
        return gradeProgress.includes(String(lessonId));
      },

      resetStore: () => set({ 
        currentGrade: null,
        profile: { 
          name: 'Explorer', 
          email: null,
          avatar: null, 
          level: 1,
          isMaster: false,
          registeredGrade: null
        },
        stats: { sunPoints: 0, badges: 0, problemsSolved: 0, accuracy: '0%', streak: 0 },
        completedLessons: {},
        activities: [],
        xpSessionLog: [],
      }),
    }),
    {
      name: 'mathsync-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useUserStore;
