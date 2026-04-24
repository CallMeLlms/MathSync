import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  ZoomIn,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

// ─── SequenceTile ───
const SequenceTile = ({ item, isBlank, filledValue, evaluation, index }) => {
  const scale = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (isBlank) {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.35, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        false
      );
    } else {
      pulseOpacity.value = 1;
    }
  }, [isBlank]);

  useEffect(() => {
    if (filledValue) {
      scale.value = withSpring(1.15, { damping: 8, stiffness: 300 }, () => {
        scale.value = withSpring(1, { damping: 12, stiffness: 260 });
      });
    }
  }, [filledValue]);

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));

  const tileColor = () => {
    if (!isBlank) return Colors.surfaceContainerLow;
    if (evaluation === 'correct') return '#e8f5e9';
    if (evaluation === 'wrong') return '#ffebee';
    return Colors.secondaryContainer;
  };

  const borderColor = () => {
    if (!isBlank) return Colors.outlineVariant;
    if (evaluation === 'correct') return Colors.success;
    if (evaluation === 'wrong') return Colors.error;
    return Colors.secondary;
  };

  const displayContent = isBlank ? (filledValue || '?') : item;

  return (
    <Animated.View
      entering={ZoomIn.springify().delay(index * 60)}
      style={[scaleStyle, styles.sequenceTileWrapper]}
    >
      <Animated.View
        style={[
          styles.sequenceTile,
          { backgroundColor: tileColor(), borderColor: borderColor() },
          isBlank && !filledValue && pulseStyle,
        ]}
      >
        <Text style={[styles.sequenceTileText, isBlank && filledValue && styles.filledTileText]}>
          {displayContent}
        </Text>
        {isBlank && evaluation === 'correct' && (
          <Animated.View entering={ZoomIn.springify()} style={styles.tileBadge}>
            <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
          </Animated.View>
        )}
        {isBlank && evaluation === 'wrong' && (
          <Animated.View entering={ZoomIn.springify()} style={styles.tileBadge}>
            <Ionicons name="close-circle" size={14} color={Colors.error} />
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
};

// ─── OptionTile ───
const OptionTile = ({ value, index, isSelected, evaluation, disabled, onPress }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(5);
  const shakeX = useSharedValue(0);

  const isWrong = isSelected && evaluation === 'wrong';

  useEffect(() => {
    if (isWrong) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 55 }),
        withTiming(8,  { duration: 55 }),
        withTiming(-5, { duration: 45 }),
        withTiming(5,  { duration: 45 }),
        withTiming(0,  { duration: 35 })
      );
    }
  }, [isWrong]);

  const state = evaluation ? (isSelected ? evaluation : 'idle') : (isSelected ? 'selected' : 'idle');

  const palette = {
    idle:     { border: Colors.outlineVariant,     bg: Colors.surfaceContainerLowest, text: Colors.onSurface },
    selected: { border: Colors.secondary,           bg: Colors.secondaryContainer,     text: Colors.onSecondaryContainer },
    correct:  { border: Colors.success,             bg: '#e8f5e9',                     text: Colors.success },
    wrong:    { border: Colors.error,               bg: '#ffebee',                     text: Colors.error },
  }[state];

  const sinkStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <Animated.View
      entering={ZoomIn.springify().delay(index * 70)}
      style={[styles.optionTileWrapper, shakeStyle]}
    >
      <Pressable
        onPress={() => !disabled && onPress(value)}
        onPressIn={() => {
          if (disabled) return;
          translateY.value = withSpring(4, { damping: 15, stiffness: 300 });
          bottomWidth.value = withSpring(2, { damping: 15, stiffness: 300 });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          if (disabled) return;
          translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
          bottomWidth.value = withSpring(5, { damping: 15, stiffness: 300 });
        }}
        disabled={disabled}
      >
        <Animated.View
          style={[
            styles.optionTile,
            sinkStyle,
            { backgroundColor: palette.bg, borderColor: palette.border },
          ]}
        >
          <Text style={[styles.optionTileText, { color: palette.text }]}>{value}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ─── CheckButton ───
