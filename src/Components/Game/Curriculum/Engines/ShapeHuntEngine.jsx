/**
 * ShapeHuntEngine — Grade 1 Shapes / Geometry Game Engine
 *
 * Students tap shapes to build a selection, then press "Check Answer"
 * to verify. Selections are toggleable (tap again to deselect).
 *
 * Mechanic: Toggle-select with deferred answer checking.
 *  - Tap unselected tile: selects it (spring pop, green border, checkmark)
 *  - Tap selected tile: deselects it (scale back, border clears)
 *  - Check Answer button appears once any shape is selected
 *  - isCorrect = all targets selected AND no non-targets selected
 *
 * Competency: MG.1.1–1.3 (2D Shapes)
 * Shadow-Free Design System compliant.
 *
 * Props Contract: { data, onResult } (standard Orchestrator API)
 *
 * JSON question shape:
 *   {
 *     prompt: "Tap all the circles!",
 *     audio: "shape_hunt_circles.mp3",
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
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  Layout,
} from 'react-native-reanimated';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import AssetDisplay from '@/Components/Game/Global/AssetDisplay';
import speechManager from '@/utils/speechManager';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const hapticLight = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// Amber used only for missed-target indicator post-check (no token in palette)
const COLOR_MISSED = '#b45309';

/**
 * Resolves badge props for post-check or pre-check states.
 * Returns { icon, bgColor } or null (no badge).
 */
const resolveBadge = ({ isSelected, answered, resolvedCorrect, resolvedMissed }) => {
  if (!answered && isSelected) return { icon: 'checkmark', bgColor: Colors.success };
  if (answered && resolvedCorrect) return { icon: 'checkmark', bgColor: Colors.success };
  if (answered && isSelected && !resolvedCorrect) return { icon: 'close', bgColor: Colors.error };
  if (answered && resolvedMissed) return { icon: 'alert', bgColor: COLOR_MISSED };
  return null;
};

/**
 * ShapeTile — individual tappable/toggleable shape tile.
 * Per-tile shared value keeps scale animation scoped to the tile.
 */
const ShapeTile = ({ item, index, isSelected, answered, resolvedCorrect, resolvedMissed, onToggle }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const handlePressIn = () => {
    if (answered) return;
    translateY.value = withSpring(4, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(2, { damping: 15, stiffness: 300 });
    hapticLight();
  };

  const handlePressOut = () => {
    if (answered) return;
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(6, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (answered) return;
    onToggle(item.id);
  };

  // Border color — static from React state, no animation needed
  let borderColor = Colors.outlineVariant;
  let shadowColor = '#d1d5db'; // Default shadow color for depth

  if (answered) {
    if (resolvedCorrect) {
      borderColor = Colors.success;
      shadowColor = '#1b5e20';
    } else if (resolvedMissed) {
      borderColor = COLOR_MISSED;
      shadowColor = '#78350f';
    } else if (isSelected) {
      borderColor = Colors.error;
      shadowColor = '#b71c1c';
    }
  } else if (isSelected) {
    borderColor = Colors.success;
    shadowColor = '#1b5e20';
  }

  const badge = resolveBadge({ isSelected, answered, resolvedCorrect, resolvedMissed });

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 70).springify().damping(14)}
      layout={Layout.springify()}
      style={styles.tileWrapper}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={answered}
        style={{ flex: 1 }}
      >
        <Animated.View
          style={[
            styles.tile,
            { 
              backgroundColor: isSelected ? Colors.surfaceContainerLow : Colors.surfaceContainerHigh, 
              borderColor: borderColor,
              borderBottomColor: shadowColor,
            },
            animatedStyle,
          ]}
        >
          <View style={styles.shapeImage}>
            <AssetDisplay assetId={item.assetId} />
          </View>
          {badge && (
            <Animated.View
              entering={ZoomIn.springify().damping(12)}
              exiting={ZoomOut}
              style={[styles.badge, { backgroundColor: badge.bgColor }]}
            >
              <Ionicons name={badge.icon} size={16} color={Colors.onPrimary} />
            </Animated.View>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ─── ShapeHuntEngine: main engine component ───
const ShapeHuntEngine = ({ data, onResult }) => {
  const { items = [], prompt: instructionText } = data;

  const [selectedSet, setSelectedSet] = useState(() => new Set());
  const [resolved, setResolved] = useState(false);

  const targetCount = useMemo(
    () => items.filter(i => i.isTarget).length,
    [items]
  );

  // Reset engine state when `data` changes (next question)
  useEffect(() => {
    setSelectedSet(new Set());
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

  const handleToggle = useCallback((id) => {
    setSelectedSet(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const canCheck = selectedSet.size > 0 && !resolved;

  const handleCheckAnswer = useCallback(() => {
    if (resolved || !canCheck) return;
    setResolved(true);

    const allTargetsFound = items.filter(i => i.isTarget).every(i => selectedSet.has(i.id));
    const noWrongSelected = items.filter(i => !i.isTarget).every(i => !selectedSet.has(i.id));
    const isCorrect = allTargetsFound && noWrongSelected;

    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speechManager.speakFeedback('Great job!', true);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speechManager.speakFeedback('Good try!', false);
    }

    const selectedAssets = items
      .filter(it => selectedSet.has(it.id))
      .map(it => it.assetId);

    setTimeout(() => onResult(isCorrect, selectedAssets), 700);
  }, [resolved, canCheck, items, selectedSet, onResult]);


  const getInstruction = () => {
    if (resolved) return 'Check the results!';
    if (selectedSet.size > 0) return 'Tap again to deselect \u2022 Check when ready';
    return 'Tap shapes to select them.';
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
            isSelected={selectedSet.has(item.id)}
            answered={resolved}
            resolvedCorrect={resolved && item.isTarget && selectedSet.has(item.id)}
            resolvedMissed={resolved && item.isTarget && !selectedSet.has(item.id)}
            onToggle={handleToggle}
          />
        ))}
      </View>

      {/* Selection counter */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Selected {selectedSet.size} of {targetCount}
        </Text>
      </View>

      {/* Footer: Check Answer */}
      <View style={styles.footer}>
        {canCheck && (
          <Animated.View
            entering={ZoomIn.springify()}
            exiting={FadeOut}
            style={styles.checkButtonContainer}
          >
            <TactileCheckButton 
              onPress={handleCheckAnswer}
              label="CHECK ANSWER"
            />
          </Animated.View>
        )}
      </View>
    </View>
  );
};

// ─── TactileCheckButton ───
const TactileCheckButton = ({ onPress, label }) => {
  const translateY = useSharedValue(0);
  const bottomWidth = useSharedValue(6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    borderBottomWidth: bottomWidth.value,
  }));

  const handlePressIn = () => {
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
      style={{ width: '100%' }}
    >
      <Animated.View style={[styles.checkButton, animatedStyle]}>
        <Ionicons name="checkmark-circle" size={22} color={Colors.onPrimary} />
        <Text style={styles.checkButtonText}>{label}</Text>
      </Animated.View>
    </Pressable>
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
    borderBottomWidth: 6,
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
    width: '100%',
    minHeight: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  checkButtonContainer: {
    width: '100%',
    paddingHorizontal: 10,
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    borderColor: '#1b5e20', // Darker green for depth
    borderWidth: 2,
    borderBottomWidth: 6,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 20,
    minHeight: 56,
    justifyContent: 'center',
    gap: 8,
  },
  checkButtonText: {
    fontFamily: 'Lexend-Bold',
    color: Colors.onPrimary,
    fontSize: SCREEN_HEIGHT * 0.019,
    letterSpacing: 1.1,
  },
});

export default ShapeHuntEngine;
