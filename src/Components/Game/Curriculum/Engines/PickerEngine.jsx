/**
 * PickerEngine — Simple Multiple-Choice Engine
 *
 * Renders a question prompt and a grid of tappable option tiles.
 * The student picks one answer from `metadata.options`.
 *
 * Data contract (from Orchestrator `data` prop):
 *   {
 *     question: "Which shape has 4 corners?",
 *     answer: "square" | 4,           // string or number
 *     metadata: { options: ["square", "circle", "triangle"] }
 *   }
 *
 * Props: { data, onResult } (standard Orchestrator API)
 */

import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  ZoomIn,
  FadeIn,
  FadeInDown,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const OPTION_COLORS = [
  '#FF7043', '#42A5F5', '#66BB6A', '#AB47BC',
  '#FFA726', '#26C6DA', '#EF5350', '#5C6BC0',
];

// ─── OptionTile ───
const OptionTile = ({ label, color, index, isSelected, isCorrect, isWrong, disabled, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.92, { damping: 8, stiffness: 400 });
    })
    .onEnd(() => {
      runOnJS(onPress)(label);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    })
    .enabled(!disabled);

  const borderColor = isCorrect
    ? Colors.success
    : isWrong
      ? Colors.error
      : isSelected
        ? Colors.primary
        : Colors.outlineVariant;

  const bgColor = isCorrect
    ? 'rgba(76,175,80,0.12)'
    : isWrong
      ? 'rgba(211,47,47,0.08)'
      : isSelected
        ? Colors.primaryContainer
        : Colors.surfaceContainerLowest;

  return (
    <Animated.View
      entering={ZoomIn.springify().delay(index * 80)}
      style={animatedStyle}
    >
      <GestureDetector gesture={tap}>
        <Animated.View
          style={[
            styles.optionTile,
            {
              backgroundColor: bgColor,
              borderColor: borderColor,
              borderWidth: isSelected || isCorrect || isWrong ? 3 : 2,
            },
          ]}
        >
          <View style={[styles.optionDot, { backgroundColor: color }]} />
          <Text
            style={[
              styles.optionText,
              isCorrect && { color: Colors.success },
              isWrong && { color: Colors.error },
            ]}
            numberOfLines={2}
            adjustsFontSizeToFit
          >
            {String(label)}
          </Text>
          {isCorrect && (
            <Ionicons name="checkmark-circle" size={22} color={Colors.success} style={styles.optionIcon} />
          )}
          {isWrong && (
            <Ionicons name="close-circle" size={22} color={Colors.error} style={styles.optionIcon} />
          )}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

// ─── PickerEngine ───
const PickerEngine = ({ data, onResult }) => {
  const { question: questionText, answer, metadata = {} } = data;
  const options = metadata.options || [];

  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrectResult, setIsCorrectResult] = useState(false);

  // Shuffle options once per question
  const shuffledOptions = useMemo(
    () => [...options].sort(() => Math.random() - 0.5),
    [data]
  );

  // Reset on question change
  useEffect(() => {
    setSelected(null);
    setAnswered(false);
    setIsCorrectResult(false);
  }, [data]);

  // Speak the question
  useEffect(() => {
    if (questionText) {
      const timer = setTimeout(() => speechManager.speakInstruction(questionText), 400);
      return () => { clearTimeout(timer); speechManager.stop(); };
    }
  }, [questionText]);

  const handleSelect = (option) => {
    if (answered) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(option);
  };

  const handleCheckAnswer = () => {
    if (selected === null || answered) return;

    const normalizedSelected = String(selected).toLowerCase().trim();
    const normalizedAnswer = String(answer).toLowerCase().trim();
    const isCorrect = normalizedSelected === normalizedAnswer;

    setAnswered(true);
    setIsCorrectResult(isCorrect);

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Correct!', true);
      setTimeout(() => onResult(true, [String(selected)]), 700);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Try again!', false);
      onResult(false, [String(selected)]);
      // Reset after showing error
      setTimeout(() => {
        setSelected(null);
        setAnswered(false);
        setIsCorrectResult(false);
      }, 1200);
    }
  };

  const getInstruction = () => {
    if (answered && isCorrectResult) return '✅ Correct!';
    if (answered && !isCorrectResult) return 'Not quite — try again!';
    if (selected !== null) return 'Tap Check when ready.';
    return 'Tap your answer.';
  };

  // Gesture for the check button
  const checkTap = Gesture.Tap()
    .enabled(selected !== null && !answered)
    .onEnd(() => runOnJS(handleCheckAnswer)());

  return (
    <View style={styles.container}>
      {/* Question Display */}
      <Animated.View entering={FadeInDown.springify().delay(100)} style={styles.questionCard}>
        <Text style={styles.questionText}>{questionText || 'Pick the correct answer.'}</Text>
        <Animated.Text
          entering={FadeIn.delay(200)}
          style={[
            styles.instructionText,
            answered && isCorrectResult && { color: Colors.success },
            answered && !isCorrectResult && { color: Colors.error },
          ]}
        >
          {getInstruction()}
        </Animated.Text>
      </Animated.View>

      {/* Options Grid */}
      <View style={styles.optionsGrid}>
        {shuffledOptions.map((opt, idx) => {
          const isThisSelected = selected !== null && String(selected) === String(opt);
          const isCorrect = answered && isCorrectResult && isThisSelected;
          const isWrong = answered && !isCorrectResult && isThisSelected;

          return (
            <OptionTile
              key={`opt-${idx}`}
              label={opt}
              color={OPTION_COLORS[idx % OPTION_COLORS.length]}
              index={idx}
              isSelected={isThisSelected && !answered}
              isCorrect={isCorrect}
              isWrong={isWrong}
              disabled={answered}
              onPress={handleSelect}
            />
          );
        })}
      </View>

      {/* Check Button */}
      <View style={styles.footer}>
        {selected !== null && !answered && (
          <GestureDetector gesture={checkTap}>
            <Animated.View entering={ZoomIn.springify()} style={styles.checkButton}>
              <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
              <Text style={styles.checkButtonText}>Check Answer</Text>
            </Animated.View>
          </GestureDetector>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 16,
  },
  questionCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    gap: 8,
  },
  questionText: {
    fontFamily: 'Lexend-Bold',
    fontSize: SCREEN_HEIGHT * 0.024,
    color: Colors.onSurface,
    textAlign: 'center',
  },
  instructionText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: SCREEN_HEIGHT * 0.015,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  optionsGrid: {
    width: '100%',
    gap: 10,
  },
  optionTile: {
    width: '100%',
    minHeight: SCREEN_HEIGHT * 0.075,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 12,
  },
  optionDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  optionText: {
    fontFamily: 'Lexend-Bold',
    fontSize: SCREEN_HEIGHT * 0.021,
    color: Colors.onSurface,
    flex: 1,
  },
  optionIcon: {
    marginLeft: 'auto',
  },
  footer: {
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 20,
    minHeight: 44,
    minWidth: 44,
    gap: 8,
  },
  checkButtonText: {
    fontFamily: 'Lexend-Bold',
    color: '#FFFFFF',
    fontSize: SCREEN_HEIGHT * 0.019,
  },
});

export default PickerEngine;
