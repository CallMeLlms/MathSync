import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, useSharedValue, LinearTransition, FadeIn, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

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
      if (onSelect) runOnJS(onSelect)(number);
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
          },
        ]}
      >
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          minimumFontScale={0.7}
          style={[
            styles.choiceText,
            { fontFamily: theme.fontFamily.accent, color: isSelected ? Colors.surface : Colors.onSurface },
          ]}
        >
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
      if (onSelect) runOnJS(onSelect)();
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const displayString = isFilled ? formatDecimalWithPrecision(number, displayPrecision) : '';

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          styles.slot,
          animatedStyle,
          isFilled ? styles.slotFilled : styles.slotEmpty,
          isSelectedTarget && styles.slotActiveTarget,
          { borderColor: isSelectedTarget ? theme.secondaryColor : Colors.outlineVariant },
        ]}
      >
        {isFilled && (
          <Animated.Text
            entering={FadeIn.duration(300)}
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.7}
            style={[styles.slotText, { fontFamily: theme.fontFamily.accent, color: theme.primaryColor }]}
          >
            {displayString}
          </Animated.Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
}

export default function DecimalOrderingEngine({ problem, onAnswer, theme }) {
  const [availableNumbers, setAvailableNumbers] = useState([]);
  const [placedNumbers, setPlacedNumbers] = useState({});
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [useAlignmentHelper, setUseAlignmentHelper] = useState(false);
  const hasAnswered = useRef(false);

  const totalSlots = problem?.choices?.length || 0;

  useEffect(() => {
    if (problem?.choices) {
      setAvailableNumbers([...problem.choices]);
      setPlacedNumbers({});
      setSelectedNumber(null);
      setUseAlignmentHelper(false);
      hasAnswered.current = false;
    }
  }, [problem]);

  const handleAvailableNumberTap = (number) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    setSelectedNumber(prev => prev === number ? null : number);
  };

  const handleSlotTap = (slotIndex) => {
    if (selectedNumber === null || placedNumbers[slotIndex] !== undefined) return;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    setPlacedNumbers(prev => ({ ...prev, [slotIndex]: selectedNumber }));
    setAvailableNumbers(prev => prev.filter(n => n !== selectedNumber));
    setSelectedNumber(null);
  };

  const handlePlacedNumberTap = (number, slotIndex) => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    setPlacedNumbers(prev => {
      const next = { ...prev };
      delete next[slotIndex];
      return next;
    });
    setAvailableNumbers(prev => [...prev, number]);
  };

  const handleReset = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (e) {}
    if (problem?.choices) {
      setAvailableNumbers([...problem.choices]);
      setPlacedNumbers({});
      setSelectedNumber(null);
    }
  };

  const toggleHelper = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch (e) {}
    setUseAlignmentHelper(prev => !prev);
  };

  const handleCheck = () => {
    if (hasAnswered.current) return;
    hasAnswered.current = true;
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch (e) {}

    const placedOrder = [];
    for (let i = 0; i < totalSlots; i++) {
      if (placedNumbers[i] !== undefined) placedOrder.push(placedNumbers[i]);
    }
    const userAnswerStr = placedOrder.join(', ');
    const isCorrect = userAnswerStr === problem.answer;

    try {
      onAnswer(isCorrect, userAnswerStr);
    } catch (e) {
      console.error('[DecimalOrderingEngine] onAnswer crash:', e);
    }
  };

  const isComplete = Object.keys(placedNumbers).length === totalSlots;

  if (!problem) return null;

  const maxPlaces = Math.max(
    ...(problem.choices || []).map(numStr => {
      const parts = numStr.split('.');
      return parts.length > 1 ? parts[1].length : 0;
    }),
    2
  );
  const displayPadding = useAlignmentHelper ? maxPlaces : 0;

  return (
    <View style={styles.container}>
      {/* Question — full width, centered */}
      <Text style={[styles.questionText, { fontFamily: theme.fontFamily.title, color: theme.primaryColor }]}>
        {problem.metadata.displayQuestion}
      </Text>

      {/* Align Zeros toggle — its own centered row */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.helperBtn,
            useAlignmentHelper
              ? { backgroundColor: theme.primaryColor, borderColor: theme.primaryColor }
              : { borderColor: Colors.outlineVariant },
          ]}
          onPress={toggleHelper}
        >
          <Text
            style={[
              styles.helperText,
              { fontFamily: theme.fontFamily.accent, color: useAlignmentHelper ? Colors.surface : Colors.onSurfaceVariant },
            ]}
          >
            {useAlignmentHelper ? 'Align Zeros: ON' : 'Align Zeros: OFF'}
          </Text>
        </TouchableOpacity>
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
          {selectedNumber ? 'Tap an empty slot above' : 'Tap a decimal to select'}
        </Text>
        <View style={styles.choicesGrid}>
          {availableNumbers.map(num => (
            <AnimatedTile
              key={`avail-${num}`}
              number={num}
              isSelected={selectedNumber === num}
              displayPrecision={displayPadding}
              theme={theme}
              onSelect={handleAvailableNumberTap}
            />
          ))}
        </View>
      </View>

      {/* Controls */}
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
            { backgroundColor: isComplete ? theme.primaryColor : Colors.surfaceContainer },
          ]}
          onPress={handleCheck}
          disabled={!isComplete}
        >
          <Text
            style={[
              styles.checkBtnText,
              { fontFamily: theme.fontFamily.accent, color: isComplete ? Colors.surface : Colors.onSurfaceVariant },
            ]}
          >
            Check Order
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
  questionText: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  toggleRow: {
    alignItems: 'center',
    marginBottom: 24,
  },
  helperBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 4,
  },
  helperText: {
    fontSize: 13,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  slot: {
    minWidth: 88,
    height: 68,
    paddingHorizontal: 8,
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
    width: '100%',
    textAlign: 'center',
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
    minWidth: 88,
    height: 68,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 3,
    borderBottomWidth: 6,
    borderRightWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 22,
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
  },
});
