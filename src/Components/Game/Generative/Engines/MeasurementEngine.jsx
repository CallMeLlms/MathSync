import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, LinearTransition, FadeIn } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

import MeasurementVisual from '@/Components/Game/Global/Visualizers/MeasurementVisual';

const { width } = Dimensions.get('window');

/**
 * AnimatedChoiceTile 
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

  const isLongText = String(value).length > 8;

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
          isLongText && { fontSize: 16 },
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
 * MeasurementEngine
 * Generative engine for length, weight, and capacity problems.
 */
export default function MeasurementEngine({ problem, onAnswer, theme }) {
  const [selectedChoice, setSelectedChoice] = useState(null);

  useEffect(() => {
    setSelectedChoice(null);
  }, [problem?.answer]);

  if (!problem || !problem.metadata) return null;

  const { metadata, choices, answer } = problem;
  const { displayQuestion, category, categoryIcon, conversion, comparison, type, isWordProblem } = metadata;

  const handleChoiceSelect = (value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedChoice(value);
  };

  const handleSubmit = () => {
    if (selectedChoice === null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isCorrect = String(selectedChoice) === String(answer);
    onAnswer(isCorrect, String(selectedChoice));
  };

  const isTablet = width > 768;

  // Render specific layout based on generation pattern
  const renderProblemArea = () => {
    if (conversion && !isWordProblem) {
       // Direct Conversion
       return (
         <View style={styles.focalContainer}>
            <MeasurementVisual 
               fromUnit={conversion.from} 
               toUnit={conversion.to} 
               category={category} 
               categoryIcon={categoryIcon}
               theme={theme}
            />
         </View>
       );
    }
    
    if (comparison) {
        // Compare Problem (Which is larger?)
        return (
          <View style={styles.focalContainer}>
             <View style={styles.compareRow}>
                <Text style={[styles.compareValue, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}>
                   {comparison.val1} {comparison.unit1}
                </Text>
                <Text style={[styles.compareOr, { fontFamily: theme.fontFamily.body, color: Colors.onSurfaceVariant }]}>
                   or
                </Text>
                <Text style={[styles.compareValue, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}>
                   {comparison.val2} {comparison.unit2}
                </Text>
             </View>
             {/* Show the conversion scale to help them */}
             <View style={{ marginTop: 24 }}>
                <MeasurementVisual 
                  fromUnit={comparison.unit1} 
                  toUnit={comparison.unit2} 
                  category={category} 
                  categoryIcon={categoryIcon}
                  theme={theme}
                />
             </View>
          </View>
        );
    }

    if (isWordProblem) {
       // Word Problem layout
       return (
         <View style={styles.focalContainer}>
           <Text style={{ fontSize: 64 }}>{categoryIcon}</Text>
           {/* If conversion metadata is secretly passed for word problems, show the visual */}
           {conversion && (
              <View style={{ marginTop: 16 }}>
                 <MeasurementVisual 
                   fromUnit={conversion.from} 
                   toUnit={conversion.to} 
                   category={category} 
                   categoryIcon={categoryIcon}
                   theme={theme}
                 />
              </View>
           )}
         </View>
       );
    }

    return null;
  };

  // Determine Choice tile layout length
  const getChoiceTileWidth = () => {
    const isLongText = choices.some(c => String(c).length > 10);
    if (isLongText || isWordProblem) return isTablet ? '45%' : '100%'; // Stack vertically on phones if text is long
    return '45%'; // Standard 2x2 grid
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={[styles.questionText, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}>
          {displayQuestion}
        </Text>
      </View>

      <View style={styles.focusArea}>
        {renderProblemArea()}
      </View>

      <View style={styles.choicesArea}>
        <Text style={[styles.instructionText, { fontFamily: theme.fontFamily.body, color: Colors.onSurfaceVariant }]}>
          Select your answer
        </Text>
        <View style={styles.choicesGrid}>
          {choices.map((choice, index) => (
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

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: selectedChoice !== null ? theme.primaryColor : Colors.surfaceVariant,
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
    marginBottom: 16,
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
    marginBottom: 16,
  },
  focalContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 500,
    backgroundColor: Colors.surface,
    paddingVertical: 32,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: Colors.outlineVariant,
  },
  // Compare Styles
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  compareValue: {
    fontSize: 36,
  },
  compareOr: {
    fontSize: 24,
  },
  // Choice Area Grid
  choicesArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 12,
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
    paddingTop: 12,
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
