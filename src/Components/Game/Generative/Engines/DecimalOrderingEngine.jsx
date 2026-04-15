import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, LinearTransition, FadeIn, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

// Helper to format decimal precision
const formatDecimalWithPrecision = (valStr, padTo = 0) => {
  if (!padTo) return valStr;
  const num = parseFloat(valStr);
  if (isNaN(num)) return valStr;
  return num.toFixed(padTo);
};

function AnimatedTile({ number, isSelected, displayPrecision, onSelect, theme }) {
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

  const displayString = formatDecimalWithPrecision(number, displayPrecision);

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
          {displayString}
        </Text>
      </Animated.View>
    </GestureDetector>
  );
}

function AnimatedSlot({ isFilled, number, isSelectedTarget, displayPrecision, onSelect, theme }) {
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

  const displayString = isFilled ? formatDecimalWithPrecision(number, displayPrecision) : "";

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
            {displayString}
          </Animated.Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * DecimalOrderingEngine
 * A specialized ordering engine that supports decimal padding/precision helpers.
 */
export default function DecimalOrderingEngine({ problem, onAnswer, theme }) {
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [placedNumbers, setPlacedNumbers] = useState({});
  const [selectedNumber, setSelectedNumber] = useState(null);
  
  // Custom Decimal Feature: The Zero Alignment Helper
  const [useAlignmentHelper, setUseAlignmentHelper] = useState(false);

  const totalSlots = problem?.choices?.length || 0;

  useEffect(() => {
    if (problem?.choices) {
      setAvailableNumbers([...problem.choices]);
      setPlacedNumbers({});
      setSelectedNumber(null);
      setUseAlignmentHelper(false);
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

  const toggleHelper = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUseAlignmentHelper(prev => !prev);
  }

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

  // Determine max decimal places in the problem choices to know what to pad to
  const maxPlaces = Math.max(...(problem.choices || []).map(numStr => {
    const parts = numStr.split('.');
    return parts.length > 1 ? parts[1].length : 0;
  }), 2); // Default to at least hundredths

  // 0 means original string, >0 means parsed and fixed
  const displayPadding = useAlignmentHelper ? maxPlaces : 0;

  return (
    <View style={styles.container}>
      {/* Dynamic Header & Helper Toggle */}
      <View style={styles.headerRow}>
         <View style={{flex: 1}} />
         <View style={{flex: 2}}>
            <Text style={[styles.questionText, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}>
              {problem.metadata.displayQuestion}
            </Text>
         </View>
         <View style={{flex: 1, alignItems: 'flex-end'}}>
             <TouchableOpacity 
               style={[
                 styles.helperBtn, 
                 useAlignmentHelper ? { backgroundColor: theme.primaryColor, borderColor: theme.primaryColor } : { borderColor: Colors.outlineVariant }
               ]}
               onPress={toggleHelper}
             >
                <Text style={[
                  styles.helperText, 
                  { 
                    fontFamily: theme.fontFamily.accent, 
                    color: useAlignmentHelper ? Colors.surface : Colors.onSurfaceVariant 
                  }
                ]}>
                  Padding = {useAlignmentHelper ? "ON" : "OFF"}
                </Text>
             </TouchableOpacity>
         </View>
      </View>

      {/* Drop Slots */}
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
              displayPrecision={displayPadding}
              theme={theme}
              onSelect={() => isFilled ? handlePlacedNumberTap(placedVal, index) : handleSlotTap(index)}
            />
          );
        })}
      </View>

      {/* Available Decimals */}
      <View style={styles.availableContainer}>
        <Text style={[styles.instructionText, { fontFamily: theme.fontFamily.body }]}>
          {selectedNumber 
            ? "Tap an empty slot above" 
            : "Tap a decimal to select"}
        </Text>
        
        <View style={styles.choicesGrid}>
          {availableNumbers.map((num) => {
            return (
              <AnimatedTile
                key={`avail-${num}`}
                number={num}
                isSelected={selectedNumber === num}
                displayPrecision={displayPadding}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  questionText: {
    fontSize: 24,
    textAlign: 'center',
  },
  helperBtn: {
     paddingHorizontal: 12,
     paddingVertical: 8,
     borderRadius: 16,
     borderWidth: 2,
     borderBottomWidth: 4,
  },
  helperText: {
     fontSize: 12,
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
    minWidth: 80, // slightly wider for decimals
    maxWidth: 100,
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
    fontSize: 24,
  },
  availableContainer: {
    flex: 1,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
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
    width: 80, // slightly wider for decimals
    height: 80,
    borderRadius: 16,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderRightWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 24,
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
    borderBottomWidth: 4,
  },
  resetBtnText: {
    fontSize: 16,
    color: Colors.onSurface,
  },
  checkBtn: {
    borderBottomWidth: 6,
  },
  checkBtnText: {
    fontSize: 16,
  }
});
