import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue, Easing } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

/**
 * OrderingEngine
 * A stateless engine for sequence-based generative problems (e.g., ordering-numbers).
 * 
 * Props:
 * - problem: The generated problem data { answer, choices, metadata }
 * - onAnswer: Callback when user submits their answer (bool isCorrect, formattedAnswer)
 * - theme: Visual tokens for styling (from gameThemes.js)
 */
export default function OrderingEngine({ problem, onAnswer, theme }) {
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [placedNumbers, setPlacedNumbers] = useState({});
  const [selectedNumber, setSelectedNumber] = useState(null);

  const totalSlots = problem?.choices?.length || 0;

  // Initialize available numbers when a new problem is provided
  useEffect(() => {
    if (problem?.choices) {
      setAvailableNumbers([...problem.choices]);
      setPlacedNumbers({});
      setSelectedNumber(null);
    }
  }, [problem]);

  const handleAvailableNumberTap = (number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (selectedNumber === number) {
      setSelectedNumber(null);
    } else {
      setSelectedNumber(number);
    }
  };

  const handleSlotTap = (slotIndex) => {
    if (selectedNumber === null) return;
    if (placedNumbers[slotIndex] !== undefined) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    setPlacedNumbers((prev) => ({ ...prev, [slotIndex]: selectedNumber }));
    setAvailableNumbers((prev) => prev.filter((n) => n !== selectedNumber));
    setSelectedNumber(null);
  };

  const handlePlacedNumberTap = (number, slotIndex) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    setPlacedNumbers((prev) => {
      const newPlaced = { ...prev };
      delete newPlaced[slotIndex];
      return newPlaced;
    });
    setAvailableNumbers((prev) => [...prev, number]);
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (problem?.choices) {
      setAvailableNumbers([...problem.choices]);
      setPlacedNumbers({});
      setSelectedNumber(null);
    }
  };

  const handleCheck = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    const placedOrder = [];
    for (let i = 0; i < totalSlots; i++) {
      if (placedNumbers[i] !== undefined) {
        placedOrder.push(placedNumbers[i]);
      }
    }

    const userAnswerStr = placedOrder.join(', ');
    const isCorrect = userAnswerStr === problem.answer;
    
    // Send standard validation shape back to Orchestrator
    onAnswer(isCorrect, userAnswerStr);
  };

  const isComplete = Object.keys(placedNumbers).length === totalSlots;

  if (!problem) return null;

  return (
    <View style={styles.container}>
      {/* Display Question */}
      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}>
          {problem.metadata.displayQuestion}
        </Text>
      </View>

      {/* Drop Slots (Upper half) */}
      <View style={styles.slotsContainer}>
        {Array.from({ length: totalSlots }).map((_, index) => {
          const placedVal = placedNumbers[index];
          const isFilled = placedVal !== undefined;

          return (
            <TouchableOpacity
              key={`slot-${index}`}
              style={[
                styles.slot,
                isFilled ? styles.slotFilled : styles.slotEmpty,
                selectedNumber && !isFilled && styles.slotActiveTarget,
                { borderColor: selectedNumber && !isFilled ? theme.secondaryColor : Colors.outlineVariant }
              ]}
              onPress={() => isFilled ? handlePlacedNumberTap(placedVal, index) : handleSlotTap(index)}
              activeOpacity={0.8}
            >
              {isFilled && (
                <Text style={[styles.slotText, { fontFamily: theme.fontFamily.accent, color: theme.primaryColor }]}>
                  {placedVal}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Available Numbers (Lower half) */}
      <View style={styles.availableContainer}>
        <Text style={[styles.instructionText, { fontFamily: theme.fontFamily.body }]}>
          {selectedNumber 
            ? "Tap an empty slot above" 
            : "Tap a number to select"}
        </Text>
        
        <View style={styles.choicesGrid}>
          {availableNumbers.map((num, index) => {
            const isSelected = selectedNumber === num;
            return (
              <TouchableOpacity
                key={`avail-${index}-${num}`}
                style={[
                  styles.choiceTile,
                  isSelected && styles.choiceTileSelected,
                  { 
                    backgroundColor: isSelected ? theme.primaryColor : Colors.surface,
                    borderColor: isSelected ? theme.primaryColor : Colors.outlineVariant
                  }
                ]}
                onPress={() => handleAvailableNumberTap(num)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.choiceText, 
                  { 
                    fontFamily: theme.fontFamily.accent, 
                    color: isSelected ? Colors.surface : Colors.onSurface 
                  }
                ]}>
                  {num}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Engine Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.controlBtn, styles.resetBtn, { borderColor: Colors.outlineVariant }]} 
          onPress={handleReset}
        >
          <Text style={[styles.resetBtnText, { fontFamily: theme.fontFamily.accent }]}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.controlBtn, 
            styles.checkBtn, 
            { backgroundColor: isComplete ? theme.primaryColor : Colors.surfaceVariant }
          ]} 
          onPress={handleCheck}
          disabled={!isComplete}
        >
          <Text style={[
            styles.checkBtnText, 
            { 
              fontFamily: theme.fontFamily.accent, 
              color: isComplete ? Colors.surface : Colors.onSurfaceVariant 
            }
          ]}>
            Check Match
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  questionText: {
    fontSize: 24,
    textAlign: 'center',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 48,
  },
  slot: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotEmpty: {
    borderStyle: 'dashed',
    backgroundColor: 'transparent',
  },
  slotFilled: {
    borderStyle: 'solid',
    backgroundColor: Colors.surface,
  },
  slotActiveTarget: {
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  slotText: {
    fontSize: 20,
  },
  availableContainer: {
    flex: 1,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginBottom: 16,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  choiceTile: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceTileSelected: {
    transform: [{ scale: 1.05 }],
  },
  choiceText: {
    fontSize: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 32,
    paddingTop: 16,
  },
  controlBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtn: {
    backgroundColor: Colors.surface,
    borderWidth: 2,
  },
  resetBtnText: {
    fontSize: 16,
    color: Colors.onSurface,
  },
  checkBtn: {
  },
  checkBtnText: {
    fontSize: 16,
  }
});
