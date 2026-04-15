import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, LinearTransition, FadeIn, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import PlaceValueVisual from '@/Components/Game/Global/Visualizers/PlaceValueVisual';

/**
 * Extracted tactile choice tile used for rendering answer options.
 */
function AnimatedChoiceTile({ value, isSelected, disabled, onSelect, theme, width }) {
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

  // Determine text size depending on string length (for expand / compose modes)
  const isLongText = String(value).length > 6;

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        layout={LinearTransition.springify()}
        entering={FadeIn.duration(300)}
        style={[
          styles.choiceTile,
          { width: width || '45%' }, // Fallback to 45% flex if width not provided
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
          isLongText && { fontSize: 18 },
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
 * Formats a number and underlines the targeted place
 */
const HighlightedNumber = ({ number, targetPlace, theme }) => {
  if (number === undefined) return null;
  const numStr = String(number).padStart(4, " ").trim();
  const places = ["ones", "tens", "hundreds", "thousands"];
  const chars = numStr.split("").reverse();

  return (
    <View style={styles.highlightedNumber}>
      {chars.reverse().map((char, index) => {
        const placeIndex = chars.length - 1 - index;
        const place = places[placeIndex];
        const isHighlighted = place === targetPlace;

        const highlightColor = '#F59E0B'; // Fixed highlight color for focus
        
        return (
          <View key={index} style={styles.digitWrapper}>
            <Text style={[
              styles.mainDigit, 
              { fontFamily: theme.fontFamily.title, color: theme.primaryColor }, 
              isHighlighted && { color: highlightColor }
            ]}>
              {char}
            </Text>
            {isHighlighted && <View style={[styles.highlightUnderline, { backgroundColor: highlightColor }]} />}
          </View>
        );
      })}
    </View>
  );
};

/**
 * PlaceValueEngine
 * Pure, stateless UI component for Place Value Generative Games.
 * Renders distinct layouts based on problem 'type'.
 */
export default function PlaceValueEngine({ problem, onAnswer, theme }) {
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
  const { type, number, num1, num2, targetPlace, displayQuestion, displayText, placeValues } = metadata;
  const safeChoices = choices ?? [];

  const handleChoiceSelect = (value) => {
    console.log('[PlaceValueEngine] Choice selected:', value);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      console.warn('[PlaceValueEngine] Haptics error:', e);
    }
    setSelectedChoice(value);
  };

  const handleSubmit = () => {
    console.log('[PlaceValueEngine] Submit pressed. Selected:', selectedChoice);
    if (selectedChoice === null || hasAnswered.current) return;
    hasAnswered.current = true;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      console.warn('[PlaceValueEngine] Haptics error:', e);
    }

    const isCorrect = String(selectedChoice) === String(answer);
    console.log('[PlaceValueEngine] Answer evaluation - isCorrect:', isCorrect);
    
    try {
      onAnswer(isCorrect, String(selectedChoice));
    } catch (e) {
      console.error('[PlaceValueEngine] onAnswer callback crash:', e);
    }
  };

  const isTablet = width > 768;

  // Render specific layout based on generation pattern
  const renderProblemArea = () => {
    switch (type) {
      case 'identify':
      case 'digitValue':
        // Both involve highlighting a specific digit 
        return (
          <View style={styles.focalContainer}>
            <HighlightedNumber number={number} targetPlace={targetPlace} theme={theme} />
            <PlaceValueVisual placeValues={placeValues} highlightPlace={targetPlace} theme={theme} />
          </View>
        );
      
      case 'expand':
        return (
          <View style={styles.focalContainer}>
            <Text style={[styles.focusNumber, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}>
              {number}
            </Text>
            <PlaceValueVisual placeValues={placeValues} compact theme={theme} />
          </View>
        );
        
      case 'compose':
        return (
          <View style={styles.focalContainer}>
            <Text style={[styles.focusNumber, { fontFamily: theme.fontFamily.title, color: theme.primaryColor, fontSize: 36 }]}>
              {displayText}
            </Text>
            <PlaceValueVisual placeValues={placeValues} compact theme={theme} />
          </View>
        );

      case 'compare':
        return (
          <View style={[styles.focalContainer, { flexDirection: 'column' }]}>
             <View style={styles.compareRow}>
               <HighlightedNumber number={num1} targetPlace={targetPlace} theme={theme} />
               <Text style={[styles.compareOr, { fontFamily: theme.fontFamily.body, color: Colors.onSurfaceVariant }]}>or</Text>
               <HighlightedNumber number={num2} targetPlace={targetPlace} theme={theme} />
             </View>
          </View>
        );

      default:
        return (
           <View style={styles.focalContainer}>
             <Text style={[styles.focusNumber, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}>
               {number}
             </Text>
           </View>
        );
    }
  };

  // Determine Choice tile layout length
  const getChoiceTileWidth = () => {
    const isLongText = safeChoices.some(c => String(c).length > 6);
    if (isLongText) return '100%'; // Stack vertically if text is super long
    if (safeChoices.length <= 4) return '45%'; // 2x2 grid
    return '30%'; // 3x2 grid if more choices
  };

  return (
    <View style={styles.container}>
      {/* Dynamic Header Question */}
      <View style={styles.headerContainer}>
        <Text style={[styles.questionText, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}>
          {displayQuestion}
        </Text>
      </View>

      {/* Math Visual Payload */}
      <View style={styles.focusArea}>
        {renderProblemArea()}
      </View>

      {/* User Input Choices Grid */}
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
            />
          ))}
        </View>
      </View>

      {/* Confirmation Mechanism */}
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
  focalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: Colors.surface,
    paddingVertical: 32,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: Colors.outlineVariant,
  },
  focusNumber: {
    fontSize: 56,
    textAlign: 'center',
    marginBottom: 16,
  },
  // Highlighted Number Utils
  highlightedNumber: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 16,
  },
  digitWrapper: {
    alignItems: 'center',
    marginHorizontal: 4,
  },
  mainDigit: {
    fontSize: 56,
  },
  highlightUnderline: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  compareOr: {
    fontSize: 24,
    marginTop: -20, // Offset due to flex-end in highlight
  },
  // Choice Area Grid
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
    gap: 12,
    width: '100%',
  },
  choiceTile: {
    minHeight: 70,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 24,
    textAlign: 'center',
  },
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
