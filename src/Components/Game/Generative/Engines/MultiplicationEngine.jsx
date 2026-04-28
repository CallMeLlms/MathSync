import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IS_TABLET = SCREEN_WIDTH > 768;
const TILE_SIZE = IS_TABLET ? 140 : Math.min((SCREEN_WIDTH - 80) / 2, 130);

function ChoiceTile({ value, isSelected, disabled, onSelect, theme }) {
  const translateY = useSharedValue(0);
  const borderBottom = useSharedValue(6);

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      translateY.value = withSpring(4, { damping: 15, stiffness: 300 });
      borderBottom.value = withSpring(2, { damping: 15, stiffness: 300 });
    })
    .onEnd(() => {
      if (!disabled) runOnJS(onSelect)(value);
    })
    .onFinalize(() => {
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      borderBottom.value = withSpring(6, { damping: 15, stiffness: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: borderBottom.value,
  }));

  const bgColor = isSelected ? theme.primaryColor : Colors.surface;
  const textColor = isSelected ? Colors.surface : Colors.onSurface;
  const borderColor = isSelected ? theme.primaryColor : Colors.outlineVariant;

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        entering={FadeIn.duration(250)}
        style={[
          styles.tile,
          animatedStyle,
          { backgroundColor: bgColor, borderColor },
        ]}
      >
        <Text style={[styles.tileText, { fontFamily: theme.fontFamily.accent, color: textColor }]}>
          {value}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

export default function MultiplicationEngine({ problem, onAnswer, theme }) {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const hasAnswered = useRef(false);
  const answerTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    setSelectedChoice(null);
    hasAnswered.current = false;
    if (answerTimeoutRef.current) {
      clearTimeout(answerTimeoutRef.current);
      answerTimeoutRef.current = null;
    }
  }, [problem?.answer]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (answerTimeoutRef.current) clearTimeout(answerTimeoutRef.current);
    };
  }, []);

  if (!problem || !problem.metadata) return null;

  const { answer, choices, metadata } = problem;
  const { displayQuestion, operand1, operand2 } = metadata;
  const safeChoices = choices ?? [];

  const handleSelect = (value) => {
    if (hasAnswered.current) return;
    hasAnswered.current = true;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    setSelectedChoice(value);
    const isCorrect = String(value) === String(answer);

    answerTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      try {
        onAnswer(isCorrect, String(value));
      } catch (e) {
        console.error('[MultiplicationEngine] onAnswer crash:', e);
      }
    }, 350);
  };

  // Parse the equation parts for the large display (e.g. "6 × 7 = ?" → ["6", "×", "7", "=", "?"])
  const equationParts = displayQuestion.split(' ');

  const hintText = operand1 != null && operand2 != null
    ? `Think: ${operand1} groups of ${operand2}`
    : null;

  // Split choices into 2 rows of 2
  const row1 = safeChoices.slice(0, 2);
  const row2 = safeChoices.slice(2, 4);

  return (
    <View style={styles.container}>
      {/* Equation display card */}
      <View style={styles.equationCard}>
        <LinearGradient
          colors={[theme.primaryColor + '18', theme.primaryColor + '08']}
          style={styles.equationGradient}
        >
          <View style={styles.equationRow}>
            {equationParts.map((part, i) => (
              <Text
                key={i}
                style={[
                  styles.equationPart,
                  part === '?' && styles.equationBlank,
                  {
                    fontFamily: theme.fontFamily.title,
                    color: part === '×' ? theme.primaryColor : Colors.onSurface,
                  },
                ]}
              >
                {part}
              </Text>
            ))}
          </View>

          {hintText && (
            <Text style={[styles.hintText, { fontFamily: theme.fontFamily.body }]}>
              {hintText}
            </Text>
          )}
        </LinearGradient>
      </View>

      {/* Choice grid — 2 × 2 */}
      <View style={styles.gridContainer}>
        <Text style={[styles.instructionText, { fontFamily: theme.fontFamily.body }]}>
          {selectedChoice !== null ? 'Answer locked in!' : 'Pick the correct product'}
        </Text>

        <View style={styles.gridRow}>
          {row1.map((choice) => (
            <ChoiceTile
              key={`c-${choice}`}
              value={choice}
              isSelected={selectedChoice === choice}
              disabled={selectedChoice !== null}
              onSelect={handleSelect}
              theme={theme}
            />
          ))}
        </View>

        {row2.length > 0 && (
          <View style={styles.gridRow}>
            {row2.map((choice) => (
              <ChoiceTile
                key={`c-${choice}`}
                value={choice}
                isSelected={selectedChoice === choice}
                disabled={selectedChoice !== null}
                onSelect={handleSelect}
                theme={theme}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: 'space-around',
  },
  // Equation card
  equationCard: {
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.outlineVariant,
    overflow: 'hidden',
  },
  equationGradient: {
    paddingVertical: 36,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 12,
  },
  equationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  equationPart: {
    fontSize: 52,
    lineHeight: 60,
  },
  equationBlank: {
    fontSize: 52,
    color: Colors.onSurfaceVariant,
  },
  hintText: {
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    marginTop: 4,
  },
  // Choice grid
  gridContainer: {
    alignItems: 'center',
    gap: 12,
  },
  instructionText: {
    fontSize: 15,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 140,
  },
  tileText: {
    fontSize: 36,
  },
});
