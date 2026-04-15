import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, LinearTransition, FadeIn, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

/**
 * AnimatedChoiceTile
 * Extracted tactile choice tile used for rendering answer options.
 */
function AnimatedChoiceTile({ value, isSelected, disabled, onSelect, theme }) {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(() => {
      scale.value = withSpring(0.92, { damping: 15, stiffness: 200 });
    })
    .onEnd(() => {
      if (onSelect && !disabled) runOnJS(onSelect)(value);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDarkSurface = theme.primaryColor === '#FFF' ? false : true;

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        layout={LinearTransition.springify()}
        entering={FadeIn.duration(300)}
        style={[
          styles.choiceTile,
          animatedStyle,
          { 
            backgroundColor: isSelected ? theme.primaryColor : Colors.surface,
            borderColor: isSelected ? theme.primaryColor : Colors.outlineVariant,
            // Tactile border: pressed state flattens bottom/right depth
            borderBottomWidth: isSelected ? 1 : 5,
            borderRightWidth: isSelected ? 1 : 4,
            opacity: isSelected ? 0.95 : 1,
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
 * NumberLineHint
 * A static number line to show where the current value lies between two tens/hundreds.
 */
function NumberLineHint({ number, roundToBase, theme }) {
  if (number === undefined || roundToBase === undefined) return null;

  const lowerBound = Math.floor(number / roundToBase) * roundToBase;
  const upperBound = lowerBound + roundToBase;
  const positionPercent = ((number - lowerBound) / roundToBase) * 100;
  
  return (
    <View style={styles.numberLineContainer}>
      <Text style={[styles.numberLineLabel, { color: theme.secondaryColor || Colors.onSurfaceVariant, fontFamily: theme.fontFamily.accent }]}>
        {lowerBound}
      </Text>
      
      <View style={styles.lineWrapper}>
        <View style={[styles.lineTrack, { backgroundColor: Colors.surfaceVariant }]} />
        
        {/* The Midpoint Marker */}
        <View style={[styles.midpointMarker, { backgroundColor: Colors.outlineVariant }]} />

        {/* The Target Position Marker */}
        <View style={[styles.positionMarkerContainer, { left: `${positionPercent}%` }]}>
          <View style={[styles.positionMarkerDot, { backgroundColor: theme.primaryColor, borderColor: Colors.surface }]} />
          <Text style={[styles.positionMarkerLabel, { color: theme.primaryColor, fontFamily: theme.fontFamily.body }]}>
            {number}
          </Text>
        </View>
      </View>

      <Text style={[styles.numberLineLabel, { color: theme.secondaryColor || Colors.onSurfaceVariant, fontFamily: theme.fontFamily.accent }]}>
        {upperBound}
      </Text>
    </View>
  );
}

/**
 * RoundingEngine
 * A pure, stateless UI component for Rounding Generative Games.
 * Handles user input and triggers `onAnswer` to validate.
 * 
 * Props:
 * - problem: The generated problem data object
 * - onAnswer: Callback (isCorrect, userAnswer)
 * - theme: Generative game theme tokens
 */
export default function RoundingEngine({ problem, onAnswer, theme }) {
  const { width } = useWindowDimensions();
  const [selectedChoice, setSelectedChoice] = useState(null);
  const hasAnswered = useRef(false);

  // Reset local state when a new problem is passed
  useEffect(() => {
    setSelectedChoice(null);
    hasAnswered.current = false;
  }, [problem?.answer]);

  if (!problem || !problem.metadata) return null;

  const { metadata, choices, answer } = problem;
  const { number, roundTo, displayQuestion } = metadata;
  const safeChoices = choices ?? [];

  const handleChoiceSelect = (value) => {
    console.log('[RoundingEngine] Choice selected:', value);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      console.warn('[RoundingEngine] Haptics error:', e);
    }
    setSelectedChoice(value);
  };

  const handleSubmit = () => {
    console.log('[RoundingEngine] Submit pressed. Selected:', selectedChoice);
    if (selectedChoice === null || hasAnswered.current) return;
    hasAnswered.current = true;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      console.warn('[RoundingEngine] Haptics error:', e);
    }

    const isCorrect = String(selectedChoice) === String(answer);
    console.log('[RoundingEngine] Answer evaluation - isCorrect:', isCorrect);
    
    try {
      onAnswer(isCorrect, String(selectedChoice));
    } catch (e) {
      console.error('[RoundingEngine] onAnswer callback crash:', e);
    }
  };

  const isTablet = width > 768;

  return (
    <View style={styles.container}>
      {/* Header Area */}
      <View style={styles.headerContainer}>
        <Text style={[styles.questionText, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}>
          {displayQuestion}
        </Text>
      </View>

      {/* Main Focus Area (Number to round and Visuals) */}
      <View style={styles.focusArea}>
        <View style={[
            styles.numberBumper, 
            { 
              backgroundColor: Colors.surface, 
              borderColor: theme.primaryColor 
            }
          ]}>
          <Text style={[styles.mainNumberText, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}>
            {number}
          </Text>
        </View>

        <NumberLineHint number={number} roundToBase={roundTo} theme={theme} />
      </View>

      {/* Choices Area */}
      <View style={styles.choicesArea}>
        <Text style={[styles.instructionText, { fontFamily: theme.fontFamily.body, color: Colors.onSurfaceVariant }]}>
          Select your answer:
        </Text>
        <View style={[styles.choicesGrid, { gap: isTablet ? 24 : 16 }]}>
          {safeChoices.map((choice, index) => (
            <AnimatedChoiceTile
              key={`choice-${choice}-${index}`}
              value={choice}
              isSelected={selectedChoice === choice}
              onSelect={handleChoiceSelect}
              theme={theme}
            />
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: selectedChoice !== null ? theme.primaryColor : Colors.surfaceContainer,
              borderColor: selectedChoice !== null ? theme.primaryColor : Colors.outlineVariant,
            }
          ]}
          onPress={handleSubmit}
          disabled={selectedChoice === null}
        >
          <Text style={[
            styles.submitButtonText, 
            { 
              fontFamily: theme.fontFamily.accent, 
              color: selectedChoice !== null ? Colors.surface : Colors.onSurfaceVariant 
            }
          ]}>
            Submit
          </Text>
        </TouchableOpacity>
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
    marginBottom: 24,
  },
  questionText: {
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 32,
  },
  focusArea: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginBottom: 24,
  },
  numberBumper: {
    paddingHorizontal: 48,
    paddingVertical: 24,
    borderRadius: 24,
    borderWidth: 4,
    borderBottomWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  mainNumberText: {
    fontSize: 64,
  },
  // Number Line Styles
  numberLineContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 60,
  },
  numberLineLabel: {
    fontSize: 20,
    width: 45,
    textAlign: 'center',
  },
  lineWrapper: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
    justifyContent: 'center',
  },
  lineTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
  },
  midpointMarker: {
    position: 'absolute',
    left: '50%',
    top: 10,
    bottom: 10,
    width: 2,
    transform: [{ translateX: -1 }],
  },
  positionMarkerContainer: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -12 }], // Half of marker width
  },
  positionMarkerDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
  },
  positionMarkerLabel: {
    fontSize: 14,
    marginTop: 4,
    fontWeight: 'bold',
  },
  // Choices area
  choicesArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 16,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  choiceTile: {
    minWidth: 70,
    height: 70,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 24,
  },
  // Controls
  controlsContainer: {
    paddingTop: 16,
  },
  submitButton: {
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderBottomWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 20,
  },
});
