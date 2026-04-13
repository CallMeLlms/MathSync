import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const GRADE_COLORS = {
  G1: { primary: '#4CAF78', secondary: '#2E7D52', accent: '#F9C74F', bg: '#F0FFF4' },
};

/**
 * GameResultScreen
 *
 * High-aesthetic victory/summary screen shown when a lesson session ends.
 * Receives result data via route params and calls markLessonComplete for persistence.
 *
 * Route: /game/result?lessonId=X&gradeKey=G1&score=N&total=N&accuracy=N
 */
export default function GameResultScreen() {
  const router = useRouter();

  // Read params from route
  const { useLocalSearchParams } = require('expo-router');
  const params = useLocalSearchParams();
  const score = Number(params.score ?? 0);
  const total = Number(params.total ?? 0);
  const accuracy = Number(params.accuracy ?? 0);
  const gradeKey = params.gradeKey ?? 'G1';
  const lessonId = params.lessonId ?? null;

  const colors = GRADE_COLORS[gradeKey] ?? GRADE_COLORS.G1;

  const getVictoryEmoji = () => {
    if (accuracy >= 90) return '🏆';
    if (accuracy >= 70) return '⭐';
    if (accuracy >= 50) return '🎉';
    return '💪';
  };

  const getVictoryTitle = () => {
    if (accuracy >= 90) return 'Outstanding!';
    if (accuracy >= 70) return 'Great Job!';
    if (accuracy >= 50) return 'Well Done!';
    return 'Keep Going!';
  };

  const getVictoryMessage = () => {
    if (accuracy >= 90) return 'You are a MathSync Champion!';
    if (accuracy >= 70) return 'You are getting stronger every lesson!';
    if (accuracy >= 50) return 'Practice makes perfect. You got this!';
    return 'Every attempt makes you smarter. Try again!';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Trophy / Star Emoji */}
      <View style={styles.heroSection}>
        <Text style={styles.victoryEmoji}>{getVictoryEmoji()}</Text>
        <Text style={[styles.victoryTitle, { color: colors.secondary }]}>
          {getVictoryTitle()}
        </Text>
        <Text style={styles.victoryMessage}>{getVictoryMessage()}</Text>
      </View>

      {/* Stats Card */}
      <View style={[styles.statsCard, { borderColor: colors.primary }]}>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {score}
            </Text>
            <Text style={styles.statLabel}>☀️ Sun Points</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.primary }]} />

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {accuracy}%
            </Text>
            <Text style={styles.statLabel}>🎯 Accuracy</Text>
          </View>

          <View style={[styles.statDivider, { backgroundColor: colors.primary }]} />

          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {total}
            </Text>
            <Text style={styles.statLabel}>📝 Questions</Text>
          </View>
        </View>
      </View>

      {/* Accuracy Bar */}
      <View style={styles.accuracyBarWrapper}>
        <Text style={styles.accuracyBarLabel}>Lesson Score</Text>
        <View style={styles.accuracyBarTrack}>
          <View
            style={[
              styles.accuracyBarFill,
              {
                width: `${Math.min(accuracy, 100)}%`,
                backgroundColor:
                  accuracy >= 70 ? colors.primary : Colors.error,
              },
            ]}
          />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>🗺️  Back to Journey</Text>
        </TouchableOpacity>

        {accuracy < 70 && (
          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.primary }]}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={[styles.secondaryButtonText, { color: colors.secondary }]}>
              🔄  Try Again
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SCREEN_WIDTH * 0.07,
    paddingVertical: 32,
    gap: 24,
  },
  heroSection: {
    alignItems: 'center',
    gap: 8,
  },
  victoryEmoji: {
    fontSize: SCREEN_HEIGHT * 0.13,
    lineHeight: SCREEN_HEIGHT * 0.14,
  },
  victoryTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: SCREEN_HEIGHT * 0.038,
    textAlign: 'center',
  },
  victoryMessage: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: SCREEN_HEIGHT * 0.018,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: SCREEN_WIDTH * 0.75,
  },
  statsCard: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statValue: {
    fontFamily: 'Lexend-Bold',
    fontSize: SCREEN_HEIGHT * 0.036,
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: SCREEN_HEIGHT * 0.014,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    opacity: 0.3,
  },
  accuracyBarWrapper: {
    width: '100%',
    gap: 6,
  },
  accuracyBarLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: SCREEN_HEIGHT * 0.015,
    color: Colors.onSurfaceVariant,
  },
  accuracyBarTrack: {
    height: 10,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 99,
    overflow: 'hidden',
  },
  accuracyBarFill: {
    height: '100%',
    borderRadius: 99,
  },
  actions: {
    width: '100%',
    gap: 12,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Lexend-Bold',
    fontSize: SCREEN_HEIGHT * 0.02,
    color: '#FFFFFF',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: SCREEN_HEIGHT * 0.018,
  },
});