const CheckButton = ({ onPress, disabled, label = 'CHECK' }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  return (
    <View style={styles.checkButtonContainer}>
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          if (disabled) return;
          translateY.value = withSpring(4);
          bottomWidth.value = withSpring(2);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        onPressOut={() => {
          translateY.value = withSpring(0);
          bottomWidth.value = withSpring(6);
        }}
        disabled={disabled}
        style={{ width: '100%' }}
      >
        <Animated.View
          style={[styles.checkButton, animatedStyle, disabled && styles.checkButtonDisabled]}
        >
          <Text style={[styles.checkButtonText, disabled && styles.checkButtonTextDisabled]}>
            {label}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

// ─── PatternSequenceEngine ───
const PatternSequenceEngine = ({ data, onResult }) => {
  const { question: questionText, answer, sequence = [], options = [] } = data;

  const [selectedOption, setSelectedOption] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [resolved, setResolved] = useState(false);

  const shuffledOptions = useMemo(
    () => [...options].sort(() => Math.random() - 0.5),
    [data]
  );

  useEffect(() => {
    setSelectedOption(null);
    setEvaluation(null);
    setResolved(false);
  }, [data]);

  useEffect(() => {
    if (!questionText) return;
    const timer = setTimeout(() => speechManager.speakInstruction(questionText), 400);
    return () => { clearTimeout(timer); speechManager.stop(); };
  }, [questionText]);

  const handleCheck = () => {
    if (!selectedOption || resolved) return;

    const isCorrect =
      String(selectedOption).trim() === String(answer).trim();

    if (isCorrect) {
      setEvaluation('correct');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Correct!', true);
      setTimeout(() => onResult(true, [String(selectedOption)]), 900);
    } else {
      setEvaluation('wrong');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Try again!', false);
      setTimeout(() => onResult(false, [String(selectedOption)]), 1100);
    }
  };

  return (
    <View style={styles.container}>
      {/* Pattern strip */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.sequenceStrip}>
        {sequence.map((item, idx) => {
          const isBlank = item === '?';
          return (
            <SequenceTile
              key={idx}
              index={idx}
              item={item}
              isBlank={isBlank}
              filledValue={isBlank ? selectedOption : null}
              evaluation={isBlank ? evaluation : null}
            />
          );
        })}
      </Animated.View>

      {/* Hint label */}
      <Animated.View entering={FadeIn.delay(300)} style={styles.hintPill}>
        <Text style={styles.hintText}>Tap an answer below</Text>
      </Animated.View>

      {/* Option grid */}
      <View style={styles.optionGrid}>
        {shuffledOptions.map((opt, idx) => (
          <OptionTile
            key={opt}
            value={opt}
            index={idx}
            isSelected={selectedOption === opt}
            evaluation={selectedOption === opt ? evaluation : null}
            disabled={resolved}
            onPress={(val) => {
              if (resolved) return;
              setSelectedOption(val);
            }}
          />
        ))}
      </View>

      <CheckButton
        onPress={handleCheck}
        disabled={!selectedOption || resolved || !!evaluation}
        label={resolved && evaluation === 'correct' ? 'GREAT JOB! 🎉' : 'CHECK'}
      />
    </View>
  );
};

export default PatternSequenceEngine;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sequenceStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    width: '100%',
    minHeight: 100,
  },
  sequenceTileWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sequenceTile: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  sequenceTileText: {
    fontSize: 26,
    fontFamily: 'Lexend-Bold',
    color: Colors.onSurface,
    textAlign: 'center',
  },
  filledTileText: {
    fontSize: 26,
  },
  tileBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  hintPill: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  hintText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    width: '100%',
  },
  optionTileWrapper: {
    width: '44%',
  },
  optionTile: {
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTileText: {
    fontSize: 30,
    fontFamily: 'Lexend-Bold',
    textAlign: 'center',
  },
  checkButtonContainer: {
    width: '100%',
    marginTop: 8,
  },
  checkButton: {
    width: '100%',
    backgroundColor: Colors.tertiary,
    borderColor: '#004d1e',
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonDisabled: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderColor: Colors.outlineVariant,
  },
  checkButtonText: {
    fontFamily: 'Lexend-Black',
    fontSize: 18,
    color: '#fff',
    letterSpacing: 1.2,
  },
  checkButtonTextDisabled: {
    color: Colors.onSurfaceVariant,
    opacity: 0.5,
  },
});
