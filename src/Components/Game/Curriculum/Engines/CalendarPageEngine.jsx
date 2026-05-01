import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  ZoomIn,
  FadeIn,
  Layout,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';
import QuestionHeader from '@/Components/Game/Global/QuestionHeader';

const CONFETTI = ['🎉', '⭐', '📅', '✨', '🌟', '🎊'];

// ─── CalendarCard ───
const CalendarCard = ({ label, index, isSelected, evaluation, disabled, onPress }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);
  const scale = useSharedValue(1);
  const shakeX = useSharedValue(0);

  const state = evaluation || (isSelected ? 'selected' : 'idle');
  const isWrong = isSelected && evaluation === 'wrong';

  const colors = {
    idle:     { border: Colors.outlineVariant,      bg: Colors.surfaceContainerLowest,  text: Colors.onSurface,             torn: Colors.surfaceContainerHigh },
    selected: { border: Colors.secondary,            bg: Colors.secondaryContainer,      text: Colors.onSecondaryContainer,  torn: '#b8c8ee' },
    correct:  { border: Colors.success,              bg: '#e8f5e9',                      text: Colors.success,               torn: '#c8e6c9' },
    wrong:    { border: Colors.error,                bg: '#ffebee',                      text: Colors.error,                 torn: '#ffcdd2' },
  }[state];

  useEffect(() => {
    scale.value = isSelected
      ? withSpring(1.05, { damping: 12, stiffness: 200 })
      : withSpring(1);
  }, [isSelected]);

  useEffect(() => {
    if (isWrong) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 60 }),
        withTiming(8,  { duration: 60 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6,  { duration: 50 }),
        withTiming(0,  { duration: 40 }),
      );
    }
  }, [isWrong]);

  const sinkStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <Animated.View
      entering={ZoomIn.springify().delay(index * 80)}
      layout={Layout.springify()}
      style={styles.cardWrapper}
    >
      <Animated.View style={shakeStyle}>
        <Pressable
          onPress={() => !disabled && onPress(label)}
          onPressIn={() => {
            if (disabled) return;
            translateY.value = withSpring(4, { damping: 15, stiffness: 300 });
            bottomWidth.value = withSpring(2, { damping: 15, stiffness: 300 });
          }}
          onPressOut={() => {
            if (disabled) return;
            translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
            bottomWidth.value = withSpring(6, { damping: 15, stiffness: 300 });
          }}
          disabled={disabled}
        >
          <Animated.View
            style={[
              styles.card,
              sinkStyle,
              { backgroundColor: colors.bg, borderColor: colors.border },
            ]}
          >
            {/* Torn calendar-page top strip */}
            <View style={[styles.tornStrip, { backgroundColor: colors.torn }]} />

            {/* Day / month label */}
            <Text style={[styles.cardLabel, { color: colors.text }]}>{label}</Text>

            {/* Ruled lines — evoke paper calendar */}
            <View style={styles.ruledLines}>
              {[0, 1, 2].map(i => (
                <View key={i} style={styles.ruledLine} />
              ))}
            </View>

            {/* Result badge */}
            {state === 'correct' && (
              <Animated.View entering={ZoomIn.springify()} style={styles.badge}>
                <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
              </Animated.View>
            )}
            {state === 'wrong' && (
              <Animated.View entering={ZoomIn.springify()} style={styles.badge}>
                <Ionicons name="close-circle" size={22} color={Colors.error} />
              </Animated.View>
            )}
          </Animated.View>
        </Pressable>
      </Animated.View>
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

// ─── CalendarPageEngine ───
const CalendarPageEngine = ({ data, onResult }) => {
  const { question: questionText, answer, metadata = {} } = data;
  const options = metadata.options || [];

  const [selectedOption, setSelectedOption] = useState(null);
  const [evaluation, setEvaluation]         = useState(null);
  const [resolved, setResolved]             = useState(false);
  const [confetti, setConfetti]             = useState(false);

  const shuffledOptions = useMemo(
    () => [...options].sort(() => Math.random() - 0.5),
    [data],
  );

  const confettiItems = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({
      key: i,
      emoji: CONFETTI[i % CONFETTI.length],
      top: `${5 + Math.floor(Math.random() * 80)}%`,
      left: `${5 + Math.floor(Math.random() * 85)}%`,
      delay: i * 40,
    })),
  []);

  useEffect(() => {
    setSelectedOption(null);
    setEvaluation(null);
    setResolved(false);
    setConfetti(false);
  }, [data]);

  useEffect(() => {
    if (!questionText) return;
    const timer = setTimeout(() => speechManager.speakInstruction(questionText), 400);
    return () => { clearTimeout(timer); speechManager.stop(); };
  }, [questionText]);

  const handleCheck = () => {
    if (!selectedOption || resolved) return;

    const isCorrect =
      String(selectedOption).toLowerCase().trim() === String(answer).toLowerCase().trim();

    if (isCorrect) {
      setEvaluation('correct');
      setResolved(true);
      setConfetti(true);
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
      <QuestionHeader text={questionText} />
      {/* Hint strip */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.hintStrip}>
        <Text style={styles.hintText}>Tap the correct calendar page</Text>
      </Animated.View>

      {/* 2×2 card grid */}
      <View style={styles.cardsGrid}>
        {shuffledOptions.map((opt, idx) => (
          <CalendarCard
            key={`${opt}-${idx}`}
            label={opt}
            index={idx}
            isSelected={selectedOption === opt}
            evaluation={selectedOption === opt ? evaluation : null}
            disabled={resolved}
            onPress={(label) => {
              if (resolved) return;
              setSelectedOption(label);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
        ))}
      </View>

      {/* Confetti overlay */}
      {confetti && (
        <View style={styles.confettiOverlay} pointerEvents="none">
          {confettiItems.map(item => (
            <Animated.Text
              key={item.key}
              entering={ZoomIn.springify().delay(item.delay)}
              style={[styles.confettiEmoji, { top: item.top, left: item.left }]}
            >
              {item.emoji}
            </Animated.Text>
          ))}
        </View>
      )}

      <CheckButton
        onPress={handleCheck}
        disabled={!selectedOption || resolved || !!evaluation}
        label={resolved && evaluation === 'correct' ? 'AWESOME!' : 'CHECK'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  hintStrip: {
    alignSelf: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  hintText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    flex: 1,
    alignContent: 'center',
  },
  cardWrapper: {
    width: '46%',
  },
  card: {
    borderRadius: 16,
    borderWidth: 2,
    overflow: 'hidden',
    minHeight: 130,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  tornStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  cardLabel: {
    fontFamily: 'Lexend-Bold',
    fontSize: 22,
    textAlign: 'center',
    marginTop: 18,
  },
  ruledLines: {
    width: '80%',
    marginTop: 10,
    gap: 6,
  },
  ruledLine: {
    height: 1,
    backgroundColor: Colors.outlineVariant,
    opacity: 0.5,
  },
  badge: {
    position: 'absolute',
    top: 14,
    right: 10,
  },
  confettiOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  confettiEmoji: {
    position: 'absolute',
    fontSize: 24,
  },
  checkButtonContainer: {
    width: '100%',
    marginTop: 16,
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

export default CalendarPageEngine;
