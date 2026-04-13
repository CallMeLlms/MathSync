import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  withDelay,
  ZoomIn,
  FadeIn,
  FadeInDown,
  FadeInUp,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const KEY_COLORS = [
  '#FF7043', '#42A5F5', '#66BB6A', '#AB47BC', '#FFA726',
  '#26C6DA', '#EF5350', '#5C6BC0', '#8D6E63', '#78909C',
];

// ─── NumpadKey: A single number button ───
const NumpadKey = ({ value, onPress, disabled, color, index }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const tap = Gesture.Tap()
    .onBegin(() => {
      scale.value = withSpring(0.85, { damping: 8, stiffness: 400 });
    })
    .onEnd(() => {
      runOnJS(onPress)(value);
    })
    .onFinalize(() => {
      scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    })
    .enabled(!disabled);

  return (
    <Animated.View entering={ZoomIn.springify().delay(index * 40)}>
      <Animated.View style={animatedStyle}>
        <GestureDetector gesture={tap}>
          <Animated.View
            style={[
              styles.numKey,
              { backgroundColor: color, opacity: disabled ? 0.35 : 1 },
            ]}
          >
            <Text style={styles.numKeyText}>{value}</Text>
          </Animated.View>
        </GestureDetector>
      </Animated.View>
    </Animated.View>
  );
};

// ─── Blinking Cursor ───
const BlinkingCursor = () => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[styles.cursor, animatedStyle]} />;
};

