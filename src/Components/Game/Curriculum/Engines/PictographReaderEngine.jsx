import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  FadeIn,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

// ─── NumKey ──────────────────────────────────────────────────────────────────

const NumKey = ({ label, onPress, disabled, wide }) => {
  const ty = useSharedValue(0);
  const bw = useSharedValue(5);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    borderBottomWidth: bw.value,
  }));

  const handleIn = () => {
    if (disabled) return;
    ty.value = withSpring(3, { damping: 15, stiffness: 300 });
    bw.value = withSpring(2, { damping: 15, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleOut = () => {
    ty.value = withSpring(0, { damping: 15, stiffness: 300 });
    bw.value = withSpring(5, { damping: 15, stiffness: 300 });
  };

  return (
    <View style={[styles.keyWrap, wide && styles.keyWrapWide]}>
      <Pressable onPress={() => !disabled && onPress(label)} onPressIn={handleIn} onPressOut={handleOut} disabled={disabled}>
        <Animated.View style={[styles.key, animStyle, disabled && styles.keyDisabled]}>
          <Text style={[styles.keyLabel, disabled && styles.keyLabelDisabled]}>{label}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

// ─── PictographRow ───────────────────────────────────────────────────────────

const PictographRow = ({ label, count, emoji, isTarget, index }) => {
  const glowOpacity = useSharedValue(1);

  useEffect(() => {
    if (isTarget) {
      glowOpacity.value = withRepeat(
        withSequence(withTiming(0.4, { duration: 700 }), withTiming(1, { duration: 700 })),
        -1,
        true
      );
    }
  }, [isTarget]);

  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70).springify()}
      style={[styles.row, isTarget && styles.rowTarget]}
    >
      {isTarget && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.targetGlowOverlay, glowStyle]} />
      )}
      <View style={styles.rowLabelWrap}>
        <Text style={[styles.rowLabel, isTarget && styles.rowLabelTarget]}>{label}</Text>
      </View>
      <View style={styles.rowDivider} />
      <View style={styles.rowEmojisWrap}>
        <Text style={styles.emojiText}>{emoji.repeat(count)}</Text>
      </View>
      {isTarget && <Text style={styles.pointerArrow}>◀</Text>}
    </Animated.View>
  );
};

// ─── CheckButton ─────────────────────────────────────────────────────────────

