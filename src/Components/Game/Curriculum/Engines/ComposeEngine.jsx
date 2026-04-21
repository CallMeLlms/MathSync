import { View, Text, Dimensions, StyleSheet, Pressable } from 'react-native';
import { useState, useMemo, useCallback, useEffect } from 'react';
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
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CHIP_COLORS = [
  { bg: Colors.secondary,        border: '#003d8f' },
  { bg: Colors.primary,          border: '#7a3000' },
  { bg: Colors.tertiary,         border: '#00531e' },
  { bg: Colors.onSurfaceVariant, border: '#3a2d18' },
  { bg: '#EF6C00',               border: '#b34e00' },
  { bg: '#6A1B9A',               border: '#4a148c' },
];

// ─── NumberChip: a tappable number in the chip tray ───
const NumberChip = ({ value, color, onPress, disabled, index }) => {
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
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(6, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View entering={ZoomIn.springify().delay(index * 60)}>
      <Pressable
        onPress={disabled ? undefined : () => onPress(value)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        <Animated.View
          style={[
            styles.chip,
            { backgroundColor: color.bg, borderColor: color.border },
            animatedStyle,
            disabled && styles.chipDisabled,
          ]}
        >
          <Text style={styles.chipText}>{value}</Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

// ─── DropSlot: one of the two number bond slots ───
const DropSlot = ({ value, label, isWrong, isCorrect, onPress, disabled }) => {
  const slotScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: slotScale.value }],
  }));

  const tap = Gesture.Tap()
    .onBegin(() => {
      slotScale.value = withSpring(0.9, { damping: 8, stiffness: 400 });
    })
    .onEnd(() => {
      if (value !== null) {
        runOnJS(onPress)();
      }
    })
    .onFinalize(() => {
      slotScale.value = withSpring(1, { damping: 10, stiffness: 300 });
    })
    .enabled(!disabled);

  const bgColor = isCorrect
    ? 'rgba(0,110,42,0.10)'
    : isWrong
      ? 'rgba(186,26,26,0.08)'
      : value !== null
        ? Colors.primaryContainer
        : Colors.surfaceContainerLowest;

  const borderColor = isCorrect
    ? Colors.success
    : isWrong
      ? Colors.error
      : value !== null
        ? Colors.primary
        : Colors.outlineVariant;

  const borderStyle = value !== null || isCorrect || isWrong ? 'solid' : 'dashed';
  const borderBottomWidth = value !== null || isCorrect || isWrong ? 5 : 2;

  return (
    <GestureDetector gesture={tap}>
      <Animated.View style={[
        animatedStyle,
        styles.slot,
        { backgroundColor: bgColor, borderColor, borderStyle, borderBottomWidth },
      ]}>
        {value !== null ? (
          <Animated.View entering={ZoomIn.springify()}>
            <Text style={[
              styles.slotValue,
              isCorrect && { color: Colors.success },
              isWrong && { color: Colors.error },
            ]}>
              {value}
            </Text>
          </Animated.View>
        ) : (
          <Text style={styles.slotPlaceholder}>{label}</Text>
        )}
      </Animated.View>
    </GestureDetector>
  );
};

// ─── TactileFooterButton ───────────────────────────────────────────────────────
const TactileFooterButton = ({
  onPress,
  label,
  iconName,
  bgColor,
  borderColor,
  fullWidth = false,
  disabled = false,
}) => {
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
    translateY.value = withSpring(0, { damping: 15, stiffness: 300 });
    bottomWidth.value = withSpring(6, { damping: 15, stiffness: 300 });
  };

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={fullWidth ? { width: '100%' } : undefined}
    >
      <Animated.View
        style={[
          styles.tactileButton,
          fullWidth && styles.tactileButtonFull,
          { backgroundColor: bgColor, borderColor },
          animatedStyle,
          disabled && styles.tactileButtonDisabled,
        ]}
      >
        {iconName && <Ionicons name={iconName} size={18} color="#FFF" />}
        <Text style={styles.tactileButtonText}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
};

