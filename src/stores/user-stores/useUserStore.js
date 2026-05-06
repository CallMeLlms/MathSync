import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PASSING_ACCURACY_PERCENT } from '@/constants/gameProgress';

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
        totalCorrect: 0,
        totalAttempted: 0,
        accuracy: '0%', 
        streak: 0 
      },
      
      // Curriculum progress: { gradeKey: { lessonId: { completed, score, accuracy, lastScore, lastAccuracy, timestamp } } }
      completedLessons: {},

      earnedBadges: [], // string[] of unlocked badge IDs

      activities: [], // Array of { id, type, title, timestamp, points, icon }

      /**
       * Recent activity feed (Profile UI).
       * Stored with UTC timestamps; display formatting happens in UI.
       *
       * Shape: { id, iconType, iconValue, timestampUtc, description }
       */
      recentActivity: [],

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

      addRecentActivity: (activity) =>
        set((state) => {
          const entry = {
            ...activity,
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            timestampUtc: new Date().toISOString(),
          };

          return {
            recentActivity: [entry, ...(state.recentActivity ?? [])].slice(0, 30),
          };
        }),

      clearRecentActivity: () => set({ recentActivity: [] }),

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

      /**
       * Records the result of a lesson session.
       * Keeps both best-ever and latest-attempt fields, with permanent rewards only on first pass.
       */
      recordSessionResult: (gradeKey, lessonId, results) => set((state) => {
        const { correctCount, totalQuestions, score } = results;
        const id = String(lessonId);
        const safeCorrectCount = Math.max(0, Number(correctCount) || 0);
        const safeTotalQuestions = Math.max(0, Number(totalQuestions) || 0);
        const safeScore = Math.max(0, Number(score) || 0);
        
        // 1. Calculate accuracy safely
        const sessionAccuracy = safeTotalQuestions > 0 
          ? Math.round((safeCorrectCount / safeTotalQuestions) * 100) 
          : 0;
        const didPass = sessionAccuracy >= PASSING_ACCURACY_PERCENT;

        // 2. Anti-Farming & New Progress
        const gradeLessons = state.completedLessons[gradeKey] || {};
        const existingRecord = gradeLessons[id];
        const wasCompleted = existingRecord?.completed === true;
        const isFirstPass = didPass && !wasCompleted;

        // Permanent rewards only unlock once, on the first passing attempt.
        const pointsToAdd = isFirstPass ? safeScore : 0;
        const solvedToAdd = isFirstPass ? safeTotalQuestions : 0;

        // 3. Update Individual Lesson Record (Keep highest score/accuracy and latest attempt)
        const newRecord = {
          completed: wasCompleted || didPass,
          score: existingRecord ? Math.max(existingRecord.score || 0, safeScore) : safeScore,
          accuracy: existingRecord ? Math.max(existingRecord.accuracy || 0, sessionAccuracy) : sessionAccuracy,
          lastScore: safeScore,
          lastAccuracy: sessionAccuracy,
          lastCorrectCount: safeCorrectCount,
          lastTotalQuestions: safeTotalQuestions,
          timestamp: new Date().toISOString()
        };

        // 4. Update Global Stats
        const newTotalCorrect = (state.stats.totalCorrect || 0) + safeCorrectCount;
        const newTotalAttempted = (state.stats.totalAttempted || 0) + safeTotalQuestions;
        const globalAccuracy = newTotalAttempted > 0 
          ? `${Math.round((newTotalCorrect / newTotalAttempted) * 100)}%` 
          : '0%';

        return {
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
      }),

      unlockBadge: (badgeId) => set((state) => {
        if (state.earnedBadges.includes(badgeId)) return state;
        const updated = [...state.earnedBadges, badgeId];
        return {
          earnedBadges: updated,
          stats: { ...state.stats, badges: updated.length },
        };
      }),

      updateStats: (newStats) => set((state) => ({
        stats: { ...state.stats, ...newStats }
      })),

      /**
       * Marks a curriculum lesson as completed for a given grade.
       * @deprecated Use recordSessionResult instead.
       */
      markLessonComplete: (gradeKey, lessonId) => set((state) => {
        const gradeProgress = state.completedLessons[gradeKey] || {};
        const id = String(lessonId);
        if (gradeProgress[id]) return state;
        return {
          completedLessons: {
            ...state.completedLessons,
            [gradeKey]: {
              ...gradeProgress,
              [id]: {
                completed: true,
                score: 0,
                accuracy: 0,
                lastScore: 0,
                lastAccuracy: 0,
                lastCorrectCount: 0,
                lastTotalQuestions: 0,
                timestamp: new Date().toISOString()
              }
            }
          }
        };
      }),

      /**
       * Returns whether a specific lesson has been completed.
       */
      isLessonComplete: (gradeKey, lessonId) => {
        const gradeProgress = get().completedLessons[gradeKey] || {};
        return gradeProgress[String(lessonId)]?.completed === true;
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
        stats: { 
          sunPoints: 0, 
          badges: 0, 
          problemsSolved: 0, 
          totalCorrect: 0,
          totalAttempted: 0,
          accuracy: '0%', 
          streak: 0 
        },
        completedLessons: {},
        earnedBadges: [],
        activities: [],
        recentActivity: [],
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
