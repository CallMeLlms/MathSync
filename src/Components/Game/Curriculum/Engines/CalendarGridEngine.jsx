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
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

const CONFETTI = ['🎉', '📅', '⭐', '✨', '🌟', '🎊'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CELL_STATE_COLORS = {
  idle:     { border: Colors.outlineVariant, bg: Colors.surfaceContainerLowest, text: Colors.onSurface },
  selected: { border: Colors.secondary,      bg: Colors.secondaryContainer,     text: Colors.onSecondaryContainer },
  correct:  { border: Colors.success,        bg: '#e8f5e9',                     text: Colors.success },
  wrong:    { border: Colors.error,          bg: '#ffebee',                     text: Colors.error },
};

// ─── DateCell ───
const DateCell = ({ dateNum, isSelected, evaluation, disabled, onPress, index }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);
  const shakeX = useSharedValue(0);

  const state = evaluation || (isSelected ? 'selected' : 'idle');
  const isWrong = isSelected && evaluation === 'wrong';
  const colors = CELL_STATE_COLORS[state];

  useEffect(() => {
    if (isWrong) {
      shakeX.value = withSequence(
        withTiming(-6, { duration: 60 }),
        withTiming(6,  { duration: 60 }),
        withTiming(-4, { duration: 50 }),
        withTiming(4,  { duration: 50 }),
        withTiming(0,  { duration: 40 }),
      );
    }
  }, [isWrong]);

  const sinkStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { translateX: shakeX.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  return (
    <Animated.View
      entering={ZoomIn.springify().delay(Math.min(index * 18, 400))}
      style={styles.cellWrapper}
    >
      <Pressable
        onPress={() => !disabled && onPress(dateNum)}
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
            styles.dateCell,
            sinkStyle,
            { backgroundColor: colors.bg, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.dateCellText, { color: colors.text }]}>{dateNum}</Text>
          {state === 'correct' && (
            <Animated.View entering={ZoomIn.springify()} style={styles.cellBadge}>
              <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
            </Animated.View>
          )}
          {state === 'wrong' && (
            <Animated.View entering={ZoomIn.springify()} style={styles.cellBadge}>
              <Ionicons name="close-circle" size={14} color={Colors.error} />
            </Animated.View>
          )}
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

// ─── CalendarGridEngine ───
const CalendarGridEngine = ({ data, onResult }) => {
  const { question: questionText, answer, metadata = {} } = data;
  const {
    month = '',
    year = '',
    startDay = 0,
    totalDays = 30,
  } = metadata;

  const [selectedDate, setSelectedDate] = useState(null);
  const [evaluation, setEvaluation]     = useState(null);
  const [resolved, setResolved]         = useState(false);
  const [confetti, setConfetti]         = useState(false);

  // Build the flat cell array (leading nulls + dates + trailing nulls to fill row)
  const cells = useMemo(() => {
    const arr = [];
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let d = 1; d <= totalDays; d++) arr.push(d);
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [startDay, totalDays]);

  const rows = useMemo(
    () => Array.from({ length: cells.length / 7 }, (_, r) => cells.slice(r * 7, r * 7 + 7)),
    [cells],
  );

  const confettiItems = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        key: i,
        emoji: CONFETTI[i % CONFETTI.length],
        top: `${5 + Math.floor(Math.random() * 80)}%`,
        left: `${5 + Math.floor(Math.random() * 85)}%`,
        delay: i * 40,
      })),
    [],
  );

  useEffect(() => {
    setSelectedDate(null);
    setEvaluation(null);
    setResolved(false);
    setConfetti(false);
  }, [data]);

  useEffect(() => {
    if (!questionText) return;
    const timer = setTimeout(() => speechManager.speakInstruction(questionText), 400);
    return () => {
      clearTimeout(timer);
      speechManager.stop();
    };
  }, [questionText]);

  const handleSelect = (dateNum) => {
    if (resolved) return;
    setSelectedDate(dateNum);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCheck = () => {
    if (selectedDate === null || resolved) return;

    const isCorrect = selectedDate === answer;

    if (isCorrect) {
      setEvaluation('correct');
      setResolved(true);
      setConfetti(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Correct!', true);
      setTimeout(() => onResult(true, [String(selectedDate)]), 900);
    } else {
      setEvaluation('wrong');
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Try again!', false);
      setTimeout(() => onResult(false, [String(selectedDate)]), 1100);
    }
  };

  return (
    <View style={styles.container}>
      {/* Month + year header (stylized as a calendar masthead) */}
      <Animated.View entering={FadeIn.delay(80)} style={styles.headerCard}>
        <View style={styles.headerStrip} />
        <Text style={styles.headerMonth}>{month}</Text>
        <Text style={styles.headerYear}>{year}</Text>
      </Animated.View>

      {/* Weekday labels */}
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((d) => (
          <View key={d} style={styles.weekdayCell}>
            <Text style={styles.weekdayText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {rows.map((row, rowIdx) => (
          <View key={`row-${rowIdx}`} style={styles.gridRow}>
            {row.map((dateNum, colIdx) =>
              dateNum ? (
                <DateCell
                  key={`d-${dateNum}`}
                  dateNum={dateNum}
                  isSelected={selectedDate === dateNum}
                  evaluation={selectedDate === dateNum ? evaluation : null}
                  disabled={resolved}
                  onPress={handleSelect}
                  index={rowIdx * 7 + colIdx}
                />
              ) : (
                <View key={`empty-${rowIdx}-${colIdx}`} style={styles.emptyCell} />
              ),
            )}
          </View>
        ))}
      </View>

      {/* Confetti overlay */}
      {confetti && (
        <View style={styles.confettiOverlay} pointerEvents="none">
          {confettiItems.map((item) => (
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
        disabled={selectedDate === null || resolved || !!evaluation}
        label={resolved && evaluation === 'correct' ? 'AWESOME!' : 'CHECK'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  headerCard: {
    alignSelf: 'center',
    minWidth: 180,
    backgroundColor: Colors.surfaceContainerLowest,
    borderColor: Colors.outlineVariant,
    borderWidth: 2,
    borderBottomWidth: 4,
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    paddingTop: 16,
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  headerStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 8,
    backgroundColor: Colors.primary,
  },
  headerMonth: {
    fontFamily: 'Lexend-Bold',
    fontSize: 22,
    color: Colors.onSurface,
    letterSpacing: 0.5,
  },
  headerYear: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  weekdayText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    letterSpacing: 0.4,
  },
  grid: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  gridRow: {
    flexDirection: 'row',
  },
  cellWrapper: {
    flex: 1,
    margin: 2,
  },
  dateCell: {
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dateCellText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 14,
  },
  cellBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  emptyCell: {
    flex: 1,
    margin: 2,
    aspectRatio: 1,
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

export default CalendarGridEngine;
