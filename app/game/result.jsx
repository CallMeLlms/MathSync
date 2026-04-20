import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { getGameTheme } from '@/theme/gameThemes';

import useUserStore from '@/stores/user-stores/useUserStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * GameResultScreen
 *
 * High-aesthetic victory/summary screen shown when a lesson session ends.
 * Selects performance data from useUserStore using the lessonId.
 */

const BulkyButton = ({ title, onPress, type = 'primary', theme }) => {
  const translateY = useSharedValue(0);
  const borderBottomWidth = useSharedValue(6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: borderBottomWidth.value,
  }));

  const handlePressIn = () => {
    translateY.value = withSpring(4);
    borderBottomWidth.value = withSpring(2);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    translateY.value = withSpring(0);
    borderBottomWidth.value = withSpring(6);
  };

  const isPrimary = type === 'primary';

  return (
    <Pressable 
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={styles.buttonWrapper}
    >
      <Animated.View style={[
        styles.button,
        isPrimary ? { backgroundColor: theme.primaryColor, borderColor: Colors.onPrimaryContainer } : styles.secondaryButton,
        animatedStyle
      ]}>
        <Text style={[
          styles.buttonText, 
          { fontFamily: isPrimary ? 'Lexend-Bold' : 'PlusJakartaSans-Bold' },
          !isPrimary ? { color: theme.primaryColor } : { color: '#FFFFFF' }
        ]}>
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

export default function GameResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const lessonId = params.lessonId;
  const gradeKey = params.gradeKey ?? 'G1';

  // Fetch performance data directly from the store
  const lessonData = useUserStore(state => 
    state.completedLessons[gradeKey]?.[lessonId]
  );
  
  const score = lessonData?.score ?? 0;
  const accuracy = lessonData?.accuracy ?? 0;
  
  const theme = getGameTheme(gradeKey);

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

  const gradientColors = accuracy >= 70 
    ? [Colors.surfaceContainerLowest, Colors.surfaceContainerLow]
    : [Colors.surfaceContainerLow, Colors.surfaceContainer];

  return (
    <LinearGradient 
      colors={[theme.backgroundColor, Colors.surfaceContainerLow]} 
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.victoryEmoji}>{getVictoryEmoji()}</Text>
          <Text style={[styles.victoryTitle, { color: theme.primaryColor }]}>
            {getVictoryTitle()}
          </Text>
          <Text style={styles.victoryMessage}>{getVictoryMessage()}</Text>
        </View>

        {/* Stats Card */}
        <View style={[styles.statsCard, { borderColor: Colors.outlineVariant }]}>
          <LinearGradient
            colors={gradientColors}
            style={StyleSheet.absoluteFill}
            borderRadius={24}
          />
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.primaryColor }]}>{score}</Text>
              <Text style={styles.statLabel}>☀️ points</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.primaryColor }]}>{accuracy}%</Text>
              <Text style={styles.statLabel}>🎯 accuracy</Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.primaryColor }]}>
                {lessonData ? 'BEST' : '--'}
              </Text>
              <Text style={styles.statLabel}>🏆 status</Text>
            </View>
          </View>
        </View>

        {/* Accuracy Bar */}
        <View style={styles.accuracyBarWrapper}>
          <Text style={styles.accuracyBarLabel}>LESSON PROGRESS</Text>
          <View style={styles.accuracyBarTrack}>
            <View
              style={[
                styles.accuracyBarFill,
                {
                  width: `${Math.min(accuracy, 100)}%`,
                  backgroundColor: accuracy >= 70 ? Colors.bloomProgress : Colors.error,
                  borderBottomWidth: 4,
                  borderBottomColor: accuracy >= 70 ? '#004d1d' : '#8a1111',
                },
              ]}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <BulkyButton 
            title="🗺️   BACK TO JOURNEY" 
            onPress={() => router.back()} 
            theme={theme}
          />
          
          {accuracy < 70 && (
            <BulkyButton 
              title="🔄  TRY AGAIN" 
              type="secondary"
              onPress={() => router.back()}
              theme={theme}
            />
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 32,
  },
  heroSection: {
    alignItems: 'center',
    gap: 8,
  },
  victoryEmoji: {
    fontSize: 84,
    marginBottom: 8,
  },
  victoryTitle: {
    fontFamily: 'Lexend-Black',
    fontSize: 34,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  victoryMessage: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  statsCard: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 8,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontFamily: 'Lexend-Black',
    fontSize: 32,
  },
  statLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    marginTop: -4,
  },
  statDivider: {
    width: 2,
    height: 40,
    backgroundColor: Colors.outlineVariant,
    opacity: 0.5,
  },
  accuracyBarWrapper: {
    width: '100%',
    gap: 10,
  },
  accuracyBarLabel: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1,
  },
  accuracyBarTrack: {
    height: 24,
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    overflow: 'hidden',
  },
  accuracyBarFill: {
    height: '100%',
    borderRadius: 8,
  },
  actions: {
    width: '100%',
    gap: 16,
  },
  buttonWrapper: {
    width: '100%',
  },
  button: {
    width: '100%',
    height: 64,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.outlineVariant,
  },
  buttonText: {
    fontSize: 18,
    letterSpacing: 1.2,
  },
});
