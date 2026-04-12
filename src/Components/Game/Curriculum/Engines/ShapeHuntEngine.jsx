/**
 * ShapeHuntEngine — Grade 1 Shapes / Geometry Game Engine
 *
 * Students tap matching shapes in a shuffled grid to "hunt" all
 * instances of a target shape (e.g. "Tap all the circles!").
 *
 * Mechanic: Multi-target tap select with per-tap feedback.
 *  - Correct tap: tile spring-locks, green border, checkmark badge
 *  - Wrong tap: tile shakes, red flash, resets (does NOT stay selected)
 *  - Check Answer button appears once foundSet.size === targetCount
 *  - isCorrect = (wrongTaps === 0)
 *
 * Competency: MG.1.1–1.3 (2D Shapes)
 * Shadow-Free Design System compliant.
 *
 * Props Contract: { data, onResult } (standard Orchestrator API)
 *
 * JSON question shape:
 *   {
 *     question: "Tap all the circles!",
 *     items: [{ id, assetId, isTarget }, ...]
 *   }
 */

import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useState, useCallback, useEffect, useMemo } from 'react';
import Animated, {
  ZoomIn,
  ZoomOut,
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import AssetDisplay from '@/Components/Game/Global/AssetDisplay';
import speechManager from '@/utils/speechManager';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const hapticLight = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
const hapticMedium = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

/**
 * ShapeTile — individual tappable shape tile.
 * Per-tile shared values keep animation drivers scoped (no cross-tile churn).
 */
const ShapeTile = ({ item, index, isFound, answered, onCorrect, onWrong }) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const borderFlash = useSharedValue(0); // 0 = neutral, 1 = wrong flash

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
    ],
  }));

  const handleTapJS = useCallback(() => {
    if (item.isTarget) {
      scale.value = withSequence(
        withSpring(1.12, { damping: 10, stiffness: 220 }),
        withSpring(1, { damping: 12, stiffness: 180 })
      );
      hapticLight();
      onCorrect(item.id);
    } else {
      translateX.value = withSequence(
        withSpring(-10, { damping: 8, stiffness: 300 }),
        withSpring(10, { damping: 8, stiffness: 300 }),
        withSpring(-5, { damping: 8, stiffness: 300 }),
        withSpring(0, { damping: 10, stiffness: 220 })
      );
      borderFlash.value = withSequence(
        withTiming(1, { duration: 120 }),
        withTiming(0, { duration: 450 })
      );
      hapticMedium();
      onWrong();
    }
  }, [item, onCorrect, onWrong, scale, translateX, borderFlash]);

  const tap = Gesture.Tap()
    .enabled(!answered && !isFound)
    .onEnd(() => {
      runOnJS(handleTapJS)();
    });

  const flashStyle = useAnimatedStyle(() => ({
    borderColor:
      borderFlash.value > 0.5
        ? Colors.error
        : isFound
        ? Colors.success
        : Colors.outlineVariant,
  }));

  const tileBackground = isFound
    ? Colors.surfaceContainerLow
    : Colors.surfaceContainerHigh;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70).springify().damping(14)}
      style={styles.tileWrapper}
    >
      <GestureDetector gesture={tap}>
        <Animated.View
          style={[
            styles.tile,
            { backgroundColor: tileBackground },
            animatedStyle,
            flashStyle,
          ]}
        >
          <View style={styles.shapeImage}>
            <AssetDisplay assetId={item.assetId} />
          </View>
          {isFound && (
            <Animated.View
              entering={ZoomIn.springify().damping(12)}
              style={styles.badge}
            >
              <Ionicons name="checkmark" size={16} color={Colors.onPrimary} />
            </Animated.View>
          )}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

// ─── ShapeHuntEngine: main engine component ───
const ShapeHuntEngine = ({ data, onResult }) => {
  const { items = [], question: instructionText } = data;

  const [foundSet, setFoundSet] = useState(() => new Set());
  const [wrongTaps, setWrongTaps] = useState(0);
  const [resolved, setResolved] = useState(false);

  const targetCount = useMemo(
    () => items.filter(i => i.isTarget).length,
    [items]
  );

  // Reset engine state when `data` changes (next question)
  useEffect(() => {
    setFoundSet(new Set());
    setWrongTaps(0);
    setResolved(false);
  }, [data]);

  // Auto-speak on question load
  useEffect(() => {
    const text = instructionText || 'Tap all the matching shapes.';
    const timer = setTimeout(() => speechManager.speakInstruction(text), 400);
    return () => {
      clearTimeout(timer);
      speechManager.stop();
    };
  }, [instructionText]);

  const handleCorrect = useCallback((id) => {
    setFoundSet(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleWrong = useCallback(() => {
    setWrongTaps(prev => prev + 1);
  }, []);

  const canCheck = foundSet.size === targetCount && !resolved && targetCount > 0;

  const handleCheckAnswer = useCallback(() => {
    if (resolved || !canCheck) return;
    setResolved(true);

    const isCorrect = wrongTaps === 0;

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Great job!', true);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Good try!', false);
    }

    const foundAssets = items
      .filter(it => foundSet.has(it.id))
      .map(it => it.assetId);

    setTimeout(() => onResult(isCorrect, foundAssets), 700);
  }, [resolved, canCheck, wrongTaps, items, foundSet, onResult]);

  const checkTap = Gesture.Tap()
    .enabled(canCheck)
    .onEnd(() => runOnJS(handleCheckAnswer)());

  const getInstruction = () => {
    if (resolved) {
      return wrongTaps === 0
        ? 'Perfect hunt! All found.'
        : `Found all — with ${wrongTaps} miss${wrongTaps > 1 ? 'es' : ''}.`;
    }
    if (canCheck) return 'All found! Check your answer.';
    return instructionText || 'Tap all the matching shapes.';
  };

  return (
    <View style={styles.container}>
      {/* Instruction Hint */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.hintContainer}>
        <Ionicons name="hand-left" size={16} color={Colors.onSurfaceVariant} />
        <Text style={styles.hintText}>{getInstruction()}</Text>
      </Animated.View>

      {/* Shape Grid */}
      <View style={styles.grid}>
        {items.map((item, idx) => (
          <ShapeTile
            key={`${data?.id || 'q'}-${item.id}`}
            item={item}
            index={idx}
            isFound={foundSet.has(item.id)}
            answered={resolved}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
          />
        ))}
      </View>

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Found {foundSet.size} of {targetCount}
        </Text>
      </View>

      {/* Footer: Check Answer */}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 8,
  },
  tileWrapper: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.5%',
  },
  tile: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 10,
  },
  shapeImage: {
    width: '80%',
    height: '80%',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.success,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceContainerLowest,
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
});

export default ShapeHuntEngine;
