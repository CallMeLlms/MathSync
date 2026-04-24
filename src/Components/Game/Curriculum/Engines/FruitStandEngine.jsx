import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  FadeIn,
  FadeInDown,
  ZoomIn,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

// ─── PlacedEmoji ─────────────────────────────────────────────────────────────

const PlacedEmoji = ({ emoji, index }) => (
  <Animated.Text
    entering={ZoomIn.springify().delay(index * 30)}
    style={styles.placedEmoji}
  >
    {emoji}
  </Animated.Text>
);

// ─── FruitRow ────────────────────────────────────────────────────────────────

const FruitRow = ({ label, emoji, count, target, done, index }) => {
  const completedScale = useSharedValue(1);

  useEffect(() => {
    if (done) {
      completedScale.value = withSequence(
        withSpring(1.08, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 10, stiffness: 150 })
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  }, [done]);

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: completedScale.value }],
  }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 120).springify()}
      style={[styles.fruitRow, done && styles.fruitRowDone]}
      layout={Layout.springify()}
    >
      <Animated.View style={rowStyle}>
        {/* Row header */}
        <View style={styles.fruitRowHeader}>
          <Text style={styles.fruitRowLabel}>{emoji} {label}</Text>
          <View style={[styles.countBadge, done && styles.countBadgeDone]}>
            <Text style={[styles.countBadgeText, done && styles.countBadgeTextDone]}>
              {done ? '✓' : `${count} / ${target}`}
            </Text>
          </View>
        </View>
        {/* Placed emoji shelf */}
        <View style={styles.shelf}>
          {Array.from({ length: count }).map((_, i) => (
            <PlacedEmoji key={i} emoji={emoji} index={i} />
          ))}
          {count === 0 && (
            <Text style={styles.shelfEmpty}>tap below to place {label.toLowerCase()}s</Text>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
};

// ─── TapButton ───────────────────────────────────────────────────────────────

const TapButton = ({ emoji, label, done, onPress }) => {
  const ty = useSharedValue(0);
  const bw = useSharedValue(8);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: ty.value }, { scale: scale.value }],
    borderBottomWidth: bw.value,
  }));

  const handleIn = () => {
    if (done) return;
    ty.value = withSpring(5, { damping: 12, stiffness: 300 });
    bw.value = withSpring(2, { damping: 12, stiffness: 300 });
    scale.value = withSpring(0.97, { damping: 12, stiffness: 300 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleOut = () => {
    ty.value = withSpring(0, { damping: 12, stiffness: 300 });
    bw.value = withSpring(8, { damping: 12, stiffness: 300 });
    scale.value = withSpring(1, { damping: 12, stiffness: 300 });
  };

  return (
    <View style={styles.tapBtnWrap}>
      <Pressable onPress={onPress} onPressIn={handleIn} onPressOut={handleOut} disabled={done}>
        <Animated.View style={[styles.tapBtn, animStyle, done && styles.tapBtnDone]}>
          <Text style={styles.tapBtnEmoji}>{emoji}</Text>
          <Text style={[styles.tapBtnLabel, done && styles.tapBtnLabelDone]}>
            {done ? 'Done!' : `+ ${label}`}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

// ─── DoneButton ──────────────────────────────────────────────────────────────

const DoneButton = ({ onPress, disabled }) => {
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
      <Animated.View style={[styles.doneBtn, animStyle, disabled && styles.doneBtnDisabled]}>
        <Text style={[styles.doneBtnText, disabled && styles.doneBtnTextDisabled]}>
          {disabled ? 'PLACE ALL FRUIT FIRST' : 'I\'M DONE! ✓'}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

// ─── FruitStandEngine ─────────────────────────────────────────────────────────

const FruitStandEngine = ({ data, onResult }) => {
  const { question: questionText, answer, fruits = [] } = data;

  const [counts, setCounts] = useState(() =>
    Object.fromEntries(fruits.map(f => [f.label, 0]))
  );
  const [resolved, setResolved] = useState(false);
  const answeredRef = useRef(false);

  useEffect(() => {
    setCounts(Object.fromEntries(fruits.map(f => [f.label, 0])));
    setResolved(false);
    answeredRef.current = false;
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

  const handleTap = (fruit) => {
    if (counts[fruit.label] >= fruit.target || resolved) return;
    setCounts(prev => ({ ...prev, [fruit.label]: prev[fruit.label] + 1 }));
  };

  const allDone = fruits.every(f => counts[f.label] >= f.target);

  const handleDone = () => {
    if (!allDone || resolved || answeredRef.current) return;
    answeredRef.current = true;
    setResolved(true);

    const answerFruit = fruits.find(f => f.isAnswer);
    const placedCount = answerFruit ? counts[answerFruit.label] : 0;
    const isCorrect = placedCount === Number(answer);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    speechManager.speakFeedback(`You placed ${placedCount}! Correct!`, true);
    setTimeout(() => onResult(isCorrect, [String(placedCount)]), 1000);
  };

  return (
    <View style={styles.container}>

      {/* Stand sign */}
      <Animated.View entering={FadeIn.duration(350)} style={styles.standSign}>
        <Text style={styles.standSignText}>🏪 Fruit Stand</Text>
      </Animated.View>

      {/* Fruit rows (shelf display) */}
      <View style={styles.shelves}>
        {fruits.map((fruit, i) => (
          <FruitRow
            key={fruit.label}
            label={fruit.label}
            emoji={fruit.emoji}
            count={counts[fruit.label]}
            target={fruit.target}
            done={counts[fruit.label] >= fruit.target}
            index={i}
          />
        ))}
      </View>

      {/* Tap buttons */}
      <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.tapButtons}>
        {fruits.map(fruit => (
          <TapButton
            key={fruit.label}
            emoji={fruit.emoji}
            label={fruit.label}
            done={counts[fruit.label] >= fruit.target}
            onPress={() => handleTap(fruit)}
          />
        ))}
      </Animated.View>

      {/* Done button */}
      <DoneButton onPress={handleDone} disabled={!allDone || resolved} />
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
  // ── Stand Sign
  standSign: {
    backgroundColor: Colors.primaryContainer,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  standSignText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 18,
    color: Colors.onPrimaryContainer,
    letterSpacing: 0.5,
  },
  // ── Shelves
  shelves: {
    gap: 10,
  },
  fruitRow: {
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fruitRowDone: {
    borderColor: Colors.success,
    backgroundColor: '#e8f5e9',
  },
  fruitRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.outlineVariant,
  },
  fruitRowLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 15,
    color: Colors.onSurface,
  },
  countBadge: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
  },
  countBadgeDone: {
    backgroundColor: Colors.tertiaryContainer,
    borderColor: Colors.success,
  },
  countBadgeText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
  countBadgeTextDone: {
    color: Colors.success,
  },
  shelf: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 4,
    minHeight: 52,
    alignItems: 'center',
  },
  placedEmoji: {
    fontSize: 26,
  },
  shelfEmpty: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  // ── Tap Buttons
  tapButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  tapBtnWrap: {
    flex: 1,
  },
  tapBtn: {
    backgroundColor: Colors.secondaryContainer,
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 4,
  },
  tapBtnDone: {
    backgroundColor: Colors.tertiaryContainer,
    borderColor: Colors.success,
    opacity: 0.7,
  },
  tapBtnEmoji: {
    fontSize: 36,
  },
  tapBtnLabel: {
    fontFamily: 'Lexend-Bold',
    fontSize: 15,
    color: Colors.onSecondaryContainer,
  },
  tapBtnLabelDone: {
    color: Colors.success,
  },
  // ── Done Button
  doneBtn: {
    backgroundColor: Colors.tertiary,
    borderWidth: 2,
    borderColor: '#004d1e',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  doneBtnDisabled: {
    backgroundColor: Colors.surfaceContainerHighest,
    borderColor: Colors.outlineVariant,
  },
  doneBtnText: {
    fontFamily: 'Lexend-Black',
    fontSize: 17,
    color: Colors.onTertiary,
    letterSpacing: 1.2,
  },
  doneBtnTextDisabled: {
    color: Colors.onSurfaceVariant,
    opacity: 0.5,
    fontSize: 14,
  },
});

export default FruitStandEngine;
