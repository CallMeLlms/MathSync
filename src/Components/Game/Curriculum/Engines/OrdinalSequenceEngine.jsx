/**
 * OrdinalSequenceEngine — Grade 1 Ordinal Numbers Game Engine
 *
 * Children tap a row of fruits LEFT → RIGHT to stamp ordinal
 * position badges (1st, 2nd, 3rd...10th) onto each. The engine
 * validates understanding of ordinal sequence by checking that
 * the tap order equals [0, 1, 2, ..., count-1].
 *
 * Mechanic: Tap-to-label sequence (assessable via tap order)
 * Competency: NA.1.9 (Ordinal Numbers 1st-10th)
 *
 * Shadow-Free Design System compliant.
 *
 * Props Contract: { data, onResult } (standard Orchestrator API)
 *
 * JSON question shape:
 *   {
 *     fruits: ["🥭", "🍌", ...],
 *     count: 5,
 *     question: "Tap the fruits from 1st to last!"
 *   }
 */

import { View, Text, ScrollView, Dimensions, StyleSheet } from 'react-native';
import { useState, useCallback, useEffect, useMemo } from 'react';
import Animated, {
  ZoomIn,
  ZoomOut,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import speechManager from '@/utils/speechManager';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Ordinal label lookup for positions 1-10
const ORDINAL_LABELS = [
  '1st', '2nd', '3rd', '4th', '5th',
  '6th', '7th', '8th', '9th', '10th',
];

const hapticLight = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

/**
 * FruitTile — individual tappable fruit with badge overlay.
 * Owns its own scale/opacity shared values so animation drivers
 * stay scoped per-tile (avoids cross-tile re-render churn).
 */
const FruitTile = ({ fruit, index, isTapped, badgeLabel, answered, isMisplaced, onTap }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(isTapped ? 0.55 : 1, { duration: 180 });
  }, [isTapped, opacity]);

  // Reset visuals if tile becomes untapped (e.g. reset pressed)
  useEffect(() => {
    if (!isTapped) {
      scale.value = 1;
    }
  }, [isTapped, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handleTapJS = useCallback(() => {
    onTap(index);
  }, [index, onTap]);

  const tap = Gesture.Tap()
    .enabled(!answered && !isTapped)
    .onStart(() => {
      scale.value = withSpring(1.12, { damping: 10, stiffness: 220 });
    })
    .onEnd(() => {
      scale.value = withSpring(1, { damping: 12, stiffness: 180 });
      runOnJS(hapticLight)();
      runOnJS(handleTapJS)();
    });

  const tileBackground = isTapped
    ? Colors.surfaceContainerLow
    : Colors.surfaceContainerHigh;

  const borderColor = answered
    ? (isMisplaced ? Colors.error : Colors.success)
    : (isTapped ? Colors.primary : Colors.outlineVariant);

  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        style={[
          styles.tile,
          { backgroundColor: tileBackground, borderColor },
          animatedStyle,
        ]}
      >
        <Text style={styles.fruitEmoji}>{fruit}</Text>
        {badgeLabel && (
          <Animated.View
            entering={ZoomIn.springify().damping(12)}
            style={styles.badge}
          >
            <Text style={styles.badgeText}>{badgeLabel}</Text>
          </Animated.View>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

// ─── OrdinalSequenceEngine: main engine component ───
const OrdinalSequenceEngine = ({ data, onResult }) => {
  const { fruits = [], count = fruits.length, question: instructionText } = data;

  const [tappedOrder, setTappedOrder] = useState([]);
  const [badges, setBadges] = useState({});
  const [answered, setAnswered] = useState(false);

  // Reset engine state when `data` changes (next question from Orchestrator)
  useEffect(() => {
    setTappedOrder([]);
    setBadges({});
    setAnswered(false);
  }, [data]);

  // Auto-speak on question load
  useEffect(() => {
    const text = instructionText || 'Tap the fruits from first to last.';
    const timer = setTimeout(() => speechManager.speakInstruction(text), 500);
    return () => {
      clearTimeout(timer);
      speechManager.stop();
    };
  }, [instructionText]);

  const tappedCount = tappedOrder.length;
  const allTapped = tappedCount === count && count > 0;
  const canCheck = allTapped && !answered;

  const handleTap = useCallback((index) => {
    setTappedOrder(prev => {
      if (prev.includes(index) || prev.length >= count) return prev;
      const nextOrder = [...prev, index];
      const label = ORDINAL_LABELS[nextOrder.length - 1];
      setBadges(b => ({ ...b, [index]: label }));
      return nextOrder;
    });
  }, [count]);

  const handleCheckAnswer = useCallback(() => {
    if (answered || !allTapped) return;
    setAnswered(true);

    const isCorrect = tappedOrder.every((idx, i) => idx === i);

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Great job!', true);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Not quite. Tap from first to last.', false);
    }

    // userAnswerItems: fruits in the order the student tapped them
    const tappedFruits = tappedOrder.map(i => fruits[i]);
    setTimeout(() => onResult(isCorrect, tappedFruits), 700);
  }, [answered, allTapped, tappedOrder, fruits, onResult]);

  const handleReset = useCallback(() => {
    if (answered) return;
    setTappedOrder([]);
    setBadges({});
  }, [answered]);

  // Misplaced set: tile at index `i` received a label that wasn't `(i+1)th`
  const misplacedSet = useMemo(() => {
    if (!answered) return new Set();
    const misplaced = new Set();
    tappedOrder.forEach((fruitIdx, tapOrder) => {
      if (fruitIdx !== tapOrder) misplaced.add(fruitIdx);
    });
    return misplaced;
  }, [answered, tappedOrder]);

  // Check button tap
  const checkTap = Gesture.Tap()
    .enabled(canCheck)
    .onEnd(() => runOnJS(handleCheckAnswer)());

  // Reset button tap
  const resetTap = Gesture.Tap()
    .enabled(!answered && tappedCount > 0)
    .onEnd(() => runOnJS(handleReset)());

  const getInstruction = () => {
    if (answered) {
      const isCorrect = tappedOrder.every((idx, i) => idx === i);
      return isCorrect ? '✅ Perfect order!' : 'Some badges are out of place.';
    }
    if (allTapped) return 'All labeled! Check your answer.';
    return instructionText || 'Tap the fruits from 1st to last!';
  };

  return (
    <View style={styles.container}>
      {/* Instruction Hint */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.hintContainer}>
        <Ionicons name="hand-left" size={16} color={Colors.onSurfaceVariant} />
        <Text style={styles.hintText}>{getInstruction()}</Text>
      </Animated.View>

      {/* Fruit Row (horizontal scroll for >6 tiles) */}
      <View style={styles.rowWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowContent}
          bounces
        >
          {fruits.map((fruit, idx) => (
            <FruitTile
              key={`${data?.id || 'q'}-${idx}`}
              fruit={fruit}
              index={idx}
              isTapped={tappedOrder.includes(idx)}
              badgeLabel={badges[idx]}
              answered={answered}
              isMisplaced={misplacedSet.has(idx)}
              onTap={handleTap}
            />
          ))}
        </ScrollView>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {tappedCount} / {count} labeled
        </Text>
      </View>

      {/* Footer: Check Answer + Reset */}
      <View style={styles.footer}>
        {canCheck && (
          <GestureDetector gesture={checkTap}>
            <Animated.View
              entering={ZoomIn.springify()}
              exiting={ZoomOut}
              style={styles.checkButton}
            >
              <Ionicons name="checkmark-circle" size={22} color={Colors.onPrimary} />
              <Text style={styles.checkButtonText}>Check Answer</Text>
            </Animated.View>
          </GestureDetector>
        )}

        {!answered && tappedCount > 0 && (
          <GestureDetector gesture={resetTap}>
            <Animated.View entering={FadeIn.duration(200)} style={styles.resetButton}>
              <Ionicons name="refresh" size={16} color={Colors.onSurfaceVariant} />
              <Text style={styles.resetText}>Reset</Text>
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
    paddingVertical: 10,
    gap: 14,
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  hintText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: SCREEN_HEIGHT * 0.016,
    color: Colors.onSurfaceVariant,
  },
  rowWrapper: {
    width: '100%',
    flexGrow: 0,
  },
  rowContent: {
    paddingHorizontal: 8,
    paddingVertical: 20,
    gap: 12,
    alignItems: 'center',
  },
  tile: {
    width: 76,
    height: 96,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  fruitEmoji: {
    fontSize: 44,
    lineHeight: 52,
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: -8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    minWidth: 36,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceContainerLowest,
  },
  badgeText: {
    fontFamily: 'Lexend-Bold',
    fontSize: 13,
    color: Colors.onPrimary,
  },
  progressContainer: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  progressText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: SCREEN_HEIGHT * 0.015,
    color: Colors.onSurfaceVariant,
  },
  footer: {
    minHeight: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    gap: 10,
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
    color: Colors.onPrimary,
    fontSize: SCREEN_HEIGHT * 0.019,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    backgroundColor: Colors.surfaceContainerLow,
    minHeight: 44,
    minWidth: 44,
  },
  resetText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: SCREEN_HEIGHT * 0.014,
    color: Colors.onSurfaceVariant,
  },
});

export default OrdinalSequenceEngine;
