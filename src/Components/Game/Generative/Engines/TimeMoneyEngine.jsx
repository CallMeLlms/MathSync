import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, LinearTransition, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

import CoinDisplay from '@/Components/Game/Global/Visualizers/CoinDisplay';
import ClockFace from '@/Components/Game/Global/Visualizers/ClockFace';

const { width } = Dimensions.get('window');

/**
 * AnimatedChoiceTile for Time & Money selection
 */
function AnimatedChoiceTile({ value, isSelected, disabled, onSelect, theme, width }) {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      scale.value = withSpring(0.92, { damping: 15, stiffness: 200 });
    })
    .onTouchesUp(() => {
      if (onSelect && !disabled) onSelect(value);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        layout={LinearTransition.springify()}
        entering={FadeIn.duration(300)}
        style={[
          styles.choiceTile,
          { width: width || '45%' },
          animatedStyle,
          { 
            backgroundColor: isSelected ? theme.primaryColor : Colors.surface,
            borderColor: isSelected ? theme.primaryColor : Colors.outlineVariant,
            borderBottomWidth: isSelected ? 3 : 5, 
            borderRightWidth: isSelected ? 3 : 4,
          }
        ]}
      >
        <Text style={[
          styles.choiceText,
          { 
            fontFamily: theme.fontFamily.accent, 
            color: isSelected ? Colors.surface : Colors.onSurface 
          }
        ]}>
          {value}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * TimeMoneyEngine
 * Generative engine supporting both Coin displays and Clock faces.
 */
export default function TimeMoneyEngine({ problem, onAnswer, theme }) {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const answerTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Reset local state and cancel any pending dispatch when a new problem arrives
  useEffect(() => {
    setSelectedChoice(null);
    if (answerTimeoutRef.current) {
      clearTimeout(answerTimeoutRef.current);
      answerTimeoutRef.current = null;
    }
  }, [problem?.answer]);

  // Track mount state so deferred onAnswer cannot fire on a dead component
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (answerTimeoutRef.current) clearTimeout(answerTimeoutRef.current);
    };
  }, []);

  if (!problem || !problem.metadata) return null;

  const { metadata, choices, answer } = problem;
  const { displayQuestion, coinBreakdown, time } = metadata;
  const safeChoices = choices ?? [];

  const handleChoiceSelect = (value) => {
    if (selectedChoice !== null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedChoice(value);

    const isCorrect = String(value) === String(answer);

    // Slight delay so the button can animate its selection state before moving on
    answerTimeoutRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      onAnswer(isCorrect, String(value));
    }, 400);
  };

  // Determine grid layout based on number of choices (usually 4)
  const isTablet = width > 768;
  const getChoiceTileWidth = () => {
    if (safeChoices.length <= 4) return isTablet ? '40%' : '45%'; // 2x2 grid
    return isTablet ? '30%' : '45%'; // 3x2 grid if more choices
  };

  return (
    <View style={styles.container}>
      {/* Header Question */}
      <View style={styles.headerContainer}>
        <Text style={[styles.questionText, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}>
          {displayQuestion}
        </Text>
      </View>

      {/* Primary Visual Payload */}
      <View style={styles.focusArea}>
        <View style={styles.visualEnclosure}>
          {coinBreakdown ? (
             <CoinDisplay coins={coinBreakdown} theme={theme} />
          ) : time ? (
             <ClockFace hour={time.hour} minute={time.minute} theme={theme} />
          ) : (
             <Text style={{ fontFamily: theme.fontFamily.body }}>No visual data provided.</Text>
          )}
        </View>
      </View>

      {/* Answer Choices Grid */}
      <View style={styles.choicesArea}>
        <Text style={[styles.instructionText, { fontFamily: theme.fontFamily.body, color: Colors.onSurfaceVariant }]}>
          Tap your answer
        </Text>
        <View style={styles.choicesGrid}>
          {safeChoices.map((choice, index) => (
            <AnimatedChoiceTile
              key={`choice-${choice}-${index}`}
              value={choice}
              isSelected={selectedChoice === choice}
              onSelect={handleChoiceSelect}
              theme={theme}
              width={getChoiceTileWidth()}
              disabled={selectedChoice !== null} // Prevent multi-tapping during the timeout
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
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  questionText: {
    fontSize: 26,
    textAlign: 'center',
    lineHeight: 34,
  },
  focusArea: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginBottom: 24,
  },
  visualEnclosure: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 500,
    backgroundColor: Colors.surface,
    paddingVertical: 32,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: Colors.outlineVariant,
  },
  // Choice Area Grid
  choicesArea: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingVertical: 16,
    minHeight: 200,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 16,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  choiceTile: {
    minHeight: 80,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 26,
    textAlign: 'center',
  },
});
