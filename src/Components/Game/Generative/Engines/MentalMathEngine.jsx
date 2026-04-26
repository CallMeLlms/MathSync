import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

/**
 * ChoiceButton
 * Tactile bulky choice tile that auto-submits on tap.
 */
function ChoiceButton({ value, disabled, onPress, theme }) {
  const translateY = useSharedValue(0);

  const handlePress = (v) => {
    console.log('[ChoiceButton] tap ended — value:', v);
    if (onPress) onPress(v);
  };

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      console.log('[ChoiceButton] tap began — value:', value);
      translateY.value = withSpring(4, { damping: 15, stiffness: 300 });
    })
    .onEnd(() => {
      runOnJS(handlePress)(value);
    })
    .onFinalize(() => {
      translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        entering={FadeIn.duration(250)}
        style={[
          styles.choiceButton,
          animatedStyle,
          {
            backgroundColor: Colors.surface,
            borderColor: theme.primaryColor,
          },
        ]}
      >
        <View style={styles.choiceTextWrapper}>
          <Text style={[styles.choiceText, { fontFamily: theme.fontFamily.accent, color: theme.primaryColor }]}>
            {value}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * MentalMathEngine
 * Pure stateless engine for the Mental Math generative game.
 * Displays a 2×2 multiple-choice grid — auto-submits on tap for quick-fire flow.
 *
 * Props: { problem, onAnswer, theme }
 */
export default function MentalMathEngine({ problem, onAnswer, theme }) {
  const { width } = useWindowDimensions();
  const hasAnswered = useRef(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    hasAnswered.current = false;
    setIsLocked(false);
  }, [problem?.answer]);

  if (!problem || !problem.metadata) return null;

  const { choices, answer, metadata } = problem;
  console.log('[MentalMathEngine] render — answer:', answer, '| choices:', choices);
  const { displayQuestion } = metadata;
  const safeChoices = choices ?? [];
  const isTablet = width > 768;

  const handleChoicePress = (value) => {
    console.log('[MentalMathEngine] handleChoicePress — value:', value, '| locked:', hasAnswered.current || isLocked);
    if (hasAnswered.current || isLocked) return;
    hasAnswered.current = true;
    setIsLocked(true);

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (_) {}

    const isCorrect = String(value) === String(answer);
    console.log('[MentalMathEngine] answer dispatched — isCorrect:', isCorrect, '| expected:', answer, '| got:', value);
    onAnswer(isCorrect, String(value));
  };

  return (
    <View style={styles.container}>
      {/* Equation Display — stays at top */}
      <View style={styles.equationArea}>
        <View style={[styles.equationCard, { borderColor: theme.primaryColor }]}>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5}
            style={[
              styles.equationText,
              {
                fontFamily: theme.fontFamily.title,
                color: theme.primaryColor,
                fontSize: isTablet ? 64 : 44,
              },
            ]}
          >
            {displayQuestion}
          </Text>
        </View>
      </View>

      {/* Bottom group — instruction + 2×2 choice grid */}
      <View style={styles.bottomGroup}>
        <Text style={[styles.instructionText, { fontFamily: theme.fontFamily.body, color: Colors.onSurfaceVariant }]}>
          Tap the correct answer
        </Text>
        <View style={[styles.choiceGrid, { gap: isTablet ? 20 : 14 }]}>
          {safeChoices.map((choice, index) => (
            <ChoiceButton
              key={`choice-${choice}-${index}`}
              value={choice}
              disabled={isLocked}
              onPress={handleChoicePress}
              theme={theme}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  equationArea: {
    alignItems: 'center',
  },
  equationCard: {
    paddingHorizontal: 32,
    paddingVertical: 36,
    borderRadius: 24,
    borderWidth: 3,
    borderBottomWidth: 8,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 480,
    width: '100%',
  },
  equationText: {
    textAlign: 'center',
  },
  bottomGroup: {
    width: '100%',
  },
  instructionText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 16,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  choiceButton: {
    width: '46%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 200,
    paddingTop: 4, // Visual balance for thick bottom border
  },
  choiceTextWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  choiceText: {
    fontSize: 24,
    letterSpacing: 0.5,
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
});