// ─── ComposerEngine ───
const ComposerEngine = ({ data, onResult }) => {
  const { target, chips = [], mode = 'decompose' } = data;

  const shuffledChips = useMemo(
    () => [...chips].sort(() => Math.random() - 0.5),
    [chips]
  );

  const [slotA, setSlotA] = useState(null);
  const [slotB, setSlotB] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [usedIndices, setUsedIndices] = useState([]);

  // Reset engine state when `data` changes (next question from Orchestrator)
  useEffect(() => {
    setSlotA(null);
    setSlotB(null);
    setAnswered(false);
    setIsWrong(false);
    setUsedIndices([]);
  }, [data]);

  // Idle pulsing animation on the target bubble
  const targetPulse = useSharedValue(1);
  useEffect(() => {
    targetPulse.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 1200 }),
        withTiming(1.0, { duration: 1200 })
      ),
      -1,
      true
    );
  }, [data]);

  const targetScale = useSharedValue(1);
  const targetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: answered ? targetScale.value : targetPulse.value }],
  }));

  const handleChipTap = useCallback((value, chipIndex) => {
    if (answered || isWrong) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (slotA === null) {
      setSlotA(value);
      setUsedIndices(prev => [...prev, chipIndex]);
    } else if (slotB === null) {
      setSlotB(value);
      setUsedIndices(prev => [...prev, chipIndex]);
    }
  }, [answered, isWrong, slotA, slotB]);

  const handleSlotATap = useCallback(() => {
    if (answered || isWrong) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (slotB !== null) {
      setSlotA(slotB);
      setSlotB(null);
      setUsedIndices(prev => prev.length > 1 ? [prev[1]] : []);
    } else {
      setSlotA(null);
      setUsedIndices([]);
    }
  }, [answered, isWrong, slotB]);

  const handleSlotBTap = useCallback(() => {
    if (answered || isWrong) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSlotB(null);
    setUsedIndices(prev => prev.slice(0, 1));
  }, [answered, isWrong]);

  const handleReset = useCallback(() => {
    if (answered || isWrong) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setSlotA(null);
    setSlotB(null);
    setUsedIndices([]);
  }, [answered, isWrong]);

  const handleCheckAnswer = useCallback(() => {
    if (slotA === null || slotB === null || answered) return;

    const isCorrect = slotA + slotB === target;

    if (isCorrect) {
      setAnswered(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      targetScale.value = withSequence(
        withSpring(1.15, { damping: 8, stiffness: 200 }),
        withSpring(1.0, { damping: 12, stiffness: 200 })
      );
      setTimeout(() => onResult(true, [slotA.toString(), slotB.toString()]), 600);
    } else {
      setIsWrong(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      onResult(false, [slotA.toString(), slotB.toString()]);

      setTimeout(() => {
        setSlotA(null);
        setSlotB(null);
        setUsedIndices([]);
        setIsWrong(false);
      }, 1200);
    }
  }, [slotA, slotB, answered, target, onResult]);

  const isReadyToCheck = slotA !== null && slotB !== null;

  const getInstruction = () => {
    if (answered) return '✅ Great job!';
    if (isWrong) return 'Not quite — try again!';
    if (isReadyToCheck) return 'Ready! Tap Check Answer.';
    if (slotA !== null) return 'Pick a second number.';
    return 'Tap a number chip below.';
  };

  return (
    <View style={styles.container}>
      {/* Target Number Bubble */}
      <Animated.View
        entering={FadeInDown.springify().delay(100)}
        style={[styles.targetBubble, targetStyle, answered && styles.targetBubbleCorrect]}
      >
        <Text style={styles.targetLabel}>
          {mode === 'compose' ? 'Make this number!' : 'Break this number!'}
        </Text>
        <Text style={[styles.targetNumber, answered && { color: Colors.success }]}>
          {target}
        </Text>
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

      {/* Number Bond Visual */}
      <Animated.View entering={FadeIn.delay(150)} style={styles.bondContainer}>
        {/* Connector lines */}
        <View style={styles.connectorRow}>
          <View style={styles.connectorLine} />
          <View style={styles.connectorLine} />
        </View>

        {/* Two Drop Slots */}
        <View style={styles.slotsRow}>
          <DropSlot
            value={slotA}
            label="?"
            isWrong={isWrong}
            isCorrect={answered}
            onPress={handleSlotATap}
            disabled={answered || isWrong}
          />

          <View style={styles.plusSign}>
            <Text style={styles.plusText}>+</Text>
          </View>

          <DropSlot
            value={slotB}
            label="?"
            isWrong={isWrong}
            isCorrect={answered}
            onPress={handleSlotBTap}
            disabled={answered || isWrong}
          />
        </View>
      </Animated.View>

      {/* Chip Tray */}
      <Animated.View entering={FadeInDown.springify().delay(200)} style={styles.chipTray}>
        <View style={styles.chipGrid}>
          {shuffledChips.map((value, i) => {
            const isUsed = usedIndices.includes(i);
            return (
              <NumberChip
                key={`chip-${i}`}
                value={value}
                index={i}
                color={CHIP_COLORS[i % CHIP_COLORS.length]}
                onPress={() => handleChipTap(value, i)}
                disabled={isUsed || answered || isWrong || isReadyToCheck}
              />
            );
          })}
        </View>
      </Animated.View>

      {/* Footer Actions — always rendered, disabled state controls interactivity */}
      <View style={styles.footer}>
        <View style={styles.secondaryActions}>
          <TactileFooterButton
            onPress={handleReset}
            label="Reset"
            iconName="refresh"
            bgColor={Colors.secondary}
            borderColor="#003d8f"
            disabled={usedIndices.length === 0 || isWrong || answered}
          />
        </View>
        <TactileFooterButton
          onPress={handleCheckAnswer}
          label="Check Answer"
          iconName="checkmark-circle"
          bgColor={Colors.success}
          borderColor="#1b5e20"
          fullWidth
          disabled={!isReadyToCheck || isWrong || answered}
        />
      </View>
    </View>
  );
};

const SLOT_SIZE = SCREEN_WIDTH * 0.22;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 14,
  },
  targetBubble: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 2,
    borderBottomWidth: 6,
    borderColor: Colors.primary,
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  targetBubbleCorrect: {
    backgroundColor: Colors.tertiaryContainer,
    borderColor: Colors.success,
  },
  targetLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: SCREEN_HEIGHT * 0.014,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  targetNumber: {
    fontFamily: 'Lexend-Black',
    fontSize: SCREEN_HEIGHT * 0.055,
    color: Colors.primary,
  },
  instructionText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: SCREEN_HEIGHT * 0.016,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
  },
  bondContainer: {
    alignItems: 'center',
    width: '100%',
    gap: 4,
  },
  connectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SCREEN_WIDTH * 0.18,
    height: 24,
  },
  connectorLine: {
    width: 3,
    height: 24,
    backgroundColor: Colors.outlineVariant,
    borderRadius: 2,
  },
  slotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  slot: {
    width: SLOT_SIZE,
    height: SLOT_SIZE,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotValue: {
    fontFamily: 'Lexend-Black',
    fontSize: SCREEN_HEIGHT * 0.04,
    color: Colors.primary,
  },
  slotPlaceholder: {
    fontFamily: 'Lexend-Bold',
    fontSize: SCREEN_HEIGHT * 0.03,
    color: Colors.outlineVariant,
  },
  plusSign: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.surfaceContainerLowest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
  },
  plusText: {
    fontFamily: 'Lexend-Black',
    fontSize: SCREEN_HEIGHT * 0.025,
    color: Colors.onSurfaceVariant,
  },
  chipTray: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.outlineVariant,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  chip: {
    minWidth: Math.max((SCREEN_WIDTH - 120) / 4, 44),
    height: SCREEN_HEIGHT * 0.065,
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  chipDisabled: {
    opacity: 0.3,
  },
  chipText: {
    fontFamily: 'Lexend-Black',
    fontSize: SCREEN_HEIGHT * 0.03,
    color: '#FFFFFF',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 4,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tactileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderBottomWidth: 6,
  },
  tactileButtonFull: {
    width: '100%',
    paddingVertical: 15,
    paddingHorizontal: 28,
    borderRadius: 20,
    minHeight: 56,
  },
  tactileButtonDisabled: {
    opacity: 0.4,
  },
  tactileButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});

export default ComposerEngine;