const CheckButton = ({ onPress, disabled, label }) => {
  const ty = useSharedValue(0);
  const bw = useSharedValue(6);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }],
    borderBottomWidth: bw.value,
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        if (disabled) return;
        ty.value = withSpring(4);
        bw.value = withSpring(2);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }}
      onPressOut={() => {
        ty.value = withSpring(0);
        bw.value = withSpring(6);
      }}
      disabled={disabled}
    >
      <Animated.View style={[styles.checkBtn, animStyle, disabled && styles.checkBtnDisabled]}>
        <Text style={[styles.checkBtnText, disabled && styles.checkBtnTextDisabled]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

// ─── PictographReaderEngine ──────────────────────────────────────────────────

const PictographReaderEngine = ({ data, onResult }) => {
  const { question: questionText, answer, pictograph = {} } = data;
  const { title = '', targetRow = '', rows = [] } = pictograph;

  const [input, setInput] = useState('');
  const [resolved, setResolved] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  const shakeX = useSharedValue(0);
  const inputBorder = useSharedValue(Colors.outlineVariant);

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  useEffect(() => {
    setInput('');
    setResolved(false);
    setIsWrong(false);
  }, [data]);

  useEffect(() => {
    if (questionText) {
      const t = setTimeout(() => speechManager.speakInstruction(questionText), 400);
      return () => {
        clearTimeout(t);
        speechManager.stop();
      };
    }
  }, [questionText]);

  const handleKey = (key) => {
    if (resolved) return;
    if (key === '⌫') {
      setInput(prev => prev.slice(0, -1));
    } else if (input.length < 2) {
      setInput(prev => prev + key);
    }
    setIsWrong(false);
  };

  const handleCheck = () => {
    if (!input || resolved) return;

    const isCorrect = parseInt(input, 10) === Number(answer);

    if (isCorrect) {
      setResolved(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Correct!', true);
      setTimeout(() => onResult(true, [input]), 800);
    } else {
      setIsWrong(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Try again!', false);
      shakeX.value = withSequence(
        withTiming(-10, { duration: 55 }),
        withTiming(10, { duration: 55 }),
        withTiming(-7, { duration: 55 }),
        withTiming(7, { duration: 55 }),
        withTiming(0, { duration: 55 })
      );
      setTimeout(() => {
        setInput('');
        setIsWrong(false);
      }, 1000);
      setTimeout(() => onResult(false, [input]), 1200);
    }
  };

  const NUMPAD = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['⌫', '0', null],
  ];

  return (
    <View style={styles.container}>

      {/* Pictograph Card */}
      <Animated.View entering={FadeIn.duration(350)} style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <View style={styles.pictographBody}>
          {rows.map((row, i) => (
            <PictographRow
              key={row.label}
              label={row.label}
              count={row.count}
              emoji={row.emoji}
              isTarget={row.label === targetRow}
              index={i}
            />
          ))}
        </View>
        <Text style={styles.cardHint}>Each symbol = 1</Text>
      </Animated.View>

      {/* Input Display */}
      <Animated.View style={[styles.inputBox, isWrong && styles.inputBoxWrong, shakeStyle]}>
        <Text style={[styles.inputText, !input && styles.inputPlaceholder]}>
          {input || '?'}
        </Text>
      </Animated.View>

      {/* Numpad */}
      <View style={styles.numpad}>
        {NUMPAD.map((row, ri) => (
          <View key={ri} style={styles.numpadRow}>
            {row.map((key, ki) =>
              key !== null ? (
                <NumKey key={ki} label={key} onPress={handleKey} disabled={resolved} />
              ) : (
                <View key={ki} style={styles.keyWrap} />
              )
            )}
          </View>
        ))}
      </View>

      <CheckButton
        onPress={handleCheck}
        disabled={!input || resolved}
        label={resolved ? 'AWESOME! ✓' : 'CHECK ANSWER'}
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
    gap: 14,
  },
  // ── Pictograph Card
  card: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: Colors.secondaryContainer,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: Colors.outlineVariant,
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: 'Lexend-Bold',
    fontSize: 16,
    color: Colors.onSecondaryContainer,
    letterSpacing: 0.5,
  },
  pictographBody: {
    paddingVertical: 4,
  },
  cardHint: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    textAlign: 'right',
    paddingHorizontal: 12,
    paddingBottom: 8,
    opacity: 0.7,
  },
  // ── Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
    overflow: 'hidden',
  },
  rowTarget: {
    backgroundColor: Colors.secondaryContainer,
    borderBottomColor: Colors.secondary,
  },
  targetGlowOverlay: {
    backgroundColor: Colors.secondaryContainer,
    borderRadius: 0,
  },
  rowLabelWrap: {
    width: 90,
  },
  rowLabel: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  rowLabelTarget: {
    color: Colors.onSecondaryContainer,
    fontFamily: 'PlusJakartaSans-Bold',
  },
  rowDivider: {
    width: 2,
    height: 20,
    backgroundColor: Colors.outlineVariant,
    marginHorizontal: 10,
  },
  rowEmojisWrap: {
    flex: 1,
  },
  emojiText: {
    fontSize: 18,
    letterSpacing: 2,
  },
  pointerArrow: {
    fontSize: 14,
    color: Colors.secondary,
    marginLeft: 6,
  },
  // ── Input Display
  inputBox: {
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputBoxWrong: {
    borderColor: Colors.error,
    backgroundColor: '#ffebee',
  },
  inputText: {
    fontFamily: 'Lexend-Black',
    fontSize: 36,
    color: Colors.onSurface,
    letterSpacing: 2,
  },
  inputPlaceholder: {
    color: Colors.outlineVariant,
  },
  // ── Numpad
  numpad: {
    gap: 8,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keyWrap: {
    flex: 1,
  },
  keyWrapWide: {
    flex: 2,
  },
  key: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyDisabled: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderColor: Colors.outlineVariant,
    opacity: 0.5,
  },
  keyLabel: {
    fontFamily: 'Lexend-Bold',
    fontSize: 22,
    color: Colors.onSurface,
  },
  keyLabelDisabled: {
    color: Colors.onSurfaceVariant,
  },
  // ── Check Button
  checkBtn: {
    backgroundColor: Colors.tertiary,
    borderWidth: 2,
    borderColor: '#004d1e',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  checkBtnDisabled: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderColor: Colors.outlineVariant,
  },
  checkBtnText: {
    fontFamily: 'Lexend-Black',
    fontSize: 18,
    color: Colors.onTertiary,
    letterSpacing: 1.2,
  },
  checkBtnTextDisabled: {
    color: Colors.onSurfaceVariant,
    opacity: 0.5,
  },
});

export default PictographReaderEngine;
