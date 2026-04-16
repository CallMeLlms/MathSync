/**
 * ShapeComposeEngine — Grade 1 Shape Composing Engine
 *
 * Students tap palette tiles to fill slots in a target shape.
 * Correct taps (type in `accepts`) snap into the next open slot.
 * Wrong taps flash an error. When all required slots are filled, success fires.
 *
 * Mechanic: Tap-to-place (no text reading required).
 *  - Tap a correct palette tile → it places into the next open slot
 *  - Tap a wrong palette tile → brief red flash, no penalty
 *  - All slots filled → auto-submit success
 *
 * Competency: MG.1.3 (Composing 2D Shapes)
 * Shadow-Free Design System compliant.
 *
 * Props Contract: { data, onResult } (standard Orchestrator API)
 *
 * JSON shape:
 *   {
 *     prompt: "Make a square!",
 *     audio: "shape_compose_square.mp3",
 *     palette: ["triangle", "triangle", "circle"],
 *     target: "square",
 *     requiredCount: 2,
 *     accepts: ["triangle"]
 *   }
 */

import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import Animated, {
  ZoomIn,
  ZoomOut,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
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

// Maps shape type strings from JSON → registered assetMap keys
const SHAPE_ASSET = {
  triangle:  'shape_triangle',
  circle:    'shape_circle',
  square:    'shape_square',
  rectangle: 'shape_rectangle',
};

// ─── PaletteTile ─────────────────────────────────────────────────────────────

const PaletteTile = ({ type, index, used, rejected, onTap }) => {
  const scale = useSharedValue(1);
  const borderColor = useSharedValue(0); // 0 = normal, 1 = error

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const rejectedBorderStyle = useAnimatedStyle(() => ({
    borderColor: rejected ? Colors.error : Colors.outlineVariant,
  }));

  const handleTapJS = useCallback(() => {
    if (used) return;
    scale.value = withSequence(
      withSpring(1.12, { damping: 10, stiffness: 240 }),
      withSpring(1,    { damping: 12, stiffness: 180 })
    );
    hapticLight();
    onTap();
  }, [used, onTap, scale]);

  const tap = Gesture.Tap()
    .enabled(!used)
    .onEnd(() => { runOnJS(handleTapJS)(); });

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).springify().damping(14)}
      style={styles.paletteTileWrapper}
    >
      <GestureDetector gesture={tap}>
        <Animated.View
          style={[
            styles.paletteTile,
            { opacity: used ? 0.28 : 1 },
            { borderColor: rejected ? Colors.error : Colors.outlineVariant },
            animatedStyle,
          ]}
        >
          <View style={styles.tileAsset}>
            <AssetDisplay assetId={SHAPE_ASSET[type] || 'shape_square'} />
          </View>
          {used && (
            <Animated.View
              entering={ZoomIn.springify()}
              style={styles.usedOverlay}
            >
              <Ionicons name="checkmark" size={18} color={Colors.onPrimary} />
            </Animated.View>
          )}
          {rejected && (
            <Animated.View
              entering={ZoomIn.springify()}
              exiting={ZoomOut}
              style={styles.rejectedOverlay}
            >
              <Ionicons name="close" size={18} color={Colors.onPrimary} />
            </Animated.View>
          )}
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

// ─── TargetSlot ──────────────────────────────────────────────────────────────

const TargetSlot = ({ filled, accepts }) => {
  const assetId = SHAPE_ASSET[accepts?.[0]];

  return (
    <View style={[styles.slot, filled && styles.slotFilled]}>
      {filled ? (
        <Animated.View entering={ZoomIn.springify().damping(11)} style={styles.slotAsset}>
          <AssetDisplay assetId={assetId || 'shape_triangle'} />
        </Animated.View>
      ) : (
        <Ionicons name="add" size={22} color={Colors.outlineVariant} />
      )}
    </View>
  );
};

// ─── ShapeComposeEngine ───────────────────────────────────────────────────────

