import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Colors from '@/constants/colors';

/**
 * AlgebraEngine
 * Pure UI Component for solving one-step and two-step algebraic equations.
 * Adheres strictly to "Tactile Bulky" design constraints.
 * 
 * Props:
 * @param {Object} problem - Payload from algebraGenerator.js (contains .answer, .choices, .metadata)
 * @param {Object} theme - Game theme providing colors and fonts
 * @param {Function} onAnswer - Callback signature: (isCorrect, valueSelected)
 */
export default function AlgebraEngine({ problem, theme, onAnswer }) {
  if (!problem || !problem.metadata) return null;

  const { displayQuestion, equation } = problem.metadata;
  const { choices, answer } = problem;

  return (
    <View style={styles.container}>
      {/* Header Prompt */}
      <View style={styles.header}>
        <Text style={[styles.headerText, { fontFamily: theme.fontFamily?.bold || 'Lexend-Bold', color: Colors.onSurface }]}>
          {displayQuestion}
        </Text>
      </View>

      {/* Equation Display (Tactile Board) */}
      <View style={styles.equationContainer}>
        <View style={[styles.equationBoard, { backgroundColor: theme.surfaceColor, borderColor: 'rgba(0,0,0,0.1)' }]}>
          <Text style={[styles.equationText, { fontFamily: theme.fontFamily?.bold || 'Lexend-Bold', color: Colors.onSurface }]}>
            {equation}
          </Text>
        </View>
      </View>

      {/* Answers Grid */}
      <View style={styles.gridContainer}>
        {choices.map((choice, index) => (
          <TactileChoiceButton
            key={`choice-${choice}-${index}`}
            value={choice}
            theme={theme}
            onSelect={() => onAnswer(choice === answer, choice)}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * TactileChoiceButton
 * Internal component managing the mechanical sinking effect down to the UI level.
 */
function TactileChoiceButton({ value, theme, onSelect }) {
  const scale = useSharedValue(1);
  const elevation = useSharedValue(6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderBottomWidth: elevation.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    elevation.value = withSpring(2, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    elevation.value = withSpring(6, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    // Delay slightly to let the "sinking" animation register visually
    setTimeout(() => {
      onSelect(value);
    }, 100);
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={styles.buttonWrapper}
    >
      <Animated.View style={[
        styles.tactileButton,
        animatedStyle,
        { 
          backgroundColor: theme.surfaceColor,
          borderColor: 'rgba(0,0,0,0.15)'
        }
      ]}>
        <Text style={[styles.buttonText, { fontFamily: theme.fontFamily?.bold || 'Lexend-Bold', color: theme.primaryColor }]}>
          {value}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
    justifyContent: 'space-between', // Spread header/board from controls
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    fontSize: 24,
    textAlign: 'center',
    lineHeight: 32,
  },
  equationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginBottom: 40,
  },
  equationBoard: {
    paddingVertical: 32,
    paddingHorizontal: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderBottomWidth: 8, // Intense depth
    minWidth: '80%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF', // Fallback, overridden by theme
  },
  equationText: {
    fontSize: 42,
    letterSpacing: 2,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'center',
    paddingBottom: 32,
    width: '100%',
  },
  buttonWrapper: {
    width: '45%', // 2x2 layout with gap
    aspectRatio: 1.2, // Slightly rectangular
  },
  tactileButton: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 32,
  }
});