// ─── NumpadEngine ───
const NumpadEngine = ({ data, onResult }) => {
  const { equation = {}, answer, maxDigits = 2 } = data;
  const { left = '', operator = '=', blank = 'right' } = equation;

  const [input, setInput] = useState('');
  const [answered, setAnswered] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  // Reset engine state when `data` changes (next question from Orchestrator)
  useEffect(() => {
    setInput('');
    setAnswered(false);
    setIsWrong(false);
  }, [data]);

  const displayScale = useSharedValue(1);
  const displayStyle = useAnimatedStyle(() => ({
    transform: [{ scale: displayScale.value }],
  }));

  const handleKeyPress = (digit) => {
    if (answered || input.length >= maxDigits) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsWrong(false);

    const newInput = input + String(digit);
    setInput(newInput);

    // Pop the display
    displayScale.value = withSequence(
      withSpring(1.08, { damping: 8, stiffness: 400 }),
      withSpring(1.0, { damping: 12, stiffness: 300 })
    );
  };

  const handleBackspace = () => {
    if (answered || input.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsWrong(false);
    setInput(input.slice(0, -1));
  };

  const handleCheckAnswer = () => {
    if (input.length === 0 || answered) return;

    const userAnswer = parseInt(input, 10);
    const correctAnswer = typeof answer === 'number' ? answer : parseInt(answer, 10);
    const isCorrect = userAnswer === correctAnswer;

    if (isCorrect) {
      setAnswered(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Only call onResult — the Orchestrator handles advancement via ResultModal
      setTimeout(() => onResult(true, [input]), 600);
    } else {
      setIsWrong(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      onResult(false, [input]);

      // Clear input after showing error
      setTimeout(() => {
        setInput('');
        setIsWrong(false);
      }, 1000);
    }
  };

  // Dynamic instruction text
  const getInstruction = () => {
    if (answered) return '✅ Correct!';
    if (isWrong) return 'Not quite — try again!';
    if (input.length > 0) return 'Tap Check when ready.';
    return 'Type your answer on the numpad.';
  };

  // Build display equation
  const renderEquation = () => {
    if (blank === 'right') {
      return (
        <View style={styles.equationRow}>
          <Text style={styles.equationText}>{left}</Text>
          <Text style={styles.equationOperator}>{operator}</Text>
          <Animated.View style={[styles.answerBox, displayStyle, isWrong && styles.answerBoxWrong, answered && styles.answerBoxCorrect]}>
            {input.length > 0 ? (
              <Text style={[styles.answerText, answered && styles.answerTextCorrect]}>
                {input}
              </Text>
            ) : (
              <BlinkingCursor />
            )}
          </Animated.View>
        </View>
      );
    }
    // blank === 'left': ___ = right side
    return (
      <View style={styles.equationRow}>
        <Animated.View style={[styles.answerBox, displayStyle, isWrong && styles.answerBoxWrong, answered && styles.answerBoxCorrect]}>
          {input.length > 0 ? (
            <Text style={[styles.answerText, answered && styles.answerTextCorrect]}>
              {input}
            </Text>
          ) : (
            <BlinkingCursor />
          )}
        </Animated.View>
        <Text style={styles.equationOperator}>{operator}</Text>
        <Text style={styles.equationText}>{left}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Equation Display */}
      <Animated.View entering={FadeInDown.springify().delay(100)} style={styles.equationCard}>
        {renderEquation()}
      </Animated.View>

      {/* Instruction Text */}
      <Animated.Text
        entering={FadeIn.delay(200)}
        style={[
          styles.instructionText,
          isWrong && { color: Colors.error },
          answered && { color: Colors.success },
        ]}
      >
        {getInstruction()}
      </Animated.Text>

      {/* Number Pad */}
      <Animated.View entering={FadeInUp.springify().delay(150)} style={styles.numpadContainer}>
        {/* Row 1: 1-5 */}
        <View style={styles.numpadRow}>
          {[1, 2, 3, 4, 5].map((n, i) => (
            <NumpadKey
              key={`key-${n}`}
              value={n}
              index={i}
              color={KEY_COLORS[n - 1]}
              onPress={handleKeyPress}
              disabled={answered || input.length >= maxDigits}
            />
          ))}
        </View>

        {/* Row 2: 6-0 */}
        <View style={styles.numpadRow}>
          {[6, 7, 8, 9, 0].map((n, i) => (
            <NumpadKey
              key={`key-${n}`}
              value={n}
              index={i + 5}
              color={KEY_COLORS[n === 0 ? 9 : n - 1]}
              onPress={handleKeyPress}
              disabled={answered || input.length >= maxDigits}
            />
          ))}
        </View>

        {/* Row 3: Backspace + Check */}
        <View style={styles.actionRow}>
          <GestureDetector
            gesture={Gesture.Tap()
              .onEnd(() => runOnJS(handleBackspace)())
              .enabled(!answered && input.length > 0)
            }
          >
            <Animated.View
              style={[
                styles.actionButton,
                styles.backspaceButton,
                { opacity: input.length === 0 || answered ? 0.4 : 1 },
              ]}
            >
              <Ionicons
                name="backspace-outline"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>
                Delete
              </Text>
            </Animated.View>
          </GestureDetector>

          {input.length > 0 && !answered && (
            <GestureDetector
              gesture={Gesture.Tap()
                .onEnd(() => runOnJS(handleCheckAnswer)())
              }
            >
              <Animated.View entering={ZoomIn.springify()} style={[styles.actionButton, styles.submitButton]}>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Check</Text>
              </Animated.View>
            </GestureDetector>
          )}
        </View>
      </Animated.View>
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
    gap: 14,
  },
  equationCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
  },
  equationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  equationText: {
    fontFamily: 'Lexend-Black',
    fontSize: SCREEN_HEIGHT * 0.042,
    color: Colors.onSurface,
  },
  equationOperator: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: SCREEN_HEIGHT * 0.035,
    color: Colors.onSurfaceVariant,
  },
  answerBox: {
    minWidth: SCREEN_WIDTH * 0.2,
    minHeight: SCREEN_HEIGHT * 0.065,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderStyle: 'dashed',
  },
  answerBoxWrong: {
    borderColor: Colors.error,
    backgroundColor: 'rgba(186,26,26,0.08)',
    borderStyle: 'solid',
  },
  answerBoxCorrect: {
    borderColor: Colors.success,
    backgroundColor: 'rgba(0,110,42,0.08)',
    borderStyle: 'solid',
  },
  answerText: {
    fontFamily: 'Lexend-Black',
    fontSize: SCREEN_HEIGHT * 0.042,
    color: Colors.onSurface,
  },
  answerTextCorrect: {
    color: Colors.success,
  },
  instructionText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: SCREEN_HEIGHT * 0.016,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  cursor: {
    width: 3,
    height: SCREEN_HEIGHT * 0.04,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  numpadContainer: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 24,
    padding: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  numKey: {
    width: (SCREEN_WIDTH - 96) / 5,
    height: (SCREEN_WIDTH - 96) / 5,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numKeyText: {
    fontFamily: 'Lexend-Black',
    fontSize: SCREEN_HEIGHT * 0.032,
    color: '#FFFFFF',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 26,
    borderRadius: 20,
  },
  backspaceButton: {
    backgroundColor: Colors.secondary,
  },
  submitButton: {
    backgroundColor: Colors.success,
  },
  actionButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: SCREEN_HEIGHT * 0.017,
    color: '#FFFFFF',
  },
});

export default NumpadEngine;
