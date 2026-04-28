import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  LinearTransition,
  FadeIn,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

import CoinDisplay from '@/Components/Game/Global/Visualizers/CoinDisplay';
import ClockFace from '@/Components/Game/Global/Visualizers/ClockFace';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function AnimatedChoiceTile({ value, isSelected, disabled, onSelect, theme, tileWidth }) {
  const translateY = useSharedValue(0);
  const borderBottom = useSharedValue(6);

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      translateY.value = withSpring(4, { damping: 15, stiffness: 300 });
      borderBottom.value = withSpring(2, { damping: 15, stiffness: 300 });
    })
    .onEnd(() => {
      if (onSelect && !disabled) runOnJS(onSelect)(value);
    })
    .onFinalize(() => {
      translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
      borderBottom.value = withSpring(6, { damping: 15, stiffness: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: borderBottom.value,
  }));

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        layout={LinearTransition.springify()}
        entering={FadeIn.duration(300)}
        style={[
          styles.choiceTile,
          { width: tileWidth || '45%' },
          animatedStyle,
          {
            backgroundColor: isSelected ? theme.primaryColor : Colors.surface,
            borderColor: isSelected ? theme.primaryColor : Colors.outlineVariant,
          },
        ]}
      >
        <Text
          style={[
            styles.choiceText,
            {
              fontFamily: theme.fontFamily.accent,
              color: isSelected ? Colors.surface : Colors.onSurface,
            },
          ]}
        >
          {value}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

export default function TimeMoneyEngine({ problem, onAnswer, theme }) {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const answerTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);
  const hasAnswered = useRef(false);

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

  const { metadata, choices, answer } = problem;
  const { displayQuestion, coinBreakdown, time } = metadata;
  const safeChoices = choices ?? [];

  const handleChoiceSelect = (value) => {
    if (selectedChoice !== null || hasAnswered.current) return;
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
        console.error('[TimeMoneyEngine] onAnswer callback crash:', e);
      }
    }, 400);
  };

  const isTablet = SCREEN_WIDTH > 768;
  const getTileWidth = () => {
    if (safeChoices.length <= 4) return isTablet ? '40%' : '45%';
    return isTablet ? '30%' : '45%';
  };

  const instructionLabel = selectedChoice !== null ? 'Answer locked in!' : 'Tap your answer';

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.questionText, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}>
          {displayQuestion}
        </Text>
      </View>

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

      <View style={styles.choicesArea}>
        <Text style={[styles.instructionText, { fontFamily: theme.fontFamily.body, color: Colors.onSurfaceVariant }]}>
          {instructionLabel}
        </Text>
        <View style={styles.choicesGrid}>
          {safeChoices.map((choice, index) => (
            <AnimatedChoiceTile
              key={`choice-${choice}-${index}`}
              value={choice}
              isSelected={selectedChoice === choice}
              onSelect={handleChoiceSelect}
              theme={theme}
              tileWidth={getTileWidth()}
              disabled={selectedChoice !== null}
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
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.outlineVariant,
  },
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
    minHeight: 72,
    minWidth: 120,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 26,
    textAlign: 'center',
  },
});
