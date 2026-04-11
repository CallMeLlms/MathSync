import { View, Text, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useMemo, useCallback } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  ZoomIn,
  FadeIn,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CHIP_COLORS = [
  { bg: '#FF7043', border: '#E64A19' },
  { bg: '#42A5F5', border: '#1565C0' },
  { bg: '#66BB6A', border: '#2E7D32' },
  { bg: '#AB47BC', border: '#7B1FA2' },
  { bg: '#FFA726', border: '#EF6C00' },
  { bg: '#26C6DA', border: '#00838F' },
];

// ─── NumberChip: a tappable number in the chip tray ───
const NumberChip = ({ value, color, onPress, disabled }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.88, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
    onPress(value);
  };

  return (
    <Animated.View entering={ZoomIn.springify()} style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.chip,
          { backgroundColor: color.bg, borderColor: color.border },
          disabled && { opacity: 0.35 },
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.chipText}>{value}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── DropSlot: one of the two number bond slots ───
const DropSlot = ({ value, label, isWrong, isCorrect, onPress, disabled }) => {
  const slotScale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: slotScale.value }],
  }));

  const handlePress = () => {
    if (value === null || disabled) return;
    slotScale.value = withSequence(
      withSpring(0.9, { damping: 8, stiffness: 400 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
    onPress();
  };

  const bgColor = isCorrect
    ? 'rgba(76,175,80,0.12)'
    : isWrong
      ? 'rgba(244,67,54,0.08)'
      : value !== null
        ? '#FFF8E1'
        : '#FAFAFA';

  const borderColor = isCorrect
    ? '#4CAF50'
    : isWrong
      ? '#F44336'
      : value !== null
        ? '#FFB74D'
        : '#E0E0E0';

  const borderStyle = value !== null || isCorrect || isWrong ? 'solid' : 'dashed';

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[styles.slot, { backgroundColor: bgColor, borderColor, borderStyle }]}
        onPress={handlePress}
        disabled={value === null || disabled}
        activeOpacity={0.7}
      >
        {value !== null ? (
          <Animated.View entering={ZoomIn.springify()}>
            <Text style={[
              styles.slotValue,
              isCorrect && { color: '#2E7D32' },
              isWrong && { color: '#D32F2F' },
            ]}>
              {value}
            </Text>
          </Animated.View>
        ) : (
          <Text style={styles.slotPlaceholder}>{label}</Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ─── ComposerEngine ───
const ComposerEngine = ({ data, onResult, onComplete }) => {
  const { target, chips = [], mode = 'decompose' } = data;

  const shuffledChips = useMemo(
    () => [...chips].sort(() => Math.random() - 0.5),
    [chips]
  );

  const [slotA, setSlotA] = useState(null);
  const [slotB, setSlotB] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  // Track which chip indices are used (allows duplicate values in chips)
  const [usedIndices, setUsedIndices] = useState([]);

  const targetScale = useSharedValue(1);
  const targetStyle = useAnimatedStyle(() => ({
    transform: [{ scale: targetScale.value }],
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

    // If slot B has a value, shift it to A
    if (slotB !== null) {
      setSlotA(slotB);
      setSlotB(null);
      // Remove last used index (slotA's chip goes back)
      setUsedIndices(prev => prev.slice(0, 1).length === 0 ? [] : [prev[1]]);
    } else {
      setSlotA(null);
      setUsedIndices([]);
    }
  }, [answered, isWrong, slotB]);

  const handleSlotBTap = useCallback(() => {
    if (answered || isWrong) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSlotB(null);
    // Remove the second used index
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
      setTimeout(() => onResult(true, [slotA.toString(), slotB.toString()]), 800);
      setTimeout(() => onComplete(), 1200);
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
  }, [slotA, slotB, answered, target, onResult, onComplete]);

  const isReadyToCheck = slotA !== null && slotB !== null;

  // Equation label based on mode
  const equationDisplay = mode === 'compose'
    ? `___ + ___ = ${target}`
    : `${target} = ___ + ___`;

  return (
    <View style={styles.container}>
      {/* Target Number Bubble */}
      <Animated.View style={[styles.targetBubble, targetStyle, answered && styles.targetBubbleCorrect]}>
        <Text style={styles.targetLabel}>
          {mode === 'compose' ? 'Make this number!' : 'Break this number!'}
        </Text>
        <Text style={[styles.targetNumber, answered && { color: '#2E7D32' }]}>
          {target}
        </Text>
      </Animated.View>

      {/* Number Bond Visual */}
      <View style={styles.bondContainer}>
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

        {/* Equation Display */}
        <Text style={[styles.equationText, answered && { color: '#2E7D32' }]}>
          {isReadyToCheck
            ? `${mode === 'compose' ? `${slotA} + ${slotB} = ${target}` : `${target} = ${slotA} + ${slotB}`}`
            : equationDisplay
          }
        </Text>
      </View>

      {/* Chip Tray */}
      <View style={styles.chipTray}>
        <View style={styles.chipGrid}>
          {shuffledChips.map((value, i) => {
            const isUsed = usedIndices.includes(i);
            return (
              <NumberChip
                key={`chip-${i}`}
                value={value}
                color={CHIP_COLORS[i % CHIP_COLORS.length]}
                onPress={() => handleChipTap(value, i)}
                disabled={isUsed || answered || isWrong || isReadyToCheck}
              />
            );
          })}
        </View>
      </View>

      {/* Footer Actions */}
      {!answered && (
        <Animated.View entering={FadeIn.duration(400)} style={styles.footer}>
          {usedIndices.length > 0 && !isWrong && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          )}

          {isReadyToCheck && !isWrong && (
            <Animated.View entering={ZoomIn.springify()}>
              <TouchableOpacity
                style={styles.checkButton}
                onPress={handleCheckAnswer}
                activeOpacity={0.8}
              >
                <Text style={styles.checkButtonText}>Check Answer</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const SLOT_SIZE = SCREEN_WIDTH * 0.22;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 12,
    gap: 14,
  },
  targetBubble: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLowest,
    borderWidth: 3,
    borderColor: '#FFB74D',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
  },
  targetBubbleCorrect: {
    backgroundColor: Colors.tertiaryContainer,
    borderColor: Colors.success,
  },
  targetLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: SCREEN_HEIGHT * 0.015,
    color: Colors.onSurfaceVariant,
    marginBottom: 4,
  },
  targetNumber: {
    fontFamily: 'Lexend-Black',
    fontSize: SCREEN_HEIGHT * 0.055,
    color: Colors.primary,
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
    borderRadius: 20,
    borderWidth: 3,
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
    width: 36,
    height: 36,
    borderRadius: 18,
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
  equationText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: SCREEN_HEIGHT * 0.02,
    color: Colors.onSurfaceVariant,
    marginTop: 8,
  },
  chipTray: {
    width: '100%',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
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
    minWidth: (SCREEN_WIDTH - 120) / 4,
    height: SCREEN_HEIGHT * 0.065,
    borderRadius: 16,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  chipText: {
    fontFamily: 'Lexend-Black',
    fontSize: SCREEN_HEIGHT * 0.03,
    color: '#FFFFFF',
  },
  footer: {
    marginTop: 4,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.error,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#B71C1C',
    gap: 8,
  },
  resetButtonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    color: '#FFFFFF',
    fontSize: SCREEN_HEIGHT * 0.018,
  },
  checkButton: {
    backgroundColor: Colors.success,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  checkButtonText: {
    fontFamily: 'Lexend-Black',
    color: '#FFF',
    fontSize: SCREEN_HEIGHT * 0.02,
  },
});

export default ComposerEngine;