const ShapeComposeEngine = ({ data, onResult }) => {
  const {
    palette = [],
    target = 'shape',
    requiredCount = 1,
    accepts = [],
    prompt: instructionText,
  } = data;

  const [usedSet, setUsedSet]       = useState(() => new Set());
  const [slotsFilled, setSlotsFilled] = useState(0);
  const [resolved, setResolved]     = useState(false);
  const [rejectedIdx, setRejectedIdx] = useState(null);

  // Reset when question changes
  useEffect(() => {
    setUsedSet(new Set());
    setSlotsFilled(0);
    setResolved(false);
    setRejectedIdx(null);
  }, [data]);

  // Auto-speak prompt on load
  useEffect(() => {
    const text = instructionText || `Make a ${target}!`;
    const timer = setTimeout(() => speechManager.speakInstruction(text), 400);
    return () => {
      clearTimeout(timer);
      speechManager.stop();
    };
  }, [instructionText, target]);

  const handleTileTap = useCallback((idx, type) => {
    if (resolved || usedSet.has(idx)) return;

    if (accepts.includes(type)) {
      const nextUsed   = new Set(usedSet);
      nextUsed.add(idx);
      const nextFilled = slotsFilled + 1;

      setUsedSet(nextUsed);
      setSlotsFilled(nextFilled);

      if (nextFilled >= requiredCount) {
        setResolved(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        speechManager.speakFeedback('Amazing! You made it!', true);
        setTimeout(() => onResult(true, [type]), 900);
      }
    } else {
      // Wrong tile — flash error, don't penalise
      setRejectedIdx(idx);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setTimeout(() => setRejectedIdx(null), 600);

      // If no valid moves remain and slots aren't full, auto-fail
      const validRemaining = palette.filter(
        (t, i) => accepts.includes(t) && !usedSet.has(i)
      );
      if (validRemaining.length === 0 && slotsFilled < requiredCount) {
        setResolved(true);
        setTimeout(() => onResult(false, [type]), 700);
      }
    }
  }, [resolved, usedSet, accepts, slotsFilled, requiredCount, palette, onResult]);

  const getHintText = () => {
    if (resolved)         return 'You did it!';
    if (slotsFilled > 0)  return `${slotsFilled} of ${requiredCount} placed — keep going!`;
    return instructionText || `Make a ${target}!`;
  };

  return (
    <View style={styles.container}>

      {/* Instruction hint */}
      <Animated.View entering={FadeIn.delay(100)} style={styles.hintContainer}>
        <Ionicons name="construct" size={16} color={Colors.onSurfaceVariant} />
        <Text style={styles.hintText}>{getHintText()}</Text>
      </Animated.View>

      {/* Target zone */}
      <Animated.View entering={FadeInDown.delay(150).springify()} style={styles.targetZone}>
        <Text style={styles.targetLabel}>{target.toUpperCase()}</Text>
        <View style={styles.slotsRow}>
          {Array.from({ length: requiredCount }, (_, i) => (
            <TargetSlot
              key={i}
              filled={i < slotsFilled}
              accepts={accepts}
            />
          ))}
        </View>
      </Animated.View>

      {/* Divider hint */}
      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>TAP A SHAPE</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Palette */}
      <View style={styles.palette}>
        {palette.map((type, idx) => (
          <PaletteTile
            key={`${data?.id || 'q'}-${idx}`}
            type={type}
            index={idx}
            used={usedSet.has(idx)}
            rejected={rejectedIdx === idx}
            onTap={() => handleTileTap(idx, type)}
          />
        ))}
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Placed {slotsFilled} of {requiredCount}
        </Text>
      </View>

    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 16,
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
  targetZone: {
    width: '90%',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    borderStyle: 'dashed',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 16,
  },
  targetLabel: {
    fontFamily: 'Lexend-Bold',
    fontSize: SCREEN_HEIGHT * 0.022,
    color: Colors.onSurfaceVariant,
    letterSpacing: 2,
  },
  slotsRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  slot: {
    width: SCREEN_HEIGHT * 0.1,
    height: SCREEN_HEIGHT * 0.1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
  slotFilled: {
    borderStyle: 'solid',
    borderColor: Colors.success,
    backgroundColor: Colors.tertiaryContainer,
  },
  slotAsset: {
    width: '75%',
    height: '75%',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '80%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.outlineVariant,
  },
  dividerText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: SCREEN_HEIGHT * 0.013,
    color: Colors.outlineVariant,
    letterSpacing: 1.5,
  },
  palette: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    paddingVertical: 4,
  },
  paletteTileWrapper: {
    width: SCREEN_HEIGHT * 0.11,
    height: SCREEN_HEIGHT * 0.11,
  },
  paletteTile: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: Colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    padding: 10,
  },
  tileAsset: {
    width: '80%',
    height: '80%',
  },
  usedOverlay: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surfaceContainerLowest,
  },
  rejectedOverlay: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.error,
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
});

export default ShapeComposeEngine;
