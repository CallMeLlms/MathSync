import { View, Text, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  withRepeat,
  ZoomIn,
  FadeIn,
  FadeInDown,
  FadeInUp,
  runOnJS,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

// ─── NumpadKey: A single bulky tactile button ───
const NumpadKey = ({ value, onPress, disabled, index }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    translateY.value = withSpring(4, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(2, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (disabled) return;
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(6, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (disabled) return;
    onPress(value);
  };

  return (
    <Animated.View 
      entering={ZoomIn.springify().delay(index * 30)} 
      style={styles.numKeyWrapper}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{ flex: 1 }}
      >
        <Animated.View 
          style={[
            styles.numKey, 
            animatedStyle, 
            { opacity: disabled ? 0.35 : 1 }
          ]}
        >
          <Text style={styles.numKeyText}>{value}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ─── BackspaceKey ───
const BackspaceKey = ({ onPress, disabled }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    translateY.value = withSpring(4, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(2, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    if (disabled) return;
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(6, { damping: 15, stiffness: 300 });
  };

  return (
    <View style={styles.numKeyWrapper}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={[
            styles.numKey,
            styles.backspaceKey,
            animatedStyle,
            { opacity: disabled ? 0.35 : 1 },
          ]}
        >
          <Ionicons name="backspace-outline" size={26} color={Colors.onSurfaceVariant} />
        </Animated.View>
      </Pressable>
    </View>
  );
};

// ─── BlinkingCursor ───
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

// ─── CheckButton: Full-width solid primary CTA ───
const CheckButton = ({ onPress, disabled }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;
    translateY.value = withSpring(4);
    bottomWidth.value = withSpring(2);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    translateY.value = withSpring(0);
    bottomWidth.value = withSpring(6);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={{ width: '100%' }}
    >
      <Animated.View
        entering={FadeIn.delay(200)}
        style={[
          disabled ? styles.checkButtonDisabled : styles.checkButton,
          animatedStyle,
        ]}
      >
        <Text style={[styles.checkButtonText, disabled && { color: Colors.onSurfaceVariant }]}>CHECK</Text>
      </Animated.View>
    </Pressable>
  );
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

  const shakeX = useSharedValue(0);
  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
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

      // Shake animation for wrong answer
      shakeX.value = withSequence(
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-8, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );

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
    const answerBoxContent = input.length > 0 ? (
      <Text style={[styles.answerText, answered && styles.answerTextCorrect]}>
        {input}
      </Text>
    ) : (
      <BlinkingCursor />
    );

    const answerBox = (
      <Animated.View
        style={[
          styles.answerBox,
          displayStyle,
          shakeStyle,
          isWrong && styles.answerBoxWrong,
          answered && styles.answerBoxCorrect,
        ]}
      >
        {answerBoxContent}
      </Animated.View>
    );

    if (blank === 'right') {
      return (
        <View style={styles.equationRow}>
          <Text style={styles.equationText}>{left}</Text>
          <Text style={styles.equationOperator}>{operator}</Text>
          {answerBox}
        </View>
      );
    }

    // blank === 'left': ___ = right side
    return (
      <View style={styles.equationRow}>
        {answerBox}
        <Text style={styles.equationOperator}>{operator}</Text>
        <Text style={styles.equationText}>{left}</Text>
      </View>
    );
  };

  const keysDisabled = answered || input.length >= maxDigits;

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

      {/* Numpad — 3x4 Bulky Grid */}
      <Animated.View entering={FadeInUp.springify().delay(150)} style={styles.numpadContainer}>
        {/* Row 1: 1-3 */}
        <View style={styles.numpadRow}>
          {[1, 2, 3].map((n, i) => (
            <NumpadKey key={`key-${n}`} value={n} index={i} onPress={handleKeyPress} disabled={keysDisabled} />
          ))}
        </View>
        {/* Row 2: 4-6 */}
        <View style={styles.numpadRow}>
          {[4, 5, 6].map((n, i) => (
            <NumpadKey key={`key-${n}`} value={n} index={i + 3} onPress={handleKeyPress} disabled={keysDisabled} />
          ))}
        </View>
        {/* Row 3: 7-9 */}
        <View style={styles.numpadRow}>
          {[7, 8, 9].map((n, i) => (
            <NumpadKey key={`key-${n}`} value={n} index={i + 6} onPress={handleKeyPress} disabled={keysDisabled} />
          ))}
        </View>
        {/* Row 4: Empty - 0 - Backspace */}
        <View style={styles.numpadRow}>
          <View style={styles.emptyKey} />
          <NumpadKey key="key-0" value={0} index={9} onPress={handleKeyPress} disabled={keysDisabled} />
          <BackspaceKey onPress={handleBackspace} disabled={answered || input.length === 0} />
        </View>
      </Animated.View>

      {/* Full-Width Check Button */}
      <CheckButton onPress={handleCheckAnswer} disabled={input.length === 0 || answered} />
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
    paddingBottom: 16,
    gap: 14,
  },
  equationCard: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
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
    fontSize: 36,
    color: Colors.onSurface,
  },
  equationOperator: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 28,
    color: Colors.onSurfaceVariant,
  },
  answerBox: {
    minWidth: 80,
    minHeight: 56,
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 3,
    borderColor: Colors.primary,
    borderRadius: 16,
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
    fontSize: 36,
    color: Colors.onSurface,
  },
  answerTextCorrect: {
    color: Colors.success,
  },
  instructionText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  cursor: {
    width: 3,
    height: 32,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },

  // ─── Bulky Numpad (Duolingo-style) ───
  numpadContainer: {
    width: '100%',
    paddingHorizontal: 16,
    gap: 2,
    marginTop: 'auto',
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Ensures equal spacing
    gap: 12,
    marginBottom: 12, // Vertical gap between rows
  },
  numKey: {
    flex: 1, // This is key
    // Removed maxWidth to let flex handle sizing
    aspectRatio: 1 / 0.85, // Slightly wider than tall for that "bulky" look
    backgroundColor: Colors.surfaceContainerLowest, 
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E5E5', 
    // The "Depth" - Increase this for the Duolingo look
    borderBottomWidth: 6, 
    borderBottomColor: '#D5D4D4',
  },
  numKeyWrapper: {
    flex: 1, // Added this style for the Animated wrapper
  },
  emptyKey: {
    flex: 1,
  },

  numKeyText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 26,
    color: Colors.onSurface,
  }, 

  // ─── Check CTA (Duolingo-style: grey → green) ───
  checkButton: {
    width: '100%',
    backgroundColor: Colors.success,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00531e',
    borderBottomWidth: 6,
    borderBottomColor: '#00531e',
  },
  checkButtonDisabled: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.outlineVariant,
    borderBottomColor: Colors.outlineVariant,
  },
  checkButtonText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: '#fff',
    letterSpacing: 1.2,
  },
});

export default NumpadEngine;
