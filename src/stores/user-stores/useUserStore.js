import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        activities: []
      }),
    }),
    {
      name: 'mathsync-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useUserStore;
