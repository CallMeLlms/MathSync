import Colors from '@/constants/colors';

/**
 * MathSync Game Theme Registry
 * Defines Visual DNA for different grades/modes.
 */
export const GameThemes = {
  G1: {
    id: 'grade1_garden',
    backgroundColor: Colors.surface,
    primaryColor: Colors.primary,
    secondaryColor: Colors.secondary,
    loadingText: 'Planting Seeds...',
    exitText: 'Leave Garden',
    scoreLabel: 'Activity Score',
    finishTitle: 'Lesson Complete!',
    finishButtonText: 'Back to Map',
    fontFamily: {
      title: 'Lexend-Black',
      body: 'PlusJakartaSans-Medium',
      accent: 'Lexend-Bold'
    }
  },
  // Placeholders for future grades
  G2: {
    id: 'grade2_sky',
    backgroundColor: '#F0F9FF',
    primaryColor: '#0284C7',
    loadingText: 'Soaring High...',
    exitText: 'Back to Earth'
  }
};

/**
 * Helper to get theme by Grade/ID
 */
export const getGameTheme = (gradeKey) => {
  return GameThemes[gradeKey] || GameThemes.G1;
};

export default GameThemes;
