import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

/**
 * AlgebraEngine — "Variable Isolation Slider"
 *
 * A premium algebra-solving engine that replaces the generic MCQ grid with
 * a scroll-strip + live-preview interaction. The student "dials in" the
 * answer value and locks it into the equation's variable slot.
 *
 * Layout Zones:
 *   A — Structured equation display with glowing [?] variable slot
 *   B — Horizontal number strip with ← → tactile arrows (3 visible)
 *   C — Full-width "LOCK IN" action bar
 *
 * Props (Orchestrator contract — DO NOT CHANGE):
 * @param {Object}   problem  — { answer, choices, metadata } from algebraGenerator
 * @param {Object}   theme    — Game theme from gameThemes.js
 * @param {Function} onAnswer — (isCorrect: boolean, userAnswer: any) => void
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const SPRING_CONFIG = { damping: 15, stiffness: 300 };
const SLOT_COLORS = {
  idle: '#BA68C8',
  preview: '#9C27B0',
  correct: '#4CAF50',
  wrong: '#F44336',
};

// ============================================================================
// MAIN ENGINE
// ============================================================================

export default function AlgebraEngine({ problem, theme, onAnswer }) {
  if (!problem || !problem.metadata) return null;

  const { metadata, answer } = problem;
  const { equationParts, scrollRange, displayQuestion, variable } = metadata;

  // Derive range boundaries
  const rangeMin = scrollRange?.min ?? 1;
  const rangeMax = scrollRange?.max ?? 20;

  // State
  const [currentValue, setCurrentValue] = useState(() => {
    // Start at a random position that is NOT the answer
    let start = Math.round((rangeMin + rangeMax) / 2);
    if (start === answer) {
      start = Math.min(start + 1, rangeMax);
    }
    return start;
  });
  const [isLocked, setIsLocked] = useState(false);
  const [feedbackState, setFeedbackState] = useState(null); // 'correct' | 'wrong' | null

  // Shared values for animations
  const slotScale = useSharedValue(1);
  const slotBgOpacity = useSharedValue(0);
  const slotShakeX = useSharedValue(0);
  const lockBtnDepth = useSharedValue(4);
  const lockBtnTranslateY = useSharedValue(0);

  // ── Slot animated style ──
  const slotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: slotScale.value },
      { translateX: slotShakeX.value },
    ],
  }));

  // ── Lock button animated style ──
  const lockBtnAnimatedStyle = useAnimatedStyle(() => ({
    borderBottomWidth: lockBtnDepth.value,
    transform: [{ translateY: lockBtnTranslateY.value }],
  }));

  // ── Pulse slot on value change ──
  useEffect(() => {
    if (!isLocked) {
      slotScale.value = withSequence(
        withTiming(1.08, { duration: 80, easing: Easing.out(Easing.quad) }),
        withSpring(1, SPRING_CONFIG)
      );
    }
  }, [currentValue]);

  // ── Arrow handlers ──
  const handleArrowLeft = useCallback(() => {
    if (isLocked) return;
    setCurrentValue(prev => {
      const next = prev - 1;
      if (next < rangeMin) return prev;
      Haptics.selectionAsync();
      return next;
    });
  }, [isLocked, rangeMin]);

  const handleArrowRight = useCallback(() => {
    if (isLocked) return;
    setCurrentValue(prev => {
      const next = prev + 1;
      if (next > rangeMax) return prev;
      Haptics.selectionAsync();
      return next;
    });
  }, [isLocked, rangeMax]);

  // ── Lock-In handler ──
  const handleLockIn = useCallback(() => {
    if (isLocked) return;
    setIsLocked(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const isCorrect = currentValue === answer;

    if (isCorrect) {
      setFeedbackState('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      slotScale.value = withSequence(
        withTiming(1.15, { duration: 120 }),
        withSpring(1, SPRING_CONFIG)
      );
    } else {
      setFeedbackState('wrong');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      slotShakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }

    // Delay to let animation register, then call Orchestrator
    setTimeout(() => {
      onAnswer(isCorrect, String(currentValue));
    }, 500);
  }, [isLocked, currentValue, answer, onAnswer]);

  // ── Compute visible strip numbers ──
  const stripNumbers = [
    currentValue - 1 >= rangeMin ? currentValue - 1 : null,
    currentValue,
    currentValue + 1 <= rangeMax ? currentValue + 1 : null,
  ];

  // ── Determine slot display ──
  const slotDisplayValue = isLocked ? currentValue : currentValue;
  const slotBorderColor = feedbackState === 'correct'
    ? SLOT_COLORS.correct
    : feedbackState === 'wrong'
      ? SLOT_COLORS.wrong
      : SLOT_COLORS.idle;
  const slotBgColor = feedbackState === 'correct'
    ? 'rgba(76, 175, 80, 0.15)'
    : feedbackState === 'wrong'
      ? 'rgba(244, 67, 54, 0.15)'
      : 'rgba(186, 104, 200, 0.08)';

  return (
    <View style={styles.container}>

      {/* ═══════ ZONE A: Equation Display ═══════ */}
      <View style={styles.zoneA}>
        <Text style={[styles.promptText, {
          fontFamily: theme.fontFamily?.body || 'PlusJakartaSans-SemiBold',
          color: Colors.onSurfaceVariant,
        }]}>
          {displayQuestion}
        </Text>

        <View style={[styles.equationBoard, { borderColor: Colors.outlineVariant }]}>
          <View style={styles.equationRow}>
            {/* LEFT side tokens */}
            {equationParts?.left?.map((token, i) => {
              if (token === '?') {
                return (
                  <Animated.View
                    key={`left-${i}`}
                    style={[
                      styles.variableSlot,
                      { borderColor: slotBorderColor, backgroundColor: slotBgColor },
                      slotAnimatedStyle,
                    ]}
                  >
                    <Text style={[styles.slotValueText, {
                      fontFamily: theme.fontFamily?.title || 'Lexend-Black',
                      color: feedbackState === 'correct'
                        ? SLOT_COLORS.correct
                        : feedbackState === 'wrong'
                          ? SLOT_COLORS.wrong
                          : SLOT_COLORS.preview,
                    }]}>
                      {slotDisplayValue}
                    </Text>
                  </Animated.View>
                );
              }
              return (
                <Text key={`left-${i}`} style={[styles.equationToken, {
                  fontFamily: theme.fontFamily?.title || 'Lexend-Black',
                  color: Colors.onSurface,
                }]}>
                  {token}
                </Text>
              );
            })}

            {/* Equals sign */}
            <Text style={[styles.equalsSign, {
              fontFamily: theme.fontFamily?.title || 'Lexend-Black',
              color: Colors.onSurfaceVariant,
            }]}>
              =
            </Text>

            {/* RIGHT side tokens */}
            {equationParts?.right?.map((token, i) => (
              <Text key={`right-${i}`} style={[styles.equationToken, {
                fontFamily: theme.fontFamily?.title || 'Lexend-Black',
                color: Colors.onSurface,
              }]}>
                {token}
              </Text>
            ))}
          </View>
        </View>
      </View>

      {/* ═══════ ZONE B: Number Scroll Strip ═══════ */}
      <View style={styles.zoneB}>
        <Text style={[styles.zoneBLabel, {
          fontFamily: theme.fontFamily?.body || 'PlusJakartaSans-Medium',
          color: Colors.onSurfaceVariant,
        }]}>
          Choose a value for {variable}
        </Text>

        <View style={styles.stripRow}>
          {/* Left Arrow */}
          <TactileArrowButton
            direction="left"
            onPress={handleArrowLeft}
            disabled={isLocked || currentValue <= rangeMin}
            theme={theme}
          />

          {/* Number Strip */}
          <View style={styles.numberStrip}>
            {stripNumbers.map((num, i) => {
              const isCenter = i === 1;
              if (num === null) {
                return <View key={`empty-${i}`} style={styles.stripSlotEmpty} />;
              }
              return (
                <View
                  key={`strip-${num}`}
                  style={[
                    styles.stripSlot,
                    isCenter && styles.stripSlotCenter,
                    isCenter && { borderColor: SLOT_COLORS.idle },
                  ]}
                >
                  <Text style={[
                    styles.stripNumber,
                    isCenter && styles.stripNumberCenter,
                    {
                      fontFamily: isCenter
                        ? (theme.fontFamily?.title || 'Lexend-Black')
                        : (theme.fontFamily?.accent || 'Lexend-Bold'),
                      color: isCenter ? SLOT_COLORS.preview : Colors.onSurfaceVariant,
                    }
                  ]}>
                    {num}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Right Arrow */}
          <TactileArrowButton
            direction="right"
            onPress={handleArrowRight}
            disabled={isLocked || currentValue >= rangeMax}
            theme={theme}
          />
        </View>
      </View>

      {/* ═══════ ZONE C: Lock-In Action Bar ═══════ */}
      <View style={styles.zoneC}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => {
            if (isLocked) return;
            lockBtnDepth.value = withSpring(1, SPRING_CONFIG);
            lockBtnTranslateY.value = withSpring(3, SPRING_CONFIG);
          }}
          onPressOut={() => {
            lockBtnDepth.value = withSpring(4, SPRING_CONFIG);
            lockBtnTranslateY.value = withSpring(0, SPRING_CONFIG);
          }}
          onPress={handleLockIn}
          disabled={isLocked}
          style={styles.lockBtnWrapper}
        >
          <Animated.View style={[
            styles.lockBtn,
            lockBtnAnimatedStyle,
            {
              backgroundColor: isLocked
                ? Colors.surfaceContainerHigh
                : SLOT_COLORS.idle,
              borderColor: isLocked
                ? Colors.outlineVariant
                : '#6A1B9A',
            }
          ]}>
            <Text style={[styles.lockBtnText, {
              fontFamily: theme.fontFamily?.accent || 'Lexend-Bold',
              color: isLocked ? Colors.onSurfaceVariant : '#FFFFFF',
            }]}>
              {isLocked ? 'LOCKED' : `LOCK IN   ${variable} = ${currentValue}`}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ============================================================================
// TACTILE ARROW BUTTON (Internal Component)
// ============================================================================

function TactileArrowButton({ direction, onPress, disabled, theme }) {
  const depth = useSharedValue(6);
  const translateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    borderBottomWidth: depth.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handlePressIn = () => {
    if (disabled) return;
    depth.value = withSpring(2, SPRING_CONFIG);
    translateY.value = withSpring(4, SPRING_CONFIG);
  };

  const handlePressOut = () => {
    depth.value = withSpring(6, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
  };

  const arrowChar = direction === 'left' ? '‹' : '›';

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={styles.arrowWrapper}
    >
      <Animated.View style={[
        styles.arrowBtn,
        animatedStyle,
        {
          backgroundColor: disabled
            ? Colors.surfaceContainerHigh
            : Colors.surfaceContainerLowest,
          borderColor: disabled
            ? Colors.outlineVariant
            : Colors.onSurfaceVariant,
          opacity: disabled ? 0.4 : 1,
        }
      ]}>
        <Text style={[styles.arrowText, {
          fontFamily: theme.fontFamily?.title || 'Lexend-Black',
          color: disabled ? Colors.onSurfaceVariant : Colors.onSurface,
        }]}>
          {arrowChar}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },

  // ── Zone A: Equation Display ──
  zoneA: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  promptText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  equationBoard: {
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  equationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  equationToken: {
    fontSize: 40,
    letterSpacing: 2,
  },
  equalsSign: {
    fontSize: 36,
    marginHorizontal: 12,
  },
  variableSlot: {
    minWidth: 64,
    minHeight: 64,
    borderRadius: 14,
    borderWidth: 3,
    borderBottomWidth: 6,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  slotValueText: {
    fontSize: 38,
  },

  // ── Zone B: Scroll Strip ──
  zoneB: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  zoneBLabel: {
    fontSize: 14,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  stripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  numberStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stripSlot: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  stripSlotCenter: {
    width: 68,
    height: 68,
    borderWidth: 2.5,
    borderBottomWidth: 5,
    backgroundColor: 'rgba(186, 104, 200, 0.08)',
  },
  stripSlotEmpty: {
    width: 56,
    height: 56,
  },
  stripNumber: {
    fontSize: 22,
  },
  stripNumberCenter: {
    fontSize: 30,
  },

  // ── Arrow Buttons ──
  arrowWrapper: {
    width: 52,
    height: 52,
  },
  arrowBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 28,
    marginTop: -2,
  },

  // ── Zone C: Lock-In ──
  zoneC: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  lockBtnWrapper: {
    width: '100%',
  },
  lockBtn: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBtnText: {
    fontSize: 18,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
