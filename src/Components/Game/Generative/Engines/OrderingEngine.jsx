import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, LinearTransition, FadeIn, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

function AnimatedTile({ number, isSelected, onSelect, theme }) {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.92, { damping: 15, stiffness: 200 });
    })
    .onEnd(() => {
      if (onSelect) {
        runOnJS(onSelect)(number);
      }
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
          animatedStyle,
          { 
            backgroundColor: isSelected ? theme.primaryColor : Colors.surface,
            borderColor: isSelected ? theme.primaryColor : Colors.outlineVariant,
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
          {number}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

function AnimatedSlot({ isFilled, number, isSelectedTarget, onSelect, theme }) {
  const scale = useSharedValue(1);

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.92, { damping: 15, stiffness: 200 });
    })
    .onEnd(() => {
      if (onSelect) {
        runOnJS(onSelect)();
      }
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
        style={[
          styles.slot,
          animatedStyle,
          isFilled ? styles.slotFilled : styles.slotEmpty,
          isSelectedTarget && styles.slotActiveTarget,
          { 
            borderColor: isSelectedTarget ? theme.secondaryColor : Colors.outlineVariant,
          }
        ]}
      >
        {isFilled && (
          <Animated.Text 
            entering={FadeIn.duration(300)}
            style={[styles.slotText, { fontFamily: theme.fontFamily.accent, color: theme.primaryColor }]}
          >
            {number}
          </Animated.Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
}


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
  const hasAnswered = useRef(false);

  const totalSlots = problem?.choices?.length || 0;

  // Initialize available numbers when a new problem is provided
  useEffect(() => {
    if (problem?.choices) {
      setAvailableNumbers([...problem.choices]);
      setPlacedNumbers({});
      setSelectedNumber(null);
      hasAnswered.current = false;
    }
  }, [problem]);

  const handleAvailableNumberTap = (number) => {
    console.log('[OrderingEngine] Available number tapped:', number);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {
      console.warn('[OrderingEngine] Haptics error:', e);
    }
    
    if (selectedNumber === number) {
      setSelectedNumber(null);
    } else {
      setSelectedNumber(number);
    }
  };

  const handleSlotTap = (slotIndex) => {
    if (selectedNumber === null) return;
    if (placedNumbers[slotIndex] !== undefined) return;

    console.log('[OrderingEngine] Placing number into slot:', slotIndex);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      console.warn('[OrderingEngine] Haptics error:', e);
    }

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
    console.log('[OrderingEngine] handleCheck pressed');
    if (hasAnswered.current) return;
    hasAnswered.current = true;
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (e) {
      console.warn('[OrderingEngine] Haptics error:', e);
    }
    
    const placedOrder = [];
    for (let i = 0; i < totalSlots; i++) {
      if (placedNumbers[i] !== undefined) {
        placedOrder.push(placedNumbers[i]);
      }
    }

    const userAnswerStr = placedOrder.join(', ');
    const isCorrect = userAnswerStr === problem.answer;
    console.log('[OrderingEngine] Answer evaluation - isCorrect:', isCorrect);
    
    // Send standard validation shape back to Orchestrator
    try {
      onAnswer(isCorrect, userAnswerStr);
    } catch (e) {
      console.error('[OrderingEngine] onAnswer callback crash:', e);
    }
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
            <AnimatedSlot
              key={`slot-${index}`}
              isFilled={isFilled}
              number={placedVal}
              isSelectedTarget={selectedNumber !== null && !isFilled}
              theme={theme}
              onSelect={() => isFilled ? handlePlacedNumberTap(placedVal, index) : handleSlotTap(index)}
            />
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
            return (
              <AnimatedTile
                key={`avail-${num}`}
                number={num}
                isSelected={selectedNumber === num}
                theme={theme}
                onSelect={(n) => handleAvailableNumberTap(n)}
              />
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
            { backgroundColor: isComplete ? theme.primaryColor : Colors.surfaceContainer }
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
    width: '18%',
    aspectRatio: 1,
    minWidth: 64,
    maxWidth: 80,
    alignSelf: 'center',
    borderRadius: 16,
    borderWidth: 3,
    borderBottomWidth: 5,
    borderRightWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotEmpty: {
    borderStyle: 'dashed',
    backgroundColor: Colors.surfaceContainerLow,
  },
  slotFilled: {
    borderStyle: 'solid',
    backgroundColor: Colors.surface,
  },
  slotActiveTarget: {
    backgroundColor: Colors.primaryContainer,
    borderStyle: 'solid',
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
    width: 60,
    height: 60,
    borderRadius: 16,
    borderWidth: 3,
    borderBottomWidth: 5,
    borderRightWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
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
