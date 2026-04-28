import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

/**
 * MeanMedianEngine — "Number Workbench"
 *
 * A workspace-style engine that scaffolds the computation process for
 * Mean (average) and Median (middle value) problems.
 *
 * Layout Zones:
 *   A — Question prompt
 *   B — Data chips (the number set) + Computation workspace
 *   C — Scroll-strip answer selector (3 visible) + LOCK IN
 *
 * UX Philosophy: Instead of just presenting 4 MCQ buttons, the workspace
 * shows the student HOW to arrive at the answer — the sum for mean problems,
 * the sorted order for median problems — then lets them dial in the final value.
 *
 * Props (Orchestrator contract — DO NOT CHANGE):
 * @param {Object}   problem  — { answer, choices, metadata } from meanMedianGenerator
 * @param {Object}   theme    — Game theme from gameThemes.js
 * @param {Function} onAnswer — (isCorrect: boolean, userAnswer: string) => void
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const SPRING_CONFIG = { damping: 15, stiffness: 300 };

const ACCENT = {
  mean: '#0284C7',       // Sky blue for mean
  meanDark: '#0369A1',
  median: '#7C3AED',     // Violet for median
  medianDark: '#5B21B6',
  correct: '#4CAF50',
  wrong: '#F44336',
};

// ============================================================================
// MAIN ENGINE
// ============================================================================

export default function MeanMedianEngine({ problem, theme, onAnswer }) {
  if (!problem || !problem.metadata) return null;

  const { answer, metadata } = problem;
  const { displayQuestion, numbers, sum, count, sortedSequence, type, hint } = metadata;

  const isMean = type === 'mean';
  const accent = isMean ? ACCENT.mean : ACCENT.median;
  const accentDark = isMean ? ACCENT.meanDark : ACCENT.medianDark;

  // Derive scroll range from answer
  const rangeMin = Math.max(1, answer - 8);
  const rangeMax = answer + 8;

  // State
  const [currentValue, setCurrentValue] = useState(() => {
    let start = Math.round((rangeMin + rangeMax) / 2);
    if (start === answer) start = Math.min(start + 1, rangeMax);
    return start;
  });
  const [isLocked, setIsLocked] = useState(false);
  const [feedbackState, setFeedbackState] = useState(null);

  // Slot animation
  const slotScale = useSharedValue(1);
  const slotShakeX = useSharedValue(0);

  const slotAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: slotScale.value },
      { translateX: slotShakeX.value },
    ],
  }));

  // Lock button animation
  const lockBtnDepth = useSharedValue(4);
  const lockBtnTranslateY = useSharedValue(0);

  const lockBtnAnimatedStyle = useAnimatedStyle(() => ({
    borderBottomWidth: lockBtnDepth.value,
    transform: [{ translateY: lockBtnTranslateY.value }],
  }));

  // Pulse on value change
  React.useEffect(() => {
    if (!isLocked) {
      slotScale.value = withSequence(
        withTiming(1.06, { duration: 70, easing: Easing.out(Easing.quad) }),
        withSpring(1, SPRING_CONFIG)
      );
    }
  }, [currentValue]);

  // Arrow handlers
  const handleArrowLeft = useCallback(() => {
    if (isLocked) return;
    setCurrentValue(prev => {
      if (prev - 1 < rangeMin) return prev;
      Haptics.selectionAsync();
      return prev - 1;
    });
  }, [isLocked, rangeMin]);

  const handleArrowRight = useCallback(() => {
    if (isLocked) return;
    setCurrentValue(prev => {
      if (prev + 1 > rangeMax) return prev;
      Haptics.selectionAsync();
      return prev + 1;
    });
  }, [isLocked, rangeMax]);

  // Lock-In handler
  const handleLockIn = useCallback(() => {
    if (isLocked) return;
    setIsLocked(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const isCorrect = currentValue === answer;

    if (isCorrect) {
      setFeedbackState('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      slotScale.value = withSequence(
        withTiming(1.12, { duration: 100 }),
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

    setTimeout(() => {
      onAnswer(isCorrect, String(currentValue));
    }, 500);
  }, [isLocked, currentValue, answer, onAnswer]);

  // Scroll strip numbers
  const stripNumbers = [
    currentValue - 1 >= rangeMin ? currentValue - 1 : null,
    currentValue,
    currentValue + 1 <= rangeMax ? currentValue + 1 : null,
  ];

  // Feedback-aware colors
  const slotBorderColor = feedbackState === 'correct'
    ? ACCENT.correct
    : feedbackState === 'wrong'
      ? ACCENT.wrong
      : accent;
  const slotBgColor = feedbackState === 'correct'
    ? 'rgba(76, 175, 80, 0.15)'
    : feedbackState === 'wrong'
      ? 'rgba(244, 67, 54, 0.15)'
      : `rgba(${isMean ? '2, 132, 199' : '124, 58, 237'}, 0.08)`;

  // Median: find the middle index
  const medianMiddleIndex = sortedSequence ? Math.floor(sortedSequence.length / 2) : -1;

  return (
    <View style={styles.container}>

      {/* ═══════ ZONE A: Question Prompt ═══════ */}
      <View style={styles.zoneA}>
        <View style={[styles.typeBadge, { backgroundColor: `${accent}18`, borderColor: accent }]}>
          <Text style={[styles.typeBadgeText, {
            fontFamily: theme.fontFamily?.accent || 'Lexend-Bold',
            color: accent,
          }]}>
            {isMean ? 'MEAN' : 'MEDIAN'}
          </Text>
        </View>
        <Text style={[styles.promptText, {
          fontFamily: theme.fontFamily?.body || 'PlusJakartaSans-SemiBold',
          color: Colors.onSurfaceVariant,
        }]}>
          {displayQuestion}
        </Text>
      </View>

      {/* ═══════ ZONE B: Data Chips + Workspace ═══════ */}
      <View style={styles.zoneB}>
        {/* Data chips */}
        <View style={styles.chipsRow}>
          {numbers.map((num, i) => (
            <View key={`chip-${i}`} style={[styles.chip, { borderColor: Colors.outlineVariant }]}>
              <Text style={[styles.chipText, {
                fontFamily: theme.fontFamily?.accent || 'Lexend-Bold',
                color: Colors.onSurface,
              }]}>
                {num}
              </Text>
            </View>
          ))}
        </View>

        {/* Computation workspace */}
        <View style={[styles.workspaceCard, { borderColor: accent }]}>
          {isMean ? (
            // ── Mean workspace: sum ÷ count ──
            <View style={styles.workspaceContent}>
              <View style={styles.workspaceRow}>
                <Text style={[styles.workspaceLabel, {
                  fontFamily: theme.fontFamily?.body || 'PlusJakartaSans-Medium',
                  color: Colors.onSurfaceVariant,
                }]}>
                  Sum
                </Text>
                <Text style={[styles.workspaceValue, {
                  fontFamily: theme.fontFamily?.title || 'Lexend-Black',
                  color: accent,
                }]}>
                  {numbers.join(' + ')} = {sum}
                </Text>
              </View>
              <View style={styles.workspaceDivider} />
              <View style={styles.workspaceRow}>
                <Text style={[styles.workspaceLabel, {
                  fontFamily: theme.fontFamily?.body || 'PlusJakartaSans-Medium',
                  color: Colors.onSurfaceVariant,
                }]}>
                  Mean
                </Text>
                <Text style={[styles.workspaceFormula, {
                  fontFamily: theme.fontFamily?.accent || 'Lexend-Bold',
                  color: Colors.onSurface,
                }]}>
                  {sum} ÷ {count} = <Text style={{ color: accent }}>?</Text>
                </Text>
              </View>
            </View>
          ) : (
            // ── Median workspace: sorted order ──
            <View style={styles.workspaceContent}>
              <Text style={[styles.workspaceLabel, {
                fontFamily: theme.fontFamily?.body || 'PlusJakartaSans-Medium',
                color: Colors.onSurfaceVariant,
                marginBottom: 10,
              }]}>
                Sorted Order
              </Text>
              <View style={styles.sortedRow}>
                {sortedSequence.map((num, i) => {
                  const isMiddle = i === medianMiddleIndex;
                  return (
                    <View
                      key={`sorted-${i}`}
                      style={[
                        styles.sortedChip,
                        isMiddle && styles.sortedChipMiddle,
                        isMiddle && { borderColor: accent, backgroundColor: `${accent}15` },
                      ]}
                    >
                      <Text style={[
                        styles.sortedChipText,
                        isMiddle && styles.sortedChipTextMiddle,
                        {
                          fontFamily: isMiddle
                            ? (theme.fontFamily?.title || 'Lexend-Black')
                            : (theme.fontFamily?.accent || 'Lexend-Bold'),
                          color: isMiddle ? accent : Colors.onSurface,
                        }
                      ]}>
                        {num}
                      </Text>
                      {isMiddle && (
                        <Text style={[styles.middleLabel, {
                          fontFamily: theme.fontFamily?.body || 'PlusJakartaSans-Medium',
                          color: accent,
                        }]}>
                          middle
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}
        </View>
      </View>

      {/* ═══════ ZONE C: Scroll Strip + Lock-In ═══════ */}
      <View style={styles.zoneC}>
        {/* Answer label */}
        <Text style={[styles.answerLabel, {
          fontFamily: theme.fontFamily?.body || 'PlusJakartaSans-Medium',
          color: Colors.onSurfaceVariant,
        }]}>
          {isMean ? 'What is the mean?' : 'What is the median?'}
        </Text>

        {/* Scroll strip */}
        <View style={styles.stripRow}>
          <TactileArrowButton
            direction="left"
            onPress={handleArrowLeft}
            disabled={isLocked || currentValue <= rangeMin}
            theme={theme}
            accent={accent}
          />

          <View style={styles.numberStrip}>
            {stripNumbers.map((num, i) => {
              const isCenter = i === 1;
              if (num === null) {
                return <View key={`empty-${i}`} style={styles.stripSlotEmpty} />;
              }
              return (
                <Animated.View
                  key={`strip-${i}`}
                  style={[
                    styles.stripSlot,
                    isCenter && styles.stripSlotCenter,
                    isCenter && { borderColor: slotBorderColor, backgroundColor: slotBgColor },
                    isCenter && slotAnimatedStyle,
                  ]}
                >
                  <Text style={[
                    styles.stripNumber,
                    isCenter && styles.stripNumberCenter,
                    {
                      fontFamily: isCenter
                        ? (theme.fontFamily?.title || 'Lexend-Black')
                        : (theme.fontFamily?.accent || 'Lexend-Bold'),
                      color: isCenter
                        ? (feedbackState === 'correct' ? ACCENT.correct
                          : feedbackState === 'wrong' ? ACCENT.wrong
                          : accentDark)
                        : Colors.onSurfaceVariant,
                    }
                  ]}>
                    {num}
                  </Text>
                </Animated.View>
              );
            })}
          </View>

          <TactileArrowButton
            direction="right"
            onPress={handleArrowRight}
            disabled={isLocked || currentValue >= rangeMax}
            theme={theme}
            accent={accent}
          />
        </View>

        {/* Lock-In button */}
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
              backgroundColor: isLocked ? Colors.surfaceContainerHigh : accent,
              borderColor: isLocked ? Colors.outlineVariant : accentDark,
            }
          ]}>
            <Text style={[styles.lockBtnText, {
              fontFamily: theme.fontFamily?.accent || 'Lexend-Bold',
              color: isLocked ? Colors.onSurfaceVariant : '#FFFFFF',
            }]}>
              {isLocked ? 'LOCKED' : `LOCK IN   ${currentValue}`}
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

function TactileArrowButton({ direction, onPress, disabled, theme, accent }) {
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
          backgroundColor: disabled ? Colors.surfaceContainerHigh : Colors.surfaceContainerLowest,
          borderColor: disabled ? Colors.outlineVariant : Colors.onSurfaceVariant,
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },

  // ── Zone A: Question ──
  zoneA: {
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  typeBadgeText: {
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  promptText: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
  },

  // ── Zone B: Data + Workspace ──
  zoneB: {
    flex: 1,
    justifyContent: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderBottomWidth: 4,
    backgroundColor: Colors.surfaceContainerLowest,
  },
  chipText: {
    fontSize: 20,
  },

  // Workspace card
  workspaceCard: {
    borderWidth: 2,
    borderBottomWidth: 5,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  workspaceContent: {},
  workspaceRow: {
    marginBottom: 4,
  },
  workspaceLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  workspaceValue: {
    fontSize: 16,
    lineHeight: 22,
  },
  workspaceDivider: {
    height: 1,
    backgroundColor: Colors.outlineVariant,
    marginVertical: 10,
  },
  workspaceFormula: {
    fontSize: 20,
  },

  // Sorted chips (median)
  sortedRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  sortedChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
  },
  sortedChipMiddle: {
    borderWidth: 2.5,
    borderBottomWidth: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sortedChipText: {
    fontSize: 18,
  },
  sortedChipTextMiddle: {
    fontSize: 22,
  },
  middleLabel: {
    fontSize: 9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 2,
  },

  // ── Zone C: Scroll Strip + Lock-In ──
  zoneC: {
    alignItems: 'center',
    paddingTop: 8,
  },
  answerLabel: {
    fontSize: 13,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  stripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 14,
  },
  numberStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stripSlot: {
    width: 52,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  stripSlotCenter: {
    width: 64,
    height: 64,
    borderWidth: 2.5,
    borderBottomWidth: 5,
  },
  stripSlotEmpty: {
    width: 52,
    height: 52,
  },
  stripNumber: {
    fontSize: 20,
  },
  stripNumberCenter: {
    fontSize: 28,
  },

  // Arrow buttons
  arrowWrapper: {
    width: 48,
    height: 48,
  },
  arrowBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 26,
    marginTop: -2,
  },

  // Lock-In
  lockBtnWrapper: {
    width: '100%',
  },
  lockBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBtnText: {
    fontSize: 17,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
